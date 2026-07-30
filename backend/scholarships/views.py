import logging

from django.contrib.auth import get_user_model
from django.http import Http404
from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import filters, mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from applications.models import Application
from accounts.graph_mail import (
    GraphMailError,
    send_bursary_approval_email as send_graph_bursary_approval_email,
    send_bursary_rejection_email as send_graph_bursary_rejection_email,
)
from accounts.models import AdminNotification
from accounts.notification_service import create_admin_notifications
from user_panel.models import UserNotification

from .models import (
    BursaryApplication,
    BursaryApplicationStatusHistory,
    ScholarshipGatewayContent,
    ScholarshipPathwaysContent,
)
from .serializers import (
    BursaryApplicationDetailSerializer,
    BursaryApplicationListSerializer,
    BursaryApplicationNoteSerializer,
    BursaryApplicationPublicSerializer,
    BursaryApplicationStatusUpdateSerializer,
    ScholarshipGatewayContentSerializer,
)


PATHWAY_DETAIL_FIELDS = {
    "accent",
    "accentSoft",
    "promise",
    "themes",
    "evidence",
    "journey",
    "creditNumbers",
    "funding",
}

logger = logging.getLogger(__name__)


def deliver_bursary_approval_email(application_id):
    application = BursaryApplication.objects.filter(pk=application_id).first()
    if application is None or application.approval_email_sent_at is not None:
        return

    recipient_name = application.preferred_name.strip() or application.first_name
    try:
        send_graph_bursary_approval_email(
            recipient=application.email,
            name=recipient_name,
            application_reference=application.application_reference,
            pathway=application.get_preferred_pathway_display(),
        )
    except GraphMailError:
        logger.exception(
            "Microsoft Graph could not send the bursary approval email for application %s.",
            application.application_reference,
        )
        return

    BursaryApplication.objects.filter(
        pk=application_id,
        approval_email_sent_at__isnull=True,
    ).update(approval_email_sent_at=timezone.now())


def deliver_bursary_rejection_email(application_id, reason):
    application = BursaryApplication.objects.filter(pk=application_id).first()
    if application is None or application.rejection_email_sent_at is not None:
        return

    recipient_name = application.preferred_name.strip() or application.first_name
    try:
        send_graph_bursary_rejection_email(
            recipient=application.email,
            name=recipient_name,
            application_reference=application.application_reference,
            pathway=application.get_preferred_pathway_display(),
            reason=reason,
        )
    except GraphMailError:
        logger.exception(
            "Microsoft Graph could not send the bursary rejection email for application %s.",
            application.application_reference,
        )
        return

    BursaryApplication.objects.filter(
        pk=application_id,
        rejection_email_sent_at__isnull=True,
    ).update(rejection_email_sent_at=timezone.now())


def create_bursary_status_notifications(application, rejection_reason=""):
    linked_applications = Application.objects.filter(
        application_reference__iexact=application.membership_reference,
    ).values_list("applicant_id", "approved_user_id")
    recipient_ids = {
        user_id
        for linked_users in linked_applications
        for user_id in linked_users
        if user_id
    }
    recipients = get_user_model().objects.filter(
        Q(pk__in=recipient_ids) | Q(email__iexact=application.email),
    ).distinct()

    titles = {
        BursaryApplication.Status.SUBMITTED: "Bursary application submitted",
        BursaryApplication.Status.UNDER_REVIEW: "Bursary application under review",
        BursaryApplication.Status.NEEDS_INFORMATION: "More information needed for your bursary application",
        BursaryApplication.Status.APPROVED: "Bursary application approved",
        BursaryApplication.Status.REJECTED: "Bursary application rejected",
    }
    message = (
        f"Your IPC Bursary application {application.application_reference} "
        f"is now {application.get_status_display()}."
    )
    if application.status == BursaryApplication.Status.REJECTED and rejection_reason:
        message = f"{message} Reason: {rejection_reason}"

    UserNotification.objects.bulk_create([
        UserNotification(
            recipient=recipient,
            notification_type="bursary_application",
            title=titles[application.status],
            message=message[:2000],
            target_url="/user/scholarships",
        )
        for recipient in recipients
    ])


