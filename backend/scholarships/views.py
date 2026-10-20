import csv
import json
import logging
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core import signing
from django.http import FileResponse, Http404, HttpResponse
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.db import transaction
from django.db.models import Count, Max, Q
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import filters, mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotAuthenticated, PermissionDenied
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from applications.models import Application
from accounts.graph_mail import (
    GraphMailError,
    send_bursary_approval_email as send_graph_bursary_approval_email,
    send_bursary_needs_information_email as send_graph_bursary_needs_information_email,
    send_bursary_rejection_email as send_graph_bursary_rejection_email,
)
from accounts.models import AdminNotification
from accounts.notification_service import create_admin_notifications
from user_panel.models import UserNotification
from ipc_backend.email_branding import send_branded_mail as send_mail

from .bursary_export import (
    BURSARY_EXPORT_HEADERS,
    BURSARY_MODULE_PAYABLE_OVERRIDE,
    BURSARY_MODULE_PRICING,
    bursary_export_row,
)
from .bursary_access import bursary_edit_revision, make_bursary_edit_token, read_bursary_edit_token
from .google_sheets import (
    bursary_payment_plan_google_sheets_configured,
    bursary_google_sheet_url,
    bursary_google_sheets_configured,
    sync_bursary_google_sheet,
    sync_bursary_payment_plan_sheet,
)
from .models import (
    BursaryApplication,
    BursaryApplicationStatusHistory,
    BursaryPaymentInstallment,
    BursaryPaymentPlan,
    ScholarshipAnnouncementContent,
    ScholarshipGatewayContent,
    ScholarshipPathwaysContent,
    ScholarshipWinner,
    StripeWebhookEvent,
)
from .payment_portal import deliver_payment_plan_offer
from .serializers import (
    AdminScholarshipWinnerSerializer,
    BursaryApplicationDetailSerializer,
    BursaryApplicationListSerializer,
    BursaryApplicationNoteSerializer,
    BursaryApplicationPublicSerializer,
    BursaryApplicationStatusUpdateSerializer,
    BursaryPaymentPlanSerializer,
    BursaryPaymentPlanPublicSerializer,
    ScholarshipAnnouncementContentSerializer,
    ScholarshipAnnouncementRecipientSerializer,
    ScholarshipGatewayContentSerializer,
    bursary_application_to_public_values,
)
from .stripe_payments import (
    create_checkout_session,
    fulfill_checkout_session,
    link_invoice_to_installment,
    mark_invoice_failed,
    mark_invoice_paid,
    stripe_credentials_configured,
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

def scholarship_announcement_content():
    content, _ = ScholarshipAnnouncementContent.objects.get_or_create(key="main")
    return content


def scholarship_round_is_public(award_round):
    content = scholarship_announcement_content()
    if award_round < content.announcement_round:
        return True
    return (
        award_round == content.announcement_round
        and content.is_active
        and timezone.now() >= content.announcement_at
    )


def create_winner_for_application(application):
    existing_winner = ScholarshipWinner.objects.filter(application=application).first()
    module_labels = dict(BursaryApplication.PreferredModule.choices)
    modules = [
        module_labels[module]
        for module in application.preferred_modules
        if module in module_labels
    ]
    first_name = application.preferred_name.strip() or application.first_name.strip()
    if existing_winner:
        existing_winner.name = f"{first_name} {application.last_name.strip()}".strip()
        existing_winner.award = ", ".join(modules)
        existing_winner.country = application.country
        existing_winner.modules = modules
        existing_winner.save(update_fields=["name", "award", "country", "modules", "updated_at"])
        return
    display_order = (
        ScholarshipWinner.objects.filter(award_round=application.award_round)
        .aggregate(max_order=Max("display_order"))["max_order"]
        or 0
    ) + 1
    ScholarshipWinner.objects.create(
        application=application,
        name=f"{first_name} {application.last_name.strip()}".strip(),
        award=", ".join(modules),
        country=application.country,
        modules=modules,
        award_round=application.award_round,
        display_order=display_order,
        is_published=application.approved_media_use_consent,
    )


def approved_membership_for_user(user, for_update=False):
    if not user.is_authenticated:
        return None
    queryset = Application.objects.filter(
        Q(approved_user=user) | Q(applicant=user) | Q(email__iexact=user.email),
        status=Application.Status.APPROVED,
    )
    if for_update:
        queryset = queryset.select_for_update()
    return queryset.order_by("-approved_at", "-pk").first()


def bursary_payload_from_request(request):
    raw_payload = request.data.get("payload")
    if raw_payload is None:
        return request.data
    try:
        payload = json.loads(raw_payload)
    except (TypeError, ValueError) as error:
        raise ValueError("The bursary application payload is invalid.") from error
    if not isinstance(payload, dict):
        raise ValueError("The bursary application payload is invalid.")
    if request.FILES.get("identityDocument"):
        payload["identityDocument"] = request.FILES["identityDocument"]
    if request.FILES.get("applicantPhoto"):
        payload["applicantPhoto"] = request.FILES["applicantPhoto"]
    return payload


def deliver_bursary_approval_email(application_id, message=""):
    application = BursaryApplication.objects.filter(pk=application_id).first()
    if application is None or application.approval_email_sent_at is not None:
        return

    recipient_name = application.preferred_name.strip() or application.first_name
    try:
        send_graph_bursary_approval_email(
            recipient=application.email,
            name=recipient_name,
            application_reference=application.application_reference,
            pathway=application.get_bursary_selection_display(),
            message=message,
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
            pathway=application.get_bursary_selection_display(),
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


def deliver_bursary_needs_information_email(application_id, message, recipient):
    application = BursaryApplication.objects.filter(pk=application_id).first()
    if application is None or application.status != BursaryApplication.Status.NEEDS_INFORMATION:
        return
    recipient_name = application.preferred_name.strip() or application.first_name
    try:
        send_graph_bursary_needs_information_email(
            recipient=recipient,
            name=recipient_name,
            application_reference=application.application_reference,
            edit_token=make_bursary_edit_token(application),
            pathway=application.get_bursary_selection_display(),
            message=message,
        )
    except GraphMailError:
        logger.exception(
            "Microsoft Graph could not send the bursary information-request email for application %s.",
            application.application_reference,
        )


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
    if application.submitted_by_id:
        recipient_ids.add(application.submitted_by_id)
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
    if application.status in (
        BursaryApplication.Status.REJECTED,
        BursaryApplication.Status.NEEDS_INFORMATION,
    ) and rejection_reason:
        message = f"{message} Reason: {rejection_reason}"

    UserNotification.objects.bulk_create([
        UserNotification(
            recipient=recipient,
            notification_type="bursary_application",
            title=titles[application.status],
            message=message[:2000],
            target_url=(
                f"/bursary-scholarship-application?applicationReference={application.application_reference}"
                if application.status == BursaryApplication.Status.NEEDS_INFORMATION
                else "/user/scholarships"
            ),
        )
        for recipient in recipients
    ])


def owned_bursary_applications(user):
    membership_references = Application.objects.filter(
        Q(applicant=user) | Q(approved_user=user) | Q(email__iexact=user.email),
    ).values_list("application_reference", flat=True)
    return BursaryApplication.objects.filter(
        Q(submitted_by=user)
        | Q(payment_plan__portal_user=user)
        | Q(membership_reference__in=membership_references)
        | Q(email__iexact=user.email),
    ).distinct()


class ScholarshipContentView(APIView):
    permission_classes = [permissions.AllowAny]

    public_pathway_ids = {"chartered", "pmo", "apm"}

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
        modules = [
            module
            for module in (pathways_content.modules if pathways_active else [])
            if isinstance(module, dict) and module.get("is_active", True) is not False
        ]
        pages = [
            page
            for page in (pathways_content.pages if pathways_active else [])
            if (
                isinstance(page, dict)
                and page.get("is_active", True) is not False
                and page.get("id") in self.public_pathway_ids
            )
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
            "modules": modules,
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

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        authenticated_user = request.user if request.user.is_authenticated else None
        membership_application = approved_membership_for_user(request.user, for_update=True)
        try:
            payload = bursary_payload_from_request(request)
        except ValueError as error:
            return Response({"detail": str(error)}, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(data=payload)
        serializer.context["membership_application"] = membership_application
        serializer.context["submitted_by"] = authenticated_user
        serializer.is_valid(raise_exception=True)
        submitted_email = serializer.validated_data["personalDetails"]["email"]
        existing_filter = Q(email__iexact=submitted_email)
        if authenticated_user:
            existing_filter |= Q(submitted_by=authenticated_user)
        if membership_application:
            existing_filter |= Q(
                membership_reference__iexact=membership_application.application_reference,
            )
        existing = BursaryApplication.objects.filter(existing_filter).order_by(
            "-submitted_at", "-pk",
        ).first()
        if existing:
            return Response({
                "detail": (
                    "A bursary application already exists for this applicant. "
                    "It can only be edited when its status is Needs information."
                ),
                "applicationReference": existing.application_reference,
                "status": existing.status,
            }, status=status.HTTP_409_CONFLICT)

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

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


class BursaryApplicationCurrentView(APIView):
    permission_classes = [permissions.AllowAny]

    def get_authenticators(self):
        # This explicit bearer credential works even with an expired login cookie.
        # It is validated below for both reads and writes, independently of accounts.
        if self.request.headers.get("X-Bursary-Edit-Token"):
            return []
        return super().get_authenticators()

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        response["Cache-Control"] = "no-store"
        return response

    def _request_application(self, request, for_update=False):
        reference = request.query_params.get("applicationReference", "").strip()
        token = request.headers.get("X-Bursary-Edit-Token", "")
        if not token:
            if not request.user.is_authenticated:
                raise NotAuthenticated("Sign in or use the secure link in your information-request email.")
            return self._selected_application(request.user, reference, for_update=for_update)

        invalid_link = "This edit link is invalid, expired, or no longer active. Please contact IPC for a new link."
        try:
            payload = read_bursary_edit_token(token)
        except signing.BadSignature:
            raise PermissionDenied(invalid_link)
        if not isinstance(payload, dict) or type(payload.get("application_id")) is not int:
            raise PermissionDenied(invalid_link)
        queryset = BursaryApplication.objects.all()
        if for_update:
            queryset = queryset.select_for_update()
        application = queryset.filter(pk=payload["application_id"]).first()
        if (
            application is None
            or application.status != BursaryApplication.Status.NEEDS_INFORMATION
            or payload.get("revision") is None
            or payload["revision"] != bursary_edit_revision(application)
            or (reference and reference.casefold() != application.application_reference.casefold())
        ):
            raise PermissionDenied(invalid_link)
        return application

    @staticmethod
    def _selected_application(user, application_reference="", for_update=False):
        queryset = owned_bursary_applications(user)
        if for_update:
            queryset = queryset.select_for_update()
        if application_reference:
            return queryset.filter(
                application_reference__iexact=application_reference,
            ).first()
        editable = queryset.filter(
            status=BursaryApplication.Status.NEEDS_INFORMATION,
        ).order_by("-updated_at", "-pk").first()
        return editable or queryset.order_by("-submitted_at", "-pk").first()

    def get(self, request):
        application = self._request_application(request)
        if application is None:
            return Response({
                "hasApplication": False,
                "editable": False,
                "applicationReference": "",
                "status": None,
                "statusLabel": "",
                "updatedAt": None,
                "values": None,
            })

        editable = application.status == BursaryApplication.Status.NEEDS_INFORMATION
        return Response({
            "hasApplication": True,
            "editable": editable,
            "resubmissionStatus": application.resubmission_status if editable else None,
            "applicationReference": application.application_reference,
            "status": application.status,
            "statusLabel": application.get_status_display(),
            "updatedAt": application.updated_at,
            "values": (
                bursary_application_to_public_values(application)
                if editable
                else None
            ),
        })

    @transaction.atomic
    def patch(self, request):
        application = self._request_application(request, for_update=True)
        if (
            application is None
            or application.status != BursaryApplication.Status.NEEDS_INFORMATION
        ):
            return Response(
                {"detail": "This bursary application is not open for editing."},
                status=status.HTTP_409_CONFLICT,
            )

        try:
            payload = bursary_payload_from_request(request)
        except ValueError as error:
            return Response({"detail": str(error)}, status=status.HTTP_400_BAD_REQUEST)
        serializer = BursaryApplicationPublicSerializer(
            application,
            data=payload,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        application = serializer.save(
            changed_by=request.user if request.user.is_authenticated else None,
        )
        if application.status == BursaryApplication.Status.APPROVED:
            create_winner_for_application(application)
        create_bursary_status_notifications(application)

        def notify():
            applicant_name = f"{application.first_name} {application.last_name}".strip()
            create_admin_notifications(
                notification_type=AdminNotification.NotificationType.BURSARY_APPLICATION,
                title="Bursary application resubmitted",
                message=(
                    f"{applicant_name} resubmitted requested information for "
                    f"{application.application_reference}."
                ),
                source_type="bursary_application",
                source_id=application.pk,
                target_url=f"/admin/bursary-applications/{application.pk}",
            )
            send_mail(
                "IPC bursary application update received",
                (
                    f"Dear {application.first_name},\n\n"
                    "We have received the updated information for your IPC bursary application.\n"
                    f"Application reference: {application.application_reference}\n\n"
                    + (
                        "Your application remains approved. The requested update is complete."
                        if application.status == BursaryApplication.Status.APPROVED
                        else "Your application is now back under review."
                    )
                ),
                settings.DEFAULT_FROM_EMAIL,
                [application.email],
                fail_silently=True,
            )

        transaction.on_commit(notify)
        return Response(BursaryApplicationPublicSerializer(application).data)


class BursaryApplicationPagination(PageNumberPagination):
    page_size = 15
    page_size_query_param = "page_size"
    max_page_size = 50


class ScholarshipAnnouncementContentView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "scholarship_announcement"

    def get(self, request):
        return Response(
            ScholarshipAnnouncementContentSerializer(scholarship_announcement_content()).data
        )


class ScholarshipAnnouncementRecipientsView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "scholarship_announcement"

    def get(self, request):
        requested_round = request.query_params.get("round")
        if requested_round is None:
            requested_round = str(scholarship_announcement_content().announcement_round)
        if requested_round not in {"1", "2"}:
            return Response(
                {"detail": "Round must be 1 or 2."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        award_round = int(requested_round)
        if not scholarship_round_is_public(award_round):
            return Response([])
        recipients = ScholarshipWinner.objects.select_related("application").filter(
            award_round=award_round,
            is_published=True,
        ).order_by("display_order", "name", "pk")
        return Response(ScholarshipAnnouncementRecipientSerializer(recipients, many=True).data)


class ScholarshipAnnouncementRecipientPhotoView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "scholarship_announcement"

    def get(self, request, pk):
        try:
            winner = ScholarshipWinner.objects.select_related("application").get(
                pk=pk,
                is_published=True,
            )
        except ScholarshipWinner.DoesNotExist as error:
            raise Http404("Recipient photo not found.") from error
        if not scholarship_round_is_public(winner.award_round):
            raise Http404("Recipient photo not found.")
        application = winner.application
        if not application or not application.professional_headshot_consent:
            raise Http404("Recipient photo not found.")
        if not application.applicant_photo:
            raise Http404("Recipient photo not found.")
        return FileResponse(application.applicant_photo.open("rb"), as_attachment=False)


class AdminScholarshipAnnouncementContentView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        return Response(
            ScholarshipAnnouncementContentSerializer(scholarship_announcement_content()).data
        )

    @transaction.atomic
    def patch(self, request):
        content = ScholarshipAnnouncementContent.objects.select_for_update().get(key="main")
        serializer = ScholarshipAnnouncementContentSerializer(
            content,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save(updated_by=request.user)
        return Response(serializer.data)


class AdminScholarshipWinnerViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AdminScholarshipWinnerSerializer
    pagination_class = None
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "award", "country", "category", "application__application_reference"]
    ordering_fields = ["award_round", "award_year", "display_order", "name", "created_at"]
    ordering = ["award_round", "display_order", "name"]

    def get_queryset(self):
        queryset = ScholarshipWinner.objects.select_related("application")
        award_round = self.request.query_params.get("round")
        published = self.request.query_params.get("published")
        if award_round in {"1", "2"}:
            queryset = queryset.filter(award_round=int(award_round))
        if published in {"true", "false"}:
            queryset = queryset.filter(is_published=published == "true")
        return queryset


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
        "status",
        "award_round",
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
        award_round = params.get("award_round")
        date_from = params.get("date_from")
        date_to = params.get("date_to")
        if status_value in BursaryApplication.Status.values:
            queryset = queryset.filter(status=status_value)
        if pathway in BursaryApplication.PreferredModule.values:
            queryset = queryset.filter(preferred_modules__contains=[pathway])
        if employed in ("true", "false"):
            queryset = queryset.filter(currently_employed=employed == "true")
        if country:
            queryset = queryset.filter(country__iexact=country.strip())
        if award_round in {str(value) for value in BursaryApplication.AwardRound.values}:
            queryset = queryset.filter(award_round=int(award_round))
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
        response.data["google_sheet_url"] = bursary_google_sheet_url()
        return response

    @action(detail=False, methods=["post"], url_path="sync-google-sheet")
    def sync_google_sheet(self, request):
        if not bursary_google_sheets_configured():
            return Response(
                {"detail": "Bursary Google Sheets sync is not fully configured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        try:
            count = sync_bursary_google_sheet()
        except Exception:
            logger.exception("An administrator could not sync Bursary applications to Google Sheets.")
            return Response(
                {"detail": "The Google Sheet could not be updated."},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        return Response({
            "synced": count,
            "google_sheet_url": bursary_google_sheet_url(),
        })

    @action(detail=False, methods=["post"], url_path="sync-payment-plan-google-sheet")
    def sync_payment_plan_google_sheet(self, request):
        if not bursary_payment_plan_google_sheets_configured():
            return Response(
                {"detail": "Bursary payment-plan Google Sheets sync is not fully configured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        try:
            count = sync_bursary_payment_plan_sheet()
        except Exception:
            logger.exception("An administrator could not sync payment plans to Google Sheets.")
            return Response(
                {"detail": "The payment-plan Google Sheet could not be updated."},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        return Response({"synced": count})

    @action(detail=False, methods=["get"], url_path="export")
    def export_csv(self, request):
        applications = self.filter_queryset(self.get_queryset()).prefetch_related(None)

        response = HttpResponse(content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = (
            f'attachment; filename="bursary-applications-{timezone.localdate().isoformat()}.csv"'
        )
        response.write("\ufeff")
        writer = csv.writer(response)
        writer.writerow(BURSARY_EXPORT_HEADERS)

        for application in applications.iterator(chunk_size=500):
            writer.writerow(bursary_export_row(application))
        return response

    @action(detail=True, methods=["get"], url_path="identity-document")
    def identity_document(self, request, pk=None):
        application = self.get_object()
        if not application.identity_document:
            raise Http404("Identity document not found.")
        return FileResponse(
            application.identity_document.open("rb"),
            as_attachment=True,
            filename=application.identity_document.name.rsplit("/", 1)[-1],
        )

    @action(detail=True, methods=["get"], url_path="applicant-photo")
    def applicant_photo(self, request, pk=None):
        application = self.get_object()
        if not application.applicant_photo:
            raise Http404("Applicant photo not found.")
        return FileResponse(application.applicant_photo.open("rb"), as_attachment=False)

    def _payment_plan_defaults(self, application):
        labels = dict(BursaryApplication.PreferredModule.choices)
        total_payable = Decimal("0.00")
        for module in application.preferred_modules:
            cost, percentage = BURSARY_MODULE_PRICING.get(module, (0, 0))
            payable_override = BURSARY_MODULE_PAYABLE_OVERRIDE.get(module)
            payable = payable_override if payable_override is not None else cost * (100 - percentage) / 100
            total_payable += Decimal(str(payable))
        return {
            "approved_modules": [labels[module] for module in application.preferred_modules if module in labels],
            "amount_payable": total_payable,
        }

    @action(detail=True, methods=["get", "put"], url_path="payment-plan")
    @transaction.atomic
    def payment_plan(self, request, pk=None):
        application = self.get_object()
        plan = BursaryPaymentPlan.objects.filter(application=application).prefetch_related("installments").first()
        if request.method == "GET":
            return Response({
                "payment_plan": BursaryPaymentPlanSerializer(plan).data if plan else None,
                "defaults": self._payment_plan_defaults(application),
            })
        if application.status != BursaryApplication.Status.APPROVED:
            return Response(
                {"detail": "Approve the bursary application before creating its payment plan."},
                status=status.HTTP_409_CONFLICT,
            )
        serializer = BursaryPaymentPlanSerializer(
            plan,
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        if plan:
            plan = serializer.save(updated_by=request.user)
        else:
            plan = serializer.save(application=application, created_by=request.user, updated_by=request.user)
        plan.refresh_from_db()
        return Response(BursaryPaymentPlanSerializer(plan).data)

    @action(detail=True, methods=["post"], url_path="payment-plan/offer")
    @transaction.atomic
    def offer_payment_plan(self, request, pk=None):
        application = self.get_object()
        plan = get_object_or_404(
            BursaryPaymentPlan.objects.select_for_update().prefetch_related("installments"),
            application=application,
        )
        if plan.status not in {
            BursaryPaymentPlan.Status.DRAFT,
            BursaryPaymentPlan.Status.OFFERED,
        }:
            return Response(
                {"detail": "Only a draft or offered payment plan can be emailed."},
                status=status.HTTP_409_CONFLICT,
            )
        plan.full_clean()
        if plan.status == BursaryPaymentPlan.Status.DRAFT:
            plan.status = BursaryPaymentPlan.Status.OFFERED
            plan.offered_at = timezone.now()
        plan.updated_by = request.user
        plan.save(update_fields=["status", "offered_at", "updated_by", "updated_at"])
        try:
            message_id = deliver_payment_plan_offer(plan)
        except GraphMailError as error:
            plan.offer_email_error = str(error)
            plan.save(update_fields=["offer_email_error", "updated_at"])
            return Response(
                {
                    "detail": (
                        "The plan was offered, but its email could not be sent. "
                        "Check the email configuration and resend it."
                    )
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        plan.offer_email_sent_at = timezone.now()
        plan.offer_email_message_id = message_id or ""
        plan.offer_email_error = ""
        plan.save(update_fields=[
            "offer_email_sent_at", "offer_email_message_id", "offer_email_error", "updated_at",
        ])
        plan.refresh_from_db()
        return Response(BursaryPaymentPlanSerializer(plan).data)

    @action(detail=True, methods=["patch"], url_path="status")
    @transaction.atomic
    def update_status(self, request, pk=None):
        target = self.get_object()
        application = BursaryApplication.objects.select_for_update().get(pk=target.pk)
        previous = application.status
        if previous == BursaryApplication.Status.REJECTED:
            return Response(
                {"detail": "Rejected applications are final and cannot be changed."},
                status=status.HTTP_409_CONFLICT,
            )

        serializer = BursaryApplicationStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data["status"]
        assigned_reviewer_supplied = "assigned_reviewer" in serializer.validated_data
        assigned_reviewer = serializer.validated_data.get("assigned_reviewer")
        internal_reason = serializer.validated_data.get("internal_reason", "").strip()

        if previous == BursaryApplication.Status.APPROVED and not (
            new_status == BursaryApplication.Status.NEEDS_INFORMATION
            and application.can_request_information
        ):
            return Response(
                {"detail": "An approved application can be reopened for information only once."},
                status=status.HTTP_409_CONFLICT,
            )
        if (
            new_status == BursaryApplication.Status.NEEDS_INFORMATION
            and new_status != previous
            and not application.can_request_information
        ):
            return Response(
                {"detail": "The one information request after approval has already been used."},
                status=status.HTTP_409_CONFLICT,
            )
        if (
            previous == BursaryApplication.Status.NEEDS_INFORMATION
            and application.resubmission_status == BursaryApplication.Status.APPROVED
            and new_status != previous
        ):
            return Response(
                {"detail": "This approved application will return to Approved when the applicant resubmits."},
                status=status.HTTP_409_CONFLICT,
            )

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
            if new_status == BursaryApplication.Status.APPROVED:
                create_winner_for_application(application)
            if (
                new_status == BursaryApplication.Status.APPROVED
                and application.approval_email_sent_at is None
            ):
                transaction.on_commit(
                    lambda application_id=application.pk, message=internal_reason:
                        deliver_bursary_approval_email(application_id, message)
                )
            if (
                new_status == BursaryApplication.Status.REJECTED
                and application.rejection_email_sent_at is None
            ):
                transaction.on_commit(
                    lambda application_id=application.pk, reason=internal_reason:
                        deliver_bursary_rejection_email(application_id, reason)
            )
            if new_status == BursaryApplication.Status.NEEDS_INFORMATION:
                account_emails = []
                if application.submitted_by and application.submitted_by.email:
                    account_emails.append(application.submitted_by.email)
                if application.membership_reference:
                    account_emails.extend(get_user_model().objects.filter(
                        Q(
                            membership_application__application_reference__iexact=application.membership_reference
                        )
                        | Q(
                            membership_applications__application_reference__iexact=application.membership_reference
                        )
                    ).exclude(email="").values_list("email", flat=True).distinct())
                email_recipients = list(dict.fromkeys([
                    application.email,
                    *account_emails,
                ]))
                for recipient in email_recipients:
                    transaction.on_commit(
                        lambda application_id=application.pk, message=internal_reason, email=recipient:
                            deliver_bursary_needs_information_email(application_id, message, email)
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


class BursaryPaymentPlanDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_plan(self, request, public_id):
        return get_object_or_404(
            BursaryPaymentPlan.objects.select_related("application").prefetch_related("installments"),
            public_id=public_id,
            application__in=owned_bursary_applications(request.user),
        )

    def get(self, request, public_id):
        return Response(BursaryPaymentPlanPublicSerializer(self.get_plan(request, public_id)).data)


class PaymentPortalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        plans = (
            BursaryPaymentPlan.objects.filter(portal_user=request.user)
            .select_related("application")
            .prefetch_related("installments")
            .order_by("-created_at")
        )
        return Response({"plans": BursaryPaymentPlanPublicSerializer(plans, many=True).data})


class BursaryPaymentPlanAcceptView(BursaryPaymentPlanDetailView):
    @transaction.atomic
    def post(self, request, public_id):
        plan = BursaryPaymentPlan.objects.select_for_update().select_related("application").filter(
            public_id=public_id,
            application__in=owned_bursary_applications(request.user),
        ).first()
        if not plan:
            raise Http404("Payment plan not found.")
        if plan.status == BursaryPaymentPlan.Status.ACCEPTED:
            return Response(BursaryPaymentPlanPublicSerializer(plan).data)
        if plan.status != BursaryPaymentPlan.Status.OFFERED:
            return Response(
                {"detail": "This payment plan is not available for acceptance."},
                status=status.HTTP_409_CONFLICT,
            )
        if plan.offer_expires_at and plan.offer_expires_at <= timezone.now():
            plan.status = BursaryPaymentPlan.Status.EXPIRED
            plan.save(update_fields=["status", "updated_at"])
            return Response({"detail": "This payment plan has expired."}, status=status.HTTP_409_CONFLICT)
        if request.data.get("terms_accepted") is not True:
            return Response({"terms_accepted": "Accept the payment-plan terms to continue."}, status=400)
        plan.status = BursaryPaymentPlan.Status.ACCEPTED
        plan.accepted_at = timezone.now()
        plan.save(update_fields=["status", "accepted_at", "updated_at"])
        return Response(BursaryPaymentPlanPublicSerializer(plan).data)


class BursaryPaymentPlanCheckoutView(BursaryPaymentPlanDetailView):
    def post(self, request, public_id):
        plan = self.get_plan(request, public_id)
        if plan.status not in {
            BursaryPaymentPlan.Status.ACCEPTED,
            BursaryPaymentPlan.Status.DEPOSIT_PENDING,
        }:
            return Response(
                {"detail": "Accept the payment plan before starting checkout."},
                status=status.HTTP_409_CONFLICT,
            )
        try:
            session = create_checkout_session(plan)
        except Exception as exc:
            logger.exception("Stripe Checkout could not be created for payment plan %s.", plan.pk)
            plan.last_stripe_error = str(exc)[:2000]
            plan.save(update_fields=["last_stripe_error", "updated_at"])
            return Response(
                {"detail": "Stripe Checkout is not available. Please contact IPC support."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response({"checkout_url": session.url, "session_id": session.id})


@method_decorator(csrf_exempt, name="dispatch")
class StripeWebhookView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    throttle_classes = []

    def post(self, request):
        if not stripe_credentials_configured():
            return Response({"detail": "Stripe webhook is not configured."}, status=503)
        try:
            import stripe

            event = stripe.Webhook.construct_event(
                request.body,
                request.headers.get("Stripe-Signature", ""),
                settings.STRIPE_WEBHOOK_SECRET,
            )
        except (ValueError, stripe.error.SignatureVerificationError):
            return Response({"detail": "Invalid Stripe webhook signature."}, status=400)

        event_id = event["id"]
        event_type = event["type"]
        record, created = StripeWebhookEvent.objects.get_or_create(
            event_id=event_id,
            defaults={"event_type": event_type},
        )
        if not created and not record.processing_error:
            return Response({"received": True, "duplicate": True})

        obj = event["data"]["object"]
        try:
            if event_type in {"checkout.session.completed", "checkout.session.async_payment_succeeded"}:
                fulfill_checkout_session(obj)
            elif event_type == "checkout.session.async_payment_failed":
                plan_id = (obj.get("metadata") or {}).get("bursary_payment_plan_id")
                plan = BursaryPaymentPlan.objects.filter(pk=plan_id).first()
                if plan:
                    plan.status = BursaryPaymentPlan.Status.ACCEPTED
                    plan.last_stripe_error = "Stripe could not collect the deposit."
                    plan.save(update_fields=["status", "last_stripe_error", "updated_at"])
                    plan.installments.filter(kind=BursaryPaymentInstallment.Kind.DEPOSIT).update(
                        status=BursaryPaymentInstallment.Status.FAILED,
                        failure_message="Stripe could not collect the deposit.",
                    )
            elif event_type == "invoice.paid":
                mark_invoice_paid(obj)
            elif event_type == "invoice.payment_failed":
                mark_invoice_failed(obj)
            elif event_type in {"invoice.finalized", "invoice.sent"}:
                link_invoice_to_installment(obj)
            elif event_type in {"customer.subscription.created", "customer.subscription.updated"}:
                plan_id = (obj.get("metadata") or {}).get("bursary_payment_plan_id")
                plan = BursaryPaymentPlan.objects.filter(pk=plan_id).first()
                if plan:
                    plan.stripe_subscription_id = obj.get("id", "")
                    plan.save(update_fields=["stripe_subscription_id", "updated_at"])
            record.processing_error = ""
            record.save(update_fields=["processing_error"])
        except Exception as exc:
            logger.exception("Stripe webhook %s could not be processed.", event_id)
            record.processing_error = str(exc)[:4000]
            record.save(update_fields=["processing_error"])
            return Response({"detail": "Webhook processing failed."}, status=500)
        return Response({"received": True})
