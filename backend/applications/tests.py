import json
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.contrib import admin
from django.db import IntegrityError, connection, transaction
from django.db.migrations.executor import MigrationExecutor
from django.test import TestCase, TransactionTestCase, override_settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.exceptions import ValidationError
from rest_framework.test import APIClient
from memberships.models import MembershipGrade
from accounts.graph_mail import GraphMailError

from .models import Application, ApplicationEvidence, ApplicationStatusHistory, FormDefinition
from .admin import ApplicationAdmin


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend", SECURE_SSL_REDIRECT=False)
class ApplicationApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.legacy_payload = {
            "grade": "MIPC",
            "first_name": "Amira",
            "last_name": "Hassan",
            "username": "amira.hassan",
            "email": "AMIRA@example.com",
            "phone": "+44 7700 900123",
            "country": "Egypt",
            "organisation": "Example Projects",
            "job_title": "Project Controls Engineer",
            "years_experience": "4-7",
            "professional_background": "Project controls experience across infrastructure programmes.",
            "professional_statement": "I manage schedules, reporting, risk and change controls.",
            "cpd_evidence": "Recent planning and risk management training.",
            "work_evidence": "Monthly controls reports.",
            "references_text": "Reference available on request.",
            "code_of_conduct_consent": True,
            "privacy_consent": True,
        }

    @staticmethod
    def document(name):
        return SimpleUploadedFile(name, b"%PDF-1.7\n% test document", content_type="application/pdf")

    def test_legacy_contract_is_stored_in_new_architecture(self):
        response = self.client.post(
            "/api/applications",
            {**self.legacy_payload, "cv": self.document("cv.pdf"), "cpd_file": self.document("cpd.pdf")},
            format="multipart",
        )

        self.assertEqual(response.status_code, 201, response.data)
        application = Application.objects.select_related("membership_grade", "form_definition").get()
        self.assertEqual(Application._meta.db_table, "applications_application")
        self.assertEqual(application.membership_grade.code, "MIPC")
        self.assertEqual(application.form_definition.code, "MIPC")
        self.assertEqual(application.form_version, 1)
        self.assertEqual(application.phone, "+447700900123")
        self.assertEqual(application.grade_specific_data["job_title"], "Project Controls Engineer")
        self.assertEqual(response.data["grade"], "MIPC")
        self.assertEqual(response.data["application_id"], application.pk)
        self.assertEqual(response.data["professional_statement"], self.legacy_payload["professional_statement"])
        self.assertEqual(application.evidence_files.count(), 2)
        self.assertTrue(application.evidence_files.filter(original_name="cv.pdf", content_type="application/pdf").exists())
        self.assertTrue(ApplicationStatusHistory.objects.filter(application=application, to_status="submitted").exists())

    def test_versioned_dynamic_data_is_validated(self):
        payload = {
            "grade": "AffIPC",
            "first_name": "Mina",
            "last_name": "Adel",
            "username": "mina.adel",
            "email": "mina@example.com",
            "phone": "020 7946 0958",
            "country": "Egypt",
            "code_of_conduct_consent": True,
            "privacy_consent": True,
            "grade_specific_data": {
                "professional_status": "Student",
                "statement_of_interest": "I want to build a career in project controls.",
                "code_of_conduct": True,
                "areas_of_interest": ["Planning / Scheduling"],
            },
            "cv": self.document("cv.pdf"),
            "evidence": self.document("verification.pdf"),
        }

        payload["grade_specific_data"] = json.dumps(payload["grade_specific_data"])
        response = self.client.post("/api/applications", payload, format="multipart")

        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data["form_definition_code"], "AffIPC")
        self.assertEqual(response.data["grade_specific_data"]["professional_status"], "Student")

    def test_missing_dynamic_required_fields_are_rejected(self):
        payload = {
            "grade": "AffIPC",
            "first_name": "Mina",
            "last_name": "Adel",
            "username": "mina.unfinished",
            "email": "mina@example.com",
            "phone": "07700 900123",
            "code_of_conduct_consent": True,
            "grade_specific_data": {"professional_status": "Student"},
        }

        response = self.client.post("/api/applications", payload, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("grade_specific_data", response.data)

    def test_unsafe_document_content_is_rejected(self):
        payload = {
            **self.legacy_payload,
            "cv": SimpleUploadedFile("cv.pdf", b"not really a pdf", content_type="application/pdf"),
            "cpd_file": self.document("cpd.pdf"),
        }

        response = self.client.post("/api/applications", payload, format="multipart")

        self.assertEqual(response.status_code, 400)
        self.assertIn("cv", response.data)

    def test_non_uk_telephone_number_is_rejected(self):
        for telephone in ("+20 100 000 0000", "01067055973"):
            with self.subTest(telephone=telephone):
                response = self.client.post(
                    "/api/applications",
                    {
                        **self.legacy_payload,
                        "phone": telephone,
                        "cv": self.document("cv.pdf"),
                        "cpd_file": self.document("cpd.pdf"),
                    },
                    format="multipart",
                )

                self.assertEqual(response.status_code, 400)
                self.assertIn("phone", response.data)

    def test_database_no_longer_contains_legacy_table(self):
        table_names = connection.introspection.table_names()
        self.assertIn("applications_application", table_names)
        self.assertNotIn("applications_membershipapplication", table_names)


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend", SECURE_SSL_REDIRECT=False)
class AdminApplicationApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.welcome_mail_patcher = patch(
            "applications.services.approval.send_membership_welcome_email"
        )
        self.send_welcome_email = self.welcome_mail_patcher.start()
        self.addCleanup(self.welcome_mail_patcher.stop)
        self.admin = get_user_model().objects.create_user(
            "applications.admin",
            "applications-admin@example.com",
            "safe-test-password",
            is_staff=True,
        )
        self.member = get_user_model().objects.create_user(
            "applications.member",
            "applications-member@example.com",
            "safe-test-password",
        )
        form = FormDefinition.objects.get(code="AffIPC", version=1)
        self.application = Application.objects.create(
            form_definition=form,
            form_version=form.version,
            membership_grade=MembershipGrade.objects.get(code="AffIPC"),
            first_name="Nora",
            last_name="Ali",
            username="nora.ali",
            email="nora@example.com",
            phone="+447700900123",
            country="Egypt",
            organisation="IPC Projects",
            grade_specific_data={"professional_status": "Student"},
            code_of_conduct_consent=True,
            privacy_consent=True,
        )

    def patch_request(self, *args, **kwargs):
        with self.captureOnCommitCallbacks(execute=True):
            return self.client.patch(*args, **kwargs)

    def test_admin_can_view_full_application(self):
        self.client.force_authenticate(self.admin)

        response = self.client.get(
            f"/api/admin/applications/{self.application.pk}"
        )

        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["application_reference"], self.application.application_reference)
        self.assertEqual(response.data["phone"], "+447700900123")
        self.assertEqual(response.data["grade_specific_data"]["professional_status"], "Student")
        self.assertIn("evidence_files", response.data)
        self.assertIn("status_history", response.data)

    def test_admin_application_list_supports_search_filters_and_pagination(self):
        self.client.force_authenticate(self.admin)

        response = self.client.get(
            "/api/admin/applications",
            {"search": "nora.ali", "status": "submitted", "grade": "AffIPC"},
        )

        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["count"], 1)
        self.assertIn("next", response.data)
        self.assertIn("previous", response.data)
        item = response.data["results"][0]
        self.assertEqual(item["id"], self.application.pk)
        self.assertEqual(item["reference"], self.application.application_reference)
        self.assertEqual(item["name"], "Nora Ali")
        self.assertEqual(item["grade"], "AffIPC")

        empty = self.client.get(
            "/api/admin/applications",
            {"status": "approved"},
        )
        self.assertEqual(empty.status_code, 200, empty.data)
        self.assertEqual(empty.data["count"], 0)

    def test_non_admin_cannot_view_application(self):
        self.client.force_authenticate(self.member)
        response = self.client.get(
            f"/api/admin/applications/{self.application.pk}"
        )
        self.assertEqual(response.status_code, 403)

    def test_non_admin_cannot_approve_application(self):
        self.client.force_authenticate(self.member)
        response = self.patch_request(
            f"/api/admin/applications/{self.application.pk}/status",
            {"status": "approved"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)
        self.application.refresh_from_db()
        self.assertEqual(self.application.status, "submitted")
        self.assertIsNone(self.application.approved_user_id)

    def test_evidence_uses_protected_admin_download_endpoint(self):
        evidence = ApplicationEvidence.objects.create(
            application=self.application,
            evidence_type="cv",
            file=SimpleUploadedFile(
                "secure-cv.pdf",
                b"%PDF-1.7\n% secure test document",
                content_type="application/pdf",
            ),
            original_name="secure-cv.pdf",
            content_type="application/pdf",
        )
        self.addCleanup(evidence.file.delete, False)
        self.client.force_authenticate(self.admin)
        detail = self.client.get(
            f"/api/admin/applications/{self.application.pk}"
        )
        file_url = detail.data["evidence_files"][0]["file_url"]
        self.assertNotIn("/media/", file_url)
        self.assertTrue(file_url.endswith(f"/evidence/{evidence.pk}"))

        self.client.force_authenticate(self.member)
        self.assertEqual(self.client.get(file_url).status_code, 403)

        self.client.force_authenticate(self.admin)
        response = self.client.get(file_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Cache-Control"], "private, no-store")
        response.close()

    def test_admin_can_change_submitted_to_under_review(self):
        self.client.force_authenticate(self.admin)

        response = self.patch_request(
            f"/api/admin/applications/{self.application.pk}/status",
            {"status": "under_review"},
            format="json",
        )

        self.assertEqual(response.status_code, 200, response.data)
        self.application.refresh_from_db()
        self.assertEqual(self.application.status, "under_review")
        self.assertEqual(self.application.reviewed_by, self.admin)
        self.assertTrue(
            self.application.status_history.filter(
                from_status="submitted",
                to_status="under_review",
                changed_by=self.admin,
            ).exists()
        )

    def test_admin_can_change_under_review_to_approved(self):
        self.application.status = "under_review"
        self.application.save(update_fields=["status", "updated_at"])
        self.client.force_authenticate(self.admin)

        response = self.patch_request(
            f"/api/admin/applications/{self.application.pk}/status",
            {"status": "approved"},
            format="json",
        )

        self.assertEqual(response.status_code, 200, response.data)
        self.application.refresh_from_db()
        self.assertEqual(self.application.status, "approved")
        user = self.application.approved_user
        self.assertIsNotNone(user)
        self.assertEqual(user.membership_application, self.application)
        self.assertEqual(user.email, "nora.ali@ipc.com")
        self.assertEqual(user.username, "nora.ali")
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertTrue(user.is_active)
        self.assertFalse(user.has_usable_password())
        self.assertEqual(user.admin_profile.role, "user")
        self.assertEqual(user.admin_profile.telephone, "+447700900123")
        self.assertEqual(self.application.approved_by, self.admin)
        self.assertIsNotNone(self.application.approved_at)
        self.assertIsNotNone(self.application.account_created_at)
        self.assertIsNotNone(self.application.welcome_email_sent_at)
        mail_kwargs = self.send_welcome_email.call_args.kwargs
        self.assertEqual(mail_kwargs["recipient"], "nora@example.com")
        self.assertEqual(mail_kwargs["username"], "nora.ali")
        self.assertEqual(mail_kwargs["ipc_email"], "nora.ali@ipc.com")
        self.assertEqual(
            mail_kwargs["application_reference"],
            self.application.application_reference,
        )
        self.assertIn("/reset-password?uid=", mail_kwargs["reset_url"])
        self.assertIn("&token=", mail_kwargs["reset_url"])

    def test_admin_can_approve_submitted_application_once(self):
        self.client.force_authenticate(self.admin)
        response = self.patch_request(
            f"/api/admin/applications/{self.application.pk}/status",
            {"status": "approved"},
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.application.refresh_from_db()
        user_id = self.application.approved_user_id
        user_count = get_user_model().objects.count()

        repeated = self.patch_request(
            f"/api/admin/applications/{self.application.pk}/status",
            {"status": "approved"},
            format="json",
        )
        self.assertEqual(repeated.status_code, 409)
        self.application.refresh_from_db()
        self.assertEqual(self.application.approved_user_id, user_id)
        self.assertEqual(get_user_model().objects.count(), user_count)
        self.assertEqual(self.send_welcome_email.call_count, 1)

    def test_duplicate_ipc_email_gets_unique_suffix(self):
        get_user_model().objects.create_user(
            username="existing-email-owner",
            email="nora.ali@ipc.com",
            password="test",
        )
        self.client.force_authenticate(self.admin)
        response = self.patch_request(
            f"/api/admin/applications/{self.application.pk}/status",
            {"status": "approved"},
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.application.refresh_from_db()
        self.assertEqual(self.application.approved_user.email, "nora.ali2@ipc.com")

    def test_one_user_cannot_be_linked_to_multiple_applications(self):
        self.client.force_authenticate(self.admin)
        approved = self.patch_request(
            f"/api/admin/applications/{self.application.pk}/status",
            {"status": "approved"},
            format="json",
        )
        self.assertEqual(approved.status_code, 200, approved.data)
        self.application.refresh_from_db()
        form = FormDefinition.objects.get(code="AffIPC", version=1)
        with self.assertRaises(IntegrityError), transaction.atomic():
            Application.objects.create(
                form_definition=form,
                form_version=form.version,
                membership_grade=MembershipGrade.objects.get(code="AffIPC"),
                first_name="Other",
                last_name="Applicant",
                email="other@example.com",
                grade_specific_data={"professional_status": "Student"},
                code_of_conduct_consent=True,
                approved_user=self.application.approved_user,
            )

    def test_approved_application_is_permanently_locked(self):
        self.client.force_authenticate(self.admin)
        approved = self.patch_request(
            f"/api/admin/applications/{self.application.pk}/status",
            {"status": "approved"},
            format="json",
        )
        self.assertEqual(approved.status_code, 200, approved.data)

        response = self.patch_request(
            f"/api/admin/applications/{self.application.pk}/status",
            {"status": "under_review"},
            format="json",
        )
        self.assertEqual(response.status_code, 409)
        self.assertIn("locked", response.data["detail"].lower())

        self.application.refresh_from_db()
        self.application.status = "under_review"
        with self.assertRaises(ValidationError):
            self.application.save()
        self.application.refresh_from_db()

        model_admin = ApplicationAdmin(Application, admin.site)
        self.assertIn(
            "status",
            model_admin.get_readonly_fields(request=None, obj=self.application),
        )
        self.assertIn(
            "approved_user",
            model_admin.get_readonly_fields(request=None, obj=self.application),
        )

    def test_email_failure_does_not_duplicate_account_and_can_be_retried(self):
        self.send_welcome_email.side_effect = GraphMailError("Graph unavailable")
        self.client.force_authenticate(self.admin)
        response = self.patch_request(
            f"/api/admin/applications/{self.application.pk}/status",
            {"status": "approved"},
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.assertFalse(response.data["welcome_email_sent"])
        self.application.refresh_from_db()
        linked_user_id = self.application.approved_user_id
        self.assertIsNone(self.application.welcome_email_sent_at)

        self.send_welcome_email.side_effect = None
        retry = self.client.post(
            f"/api/admin/applications/{self.application.pk}/resend-welcome-email",
            {},
            format="json",
        )
        self.assertEqual(retry.status_code, 200, retry.data)
        self.application.refresh_from_db()
        self.assertEqual(self.application.approved_user_id, linked_user_id)
        self.assertIsNotNone(self.application.welcome_email_sent_at)

        duplicate_retry = self.client.post(
            f"/api/admin/applications/{self.application.pk}/resend-welcome-email",
            {},
            format="json",
        )
        self.assertEqual(duplicate_retry.status_code, 200, duplicate_retry.data)
        self.assertEqual(self.send_welcome_email.call_count, 3)

    def test_approval_failure_rolls_back_user_and_relationship(self):
        self.client.force_authenticate(self.admin)
        self.client.raise_request_exception = False
        users_before = get_user_model().objects.count()
        with patch.object(Application, "save", side_effect=IntegrityError("save failed")):
            response = self.patch_request(
                f"/api/admin/applications/{self.application.pk}/status",
                {"status": "approved"},
                format="json",
            )
        self.assertEqual(response.status_code, 500)
        self.application.refresh_from_db()
        self.assertEqual(self.application.status, "submitted")
        self.assertIsNone(self.application.approved_user_id)
        self.assertEqual(get_user_model().objects.count(), users_before)

    def test_invalid_status_is_rejected(self):
        self.client.force_authenticate(self.admin)
        response = self.patch_request(
            f"/api/admin/applications/{self.application.pk}/status",
            {"status": "rejected"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.application.refresh_from_db()
        self.assertEqual(self.application.status, "submitted")

    @patch("applications.services.refusal.send_membership_refusal_email")
    def test_admin_can_refuse_once_with_required_reason_and_email(self, send_refusal_email):
        self.client.force_authenticate(self.admin)

        missing_reason = self.patch_request(
            f"/api/admin/applications/{self.application.pk}/status",
            {"status": "refused", "refusal_reason": "   "},
            format="json",
        )
        self.assertEqual(missing_reason.status_code, 400, missing_reason.data)
        send_refusal_email.assert_not_called()

        response = self.patch_request(
            f"/api/admin/applications/{self.application.pk}/status",
            {"status": "refused", "refusal_reason": "The evidence did not meet the grade requirements."},
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.application.refresh_from_db()
        self.assertEqual(self.application.status, "refused")
        self.assertEqual(self.application.refused_by, self.admin)
        self.assertIsNotNone(self.application.refused_at)
        self.assertIsNotNone(self.application.refusal_email_sent_at)
        self.assertEqual(send_refusal_email.call_count, 1)
        mail_kwargs = send_refusal_email.call_args.kwargs
        self.assertEqual(mail_kwargs["recipient"], "nora@example.com")
        self.assertEqual(mail_kwargs["name"], "Nora Ali")
        self.assertEqual(mail_kwargs["reason"], self.application.refusal_reason)
        self.assertTrue(self.application.status_history.filter(
            to_status="refused",
            note=self.application.refusal_reason,
            changed_by=self.admin,
        ).exists())

        repeated = self.patch_request(
            f"/api/admin/applications/{self.application.pk}/status",
            {"status": "refused", "refusal_reason": "A different reason."},
            format="json",
        )
        self.assertEqual(repeated.status_code, 409, repeated.data)
        self.application.refresh_from_db()
        self.assertEqual(send_refusal_email.call_count, 1)
        self.assertEqual(self.application.refusal_reason, "The evidence did not meet the grade requirements.")

    def test_status_endpoint_does_not_change_other_fields(self):
        self.client.force_authenticate(self.admin)
        response = self.patch_request(
            f"/api/admin/applications/{self.application.pk}/status",
            {"status": "under_review", "first_name": "Changed"},
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.application.refresh_from_db()
        self.assertEqual(self.application.status, "under_review")
        self.assertEqual(self.application.first_name, "Nora")

    def test_generic_application_update_is_not_allowed(self):
        self.client.force_authenticate(self.admin)
        response = self.patch_request(
            f"/api/admin/applications/{self.application.pk}",
            {"first_name": "Changed"},
            format="json",
        )
        self.assertEqual(response.status_code, 405)


class ApplicationMigrationTests(TransactionTestCase):
    migrate_from = [("applications", "0004_membershipapplication_application_id")]
    migrate_to = [("applications", "0005_application_architecture")]

    def setUp(self):
        super().setUp()
        self.executor = MigrationExecutor(connection)
        self.executor.migrate(self.migrate_from)
        old_apps = self.executor.loader.project_state(self.migrate_from).apps
        OldGrade = old_apps.get_model("memberships", "MembershipGrade")
        OldApplication = old_apps.get_model("applications", "MembershipApplication")
        grade, _ = OldGrade.objects.get_or_create(
            code="MIPC",
            defaults={"title": "Professional Member / MIPC", "short_title": "Professional", "display_order": 2},
        )
        self.legacy_pk = OldApplication.objects.create(
            application_id=9001,
            application_reference="IPC-LEGACY001",
            status="under_review",
            grade="MIPC",
            membership_grade=grade,
            first_name="Legacy",
            last_name="Applicant",
            email="legacy@example.com",
            phone="123",
            country="Egypt",
            job_title="Planner",
            organisation="Legacy Projects",
            years_experience="8",
            professional_background="Legacy professional background that must be retained.",
            professional_statement="Legacy professional statement that must be retained.",
            cpd_evidence="Legacy CPD",
            work_evidence="Legacy evidence",
            references_text="Legacy reference",
            code_of_conduct_consent=True,
            privacy_consent=True,
        ).pk

        self.executor = MigrationExecutor(connection)
        self.executor.migrate(self.migrate_to)
        self.new_apps = self.executor.loader.project_state(self.migrate_to).apps

    def tearDown(self):
        MigrationExecutor(connection).migrate(MigrationExecutor(connection).loader.graph.leaf_nodes())
        super().tearDown()

    def test_existing_application_is_migrated_without_identity_or_data_loss(self):
        NewApplication = self.new_apps.get_model("applications", "Application")
        application = NewApplication.objects.get(pk=self.legacy_pk)

        self.assertEqual(application.application_reference, "IPC-LEGACY001")
        self.assertEqual(application.status, "under_review")
        self.assertEqual(application.membership_grade.code, "MIPC")
        self.assertEqual(application.form_definition.code, "MIPC")
        self.assertEqual(application.submitted_at, application.created_at)
        self.assertEqual(application.grade_specific_data["job_title"], "Planner")
        self.assertEqual(
            application.grade_specific_data["professional_statement"],
            "Legacy professional statement that must be retained.",
        )
