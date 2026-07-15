from datetime import datetime

from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify

from events.models import Event, EventbriteConnection
from .eventbrite import get_configured_client


def _parse_datetime(value):
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except (TypeError, ValueError):
        return None
    return parsed if timezone.is_aware(parsed) else timezone.make_aware(parsed)


def _event_type(name):
    lowered = name.lower()
    if "master class" in lowered or "masterclass" in lowered:
        return Event.EventType.LONDON_MASTER_CLASS
    if "club" in lowered:
        return Event.EventType.REGIONAL_CLUB
    return Event.EventType.OTHER


def _unique_slug(name, eventbrite_id):
    base = slugify(name)[:200] or f"event-{eventbrite_id}"
    slug, counter = base, 2
    while Event.objects.filter(slug=slug).exclude(eventbrite_id=eventbrite_id).exists():
        suffix = f"-{counter}"
        slug = f"{base[:240 - len(suffix)]}{suffix}"
        counter += 1
    return slug


def _clean_event(event):
    eventbrite_id = str(event.get("id") or "").strip()
    if not eventbrite_id:
        return None
    name = ((event.get("name") or {}).get("text") or "Untitled Event").strip()
    venue = event.get("venue") or {}
    address = venue.get("address") or {}
    availability = event.get("ticket_availability") or {}
    capacity = event.get("capacity") or availability.get("maximum_ticket_quantity")
    return eventbrite_id, {
        "title": name[:220],
        "slug": _unique_slug(name, eventbrite_id),
        "event_type": _event_type(name),
        "description": (event.get("description") or {}).get("text") or "",
        "location": (address.get("localized_area_display") or address.get("city") or "")[:220],
        "region": (address.get("region") or "")[:120],
        "venue_name": (venue.get("name") or "")[:220],
        "starts_at": _parse_datetime((event.get("start") or {}).get("utc")),
        "ends_at": _parse_datetime((event.get("end") or {}).get("utc")),
        "capacity": capacity if isinstance(capacity, int) and capacity >= 0 else None,
        "image_url": (event.get("logo") or {}).get("url") or "",
        "eventbrite_url": event.get("url") or "",
        "status": event.get("status") or "",
        "is_online_event": bool(event.get("online_event")),
        "is_published": (event.get("status") or "") not in {"canceled", "cancelled", "deleted"},
    }


@transaction.atomic
def sync_eventbrite_events(client=None, organization_id=None):
    connection = EventbriteConnection.objects.first()
    client = client or get_configured_client()
    organization_id = organization_id or (connection.organization_id if connection else None)
    events = client.get_organization_events(organization_id=organization_id)
    created = updated = skipped = 0
    for raw_event in events:
        cleaned = _clean_event(raw_event)
        if not cleaned:
            skipped += 1
            continue
        eventbrite_id, defaults = cleaned
        _, was_created = Event.objects.update_or_create(eventbrite_id=eventbrite_id, defaults=defaults)
        created += int(was_created)
        updated += int(not was_created)
    if connection:
        connection.last_synced_at = timezone.now()
        connection.save(update_fields=["last_synced_at", "updated_at"])
    return {"success": True, "created": created, "updated": updated, "total": created + updated, "skipped": skipped}
