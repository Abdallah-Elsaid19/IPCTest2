import base64
import csv
import io
import json
from datetime import datetime, timezone as datetime_timezone
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APITestCase

from accounts.models import AdminNotification
from applications.models import Application, FormDefinition
from memberships.models import MembershipGrade
from user_panel.models import UserNotification
from .dashboard_defaults import (
    default_gateway_content,
    default_module_offers,
    default_pathway_pages,
)
from .bursary_export import (
    BURSARY_GOOGLE_SHEET_HEADERS,
    bursary_google_sheet_row,
)
from .models import BursaryApplication, ScholarshipGatewayContent, ScholarshipPathwaysContent


class ScholarshipContentApiTests(APITestCase):
    def test_default_module_offers_match_the_public_module_explorer(self):
        modules = default_module_offers()

        self.assertEqual(
            [item["id"] for item in modules],
            ["individual-module", "pmp-modules", "apm-modules", "pmo-chartered-modules"],
        )
        self.assertIn("PMO", modules[0]["modules"])
        self.assertEqual(modules[0]["courseCost"], "£4,000")
        self.assertEqual(modules[1]["courseCost"], "£8,000")
        self.assertEqual(modules[1]["label"], "PMP credits")
        self.assertEqual(modules[1]["details"][0], "The PMP is worth two credits.")
        self.assertEqual(modules[2]["modules"], ["PMP", "AI"])
        self.assertEqual(modules[2]["courseCost"], "£12,000")
        self.assertEqual(modules[3]["courseCost"], "£16,000")

    def test_gateway_eligibility_describes_the_ipc_bursary_fund_only(self):
        eligibility = default_gateway_content()["eligibility"]

        self.assertEqual(eligibility["eyebrow"], "IPC Bursary Fund eligibility")
        self.assertIn("financial need", eligibility["description"])
        self.assertIn(
            "A valid IPC membership reference linked to your account",
            eligibility["criteria"],
        )
        self.assertNotIn("funded-route", str(eligibility).lower())
        self.assertNotIn("government funding service", str(eligibility).lower())

    def test_default_pathways_make_requested_specialists_mandatory_and_chartered_third(self):
        pathways = default_pathway_pages()

        self.assertEqual([item["id"] for item in pathways[:3]], ["operational", "strategic", "chartered"])
        operational = pathways[0]
        strategic = pathways[1]
        self.assertEqual(operational["creditNumbers"], [2, 1, 1, 1, 1])
        self.assertEqual(strategic["creditNumbers"], [2, 1, 1, 1, 1])
        self.assertIn("Risk Management", [module["name"] for module in operational["modules"]])
        self.assertIn("Project Planning & Control (PPC)", [module["name"] for module in operational["modules"]])
        self.assertIn("Risk Management", [module["name"] for module in strategic["modules"]])
        self.assertIn("PMO", [module["name"] for module in strategic["modules"]])

    def test_public_endpoint_returns_active_database_content(self):
        ScholarshipGatewayContent.objects.update_or_create(
            key="main",
            defaults={
                "learning": {"rhythm_items": [{"badge": "2h"}]},
                "is_active": True,
                "status": "published",
            },
        )
        ScholarshipPathwaysContent.objects.update_or_create(
            key="main",
            defaults={
                "modules": [{
                    "id": "pmp-modules",
                    "title": "Dashboard PMP modules",
                }],
                "pages": [{
                    "id": "chartered",
                    "name": "Chartered Pathway",
                    "duration": "24 months",
                    "accent": "#d69a32",
                    "creditNumbers": [2, 1, 3],
                    "funding": {"governmentBand": "£6,000"},
                }],
                "is_active": True,
                "status": "published",
            },
        )

        response = self.client.get("/api/scholarships")

        self.assertEqual(response.status_code, 200, response.data)
        self.assertIs(response.data["pathways_active"], True)
        self.assertEqual(response.data["modules"][0]["title"], "Dashboard PMP modules")
        self.assertEqual(response.data["gateway"]["learning"]["rhythm_items"][0]["badge"], "2h")
        self.assertEqual(response.data["pathways"][0]["id"], "chartered")
        self.assertEqual(response.data["pathway_details"][0]["id"], "chartered")
        self.assertEqual(response.data["pathway_details"][0]["creditNumbers"], [2, 1, 3])

    def test_inactive_content_is_not_public(self):
        ScholarshipGatewayContent.objects.update_or_create(
            key="main",
            defaults={"is_active": False},
        )

        self.assertEqual(self.client.get("/api/scholarships").status_code, 404)

    def test_inactive_pathways_hide_only_pathways(self):
        ScholarshipGatewayContent.objects.update_or_create(
            key="main",
            defaults={"is_active": True, "status": "published"},
        )
        ScholarshipPathwaysContent.objects.update_or_create(
            key="main",
            defaults={"is_active": False, "status": "published"},
        )

        response = self.client.get("/api/scholarships")

        self.assertEqual(response.status_code, 200, response.data)
        self.assertIs(response.data["pathways_active"], False)
        self.assertEqual(response.data["pages"], [])
        self.assertEqual(response.data["modules"], [])
        self.assertEqual(response.data["pathways"], [])
        self.assertEqual(response.data["pathway_details"], [])

    def test_inactive_pathway_page_is_excluded_from_public_content(self):
        ScholarshipGatewayContent.objects.update_or_create(
            key="main",
            defaults={"is_active": True, "status": "published"},
        )
        ScholarshipPathwaysContent.objects.update_or_create(
            key="main",
            defaults={
                "pages": [
                    {"id": "operational", "name": "Operational", "is_active": False},
                    {"id": "chartered", "name": "Chartered", "is_active": True},
                ],
                "is_active": True,
                "status": "published",
            },
        )

        response = self.client.get("/api/scholarships")

        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(
            [page["id"] for page in response.data["pages"]],
            ["chartered"],
        )


class ScholarshipDashboardContentTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="scholarship-content-admin",
            email="scholarship-content-admin@example.com",
            password="test-password",
            is_staff=True,
        )
        self.client.force_authenticate(self.user)
        ScholarshipGatewayContent.objects.update_or_create(
            key="main",
            defaults={"is_active": True, "status": "published"},
        )
        ScholarshipPathwaysContent.objects.update_or_create(
            key="main",
            defaults={"is_active": True, "status": "published"},
        )

    def test_dashboard_exposes_current_gateway_and_pathway_sections(self):
        response = self.client.get("/api/admin/content")
        self.assertEqual(response.status_code, 200, response.data)
        scholarships = next(item for item in response.data if item["slug"] == "scholarships")
        pathways = next(item for item in response.data if item["slug"] == "scholarship-pathways")
        self.assertEqual(scholarships["table_name"], "scholarships_content")
        self.assertEqual(
            set(scholarships["sections"]),
            {
                "hero",
                "partnership",
                "process",
                "funding",
                "pathways_intro",
                "learning",
                "ai_spotlight",
                "comparison",
                "all_inclusive",
                "audiences",
                "eligibility",
                "commitment",
                "faq",
                "final_cta",
                "seo",
            },
        )
        self.assertEqual(
            set(pathways["sections"]),
            {"modules"},
        )
        self.assertEqual(
            scholarships["sections"]["funding"]["title"],
            "Two module-support options. One careful assessment.",
        )
        self.assertEqual(
            [
                option["title"]
                for option in scholarships["sections"]["funding"]["options"]
            ],
            ["Individual module support", "Enhanced module support"],
        )

    def test_dashboard_can_update_current_gateway_content(self):
        content = ScholarshipGatewayContent.objects.get(key="main")
        hero = {
            **content.hero,
            "title": "Dashboard-managed scholarship title",
            "is_active": False,
        }
        seo = {
            **content.seo,
            "title": "Dashboard-managed scholarship SEO",
        }
        response = self.client.patch(
            "/api/admin/content/scholarships",
            {"sections": {"hero": hero, "seo": seo}},
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.data)
        content.refresh_from_db()
        self.assertEqual(
            content.hero["title"],
            "Dashboard-managed scholarship title",
        )
        public_response = self.client.get("/api/scholarships")
        self.assertEqual(public_response.status_code, 200, public_response.data)
        self.assertEqual(
            public_response.data["gateway"]["hero"]["title"],
            "Dashboard-managed scholarship title",
        )
        self.assertIs(
            public_response.data["gateway"]["hero"]["is_active"],
            False,
        )
        self.assertEqual(
            public_response.data["seo"]["title"],
            "Dashboard-managed scholarship SEO",
        )

    def test_dashboard_can_update_pathway_content_separately(self):
        content = ScholarshipPathwaysContent.objects.get(key="main")
        modules = [
            {
                **item,
                "title": "Dashboard-managed PMP programme",
                "is_active": False,
            }
            if item["id"] == "pmp-modules"
            else item
            for item in content.modules
        ]
        response = self.client.patch(
            "/api/admin/content/scholarship-pathways",
            {"sections": {"modules": modules}},
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.data)
        content.refresh_from_db()
        pmp = next(item for item in content.modules if item["id"] == "pmp-modules")
        self.assertEqual(pmp["title"], "Dashboard-managed PMP programme")
        public_response = self.client.get("/api/scholarships")
        self.assertEqual(public_response.status_code, 200, public_response.data)
        self.assertNotIn(
            "pmp-modules",
            [item["id"] for item in public_response.data["modules"]],
        )

    def test_dashboard_active_controls_public_scholarship_page(self):
        response = self.client.patch(
            "/api/admin/content/scholarships",
            {"is_active": False},
            format="json",
        )

        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(self.client.get("/api/scholarships").status_code, 404)

    def test_dashboard_active_controls_pathways_without_hiding_gateway(self):
        response = self.client.patch(
            "/api/admin/content/scholarship-pathways",
            {"is_active": False},
            format="json",
        )

        self.assertEqual(response.status_code, 200, response.data)
        public_response = self.client.get("/api/scholarships")
        self.assertEqual(public_response.status_code, 200, public_response.data)
        self.assertIs(public_response.data["pathways_active"], False)
        self.assertEqual(public_response.data["pathways"], [])
        self.assertEqual(public_response.data["modules"], [])


