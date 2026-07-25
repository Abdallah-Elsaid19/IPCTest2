from django.contrib.auth import get_user_model

from .models import AdminNotification


def create_admin_notifications(
    *,
    notification_type: str,
    title: str,
    message: str,
    source_type: str,
    source_id: int,
    target_url: str,
) -> int:
    """Create one durable notification for every active staff recipient."""
    recipient_ids = list(
        get_user_model().objects.filter(
            is_active=True,
            is_staff=True,
        ).values_list("pk", flat=True)
    )
    notifications = [
        AdminNotification(
            recipient_id=recipient_id,
            notification_type=notification_type,
            title=title,
            message=message,
            source_type=source_type,
            source_id=source_id,
            target_url=target_url,
        )
        for recipient_id in recipient_ids
    ]
    if not notifications:
        return 0
    return len(
        AdminNotification.objects.bulk_create(
            notifications,
            ignore_conflicts=True,
        )
    )
