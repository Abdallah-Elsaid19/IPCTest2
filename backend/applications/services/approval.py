import logging
import re
from dataclasses import dataclass

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ImproperlyConfigured, ValidationError
from django.core.validators import validate_email
from django.db import IntegrityError, transaction
from django.db.models import Q
from django.utils import timezone
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from requests import RequestException

from accounts.graph_mail import (
    GraphMailError,
    send_membership_welcome_email,
)
from accounts.models import AdminProfile
from applications.models import Application


logger = logging.getLogger(__name__)
User = get_user_model()


class ApprovalConflict(Exception):
    pass


@dataclass
class ApprovalOutcome:
    application: Application
    user: object
    welcome_email_sent: bool
    welcome_email_error: str | None


def _normalise_local_part(identifier: str) -> str:
    value = identifier.strip().lower()
    if "@" in value:
        validate_email(value)
        local_part = value.rsplit("@", 1)[0]
    else:
        local_part = value
    local_part = re.sub(r"[^a-z0-9._+-]+", ".", local_part)
    local_part = re.sub(r"\.{2,}", ".", local_part).strip("._+-")
    return local_part or "member"


def generate_unique_ipc_email(identifier: str) -> str:
    local_part = _normalise_local_part(identifier)
    domain = settings.IPC_ACCOUNT_EMAIL_DOMAIN.strip().lower()
    suffix = 1
    while True:
        suffix_text = "" if suffix == 1 else str(suffix)
        candidate = f"{local_part}{suffix_text}@{domain}"
        collision = User.objects.filter(
            Q(email__iexact=candidate) | Q(username__iexact=candidate)
        ).exists()
        if not collision:
            return candidate
        suffix += 1


def _create_standard_user(application: Application):
    requested_username = application.username.strip().lower()
    if requested_username and User.objects.filter(username__iexact=requested_username).exists():
        raise ApprovalConflict(
            "The requested username is no longer available. Update it before approving the application."
        )
    for _attempt in range(100):
        ipc_email = generate_unique_ipc_email(requested_username or application.email)
        try:
            with transaction.atomic():
                user = User(
                    username=requested_username or ipc_email,
                    email=ipc_email,
                    first_name=application.first_name,
                    last_name=application.last_name,
                    is_active=True,
                    is_staff=False,
                    is_superuser=False,
                )
                user.set_unusable_password()
                user.save()
                AdminProfile.objects.create(
                    user=user,
                    role=AdminProfile.Role.USER,
                )
            return user
        except IntegrityError as error:
            if requested_username:
                raise ApprovalConflict(
                    "The requested username is no longer available. Update it before approving the application."
                ) from error
            continue
    raise IntegrityError("A unique IPC account email could not be generated.")


def _password_setup_url(user) -> str:
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    return (
        f"{settings.FRONTEND_URL.rstrip('/')}/reset-password"
        f"?uid={uid}&token={token}"
    )


def _deliver_welcome_email(application: Application, user) -> None:
    send_membership_welcome_email(
        recipient=application.email,
        name=f"{application.first_name} {application.last_name}".strip(),
        application_reference=application.application_reference,
        membership_grade=application.membership_grade.code,
        username=user.username,
        ipc_email=user.email,
        reset_url=_password_setup_url(user),
    )


def approve_application(*, application_id: int, approved_by) -> ApprovalOutcome:
    delivery = {"sent": False, "error": None}

    with transaction.atomic():
        # Lock only the application row. PostgreSQL cannot apply FOR UPDATE to
        # approved_user because that nullable relation is loaded with a LEFT JOIN.
        application = Application.objects.select_for_update().select_related(
            "membership_grade",
        ).get(pk=application_id)

        if application.status == Application.Status.APPROVED:
            raise ApprovalConflict(
                "Approved applications are locked and their status cannot be changed."
            )
        if application.approved_user_id:
            raise ApprovalConflict(
                "This application has already created and linked an IPC user account."
            )
        if application.status not in (
            Application.Status.SUBMITTED,
            Application.Status.UNDER_REVIEW,
        ):
            raise ApprovalConflict("This application cannot be approved from its current status.")

        user = _create_standard_user(application)
        now = timezone.now()
        application.status = Application.Status.APPROVED
        application.approved_user = user
        application.approved_by = approved_by
        application.approved_at = now
        application.account_created_at = user.date_joined
        application.reviewed_by = approved_by
        application.reviewed_at = now
        application._changed_by = approved_by
        application._status_note = "Application approved and IPC account created."
        application._suppress_status_email = True
        application.save(update_fields=[
            "status",
            "approved_user",
            "approved_by",
            "approved_at",
            "account_created_at",
            "reviewed_by",
            "reviewed_at",
            "updated_at",
        ])

        def send_after_commit():
            try:
                _deliver_welcome_email(application, user)
                sent_at = timezone.now()
                Application.objects.filter(
                    pk=application.pk,
                    welcome_email_sent_at__isnull=True,
                ).update(welcome_email_sent_at=sent_at)
                delivery["sent"] = True
            except (
                GraphMailError,
                ImproperlyConfigured,
                RequestException,
            ) as error:
                delivery["error"] = str(error)
                logger.exception(
                    "Welcome email failed for approved application %s.",
                    application.pk,
                )

        transaction.on_commit(send_after_commit)

    application.refresh_from_db()
    return ApprovalOutcome(
        application=application,
        user=user,
        welcome_email_sent=delivery["sent"],
        welcome_email_error=delivery["error"],
    )


def resend_welcome_email(*, application_id: int) -> Application:
    application = Application.objects.select_related(
        "membership_grade",
        "approved_user",
    ).get(pk=application_id)
    if application.status != Application.Status.APPROVED or not application.approved_user_id:
        raise ApprovalConflict("This application does not have a linked approved account.")
    expected_domain = f"@{settings.IPC_ACCOUNT_EMAIL_DOMAIN.strip().lower()}"
    if not application.approved_user.email.lower().endswith(expected_domain):
        raise ApprovalConflict(
            "This legacy account does not use an IPC email and cannot receive the new-account welcome email."
        )

    _deliver_welcome_email(application, application.approved_user)
    application.welcome_email_sent_at = timezone.now()
    application.save(update_fields=["welcome_email_sent_at", "updated_at"])
    return application
