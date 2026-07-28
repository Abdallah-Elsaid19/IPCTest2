from django.contrib.auth import get_user_model
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from applications.models import Application

from .models import (
    AwardNomination, ClubMembership, ProgrammeEnquiry, ScholarshipApplication,
    SupportTicket, UserNotification, UserPreference, UserProfile,
)


@receiver(post_save, sender=get_user_model(), dispatch_uid="user_panel.create_defaults")
def create_defaults(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)
        UserPreference.objects.get_or_create(user=instance)


STATUS_MODELS = (Application, ScholarshipApplication, AwardNomination, ClubMembership, ProgrammeEnquiry, SupportTicket)


def remember_status(sender, instance, **kwargs):
    instance._panel_previous_status = (
        sender.objects.filter(pk=instance.pk).values_list("status", flat=True).first()
        if instance.pk else None
    )


def notify_status_change(sender, instance, created, **kwargs):
    previous = getattr(instance, "_panel_previous_status", None)
    if previous == instance.status or instance.status == "draft":
        return
    recipient = (
        getattr(instance, "applicant", None)
        or getattr(instance, "user", None)
        or getattr(instance, "requester", None)
    )
    if not recipient:
        return
    label = sender._meta.verbose_name.title()
    UserNotification.objects.create(
        recipient=recipient,
        notification_type=sender._meta.model_name,
        title=f"{label} update",
        message=f"Your {sender._meta.verbose_name} status is now {instance.get_status_display() if hasattr(instance, 'get_status_display') else instance.status}.",
        target_url="/user/dashboard",
    )


for model in STATUS_MODELS:
    pre_save.connect(remember_status, sender=model, dispatch_uid=f"user_panel.remember_status.{model._meta.label_lower}")
    post_save.connect(notify_status_change, sender=model, dispatch_uid=f"user_panel.notify_status.{model._meta.label_lower}")
