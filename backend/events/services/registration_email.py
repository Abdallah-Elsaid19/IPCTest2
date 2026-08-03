import logging
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone

from events.models import EventRegistration
from ipc_backend.email_branding import add_ipc_logo

logger = logging.getLogger(__name__)


def registration_urls(registration):
    base = settings.FRONTEND_URL.rstrip("/")
    query = f"?token={registration.access_token}"
    return {
        "view_url": f"{base}/events/registration/{registration.reference}{query}",
        "calendar_url": f"{base}/events/registration/{registration.reference}/calendar{query}",
    }


def send_registration_confirmation(registration_id):
    registration = EventRegistration.objects.select_related("event").prefetch_related("attendees").get(pk=registration_id)
    urls = registration_urls(registration)
    event = registration.event
    try:
        event_timezone = ZoneInfo(event.timezone if event else "Europe/London")
    except ZoneInfoNotFoundError:
        event_timezone = ZoneInfo("Europe/London")
    local_start = event.starts_at.astimezone(event_timezone) if event and event.starts_at else None
    local_end = event.ends_at.astimezone(event_timezone) if event and event.ends_at else None
    context = {
        "registration": registration,
        "event": event,
        "event_date": local_start.strftime("%d %b %Y") if local_start else "To be confirmed",
        "event_time": (
            f"{local_start:%H:%M}–{local_end:%H:%M} ({event.timezone})"
            if local_start and local_end else f"{local_start:%H:%M} ({event.timezone})" if local_start else "To be confirmed"
        ),
        **urls,
    }
    try:
        message = EmailMultiAlternatives(
            subject=f"Registration confirmed — {registration.event_name} — {registration.reference}",
            body=render_to_string("events/emails/registration_confirmation.txt", context),
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[registration.email],
            reply_to=[getattr(settings, "EVENT_SUPPORT_EMAIL", settings.IPC_REVIEW_EMAIL)],
        )
        message.attach_alternative(
            add_ipc_logo(render_to_string("events/emails/registration_confirmation.html", context)),
            "text/html",
        )
        message.send(fail_silently=False)
    except Exception as exc:  # Email failure must never invalidate a confirmed booking.
        logger.exception("Could not send event confirmation %s", registration.reference)
        EventRegistration.objects.filter(pk=registration_id).update(
            confirmation_email_status=EventRegistration.EmailStatus.FAILED,
            confirmation_email_error=str(exc)[:1000],
        )
        return False
    EventRegistration.objects.filter(pk=registration_id).update(
        confirmation_email_status=EventRegistration.EmailStatus.SENT,
        confirmation_email_sent_at=timezone.now(),
        confirmation_email_error="",
    )
    return True
