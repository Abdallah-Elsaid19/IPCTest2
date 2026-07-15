from django.conf import settings
from django.core.mail import send_mail
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import Application, ApplicationStatusHistory


@receiver(pre_save, sender=Application)
def cache_previous_status(sender, instance, **kwargs):
    if instance.pk:
        previous = sender.objects.filter(pk=instance.pk).values_list("status", flat=True).first()
        instance._previous_status = previous


@receiver(post_save, sender=Application)
def notify_application_status(sender, instance, created, **kwargs):
    if created:
        ApplicationStatusHistory.objects.create(
            application=instance,
            from_status=None,
            to_status=instance.status,
            changed_by=getattr(instance, "_changed_by", None),
            note="Application submitted.",
        )
        send_mail(
            "IPC membership application submitted",
            "Thank you. Your IPC membership application has been received for evidence-based review.",
            settings.DEFAULT_FROM_EMAIL,
            [instance.email, settings.IPC_REVIEW_EMAIL],
            fail_silently=True,
        )
        return
    previous = getattr(instance, "_previous_status", instance.status)
    if previous != instance.status:
        ApplicationStatusHistory.objects.create(
            application=instance,
            from_status=previous,
            to_status=instance.status,
            changed_by=getattr(instance, "_changed_by", None),
            note=getattr(instance, "_status_note", ""),
        )
        if not getattr(instance, "_suppress_status_email", False):
            send_mail(
                "IPC application status updated",
                f"Your IPC application status is now: {instance.get_status_display()}.",
                settings.DEFAULT_FROM_EMAIL,
                [instance.email],
                fail_silently=True,
            )
