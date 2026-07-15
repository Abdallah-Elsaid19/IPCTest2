import json

from django.contrib.auth import get_user_model
from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.test import TestCase, TransactionTestCase, override_settings
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from memberships.models import MembershipGrade

from .models import Application, ApplicationStatusHistory, FormDefinition


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend", SECURE_SSL_REDIRECT=False)
class ApplicationApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.legacy_payload = {
            "grade": "MIPC",
            "first_name": "Amira",
            "last_name": "Hassan",
            "email": "AMIRA@example.com",
            "phone": "+20 100 000 0000",
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
            "email": "mina@example.com",
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
            "email": "mina@example.com",
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

    def test_database_no_longer_contains_legacy_table(self):
        table_names = connection.introspection.table_names()
        self.assertIn("applications_application", table_names)
        self.assertNotIn("applications_membershipapplication", table_names)


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend", SECURE_SSL_REDIRECT=False)
class AdminApplicationApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_admin_can_update_application_status(self):
        user = get_user_model().objects.create_superuser("admin", "admin@example.com", "safe-test-password")
        form = FormDefinition.objects.get(code="AffIPC", version=1)
        application = Application.objects.create(
            form_definition=form,
            form_version=form.version,
            membership_grade=MembershipGrade.objects.get(code="AffIPC"),
            first_name="Nora",
            last_name="Ali",
            email="nora@example.com",
            grade_specific_data={"professional_status": "Student"},
            code_of_conduct_consent=True,
        )
        self.client.force_authenticate(user)

        response = self.client.patch(
            f"/api/admin/applications/{application.pk}",
            {"status": "under_review", "reviewer_note": "Initial review started."},
            format="json",
        )

        self.assertEqual(response.status_code, 200, response.data)
        application.refresh_from_db()
        self.assertEqual(application.status, "under_review")
        self.assertEqual(application.reviewed_by, user)
        self.assertTrue(application.reviewer_notes.filter(note="Initial review started.").exists())


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
