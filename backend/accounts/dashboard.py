from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.exceptions import ImproperlyConfigured, ValidationError
from django.core.validators import validate_email
from django.db import connection
from django.db.models import Count
from django.http import Http404
from django.shortcuts import get_object_or_404
from django.utils import timezone
from requests import RequestException
from rest_framework import serializers, status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from applications.models import Application
from awards.models import AwardProgramme, AwardsInterest
from clubs.models import ClubEnquiry
from contact.models import ContactSubmission
from events.models import Event, EventRegistration, EventbriteAttendeeSnapshot
from media_library.models import MediaAsset
from memberships.models import MembershipGrade
from newsletter.models import NewsletterSignup
from ipc_backend.validators import clean_text

from .graph_mail import GraphMailError, send_enquiry_reply_email


User = get_user_model()
CACHE_KEY = "ipc:admin-dashboard:v2"
CACHE_SECONDS = 30


def _iso(value):
    return value.isoformat() if value else None


def _table(model):
    return connection.ops.quote_name(model._meta.db_table)


def _dashboard_counts():
    sql = f"""
        SELECT
          (SELECT COUNT(*) FROM {_table(User)}),
          (SELECT COUNT(*) FROM {_table(User)} WHERE is_active = %s),
          (SELECT COUNT(*) FROM {_table(Application)}),
          (SELECT COUNT(*) FROM {_table(Application)} WHERE status IN (%s, %s)),
          (SELECT COUNT(*) FROM {_table(ContactSubmission)}),
          (SELECT COUNT(*) FROM {_table(ContactSubmission)} WHERE status IN (%s, %s)),
          (SELECT COUNT(*) FROM {_table(ClubEnquiry)}),
          (SELECT COUNT(*) FROM {_table(ClubEnquiry)} WHERE status = %s),
          (SELECT COUNT(*) FROM {_table(AwardsInterest)}),
          (SELECT COUNT(*) FROM {_table(AwardsInterest)} WHERE status = %s),
          (SELECT COUNT(*) FROM {_table(EventRegistration)}),
          (SELECT COUNT(*) FROM {_table(Event)} WHERE is_published = %s AND is_hidden_on_site = %s),
          (SELECT COUNT(*) FROM {_table(NewsletterSignup)} WHERE is_active = %s),
          (SELECT COUNT(*) FROM {_table(MembershipGrade)} WHERE is_active = %s),
          (SELECT COUNT(*) FROM {_table(AwardProgramme)} WHERE is_active = %s),
          (SELECT COUNT(*) FROM {_table(MediaAsset)})
    """
    params = [
        True, Application.Status.SUBMITTED, Application.Status.UNDER_REVIEW,
        ContactSubmission.Status.NEW, ContactSubmission.Status.IN_PROGRESS,
        ClubEnquiry.Status.NEW, AwardsInterest.Status.NEW, True, False, True, True, True,
    ]
    keys = [
        "users", "active_users", "applications", "applications_pending",
        "contact_submissions", "contact_open", "club_enquiries", "club_new",
        "award_interests", "award_new", "event_registrations", "published_events",
        "newsletter_subscribers", "membership_grades", "award_programmes", "media_assets",
    ]
    with connection.cursor() as cursor:
        cursor.execute(sql, params)
        counts = dict(zip(keys, cursor.fetchone()))

    # Eventbrite attendees are stored as a normalized snapshot so the overview
    # remains fast and never blocks on a live third-party API request.
    eventbrite_snapshot = (
        EventbriteAttendeeSnapshot.objects.order_by("-synced_at")
        .values("payload", "total_count")
        .first()
    )
    if eventbrite_snapshot:
        eventbrite_payload = eventbrite_snapshot["payload"]
        snapshot_count = eventbrite_snapshot["total_count"]
        counts["event_registrations"] += max(
            snapshot_count,
            len(eventbrite_payload) if isinstance(eventbrite_payload, list) else 0,
        )
    return counts