class ScholarshipContentView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        gateway_content = ScholarshipGatewayContent.objects.filter(
            key="main",
            is_active=True,
            status=ScholarshipGatewayContent.Status.PUBLISHED,
        ).first()
        pathways_content = ScholarshipPathwaysContent.objects.filter(key="main").first()
        if gateway_content is None:
            raise Http404("Scholarship content is not available.")

        gateway_data = ScholarshipGatewayContentSerializer(gateway_content).data
        pathways_active = bool(
            pathways_content
            and pathways_content.is_active
            and pathways_content.status == ScholarshipPathwaysContent.Status.PUBLISHED
        )
        pages = [
            page
            for page in (pathways_content.pages if pathways_active else [])
            if isinstance(page, dict) and page.get("is_active", True) is not False
        ]
        pathways = [
            {
                key: value
                for key, value in page.items()
                if key not in PATHWAY_DETAIL_FIELDS
            }
            for page in pages
        ]
        pathway_details = [
            {
                "id": page.get("id"),
                **{
                    field: page[field]
                    for field in PATHWAY_DETAIL_FIELDS
                    if field in page
                },
                **(
                    {"is_active": page["is_active"]}
                    if "is_active" in page
                    else {}
                ),
            }
            for page in pages
        ]
        return Response({
            **gateway_data,
            "pathways_active": pathways_active,
            "pages": pages,
            "pathways": pathways,
            "pathway_details": pathway_details,
            "pathways_updated_at": pathways_content.updated_at if pathways_content else None,
        })


class BursaryMembershipReferenceValidationView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "bursary_membership_validation"

    def get(self, request):
        reference = request.query_params.get("reference", "").strip().upper()
        if not request.user.is_authenticated:
            return Response({
                "authenticated": False,
                "valid": None,
                "message": "",
            })
        if not reference:
            return Response({
                "authenticated": True,
                "valid": False,
                "message": "Enter your IPC membership reference.",
            })

        valid = Application.objects.filter(
            Q(application_reference__iexact=reference),
            Q(applicant=request.user) | Q(approved_user=request.user),
        ).exists()
        return Response({
            "authenticated": True,
            "valid": valid,
            "message": (
                "Membership reference verified for your account."
                if valid
                else "This membership reference is not linked to the account currently signed in."
            ),
        })


class BursaryApplicationCreateViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    serializer_class = BursaryApplicationPublicSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "bursary_application"

    def perform_create(self, serializer):
        application = serializer.save()

        def notify():
            applicant_name = f"{application.first_name} {application.last_name}".strip()
            create_admin_notifications(
                notification_type=AdminNotification.NotificationType.BURSARY_APPLICATION,
                title="New bursary application",
                message=f"{applicant_name} submitted {application.application_reference}.",
                source_type="bursary_application",
                source_id=application.pk,
                target_url=f"/admin/bursary-applications/{application.pk}",
            )
            send_mail(
                "IPC bursary application received",
                (
                    f"Dear {application.first_name},\n\n"
                    "We have received your IPC learner bursary and scholarship application.\n"
                    f"Application reference: {application.application_reference}\n"
                    f"Submitted: {application.submitted_at:%d %B %Y}\n\n"
                    "Submission does not guarantee a bursary or scholarship award."
                ),
                settings.DEFAULT_FROM_EMAIL,
                [application.email],
                fail_silently=True,
            )

        transaction.on_commit(notify)


class BursaryApplicationPagination(PageNumberPagination):
    page_size = 15
    page_size_query_param = "page_size"
    max_page_size = 50


class AdminBursaryApplicationViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [permissions.IsAdminUser]
    pagination_class = BursaryApplicationPagination
    throttle_scope = None
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "application_reference",
        "membership_reference",
        "first_name",
        "last_name",
        "email",
        "mobile_phone_e164",
        "organisation_name",
    ]
    ordering_fields = [
        "submitted_at",
        "first_name",
        "last_name",
        "bursary_amount_requested_gbp",
        "status",
    ]
    ordering = ["-submitted_at"]

    def get_serializer_class(self):
        if self.action == "list":
            return BursaryApplicationListSerializer
        return BursaryApplicationDetailSerializer

    def get_queryset(self):
        queryset = BursaryApplication.objects.select_related(
            "assigned_reviewer",
        ).prefetch_related("status_history__changed_by")
        params = self.request.query_params
        status_value = params.get("status")
        pathway = params.get("pathway")
        employed = params.get("employed")
        country = params.get("country")
        date_from = params.get("date_from")
        date_to = params.get("date_to")
        if status_value in BursaryApplication.Status.values:
            queryset = queryset.filter(status=status_value)
        if pathway in BursaryApplication.PreferredPathway.values:
            queryset = queryset.filter(preferred_pathway=pathway)
        if employed in ("true", "false"):
            queryset = queryset.filter(currently_employed=employed == "true")
        if country:
            queryset = queryset.filter(country__iexact=country.strip())
        if date_from:
            queryset = queryset.filter(submitted_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(submitted_at__date__lte=date_to)
        return queryset

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        counts = BursaryApplication.objects.aggregate(
            total=Count("id"),
            submitted=Count("id", filter=Q(status=BursaryApplication.Status.SUBMITTED)),
            under_review=Count("id", filter=Q(status=BursaryApplication.Status.UNDER_REVIEW)),
            approved=Count("id", filter=Q(status=BursaryApplication.Status.APPROVED)),
            rejected=Count("id", filter=Q(status=BursaryApplication.Status.REJECTED)),
        )
        response.data["summary"] = counts
        return response

    @action(detail=True, methods=["patch"], url_path="status")
    @transaction.atomic
    def update_status(self, request, pk=None):
        target = self.get_object()
        application = BursaryApplication.objects.select_for_update().get(pk=target.pk)
        previous = application.status
        final_statuses = {
            BursaryApplication.Status.APPROVED,
            BursaryApplication.Status.REJECTED,
        }
        if previous in final_statuses:
            return Response(
                {"detail": "Approved and rejected applications are final and cannot be changed."},
                status=status.HTTP_409_CONFLICT,
            )

        serializer = BursaryApplicationStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data["status"]
        assigned_reviewer_supplied = "assigned_reviewer" in serializer.validated_data
        assigned_reviewer = serializer.validated_data.get("assigned_reviewer")
        internal_reason = serializer.validated_data.get("internal_reason", "").strip()

        if (
            new_status == BursaryApplication.Status.SUBMITTED
            and previous != BursaryApplication.Status.SUBMITTED
        ):
            return Response(
                {"detail": "An application cannot be moved back to Submitted."},
                status=status.HTTP_409_CONFLICT,
            )

        changed_fields = []
        if new_status != previous:
            application.status = new_status
            changed_fields.append("status")
        if assigned_reviewer_supplied and application.assigned_reviewer != assigned_reviewer:
            application.assigned_reviewer = assigned_reviewer
            changed_fields.append("assigned_reviewer")
        if changed_fields:
            application.save(update_fields=[*changed_fields, "updated_at"])
        if new_status != previous:
            BursaryApplicationStatusHistory.objects.create(
                application=application,
                previous_status=previous,
                new_status=new_status,
                changed_by=request.user,
                internal_reason=internal_reason,
            )
            getattr(application, "_prefetched_objects_cache", {}).pop("status_history", None)
            create_bursary_status_notifications(
                application,
                rejection_reason=internal_reason,
            )
            if (
                new_status == BursaryApplication.Status.APPROVED
                and application.approval_email_sent_at is None
            ):
                transaction.on_commit(
                    lambda application_id=application.pk: deliver_bursary_approval_email(application_id)
                )
            if (
                new_status == BursaryApplication.Status.REJECTED
                and application.rejection_email_sent_at is None
            ):
                transaction.on_commit(
                    lambda application_id=application.pk, reason=internal_reason:
                        deliver_bursary_rejection_email(application_id, reason)
                )
        return Response(BursaryApplicationDetailSerializer(
            application,
            context={"request": request},
        ).data)

    @action(detail=True, methods=["patch"], url_path="notes")
    def update_notes(self, request, pk=None):
        application = self.get_object()
        serializer = BursaryApplicationNoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        application.reviewer_internal_notes = serializer.validated_data["reviewer_internal_notes"].strip()
        application.save(update_fields=["reviewer_internal_notes", "updated_at"])
        return Response(BursaryApplicationDetailSerializer(
            application,
            context={"request": request},
        ).data, status=status.HTTP_200_OK)
