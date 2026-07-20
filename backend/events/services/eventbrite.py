from urllib.parse import urljoin

import requests
from django.conf import settings


API_BASE_URL = "https://www.eventbriteapi.com/v3/"


class EventbriteAttendeeCollection(list):
    def __init__(self, items, total_count):
        super().__init__(items)
        self.total_count = total_count


class EventbriteError(Exception):
    """A safe, user-readable Eventbrite integration error."""

    def __init__(self, message, status_code=502):
        super().__init__(message)
        self.status_code = status_code


class EventbriteClient:
    def __init__(self, token=None, timeout=20):
        self.token = (token or settings.EVENTBRITE_PRIVATE_TOKEN).strip()
        self.timeout = timeout
        if not self.token:
            raise EventbriteError(
                "Eventbrite is not connected. Set EVENTBRITE_PRIVATE_TOKEN or complete the OAuth flow.",
                503,
            )

    def _request(self, path, params=None):
        url = urljoin(API_BASE_URL, path.lstrip("/"))
        try:
            response = requests.get(
                url,
                params=params,
                headers={"Authorization": f"Bearer {self.token}", "Accept": "application/json"},
                timeout=self.timeout,
            )
            response.raise_for_status()
            return response.json()
        except requests.Timeout as exc:
            raise EventbriteError("Eventbrite request timed out. Please try again.", 504) from exc
        except requests.HTTPError as exc:
            status_code = exc.response.status_code
            if status_code in (401, 403):
                message = "Eventbrite authentication failed. Check or renew the configured token."
                api_status = 502
            elif status_code == 429:
                message = "Eventbrite rate limit reached. Please try again later."
                api_status = 503
            else:
                message = f"Eventbrite API returned HTTP {status_code}."
                api_status = 502
            raise EventbriteError(message, api_status) from exc
        except (requests.RequestException, ValueError) as exc:
            raise EventbriteError("Eventbrite API is currently unavailable or returned an invalid response.", 502) from exc

    def _all_pages(self, path, params=None, collection_key="events", max_items=None):
        items = []
        query = dict(params or {})
        while True:
            data = self._request(path, query)
            items.extend(data.get(collection_key) or [])
            if max_items and len(items) >= max_items:
                return items[:max_items]
            pagination = data.get("pagination") or {}
            continuation = pagination.get("continuation")
            if not pagination.get("has_more_items") or not continuation:
                return items
            query["continuation"] = continuation

    def get_my_profile(self):
        return self._request("users/me/")

    def get_user_events(self, status=None):
        params = {"expand": "venue,logo,ticket_availability", "order_by": "start_asc"}
        if status:
            params["status"] = status
        return self._all_pages("users/me/owned_events/", params)

    def get_organizations(self):
        return self._all_pages("users/me/organizations/", collection_key="organizations")

    def get_organization_events(self, organization_id=None, status="live,started"):
        organization_id = (organization_id or settings.EVENTBRITE_ORGANIZATION_ID).strip()
        if not organization_id:
            raise EventbriteError(
                "Eventbrite organization is not configured. Set EVENTBRITE_ORGANIZATION_ID=your_org_id.",
                503,
            )
        params = {"expand": "venue,logo,ticket_availability", "order_by": "start_asc"}
        if status:
            params["status"] = status
        return self._all_pages(f"organizations/{organization_id}/events/", params)

    def get_event_details(self, event_id):
        return self._request(f"events/{event_id}/", {"expand": "venue,logo,ticket_availability"})

    def get_organization_attendees(self, organization_id=None):
        organization_id = (organization_id or settings.EVENTBRITE_ORGANIZATION_ID).strip()
        if not organization_id:
            raise EventbriteError(
                "Eventbrite organization is not configured. Set EVENTBRITE_ORGANIZATION_ID=your_org_id.",
                503,
            )
        path = f"organizations/{organization_id}/attendees/"
        attendees = []
        query = {}
        total_count = None
        max_items = 100
        while True:
            data = self._request(path, query)
            page_attendees = data.get("attendees") or []
            attendees.extend(page_attendees)
            pagination = data.get("pagination") or {}
            if total_count is None:
                try:
                    total_count = int(pagination.get("object_count"))
                except (TypeError, ValueError):
                    total_count = None
            if len(attendees) >= max_items:
                return EventbriteAttendeeCollection(
                    attendees[:max_items],
                    max(total_count or 0, len(attendees)),
                )
            continuation = pagination.get("continuation")
            if not pagination.get("has_more_items") or not continuation:
                return EventbriteAttendeeCollection(
                    attendees,
                    max(total_count or 0, len(attendees)),
                )
            query["continuation"] = continuation


def get_configured_client():
    """Prefer an environment token, falling back to the most recent OAuth connection."""
    token = settings.EVENTBRITE_PRIVATE_TOKEN.strip()
    if not token:
        from events.models import EventbriteConnection
        connection = EventbriteConnection.objects.first()
        token = connection.access_token if connection else ""
    return EventbriteClient(
        token=token,
        timeout=getattr(settings, "EVENTBRITE_REQUEST_TIMEOUT", 60),
    )
