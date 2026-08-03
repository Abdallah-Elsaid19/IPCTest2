from unittest.mock import patch

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .models import ScholarshipAnnouncementReminder


class ScholarshipAnnouncementReminderTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.admin = user_model.objects.create_user(
            username="reminder-admin",
            email="reminder-admin@example.com",
            password="test",
            is_staff=True,
        )
        self.member = user_model.objects.create_user(
            username="reminder-member",
            email="reminder-member@example.com",
            password="test",
        )

    def test_public_signup_is_saved_and_duplicate_email_is_reused(self):
        first = self.client.post(
            "/api/scholarship-reminders",
            {"email": "Applicant@Example.com", "consent": True},
            format="json",
        )
        second = self.client.post(
            "/api/scholarship-reminders",
            {"email": "applicant@example.com", "consent": True},
            format="json",
        )

        self.assertEqual(first.status_code, 201, first.data)
        self.assertEqual(second.status_code, 201, second.data)
        self.assertEqual(ScholarshipAnnouncementReminder.objects.count(), 1)
        self.assertEqual(ScholarshipAnnouncementReminder.objects.get().email, "applicant@example.com")

    def test_admin_list_is_staff_only(self):
        ScholarshipAnnouncementReminder.objects.create(email="person@example.com")
        self.client.force_authenticate(self.member)
        self.assertEqual(self.client.get("/api/admin/scholarship-reminders").status_code, 403)

        self.client.force_authenticate(self.admin)
        response = self.client.get("/api/admin/scholarship-reminders")
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data[0]["email"], "person@example.com")

    @patch("newsletter.views.send_scholarship_announcement_reminder_email")
    def test_admin_can_send_email_and_delivery_is_recorded(self, send_email):
        reminder = ScholarshipAnnouncementReminder.objects.create(email="person@example.com")
        self.client.force_authenticate(self.admin)

        response = self.client.post(
            f"/api/admin/scholarship-reminders/{reminder.pk}/send-email",
            {},
            format="json",
        )

        self.assertEqual(response.status_code, 200, response.data)
        send_email.assert_called_once_with(recipient="person@example.com")
        reminder.refresh_from_db()
        self.assertEqual(reminder.email_send_count, 1)
        self.assertIsNotNone(reminder.last_email_sent_at)
