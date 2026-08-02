from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import filters, mixins, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from applications.models import Application, ApplicationEvidence, ApplicationStatusHistory
from accounts.models import AdminNotification
from accounts.notification_service import create_admin_notifications
from awards.models import AwardProgramme
from clubs.models import ClubPageContent
from events.models import EventRegistration
from ipc_backend.validators import clean_text, validate_upload
from scholarships.models import BursaryApplication

from .models import (
    AwardNomination, AwardNominationDocument, Club, ClubMembership, ClubMessage, DiscussionCategory,
    DiscussionPost, DiscussionThread, ProfessionalInterest, Programme, ProgrammeEnquiry,
    Scholarship, ScholarshipApplication, Status, SupportMessage, SupportTicket,
    UserDocument, UserNotification, UserPreference, UserProfile,
)
from .serializers import (
    AdminClubMembershipSerializer, AdminNominationSerializer, AdminSupportSerializer, AwardSerializer, BookingSerializer, CategorySerializer, ClubSerializer,
    DocumentSerializer, EnquirySerializer, InterestSerializer,
    MembershipApplicationSerializer, MessageSerializer, NominationSerializer,
    NotificationSerializer, PostSerializer, PreferenceSerializer, ProfileSerializer,
    ProgrammeSerializer, ScholarshipApplicationSerializer, ScholarshipSerializer,
    SupportMessageSerializer, SupportSerializer, ThreadSerializer, completion, submit,
)


class Pagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 50


def membership(user, club):
    return ClubMembership.objects.filter(user=user, club=club, status=ClubMembership.State.ACTIVE).first()


def provision_managed_club(slug):
    content = ClubPageContent.objects.filter(
        key="main",
        is_active=True,
        status=ClubPageContent.Status.PUBLISHED,
    ).first()
    item = next(
        (
            entry for entry in (content.regional_clubs if content else [])
            if str(entry.get("id") or "").strip() == slug
        ),
        None,
    )
    if item is None:
        return None

    location = str(item.get("name") or "").strip()
    description = str(
        item.get("detail")
        or item.get("description")
        or f"IPC regional professional community in {location}."
    ).strip()
    with transaction.atomic():
        club, _ = Club.objects.update_or_create(
            slug=slug,
            defaults={
                "name": f"{location} Club",
                "summary": str(
                    item.get("description")
                    or item.get("label")
                    or description
                ).strip(),
                "description": description,
                "location": location,
                "specialism": str(item.get("focus") or item.get("label") or "").strip(),
                "is_active": True,
            },
        )
        for category_name, category_slug in (
            ("General", "general"),
            ("Events and CPD", "events-cpd"),
            ("Professional practice", "professional-practice"),
        ):
            DiscussionCategory.objects.get_or_create(
                club=club,
                slug=category_slug,
                defaults={"name": category_name},
            )
    return club


