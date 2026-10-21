from datetime import date
from types import SimpleNamespace
from unittest.mock import Mock, patch
from urllib.parse import parse_qs, urlparse

from django.contrib.auth import get_user_model
from django.core import mail
from rest_framework.test import APITestCase

from applications.models import Application, FormDefinition
from memberships.models import MembershipGrade

from .models import BursaryApplication, BursaryPaymentInstallment, BursaryPaymentPlan
from .google_sheets import payment_plan_sheet_values
from .stripe_payments import create_checkout_session, create_installment_schedule
from .payment_portal import PaymentPortalAccountError, _create_payment_user
from .tests import valid_bursary_multipart_payload


class PaymentPortalPersonalEmailTests(APITestCase):
    def plan(self, email):
        return SimpleNamespace(application=SimpleNamespace(
            email=email,
            first_name="New",
            last_name="Payer",
            mobile_phone_e164="+447400123456",
        ))

    def test_new_account_uses_normalized_personal_email_without_staff_access(self):
        user = _create_payment_user(self.plan("New.Payer@Example.com"))
        self.assertEqual(user.email, "new.payer@example.com")
        self.assertEqual(user.username, "new.payer@example.com")
        self.assertFalse(user.has_usable_password())
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertEqual(user.admin_profile.role, "user")

    def test_existing_personal_email_is_reused_without_changing_password(self):
        existing = get_user_model().objects.create_user(
            username="existing-payer", email="Payer@Example.com", password="Existing-482!"
        )
        user = _create_payment_user(self.plan("payer@example.com"))
        self.assertEqual(user.pk, existing.pk)
        self.assertTrue(user.check_password("Existing-482!"))
        self.assertEqual(get_user_model().objects.count(), 1)

    def test_repeated_creation_reuses_the_same_account(self):
        first = _create_payment_user(self.plan("payer@example.com"))
        second = _create_payment_user(self.plan("PAYER@example.com"))
        self.assertEqual(first.pk, second.pk)
        self.assertEqual(get_user_model().objects.count(), 1)

    def test_disabled_email_cannot_create_a_replacement_account(self):
        get_user_model().objects.create_user(
            username="disabled-payer", email="payer@example.com", is_active=False,
        )
        with self.assertRaises(PaymentPortalAccountError):
            _create_payment_user(self.plan("payer@example.com"))
        self.assertEqual(get_user_model().objects.count(), 1)

    def test_duplicate_emails_require_manual_resolution(self):
        for username in ["payer-one", "payer-two"]:
            get_user_model().objects.create_user(
                username=username, email="payer@example.com",
            )
        with self.assertRaises(PaymentPortalAccountError):
            _create_payment_user(self.plan("payer@example.com"))
        self.assertEqual(get_user_model().objects.count(), 2)

    def test_username_collision_does_not_reassign_another_users_email(self):
        existing = get_user_model().objects.create_user(
            username="payer@example.com", email="different@example.com",
        )
        with self.assertRaises(PaymentPortalAccountError):
            _create_payment_user(self.plan("payer@example.com"))
        existing.refresh_from_db()
        self.assertEqual(existing.email, "different@example.com")
        self.assertEqual(get_user_model().objects.count(), 1)

    def test_long_personal_email_uses_short_internal_username(self):
        email = "p" * 64 + "@" + "a" * 60 + "." + "b" * 40 + ".com"
        user = _create_payment_user(self.plan(email))
        self.assertEqual(user.email, email)
        self.assertLessEqual(len(user.username), 150)
        self.assertEqual(_create_payment_user(self.plan(email)).pk, user.pk)


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
            "billing_interval": "month",
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

    def test_admin_can_choose_each_stripe_billing_interval(self):
        self.client.force_authenticate(self.staff)
        cases = {
            "day": "2026-11-22",
            "week": "2026-12-04",
            "month": "2027-01-20",
            "year": "2028-11-20",
        }
        for billing_interval, last_due_date in cases.items():
            with self.subTest(billing_interval=billing_interval):
                response = self.client.put(
                    f"/api/admin/bursary-applications/{self.application.pk}/payment-plan",
                    self.plan_payload(
                        installment_count=3,
                        installment_amount="1200.00",
                        billing_interval=billing_interval,
                    ),
                    format="json",
                )
                self.assertEqual(response.status_code, 200, response.data)
                self.assertEqual(response.data["billing_interval"], billing_interval)
                self.assertEqual(response.data["installments"][-1]["due_date"], last_due_date)

    def test_admin_cannot_use_an_unknown_billing_interval(self):
        self.client.force_authenticate(self.staff)
        response = self.client.put(
            f"/api/admin/bursary-applications/{self.application.pk}/payment-plan",
            self.plan_payload(billing_interval="quarter"),
            format="json",
        )
        self.assertEqual(response.status_code, 400, response.data)
        self.assertIn("billing_interval", response.data)

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
        html_body = mail.outbox[-1].alternatives[0][0]
        self.assertIn("Sign in using your existing password", html_body)
        self.assertIn("/forgot-password?next=/payments", html_body)
        self.assertIn("Request a secure password link", html_body)
        self.assertNotIn("Create password</a>", html_body)
        self.member.refresh_from_db()
        self.assertTrue(self.member.check_password("test-password"))

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
        self.assertEqual(plan.portal_user.email, self.application.email)
        self.assertEqual(plan.portal_user.username, self.application.email)
        self.assertIn(f"Payment portal login: {self.application.email}", mail.outbox[-1].body)
        self.assertIn("Create your password", mail.outbox[-1].body)
        self.assertIn("next=/payments", mail.outbox[-1].body)
        html_body = mail.outbox[-1].alternatives[0][0]
        self.assertIn("Create password</a>", html_body)
        self.assertIn("/reset-password?uid=", html_body)
        self.assertIn("next=/payments", html_body)

        setup_link = next(
            line for line in mail.outbox[-1].body.splitlines()
            if "/reset-password?uid=" in line
        )
        query = parse_qs(urlparse(setup_link).query)
        password_payload = {
            "uid": query["uid"][0],
            "token": query["token"][0],
            "password": "New-Payer-Secure-482!",
        }
        self.client.force_authenticate(user=None)
        confirmation = self.client.post(
            "/api/auth/password-reset/confirm", password_payload, format="json",
        )
        self.assertEqual(confirmation.status_code, 200, confirmation.data)
        self.assertEqual(self.client.post(
            "/api/auth/password-reset/confirm", password_payload, format="json",
        ).status_code, 400)
        login = self.client.post(
            "/api/auth/login",
            {"email": plan.portal_user.email, "password": password_payload["password"]},
            format="json",
        )
        self.assertEqual(login.status_code, 200, login.data)
        session = self.client.get("/api/auth/session")
        self.assertTrue(session.data["user"]["has_payment_portal"])
        portal = self.client.get("/api/payment-portal")
        self.assertEqual(portal.status_code, 200, portal.data)
        self.assertEqual(len(portal.data["plans"]), 1)
        self.assertEqual(portal.data["plans"][0]["public_id"], str(plan.public_id))

    def test_conflicting_account_does_not_send_offer_or_change_draft(self):
        self.application.submitted_by = None
        self.application.membership_reference = ""
        self.application.email = "disabled-payer@example.com"
        self.application.save(update_fields=["submitted_by", "membership_reference", "email", "updated_at"])
        get_user_model().objects.create_user(
            username="disabled-payer", email=self.application.email, is_active=False,
        )
        self.client.force_authenticate(self.staff)
        self.client.put(
            f"/api/admin/bursary-applications/{self.application.pk}/payment-plan",
            self.plan_payload(), format="json",
        )
        before_count = len(mail.outbox)
        response = self.client.post(
            f"/api/admin/bursary-applications/{self.application.pk}/payment-plan/offer",
            {}, format="json",
        )
        self.assertEqual(response.status_code, 400, response.data)
        self.assertIn("disabled", str(response.data))
        plan = BursaryPaymentPlan.objects.get()
        self.assertEqual(plan.status, "draft")
        self.assertIsNone(plan.portal_user_id)
        self.assertEqual(len(mail.outbox), before_count)

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

    @patch("scholarships.stripe_payments.stripe_client")
    def test_installment_schedule_charges_saved_payment_method_automatically(self, stripe_client):
        self.client.force_authenticate(self.staff)
        self.client.put(
            f"/api/admin/bursary-applications/{self.application.pk}/payment-plan",
            self.plan_payload(billing_interval="week"),
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

        create_installment_schedule(plan, "pm_test")

        price_args = stripe.Price.create.call_args.kwargs
        self.assertEqual(price_args["recurring"], {"interval": "week"})
        schedule_args = stripe.SubscriptionSchedule.create.call_args.kwargs
        self.assertEqual(schedule_args["default_settings"]["collection_method"], "charge_automatically")
        self.assertEqual(schedule_args["default_settings"]["default_payment_method"], "pm_test")

    @patch("scholarships.stripe_payments.stripe_client")
    def test_deposit_checkout_saves_card_for_future_automatic_charges(self, stripe_client):
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
        stripe.checkout.Session.create.return_value = SimpleNamespace(id="cs_test", url="https://checkout.stripe.test")
        stripe_client.return_value = stripe

        create_checkout_session(plan)

        checkout_args = stripe.checkout.Session.create.call_args.kwargs
        self.assertEqual(checkout_args["mode"], "payment")
        self.assertEqual(checkout_args["payment_intent_data"]["setup_future_usage"], "off_session")

    @patch("scholarships.stripe_payments.stripe_client")
    def test_zero_deposit_checkout_collects_a_card_before_starting_schedule(self, stripe_client):
        self.client.force_authenticate(self.staff)
        self.client.put(
            f"/api/admin/bursary-applications/{self.application.pk}/payment-plan",
            self.plan_payload(
                deposit_amount="0.00",
                installment_count=4,
                installment_amount="1000.00",
            ),
            format="json",
        )
        plan = BursaryPaymentPlan.objects.select_related("application").get()
        plan.stripe_customer_id = "cus_test"
        plan.save(update_fields=["stripe_customer_id", "updated_at"])
        stripe = Mock()
        stripe.checkout.Session.create.return_value = SimpleNamespace(id="cs_setup", url="https://checkout.stripe.test")
        stripe_client.return_value = stripe

        create_checkout_session(plan)

        checkout_args = stripe.checkout.Session.create.call_args.kwargs
        self.assertEqual(checkout_args["mode"], "setup")
        self.assertEqual(checkout_args["payment_method_types"], ["card"])
        self.assertIn("setup_intent_data", checkout_args)
