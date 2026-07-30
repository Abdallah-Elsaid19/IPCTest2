from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework.test import APITestCase

from accounts.models import AdminNotification
from applications.models import Application, FormDefinition
from memberships.models import MembershipGrade
from user_panel.models import UserNotification
from .dashboard_defaults import default_gateway_content, default_pathway_pages
from .models import BursaryApplication, ScholarshipGatewayContent, ScholarshipPathwaysContent


class ScholarshipContentApiTests(APITestCase):
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
                "pages": [{
                    "id": "operational",
                    "name": "Operational Pathway",
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
        self.assertEqual(response.data["gateway"]["learning"]["rhythm_items"][0]["badge"], "2h")
        self.assertEqual(response.data["pathways"][0]["id"], "operational")
        self.assertEqual(response.data["pathway_details"][0]["id"], "operational")
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
                    {"id": "strategic", "name": "Strategic", "is_active": True},
                ],
                "is_active": True,
                "status": "published",
            },
        )

        response = self.client.get("/api/scholarships")

        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(
            [page["id"] for page in response.data["pages"]],
            ["strategic"],
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
                "government_funding",
                "funding_figures",
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
            {"pages"},
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
        pages = [
            {
                **item,
                "duration": "25 months",
                "funding": {
                    **item["funding"],
                    "governmentBand": "£6,500",
                    "is_active": False,
                },
                "modules": [
                    {
                        **module,
                        "is_active": module_index != 0,
                    }
                    for module_index, module in enumerate(item["modules"])
                ],
            }
            if item["id"] == "operational"
            else item
            for item in content.pages
        ]
        response = self.client.patch(
            "/api/admin/content/scholarship-pathways",
            {"sections": {"pages": pages}},
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.data)
        content.refresh_from_db()
        operational = next(item for item in content.pages if item["id"] == "operational")
        self.assertEqual(operational["duration"], "25 months")
        public_response = self.client.get("/api/scholarships")
        self.assertEqual(public_response.status_code, 200, public_response.data)
        public_operational = next(
            item
            for item in public_response.data["pages"]
            if item["id"] == "operational"
        )
        self.assertEqual(public_operational["duration"], "25 months")
        self.assertEqual(
            public_operational["funding"]["governmentBand"],
            "£6,500",
        )
        self.assertIs(public_operational["funding"]["is_active"], False)
        self.assertIs(public_operational["modules"][0]["is_active"], False)

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


def valid_bursary_payload():
    return {
        "personalDetails": {
            "title": "Ms",
            "membershipReference": "IPC-MEMBER-TEST",
            "firstName": "Amina",
            "lastName": "Khan",
            "preferredName": "",
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
            "employerAwareness": "yes",
            "pathwayRoleSupport": "It will improve reporting and planning.",
        },
        "bursaryRequest": {
            "quotedPathwayCostGbp": "6000.00",
            "bursaryAmountRequestedGbp": "3000.00",
            "requestedBursaryPercentage": "50.00",
            "otherContributionAvailableGbp": "500.00",
            "proceedWithLowerBursary": "discuss",
            "financialCircumstances": "My circumstances limit the amount I can fund personally.",
            "scholarshipOutcome": "The scholarship will support progression into a senior role.",
            "measurableResult": "I will implement a monthly controls maturity dashboard.",
            "learningApplicationAndContribution": "I will apply the learning and share a community case study.",
        },
        "pathwaySelection": {
            "preferredPathway": "operational",
            "preferredStartMonthOrIntake": "September 2026",
            "highestRelevantQualification": "BSc",
            "professionalMembershipsOrCertifications": "APM member",
            "relevantExperience": "Five years in project planning and cost control.",
            "pathwayFitReason": "The operational pathway matches my current responsibilities.",
        },
        "termsAndConsents": {
            "linkedInAwardPostConsent": True,
            "secondProgressPostConsent": True,
            "tagIpcConsent": True,
            "reshareAndQuoteConsent": True,
            "professionalHeadshotConsent": True,
            "participationConsent": True,
            "approvedMediaUseConsent": True,
            "reportRestrictionsConsent": True,
            "publicityRestrictions": ["none_declared"],
            "publicityRestrictionDetails": "",
            "professionalHeadshotReference": "",
            "generalMarketingConsent": False,
        },
        "reviewAndDeclaration": {
            "section1Complete": True,
            "section2CompleteOrNotApplicable": True,
            "section3Complete": True,
            "section4Complete": True,
            "section5Complete": True,
            "informationAccurateDeclaration": True,
            "noAwardGuaranteeDeclaration": True,
            "pathwayTermsDeclaration": True,
            "processingConsentDeclaration": True,
            "applicantIdentityDeclaration": True,
            "fullLegalName": "Amina Khan",
            "dateSigned": "2026-07-30",
            "electronicSignature": "Amina Khan",
            "signaturePlace": "London",
            "preferredSecureSubmissionReference": "",
            "additionalReviewInformation": "",
        },
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

    def test_public_create_returns_server_reference_and_notification(self):
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post(
                "/api/bursary-applications",
                valid_bursary_payload(),
                format="json",
            )
        self.assertEqual(response.status_code, 201, response.data)
        self.assertRegex(response.data["applicationReference"], r"^IPC-BSA-\d{4}-[A-F0-9]{12}$")
        application = BursaryApplication.objects.get()
        self.assertEqual(application.mobile_phone_e164, "+447400123456")
        self.assertEqual(application.phone_national_number, "7400123456")
        self.assertEqual(application.email, "amina@example.com")
        self.assertTrue(AdminNotification.objects.filter(
            notification_type=AdminNotification.NotificationType.BURSARY_APPLICATION,
            source_id=application.pk,
        ).exists())

    def test_public_endpoint_does_not_allow_listing(self):
        self.assertEqual(self.client.get("/api/bursary-applications").status_code, 405)

    def test_invalid_phone_is_rejected_for_selected_country(self):
        payload = valid_bursary_payload()
        payload["personalDetails"]["phoneNationalNumber"] = "12345"
        response = self.client.post("/api/bursary-applications", payload, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("phoneNationalNumber", response.data["personalDetails"])

    def test_membership_reference_must_exist_and_match_email(self):
        payload = valid_bursary_payload()
        payload["personalDetails"]["membershipReference"] = "IPC-NOT-FOUND"
        response = self.client.post("/api/bursary-applications", payload, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("membershipReference", response.data["personalDetails"])

    def test_membership_reference_live_validation_is_scoped_to_signed_in_account(self):
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

    def test_authenticated_submission_rejects_another_accounts_membership_reference(self):
        self.client.force_authenticate(user=self.staff)
        response = self.client.post(
            "/api/bursary-applications",
            valid_bursary_payload(),
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("membershipReference", response.data["personalDetails"])

    def test_employed_applicant_requires_organisation_and_job_title(self):
        payload = valid_bursary_payload()
        payload["organisationDetails"]["organisationName"] = " "
        payload["organisationDetails"]["jobTitle"] = ""
        response = self.client.post("/api/bursary-applications", payload, format="json")
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
        response = self.client.post("/api/bursary-applications", payload, format="json")
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

        response = self.client.post("/api/bursary-applications", payload, format="json")

        self.assertEqual(response.status_code, 201, response.data)
        application = BursaryApplication.objects.get(pk=response.data["id"])
        self.assertTrue(application.organisation_not_applicable)
        self.assertEqual(application.organisation_name, "")
        self.assertIsNone(application.employment_start_date)

    def test_percentage_and_restriction_rules_are_enforced(self):
        payload = valid_bursary_payload()
        payload["bursaryRequest"]["requestedBursaryPercentage"] = "101"
        payload["termsAndConsents"]["publicityRestrictions"] = ["none_declared", "security"]
        response = self.client.post("/api/bursary-applications", payload, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("requestedBursaryPercentage", response.data["bursaryRequest"])

    def test_restriction_details_and_all_mandatory_consents_are_required(self):
        payload = valid_bursary_payload()
        payload["termsAndConsents"]["publicityRestrictions"] = ["confidentiality"]
        payload["termsAndConsents"]["publicityRestrictionDetails"] = ""
        payload["termsAndConsents"]["participationConsent"] = False
        response = self.client.post("/api/bursary-applications", payload, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("publicityRestrictionDetails", response.data["termsAndConsents"])
        self.assertIn("participationConsent", response.data["termsAndConsents"])

    def test_dashboard_requires_staff_and_staff_can_review(self):
        created = self.client.post(
            "/api/bursary-applications",
            valid_bursary_payload(),
            format="json",
        )
        application_id = created.data["id"]
        self.assertIn(
            self.client.get("/api/admin/bursary-applications").status_code,
            (401, 403),
        )

        self.client.force_authenticate(self.staff)
        listing = self.client.get("/api/admin/bursary-applications")
        self.assertEqual(listing.status_code, 200, listing.data)
        self.assertEqual(listing.data["count"], 1)
        self.assertEqual(listing.data["summary"]["submitted"], 1)
        detail = self.client.get(f"/api/admin/bursary-applications/{application_id}")
        self.assertEqual(detail.status_code, 200, detail.data)

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

    @patch("scholarships.views.send_graph_bursary_approval_email")
    def test_approval_updates_member_panel_and_sends_one_approval_email(self, send_approval_email):
        created = self.client.post(
            "/api/bursary-applications",
            valid_bursary_payload(),
            format="json",
        )
        self.assertEqual(created.status_code, 201, created.data)

        self.client.force_authenticate(self.staff)
        with self.captureOnCommitCallbacks(execute=True):
            approved = self.client.patch(
                f"/api/admin/bursary-applications/{created.data['id']}/status",
                {"status": BursaryApplication.Status.APPROVED},
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
            pathway=application.get_preferred_pathway_display(),
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
        created = self.client.post(
            "/api/bursary-applications",
            valid_bursary_payload(),
            format="json",
        )
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
            pathway=application.get_preferred_pathway_display(),
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

    def test_generated_references_are_unique(self):
        first = self.client.post("/api/bursary-applications", valid_bursary_payload(), format="json")
        second_payload = valid_bursary_payload()
        second = self.client.post("/api/bursary-applications", second_payload, format="json")
        self.assertEqual(first.status_code, 201, first.data)
        self.assertEqual(second.status_code, 201, second.data)
        self.assertNotEqual(first.data["applicationReference"], second.data["applicationReference"])
