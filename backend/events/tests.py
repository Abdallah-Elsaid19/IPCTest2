from unittest.mock import Mock, patch

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core import mail
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient
from datetime import timedelta

from .models import (
    Event,
    EventPageContent,
    EventRegistration,
    EventbriteAttendeeSnapshot,
    EventbriteConnection,
)
from .services.eventbrite import (
    EventbriteClient,
    get_eventbrite_image_url,
    get_eventbrite_thumbnail_url,
)
from .services.sync_eventbrite import sync_eventbrite_events


@override_settings(
    ZOHO_FORMS_WEBHOOK_TOKEN="test-zoho-token",
    ZOHO_FORMS_EVENT_NAME="London Masterclass Event 2 October 2026",
)
class ZohoFormWebhookTests(TestCase):
    endpoint = "/api/events/zoho/webhook"

    def setUp(self):
        self.client = APIClient()
        self.payload = {
            "first_name": "Amina",
            "last_name": "Khan",
            "phone": "+44 7700 900123",
            "email": "amina@example.com",
            "programme": "Project Controls Masterclass",
            "comments": "Vegetarian lunch, please.",
        }

    def post(self, payload=None, token="test-zoho-token"):
        return self.client.post(
            self.endpoint,
            payload or self.payload,
            format="json",
            HTTP_X_ZOHO_WEBHOOK_TOKEN=token,
        )

    def test_rejects_request_without_matching_webhook_token(self):
        response = self.post(token="wrong-token")

        self.assertEqual(response.status_code, 403)
        self.assertEqual(EventRegistration.objects.count(), 0)

    def test_creates_zoho_event_registration(self):
        event = Event.objects.create(
            title="London Masterclass Event 2 October 2026",
            slug="london-masterclass-event-2-october-2026",
            event_type=Event.EventType.LONDON_MASTER_CLASS,
        )

        response = self.post()

        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data["created"])
        registration = EventRegistration.objects.get()
        self.assertEqual(registration.event, event)
        self.assertEqual(registration.name, "Amina Khan")
        self.assertEqual(registration.email, "amina@example.com")
        self.assertEqual(registration.contact_mobile, "+44 7700 900123")
        self.assertEqual(registration.ticket_name, "Project Controls Masterclass")
        self.assertEqual(registration.dietary_access_needs, "Vegetarian lunch, please.")
        self.assertEqual(registration.payment_provider, "zoho_forms")

    def test_accepts_current_field_aliases_and_deduplicates_repush(self):
        payload = {
            "Field_1": "Amina",
            "Field_2": "Khan",
            "Field_3": "+44 7700 900123",
            "Field_4": "amina@example.com",
            "Field_5": "Project Controls Masterclass",
            "Field_16": "Vegetarian lunch, please.",
        }

        first = self.post(payload)
        second = self.post(payload)

        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 200)
        self.assertFalse(second.data["created"])
        self.assertEqual(first.data["reference"], second.data["reference"])
        self.assertEqual(EventRegistration.objects.count(), 1)


