from dataclasses import dataclass
from decimal import Decimal

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.db import IntegrityError, transaction
from django.db.models import Q
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from accounts.graph_mail import send_bursary_payment_plan_offer_email
from accounts.models import AdminProfile
from applications.models import Application
from applications.services.approval import generate_unique_ipc_email

from .models import BursaryPaymentPlan


User = get_user_model()


@dataclass
class PaymentPortalAccount:
    user: object
    created: bool


def _existing_payment_user(plan):
    application = plan.application
    if plan.portal_user_id:
        return plan.portal_user
    if application.submitted_by_id:
        return application.submitted_by

    membership = (
        Application.objects.filter(
            Q(application_reference__iexact=application.membership_reference)
            | Q(email__iexact=application.email),
        )
        .filter(Q(approved_user__isnull=False) | Q(applicant__isnull=False))
        .select_related("approved_user", "applicant")
        .order_by("-updated_at")
        .first()
    )
    if membership:
        return membership.approved_user or membership.applicant

    previous_plan = (
        BursaryPaymentPlan.objects.filter(
            application__email__iexact=application.email,
            portal_user__isnull=False,
        )
        .exclude(pk=plan.pk)
        .select_related("portal_user")
        .order_by("-created_at")
        .first()
    )
    if previous_plan:
        return previous_plan.portal_user

    direct_matches = User.objects.filter(email__iexact=application.email, is_active=True)
    return direct_matches.first() if direct_matches.count() == 1 else None


def _create_payment_user(plan):
    application = plan.application
    for _attempt in range(100):
        ipc_email = generate_unique_ipc_email(application.email)
        try:
            with transaction.atomic():
                user = User(
                    username=ipc_email,
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
                    telephone=application.mobile_phone_e164,
                )
            return user
        except IntegrityError:
            continue
    raise IntegrityError("A unique IPC payment portal account could not be created.")


@transaction.atomic
def ensure_payment_portal_account(plan):
    locked = (
        BursaryPaymentPlan.objects.select_for_update(of=("self",))
        .select_related("application")
        .get(pk=plan.pk)
    )
    user = _existing_payment_user(locked)
    created = user is None
    if user is None:
        user = _create_payment_user(locked)
    if locked.portal_user_id != user.pk:
        locked.portal_user = user
        locked.save(update_fields=["portal_user", "updated_at"])
    plan.portal_user = user
    plan.portal_user_id = user.pk
    return PaymentPortalAccount(user=user, created=created)


def password_setup_url(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    return (
        f"{settings.FRONTEND_URL.rstrip('/')}/reset-password"
        f"?uid={uid}&token={token}&next=/payments"
    )


def payment_portal_url():
    return f"{settings.FRONTEND_URL.rstrip('/')}/payments"


def deliver_payment_plan_offer(plan):
    account = ensure_payment_portal_account(plan)
    user = account.user
    installments = [
        {
            "label": "Deposit" if item.kind == item.Kind.DEPOSIT else f"Installment {item.sequence}",
            "amount": Decimal(item.amount),
            "due_date": item.due_date.strftime("%d %B %Y"),
        }
        for item in plan.installments.order_by("sequence")
    ]
    return send_bursary_payment_plan_offer_email(
        recipient=plan.application.email,
        name=f"{plan.application.first_name} {plan.application.last_name}".strip(),
        application_reference=plan.application.application_reference,
        modules=plan.approved_modules,
        amount_payable=Decimal(plan.amount_payable),
        deposit_amount=Decimal(plan.deposit_amount),
        installments=installments,
        login_email=user.email,
        portal_url=payment_portal_url(),
        password_setup_url=password_setup_url(user) if not user.has_usable_password() else None,
    )
