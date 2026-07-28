import tempfile

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import IntegrityError, transaction
from django.test import override_settings
from rest_framework.test import APITestCase

from applications.models import Application, FormDefinition
from accounts.models import AdminNotification
from awards.models import AwardCategory, AwardProgramme
from events.models import Event, EventRegistration
from memberships.models import MembershipGrade
from .models import (
    Club, ClubMembership, DiscussionCategory, Scholarship,
    AwardNomination, ScholarshipApplication, SupportTicket, UserDocument, UserNotification,
)


@override_settings(MEDIA_ROOT=tempfile.mkdtemp(prefix="ipc-user-panel-tests-"))
class UserPanelApiTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.user = user_model.objects.create_user(username="member", email="member@example.com", password="Strong-pass-123")
        self.other = user_model.objects.create_user(username="other", email="other@example.com", password="Strong-pass-123")

    def login(self, user=None):
        self.client.force_authenticate(user=user or self.user)

    def test_panel_requires_authentication(self):
        self.assertEqual(self.client.get("/api/user/dashboard").status_code, 401)
        self.assertEqual(self.client.get("/api/user/profile").status_code, 401)

    def test_profile_is_created_and_completion_is_real(self):
        self.login()
        response = self.client.patch("/api/user/profile", {
            "first_name": "Amina", "last_name": "Khan", "job_title": "Procurement Lead",
        }, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["first_name"], "Amina")
        self.assertGreater(response.data["completion"]["percentage"], 0)

    def test_membership_application_saves_draft_and_submits(self):
        grade = MembershipGrade.objects.get(code="AffIPC")
        FormDefinition.objects.get_or_create(code=grade.code, version=1, defaults={"name": "Affiliate form"})
        self.login()
        response = self.client.post("/api/user/membership/applications", {
            "grade": grade.code, "first_name": "Amina", "last_name": "Khan",
            "email": self.user.email, "phone": "07700900123", "country": "United Kingdom",
            "organisation": "IPC", "contact_preference": "email", "grade_specific_data": {},
            "code_of_conduct_consent": True, "privacy_consent": True, "current_step": 4,
        }, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["status"], "draft")
        submitted = self.client.post(
            f"/api/user/membership/applications/{response.data['application_reference']}/submit", {}, format="json",
        )
        self.assertEqual(submitted.status_code, 200)
        self.assertEqual(submitted.data["status"], "submitted")

    def test_duplicate_active_event_booking_is_blocked_by_database(self):
        event = Event.objects.create(
            title="Masterclass", slug="masterclass", event_type=Event.EventType.LONDON_MASTER_CLASS,
        )
        values = {
            "event": event, "registered_user": self.user, "event_name": event.title,
            "event_type": EventRegistration.EventType.LONDON_MASTER_CLASS, "name": "Amina Khan",
            "email": self.user.email,
        }
        EventRegistration.objects.create(**values)
        with self.assertRaises(IntegrityError), transaction.atomic():
            EventRegistration.objects.create(**values)

    def test_booking_api_returns_complete_member_details(self):
        event = Event.objects.create(
            title="Planning Masterclass",
            slug="planning-masterclass",
            event_type=Event.EventType.LONDON_MASTER_CLASS,
            location="London",
            venue_name="IPC Centre",
            timezone="Europe/London",
        )
        booking = EventRegistration.objects.create(
            event=event,
            event_name=event.title,
            event_type=EventRegistration.EventType.LONDON_MASTER_CLASS,
            name="IPC Member",
            email=self.user.email,
            registered_user=self.user,
            status=EventRegistration.Status.CONFIRMED,
            reference="IPC-BOOKING-001",
            ticket_name="Member ticket",
            quantity=2,
            total_amount="50.00",
            payment_status=EventRegistration.PaymentStatus.PAID,
            confirmation_email_status=EventRegistration.EmailStatus.SENT,
        )
        self.login()
        response = self.client.get("/api/user/bookings")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]["reference"], booking.reference)
        self.assertEqual(response.data[0]["venue_name"], event.venue_name)
        self.assertEqual(response.data[0]["ticket_name"], booking.ticket_name)
        self.assertEqual(response.data[0]["payment_status"], "paid")

    def test_scholarship_records_are_owner_scoped_and_lock_after_submit(self):
        scholarship = Scholarship.objects.create(
            title="Leadership Fund", slug="leadership-fund", summary="Summary",
            description="Description", category="Leadership", eligibility="Members",
        )
        other_application = ScholarshipApplication.objects.create(
            scholarship=scholarship, applicant=self.other, statement="Private statement",
        )
        self.login()
        created = self.client.post("/api/user/scholarships/applications", {
            "scholarship": scholarship.slug, "statement": "My professional development goals",
            "responses": {}, "current_step": 2,
        }, format="json")
        self.assertEqual(created.status_code, 201)
        public_id = created.data["public_id"]
        listing = self.client.get("/api/user/scholarships/applications")
        self.assertEqual(len(listing.data), 1)
        self.assertNotEqual(str(other_application.public_id), public_id)
        self.assertEqual(self.client.post(f"/api/user/scholarships/applications/{public_id}/submit", {}, format="json").status_code, 200)
        self.assertEqual(self.client.patch(f"/api/user/scholarships/applications/{public_id}", {"statement": "Changed"}, format="json").status_code, 400)

    def test_club_community_requires_active_membership(self):
        club, _ = Club.objects.update_or_create(
            slug="london",
            defaults={"name": "London Club", "summary": "Summary", "description": "Description", "location": "London"},
        )
        category, _ = DiscussionCategory.objects.get_or_create(club=club, name="General", slug="general")
        self.login()
        self.assertEqual(self.client.get("/api/user/clubs/london/threads").status_code, 403)
        ClubMembership.objects.create(club=club, user=self.user, status=ClubMembership.State.ACTIVE)
        response = self.client.post("/api/user/clubs/london/threads", {
            "category": category.pk, "title": "Procurement insight", "body": "A useful professional discussion.",
        }, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(self.client.get("/api/user/clubs/london/chat").status_code, 200)

        detail = self.client.get("/api/user/clubs/london")
        self.assertEqual(detail.status_code, 200)
        self.assertEqual(detail.data["active_member_count"], 1)
        self.assertEqual(detail.data["discussion_count"], 1)
        self.assertEqual(detail.data["membership_role"], "member")
        self.assertEqual(detail.data["members"][0]["name"], "member")

    def test_join_provisions_a_managed_club_when_record_is_missing(self):
        Club.objects.filter(slug="nottingham").delete()
        self.login()

        response = self.client.post(
            "/api/user/clubs/nottingham/join",
            {
                "professional_role": "Project Controls Engineer",
                "organisation": "IPC",
                "location": "Nottingham",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201, response.data)
        club = Club.objects.get(slug="nottingham")
        self.assertEqual(club.name, "Nottingham Club")
        self.assertEqual(club.categories.count(), 3)
        self.user.panel_profile.refresh_from_db()
        self.assertEqual(self.user.panel_profile.job_title, "Project Controls Engineer")
        self.assertEqual(self.user.panel_profile.employer, "IPC")
        self.assertEqual(self.user.panel_profile.city, "Nottingham")
        self.assertTrue(ClubMembership.objects.filter(
            club=club,
            user=self.user,
            status=ClubMembership.State.PENDING,
        ).exists())

    def test_admin_can_approve_a_pending_club_membership(self):
        club = Club.objects.get(slug="manchester")
        membership_request = ClubMembership.objects.create(
            club=club,
            user=self.user,
            status=ClubMembership.State.PENDING,
        )
        staff = get_user_model().objects.create_user(
            username="club-admin",
            email="club-admin@example.com",
            password="Strong-pass-123",
            is_staff=True,
        )
        self.login(staff)

        listing = self.client.get("/api/admin/club-memberships")
        self.assertEqual(listing.status_code, 200)
        self.assertEqual(listing.data[0]["applicant_email"], self.user.email)

        response = self.client.patch(
            f"/api/admin/club-memberships/{membership_request.pk}",
            {"status": "active"},
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.data)
        membership_request.refresh_from_db()
        self.assertEqual(membership_request.status, ClubMembership.State.ACTIVE)
        self.assertTrue(UserNotification.objects.filter(
            recipient=self.user,
            notification_type="clubmembership",
        ).exists())

    def test_documents_cannot_be_downloaded_by_another_user(self):
        document = UserDocument.objects.create(
            owner=self.user, title="Certificate", category="certificate",
            original_name="certificate.pdf", content_type="application/pdf", file_size=12,
            file=SimpleUploadedFile("certificate.pdf", b"%PDF-1.4 test", content_type="application/pdf"),
        )
        self.login(self.other)
        response = self.client.get(f"/api/user/documents/{document.public_id}/download")
        self.assertEqual(response.status_code, 404)

    def test_notifications_are_owner_scoped_and_can_be_marked_read(self):
        mine = UserNotification.objects.create(recipient=self.user, notification_type="account", title="Welcome", message="Hello")
        UserNotification.objects.create(recipient=self.other, notification_type="account", title="Private", message="Other")
        self.login()
        listing = self.client.get("/api/user/notifications")
        self.assertEqual(listing.status_code, 200)
        self.assertEqual(listing.data["count"], 1)
        self.assertEqual(listing.data["unread_count"], 1)
        self.assertEqual(self.client.post(f"/api/user/notifications/{mine.public_id}/read", {}, format="json").status_code, 200)
        mine.refresh_from_db()
        self.assertTrue(mine.is_read)

    def test_support_ticket_creation_and_scoping(self):
        SupportTicket.objects.create(requester=self.other, category="account", subject="Private")
        self.login()
        response = self.client.post("/api/user/support", {
            "category": "membership", "subject": "Application question",
            "initial_message": "Please help me understand the evidence requirement.",
        }, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["messages"][0]["author_name"], self.user.email)
        self.assertEqual(len(self.client.get("/api/user/support").data), 1)

    def test_admin_and_member_can_chat_on_support_ticket(self):
        admin = get_user_model().objects.create_user(
            username="support-admin",
            email="support@example.com",
            password="Strong-pass-123",
            is_staff=True,
        )
        self.login()
        created = self.client.post("/api/user/support", {
            "category": "account",
            "subject": "Login assistance",
            "initial_message": "Please help me with my account access.",
        }, format="json")
        self.assertEqual(created.status_code, 201)
        ticket_id = created.data["public_id"]

        self.login(admin)
        listing = self.client.get("/api/admin/support")
        self.assertEqual(listing.status_code, 200)
        self.assertEqual(listing.data[0]["requester_email"], self.user.email)
        self.assertEqual(listing.data[0]["unread_count"], 1)
        self.assertTrue(AdminNotification.objects.filter(
            recipient=admin,
            notification_type=AdminNotification.NotificationType.SUPPORT,
        ).exists())
        marked = self.client.post(f"/api/admin/support/{ticket_id}/read", {}, format="json")
        self.assertEqual(marked.status_code, 200)
        self.assertEqual(marked.data["updated"], 1)
        reply = self.client.post(
            f"/api/admin/support/{ticket_id}/reply",
            {"body": "We are checking this for you now."},
            format="json",
        )
        self.assertEqual(reply.status_code, 201)
        self.assertTrue(reply.data["is_staff_reply"])

        self.login(self.user)
        conversation = self.client.get(f"/api/user/support/{ticket_id}")
        self.assertEqual(conversation.status_code, 200)
        self.assertEqual(conversation.data["messages"][-1]["body"], reply.data["body"])
        self.assertFalse(conversation.data["messages"][-1]["is_read"])
        self.assertEqual(conversation.data["unread_count"], 1)
        self.assertTrue(UserNotification.objects.filter(
            recipient=self.user,
            notification_type="support",
        ).exists())
        marked = self.client.post(f"/api/user/support/{ticket_id}/read", {}, format="json")
        self.assertEqual(marked.status_code, 200)
        self.assertEqual(marked.data["updated"], 1)

    def test_admin_can_approve_nomination_and_user_sees_status(self):
        category = AwardCategory.objects.create(
            title="Academic Awards", slug="academic-awards", description="Academic",
            image_url="https://example.com/award.jpg", icon_class="ri-award-line",
            highlights=[],
        )
        programme = AwardProgramme.objects.create(
            title="Best Paper", slug="best-paper", category=category,
        )
        grade = MembershipGrade.objects.get(code="AffIPC")
        form = FormDefinition.objects.filter(code=grade.code, is_active=True).first()
        Application.objects.create(
            form_definition=form, membership_grade=grade, applicant=self.user,
            approved_user=self.user, status=Application.Status.APPROVED,
            first_name="Amina", last_name="Khan", email=self.user.email,
            phone="07700900123", username="member-award",
            code_of_conduct_consent=True, privacy_consent=True,
        )
        self.login(self.user)
        created = self.client.post("/api/user/awards/nominations", {
            "programme": programme.slug, "nominee_type": "self",
            "nominee_name": "Amina Khan",
            "statement": "A strong professional contribution with measurable results.",
            "responses": {
                "organisation": "IPC", "nominee_role": "Member",
                "contribution": "A significant contribution to professional practice.",
                "impact": "Measurable positive outcomes across the profession.",
                "declaration": True,
            },
        }, format="json")
        self.assertEqual(created.status_code, 201)
        nomination = AwardNomination.objects.get(public_id=created.data["public_id"])
        evidence = SimpleUploadedFile(
            "evidence.pdf", b"%PDF-1.4 evidence", content_type="application/pdf",
        )
        uploaded = self.client.post(
            f"/api/user/awards/nominations/{nomination.public_id}/documents",
            {"file": evidence}, format="multipart",
        )
        self.assertEqual(uploaded.status_code, 201)
        submitted = self.client.post(
            f"/api/user/awards/nominations/{nomination.public_id}/submit",
            {}, format="json",
        )
        self.assertEqual(submitted.status_code, 200)
        self.assertEqual(submitted.data["status"], "submitted")
        admin = get_user_model().objects.create_user(
            username="reviewer", email="reviewer@example.com", password="Strong-pass-123",
            is_staff=True,
        )
        self.login(admin)
        admin_listing = self.client.get("/api/admin/award-nominations")
        self.assertEqual(admin_listing.status_code, 200)
        self.assertEqual(admin_listing.data[0]["public_id"], str(nomination.public_id))
        response = self.client.patch(
            f"/api/admin/award-nominations/{nomination.public_id}/status",
            {"status": "approved"}, format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "approved")
        self.assertTrue(
            UserNotification.objects.filter(
                recipient=self.user, notification_type="awardnomination",
            ).exists()
        )
        self.login(self.user)
        listing = self.client.get("/api/user/awards/nominations")
        self.assertEqual(listing.status_code, 200)
        self.assertEqual(listing.data[0]["status"], "approved")
