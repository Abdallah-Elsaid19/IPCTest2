from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .models import AboutPageContent


class AboutPageContentApiTests(APITestCase):
    def content(self, active=True):
        return AboutPageContent.objects.update_or_create(
            key="main",
            defaults={
                "statistics": [{"number": "1", "label": "Database statistic"}],
                "why_exists": [{"icon": "icon", "title": "Why", "description": "From database"}],
                "vision_pillars": [{"icon": "icon", "title": "Vision"}],
                "missions": [{"icon": "icon", "title": "Mission", "description": "From database"}],
                "core_values": [{"icon": "icon", "title": "Value", "description": "From database"}],
                "identity_symbols": [{"icon": "icon", "title": "Identity", "description": "From database"}],
                "is_active": active,
            },
        )

    def test_public_endpoint_returns_active_database_content(self):
        self.content()
        response = self.client.get("/api/about/content")
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["statistics"][0]["label"], "Database statistic")
        self.assertEqual(response.data["missions"][0]["title"], "Mission")

    def test_inactive_content_is_not_public(self):
        self.content(active=False)
        self.assertEqual(self.client.get("/api/about/content").status_code, 404)


class AdminContentManagementApiTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="content-admin",
            email="content-admin@example.com",
            password="test-password",
            is_staff=True,
        )
        self.client.force_authenticate(self.user)

    def test_admin_can_list_content_tables(self):
        response = self.client.get("/api/admin/content")
        self.assertEqual(response.status_code, 200, response.data)
        table_names = {item["table_name"] for item in response.data}
        self.assertIn("about_content", table_names)
        self.assertIn("events_content", table_names)

    def test_admin_can_update_a_valid_content_section(self):
        content = AboutPageContent.objects.get(key="main")
        response = self.client.patch(
            "/api/admin/content/about",
            {"sections": {"statistics": [{"number": "40+", "label": "Countries"}]}},
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.data)
        content.refresh_from_db()
        self.assertEqual(content.statistics[0]["number"], "40+")

    def test_invalid_content_is_rejected(self):
        response = self.client.patch(
            "/api/admin/content/about",
            {"sections": {"statistics": [{"number": "40+"}]}},
            format="json",
        )
        self.assertEqual(response.status_code, 400, response.data)
