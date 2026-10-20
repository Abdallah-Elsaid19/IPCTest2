from datetime import date
from types import SimpleNamespace
from unittest.mock import Mock, patch

from django.contrib.auth import get_user_model
from django.core import mail
from django.test import override_settings
from rest_framework.test import APITestCase

from applications.models import Application, FormDefinition
from memberships.models import MembershipGrade

from .models import BursaryApplication, BursaryPaymentInstallment, BursaryPaymentPlan
from .google_sheets import payment_plan_sheet_values
from .stripe_payments import create_installment_schedule
from .tests import valid_bursary_multipart_payload


class BursaryPaymentPlanApiTests(APITestCase):
    def setUp(self):
        grade, _ = MembershipGrade.objects.get_or_create(
            code=MembershipGrade.Code.AFFIPC,
            defaults={
                "slug": "affiliate-payment-plan-test",
                "title": "Affiliate",
                "image_url": "",
                "post_nominal": "AffIPC",
                "pathway_title": "Affiliate",
                "pathway_description": "Test membership grade",
            },
        )
        form, _ = FormDefinition.objects.get_or_create(
            code=grade.code,
            version=1,
            defaults={"name": "Affiliate application", "is_active": True},
        )
        self.member = get_user_model().objects.create_user(
            username="payment-plan-member",
            email="member@ipc.com",
            password="test-password",
        )
        Application.objects.create(
            application_reference="IPC-PAYMENT-MEMBER",
            form_definition=form,
            form_version=form.version,
            membership_grade=grade,
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
            username="payment-plan-reviewer",
            email="reviewer@example.com",
            password="test-password",
            is_staff=True,
        )
        self.client.force_authenticate(self.member)
        response = self.client.post(
            "/api/bursary-applications",
            valid_bursary_multipart_payload(),
            format="multipart",
        )
        self.assertEqual(response.status_code, 201, response.data)
        self.application = BursaryApplication.objects.get()
        self.application.status = BursaryApplication.Status.APPROVED
        self.application.save(update_fields=["status", "updated_at"])

    def plan_payload(self, **overrides):
        payload = {
            "approved_modules": ["AI", "PMP"],
            "start_date_and_cohorts": "Start in the October 2026 cohort.",
            "study_duration_months": 12,
            "amount_payable": "4000.00",
            "deposit_amount": "400.00",
            "installment_count": 12,
            "installment_amount": "300.00",
            "first_installment_date": "2026-11-20",
            "offer_expires_at": None,
        }
        payload.update(overrides)
        return payload

    def test_admin_builds_balanced_plan_and_monthly_rows(self):
        self.client.force_authenticate(self.staff)
        response = self.client.put(
            f"/api/admin/bursary-applications/{self.application.pk}/payment-plan",
            self.plan_payload(),
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["final_installment_amount"], "300.00")
        self.assertEqual(len(response.data["installments"]), 13)
        self.assertEqual(response.data["installments"][0]["kind"], "deposit")
        self.assertEqual(response.data["installments"][-1]["due_date"], "2027-10-20")
        self.assertEqual(BursaryPaymentInstallment.objects.count(), 13)

    def test_admin_cannot_save_plan_that_over_allocates_amount(self):
        self.client.force_authenticate(self.staff)
        response = self.client.put(
            f"/api/admin/bursary-applications/{self.application.pk}/payment-plan",
            self.plan_payload(installment_amount="400.00"),
            format="json",
        )
        self.assertEqual(response.status_code, 400, response.data)
        self.assertIn("installment_amount", response.data)

    def test_offered_plan_can_be_accepted_only_by_owner(self):
        self.client.force_authenticate(self.staff)
        create_response = self.client.put(
            f"/api/admin/bursary-applications/{self.application.pk}/payment-plan",
            self.plan_payload(),
            format="json",
        )
        public_id = create_response.data["public_id"]
        offer_response = self.client.post(
            f"/api/admin/bursary-applications/{self.application.pk}/payment-plan/offer",
            {},
            format="json",
        )
        self.assertEqual(offer_response.status_code, 200, offer_response.data)
        plan = BursaryPaymentPlan.objects.get()
        self.assertEqual(plan.portal_user, self.member)
        self.assertIsNotNone(plan.offer_email_sent_at)
        self.assertIn("Payment schedule", mail.outbox[-1].body)
        self.assertIn("/payments", mail.outbox[-1].body)

        self.client.force_authenticate(self.member)
        accept_response = self.client.post(
            f"/api/bursary-payment-plans/{public_id}/accept",
            {"terms_accepted": True},
            format="json",
        )
        self.assertEqual(accept_response.status_code, 200, accept_response.data)
        self.assertEqual(accept_response.data["status"], BursaryPaymentPlan.Status.ACCEPTED)

        checkout_response = self.client.post(
            f"/api/bursary-payment-plans/{public_id}/checkout",
            {},
            format="json",
        )
        self.assertEqual(checkout_response.status_code, 503, checkout_response.data)

    def test_offer_creates_secure_payment_account_for_applicant_without_one(self):
        self.application.submitted_by = None
        self.application.membership_reference = ""
        self.application.email = "new-payer@example.com"
        self.application.save(update_fields=["submitted_by", "membership_reference", "email", "updated_at"])
        self.client.force_authenticate(self.staff)
        self.client.put(
            f"/api/admin/bursary-applications/{self.application.pk}/payment-plan",
            self.plan_payload(),
            format="json",
        )
        response = self.client.post(
            f"/api/admin/bursary-applications/{self.application.pk}/payment-plan/offer",
            {},
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.data)
        plan = BursaryPaymentPlan.objects.select_related("portal_user").get()
        self.assertIsNotNone(plan.portal_user)
        self.assertFalse(plan.portal_user.has_usable_password())
        self.assertIn("@", plan.portal_user.email)
        self.assertIn("Create your password", mail.outbox[-1].body)
        self.assertIn("next=/payments", mail.outbox[-1].body)

        self.client.force_authenticate(plan.portal_user)
        portal = self.client.get("/api/payment-portal")
        self.assertEqual(portal.status_code, 200, portal.data)
        self.assertEqual(len(portal.data["plans"]), 1)
        self.assertEqual(portal.data["plans"][0]["public_id"], str(plan.public_id))

    def test_payment_plan_sheet_has_dynamic_month_columns(self):
        self.client.force_authenticate(self.staff)
        self.client.put(
            f"/api/admin/bursary-applications/{self.application.pk}/payment-plan",
            self.plan_payload(),
            format="json",
        )
        plan = BursaryPaymentPlan.objects.select_related("application").prefetch_related("installments").get()
        values = payment_plan_sheet_values([plan])
        self.assertIn("November 2026", values[0])
        self.assertIn("October 2027", values[0])
        row = dict(zip(values[0], values[1]))
        self.assertEqual(row["Deposit (GBP)"], 400.0)
        self.assertEqual(row["November 2026"], 300.0)
        self.assertEqual(row["Balance remaining (GBP)"], 4000.0)

    @override_settings(STRIPE_INVOICE_DAYS_UNTIL_DUE=7)
    @patch("scholarships.stripe_payments.stripe_client")
    def test_installment_schedule_uses_manual_stripe_invoices(self, stripe_client):
        self.client.force_authenticate(self.staff)
        self.client.put(
            f"/api/admin/bursary-applications/{self.application.pk}/payment-plan",
            self.plan_payload(),
            format="json",
        )
        plan = BursaryPaymentPlan.objects.select_related("application").get()
        plan.stripe_customer_id = "cus_test"
        plan.save(update_fields=["stripe_customer_id", "updated_at"])
        stripe = Mock()
        stripe.Product.create.return_value = SimpleNamespace(id="prod_test")
        stripe.Price.create.return_value = SimpleNamespace(id="price_test")
        stripe.SubscriptionSchedule.create.return_value = SimpleNamespace(
            id="sub_sched_test",
            subscription=None,
        )
        stripe_client.return_value = stripe

        create_installment_schedule(plan)

        schedule_args = stripe.SubscriptionSchedule.create.call_args.kwargs
        self.assertEqual(schedule_args["default_settings"]["collection_method"], "send_invoice")
        self.assertEqual(
            schedule_args["default_settings"]["invoice_settings"]["days_until_due"],
            7,
        )
