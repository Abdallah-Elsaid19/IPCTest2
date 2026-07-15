from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Count, Window
from django.core.cache import cache
from django.core.exceptions import ImproperlyConfigured
from requests import RequestException
from rest_framework import filters, mixins, permissions, status as http_status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import NotFound
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.utils.urls import remove_query_param, replace_query_param

from accounts.graph_mail import GraphMailError

from .models import Application, ApplicationEvidence
from .serializers import (
    AdminApplicationSerializer,
    AdminApplicationListSerializer,
    ApplicationSerializer,
    ApplicationStatusUpdateSerializer,
)
from .services import (
    ApprovalConflict,
    approve_application,
    resend_welcome_email as resend_membership_welcome_email,
)


class ApplicationViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = Application.objects.select_related("membership_grade", "form_definition").all()
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.AllowAny]


class ApplicationPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50

    def paginate_queryset(self, queryset, request, view=None):
        self.page_size = self.get_page_size(request)
        if not self.page_size:
            return None

        raw_page = request.query_params.get(self.page_query_param, 1)
        try:
            self.page_number = int(raw_page)
            if self.page_number < 1:
                raise ValueError
        except (TypeError, ValueError) as error:
            raise NotFound("Invalid page.") from error

        self.request = request
        self.offset = (self.page_number - 1) * self.page_size
        rows = list(
            queryset.annotate(
                _application_total=Window(expression=Count("pk")),
            )[self.offset:self.offset + self.page_size]
        )
        self.count = int(rows[0]._application_total) if rows else 0
        self.result_count = len(rows)
        return rows

    def get_next_link(self):
        if self.offset + self.result_count >= self.count:
            return None
        url = self.request.build_absolute_uri()
        return replace_query_param(url, self.page_query_param, self.page_number + 1)

    def get_previous_link(self):
        if self.page_number <= 1:
            return None
        url = self.request.build_absolute_uri()
        if self.page_number == 2:
            return remove_query_param(url, self.page_query_param)
        return replace_query_param(url, self.page_query_param, self.page_number - 1)

    def get_paginated_response(self, data):
        return Response({
            "count": self.count,
            "next": self.get_next_link(),
            "previous": self.get_previous_link(),
            "results": data,
        })


class AdminApplicationViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = AdminApplicationSerializer
    pagination_class = ApplicationPagination
    permission_classes = [permissions.IsAdminUser]
    throttle_scope = None
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "application_reference",
        "first_name",
        "last_name",
        "username",
        "email",
        "organisation",
        "membership_grade__code",
    ]
    ordering_fields = ["created_at", "updated_at", "submitted_at", "status", "membership_grade__code"]

    def get_serializer_class(self):
        if self.action == "list":
            return AdminApplicationListSerializer
        return AdminApplicationSerializer

    def get_queryset(self):
        if self.action == "list":
            queryset = Application.objects.select_related(
                "membership_grade",
                "approved_user",
            ).only(
                "id",
                "application_reference",
                "first_name",
                "last_name",
                "username",
                "email",
                "organisation",
                "status",
                "submitted_at",
                "created_at",
                "membership_grade_id",
                "membership_grade__code",
                "approved_user_id",
                "approved_user__email",
            )
        else:
            queryset = Application.objects.select_related(
                "membership_grade", "form_definition", "reviewed_by", "approved_by", "approved_user",
            ).prefetch_related(
                "evidence_files", "references", "reviewer_notes", "status_history"
            )
        status = self.request.query_params.get("status")
        grade = self.request.query_params.get("grade")
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")
        if status:
            queryset = queryset.filter(status=status)
        if grade:
            queryset = queryset.filter(membership_grade__code=grade)
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
        return queryset

    @action(detail=True, methods=["patch"], url_path="status")
    def status(self, request, pk=None):
        current = get_object_or_404(Application, pk=pk)
        if current.status == Application.Status.APPROVED:
            return Response(
                {"detail": "Approved applications are locked and their status cannot be changed."},
                status=http_status.HTTP_409_CONFLICT,
            )

        status_validator = ApplicationStatusUpdateSerializer(
            current,
            data=request.data,
            context={"request": request},
        )
        status_validator.is_valid(raise_exception=True)
        requested_status = status_validator.validated_data["status"]
        if requested_status == Application.Status.APPROVED:
            try:
                outcome = approve_application(
                    application_id=current.pk,
                    approved_by=request.user,
                )
            except ApprovalConflict as error:
                return Response(
                    {"detail": str(error)},
                    status=http_status.HTTP_409_CONFLICT,
                )
            cache.delete("ipc:admin-dashboard:v2")
            payload = AdminApplicationSerializer(
                self.get_queryset().get(pk=outcome.application.pk),
                context={"request": request},
            ).data
            payload["welcome_email_sent"] = outcome.welcome_email_sent
            payload["welcome_email_error"] = outcome.welcome_email_error
            return Response(payload)

        allowed_transitions = {
            Application.Status.SUBMITTED: {
                Application.Status.SUBMITTED,
                Application.Status.UNDER_REVIEW,
            },
            Application.Status.UNDER_REVIEW: {
                Application.Status.UNDER_REVIEW,
            },
        }
        if requested_status not in allowed_transitions.get(current.status, set()):
            return Response(
                {"detail": "This status transition is not allowed."},
                status=http_status.HTTP_409_CONFLICT,
            )

        with transaction.atomic():
            application = get_object_or_404(
                Application.objects.select_for_update(),
                pk=pk,
            )
            serializer = ApplicationStatusUpdateSerializer(
                application,
                data=request.data,
                context={"request": request},
            )
            serializer.is_valid(raise_exception=True)
            application = serializer.save()
            cache.delete("ipc:admin-dashboard:v2")

        application = self.get_queryset().get(pk=application.pk)

        return Response(
            AdminApplicationSerializer(
                application,
                context={"request": request},
            ).data
        )

    @action(
        detail=True,
        methods=["post"],
        url_path="resend-welcome-email",
        throttle_classes=[ScopedRateThrottle],
        throttle_scope="admin_password_reset",
    )
    def resend_welcome_email(self, request, pk=None):
        get_object_or_404(Application, pk=pk)
        try:
            application = resend_membership_welcome_email(application_id=int(pk))
        except ApprovalConflict as error:
            return Response(
                {"detail": str(error)},
                status=http_status.HTTP_409_CONFLICT,
            )
        except (GraphMailError, ImproperlyConfigured, RequestException):
            return Response(
                {"detail": "The welcome email could not be sent. Check the Microsoft Graph configuration."},
                status=http_status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response(
            AdminApplicationSerializer(
                self.get_queryset().get(pk=application.pk),
                context={"request": request},
            ).data
        )

    @action(
        detail=True,
        methods=["get"],
        url_path=r"evidence/(?P<evidence_id>\d+)",
    )
    def evidence(self, request, pk=None, evidence_id=None):
        application = self.get_object()
        evidence = get_object_or_404(
            ApplicationEvidence,
            pk=evidence_id,
            application=application,
        )
        content_type = evidence.content_type or "application/octet-stream"
        response = FileResponse(
            evidence.file.open("rb"),
            content_type=content_type,
            as_attachment=content_type != "application/pdf",
            filename=evidence.original_name or None,
        )
        response["Cache-Control"] = "private, no-store"
        response["X-Content-Type-Options"] = "nosniff"
        return response
