import calendar
from datetime import datetime, time, timezone as datetime_timezone
from decimal import Decimal

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.db import transaction
from django.utils import timezone

from .models import BursaryPaymentInstallment, BursaryPaymentPlan


def stripe_credentials_configured():
    values = (settings.STRIPE_SECRET_KEY, settings.STRIPE_WEBHOOK_SECRET)
    return all(value and "..." not in value for value in values)


def stripe_client():
    if not stripe_credentials_configured():
        raise ImproperlyConfigured("Stripe is not configured.")
    import stripe

    stripe.api_key = settings.STRIPE_SECRET_KEY
    return stripe


def to_minor_units(value):
    return int((Decimal(value) * 100).quantize(Decimal("1")))


def _stripe_value(value, key, default=None):
    if value is None:
        return default
    if isinstance(value, dict):
        return value.get(key, default)
    to_dict = getattr(value, "to_dict", None)
    if callable(to_dict):
        return to_dict().get(key, default)
    return getattr(value, key, default)


def _metadata(value):
    metadata = _stripe_value(value, "metadata", {}) or {}
    if isinstance(metadata, dict):
        return metadata
    to_dict = getattr(metadata, "to_dict", None)
    return to_dict() if callable(to_dict) else {}


def _plan_metadata(plan):
    return {
        "bursary_payment_plan_id": str(plan.pk),
        "bursary_payment_plan_public_id": str(plan.public_id),
        "application_reference": plan.application.application_reference,
    }


def _ensure_customer(plan):
    if plan.stripe_customer_id:
        return plan.stripe_customer_id
    stripe = stripe_client()
    customer = stripe.Customer.create(
        email=plan.application.email,
        name=f"{plan.application.first_name} {plan.application.last_name}".strip(),
        metadata=_plan_metadata(plan),
        idempotency_key=f"bursary-plan-{plan.pk}-customer",
    )
    plan.stripe_customer_id = customer.id
    plan.save(update_fields=["stripe_customer_id", "updated_at"])
    return customer.id


def create_checkout_session(plan):
    """Collect the deposit and save a payment method for automatic installments."""
    stripe = stripe_client()
    customer_id = _ensure_customer(plan)
    metadata = _plan_metadata(plan)
    success_url = f"{settings.FRONTEND_URL}/payments?payment=success&session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{settings.FRONTEND_URL}/payments?payment=cancelled"
    description = f"IPC payment plan {plan.application.application_reference}"

    if plan.deposit_amount <= 0:
        params = {
            "mode": "setup",
            "customer": customer_id,
            "success_url": success_url,
            "cancel_url": cancel_url,
            "metadata": metadata,
            "payment_method_types": ["card"],
            "setup_intent_data": {"metadata": metadata},
        }
    else:
        params = {
            "mode": "payment",
            "customer": customer_id,
            "success_url": success_url,
            "cancel_url": cancel_url,
            "metadata": metadata,
            "payment_intent_data": {
                "metadata": metadata,
                "setup_future_usage": "off_session",
            },
            "line_items": [{
                "quantity": 1,
                "price_data": {
                    "currency": settings.STRIPE_CURRENCY,
                    "unit_amount": to_minor_units(plan.deposit_amount),
                    "product_data": {"name": description},
                },
            }],
        }

    session = stripe.checkout.Session.create(
        **params,
        idempotency_key=f"bursary-plan-{plan.pk}-checkout-{plan.updated_at.timestamp():.0f}",
    )
    plan.stripe_checkout_session_id = session.id
    plan.status = BursaryPaymentPlan.Status.DEPOSIT_PENDING
    plan.last_stripe_error = ""
    plan.save(update_fields=["stripe_checkout_session_id", "status", "last_stripe_error", "updated_at"])
    deposit = plan.installments.filter(kind=BursaryPaymentInstallment.Kind.DEPOSIT).first()
    if deposit:
        deposit.status = BursaryPaymentInstallment.Status.CHECKOUT_PENDING
        deposit.save(update_fields=["status", "updated_at"])
    return session


def _payment_method_from_session(session):
    stripe = stripe_client()
    payment_intent_id = _stripe_value(session, "payment_intent")
    if payment_intent_id:
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        return _stripe_value(intent, "payment_method"), payment_intent_id
    setup_intent_id = _stripe_value(session, "setup_intent")
    if setup_intent_id:
        intent = stripe.SetupIntent.retrieve(setup_intent_id)
        return _stripe_value(intent, "payment_method"), ""
    return None, ""


