from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .models import MembershipGrade


class AdminMembershipGradeApiTests(APITestCase):
    def setUp(self):
        users = get_user_model()
        self.admin = users.objects.create_user(
            username="grades.admin", email="grades-admin@example.com", password="test", is_staff=True,
        )
        self.member = users.objects.create_user(
            username="grades.member", email="grades-member@example.com", password="test",
        )

    def test_admin_can_list_and_update_membership_grades(self):
        grade = MembershipGrade.objects.get(code="AffIPC")
        self.client.force_authenticate(self.admin)

        listing = self.client.get("/api/admin/membership-grades")
        updated = self.client.patch(
            f"/api/admin/membership-grades/{grade.pk}",
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
        grade = MembershipGrade.objects.get(code="AffIPC")
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.client.delete(f"/api/admin/membership-grades/{grade.pk}").status_code, 405)
