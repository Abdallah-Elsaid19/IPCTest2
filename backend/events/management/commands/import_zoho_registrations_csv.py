import csv
import hashlib
import io
import re
from pathlib import Path

from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError
from django.core.validators import validate_email
from django.db import transaction

from events.models import Event, EventRegistration
from events.services.registration import _unique_reference


REQUIRED_COLUMNS = {"Name", "Phone", "Email", "Programme", "Comments"}


def _clean(value, limit):
    return " ".join(str(value or "").strip().split())[:limit]


def _normalise_phone(value):
    return re.sub(r"\D", "", str(value or ""))


def _split_name(value):
    parts = _clean(value, 160).split(" ", 1)
    return parts[0][:80], (parts[1] if len(parts) > 1 else "")[:80]


def _read_csv(path):
    raw = path.read_bytes()
    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = raw.decode("cp1252")
    reader = csv.DictReader(io.StringIO(text))
    columns = set(reader.fieldnames or [])
    missing = sorted(REQUIRED_COLUMNS - columns)
    if missing:
        raise CommandError(f"CSV is missing required columns: {', '.join(missing)}")
    return list(reader)


class Command(BaseCommand):
    help = (
        "Import historical Zoho Forms CSV registrations into the admin event "
        "registrations table without duplicating webhook records."
    )

    def add_arguments(self, parser):
        parser.add_argument("csv_path", help="Path to the Zoho Forms CSV export.")
        parser.add_argument(
            "--eventbrite-id",
            required=True,
            help="Eventbrite ID of the local event these registrations belong to.",
        )
        parser.add_argument(
            "--execute",
            action="store_true",
            help="Write changes. Without this flag the command is a dry run.",
        )

    def handle(self, *args, **options):
        csv_path = Path(options["csv_path"]).expanduser().resolve()
        if not csv_path.is_file():
            raise CommandError(f"CSV file does not exist: {csv_path}")

        try:
            event = Event.objects.get(eventbrite_id=options["eventbrite_id"])
        except Event.DoesNotExist as exc:
            raise CommandError(
                f"No local event has Eventbrite ID {options['eventbrite_id']}."
            ) from exc

        source_rows = _read_csv(csv_path)
        unique_rows = {}
        invalid_rows = []
        duplicate_count = 0

        for row_number, row in enumerate(source_rows, start=2):
            first_name, last_name = _split_name(row.get("Name"))
            email = _clean(row.get("Email"), 254).lower()
            phone = _clean(row.get("Phone"), 40)
            programme = _clean(row.get("Programme"), 120)
            comments = str(row.get("Comments") or "").strip()[:4000]

            if not any((first_name, last_name, email, phone, programme, comments)):
                invalid_rows.append((row_number, "empty row"))
                continue
            if not first_name:
                invalid_rows.append((row_number, "missing name"))
                continue
            try:
                validate_email(email)
            except ValidationError:
                invalid_rows.append((row_number, "missing or invalid email"))
                continue

            identity = (
                email.casefold(),
                _normalise_phone(phone),
                programme.casefold(),
            )
            cleaned = {
                "first_name": first_name,
                "last_name": last_name,
                "email": email,
                "phone": phone,
                "programme": programme,
                "comments": comments,
            }
            previous = unique_rows.get(identity)
            if previous is not None:
                duplicate_count += 1
                for field, value in cleaned.items():
                    if value:
                        previous[field] = value
            else:
                unique_rows[identity] = cleaned

        create_rows = []
        update_rows = []
        unchanged_count = 0
        for identity, data in unique_rows.items():
            identity_text = "|".join([
                event.title.casefold(),
                data["email"].casefold(),
                data["phone"],
                data["programme"].casefold(),
            ])
            idempotency_key = (
                f"zoho:{hashlib.sha256(identity_text.encode('utf-8')).hexdigest()}"
            )
            existing = EventRegistration.objects.filter(
                idempotency_key=idempotency_key,
            ).first()
            if existing is None:
                candidates = EventRegistration.objects.filter(
                    payment_provider="zoho_forms",
                    email__iexact=data["email"],
                )
                existing = next((
                    item for item in candidates
                    if _normalise_phone(item.contact_mobile) == identity[1]
                    and item.ticket_name.strip().casefold() == identity[2]
                ), None)

            data["idempotency_key"] = idempotency_key
            if existing is None:
                create_rows.append(data)
                continue

            needs_update = any((
                existing.event_id != event.id,
                existing.event_name != event.title,
                existing.contact_first_name != data["first_name"],
                existing.contact_last_name != data["last_name"],
                existing.contact_mobile != data["phone"],
                existing.ticket_name != (data["programme"] or "Zoho Forms registration"),
                existing.dietary_access_needs != data["comments"],
                existing.idempotency_key != idempotency_key,
            ))
            if needs_update:
                update_rows.append((existing, data))
            else:
                unchanged_count += 1

        self.stdout.write(f"CSV rows: {len(source_rows)}")
        self.stdout.write(f"Valid unique registrations: {len(unique_rows)}")
        self.stdout.write(f"Duplicate CSV rows merged: {duplicate_count}")
        self.stdout.write(f"Invalid rows skipped: {len(invalid_rows)}")
        for row_number, reason in invalid_rows:
            self.stdout.write(f"  Row {row_number}: {reason}")
        self.stdout.write(f"New registrations: {len(create_rows)}")
        self.stdout.write(f"Existing registrations to update/relink: {len(update_rows)}")
        self.stdout.write(f"Existing registrations unchanged: {unchanged_count}")

        if not options["execute"]:
            self.stdout.write(
                self.style.WARNING(
                    "Dry run only. Re-run with --execute after reviewing this summary."
                )
            )
            return

        with transaction.atomic():
            for data in create_rows:
                EventRegistration.objects.create(
                    event=event,
                    event_name=event.title,
                    event_type=event.get_event_type_display(),
                    name=f"{data['first_name']} {data['last_name']}".strip(),
                    email=data["email"],
                    contact_first_name=data["first_name"],
                    contact_last_name=data["last_name"],
                    contact_mobile=data["phone"],
                    dietary_access_needs=data["comments"],
                    ticket_name=data["programme"] or "Zoho Forms registration",
                    quantity=1,
                    status=EventRegistration.Status.REGISTERED,
                    reference=_unique_reference(),
                    idempotency_key=data["idempotency_key"],
                    payment_provider="zoho_forms",
                    payment_status=EventRegistration.PaymentStatus.NOT_REQUIRED,
                )

            for registration, data in update_rows:
                registration.event = event
                registration.event_name = event.title
                registration.event_type = event.get_event_type_display()
                registration.name = (
                    f"{data['first_name']} {data['last_name']}".strip()
                )
                registration.email = data["email"]
                registration.contact_first_name = data["first_name"]
                registration.contact_last_name = data["last_name"]
                registration.contact_mobile = data["phone"]
                registration.dietary_access_needs = data["comments"]
                registration.ticket_name = (
                    data["programme"] or "Zoho Forms registration"
                )
                registration.idempotency_key = data["idempotency_key"]
                registration.save(update_fields=[
                    "event", "event_name", "event_type", "name", "email",
                    "contact_first_name", "contact_last_name", "contact_mobile",
                    "dietary_access_needs", "ticket_name", "idempotency_key",
                    "updated_at",
                ])

        cache.delete("ipc:admin-dashboard:v2")
        self.stdout.write(self.style.SUCCESS(
            f"Import complete: created={len(create_rows)}, "
            f"updated={len(update_rows)}, unchanged={unchanged_count}."
        ))
