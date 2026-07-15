import base64
import html as html_lib
import re
from email import policy
from email.parser import BytesParser
from urllib.parse import parse_qs, urlparse

from django.contrib.auth import get_user_model
from django.test import SimpleTestCase, override_settings
from django.core.cache import cache
from django.db import connection
from django.test.utils import CaptureQueriesContext
from django.utils import timezone
from unittest.mock import patch
from rest_framework.test import APIClient, APITestCase
from clubs.models import ClubEnquiry
from contact.models import ContactSubmission
from applications.models import Application, FormDefinition
from memberships.models import MembershipGrade
from accounts.graph_mail import (
    GraphMailError,
    send_enquiry_reply_email,
    send_membership_welcome_email,
)


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

    @patch("accounts.dashboard.send_enquiry_reply_email")
    def test_staff_can_reply_to_contact_enquiry(self, send_reply):
        enquiry = ContactSubmission.objects.get(email="contact@example.com")
        self.client.force_authenticate(self.staff)

        response = self.client.post(
            f"/api/admin/enquiries/contact/{enquiry.pk}/reply",
            {"message": "Thank you for contacting IPC. We will help with your membership question."},
            format="json",
        )

        self.assertEqual(response.status_code, 200, response.data)
        enquiry.refresh_from_db()
        self.assertEqual(enquiry.status, ContactSubmission.Status.IN_PROGRESS)
        self.assertEqual(enquiry.handled_by, self.staff)
        self.assertEqual(send_reply.call_args.kwargs["recipient"], enquiry.email)
        self.assertEqual(send_reply.call_args.kwargs["administrator_name"], "dashboard.admin")

    @patch("accounts.dashboard.send_enquiry_reply_email", side_effect=GraphMailError("Graph unavailable"))
    def test_failed_reply_does_not_change_enquiry_status(self, send_reply):
        enquiry = ClubEnquiry.objects.get(email="club@example.com")
        self.client.force_authenticate(self.staff)

        response = self.client.post(
            f"/api/admin/enquiries/club/{enquiry.pk}/reply",
            {"message": "This message should not mark the enquiry as contacted."},
            format="json",
        )

        self.assertEqual(response.status_code, 503, response.data)
        enquiry.refresh_from_db()
        self.assertEqual(enquiry.status, ClubEnquiry.Status.NEW)

    def test_non_staff_cannot_reply_to_enquiry(self):
        enquiry = ContactSubmission.objects.get(email="contact@example.com")
        self.client.force_authenticate(self.member)
        response = self.client.post(
            f"/api/admin/enquiries/contact/{enquiry.pk}/reply",
            {"message": "Unauthorised reply attempt."},
            format="json",
        )
        self.assertEqual(response.status_code, 403)


