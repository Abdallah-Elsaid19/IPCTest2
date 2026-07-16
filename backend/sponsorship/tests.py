from rest_framework.test import APITestCase

from .models import SponsorshipContent


ROUTES = [{"icon": "route-icon", "title": "Database route", "description": "Route description"}]
PARTNERS = [{"type": "Database partner", "benefits": "Partner benefits"}]
INTEGRITY = [{"icon": "integrity-icon", "title": "Database principle", "description": "Principle description"}]


class SponsorshipContentApiTests(APITestCase):
    def save_content(self, *, is_active=True):
        return SponsorshipContent.objects.update_or_create(
            key="main",
            defaults={
                "routes": ROUTES,
                "partner_types": PARTNERS,
                "integrity_principles": INTEGRITY,
                "is_active": is_active,
            },
        )

    def test_public_endpoint_returns_active_database_content(self):
        self.save_content()

        response = self.client.get("/api/sponsorship")

        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["routes"][0]["title"], "Database route")
        self.assertEqual(response.data["partner_types"][0]["type"], "Database partner")
        self.assertEqual(response.data["integrity_principles"][0]["title"], "Database principle")

    def test_inactive_content_is_not_public(self):
        self.save_content(is_active=False)
        self.assertEqual(self.client.get("/api/sponsorship").status_code, 404)

