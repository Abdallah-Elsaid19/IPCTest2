from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

from .models import AwardCategory, AwardProgramme, AwardsInterest


class AwardsInterestApiTests(APITestCase):
    def setUp(self):
        self.category = AwardCategory.objects.get(slug="academic")
        self.active_programme = AwardProgramme.objects.create(
            title="IPC Project Controls Team of the Year",
            slug="project-controls-team-of-the-year",
            category=self.category,
            is_active=True,
        )
        self.inactive_programme = AwardProgramme.objects.create(
            title="Closed award",
            slug="closed-award",
            category=self.category,
            is_active=False,
        )

    def payload(self, programme):
        return {
            "name": "Award applicant",
            "email": "applicant@example.com",
            "programme": programme.pk,
            "interest_type": AwardsInterest.InterestType.NOMINATE,
            "message": "I would like to submit a nomination for this award.",
        }

    def test_programme_list_only_contains_active_awards(self):
        response = self.client.get("/api/award-programmes")

        self.assertEqual(response.status_code, 200, response.data)
        ids = [item["id"] for item in response.data]
        self.assertIn(self.active_programme.pk, ids)
        self.assertNotIn(self.inactive_programme.pk, ids)

    def test_interest_saves_selected_award_programme(self):
        response = self.client.post(
            "/api/awards/interest",
            self.payload(self.active_programme),
            format="json",
        )

        self.assertEqual(response.status_code, 201, response.data)
        interest = AwardsInterest.objects.get(pk=response.data["id"])
        self.assertEqual(interest.programme, self.active_programme)

    def test_interest_rejects_inactive_award_programme(self):
        response = self.client.post(
            "/api/awards/interest",
            self.payload(self.inactive_programme),
            format="json",
        )

        self.assertEqual(response.status_code, 400, response.data)
        self.assertIn("programme", response.data)

    def test_interest_requires_award_programme(self):
        payload = self.payload(self.active_programme)
        payload.pop("programme")

        response = self.client.post("/api/awards/interest", payload, format="json")

        self.assertEqual(response.status_code, 400, response.data)
        self.assertIn("programme", response.data)

    def test_staff_can_create_and_update_award_programme(self):
        staff = get_user_model().objects.create_user(
            username="awards.admin",
            email="awards-admin@example.com",
            password="test",
            is_staff=True,
        )
        self.client.force_authenticate(staff)
        payload = {
            "title": "IPC Innovation Award",
            "category": "commercial",
            "description": "Recognises innovation in professional project controls practice.",
            "criteria": ["Evidence of measurable improvement"],
            "is_active": True,
        }

        create_response = self.client.post(
            "/api/admin/award-programmes",
            payload,
            format="json",
        )
        self.assertEqual(create_response.status_code, 201, create_response.data)
        self.assertEqual(create_response.data["slug"], "ipc-innovation-award")

        update_response = self.client.patch(
            f"/api/admin/award-programmes/{create_response.data['id']}",
            {"is_active": False},
            format="json",
        )
        self.assertEqual(update_response.status_code, 200, update_response.data)
        self.assertFalse(update_response.data["is_active"])

        delete_response = self.client.delete(
            f"/api/admin/award-programmes/{create_response.data['id']}",
        )
        self.assertEqual(delete_response.status_code, 204)
        self.assertFalse(
            AwardProgramme.objects.filter(pk=create_response.data["id"]).exists()
        )

    def test_admin_programme_requires_all_editable_fields(self):
        staff = get_user_model().objects.create_user(
            username="required-fields.admin",
            email="required-fields@example.com",
            password="test",
            is_staff=True,
        )
        self.client.force_authenticate(staff)

        response = self.client.post(
            "/api/admin/award-programmes",
            {
                "title": "Incomplete award",
                "category": "professional",
                "description": "",
                "criteria": [],
                "is_active": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400, response.data)
        self.assertIn("description", response.data)
        self.assertIn("criteria", response.data)

    def test_public_categories_only_include_active_records(self):
        inactive = AwardCategory.objects.create(
            title="Hidden category",
            slug="hidden-category",
            description="This category is not visible on the public website.",
            image_url="https://example.com/hidden.jpg",
            icon_class="ri-award-line",
            highlights=["Hidden award"],
            is_active=False,
            sort_order=99,
        )

        response = self.client.get("/api/award-categories")

        self.assertEqual(response.status_code, 200, response.data)
        ids = [item["id"] for item in response.data]
        self.assertNotIn(inactive.pk, ids)
        self.assertIn(self.category.pk, ids)

    def test_staff_can_manage_unused_award_category(self):
        staff = get_user_model().objects.create_user(
            username="category.admin",
            email="category-admin@example.com",
            password="test",
            is_staff=True,
        )
        self.client.force_authenticate(staff)
        payload = {
            "title": "Community Awards",
            "description": "Recognises contributions to the project controls community.",
            "image_url": "https://example.com/community.jpg",
            "icon_class": "ri-community-line",
            "highlights": ["Community contribution"],
            "is_active": True,
            "sort_order": 50,
        }

        created = self.client.post("/api/admin/award-categories", payload, format="json")
        self.assertEqual(created.status_code, 201, created.data)
        self.assertEqual(created.data["slug"], "community-awards")

        updated = self.client.patch(
            f"/api/admin/award-categories/{created.data['id']}",
            {**payload, "title": "Community Recognition", "is_active": False},
            format="json",
        )
        self.assertEqual(updated.status_code, 200, updated.data)
        self.assertFalse(updated.data["is_active"])

        deleted = self.client.delete(f"/api/admin/award-categories/{created.data['id']}")
        self.assertEqual(deleted.status_code, 204)

    def test_category_used_by_programme_cannot_be_deleted(self):
        staff = get_user_model().objects.create_user(
            username="protected-category.admin",
            email="protected-category@example.com",
            password="test",
            is_staff=True,
        )
        self.client.force_authenticate(staff)

        response = self.client.delete(f"/api/admin/award-categories/{self.category.pk}")

        self.assertEqual(response.status_code, 409, response.data)
        self.assertTrue(AwardCategory.objects.filter(pk=self.category.pk).exists())
