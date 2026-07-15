from rest_framework import filters, mixins, permissions, viewsets
from .models import Application
from .serializers import AdminApplicationSerializer, ApplicationSerializer


class ApplicationViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = Application.objects.select_related("membership_grade", "form_definition").all()
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.AllowAny]


class AdminApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = AdminApplicationSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["application_reference", "first_name", "last_name", "email", "organisation"]
    ordering_fields = ["created_at", "updated_at", "submitted_at", "status", "membership_grade__code"]

    def get_queryset(self):
        queryset = Application.objects.select_related("membership_grade", "form_definition", "reviewed_by").prefetch_related(
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
