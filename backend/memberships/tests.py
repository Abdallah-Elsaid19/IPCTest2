from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .models import MembershipGrade


def create_grade(code, display_order=0, is_active=True, **overrides):
    defaults = {
        "slug": code.lower().replace("_", "-"),
        "title": f"{code} membership",
        "short_title": code,
        "description": f"{code} description",
        "image_url": "/images/membership/grade.webp",
        "post_nominal": code,
        "pathway_title": f"{code} pathway",
        "pathway_description": f"{code} pathway description",
        "display_order": display_order,
        "is_active": is_active,
    }
    defaults.update(overrides)
    grade, _ = MembershipGrade.objects.update_or_create(code=code, defaults=defaults)
    return grade


class AdminMembershipGradeApiTests(APITestCase):
    def setUp(self):
        users = get_user_model()
        self.admin = users.objects.create_user(
            username="grades.admin", email="grades-admin@example.com", password="test", is_staff=True,
        )
        self.member = users.objects.create_user(
            username="grades.member", email="grades-member@example.com", password="test",
        )
        self.grade = create_grade("AffIPC")

    def test_admin_can_list_and_update_membership_grades(self):
        self.client.force_authenticate(self.admin)

        listing = self.client.get("/api/admin/membership-grades")
        updated = self.client.patch(
            f"/api/admin/membership-grades/{self.grade.pk}",
            {"short_title": "Affiliate membership", "display_order": 2},
            format="json",
        )

        self.assertEqual(listing.status_code, 200, listing.data)
        self.assertEqual(updated.status_code, 200, updated.data)
        self.assertEqual(updated.data["short_title"], "Affiliate membership")
        self.assertEqual(updated.data["display_order"], 2)

    def test_non_staff_cannot_manage_membership_grades(self):
        self.client.force_authenticate(self.member)
        self.assertEqual(self.client.get("/api/admin/membership-grades").status_code, 403)

    def test_admin_membership_grades_cannot_be_deleted(self):
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.client.delete(f"/api/admin/membership-grades/{self.grade.pk}").status_code, 405)


class PublicMembershipGradeApiTests(APITestCase):
    def test_public_list_uses_active_database_grades_in_display_order(self):
        create_grade("AffIPC", display_order=20)
        create_grade(
            "MIPC",
            display_order=10,
            short_title="Professional from database",
        )
        create_grade("FIPC", display_order=5, is_active=False)

        response = self.client.get("/api/membership-grades")

        self.assertEqual(response.status_code, 200, response.data)
        codes = [grade["code"] for grade in response.data]
        self.assertLess(codes.index("MIPC"), codes.index("AffIPC"))
        self.assertNotIn("FIPC", codes)
        self.assertEqual(response.data[codes.index("MIPC")]["short_title"], "Professional from database")
