from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .models import FundContent


class FundContentApiTests(APITestCase):
    def test_admin_endpoint_requires_authentication(self):
        response = self.client.get("/api/admin/content/fund")
        self.assertIn(response.status_code, (401, 403))

    def test_public_endpoint_returns_only_published_active_content(self):
        response = self.client.get("/api/fund/content")
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["hero"]["eyebrow"], "IPC funded opportunities")

        content = FundContent.objects.get(key="main")
        content.is_active = False
        content.save(update_fields=["is_active"])
        unavailable = self.client.get("/api/fund/content")
        self.assertEqual(unavailable.status_code, 200)
        self.assertEqual(unavailable.data, {"is_active": False})
        self.assertNotIn("hero", unavailable.data)

    def test_admin_can_update_and_publish_fund_content(self):
        admin = get_user_model().objects.create_superuser(
            username="fund-admin",
            email="fund-admin@example.com",
            password="StrongPassword123!",
        )
        self.client.force_authenticate(admin)
        content = FundContent.objects.get(key="main")
        response = self.client.patch(
            "/api/admin/content/fund",
            {
                "status": "published",
                "sections": {"final_cta": {**content.final_cta, "title": "Updated Fund CTA"}},
            },
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["sections"]["final_cta"]["title"], "Updated Fund CTA")