def create_installment_schedule(plan, payment_method_id=None):
    if not plan.installment_count or plan.stripe_subscription_schedule_id:
        return None
    stripe = stripe_client()
    metadata = _plan_metadata(plan)
    product = stripe.Product.create(
        name=f"IPC installments — {plan.application.application_reference}",
        metadata=metadata,
        idempotency_key=f"bursary-plan-{plan.pk}-product",
    )
    regular_price = stripe.Price.create(
        currency=settings.STRIPE_CURRENCY,
        unit_amount=to_minor_units(plan.installment_amount),
        recurring={"interval": plan.billing_interval},
        product=product.id,
        metadata=metadata,
        idempotency_key=f"bursary-plan-{plan.pk}-regular-price",
    )
    phases = []
    regular_iterations = plan.installment_count
    final_price = None
    if plan.final_installment_amount != plan.installment_amount:
        regular_iterations -= 1
    if regular_iterations:
        phases.append({
            "items": [{"price": regular_price.id, "quantity": 1}],
            "iterations": regular_iterations,
            "metadata": metadata,
        })
    if plan.final_installment_amount != plan.installment_amount:
        final_price = stripe.Price.create(
            currency=settings.STRIPE_CURRENCY,
            unit_amount=to_minor_units(plan.final_installment_amount),
            recurring={"interval": plan.billing_interval},
            product=product.id,
            metadata=metadata,
            idempotency_key=f"bursary-plan-{plan.pk}-final-price",
        )
        phases.append({
            "items": [{"price": final_price.id, "quantity": 1}],
            "iterations": 1,
            "metadata": metadata,
        })

    local_start = datetime.combine(plan.first_installment_date, time(hour=12))
    start_timestamp = int(local_start.replace(tzinfo=datetime_timezone.utc).timestamp())
    now_timestamp = int(timezone.now().timestamp())
    default_settings = {"collection_method": "charge_automatically"}
    if payment_method_id:
        default_settings["default_payment_method"] = payment_method_id
    schedule = stripe.SubscriptionSchedule.create(
        customer=plan.stripe_customer_id,
        start_date=max(start_timestamp, now_timestamp),
        end_behavior="cancel",
        default_settings=default_settings,
        phases=phases,
        metadata=metadata,
        idempotency_key=f"bursary-plan-{plan.pk}-schedule",
    )
    plan.stripe_product_id = product.id
    plan.stripe_price_id = regular_price.id
    plan.stripe_final_price_id = final_price.id if final_price else ""
    plan.stripe_subscription_schedule_id = schedule.id
    subscription_id = _stripe_value(schedule, "subscription")
    if subscription_id:
        plan.stripe_subscription_id = subscription_id
    plan.save(update_fields=[
        "stripe_product_id", "stripe_price_id", "stripe_final_price_id",
        "stripe_subscription_schedule_id", "stripe_subscription_id", "updated_at",
    ])
    return schedule


@transaction.atomic
def fulfill_checkout_session(session):
    metadata = _metadata(session)
    plan_id = metadata.get("bursary_payment_plan_id")
    if not plan_id:
        return None
    plan = BursaryPaymentPlan.objects.select_for_update().select_related("application").get(pk=plan_id)
    mode = _stripe_value(session, "mode")
    payment_status = _stripe_value(session, "payment_status")
    if mode == "payment" and payment_status not in {"paid", "no_payment_required"}:
        return plan
    payment_method_id, payment_intent_id = _payment_method_from_session(session)
    customer_id = _stripe_value(session, "customer")
    if customer_id:
        plan.stripe_customer_id = customer_id
    deposit = plan.installments.select_for_update().filter(kind=BursaryPaymentInstallment.Kind.DEPOSIT).first()
    if deposit and deposit.status != BursaryPaymentInstallment.Status.PAID:
        deposit.status = BursaryPaymentInstallment.Status.PAID
        deposit.paid_at = timezone.now()
        deposit.stripe_payment_intent_id = payment_intent_id or ""
        deposit.failure_message = ""
        deposit.save(update_fields=["status", "paid_at", "stripe_payment_intent_id", "failure_message", "updated_at"])
    if plan.installment_count:
        create_installment_schedule(plan, payment_method_id)
        plan.status = BursaryPaymentPlan.Status.ACTIVE
    else:
        plan.status = BursaryPaymentPlan.Status.COMPLETED
    plan.last_stripe_error = ""
    plan.save(update_fields=["stripe_customer_id", "status", "last_stripe_error", "updated_at"])
    return plan


def _subscription_id(invoice):
    direct = _stripe_value(invoice, "subscription")
    if direct:
        return direct
    parent = _stripe_value(invoice, "parent", {}) or {}
    details = _stripe_value(parent, "subscription_details", {}) or {}
    return _stripe_value(details, "subscription")


