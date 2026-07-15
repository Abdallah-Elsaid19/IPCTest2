from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core import mail
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient
from datetime import timedelta

from .models import Event, EventRegistration


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

    @override_settings(EVENTBRITE_ORGANIZATION_ID="org-123")
    @patch("events.views.get_configured_client")
    def test_staff_can_view_normalized_eventbrite_attendees(self, get_client):
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

        response = self.client.get("/api/admin/eventbrite/attendees")

        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data[0]["name"], "Nora Ali")
        self.assertEqual(response.data[0]["event_name"], synced_event.title)
        self.assertEqual(response.data[0]["reference"], "EB-order-789")
        self.assertEqual(response.data[0]["ticket_name"], "General admission")
        self.assertEqual(response.data[0]["source"], "eventbrite")

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

        response = self.client.get("/api/admin/eventbrite/attendees")

        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data[0]["event_name"], "Eventbrite Risk Masterclass")
        self.assertEqual(response.data[0]["reference"], "EB-order-999")

    def test_non_staff_cannot_view_eventbrite_attendees(self):
        self.client.force_authenticate(self.member)
        response = self.client.get("/api/admin/eventbrite/attendees")
        self.assertEqual(response.status_code, 403)


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
