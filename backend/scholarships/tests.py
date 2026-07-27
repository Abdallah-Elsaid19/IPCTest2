from rest_framework.test import APITestCase

from .models import ScholarshipContent


class ScholarshipContentApiTests(APITestCase):
    def test_public_endpoint_returns_active_database_content(self):
        ScholarshipContent.objects.update_or_create(
            key="main",
            defaults={
                "audiences": [{
                    "icon": "ri-test-audience-line",
                    "title": "Audience from database",
                    "description": "Audience description from database.",
                }],
                "values": [{
                    "icon": "ri-test-value-line",
                    "title": "Value from database",
                    "description": "Value description from database.",
                }],
                "fund": {
                    "eyebrow": "Funding model from database",
                    "title": "Database funding title",
                },
                "is_active": True,
            },
        )

        response = self.client.get("/api/scholarships")

        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["audiences"][0]["title"], "Audience from database")
        self.assertEqual(response.data["values"][0]["title"], "Value from database")
        self.assertEqual(response.data["fund"]["title"], "Database funding title")

    def test_inactive_content_is_not_public(self):
        ScholarshipContent.objects.update_or_create(
            key="main",
            defaults={
                "audiences": [{"icon": "icon", "title": "Audience", "description": "Description"}],
                "values": [{"icon": "icon", "title": "Value", "description": "Description"}],
                "is_active": False,
            },
        )

        self.assertEqual(self.client.get("/api/scholarships").status_code, 404)