@override_settings(
    FRONTEND_URL="https://ipc.example.com",
    GRAPH_TENANT_ID="tenant",
    GRAPH_CLIENT_ID="client",
    GRAPH_CLIENT_SECRET="secret",
    GRAPH_SENDER="office@ipc.example.com",
)
class AdminUserManagementApiTests(APITestCase):
    def setUp(self):
        cache.clear()
        users = get_user_model()
        self.staff = users.objects.create_user(
            username="users.admin", email="users-admin@example.com", password="test", is_staff=True,
        )
        self.member = users.objects.create_user(
            username="users.member", email="users-member@example.com", password="Old-Password-938!",
            first_name="Existing",
        )

    def link_member_application(self):
        form = FormDefinition.objects.get(code="AffIPC", version=1)
        return Application.objects.create(
            form_definition=form,
            form_version=form.version,
            membership_grade=MembershipGrade.objects.get(code="AffIPC"),
            status="approved",
            first_name="Existing",
            last_name="Member",
            email="personal-member@example.com",
            grade_specific_data={"professional_status": "Student"},
            code_of_conduct_consent=True,
            privacy_consent=True,
            approved_user=self.member,
            approved_by=self.staff,
            approved_at=timezone.now(),
            account_created_at=self.member.date_joined,
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

    def test_users_api_returns_relationship_reference_and_supports_search(self):
        application = self.link_member_application()
        self.client.force_authenticate(self.staff)
        response = self.client.get(
            "/api/admin/users",
            {"search": application.application_reference},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        user = response.data["results"][0]
        self.assertEqual(user["membership_reference"], application.application_reference)
        self.assertEqual(user["membership_application_id"], application.pk)
        self.assertEqual(user["membership_grade"], "AffIPC")
        self.assertEqual(user["personal_email"], application.email)
        self.assertEqual(user["ipc_email"], self.member.email)

    def test_users_without_applications_return_null_reference(self):
        self.client.force_authenticate(self.staff)
        response = self.client.get(f"/api/admin/users/{self.staff.pk}")
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.data["membership_reference"])
        self.assertIsNone(response.data["membership_application_id"])

    def test_reference_cannot_be_updated_through_user_api(self):
        application = self.link_member_application()
        original_reference = application.application_reference
        self.client.force_authenticate(self.staff)
        response = self.client.patch(
            f"/api/admin/users/{self.member.pk}",
            {"membership_reference": "IPC-MANUAL-CHANGE"},
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.data)
        application.refresh_from_db()
        self.assertEqual(application.application_reference, original_reference)

    def test_user_list_relationships_do_not_create_n_plus_one_queries(self):
        self.link_member_application()
        self.client.force_authenticate(self.staff)
        with CaptureQueriesContext(connection) as queries:
            response = self.client.get("/api/admin/users")
        self.assertEqual(response.status_code, 200)
        self.assertLessEqual(len(queries), 4)

    def test_create_admin_uses_existing_user_and_admin_profile_models(self):
        self.client.force_authenticate(self.staff)
        response = self.client.post("/api/admin/users", {
            "username": "new.admin",
            "email": "new-admin@example.com",
            "first_name": "New",
            "last_name": "Admin",
            "is_active": True,
            "role": "admin",
        }, format="json")
        self.assertEqual(response.status_code, 201)
        created = get_user_model().objects.get(pk=response.data["id"])
        self.assertFalse(created.has_usable_password())
        self.assertTrue(created.is_staff)
        self.assertEqual(created.admin_profile.role, "admin")

    def test_create_user_role_does_not_grant_staff_access(self):
        self.client.force_authenticate(self.staff)
        response = self.client.post("/api/admin/users", {
            "username": "new.user",
            "email": "new-user@example.com",
            "first_name": "New",
            "last_name": "User",
            "is_active": True,
            "role": "user",
        }, format="json")

        self.assertEqual(response.status_code, 201)
        created = get_user_model().objects.get(pk=response.data["id"])
        self.assertFalse(created.is_staff)
        self.assertEqual(created.admin_profile.role, "user")

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

    @patch("accounts.user_management.send_password_reset_email")
    def test_password_reset_for_linked_member_uses_personal_email(self, send_email):
        application = self.link_member_application()
        self.client.force_authenticate(self.staff)
        response = self.client.post(
            f"/api/admin/users/{self.member.pk}/send-password-reset",
            {},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(send_email.call_args.kwargs["recipient"], application.email)


@override_settings(
    GRAPH_SENDER="office@ipc.example.com",
    PASSWORD_RESET_EXPIRE_MINUTES=30,
)
class MembershipWelcomeMailTests(SimpleTestCase):
    @patch("accounts.graph_mail.requests.post")
    @patch("accounts.graph_mail._access_token", return_value="token")
    def test_welcome_email_contains_plain_and_html_secure_account_details(
        self,
        access_token,
        post,
    ):
        post.return_value.status_code = 202
        send_membership_welcome_email(
            recipient="personal@example.com",
            name="Nora Ali",
            application_reference="IPC-REFERENCE01",
            membership_grade="MIPC",
            username="nora.ali",
            ipc_email="nora@ipc.invalid",
            reset_url="https://ipc.example.com/reset-password?uid=abc&token=secure-token",
        )

        encoded = post.call_args.kwargs["data"]
        message = BytesParser(policy=policy.default).parsebytes(
            base64.b64decode(encoded)
        )
        self.assertTrue(message.is_multipart())
        self.assertIn(b"\r\n", base64.b64decode(encoded))
        for part in message.iter_parts():
            self.assertEqual(part["Content-Transfer-Encoding"], "base64")
        plain = message.get_body(preferencelist=("plain",)).get_content()
        html = message.get_body(preferencelist=("html",)).get_content()
        for content in (plain, html):
            self.assertIn("IPC-REFERENCE01", content)
            self.assertIn("nora@ipc.invalid", content)
            self.assertIn("nora.ali", content)
            self.assertIn("reset-password", content)
            self.assertNotIn("PlainTextPassword123", content)
        self.assertIn("Membership Grade: MIPC", plain)
        self.assertIn("<strong>Membership Grade:</strong> MIPC", html)
        href = re.search(r'href="([^"]*reset-password[^"]*)"', html)
        self.assertIsNotNone(href)
        query = parse_qs(urlparse(html_lib.unescape(href.group(1))).query)
        self.assertEqual(query, {"uid": ["abc"], "token": ["secure-token"]})
        self.assertEqual(message["To"], "personal@example.com")
        self.assertEqual(message["Subject"], "Your IPC Membership Account Is Ready")

    @patch("accounts.graph_mail.requests.post")
    @patch("accounts.graph_mail._access_token", return_value="token")
    def test_enquiry_reply_contains_admin_signature_and_reply_to(self, access_token, post):
        post.return_value.status_code = 202
        send_enquiry_reply_email(
            recipient="enquirer@example.com",
            recipient_name="Nora Ali",
            enquiry_subject="Membership",
            message_body="Thank you for your enquiry.\nWe will contact you shortly.",
            administrator_name="IPC Admin",
            reply_to="admin@example.com",
        )

        message = BytesParser(policy=policy.default).parsebytes(
            base64.b64decode(post.call_args.kwargs["data"])
        )
        plain = message.get_body(preferencelist=("plain",)).get_content()
        html = message.get_body(preferencelist=("html",)).get_content()
        self.assertIn("Thank you for your enquiry.", plain)
        self.assertIn("IPC Admin", plain)
        self.assertIn("We will contact you shortly.", html)
        self.assertEqual(message["To"], "enquirer@example.com")
        self.assertEqual(message["Reply-To"], "admin@example.com")
        self.assertEqual(message["Subject"], "Re: Membership")
