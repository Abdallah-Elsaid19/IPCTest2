from django.utils import timezone
from rest_framework import mixins, permissions, serializers, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from .models import AdminNotification


class AdminNotificationSerializer(serializers.ModelSerializer):
    notification_type_label = serializers.CharField(
        source="get_notification_type_display",
        read_only=True,
    )

    class Meta:
        model = AdminNotification
        fields = [
            "id",
            "notification_type",
            "notification_type_label",
            "title",
            "message",
            "source_type",
            "source_id",
            "target_url",
            "is_read",
            "read_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class AdminNotificationPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 50

    def get_paginated_response(self, data):
        return Response({
            "count": self.page.paginator.count,
            "next": self.get_next_link(),
            "previous": self.get_previous_link(),
            "unread_count": self.request.user.admin_notifications.filter(
                is_read=False,
            ).count(),
            "results": data,
        })


class AdminNotificationViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = AdminNotificationSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = AdminNotificationPagination
    throttle_scope = None

    def get_queryset(self):
        queryset = AdminNotification.objects.filter(
            recipient=self.request.user,
        )
        is_read = self.request.query_params.get("is_read")
        if is_read in ("true", "false"):
            queryset = queryset.filter(is_read=is_read == "true")
        notification_type = self.request.query_params.get("type")
        if notification_type in AdminNotification.NotificationType.values:
            queryset = queryset.filter(notification_type=notification_type)
        return queryset

    @action(detail=True, methods=["patch"], url_path="read")
    def read(self, request, pk=None):
        notification = self.get_object()
        notification.mark_read()
        return Response(self.get_serializer(notification).data)

    @action(detail=False, methods=["patch"], url_path="read-all")
    def read_all(self, request):
        updated = self.get_queryset().filter(is_read=False).update(
            is_read=True,
            read_at=timezone.now(),
            updated_at=timezone.now(),
        )
        return Response({"updated": updated, "unread_count": 0})

    @action(detail=False, methods=["get"], url_path="unread-count")
    def unread_count(self, request):
        return Response({
            "unread_count": self.get_queryset().filter(is_read=False).count(),
        })