def has_active_ipc_membership(user):
    try:
        return user.membership_application.status == Application.Status.APPROVED
    except ObjectDoesNotExist:
        return False


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        application = Application.objects.filter(Q(applicant=request.user) | Q(approved_user=request.user)).select_related("membership_grade").order_by("-updated_at").first()
        bookings = request.user.event_registrations.select_related("event").exclude(status=EventRegistration.Status.CANCELLED)[:5]
        notifications = request.user.panel_notifications.all()[:5]
        return Response({
            "profile_completion": completion(profile),
            "membership": MembershipApplicationSerializer(application, context={"request": request}).data if application else None,
            "scholarship_applications": ScholarshipApplicationSerializer(request.user.scholarship_applications.select_related("scholarship")[:5], many=True).data,
            "award_nominations": NominationSerializer(request.user.award_nominations.select_related("programme")[:5], many=True).data,
            "bookings": BookingSerializer(bookings, many=True).data,
            "notifications": NotificationSerializer(notifications, many=True).data,
            "unread_count": request.user.panel_notifications.filter(is_read=False).count(),
            "active_clubs": request.user.club_memberships.filter(status=ClubMembership.State.ACTIVE).count(),
            "document_count": request.user.panel_documents.count(),
        })


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        return Response(ProfileSerializer(profile).data)

    def patch(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class InterestViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = InterestSerializer
    queryset = ProfessionalInterest.objects.filter(is_active=True)


class MembershipViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = MembershipApplicationSerializer
    lookup_field = "application_reference"
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_queryset(self):
        return Application.objects.filter(Q(applicant=self.request.user) | Q(approved_user=self.request.user)).select_related("membership_grade", "form_definition").prefetch_related("evidence_files").distinct()

    def perform_create(self, serializer):
        if self.get_queryset().exclude(status=Application.Status.WITHDRAWN).exists():
            raise serializers.ValidationError({"detail": "You already have an active application."})
        serializer.save()

    def perform_update(self, serializer):
        if serializer.instance.status not in (Application.Status.DRAFT, Application.Status.MORE_INFO_REQUIRED):
            raise serializers.ValidationError({"detail": "This application is not editable."})
        serializer.save()

    @action(detail=True, methods=["post"])
    def submit(self, request, application_reference=None):
        with transaction.atomic():
            app = self.get_queryset().select_for_update().get(application_reference=application_reference)
            if app.status not in (Application.Status.DRAFT, Application.Status.MORE_INFO_REQUIRED):
                return Response({"detail": "This application cannot be submitted."}, status=409)
            errors = {field: "Required before submission." for field in ("first_name", "last_name", "email", "phone") if not getattr(app, field)}
            if not app.code_of_conduct_consent:
                errors["code_of_conduct_consent"] = "Consent is required."
            if not app.privacy_consent:
                errors["privacy_consent"] = "Consent is required."
            if errors:
                return Response(errors, status=400)
            previous = app.status
            app.status = Application.Status.SUBMITTED
            app.submitted_at = timezone.now()
            app.save(update_fields=["status", "submitted_at", "updated_at"])
            ApplicationStatusHistory.objects.create(application=app, from_status=previous, to_status=app.status, changed_by=request.user)
        return Response(self.get_serializer(app).data)

    @action(detail=True, methods=["post"], url_path="documents")
    def upload(self, request, application_reference=None):
        app = self.get_object()
        if app.status not in (Application.Status.DRAFT, Application.Status.MORE_INFO_REQUIRED):
            return Response({"detail": "Documents cannot be added now."}, status=409)
        file = request.FILES.get("file")
        evidence_type = request.data.get("evidence_type", "other")
        if not file:
            return Response({"file": "Choose a file."}, status=400)
        validate_upload(file)
        item = ApplicationEvidence.objects.create(application=app, evidence_type=evidence_type, file=file, original_name=file.name, content_type=getattr(file, "content_type", ""), file_size=file.size, uploaded_by=request.user)
        return Response({"id": item.pk, "name": item.original_name}, status=201)


class SearchViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]


