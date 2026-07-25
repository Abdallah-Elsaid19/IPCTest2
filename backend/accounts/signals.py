from django.db.models.signals import post_save
from django.dispatch import receiver

from applications.models import Application
from contact.models import ContactSubmission
from newsletter.models import NewsletterSignup

from .models import AdminNotification
from .notification_service import create_admin_notifications


@receiver(
    post_save,
    sender=ContactSubmission,
    dispatch_uid="accounts.admin_notification.contact.created",
)
def notify_admins_of_contact(sender, instance, created, **kwargs):
    if not created:
        return
    create_admin_notifications(
        notification_type=AdminNotification.NotificationType.CONTACT,
        title="New contact enquiry",
        message=f"{instance.name} submitted a {instance.category} enquiry.",
        source_type="contact",
        source_id=instance.pk,
        target_url="/admin/enquiries",
    )


@receiver(
    post_save,
    sender=Application,
    dispatch_uid="accounts.admin_notification.application.created",
)
def notify_admins_of_application(sender, instance, created, **kwargs):
    if not created:
        return
    applicant_name = f"{instance.first_name} {instance.last_name}".strip()
    create_admin_notifications(
        notification_type=AdminNotification.NotificationType.APPLICATION,
        title="New membership application",
        message=(
            f"{applicant_name} submitted {instance.application_reference} "
            f"for {instance.membership_grade.code}."
        ),
        source_type="application",
        source_id=instance.pk,
        target_url=f"/admin/applications/{instance.pk}",
    )


@receiver(
    post_save,
    sender=NewsletterSignup,
    dispatch_uid="accounts.admin_notification.subscriber.created",
)
def notify_admins_of_subscriber(sender, instance, created, **kwargs):
    if not created:
        return
    subscriber_name = instance.name.strip() or instance.email
    create_admin_notifications(
        notification_type=AdminNotification.NotificationType.SUBSCRIBER,
        title="New newsletter subscriber",
        message=f"{subscriber_name} subscribed to the IPC newsletter.",
        source_type="subscriber",
        source_id=instance.pk,
        target_url=f"/admin/newsletter/newslettersignup/{instance.pk}/change/",
    )
