from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.db import connection
from django.db.models import Count
from django.utils import timezone
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from applications.models import Application
from awards.models import AwardProgramme, AwardsInterest
from clubs.models import ClubEnquiry
from contact.models import ContactSubmission
from events.models import Event, EventRegistration
from media_library.models import MediaAsset
from memberships.models import MembershipGrade
from newsletter.models import NewsletterSignup


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
          (SELECT COUNT(*) FROM {_table(Event)} WHERE is_published = %s),
          (SELECT COUNT(*) FROM {_table(NewsletterSignup)} WHERE is_active = %s),
          (SELECT COUNT(*) FROM {_table(MembershipGrade)} WHERE is_active = %s),
          (SELECT COUNT(*) FROM {_table(AwardProgramme)} WHERE is_active = %s),
          (SELECT COUNT(*) FROM {_table(MediaAsset)})
    """
    params = [
        True, Application.Status.SUBMITTED, Application.Status.UNDER_REVIEW,
        ContactSubmission.Status.NEW, ContactSubmission.Status.IN_PROGRESS,
        ClubEnquiry.Status.NEW, AwardsInterest.Status.NEW, True, True, True, True,
    ]
    keys = [
        "users", "active_users", "applications", "applications_pending",
        "contact_submissions", "contact_open", "club_enquiries", "club_new",
        "award_interests", "award_new", "event_registrations", "published_events",
        "newsletter_subscribers", "membership_grades", "award_programmes", "media_assets",
    ]
    with connection.cursor() as cursor:
        cursor.execute(sql, params)
        return dict(zip(keys, cursor.fetchone()))


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


def _recent_enquiries():
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
        LIMIT %s
    """
    with connection.cursor() as cursor:
        cursor.execute(sql, ["contact", "club", "Club enquiry", "General clubs enquiry", "award", 10])
        return [{
            "id": row[0], "type": row[1], "name": row[2], "email": row[3],
            "subject": row[4], "status": row[5], "created_at": _iso(row[6]),
        } for row in cursor.fetchall()]


def _build_dashboard():
    applications = Application.objects.select_related("membership_grade")
    application_statuses, enquiry_statuses = _status_counts()

    recent_applications = [{
        "id": item.pk, "reference": item.application_reference,
        "name": f"{item.first_name} {item.last_name}".strip(), "email": item.email,
        "grade": item.membership_grade.code, "status": item.status,
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
        is_published=True, starts_at__gte=timezone.now(),
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