def valid_bursary_payload():
    return {
        "personalDetails": {
            "firstName": "Amina",
            "lastName": "Khan",
            "dateOfBirth": "1990-05-12",
            "email": "AMINA@example.com",
            "phoneCountryIso2": "GB",
            "phoneDialCode": "+44",
            "phoneNationalNumber": "07400 123456",
            "mobilePhoneE164": "+447400123456",
            "homeAddressLine1": "1 Example Street",
            "homeAddressLine2": "",
            "townOrCity": "London",
            "countyOrRegion": "",
            "postcode": "SW1A 1AA",
            "country": "United Kingdom",
            "linkedInProfileUrl": "https://www.linkedin.com/in/amina-khan",
            "currentlyEmployed": True,
            "currentProfessionalStatus": "Project controls analyst",
            "preferredContactMethod": "email",
        },
        "organisationDetails": {
            "organisationNotApplicable": False,
            "organisationName": "Example Projects Ltd",
            "organisationWebsite": "https://example.com",
            "industryOrSector": "Infrastructure",
            "organisationAddressLine1": "",
            "organisationAddressLine2": "",
            "organisationTownOrCity": "",
            "organisationCountyOrRegion": "",
            "organisationPostcode": "",
            "organisationCountry": "",
            "organisationSize": "51-200",
            "jobTitle": "Project controls analyst",
            "departmentOrBusinessUnit": "Projects",
            "employmentStartDate": "2022-01-10",
            "employmentType": "Full time",
            "lineManagerName": "",
            "lineManagerEmail": "",
            "pathwayRoleSupport": "It will improve reporting and planning.",
        },
        "emergencyInformation": {
            "emergencyContactFullName": "Luqman Saleem",
            "emergencyContactEmail": "luqman@example.com",
            "emergencyContactPhone": "+447400555555",
            "hasDisabilityOrHealthCondition": False,
            "healthProblemCategories": [],
            "primaryHealthProblem": "",
        },
        "pathwaySelection": {
            "preferredModules": ["ai", "pmp"],
            "preferredStartMonthOrIntake": "September 2026",
            "highestRelevantQualification": "BSc",
            "professionalMembershipsOrCertifications": "APM member",
            "relevantExperience": "Five years in project planning and cost control.",
            "pathwayFitReason": "IPC support would make this professional module accessible to me.",
        },
        "termsAndConsents": {
            "mandatoryTermsAccepted": True,
            "generalMarketingConsent": False,
        },
        "reviewAndDeclaration": {
            "fullLegalName": "Amina Khan",
            "dateSigned": "2026-07-30",
            "electronicSignature": "data:image/png;base64,iVBORw0KGgo=",
            "signaturePlace": "London",
            "preferredSecureSubmissionReference": "",
            "additionalReviewInformation": "",
        },
    }


def valid_bursary_multipart_payload(payload=None):
    png = base64.b64decode(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
    )
    return {
        "payload": json.dumps(payload or valid_bursary_payload()),
        "identityDocument": SimpleUploadedFile(
            "passport.pdf", b"%PDF-1.4\n% test identity\n", content_type="application/pdf"
        ),
        "applicantPhoto": SimpleUploadedFile(
            "applicant.png", png, content_type="image/png"
        ),
    }