class ScholarshipViewSet(SearchViewSet):
    serializer_class = ScholarshipSerializer
    lookup_field = "slug"
    search_fields = ["title", "summary", "category", "partner_name"]
    ordering_fields = ["title", "deadline", "funding_max_percent"]

    def get_queryset(self):
        return Scholarship.objects.filter(is_active=True)

    @staticmethod
    def owned_bursary_applications(request):
        membership_references = Application.objects.filter(
            Q(applicant=request.user)
            | Q(approved_user=request.user)
            | Q(email__iexact=request.user.email),
        ).values_list("application_reference", flat=True)
        return BursaryApplication.objects.filter(
            Q(submitted_by=request.user)
            | Q(membership_reference__in=membership_references)
            | Q(email__iexact=request.user.email),
        ).distinct()

    @action(detail=False, methods=["get"], url_path="my-applications")
    def my_applications(self, request):
        bursary_applications = self.owned_bursary_applications(request)
        items = [
            {
                "id": f"bursary-{application.pk}",
                "source": "bursary",
                "application_reference": application.application_reference,
                "title": "IPC Bursary",
                "pathway": application.get_bursary_selection_display(),
                "status": application.status,
                "status_label": application.get_status_display(),
                "submitted_at": application.submitted_at,
                "updated_at": application.updated_at,
            }
            for application in bursary_applications
        ]

        legacy_applications = ScholarshipApplication.objects.filter(
            applicant=request.user,
        ).select_related("scholarship")
        items.extend({
            "id": f"scholarship-{application.public_id}",
            "source": "legacy",
            "application_reference": "",
            "title": application.scholarship.title,
            "pathway": "",
            "status": application.status,
            "status_label": application.get_status_display(),
            "submitted_at": application.submitted_at,
            "updated_at": application.updated_at,
        } for application in legacy_applications)

        items.sort(
            key=lambda item: item["submitted_at"] or item["updated_at"],
            reverse=True,
        )
        return Response(items)

    @action(
        detail=False,
        methods=["get"],
        url_path=r"my-applications/(?P<application_reference>[^/.]+)",
    )
    def my_application_detail(self, request, application_reference=None):
        application = get_object_or_404(
            self.owned_bursary_applications(request),
            application_reference__iexact=application_reference,
        )
        return Response({
            "id": f"bursary-{application.pk}",
            "application_reference": application.application_reference,
            "membership_reference": application.membership_reference,
            "status": application.status,
            "status_label": application.get_status_display(),
            "submitted_at": application.submitted_at,
            "updated_at": application.updated_at,
            "applicant": {
                "name": f"{application.first_name} {application.last_name}".strip(),
                "preferred_name": application.preferred_name,
                "email": application.email,
                "mobile_phone": application.mobile_phone_e164,
                "country": application.country,
                "town_or_city": application.town_or_city,
            },
            "organisation": {
                "applicable": not application.organisation_not_applicable,
                "name": application.organisation_name,
                "job_title": application.job_title,
                "industry": application.industry_or_sector,
            },
            "pathway": {
                "name": application.get_bursary_selection_display(),
                "preferred_start": application.preferred_start_month_or_intake,
                "highest_relevant_qualification": application.highest_relevant_qualification,
                "professional_memberships": application.professional_memberships_or_certifications,
            },
            "emergency_contact": {
                "full_name": application.emergency_contact_full_name,
                "relationship": application.emergency_contact_relationship,
                "email": application.emergency_contact_email,
                "phone": application.emergency_contact_phone,
            },
            "support_needs": {
                "declared": application.has_disability_or_health_condition,
                "categories": application.health_problem_categories,
                "primary": application.primary_health_problem,
                "identity_document_uploaded": bool(application.identity_document),
                "applicant_photo_uploaded": bool(application.applicant_photo),
            },
            "statements": {
                "relevant_experience": application.relevant_experience,
                "pathway_fit_reason": application.pathway_fit_reason,
                "additional_review_information": application.additional_review_information,
            },
        })


class ScholarshipApplicationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ScholarshipApplicationSerializer
    lookup_field = "public_id"
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_queryset(self):
        return ScholarshipApplication.objects.filter(applicant=self.request.user).select_related("scholarship")

    def perform_update(self, serializer):
        if serializer.instance.status not in (Status.DRAFT, Status.ACTION):
            raise serializers.ValidationError({"detail": "This application is not editable."})
        serializer.save()

    @action(detail=True, methods=["post"])
    def submit(self, request, public_id=None):
        app = self.get_object()
        if app.status not in (Status.DRAFT, Status.ACTION):
            return Response({"detail": "This application cannot be submitted."}, status=409)
        submit(app, ["statement"])
        return Response(self.get_serializer(app).data)


class AwardViewSet(SearchViewSet):
    serializer_class = AwardSerializer
    lookup_field = "slug"
    search_fields = ["title", "description", "category__title"]

    def get_queryset(self):
        return AwardProgramme.objects.filter(is_active=True).select_related("category")


class NominationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = NominationSerializer
    lookup_field = "public_id"
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_queryset(self):
        return AwardNomination.objects.filter(applicant=self.request.user).select_related("programme").prefetch_related("documents")

    def perform_create(self, serializer):
        if not has_active_ipc_membership(self.request.user):
            raise PermissionDenied("Active IPC membership is required to submit an award nomination.")
        serializer.save()

    def perform_update(self, serializer):
        if serializer.instance.status not in (Status.DRAFT, Status.ACTION):
            raise serializers.ValidationError({"detail": "This nomination is not editable."})
        serializer.save()

    @action(detail=True, methods=["post"])
    def submit(self, request, public_id=None):
        item = self.get_object()
        if not has_active_ipc_membership(request.user):
            raise PermissionDenied("Active IPC membership is required to submit an award nomination.")
        if item.status not in (Status.DRAFT, Status.ACTION):
            return Response({"detail": "This nomination cannot be submitted."}, status=409)
        required_responses = ("organisation", "contribution", "impact", "declaration")
        missing = [
            field for field in required_responses
            if not item.responses.get(field)
        ]
        if missing:
            return Response(
                {field: "Required before submission." for field in missing},
                status=400,
            )
        if not item.documents.exists():
            return Response(
                {"evidence": "Upload at least one evidence document."},
                status=400,
            )
        submit(item, ["nominee_name", "statement"])
        return Response(self.get_serializer(item).data)

    @action(detail=True, methods=["post"], url_path="documents")
    def upload_document(self, request, public_id=None):
        nomination = self.get_object()
        if nomination.status not in (Status.DRAFT, Status.ACTION):
            return Response({"detail": "Evidence cannot be changed now."}, status=409)
        file = request.FILES.get("file")
        if not file:
            return Response({"file": "Choose an evidence file."}, status=400)
        validate_upload(file)
        document = AwardNominationDocument.objects.create(
            nomination=nomination, file=file, original_name=file.name,
            content_type=getattr(file, "content_type", ""), file_size=file.size,
        )
        return Response(
            {"id": document.pk, "name": document.original_name, "size": document.file_size},
            status=201,
        )

    @action(
        detail=True, methods=["get"],
        url_path=r"documents/(?P<document_id>[^/.]+)/download",
    )
    def download_document(self, request, public_id=None, document_id=None):
        nomination = self.get_object()
        document = get_object_or_404(
            AwardNominationDocument, pk=document_id, nomination=nomination,
        )
        response = FileResponse(
            document.file.open("rb"),
            content_type=document.content_type or "application/octet-stream",
            as_attachment=True, filename=document.original_name,
        )
        response["Cache-Control"] = "private, no-store"
        response["X-Content-Type-Options"] = "nosniff"
        return response


class AdminNominationViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = AdminNominationSerializer
    lookup_field = "public_id"
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "programme__title", "applicant__email", "applicant__first_name",
        "applicant__last_name", "nominee_name", "nominee_email",
    ]
    ordering_fields = ["created_at", "updated_at", "submitted_at", "status"]

    def get_queryset(self):
        queryset = AwardNomination.objects.select_related("programme", "applicant").prefetch_related("documents")
        requested_status = self.request.query_params.get("status")
        return queryset.filter(status=requested_status) if requested_status else queryset

    @action(detail=True, methods=["patch"], url_path="status")
    def update_status(self, request, public_id=None):
        nomination = self.get_object()
        transitions = {
            Status.SUBMITTED: {
                Status.REVIEW, Status.ACTION, Status.APPROVED, Status.REJECTED,
            },
            Status.REVIEW: {Status.ACTION, Status.APPROVED, Status.REJECTED},
            Status.ACTION: {Status.REVIEW, Status.APPROVED, Status.REJECTED},
        }
        next_status = request.data.get("status")
        if next_status not in transitions.get(nomination.status, set()):
            return Response(
                {"detail": "This status transition is not allowed."},
                status=status.HTTP_409_CONFLICT,
            )
        nomination.status = next_status
        nomination.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(nomination).data)

    @action(
        detail=True, methods=["get"],
        url_path=r"documents/(?P<document_id>[^/.]+)/download",
    )
    def download_document(self, request, public_id=None, document_id=None):
        nomination = self.get_object()
        document = get_object_or_404(
            AwardNominationDocument, pk=document_id, nomination=nomination,
        )
        response = FileResponse(
            document.file.open("rb"),
            content_type=document.content_type or "application/octet-stream",
            as_attachment=True, filename=document.original_name,
        )
        response["Cache-Control"] = "private, no-store"
        response["X-Content-Type-Options"] = "nosniff"
        return response


