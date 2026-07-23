from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .models import ServiceContent


class ServiceContentApiTests(APITestCase):
    def test_admin_endpoint_requires_authentication(self):
        response = self.client.get("/api/admin/content/services")
        self.assertIn(response.status_code, (401, 403))

    def test_public_endpoint_returns_only_published_active_content(self):
        response = self.client.get("/api/services/content")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["hero"]["eyebrow"], "Professional services & programmes")

        content = ServiceContent.objects.get(key="main")
        content.status = ServiceContent.Status.DRAFT
        content.save(update_fields=["status"])
        unavailable = self.client.get("/api/services/content")
        self.assertEqual(unavailable.status_code, 200)
        self.assertEqual(unavailable.data, {"is_active": False})
        self.assertNotIn("hero", unavailable.data)

    def test_admin_can_update_service_content(self):
        admin = get_user_model().objects.create_superuser(
            username="service-admin",
            email="service-admin@example.com",
            password="StrongPassword123!",
        )
        self.client.force_authenticate(admin)
        response = self.client.patch(
            "/api/admin/content/services",
            {"sections": {"hero": {**ServiceContent.objects.get(key="main").hero, "eyebrow": "Updated Services"}}},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["sections"]["hero"]["eyebrow"], "Updated Services")
