from django.core.cache import cache
from django.contrib.auth import get_user_model
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from .models import ClubEnquiry, ClubPageContent


class ClubPageContentApiTests(APITestCase):
    def test_public_endpoint_returns_active_database_content(self):
        ClubPageContent.objects.update_or_create(
            key="main",
            defaults={
                "regional_clubs": [{
                    "icon": "ri-map-pin-line",
                    "name": "Database club",
                    "description": "Club description from database.",
                    "label": "Regional",
                }],
                "activities": [{
                    "icon": "ri-test-line",
                    "title": "Database activity",
                    "description": "Activity description from database.",
                }],
                "audience_values": [{
                    "icon": "ri-user-line",
                    "title": "Database audience",
                    "description": "Audience description from database.",
                }],
                "is_active": True,
            },
        )

        response = self.client.get("/api/clubs/content")

        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["regional_clubs"][0]["name"], "Database club")
        self.assertEqual(response.data["activities"][0]["title"], "Database activity")
        self.assertEqual(response.data["audience_values"][0]["title"], "Database audience")

    def test_inactive_content_is_not_public(self):
        ClubPageContent.objects.update_or_create(
            key="main",
            defaults={
                "regional_clubs": [{"icon": "icon", "name": "Club", "description": "Description", "label": "Regional"}],
                "activities": [{"icon": "icon", "title": "Activity", "description": "Description"}],
                "audience_values": [{"icon": "icon", "title": "Audience", "description": "Description"}],
                "is_active": False,
            },
        )

        self.assertEqual(self.client.get("/api/clubs/content").status_code, 404)


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class ClubEnquiryApiTests(APITestCase):
    url = "/api/clubs/enquiries/"
    valid_payload = {
        "email": "person@example.com",
        "message": "I would like more information about joining an IPC club.",
        "clubName": "London",
        "clubSlug": "london",
        "pageUrl": "/clubs",
    }

    def setUp(self):
        cache.clear()

    def test_successful_enquiry_creation(self):
        response = self.client.post(self.url, self.valid_payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        self.assertEqual(ClubEnquiry.objects.count(), 1)
        enquiry = ClubEnquiry.objects.get()
        self.assertEqual(enquiry.email, "person@example.com")
        self.assertEqual(enquiry.club_name, "London")
        self.assertEqual(enquiry.status, ClubEnquiry.Status.NEW)

    def test_missing_email_is_rejected(self):
        payload = {**self.valid_payload}
        payload.pop("email")
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data["errors"])

    def test_invalid_email_is_rejected(self):
        response = self.client.post(self.url, {**self.valid_payload, "email": "invalid"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_message_is_rejected(self):
        payload = {**self.valid_payload}
        payload.pop("message")
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("message", response.data["errors"])

    def test_whitespace_only_message_is_rejected(self):
        response = self.client.post(self.url, {**self.valid_payload, "message": "    "}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_short_message_is_rejected(self):
        response = self.client.post(self.url, {**self.valid_payload, "message": "Too short"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_message_over_limit_is_rejected(self):
        response = self.client.post(self.url, {**self.valid_payload, "message": "a" * 2001}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_frontend_cannot_set_status(self):
        response = self.client.post(self.url, {**self.valid_payload, "status": "closed"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(ClubEnquiry.objects.count(), 0)
        self.assertIn("status", response.data["errors"])

    def test_honeypot_is_rejected(self):
        response = self.client.post(self.url, {**self.valid_payload, "website": "https://spam.example"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(ClubEnquiry.objects.count(), 0)

    def test_rate_limit_is_enforced(self):
        for index in range(5):
            payload = {**self.valid_payload, "email": f"person{index}@example.com"}
            self.assertEqual(self.client.post(self.url, payload, format="json").status_code, status.HTTP_201_CREATED)

        response = self.client.post(self.url, {**self.valid_payload, "email": "blocked@example.com"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    def test_https_localhost_origin_with_authenticated_session_and_csrf(self):
        user = get_user_model().objects.create_user(username="club-admin", password="test-password")
        self.client.enforce_csrf_checks = True
        self.client.force_login(user)
        self.client.get("/api/csrf", HTTP_ORIGIN="https://localhost:5173")
        csrf_token = self.client.cookies["csrftoken"].value

        response = self.client.post(
            self.url,
            self.valid_payload,
            format="json",
            HTTP_ORIGIN="https://localhost:5173",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