class ClubViewSet(SearchViewSet):
    serializer_class = ClubSerializer
    lookup_field = "slug"
    search_fields = ["name", "summary", "location", "specialism"]
    ordering_fields = ["name", "location"]

    def get_queryset(self):
        return Club.objects.filter(is_active=True).prefetch_related("memberships")

    @action(detail=True, methods=["post"])
    def join(self, request, slug=None):
        club = Club.objects.filter(slug=slug, is_active=True).first()
        if club is None:
            club = provision_managed_club(slug)
        if club is None:
            return Response({"detail": "Club not found."}, status=status.HTTP_404_NOT_FOUND)
        details = {
            "job_title": clean_text(request.data.get("professional_role")),
            "employer": clean_text(request.data.get("organisation")),
            "city": clean_text(request.data.get("location")),
        }
        missing = [
            label for field, label in (
                ("job_title", "Professional role"),
                ("employer", "Organisation"),
                ("city", "Location"),
            )
            if not details[field]
        ]
        if missing:
            return Response(
                {"detail": f"Complete the following fields: {', '.join(missing)}."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        for field, value in details.items():
            setattr(profile, field, value)
        profile.save(update_fields=[*details.keys(), "updated_at"])
        record, created = ClubMembership.objects.get_or_create(club=club, user=request.user, defaults={"status": ClubMembership.State.PENDING})
        if not created and record.status in (ClubMembership.State.PENDING, ClubMembership.State.ACTIVE):
            return Response({"detail": "Membership is already pending or active."}, status=409)
        if not created:
            record.status = ClubMembership.State.PENDING
            record.save(update_fields=["status", "updated_at"])
        create_admin_notifications(
            notification_type=AdminNotification.NotificationType.APPLICATION,
            title="New club membership request",
            message=f"{request.user.get_full_name() or request.user.email} requested to join {club.name}.",
            source_type="club_membership",
            source_id=record.pk,
            target_url="/admin/club-requests",
        )
        return Response({"status": record.status}, status=201 if created else 200)

    @action(detail=True, methods=["post"])
    def leave(self, request, slug=None):
        record = get_object_or_404(ClubMembership, club=self.get_object(), user=request.user, status=ClubMembership.State.ACTIVE)
        record.status = ClubMembership.State.LEFT
        record.save(update_fields=["status", "updated_at"])
        return Response({"status": record.status})


class AdminClubMembershipViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAdminUser]
    serializer_class = AdminClubMembershipSerializer
    queryset = ClubMembership.objects.select_related("club", "user").order_by(
        "status", "-created_at",
    )
    http_method_names = ["get", "patch", "head", "options"]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["user__first_name", "user__last_name", "user__email", "club__name"]
    ordering_fields = ["created_at", "updated_at", "status"]

    def partial_update(self, request, *args, **kwargs):
        requested_status = request.data.get("status")
        if requested_status not in {
            ClubMembership.State.ACTIVE,
            ClubMembership.State.REJECTED,
            ClubMembership.State.SUSPENDED,
        }:
            return Response(
                {"detail": "Choose active, rejected or suspended."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().partial_update(request, *args, **kwargs)


class AdminClubViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = ClubSerializer
    queryset = Club.objects.filter(is_active=True).prefetch_related(
        "memberships", "categories",
    ).order_by("name")
    pagination_class = None

    def list(self, request, *args, **kwargs):
        clubs = list(self.get_queryset())
        data = list(self.get_serializer(clubs, many=True).data)
        existing_slugs = {item["slug"] for item in data}
        content = ClubPageContent.objects.filter(
            key="main",
            is_active=True,
            status=ClubPageContent.Status.PUBLISHED,
        ).first()
        for item in content.regional_clubs if content else []:
            slug = str(item.get("id") or "").strip()
            if not slug or slug in existing_slugs:
                continue
            location = str(item.get("name") or "").strip()
            data.append({
                "public_id": slug,
                "name": f"{location} Club",
                "slug": slug,
                "summary": str(item.get("description") or item.get("label") or ""),
                "description": str(item.get("detail") or item.get("description") or ""),
                "location": location,
                "specialism": str(item.get("focus") or item.get("label") or ""),
                "membership_status": "not_joined",
                "membership_role": None,
                "membership_joined_at": None,
                "active_member_count": 0,
                "discussion_count": 0,
                "message_count": 0,
                "members": [],
                "categories": [],
            })
        return Response(sorted(data, key=lambda item: item["name"]))


class ClubThreadViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ThreadSerializer
    lookup_field = "public_id"
    pagination_class = Pagination
    http_method_names = ["get", "post", "patch", "head", "options"]

    def club(self):
        return get_object_or_404(Club, slug=self.kwargs["club_slug"], is_active=True)

    def _allowed(self):
        return self.request.user.is_staff or membership(self.request.user, self.club())

    def get_queryset(self):
        if not self._allowed():
            return DiscussionThread.objects.none()
        return DiscussionThread.objects.filter(category__club=self.club()).select_related("category", "author")

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs) if self._allowed() else Response({"detail": "Active club membership required."}, status=403)

    def perform_create(self, serializer):
        if not self._allowed() or serializer.validated_data["category"].club_id != self.club().id:
            raise serializers.ValidationError({"detail": "Active membership and a valid category are required."})
        serializer.save(author=self.request.user)

    @action(detail=True, methods=["get", "post"])
    def posts(self, request, club_slug=None, public_id=None):
        thread = self.get_object()
        if request.method == "GET":
            return Response(PostSerializer(thread.posts.select_related("author"), many=True).data)
        if thread.is_locked and not request.user.is_staff:
            return Response({"detail": "Thread is locked."}, status=409)
        serializer = PostSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = serializer.save(thread=thread, author=request.user)
        return Response(PostSerializer(item).data, status=201)


class ClubMessageViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer
    pagination_class = Pagination

    def club(self):
        return get_object_or_404(Club, slug=self.kwargs["club_slug"], is_active=True)

    def get_queryset(self):
        if not self.request.user.is_staff and not membership(self.request.user, self.club()):
            return ClubMessage.objects.none()
        return ClubMessage.objects.filter(club=self.club()).select_related("sender")

    def list(self, request, *args, **kwargs):
        if not request.user.is_staff and not membership(request.user, self.club()):
            return Response({"detail": "Active club membership required."}, status=403)
        return super().list(request, *args, **kwargs)

    def perform_create(self, serializer):
        if not self.request.user.is_staff and not membership(self.request.user, self.club()):
            raise serializers.ValidationError({"detail": "Active club membership required."})
        serializer.save(club=self.club(), sender=self.request.user)


class BookingViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = BookingSerializer
    lookup_field = "reference"

    def get_queryset(self):
        return self.request.user.event_registrations.select_related("event")

    @action(detail=True, methods=["post"])
    def cancel(self, request, reference=None):
        item = self.get_object()
        if item.event and item.event.starts_at and item.event.starts_at <= timezone.now():
            return Response({"detail": "Past bookings cannot be cancelled."}, status=409)
        item.status = EventRegistration.Status.CANCELLED
        item.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(item).data)


class DocumentViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = DocumentSerializer
    lookup_field = "public_id"

    def get_queryset(self):
        queryset = self.request.user.panel_documents.all()
        return queryset.filter(category=self.request.query_params["category"]) if "category" in self.request.query_params else queryset

    @action(detail=True, methods=["get"])
    def download(self, request, public_id=None):
        item = self.get_object()
        response = FileResponse(item.file.open("rb"), content_type=item.content_type or "application/octet-stream", as_attachment=item.content_type != "application/pdf", filename=item.original_name)
        response["Cache-Control"] = "private, no-store"
        response["X-Content-Type-Options"] = "nosniff"
        return response


class NotificationViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    lookup_field = "public_id"
    pagination_class = Pagination

    def get_queryset(self):
        return self.request.user.panel_notifications.all()

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        response.data["unread_count"] = self.get_queryset().filter(is_read=False).count()
        return response

    @action(detail=True, methods=["post"])
    def read(self, request, public_id=None):
        item = self.get_object()
        item.is_read, item.read_at = True, timezone.now()
        item.save(update_fields=["is_read", "read_at", "updated_at"])
        return Response(self.get_serializer(item).data)

    @action(detail=False, methods=["post"], url_path="read-all")
    def read_all(self, request):
        updated = self.get_queryset().filter(is_read=False).update(is_read=True, read_at=timezone.now(), updated_at=timezone.now())
        return Response({"updated": updated, "unread_count": 0})


class ProgrammeViewSet(SearchViewSet):
    serializer_class = ProgrammeSerializer
    lookup_field = "slug"
    search_fields = ["title", "summary", "provider"]

    def get_queryset(self):
        return Programme.objects.filter(is_active=True)


class EnquiryViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = EnquirySerializer

    def get_queryset(self):
        return ProgrammeEnquiry.objects.filter(applicant=self.request.user).select_related("programme")


class SupportViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SupportSerializer
    lookup_field = "public_id"
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        return SupportTicket.objects.filter(requester=self.request.user).prefetch_related("messages__author")

    def perform_create(self, serializer):
        ticket = serializer.save()
        message = ticket.messages.order_by("created_at").first()
        if message:
            create_admin_notifications(
                notification_type=AdminNotification.NotificationType.SUPPORT,
                title=f"New support request: {ticket.subject}",
                message=message.body[:1000],
                source_type="support_message",
                source_id=message.pk,
                target_url="/admin/support",
            )

    @action(detail=True, methods=["post"])
    def reply(self, request, public_id=None):
        ticket = self.get_object()
        if ticket.status == "closed":
            return Response({"detail": "Ticket is closed."}, status=409)
        serializer = SupportMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = serializer.save(ticket=ticket, author=request.user)
        ticket.save(update_fields=["updated_at"])
        create_admin_notifications(
            notification_type=AdminNotification.NotificationType.SUPPORT,
            title=f"New support message: {ticket.subject}",
            message=item.body[:1000],
            source_type="support_message",
            source_id=item.pk,
            target_url="/admin/support",
        )
        return Response(SupportMessageSerializer(item).data, status=201)

    @action(detail=True, methods=["post"])
    def read(self, request, public_id=None):
        ticket = self.get_object()
        updated = ticket.messages.filter(
            is_staff_reply=True, read_at__isnull=True,
        ).update(read_at=timezone.now(), updated_at=timezone.now())
        UserNotification.objects.filter(
            recipient=request.user,
            notification_type="support",
            is_read=False,
        ).update(is_read=True, read_at=timezone.now(), updated_at=timezone.now())
        return Response({"updated": updated})


class AdminSupportViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAdminUser]
    serializer_class = AdminSupportSerializer
    lookup_field = "public_id"
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "subject", "category", "requester__email", "requester__first_name",
        "requester__last_name", "messages__body",
    ]
    ordering_fields = ["created_at", "updated_at", "status"]

    def get_queryset(self):
        queryset = SupportTicket.objects.select_related("requester").prefetch_related(
            "messages__author",
        )
        requested_status = self.request.query_params.get("status")
        queryset = queryset.filter(status=requested_status) if requested_status else queryset
        return queryset.distinct()

    @action(detail=True, methods=["post"])
    def reply(self, request, public_id=None):
        ticket = self.get_object()
        if ticket.status == "closed":
            return Response(
                {"detail": "Reopen this conversation before replying."},
                status=status.HTTP_409_CONFLICT,
            )
        serializer = SupportMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = serializer.save(
            ticket=ticket, author=request.user, is_staff_reply=True,
        )
        ticket.save(update_fields=["updated_at"])
        UserNotification.objects.create(
            recipient=ticket.requester,
            notification_type="support",
            title=f"IPC Support replied: {ticket.subject}",
            message=item.body[:5000],
            target_url="/user/support",
        )
        return Response(SupportMessageSerializer(item).data, status=201)

    @action(detail=True, methods=["post"])
    def read(self, request, public_id=None):
        ticket = self.get_object()
        message_ids = list(ticket.messages.filter(
            is_staff_reply=False, read_at__isnull=True,
        ).values_list("pk", flat=True))
        updated = ticket.messages.filter(pk__in=message_ids).update(
            read_at=timezone.now(), updated_at=timezone.now(),
        )
        AdminNotification.objects.filter(
            recipient=request.user,
            notification_type=AdminNotification.NotificationType.SUPPORT,
            source_type="support_message",
            source_id__in=message_ids,
            is_read=False,
        ).update(is_read=True, read_at=timezone.now(), updated_at=timezone.now())
        return Response({"updated": updated})

    @action(detail=True, methods=["patch"])
    def state(self, request, public_id=None):
        ticket = self.get_object()
        next_status = request.data.get("status")
        if next_status not in {"open", "closed"}:
            return Response(
                {"detail": "Status must be open or closed."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        ticket.status = next_status
        ticket.closed_at = timezone.now() if next_status == "closed" else None
        ticket.save(update_fields=["status", "closed_at", "updated_at"])
        return Response(self.get_serializer(ticket).data)


class PreferenceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        item, _ = UserPreference.objects.get_or_create(user=request.user)
        return Response(PreferenceSerializer(item).data)

    def patch(self, request):
        item, _ = UserPreference.objects.get_or_create(user=request.user)
        serializer = PreferenceSerializer(item, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
