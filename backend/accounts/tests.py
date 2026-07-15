from django.contrib.auth import get_user_model
from django.test import override_settings
from django.core.cache import cache
from unittest.mock import patch
from urllib.parse import parse_qs, urlparse
from rest_framework.test import APIClient, APITestCase
from clubs.models import ClubEnquiry
from contact.models import ContactSubmission


@override_settings(AUTH_COOKIE_SECURE=False)
class AuthenticationApiTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="ipc.member",
            email="member@example.com",
            password="Strong-Test-Pass-938!",
            first_name="Amina",
        )
        self.client = APIClient(enforce_csrf_checks=True)
        self.client.get("/api/csrf")
        self.csrf = self.client.cookies["csrftoken"].value

    def post(self, path, data=None):
        return self.client.post(path, data or {}, format="json", HTTP_X_CSRFTOKEN=self.csrf)

    def test_login_sets_httponly_tokens_and_returns_safe_user(self):
        response = self.post("/api/auth/login", {
            "email": "MEMBER@example.com",
            "password": "Strong-Test-Pass-938!",
        })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["user"]["name"], "Amina")
        self.assertNotIn("password", response.data["user"])
        self.assertTrue(response.cookies["ipc_access"]["httponly"])
        self.assertTrue(response.cookies["ipc_refresh"]["httponly"])

    def test_login_rejects_invalid_credentials_without_tokens(self):
        response = self.post("/api/auth/login", {
            "email": "member@example.com",
            "password": "incorrect",
        })
        self.assertEqual(response.status_code, 400)
        self.assertNotIn("ipc_access", response.cookies)

    def test_csrf_is_required_for_login(self):
        response = APIClient(enforce_csrf_checks=True).post(
            "/api/auth/login",
            {"email": "member@example.com", "password": "Strong-Test-Pass-938!"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)

    def test_me_refresh_and_logout_flow(self):
        self.post("/api/auth/login", {
            "email": "member@example.com",
            "password": "Strong-Test-Pass-938!",
        })
        self.assertEqual(self.client.get("/api/auth/me").status_code, 200)

        self.client.cookies.pop("ipc_access")
        self.assertEqual(self.post("/api/auth/refresh").status_code, 204)
        self.assertIn("ipc_access", self.client.cookies)

        self.assertEqual(self.post("/api/auth/logout").status_code, 204)
        self.assertEqual(self.client.get("/api/auth/me").status_code, 401)


class AdminDashboardApiTests(APITestCase):
    def setUp(self):
        cache.clear()
        users = get_user_model()
        self.staff = users.objects.create_user(
            username="dashboard.admin", email="dashboard@example.com", password="test", is_staff=True,
        )
        self.member = users.objects.create_user(
            username="dashboard.member", email="member-dashboard@example.com", password="test",
        )
        ContactSubmission.objects.create(
            name="Test contact", email="contact@example.com", category="Membership", message="Question",
        )
        ClubEnquiry.objects.create(email="club@example.com", message="Club question")

    def test_dashboard_requires_staff_user(self):
        self.assertEqual(self.client.get("/api/admin/dashboard").status_code, 401)
        self.client.force_authenticate(self.member)
        self.assertEqual(self.client.get("/api/admin/dashboard").status_code, 403)

    def test_dashboard_returns_counts_from_real_models(self):
        self.client.force_authenticate(self.staff)
        response = self.client.get("/api/admin/dashboard")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["counts"]["users"], 2)
        self.assertEqual(response.data["counts"]["contact_submissions"], 1)
        self.assertEqual(response.data["counts"]["club_enquiries"], 1)
        self.assertEqual(len(response.data["recent_enquiries"]), 2)


@override_settings(
    FRONTEND_URL="https://ipc.example.com",
    GRAPH_TENANT_ID="tenant",
    GRAPH_CLIENT_ID="client",
    GRAPH_CLIENT_SECRET="secret",
    GRAPH_SENDER="office@ipc.example.com",
)
class AdminUserManagementApiTests(APITestCase):
    def setUp(self):
        users = get_user_model()
        self.staff = users.objects.create_user(
            username="users.admin", email="users-admin@example.com", password="test", is_staff=True,
        )
        self.member = users.objects.create_user(
            username="users.member", email="users-member@example.com", password="Old-Password-938!",
            first_name="Existing",
        )

    def test_user_management_requires_staff(self):
        self.assertEqual(self.client.get("/api/admin/users").status_code, 401)
        self.client.force_authenticate(self.member)
        self.assertEqual(self.client.get("/api/admin/users").status_code, 403)

    def test_staff_can_search_and_paginate_real_users(self):
        self.client.force_authenticate(self.staff)
        response = self.client.get("/api/admin/users", {"search": "Existing"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], self.member.pk)

    def test_create_user_uses_existing_user_and_admin_profile_models(self):
        self.client.force_authenticate(self.staff)
        response = self.client.post("/api/admin/users", {
            "username": "new.reviewer",
            "email": "new-reviewer@example.com",
            "first_name": "New",
            "last_name": "Reviewer",
            "is_staff": True,
            "is_active": True,
            "role": "reviewer",
        }, format="json")
        self.assertEqual(response.status_code, 201)
        created = get_user_model().objects.get(pk=response.data["id"])
        self.assertFalse(created.has_usable_password())
        self.assertEqual(created.admin_profile.role, "reviewer")

    def test_admin_cannot_delete_self(self):
        self.client.force_authenticate(self.staff)
        response = self.client.delete(f"/api/admin/users/{self.staff.pk}")
        self.assertEqual(response.status_code, 400)
        self.assertTrue(get_user_model().objects.filter(pk=self.staff.pk).exists())

    @patch("accounts.user_management.send_password_reset_email")
    def test_password_reset_email_and_single_use_confirmation(self, send_email):
        self.client.force_authenticate(self.staff)
        response = self.client.post(f"/api/admin/users/{self.member.pk}/send-password-reset", {}, format="json")
        self.assertEqual(response.status_code, 200)
        reset_url = send_email.call_args.kwargs["reset_url"]
        query = parse_qs(urlparse(reset_url).query)
        payload = {"uid": query["uid"][0], "token": query["token"][0], "password": "New-Secure-Password-482!"}

        self.client.force_authenticate(user=None)
        confirm = self.client.post("/api/auth/password-reset/confirm", payload, format="json")
        self.assertEqual(confirm.status_code, 200)
        self.member.refresh_from_db()
        self.assertTrue(self.member.check_password("New-Secure-Password-482!"))
        self.assertEqual(self.client.post("/api/auth/password-reset/confirm", payload, format="json").status_code, 400)
