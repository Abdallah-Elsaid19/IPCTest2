from dataclasses import dataclass
import logging

from django.core.exceptions import ImproperlyConfigured
from django.db import transaction
from django.utils import timezone
from requests import RequestException

from accounts.graph_mail import GraphMailError, send_membership_refusal_email

from ..models import Application
from .approval import ApprovalConflict


logger = logging.getLogger(__name__)


@dataclass
class RefusalOutcome:
    application: Application
    refusal_email_sent: bool
    refusal_email_error: str | None


def refuse_application(*, application_id: int, refused_by, reason: str) -> RefusalOutcome:
    reason = reason.strip()
    if not reason:
        raise ApprovalConflict("A refusal reason is required.")

    delivery = {"sent": False, "error": None}
    with transaction.atomic():
        application = Application.objects.select_for_update().select_related(
            "membership_grade"
        ).get(pk=application_id)

        if application.status in (Application.Status.APPROVED, Application.Status.REFUSED):
            raise ApprovalConflict(
                "This application has already been completed and cannot be refused again."
            )
        if application.status not in (
            Application.Status.SUBMITTED,
            Application.Status.UNDER_REVIEW,
        ):
            raise ApprovalConflict("This application cannot be refused from its current status.")

        now = timezone.now()
        application.status = Application.Status.REFUSED
        application.refusal_reason = reason
        application.refused_by = refused_by
        application.refused_at = now
        application.reviewed_by = refused_by
        application.reviewed_at = now
        application._changed_by = refused_by
        application._status_note = reason
        application._suppress_status_email = True
        application.save(update_fields=[
            "status", "refusal_reason", "refused_by", "refused_at",
            "reviewed_by", "reviewed_at", "updated_at",
        ])

        def send_after_commit():
            try:
                send_membership_refusal_email(
                    recipient=application.email,
                    name=f"{application.first_name} {application.last_name}".strip(),
                    application_reference=application.application_reference,
                    membership_grade=application.membership_grade.code,
                    reason=reason,
                )
                sent_at = timezone.now()
                updated = Application.objects.filter(
                    pk=application.pk,
                    refusal_email_sent_at__isnull=True,
                ).update(refusal_email_sent_at=sent_at)
                delivery["sent"] = bool(updated)
            except (GraphMailError, ImproperlyConfigured, RequestException) as error:
                delivery["error"] = str(error)
                logger.exception("Refusal email failed for application %s.", application.pk)

        transaction.on_commit(send_after_commit)

    application.refresh_from_db()
    return RefusalOutcome(application, delivery["sent"], delivery["error"])
