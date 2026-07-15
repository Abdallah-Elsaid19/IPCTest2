import secrets
from decimal import Decimal

from django.db import IntegrityError, transaction
from django.db.models import Sum
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from events.models import Event, EventAttendee, EventRegistration, EventRegistrationAnswer
from events.services.registration_email import send_registration_confirmation


ACTIVE_STATUSES = (
    EventRegistration.Status.REGISTERED,
    EventRegistration.Status.CONFIRMED,
    EventRegistration.Status.ATTENDED,
)


def _reference():
    return f"IPC-EVT-{timezone.now():%Y}-{secrets.token_hex(3).upper()}"


def registration_availability(event):
    reserved = event.registrations.filter(status__in=ACTIVE_STATUSES).aggregate(
        total=Sum("quantity")
    )["total"] or 0
    return None if event.capacity is None else max(event.capacity - reserved, 0)


def registration_state(event):
    now = timezone.now()
    if event.eventbrite_id:
        return False, "Registration for this event is managed by Eventbrite."
    if not event.is_published or event.is_hidden_on_site:
        return False, "Registration is unavailable for this event."
    if event.registration_opens_at and now < event.registration_opens_at:
        return False, "Registration has not opened yet."
    if event.registration_closes_at and now >= event.registration_closes_at:
        return False, "Registration has closed."
    if event.starts_at and now >= event.starts_at:
        return False, "Registration has closed because this event has started."
    if registration_availability(event) == 0:
        return False, "This event is fully booked."
    return True, ""


def _unique_reference():
    for _ in range(8):
        value = _reference()
        if not EventRegistration.objects.filter(reference=value).exists():
            return value
    raise ValidationError({"detail": "Could not create a registration reference. Please retry."})


@transaction.atomic
def create_registration(*, event_slug, data, user=None, idempotency_key):
    existing = EventRegistration.objects.select_related("event").filter(
        idempotency_key=idempotency_key
    ).first()
    if existing:
        return existing, False

    event = Event.objects.select_for_update().get(slug=event_slug)
    is_open, reason = registration_state(event)
    if not is_open:
        raise ValidationError({"detail": reason})

    quantity = data["quantity"]
    if quantity > event.max_tickets_per_registration:
        raise ValidationError({
            "quantity": f"You can register up to {event.max_tickets_per_registration} attendees."
        })
    available = registration_availability(event)
    if available is not None and quantity > available:
        raise ValidationError({"quantity": f"Only {available} place(s) remain."})

    contact = data["contact"]
    attendees_data = data["attendees"]
    if len(attendees_data) != quantity:
        raise ValidationError({"attendees": "Attendee details must match the selected quantity."})

    registration = EventRegistration(
        event=event,
        event_name=event.title,
        event_type=event.get_event_type_display(),
        name=f"{contact['first_name']} {contact['last_name']}".strip(),
        email=contact["email"],
        organisation=contact.get("company", ""),
        registered_user=user if getattr(user, "is_authenticated", False) else None,
        contact_first_name=contact["first_name"],
        contact_last_name=contact["last_name"],
        contact_mobile=contact.get("mobile", ""),
        company=contact.get("company", ""),
        job_title=contact.get("job_title", ""),
        city=contact.get("city", ""),
        quantity=quantity,
        ticket_name=event.registration_title,
        unit_price=Decimal("0.00"),
        total_amount=Decimal("0.00"),
        currency="GBP",
        marketing_consent=data.get("marketing_consent", False),
        terms_accepted=data["terms_accepted"],
        status=EventRegistration.Status.CONFIRMED,
        reference=_unique_reference(),
        idempotency_key=idempotency_key,
        access_token=secrets.token_urlsafe(48),
    )
    try:
        registration.save()
    except IntegrityError:
        existing = EventRegistration.objects.select_related("event").get(
            idempotency_key=idempotency_key
        )
        return existing, False

    attendees = [
        EventAttendee.objects.create(registration=registration, **attendee)
        for attendee in attendees_data
    ]
    attendee_by_index = {index: attendee for index, attendee in enumerate(attendees)}
    valid_questions = {
        question.id: question
        for question in event.registration_questions.filter(is_active=True)
    }
    provided = {answer["question_id"]: answer for answer in data.get("answers", [])}
    missing = [q.label for q in valid_questions.values() if q.is_required and not provided.get(q.id, {}).get("value")]
    if missing:
        raise ValidationError({"answers": f"Required: {', '.join(missing)}"})
    for answer in provided.values():
        question = valid_questions.get(answer["question_id"])
        if not question:
            raise ValidationError({"answers": "One of the registration questions is invalid."})
        attendee_index = answer.get("attendee_index")
        attendee = attendee_by_index.get(attendee_index) if attendee_index is not None else None
        EventRegistrationAnswer.objects.create(
            registration=registration,
            attendee=attendee,
            question=question,
            value=answer["value"],
        )

    transaction.on_commit(lambda: send_registration_confirmation(registration.pk))
    return registration, True
