from django.core.cache import cache
from django.http import Http404
from rest_framework import filters, mixins, permissions, viewsets
from rest_framework.generics import RetrieveAPIView

from .models import MembershipContent, MembershipGrade
from .serializers import AdminMembershipGradeSerializer, MembershipContentSerializer, MembershipGradeSerializer


class MembershipContentView(RetrieveAPIView):
    serializer_class = MembershipContentSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        content = MembershipContent.objects.filter(key="main", is_active=True, status=MembershipContent.Status.PUBLISHED).first()
        if content is None:
            raise Http404("Membership content is not available.")
        return content


class MembershipGradeViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = MembershipGrade.objects.filter(is_active=True).prefetch_related("benefits", "requirements")
    serializer_class = MembershipGradeSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "code"


class AdminMembershipGradeViewSet(viewsets.ModelViewSet):
    queryset = MembershipGrade.objects.prefetch_related("benefits", "requirements").all()
    serializer_class = AdminMembershipGradeSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["code", "title", "short_title", "description", "post_nominal"]
    ordering_fields = ["display_order", "title", "created_at", "updated_at"]
    http_method_names = ["get", "post", "put", "patch", "head", "options"]

    def get_queryset(self):
        queryset = super().get_queryset()
        active = self.request.query_params.get("active")
        if active in ("true", "false"):
            queryset = queryset.filter(is_active=active == "true")
        return queryset

    @staticmethod
    def _clear_dashboard_cache():
        cache.delete("ipc:admin-dashboard:v2")

    def perform_create(self, serializer):
        serializer.save()
        self._clear_dashboard_cache()

    def perform_update(self, serializer):
        serializer.save()
        self._clear_dashboard_cache()