class BursaryApplicationApiTests(APITestCase):
    def setUp(self):
        cache.clear()
        membership_grade, _ = MembershipGrade.objects.get_or_create(
            code=MembershipGrade.Code.AFFIPC,
            defaults={
                "slug": "affiliate-test",
                "title": "Affiliate",
                "image_url": "",
                "post_nominal": "AffIPC",
                "pathway_title": "Affiliate",
                "pathway_description": "Test membership grade",
            },
        )
        form_definition, _ = FormDefinition.objects.get_or_create(
            code=membership_grade.code,
            version=1,
            defaults={"name": "Affiliate application", "is_active": True},
        )
        self.member = get_user_model().objects.create_user(
            username="bursary-member",
            email="member@ipc.com",
            password="not-used",
        )
        self.membership_application = Application.objects.create(
            application_reference="IPC-MEMBER-TEST",
            form_definition=form_definition,
            form_version=form_definition.version,
            membership_grade=membership_grade,
            approved_user=self.member,
            status=Application.Status.APPROVED,
            first_name="Amina",
            last_name="Khan",
            email="amina@example.com",
            phone="07400123456",
            country="United Kingdom",
            organisation="Example Projects Ltd",
            code_of_conduct_consent=True,
            privacy_consent=True,
        )
        self.staff = get_user_model().objects.create_user(
            username="bursary-reviewer",
            email="reviewer@example.com",
            password="not-used",
            is_staff=True,
        )
        self.client.force_authenticate(self.member)

    def submit_bursary(self, payload=None):
        return self.client.post(
            "/api/bursary-applications",
            valid_bursary_multipart_payload(payload),
            format="multipart",
        )

    def test_public_create_returns_server_reference_and_notification(self):
        with self.captureOnCommitCallbacks(execute=True):
            response = self.submit_bursary()
        self.assertEqual(response.status_code, 201, response.data)
        self.assertRegex(response.data["applicationReference"], r"^IPC-BSA-\d{4}-[A-F0-9]{12}$")
        application = BursaryApplication.objects.get()
        self.assertEqual(application.award_round, BursaryApplication.AwardRound.ROUND_TWO)
        self.assertEqual(application.preferred_modules, ["ai", "pmp"])
        self.assertEqual(application.mobile_phone_e164, "+447400123456")
        self.assertEqual(application.phone_national_number, "7400123456")
        self.assertEqual(application.email, "amina@example.com")
        self.assertTrue(AdminNotification.objects.filter(
            notification_type=AdminNotification.NotificationType.BURSARY_APPLICATION,
            source_id=application.pk,
        ).exists())

    def test_individual_pmo_and_certified_pmo_are_distinct_options(self):
        payload = valid_bursary_payload()
        payload["pathwaySelection"]["preferredModules"] = ["pmo_module", "pmo"]

        response = self.submit_bursary(payload)

        self.assertEqual(response.status_code, 201, response.data)
        application = BursaryApplication.objects.get()
        self.assertEqual(application.preferred_modules, ["pmo_module", "pmo"])
        self.assertEqual(application.get_bursary_selection_display(), "PMO, Certified PMO")

    def test_removed_module_selection_questions_are_not_required(self):
        payload = valid_bursary_payload()
        payload["pathwaySelection"].pop("professionalMembershipsOrCertifications")
        payload["pathwaySelection"].pop("relevantExperience")
        payload["pathwaySelection"].pop("pathwayFitReason")

        response = self.submit_bursary(payload)

        self.assertEqual(response.status_code, 201, response.data)
        application = BursaryApplication.objects.get()
        self.assertEqual(application.professional_memberships_or_certifications, "")
        self.assertEqual(application.relevant_experience, "")
        self.assertEqual(application.pathway_fit_reason, "")

    def test_anonymous_applicant_can_submit_without_an_account(self):
        self.client.force_authenticate(user=None)

        response = self.submit_bursary()

        self.assertEqual(response.status_code, 201, response.data)
        application = BursaryApplication.objects.get()
        self.assertIsNone(application.submitted_by)
        self.assertEqual(application.membership_reference, "")
        self.assertEqual(application.email, "amina@example.com")

    def test_linkedin_and_applicant_photo_are_optional(self):
        payload = valid_bursary_payload()
        payload["personalDetails"]["linkedInProfileUrl"] = ""
        multipart = valid_bursary_multipart_payload(payload)
        multipart.pop("applicantPhoto")

        response = self.client.post(
            "/api/bursary-applications",
            multipart,
            format="multipart",
        )

        self.assertEqual(response.status_code, 201, response.data)
        application = BursaryApplication.objects.get()
        self.assertEqual(application.linkedin_profile_url, "")
        self.assertFalse(application.applicant_photo)

    def test_public_endpoint_does_not_allow_listing(self):
        self.assertEqual(self.client.get("/api/bursary-applications").status_code, 405)

    def test_announcement_endpoint_only_exposes_approved_public_recipient_fields(self):
        created = self.submit_bursary()
        self.assertEqual(created.status_code, 201, created.data)
        application = BursaryApplication.objects.get(pk=created.data["id"])

        before_release = datetime(2026, 9, 10, 12, 59, tzinfo=datetime_timezone.utc)
        after_release = datetime(2026, 9, 10, 13, 1, tzinfo=datetime_timezone.utc)

        with patch("scholarships.views.timezone.now", return_value=before_release):
            before_approval = self.client.get("/api/scholarship-announcement/recipients")
        self.assertEqual(before_approval.status_code, 200, before_approval.data)
        self.assertEqual(before_approval.data, [])

        application.status = BursaryApplication.Status.APPROVED
        application.applicant_photo = ""
        application.save(update_fields=["status", "applicant_photo", "updated_at"])
        with patch("scholarships.views.timezone.now", return_value=before_release):
            not_released = self.client.get("/api/scholarship-announcement/recipients")
        self.assertEqual(not_released.data, [])

        with patch("scholarships.views.timezone.now", return_value=after_release):
            announced = self.client.get("/api/scholarship-announcement/recipients")

        self.assertEqual(announced.status_code, 200, announced.data)
        self.assertEqual(len(announced.data), 1)
        self.assertEqual(announced.data[0]["name"], "Amina Khan")
        self.assertEqual(announced.data[0]["award"], "AI, PMP")
        self.assertEqual(announced.data[0]["modules"], ["AI", "PMP"])
        self.assertEqual(announced.data[0]["category"], "IPC Scholarship Fund")
        self.assertEqual(announced.data[0]["year"], 2026)
        self.assertEqual(announced.data[0]["award_round"], 2)
        self.assertEqual(announced.data[0]["photo_url"], "")
        self.assertNotIn("email", announced.data[0])
        self.assertNotIn("mobile_phone_e164", announced.data[0])

        application.award_round = BursaryApplication.AwardRound.ROUND_ONE
        application.save(update_fields=["award_round", "updated_at"])
        with patch("scholarships.views.timezone.now", return_value=after_release):
            round_one_is_not_republished = self.client.get("/api/scholarship-announcement/recipients")
        self.assertEqual(round_one_is_not_republished.data, [])

    def test_invalid_phone_is_rejected_for_selected_country(self):
        payload = valid_bursary_payload()
        payload["personalDetails"]["phoneNationalNumber"] = "12345"
        response = self.submit_bursary(payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("phoneNationalNumber", response.data["personalDetails"])

    def test_retired_pathways_cannot_be_submitted(self):
        for retired_pathway in (
            "operational",
            "strategic",
            "chartered",
            "certified_pmo_professional",
            "apm",
        ):
            payload = valid_bursary_payload()
            payload["pathwaySelection"]["preferredModules"] = [retired_pathway]
            response = self.submit_bursary(payload)
            self.assertEqual(response.status_code, 400, response.data)
            self.assertIn("preferredModules", response.data["pathwaySelection"])

    def test_membership_reference_is_derived_from_signed_in_account(self):
        payload = valid_bursary_payload()
        payload["personalDetails"]["membershipReference"] = "IPC-NOT-FOUND"
        response = self.submit_bursary(payload)
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(
            BursaryApplication.objects.get().membership_reference,
            self.membership_application.application_reference,
        )

    def test_membership_reference_live_validation_is_scoped_to_signed_in_account(self):
        self.client.force_authenticate(user=None)
        anonymous = self.client.get(
            "/api/bursary-applications/validate-membership-reference",
            {"reference": self.membership_application.application_reference},
        )
        self.assertEqual(anonymous.status_code, 200)
        self.assertFalse(anonymous.data["authenticated"])
        self.assertIsNone(anonymous.data["valid"])

        self.client.force_authenticate(user=self.member)
        owned = self.client.get(
            "/api/bursary-applications/validate-membership-reference",
            {"reference": self.membership_application.application_reference.lower()},
        )
        self.assertEqual(owned.status_code, 200)
        self.assertTrue(owned.data["authenticated"])
        self.assertTrue(owned.data["valid"])

        self.client.force_authenticate(user=self.staff)
        not_owned = self.client.get(
            "/api/bursary-applications/validate-membership-reference",
            {"reference": self.membership_application.application_reference},
        )
        self.assertEqual(not_owned.status_code, 200)
        self.assertFalse(not_owned.data["valid"])

    def test_authenticated_submission_does_not_require_membership(self):
        self.client.force_authenticate(user=self.staff)
        response = self.submit_bursary()

        self.assertEqual(response.status_code, 201, response.data)
        application = BursaryApplication.objects.get(pk=response.data["id"])
        self.assertEqual(application.membership_reference, "")
        self.assertEqual(application.submitted_by, self.staff)
        current = self.client.get("/api/bursary-applications/current")
        self.assertEqual(current.status_code, 200, current.data)
        self.assertTrue(current.data["hasApplication"])
        self.assertEqual(current.data["applicationReference"], application.application_reference)

    def test_applicant_must_be_at_least_twenty_years_old(self):
        payload = valid_bursary_payload()
        today = timezone.localdate()
        payload["personalDetails"]["dateOfBirth"] = (
            f"{today.year - 19:04d}-{today.month:02d}-{today.day:02d}"
        )

        response = self.submit_bursary(payload)

        self.assertEqual(response.status_code, 400, response.data)
        self.assertIn("dateOfBirth", response.data["personalDetails"])
        self.assertIn("20 years old", str(response.data["personalDetails"]["dateOfBirth"][0]))

    def test_employed_applicant_requires_organisation_and_job_title(self):
        payload = valid_bursary_payload()
        payload["organisationDetails"]["organisationName"] = " "
        payload["organisationDetails"]["jobTitle"] = ""
        response = self.submit_bursary(payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("organisationName", response.data["organisationDetails"])
        self.assertIn("jobTitle", response.data["organisationDetails"])

    def test_unemployed_applicant_can_mark_organisation_not_applicable(self):
        payload = valid_bursary_payload()
        payload["personalDetails"]["currentlyEmployed"] = False
        payload["organisationDetails"].update({
            "organisationNotApplicable": True,
            "organisationName": "",
            "jobTitle": "",
            "organisationWebsite": "",
            "lineManagerEmail": "",
        })
        response = self.submit_bursary(payload)
        self.assertEqual(response.status_code, 201, response.data)

    def test_unemployed_applicant_ignores_stale_invalid_organisation_data(self):
        payload = valid_bursary_payload()
        payload["personalDetails"]["currentlyEmployed"] = False
        payload["organisationDetails"].update({
            "organisationNotApplicable": False,
            "organisationWebsite": "not a valid URL",
            "lineManagerEmail": "not an email",
            "employmentStartDate": "07/02/2026",
        })

        response = self.submit_bursary(payload)

        self.assertEqual(response.status_code, 201, response.data)
        application = BursaryApplication.objects.get(pk=response.data["id"])
        self.assertTrue(application.organisation_not_applicable)
        self.assertEqual(application.organisation_name, "")
        self.assertIsNone(application.employment_start_date)

    def test_support_details_accept_a_single_text_response(self):
        payload = valid_bursary_payload()
        payload["emergencyInformation"].update({
            "hasDisabilityOrHealthCondition": True,
            "healthProblemCategories": [],
            "primaryHealthProblem": (
                "I may need accessible learning materials and additional time during assessments."
            ),
        })

        response = self.submit_bursary(payload)

        self.assertEqual(response.status_code, 201, response.data)
        application = BursaryApplication.objects.get(pk=response.data["id"])
        self.assertEqual(
            application.primary_health_problem,
            payload["emergencyInformation"]["primaryHealthProblem"],
        )
        self.assertEqual(application.health_problem_categories, [])

    def test_submission_accepts_payload_without_removed_form_fields(self):
        payload = valid_bursary_payload()
        for field in ("lineManagerName", "lineManagerEmail"):
            payload["organisationDetails"].pop(field)
        for field in ("preferredStartMonthOrIntake", "highestRelevantQualification"):
            payload["pathwaySelection"].pop(field)
        for field in (
            "fullLegalName",
            "signaturePlace",
            "preferredSecureSubmissionReference",
            "additionalReviewInformation",
        ):
            payload["reviewAndDeclaration"].pop(field)

        response = self.submit_bursary(payload)

        self.assertEqual(response.status_code, 201, response.data)
        application = BursaryApplication.objects.get(pk=response.data["id"])
        self.assertEqual(application.preferred_start_month_or_intake, "")
        self.assertEqual(application.full_legal_name, "")
        self.assertEqual(application.date_signed.isoformat(), "2026-07-30")
        self.assertTrue(application.electronic_signature.startswith("data:image/png;base64,"))
        self.assertFalse(application.section_1_complete)
        self.assertFalse(application.applicant_identity_declaration)

    def test_combined_mandatory_consent_is_required(self):
        payload = valid_bursary_payload()
        payload["termsAndConsents"]["mandatoryTermsAccepted"] = False
        response = self.submit_bursary(payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("mandatoryTermsAccepted", response.data["termsAndConsents"])

    def test_drawn_signature_is_required(self):
        payload = valid_bursary_payload()
        payload["reviewAndDeclaration"]["electronicSignature"] = ""
        response = self.submit_bursary(payload)
        self.assertEqual(response.status_code, 400)
        self.assertIn("electronicSignature", response.data["reviewAndDeclaration"])

    def test_dashboard_requires_staff_and_staff_can_review(self):
        created = self.submit_bursary()
        application_id = created.data["id"]
        self.assertIn(
            self.client.get("/api/admin/bursary-applications").status_code,
            (401, 403),
        )

        self.client.force_authenticate(self.staff)
        listing = self.client.get("/api/admin/bursary-applications")
        self.assertEqual(listing.status_code, 200, listing.data)
        self.assertEqual(listing.data["google_sheet_url"], "")
        self.assertEqual(listing.data["count"], 1)
        self.assertEqual(listing.data["summary"]["submitted"], 1)
        detail = self.client.get(f"/api/admin/bursary-applications/{application_id}")
        self.assertEqual(detail.status_code, 200, detail.data)
        self.assertIn("first_name", detail.data)
        self.assertIn("preferred_modules", detail.data)
        self.assertIn("electronic_signature", detail.data)
        for legacy_or_internal_field in (
            "title",
            "preferred_name",
            "emergency_contact_relationship",
            "health_problem_categories",
            "professional_memberships_or_certifications",
            "relevant_experience",
            "pathway_fit_reason",
            "general_marketing_consent",
            "terms_accepted_at",
            "section_1_complete",
            "information_accurate_declaration",
            "declarations_accepted_at",
        ):
            self.assertNotIn(legacy_or_internal_field, detail.data)

        updated = self.client.patch(
            f"/api/admin/bursary-applications/{application_id}/status",
            {
                "status": "under_review",
                "internal_reason": "Initial eligibility review started.",
                "assigned_reviewer": self.staff.pk,
            },
            format="json",
        )
        self.assertEqual(updated.status_code, 200, updated.data)
        self.assertEqual(updated.data["status"], "under_review")
        self.assertEqual(updated.data["assigned_reviewer"], self.staff.pk)
        self.assertEqual(updated.data["status_history"][0]["previous_status"], "submitted")

    @override_settings(BURSARY_GOOGLE_SHEETS_SPREADSHEET_ID="sheet-123")
    def test_dashboard_returns_configured_google_sheet_url(self):
        self.client.force_authenticate(self.staff)
        response = self.client.get("/api/admin/bursary-applications")
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(
            response.data["google_sheet_url"],
            "https://docs.google.com/spreadsheets/d/sheet-123/edit",
        )

    @override_settings(
        BURSARY_GOOGLE_SHEETS_ENABLED=True,
        BURSARY_GOOGLE_SHEETS_SPREADSHEET_ID="sheet-123",
        GOOGLE_SERVICE_ACCOUNT_JSON="{}",
    )
    @patch("scholarships.signals.sync_bursary_google_sheet_safely")
    def test_application_commit_schedules_automatic_google_sheet_sync(self, sync_sheet):
        with self.captureOnCommitCallbacks(execute=True):
            response = self.submit_bursary()
        self.assertEqual(response.status_code, 201, response.data)
        sync_sheet.assert_called_once_with()

    def test_dashboard_csv_export_contains_all_current_form_data_and_respects_filters(self):
        created = self.submit_bursary()
        self.assertEqual(created.status_code, 201, created.data)
        export_url = "/api/admin/bursary-applications/export?status=submitted&country=United%20Kingdom"

        self.assertEqual(self.client.get(export_url).status_code, 403)
        self.client.force_authenticate(self.staff)
        response = self.client.get(export_url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "text/csv; charset=utf-8")
        self.assertIn("bursary-applications-", response["Content-Disposition"])
        rows = list(csv.DictReader(io.StringIO(response.content.decode("utf-8-sig"))))
        self.assertEqual(len(rows), 1)
        row = rows[0]
        self.assertEqual(row["Application reference"], created.data["applicationReference"])
        self.assertEqual(row["Round"], "Round 2")
        self.assertEqual(row["First name"], "Amina")
        self.assertEqual(row["Preferred modules"], "AI, PMP")
        self.assertEqual(row["Total module cost (GBP)"], "12000")
        self.assertEqual(row["IPC Fund contribution (GBP)"], "8000")
        self.assertEqual(row["Estimated amount applicant pays (GBP)"], 4000)
        self.assertIn("Proof of identification provided", row)
        self.assertIn("Electronic signature provided", row)
        self.assertNotIn("General marketing consent", row)

    def test_google_sheet_contains_only_the_requested_dashboard_fields(self):
        created = self.submit_bursary()
        self.assertEqual(created.status_code, 201, created.data)
        application = BursaryApplication.objects.get(pk=created.data["id"])

        row = dict(zip(BURSARY_GOOGLE_SHEET_HEADERS, bursary_google_sheet_row(application)))

        self.assertEqual(
            list(row),
            [
                "First name",
                "Last name",
                "Date of birth",
                "Email",
                "Country",
                "Organisation name",
                "Job title",
                "Employment type",
                "Preferred modules",
                "Estimated amount applicant pays (GBP)",
                "Long-term disability, health problem or learning difficulty",
                "Additional support required",
            ],
        )
        self.assertEqual(row["First name"], "Amina")
        self.assertEqual(row["Preferred modules"], "AI, PMP")
        self.assertEqual(row["Estimated amount applicant pays (GBP)"], "4000")
        self.assertEqual(
            row["Long-term disability, health problem or learning difficulty"],
            "No",
        )

    @patch("scholarships.views.send_graph_bursary_approval_email")
    def test_approval_updates_member_panel_and_sends_one_approval_email(self, send_approval_email):
        created = self.submit_bursary()
        self.assertEqual(created.status_code, 201, created.data)

        self.client.force_authenticate(self.staff)
        approval_message = "Welcome to Round One. We will contact you with your onboarding details."
        with self.captureOnCommitCallbacks(execute=True):
            approved = self.client.patch(
                f"/api/admin/bursary-applications/{created.data['id']}/status",
                {
                    "status": BursaryApplication.Status.APPROVED,
                    "internal_reason": approval_message,
                },
                format="json",
            )

        self.assertEqual(approved.status_code, 200, approved.data)
        self.assertEqual(approved.data["status"], BursaryApplication.Status.APPROVED)
        application = BursaryApplication.objects.get(pk=created.data["id"])
        self.assertIsNotNone(application.approval_email_sent_at)
        send_approval_email.assert_called_once_with(
            recipient=application.email,
            name=application.preferred_name or application.first_name,
            application_reference=application.application_reference,
            pathway=application.get_bursary_selection_display(),
            message=approval_message,
        )

        self.client.force_authenticate(self.member)
        panel = self.client.get("/api/user/scholarships/my-applications")
        self.assertEqual(panel.status_code, 200, panel.data)
        self.assertEqual(panel.data[0]["status"], BursaryApplication.Status.APPROVED)
        self.assertEqual(panel.data[0]["status_label"], "Approved")

        self.client.force_authenticate(self.staff)
        with self.captureOnCommitCallbacks(execute=True):
            unchanged = self.client.patch(
                f"/api/admin/bursary-applications/{application.pk}/status",
                {"status": BursaryApplication.Status.APPROVED},
                format="json",
            )
        self.assertEqual(unchanged.status_code, 409, unchanged.data)
        self.assertEqual(send_approval_email.call_count, 1)
        self.assertTrue(UserNotification.objects.filter(
            recipient=self.member,
            notification_type="bursary_application",
            title="Bursary application approved",
        ).exists())

    @patch("scholarships.views.send_graph_bursary_rejection_email")
    def test_status_transitions_rejection_email_and_member_notifications(self, send_rejection_email):
        created = self.submit_bursary()
        self.assertEqual(created.status_code, 201, created.data)
        status_url = f"/api/admin/bursary-applications/{created.data['id']}/status"
        self.client.force_authenticate(self.staff)

        under_review = self.client.patch(
            status_url,
            {"status": BursaryApplication.Status.UNDER_REVIEW},
            format="json",
        )
        self.assertEqual(under_review.status_code, 200, under_review.data)
        self.assertTrue(UserNotification.objects.filter(
            recipient=self.member,
            title="Bursary application under review",
        ).exists())

        back_to_submitted = self.client.patch(
            status_url,
            {"status": BursaryApplication.Status.SUBMITTED},
            format="json",
        )
        self.assertEqual(back_to_submitted.status_code, 409, back_to_submitted.data)

        missing_reason = self.client.patch(
            status_url,
            {"status": BursaryApplication.Status.REJECTED},
            format="json",
        )
        self.assertEqual(missing_reason.status_code, 400, missing_reason.data)
        self.assertIn("internal_reason", missing_reason.data)

        rejection_reason = "The submitted evidence does not meet the bursary criteria."
        with self.captureOnCommitCallbacks(execute=True):
            rejected = self.client.patch(
                status_url,
                {
                    "status": BursaryApplication.Status.REJECTED,
                    "internal_reason": rejection_reason,
                },
                format="json",
            )
        self.assertEqual(rejected.status_code, 200, rejected.data)
        application = BursaryApplication.objects.get(pk=created.data["id"])
        self.assertEqual(application.status, BursaryApplication.Status.REJECTED)
        self.assertIsNotNone(application.rejection_email_sent_at)
        send_rejection_email.assert_called_once_with(
            recipient=application.email,
            name=application.preferred_name or application.first_name,
            application_reference=application.application_reference,
            pathway=application.get_bursary_selection_display(),
            reason=rejection_reason,
        )
        rejection_notification = UserNotification.objects.get(
            recipient=self.member,
            title="Bursary application rejected",
        )
        self.assertIn(rejection_reason, rejection_notification.message)
        self.assertEqual(rejection_notification.target_url, "/user/scholarships")

        change_final_status = self.client.patch(
            status_url,
            {"status": BursaryApplication.Status.APPROVED},
            format="json",
        )
        self.assertEqual(change_final_status.status_code, 409, change_final_status.data)
        application.refresh_from_db()
        self.assertEqual(application.status, BursaryApplication.Status.REJECTED)

    def test_second_application_for_the_same_membership_is_locked(self):
        first = self.submit_bursary()
        second = self.submit_bursary()
        self.assertEqual(first.status_code, 201, first.data)
        self.assertEqual(second.status_code, 409, second.data)
        self.assertEqual(second.data["applicationReference"], first.data["applicationReference"])
        self.assertEqual(BursaryApplication.objects.count(), 1)

    def test_rejected_application_remains_locked_for_new_submissions(self):
        first = self.submit_bursary()
        self.assertEqual(first.status_code, 201, first.data)

        application = BursaryApplication.objects.get(pk=first.data["id"])
        application.status = BursaryApplication.Status.REJECTED
        application.save(update_fields=["status", "updated_at"])

        second = self.submit_bursary()
        self.assertEqual(second.status_code, 409, second.data)
        self.assertEqual(BursaryApplication.objects.count(), 1)

    def test_current_application_is_locked_until_more_information_is_requested(self):
        created = self.submit_bursary()
        self.assertEqual(created.status_code, 201, created.data)

        current = self.client.get("/api/bursary-applications/current")

        self.assertEqual(current.status_code, 200, current.data)
        self.assertTrue(current.data["hasApplication"])
        self.assertFalse(current.data["editable"])
        self.assertIsNone(current.data["values"])
        self.assertEqual(
            current.data["applicationReference"],
            created.data["applicationReference"],
        )

    @patch("scholarships.views.send_graph_bursary_needs_information_email")
    def test_needs_information_reopens_same_application_once_and_resubmits_under_review(self, send_information_email):
        created = self.submit_bursary()
        self.assertEqual(created.status_code, 201, created.data)
        application_id = created.data["id"]
        application_reference = created.data["applicationReference"]

        self.client.force_authenticate(self.staff)
        request_message = "Please update the emergency contact telephone number."
        with self.captureOnCommitCallbacks(execute=True):
            requested = self.client.patch(
                f"/api/admin/bursary-applications/{application_id}/status",
                {
                    "status": BursaryApplication.Status.NEEDS_INFORMATION,
                    "internal_reason": request_message,
                },
                format="json",
            )
        self.assertEqual(requested.status_code, 200, requested.data)
        notification = UserNotification.objects.get(
            recipient=self.member,
            title="More information needed for your bursary application",
        )
        self.assertIn(request_message, notification.message)
        recipients = {
            call.kwargs["recipient"]
            for call in send_information_email.call_args_list
        }
        self.assertEqual(recipients, {"amina@example.com", self.member.email})
        self.assertTrue(all(
            call.kwargs["message"] == request_message
            for call in send_information_email.call_args_list
        ))

        self.client.force_authenticate(self.member)
        current = self.client.get("/api/bursary-applications/current")
        self.assertEqual(current.status_code, 200, current.data)
        self.assertTrue(current.data["editable"])
        self.assertEqual(
            current.data["values"]["emergencyInformation"]["emergencyContactPhone"],
            valid_bursary_payload()["emergencyInformation"]["emergencyContactPhone"],
        )
        self.assertEqual(current.data["values"]["emergencyInformation"]["identityDocument"], "existing")
        self.assertEqual(current.data["values"]["emergencyInformation"]["applicantPhoto"], "existing")

        selected = self.client.get(
            "/api/bursary-applications/current",
            {"applicationReference": application_reference},
        )
        self.assertEqual(selected.status_code, 200, selected.data)
        self.assertEqual(selected.data["applicationReference"], application_reference)

        updated_payload = valid_bursary_payload()
        updated_payload["emergencyInformation"]["emergencyContactPhone"] = "+447400999999"
        resubmitted = self.client.patch(
            "/api/bursary-applications/current",
            updated_payload,
            format="json",
        )
        self.assertEqual(resubmitted.status_code, 200, resubmitted.data)
        self.assertEqual(resubmitted.data["status"], BursaryApplication.Status.UNDER_REVIEW)
        self.assertEqual(resubmitted.data["applicationReference"], application_reference)
        self.assertEqual(BursaryApplication.objects.count(), 1)

        application = BursaryApplication.objects.get(pk=application_id)
        self.assertEqual(
            application.emergency_contact_phone,
            updated_payload["emergencyInformation"]["emergencyContactPhone"],
        )
        self.assertTrue(application.status_history.filter(
            previous_status=BursaryApplication.Status.NEEDS_INFORMATION,
            new_status=BursaryApplication.Status.UNDER_REVIEW,
            changed_by=self.member,
        ).exists())

        locked_again = self.client.get("/api/bursary-applications/current")
        self.assertFalse(locked_again.data["editable"])
        self.assertIsNone(locked_again.data["values"])
        second_resubmission = self.client.patch(
            "/api/bursary-applications/current",
            updated_payload,
            format="json",
        )
        self.assertEqual(second_resubmission.status_code, 409, second_resubmission.data)
