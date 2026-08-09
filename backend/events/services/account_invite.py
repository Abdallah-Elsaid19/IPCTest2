import logging
from dataclasses import dataclass

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.db import IntegrityError, transaction
from django.utils import timezone
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from accounts.graph_mail import send_event_account_invite_email
from accounts.models import AdminProfile
from applications.models import Application
from applications.services.approval import generate_unique_ipc_email
from events.models import EventRegistration


logger = logging.getLogger(__name__)
User = get_user_model()


@dataclass
class EventAccountInviteOutcome:
    registration: EventRegistration
    user: object
    account_created: bool


def _name_parts(registration: EventRegistration):
    first_name = registration.contact_first_name.strip()
    last_name = registration.contact_last_name.strip()
    if first_name or last_name:
        return first_name, last_name
    parts = registration.name.strip().split(maxsplit=1)
    return (parts[0] if parts else "", parts[1] if len(parts) > 1 else "")


def _password_setup_url(user) -> str:
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    return (
        f"{settings.FRONTEND_URL.rstrip('/')}/reset-password"
        f"?uid={uid}&token={token}"
    )


def _existing_account_for_email(personal_email: str):
    linked_registration = (
        EventRegistration.objects.filter(
            email__iexact=personal_email,
            registered_user__isnull=False,
        )
        .select_related("registered_user")
        .order_by("-created_at")
        .first()
    )
    if linked_registration:
        return linked_registration.registered_user
    application = (
        Application.objects.filter(
            email__iexact=personal_email,
            approved_user__isnull=False,
        )
        .select_related("approved_user")
        .order_by("-created_at")
        .first()
    )
    return application.approved_user if application else None


def _create_account(registration: EventRegistration):
    first_name, last_name = _name_parts(registration)
    for _attempt in range(100):
        ipc_email = generate_unique_ipc_email(registration.email)
        try:
            with transaction.atomic():
                user = User(
                    username=ipc_email,
                    email=ipc_email,
                    first_name=first_name,
                    last_name=last_name,
                    is_active=True,
                    is_staff=False,
                    is_superuser=False,
                )
                user.set_unusable_password()
                user.save()
                AdminProfile.objects.create(
                    user=user,
                    role=AdminProfile.Role.USER,
                    telephone="",
                )
            return user
        except IntegrityError:
            continue
    raise IntegrityError("A unique IPC event account could not be generated.")


@transaction.atomic
def prepare_event_account(registration_id: int) -> EventAccountInviteOutcome:
    registration = EventRegistration.objects.select_for_update().get(pk=registration_id)
    user = registration.registered_user or _existing_account_for_email(registration.email)
    account_created = user is None
    if user is None:
        user = _create_account(registration)
    EventRegistration.objects.filter(
        email__iexact=registration.email,
        registered_user__isnull=True,
    ).update(registered_user=user)
    registration.registered_user = user
    return EventAccountInviteOutcome(
        registration=registration,
        user=user,
        account_created=account_created,
    )


def send_event_account_invite(registration_id: int) -> EventAccountInviteOutcome:
    outcome = prepare_event_account(registration_id)
    registration = outcome.registration
    user = outcome.user
    send_event_account_invite_email(
        recipient=registration.email,
        name=registration.name,
        event_name=registration.event_name,
        ipc_email=user.email,
        reset_url=_password_setup_url(user),
    )
    sent_at = timezone.now()
    EventRegistration.objects.filter(
        email__iexact=registration.email,
        registered_user=user,
    ).update(account_invite_sent_at=sent_at)
    registration.account_invite_sent_at = sent_at
    return outcome