class EventbriteClientTests(TestCase):
    @patch.object(EventbriteClient, "_request")
    def test_event_description_uses_full_html_endpoint(self, request):
        request.return_value = {
            "description": "<h2>About Event</h2><p>Full programme content.</p>"
        }

        description = EventbriteClient(
            token="test-token"
        ).get_event_description_html("event-123")

        self.assertEqual(
            description,
            "<h2>About Event</h2><p>Full programme content.</p>",
        )
        request.assert_called_once_with("events/event-123/description/")

    def test_event_image_prefers_original_high_resolution_url(self):
        event = {
            "logo": {
                "url": "https://example.com/preview.jpg",
                "original": {"url": "https://example.com/original.jpg"},
            },
        }

        self.assertEqual(
            get_eventbrite_image_url(event),
            "https://example.com/original.jpg",
        )

    def test_event_image_falls_back_to_standard_url(self):
        event = {"logo": {"url": "https://example.com/preview.jpg"}}

        self.assertEqual(
            get_eventbrite_image_url(event),
            "https://example.com/preview.jpg",
        )

    def test_event_thumbnail_prefers_compressed_standard_url(self):
        event = {
            "logo": {
                "url": "https://example.com/preview.jpg",
                "original": {"url": "https://example.com/original.jpg"},
            },
        }

        self.assertEqual(
            get_eventbrite_thumbnail_url(event),
            "https://example.com/preview.jpg",
        )

    @override_settings(EVENTBRITE_ORGANIZATION_ID="ipc-org")
    def test_sync_prefers_configured_organization_and_retires_old_events(self):
        EventbriteConnection.objects.create(
            organization_id="kent-org",
            organization_name="Kent",
        )
        old_event = Event.objects.create(
            title="Kent Event",
            slug="kent-event",
            event_type=Event.EventType.OTHER,
            eventbrite_id="kent-event-1",
            status="live",
            is_published=True,
        )
        client = Mock()
        client.get_organization_events.return_value = [{
            "id": "ipc-event-1",
            "name": {"text": "IPC Event"},
            "status": "live",
        }]
        client.get_event_description_html.return_value = ""

        result = sync_eventbrite_events(client=client)

        client.get_organization_events.assert_called_once_with(
            organization_id="ipc-org",
        )
        old_event.refresh_from_db()
        self.assertFalse(old_event.is_published)
        self.assertTrue(Event.objects.get(eventbrite_id="ipc-event-1").is_published)
        self.assertEqual(result["retired"], 1)

    @override_settings(EVENTBRITE_ORGANIZATION_ID="org-123")
    @patch.object(EventbriteClient, "_request")
    def test_organization_attendees_does_not_send_unsupported_page_size(self, request):
        request.return_value = {
            "attendees": [],
            "pagination": {"has_more_items": False},
        }

        EventbriteClient(token="test-token").get_organization_attendees()

        request.assert_called_once_with("organizations/org-123/attendees/", {})


class AdminEventApiTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.admin = get_user_model().objects.create_user(
            username="events.admin",
            email="events-admin@example.com",
            password="safe-test-password",
            is_staff=True,
        )
        self.member = get_user_model().objects.create_user(
            username="events.member",
            email="events-member@example.com",
            password="safe-test-password",
        )
        self.event = Event.objects.create(
            title="IPC Planning Master Class",
            slug="ipc-planning-master-class",
            event_type=Event.EventType.LONDON_MASTER_CLASS,
            description="A professional planning session.",
            is_published=False,
        )

    def test_staff_can_list_unpublished_events(self):
        self.client.force_authenticate(self.admin)
        response = self.client.get("/api/admin/events")
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["slug"], self.event.slug)

    def test_non_staff_cannot_manage_events(self):
        self.client.force_authenticate(self.member)
        self.assertEqual(self.client.get("/api/admin/events").status_code, 403)

    def test_staff_can_create_and_update_event(self):
        self.client.force_authenticate(self.admin)
        create_response = self.client.post(
            "/api/admin/events",
            {
                "title": "IPC Regional Controls Forum",
                "slug": "ipc-regional-controls-forum",
                "event_type": "regional_club",
                "description": "Regional professional event.",
                "location": "Manchester",
                "region": "North West",
                "venue_name": "IPC Regional Venue",
                "starts_at": "2026-09-10T09:00:00Z",
                "ends_at": "2026-09-10T16:00:00Z",
                "capacity": 120,
                "image_url": "https://example.com/event.jpg",
                "eventbrite_id": None,
                "eventbrite_url": "",
                "status": "draft",
                "is_online_event": False,
                "is_featured": True,
                "is_published": False,
            },
            format="json",
        )
        self.assertEqual(create_response.status_code, 201, create_response.data)
        self.assertIsNone(create_response.data["eventbrite_id"])
        event_id = create_response.data["id"]

        update_response = self.client.patch(
            f"/api/admin/events/{event_id}",
            {"status": "live", "is_published": True},
            format="json",
        )
        self.assertEqual(update_response.status_code, 200, update_response.data)
        self.assertEqual(update_response.data["status"], "live")
        self.assertTrue(update_response.data["is_published"])

        delete_response = self.client.delete(f"/api/admin/events/{event_id}")
        self.assertEqual(delete_response.status_code, 204)
        self.assertFalse(Event.objects.filter(pk=event_id).exists())

    def test_end_date_must_not_precede_start_date(self):
        self.client.force_authenticate(self.admin)
        response = self.client.patch(
            f"/api/admin/events/{self.event.pk}",
            {
                "starts_at": "2026-09-10T16:00:00Z",
                "ends_at": "2026-09-10T09:00:00Z",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400, response.data)
        self.assertIn("ends_at", response.data)

    def test_eventbrite_event_is_read_only_in_ipc_admin(self):
        synced_event = Event.objects.create(
            title="Synced Eventbrite Event",
            slug="synced-eventbrite-event",
            event_type=Event.EventType.OTHER,
            eventbrite_id="eventbrite-123",
            status="live",
        )
        self.client.force_authenticate(self.admin)

        response = self.client.patch(
            f"/api/admin/events/{synced_event.pk}",
            {"title": "Changed in IPC"},
            format="json",
        )

        self.assertEqual(response.status_code, 409, response.data)
        synced_event.refresh_from_db()
        self.assertEqual(synced_event.title, "Synced Eventbrite Event")

        delete_response = self.client.delete(f"/api/admin/events/{synced_event.pk}")
        self.assertEqual(delete_response.status_code, 409, delete_response.data)
        self.assertTrue(Event.objects.filter(pk=synced_event.pk).exists())

    def test_admin_can_hide_eventbrite_event_from_ipc_site(self):
        synced_event = Event.objects.create(
            title="Visible Eventbrite Event",
            slug="visible-eventbrite-event",
            event_type=Event.EventType.OTHER,
            eventbrite_id="eventbrite-visible-123",
            status="live",
            is_published=True,
        )
        self.assertEqual(
            self.client.get(f"/api/events/{synced_event.pk}").status_code,
            200,
        )
        self.client.force_authenticate(self.admin)

        response = self.client.patch(
            f"/api/admin/events/{synced_event.pk}/visibility",
            {"hidden": True},
            format="json",
        )

        self.assertEqual(response.status_code, 200, response.data)
        self.assertTrue(response.data["is_hidden_on_site"])
        self.client.force_authenticate(user=None)
        self.assertEqual(
            self.client.get(f"/api/events/{synced_event.pk}").status_code,
            404,
        )

    def test_ended_event_is_labelled_in_admin_and_hidden_from_public_site(self):
        ended_event = Event.objects.create(
            title="Ended IPC event",
            slug="ended-ipc-event",
            event_type=Event.EventType.OTHER,
            starts_at=timezone.now() - timedelta(hours=2),
            ends_at=timezone.now() - timedelta(hours=1),
            status="live",
            is_published=True,
        )
        upcoming_event = Event.objects.create(
            title="Upcoming IPC event",
            slug="upcoming-ipc-event",
            event_type=Event.EventType.OTHER,
            starts_at=timezone.now() + timedelta(days=1),
            ends_at=timezone.now() + timedelta(days=1, hours=2),
            status="live",
            is_published=True,
        )

        public_response = self.client.get("/api/events")
        public_ids = [event["id"] for event in public_response.data]
        self.assertNotIn(ended_event.pk, public_ids)
        self.assertIn(upcoming_event.pk, public_ids)

        self.client.force_authenticate(self.admin)
        admin_response = self.client.get(f"/api/admin/events/{ended_event.pk}")
        self.assertEqual(admin_response.status_code, 200, admin_response.data)
        self.assertEqual(admin_response.data["lifecycle_status"], "ended")

    @override_settings(EVENTBRITE_ORGANIZATION_ID="org-123")
    @patch("events.views.get_configured_client")
    def test_staff_can_view_normalized_eventbrite_attendees(self, get_client):
        EventbriteConnection.objects.create(
            organization_id="kent-org",
            organization_name="Kent",
        )
        synced_event = Event.objects.create(
            title="Eventbrite Controls Conference",
            slug="eventbrite-controls-conference",
            event_type=Event.EventType.OTHER,
            eventbrite_id="event-123",
        )
        get_client.return_value.get_organization_attendees.return_value = [{
            "id": "attendee-456",
            "order_id": "order-789",
            "event_id": synced_event.eventbrite_id,
            "ticket_class_name": "General admission",
            "profile": {
                "name": "Nora Ali",
                "email": "nora@example.com",
            },
            "status": "Attending",
            "checked_in": False,
            "cancelled": False,
            "refunded": False,
            "created": "2026-07-15T10:30:00Z",
        }]
        self.client.force_authenticate(self.admin)

        response = self.client.get("/api/admin/eventbrite/attendees", {"refresh": "1"})

        self.assertEqual(response.status_code, 200, response.data)
        self.assertFalse(response.data["is_stale"])
        attendee = response.data["results"][0]
        self.assertEqual(attendee["name"], "Nora Ali")
        self.assertEqual(attendee["event_name"], synced_event.title)
        self.assertEqual(attendee["reference"], "EB-order-789")
        self.assertEqual(attendee["ticket_name"], "General admission")
        self.assertEqual(attendee["source"], "eventbrite")

        cache.clear()
        cached_response = self.client.get("/api/admin/eventbrite/attendees")
        self.assertEqual(cached_response.status_code, 200)
        self.assertTrue(cached_response.data["is_stale"])
        self.assertEqual(cached_response.data["results"][0]["name"], "Nora Ali")
        self.assertEqual(EventbriteAttendeeSnapshot.objects.count(), 1)
        self.assertEqual(get_client.call_count, 1)
        get_client.return_value.get_organization_attendees.assert_called_once_with(
            organization_id="org-123",
        )

    @override_settings(EVENTBRITE_ORGANIZATION_ID="org-123")
    @patch("events.views.get_configured_client")
    def test_eventbrite_title_is_resolved_when_event_is_not_synced_locally(self, get_client):
        get_client.return_value.get_organization_attendees.return_value = [{
            "id": "attendee-999",
            "order_id": "order-999",
            "event_id": "remote-event-999",
            "profile": {"name": "Nora Ali", "email": "nora@example.com"},
            "status": "Attending",
            "created": "2026-07-15T10:30:00Z",
        }]
        get_client.return_value.get_organization_events.return_value = [{
            "id": "remote-event-999",
            "name": {"text": "Eventbrite Risk Masterclass"},
        }]
        self.client.force_authenticate(self.admin)

        response = self.client.get("/api/admin/eventbrite/attendees", {"refresh": "1"})

        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["results"][0]["event_name"], "Eventbrite Risk Masterclass")
        self.assertEqual(response.data["results"][0]["reference"], "EB-order-999")

    def test_non_staff_cannot_view_eventbrite_attendees(self):
        self.client.force_authenticate(self.member)
        response = self.client.get("/api/admin/eventbrite/attendees")
        self.assertEqual(response.status_code, 403)


class EventPageContentApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def save_content(self, *, is_active=True):
        return EventPageContent.objects.update_or_create(
            key="main",
            defaults={
                "featured_programme": {
                    "eyebrow": "Database programme",
                    "title": "Database title",
                    "description": "Database programme description.",
                    "image_url": "https://example.com/programme.jpg",
                    "image_alt": "Database programme",
                    "highlights": [{
                        "icon": "highlight-icon",
                        "title": "Database highlight",
                        "description": "Database highlight description.",
                    }],
                },
                "formats": [{
                    "icon": "format-icon",
                    "title": "Database format",
                    "description": "Database format description.",
                    "image": "https://example.com/format.jpg",
                }],
                "audiences": [{
                    "icon": "audience-icon",
                    "title": "Database audience",
                    "description": "Database audience description.",
                }],
                "is_active": is_active,
            },
        )

    def test_public_endpoint_returns_active_database_content(self):
        self.save_content()
        response = self.client.get("/api/events/content")

        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["featured_programme"]["title"], "Database title")
        self.assertEqual(response.data["formats"][0]["title"], "Database format")
        self.assertEqual(response.data["audiences"][0]["title"], "Database audience")

    def test_inactive_content_is_not_public(self):
        self.save_content(is_active=False)
        self.assertEqual(self.client.get("/api/events/content").status_code, 404)


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class EventRegistrationFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.event = Event.objects.create(
            title="IPC Cost Controls Workshop",
            slug="ipc-cost-controls-workshop",
            event_type=Event.EventType.LONDON_MASTER_CLASS,
            description="A practical controls workshop.",
            starts_at=timezone.now() + timedelta(days=14),
            ends_at=timezone.now() + timedelta(days=14, hours=2),
            capacity=3,
            is_published=True,
            status="live",
        )
        self.payload = {
            "quantity": 2,
            "contact": {
                "first_name": "Nora", "last_name": "Ali", "email": "nora@example.com",
                "mobile": "+44 7700 900123", "company": "Controls Ltd", "job_title": "Planner", "city": "London",
            },
            "attendees": [
                {"first_name": "Nora", "last_name": "Ali", "email": "nora@example.com", "mobile": "", "company": "", "job_title": "", "city": "", "dietary_access_needs": ""},
                {"first_name": "Omar", "last_name": "Said", "email": "omar@example.com", "mobile": "", "company": "", "job_title": "", "city": "", "dietary_access_needs": "Step-free access"},
            ],
            "answers": [],
            "marketing_consent": False,
            "terms_accepted": True,
        }

    def post_registration(self, key="12345678-1234-1234-1234-123456789abc"):
        return self.client.post(
            f"/api/events/{self.event.slug}/register",
            self.payload,
            format="json",
            HTTP_IDEMPOTENCY_KEY=key,
        )

    def test_registration_config_exposes_live_availability(self):
        response = self.client.get(f"/api/events/{self.event.slug}/registration")
        self.assertEqual(response.status_code, 200, response.data)
        self.assertTrue(response.data["registration_is_open"])
        self.assertEqual(response.data["available_places"], 3)

    def test_success_creates_one_order_attendees_reference_and_email(self):
        with self.captureOnCommitCallbacks(execute=True):
            response = self.post_registration()
        self.assertEqual(response.status_code, 201, response.data)
        registration = EventRegistration.objects.get()
        self.assertTrue(registration.reference.startswith("IPC-EVT-"))
        self.assertEqual(registration.quantity, 2)
        self.assertEqual(registration.attendees.count(), 2)
        self.assertEqual(registration.status, EventRegistration.Status.CONFIRMED)
        self.assertEqual(registration.confirmation_email_status, EventRegistration.EmailStatus.SENT)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(registration.reference, mail.outbox[0].subject)

    def test_same_idempotency_key_returns_original_without_duplicate(self):
        first = self.post_registration()
        second = self.post_registration()
        self.assertEqual(first.status_code, 201, first.data)
        self.assertEqual(second.status_code, 200, second.data)
        self.assertEqual(first.data["reference"], second.data["reference"])
        self.assertEqual(EventRegistration.objects.count(), 1)

    def test_capacity_is_enforced_by_quantity(self):
        self.post_registration()
        response = self.post_registration("22345678-1234-1234-1234-123456789abc")
        self.assertEqual(response.status_code, 400, response.data)
        self.assertIn("quantity", response.data)

    def test_attendee_count_must_match_quantity(self):
        self.payload["attendees"] = self.payload["attendees"][:1]
        response = self.post_registration()
        self.assertEqual(response.status_code, 400, response.data)
        self.assertIn("attendees", response.data)

    def test_eventbrite_event_cannot_use_local_registration(self):
        self.event.eventbrite_id = "eb-123"
        self.event.save(update_fields=["eventbrite_id"])
        response = self.post_registration()
        self.assertEqual(response.status_code, 400, response.data)

    def test_guest_detail_and_calendar_require_access_token(self):
        response = self.post_registration()
        reference = response.data["reference"]
        token = response.data["access_token"]
        self.assertEqual(self.client.get(f"/api/events/registrations/{reference}").status_code, 404)
        detail = self.client.get(f"/api/events/registrations/{reference}?token={token}")
        self.assertEqual(detail.status_code, 200, detail.data)
        calendar = self.client.get(f"/api/events/registrations/{reference}/calendar?token={token}")
        self.assertEqual(calendar.status_code, 200)
        self.assertEqual(calendar["Content-Type"], "text/calendar; charset=utf-8")

    @patch("events.services.registration_email.EmailMultiAlternatives.send", side_effect=RuntimeError("mail provider unavailable"))
    def test_email_failure_does_not_rollback_confirmed_booking(self, _send):
        with self.captureOnCommitCallbacks(execute=True):
            response = self.post_registration()
        self.assertEqual(response.status_code, 201, response.data)
        registration = EventRegistration.objects.get()
        self.assertEqual(registration.status, EventRegistration.Status.CONFIRMED)
        self.assertEqual(registration.confirmation_email_status, EventRegistration.EmailStatus.FAILED)
