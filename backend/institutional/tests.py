from django.urls import reverse
from rest_framework.test import APITestCase

from .models import EmployerContent, PartnershipContent, PublicationContent


class InstitutionalContentApiTests(APITestCase):
    def test_published_pages_are_available(self):
        cases = [
            (EmployerContent, "employer-content", "Employer"),
            (PartnershipContent, "partnership-content", "Partnership"),
            (PublicationContent, "publication-content", "Publication"),
        ]
        for model, route_name, title in cases:
            model.objects.update_or_create(
                key="main",
                defaults={"hero": {"title": title}, "status": "published", "is_active": True},
            )
            response = self.client.get(reverse(route_name))
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.data["hero"]["title"], title)

    def test_draft_and_inactive_pages_are_hidden(self):
        for model, route_name in [
            (EmployerContent, "employer-content"),
            (PartnershipContent, "partnership-content"),
            (PublicationContent, "publication-content"),
        ]:
            content = model.objects.get(key="main")
            content.status = "draft"
            content.save(update_fields=["status"])
            response = self.client.get(reverse(route_name))
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.data, {"is_active": False})
