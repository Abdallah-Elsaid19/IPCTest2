"""OAuth compatibility helpers. API reads live in events.services.eventbrite."""
from urllib.parse import urlencode

import requests
from django.conf import settings

from .models import EventbriteConnection
from .services.eventbrite import EventbriteClient, EventbriteError
from .services.sync_eventbrite import sync_eventbrite_events

EVENTBRITE_AUTH_URL = "https://www.eventbrite.com/oauth/authorize"
EVENTBRITE_TOKEN_URL = "https://www.eventbrite.com/oauth/token"


def get_authorization_url(state):
    if not settings.EVENTBRITE_CLIENT_ID:
        raise EventbriteError("EVENTBRITE_CLIENT_ID is not configured.", 503)
    return f"{EVENTBRITE_AUTH_URL}?{urlencode({'response_type': 'code', 'client_id': settings.EVENTBRITE_CLIENT_ID, 'redirect_uri': settings.EVENTBRITE_REDIRECT_URI, 'state': state})}"


def exchange_code_for_token(code):
    if not settings.EVENTBRITE_CLIENT_ID or not settings.EVENTBRITE_CLIENT_SECRET:
        raise EventbriteError("Eventbrite OAuth credentials are not configured.", 503)
    try:
        response = requests.post(EVENTBRITE_TOKEN_URL, data={
            "code": code,
            "client_secret": settings.EVENTBRITE_CLIENT_SECRET,
            "client_id": settings.EVENTBRITE_CLIENT_ID,
            "grant_type": "authorization_code",
            "redirect_uri": settings.EVENTBRITE_REDIRECT_URI,
        }, timeout=20)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as exc:
        raise EventbriteError("Eventbrite OAuth token exchange failed.", 502) from exc


def save_connection(token_data):
    access_token = token_data.get("access_token")
    if not access_token:
        raise EventbriteError("Eventbrite did not return an access token.")
    organizations = EventbriteClient(access_token).get_organizations()
    configured_id = settings.EVENTBRITE_ORGANIZATION_ID.strip()
    organization = next((item for item in organizations if item.get("id") == configured_id), None) if configured_id else (organizations[0] if organizations else None)
    if not organization:
        raise EventbriteError("No matching Eventbrite organization was found. Use the organizations endpoint to find its ID.", 400)
    connection, _ = EventbriteConnection.objects.update_or_create(
        organization_id=organization.get("id", ""),
        defaults={"access_token": access_token, "token_type": token_data.get("token_type", ""), "scope": token_data.get("scope", ""), "organization_name": organization.get("name", "")},
    )
    return connection