def _status_counts():
    sql = f"""
        SELECT %s AS source, status, COUNT(*) FROM {_table(Application)} GROUP BY status
        UNION ALL SELECT %s, status, COUNT(*) FROM {_table(ContactSubmission)} GROUP BY status
        UNION ALL SELECT %s, status, COUNT(*) FROM {_table(ClubEnquiry)} GROUP BY status
        UNION ALL SELECT %s, status, COUNT(*) FROM {_table(AwardsInterest)} GROUP BY status
    """
    application_counts = {value: 0 for value, _label in Application.Status.choices}
    enquiry_counts = {
        "contact": {value: 0 for value, _label in ContactSubmission.Status.choices},
        "clubs": {value: 0 for value, _label in ClubEnquiry.Status.choices},
        "awards": {value: 0 for value, _label in AwardsInterest.Status.choices},
    }
    with connection.cursor() as cursor:
        cursor.execute(sql, ["applications", "contact", "clubs", "awards"])
        for source, status, total in cursor.fetchall():
            if source == "applications":
                application_counts[status] = total
            else:
                enquiry_counts[source][status] = total
    return application_counts, enquiry_counts


def _enquiries(limit=None):
    sql = f"""
        SELECT CAST(id AS TEXT), %s AS source, name, email, category AS subject, status, created_at
        FROM {_table(ContactSubmission)}
        UNION ALL
        SELECT CAST(id AS TEXT), %s, COALESCE(NULLIF(club_name, ''), %s), email,
               COALESCE(NULLIF(club_name, ''), %s), status, created_at
        FROM {_table(ClubEnquiry)}
        UNION ALL
        SELECT CAST(interest.id AS TEXT), %s, interest.name, interest.email,
               COALESCE(programme.title, interest.interest_type), interest.status, interest.created_at
        FROM {_table(AwardsInterest)} interest
        LEFT JOIN {_table(AwardProgramme)} programme ON programme.id = interest.programme_id
        ORDER BY created_at DESC
    """
    params = ["contact", "club", "Club enquiry", "General clubs enquiry", "award"]
    if limit is not None:
        sql += " LIMIT %s"
        params.append(limit)
    with connection.cursor() as cursor:
        cursor.execute(sql, params)
        return [{
            "id": row[0], "type": row[1], "name": row[2], "email": row[3],
            "subject": row[4], "status": row[5], "created_at": _iso(row[6]),
        } for row in cursor.fetchall()]


def _recent_enquiries():
    return _enquiries(limit=10)


def _build_dashboard():
    applications = Application.objects.select_related("membership_grade", "approved_user")
    application_statuses, enquiry_statuses = _status_counts()

    recent_applications = [{
        "id": item.pk, "reference": item.application_reference,
        "name": f"{item.first_name} {item.last_name}".strip(), "email": item.email,
        "grade": item.membership_grade.code, "status": item.status,
        "approved_user_email": item.approved_user.email if item.approved_user else None,
        "submitted_at": _iso(item.submitted_at),
    } for item in applications.order_by("-submitted_at")[:8]]

    recent_registrations = [{
        "id": item.pk, "name": item.name, "email": item.email,
        "event_name": item.event_name, "status": item.status, "created_at": _iso(item.created_at),
    } for item in EventRegistration.objects.order_by("-created_at")[:8]]

    upcoming_events = [{
        "id": item.pk, "title": item.title, "location": item.location or item.venue_name,
        "starts_at": _iso(item.starts_at), "registrations": item.registration_count,
        "capacity": item.capacity,
    } for item in Event.objects.filter(
        is_published=True, is_hidden_on_site=False, starts_at__gte=timezone.now(),
    ).annotate(registration_count=Count("registrations")).order_by("starts_at")[:6]]

    recent_users = [{
        "id": item.pk, "username": item.get_username(),
        "name": item.get_full_name().strip() or item.get_username(), "email": item.email,
        "is_staff": item.is_staff, "is_active": item.is_active,
        "date_joined": _iso(item.date_joined), "last_login": _iso(item.last_login),
    } for item in User.objects.order_by("-date_joined")[:6]]

    return {
        "generated_at": timezone.now().isoformat(),
        "counts": _dashboard_counts(),
        "application_statuses": application_statuses,
        "enquiry_statuses": enquiry_statuses,
        "recent_applications": recent_applications,
        "recent_enquiries": _recent_enquiries(),
        "recent_registrations": recent_registrations,
        "upcoming_events": upcoming_events,
        "recent_users": recent_users,
    }


class AdminDashboardView(APIView):
    """Cached, read-only operational overview built from existing IPC models."""

    permission_classes = [IsAdminUser]

    def get(self, request):
        force_refresh = request.query_params.get("refresh") == "1"
        payload = None if force_refresh else cache.get(CACHE_KEY)
        if payload is None:
            payload = _build_dashboard()
            cache.set(CACHE_KEY, payload, CACHE_SECONDS)
        return Response(payload)