def plan_from_subscription(subscription_id):
    if not subscription_id:
        return None
    plan = BursaryPaymentPlan.objects.filter(stripe_subscription_id=subscription_id).first()
    if plan:
        return plan
    stripe = stripe_client()
    subscription = stripe.Subscription.retrieve(subscription_id)
    plan_id = _metadata(subscription).get("bursary_payment_plan_id")
    if not plan_id:
        return None
    plan = BursaryPaymentPlan.objects.filter(pk=plan_id).first()
    if plan and plan.stripe_subscription_id != subscription_id:
        plan.stripe_subscription_id = subscription_id
        plan.save(update_fields=["stripe_subscription_id", "updated_at"])
    return plan


@transaction.atomic
def link_invoice_to_installment(invoice):
    """Store Stripe's hosted invoice URL for manual payment in the IPC portal."""
    plan = plan_from_subscription(_subscription_id(invoice))
    if not plan:
        return None
    invoice_id = _stripe_value(invoice, "id", "")
    hosted_url = _stripe_value(invoice, "hosted_invoice_url", "") or ""
    installment = None
    if invoice_id:
        installment = plan.installments.select_for_update().filter(
            stripe_invoice_id=invoice_id,
        ).first()
    if installment is None:
        installment = plan.installments.select_for_update().filter(
            kind=BursaryPaymentInstallment.Kind.INSTALLMENT,
            stripe_invoice_id="",
        ).exclude(status__in=[
            BursaryPaymentInstallment.Status.PAID,
            BursaryPaymentInstallment.Status.CANCELLED,
            BursaryPaymentInstallment.Status.REFUNDED,
        ]).first()
    if installment:
        installment.stripe_invoice_id = invoice_id
        installment.stripe_hosted_invoice_url = hosted_url
        installment.save(update_fields=[
            "stripe_invoice_id", "stripe_hosted_invoice_url", "updated_at",
        ])
    return installment


@transaction.atomic
def mark_invoice_paid(invoice):
    plan = plan_from_subscription(_subscription_id(invoice))
    if not plan:
        return None
    invoice_id = _stripe_value(invoice, "id", "")
    if invoice_id and plan.installments.filter(
        stripe_invoice_id=invoice_id,
        status=BursaryPaymentInstallment.Status.PAID,
    ).exists():
        return plan
    installment = link_invoice_to_installment(invoice)
    if installment is None:
        installment = plan.installments.select_for_update().filter(
            kind=BursaryPaymentInstallment.Kind.INSTALLMENT,
        ).exclude(status__in=[
            BursaryPaymentInstallment.Status.PAID,
            BursaryPaymentInstallment.Status.REFUNDED,
            BursaryPaymentInstallment.Status.CANCELLED,
        ]).first()
    if installment:
        installment.status = BursaryPaymentInstallment.Status.PAID
        installment.paid_at = timezone.now()
        installment.stripe_invoice_id = invoice_id
        installment.failure_message = ""
        installment.save(update_fields=["status", "paid_at", "stripe_invoice_id", "failure_message", "updated_at"])
    if not plan.installments.exclude(status=BursaryPaymentInstallment.Status.PAID).exists():
        plan.status = BursaryPaymentPlan.Status.COMPLETED
    else:
        plan.status = BursaryPaymentPlan.Status.ACTIVE
    plan.last_stripe_error = ""
    plan.save(update_fields=["status", "last_stripe_error", "updated_at"])
    return plan


@transaction.atomic
def mark_invoice_failed(invoice):
    plan = plan_from_subscription(_subscription_id(invoice))
    if not plan:
        return None
    installment = link_invoice_to_installment(invoice)
    if installment is None:
        installment = plan.installments.select_for_update().filter(
            kind=BursaryPaymentInstallment.Kind.INSTALLMENT,
        ).exclude(status__in=[BursaryPaymentInstallment.Status.PAID, BursaryPaymentInstallment.Status.CANCELLED]).first()
    if installment:
        installment.status = BursaryPaymentInstallment.Status.FAILED
        installment.stripe_invoice_id = _stripe_value(invoice, "id", "")
        installment.failure_message = "Stripe could not collect this installment."
        installment.save(update_fields=["status", "stripe_invoice_id", "failure_message", "updated_at"])
    plan.status = BursaryPaymentPlan.Status.PAST_DUE
    plan.last_stripe_error = "Stripe could not collect the latest installment."
    plan.save(update_fields=["status", "last_stripe_error", "updated_at"])
    return plan
