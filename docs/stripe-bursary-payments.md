# Stripe bursary payment plans

Payment plans are created only after a bursary application is approved. Django
is the source of truth for the offer and every installment; Stripe collects the
money, and Google Sheets receives an operational mirror.

## Configure

Install backend dependencies and migrate:

```powershell
cd backend
pip install -r requirements.txt
python manage.py migrate
```

Set these deployment secrets without committing their values:

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CURRENCY=gbp
STRIPE_INVOICE_DAYS_UNTIL_DUE=7
```

Create a Stripe webhook endpoint pointing to:

```text
https://<api-host>/api/stripe/webhook
```

Enable these events:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `invoice.paid`
- `invoice.payment_failed`
- `invoice.finalized`
- `invoice.sent`
- `customer.subscription.created`
- `customer.subscription.updated`

Use Stripe test-mode keys first. Checkout collects the deposit. Django then
creates a finite Stripe Subscription Schedule using `send_invoice`. Stripe
emails each monthly invoice with its hosted payment page, and the same secure
payment link appears in the IPC payment portal. Enable Stripe invoice emails
and reminder rules in the Stripe Dashboard before going live.

## Staff workflow

1. Approve the bursary application.
2. Open its admin detail page and complete **Payment plan**.
3. Save the draft. The server validates that the deposit and installments equal
   the amount payable and generates every due date.
4. Select **Offer to applicant**. IPC creates or links the applicant's secure
   account and emails the complete plan, login email, password-setup link when
   needed, and `/payments` portal link. No password is emailed.
5. The applicant signs in to the dedicated payment portal, accepts the plan,
   and pays the deposit in Stripe Checkout.
6. Each month Stripe emails the invoice. The applicant can pay from that email
   or use **Pay invoice** in the IPC payment portal.

## Database records

- Django `auth_user`: the existing secure login account table.
- `scholarships_bursarypaymentplan`: the offer, linked portal user, totals,
  Stripe schedule identifiers, acceptance, and email-delivery audit fields.
- `scholarships_bursarypaymentinstallment`: one row per deposit/installment,
  including due date, status, Stripe invoice ID, and hosted invoice URL.
- `scholarships_stripewebhookevent`: webhook idempotency and processing errors.

## Google Sheets mirror

The payment-plan report creates a dedicated tab and does not rename or overwrite
the existing manually maintained tab. Configure:

```env
BURSARY_PAYMENT_PLANS_GOOGLE_SHEETS_ENABLED=True
BURSARY_PAYMENT_PLANS_SPREADSHEET_ID=<spreadsheet-id>
BURSARY_PAYMENT_PLANS_WORKSHEET_NAME=IPC Payment Plans
```

Share the spreadsheet as Editor with the existing Google service-account email.
The report contains applicant details, modules, study dates, totals, paid and
outstanding amounts, next due date, and one generated column per payment month.
The sheet is reporting-only; edits there never create or change Stripe charges.

Existing manual rows should be reviewed and imported before retiring the old
tab. Keep that tab as the historical record until each live plan has been
reconciled with the new Django installment records.