class EnquiryReplySerializer(serializers.Serializer):
    message = serializers.CharField(min_length=2, max_length=5000, trim_whitespace=True)

    def validate_message(self, value):
        return clean_text(value)


def _enquiry_for_reply(source, enquiry_id):
    models_by_source = {
        "contact": ContactSubmission,
        "club": ClubEnquiry,
        "award": AwardsInterest,
    }
    model = models_by_source.get(source)
    if not model:
        raise Http404
    try:
        enquiry = get_object_or_404(model, pk=enquiry_id)
    except (ValueError, ValidationError) as error:
        raise Http404 from error

    if source == "contact":
        return enquiry, enquiry.name, enquiry.email, enquiry.category
    if source == "club":
        return (
            enquiry,
            enquiry.club_name or "IPC clubs enquirer",
            enquiry.email,
            enquiry.club_name or "Clubs enquiry",
        )
    return (
        enquiry,
        enquiry.name,
        enquiry.email,
        enquiry.programme.title if enquiry.programme_id else enquiry.interest_type,
    )


class AdminEnquiryDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, source, enquiry_id):
        enquiry, recipient_name, recipient_email, enquiry_subject = _enquiry_for_reply(
            source,
            enquiry_id,
        )
        metadata = []
        updated_at = None
        if source == "contact":
            metadata = [
                {"label": "Category", "value": enquiry.category},
                {
                    "label": "Handled by",
                    "value": (
                        enquiry.handled_by.get_full_name().strip()
                        or enquiry.handled_by.get_username()
                    ) if enquiry.handled_by_id else "Not assigned",
                },
                {"label": "Handled at", "value": _iso(enquiry.handled_at)},
            ]
        elif source == "club":
            metadata = [
                {"label": "Club", "value": enquiry.club_name or "General clubs enquiry"},
                {"label": "Club slug", "value": enquiry.club_slug},
                {"label": "Source page", "value": enquiry.page_url},
            ]
            updated_at = enquiry.updated_at
        else:
            metadata = [
                {"label": "Interest type", "value": enquiry.interest_type},
                {
                    "label": "Award programme",
                    "value": enquiry.programme.title if enquiry.programme_id else "Not specified",
                },
            ]

        return Response({
            "id": str(enquiry.pk),
            "type": source,
            "name": recipient_name,
            "email": recipient_email,
            "subject": enquiry_subject,
            "message": enquiry.message,
            "status": enquiry.status,
            "created_at": _iso(enquiry.created_at),
            "updated_at": _iso(updated_at),
            "metadata": metadata,
        })


class AdminEnquiryListView(APIView):
    """Return all enquiries from contact, clubs and awards in one ordered list."""

    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response(_enquiries())


class AdminEnquiryReplyView(APIView):
    permission_classes = [IsAdminUser]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "admin_enquiry_reply"

    def post(self, request, source, enquiry_id):
        serializer = EnquiryReplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        enquiry, recipient_name, recipient_email, enquiry_subject = _enquiry_for_reply(
            source,
            enquiry_id,
        )
        administrator_name = (
            request.user.get_full_name().strip() or request.user.get_username()
        )
        reply_to = request.user.email.strip().lower()
        try:
            validate_email(reply_to)
        except ValidationError:
            reply_to = None

        try:
            send_enquiry_reply_email(
                recipient=recipient_email,
                recipient_name=recipient_name,
                enquiry_subject=enquiry_subject,
                message_body=serializer.validated_data["message"],
                administrator_name=administrator_name,
                reply_to=reply_to,
            )
        except (GraphMailError, ImproperlyConfigured, RequestException):
            return Response(
                {"detail": "The enquiry reply could not be sent. Check the Microsoft Graph configuration."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        if source == "contact":
            enquiry.status = ContactSubmission.Status.IN_PROGRESS
            enquiry.handled_by = request.user
            enquiry.handled_at = timezone.now()
            enquiry.save(update_fields=["status", "handled_by", "handled_at"])
        elif source == "club":
            enquiry.status = ClubEnquiry.Status.CONTACTED
            enquiry.save(update_fields=["status", "updated_at"])
        else:
            enquiry.status = AwardsInterest.Status.CONTACTED
            enquiry.save(update_fields=["status"])

        cache.delete(CACHE_KEY)
        return Response({"detail": "Enquiry reply sent successfully.", "status": enquiry.status})
