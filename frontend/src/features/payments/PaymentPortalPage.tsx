import { useEffect, useState } from "react";
import { CreditCard, LoaderCircle, LockKeyhole, LogOut, ReceiptText } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/features/auth/AuthContext";
import {
  bursaryPaymentApi,
  type BursaryPaymentPlan,
} from "@/features/bursary/api";
import { notifications } from "@/lib/notifications";

const money = (value: string, currency: BursaryPaymentPlan["currency"]) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(Number(value));

const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value))
    : "—";

const billingIntervalLabels: Record<BursaryPaymentPlan["billing_interval"], string> = {
  day: "Daily",
  week: "Weekly",
  month: "Monthly",
  year: "Yearly",
};

export default function PaymentPortalPage({ embedded = false }: { embedded?: boolean }) {
  const [plans, setPlans] = useState<BursaryPaymentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const load = async (signal?: AbortSignal) => {
    const response = await bursaryPaymentApi.list(signal);
    setPlans(response.plans);
  };

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal)
      .catch((reason) => {
        if (!(reason instanceof DOMException && reason.name === "AbortError")) {
          setError(reason instanceof Error ? reason.message : "Payment plans could not be loaded.");
        }
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const updatePlan = (updated: BursaryPaymentPlan) => {
    setPlans((current) => current.map((plan) => plan.public_id === updated.public_id ? updated : plan));
  };

  const acceptPlan = async (plan: BursaryPaymentPlan) => {
    setBusy(`accept-${plan.public_id}`);
    setError("");
    try {
      updatePlan(await bursaryPaymentApi.accept(plan.public_id));
      notifications.success("Payment plan accepted.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The plan could not be accepted.");
    } finally {
      setBusy("");
    }
  };

  const payDeposit = async (plan: BursaryPaymentPlan) => {
    setBusy(`pay-${plan.public_id}`);
    setError("");
    try {
      const response = await bursaryPaymentApi.checkout(plan.public_id);
      window.location.assign(response.checkout_url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Stripe Checkout is unavailable.");
      setBusy("");
    }
  };

  const signOut = async () => {
    await logout();
    navigate("/login?next=/payments", { replace: true });
  };

  return (
    <main className={embedded ? "text-[#221E1A]" : "min-h-[100svh] bg-[#F4ECE1] text-[#221E1A]"}>
      {!embedded && <header className="border-b border-white/10 bg-[#0B0B0B] text-white">
        <div className="mx-auto flex min-h-20 max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-500 font-black text-black">IPC</span>
            <div><p className="font-black">IPC Payment Portal</p><p className="text-xs text-white/55">Secure bursary payments</p></div>
          </div>
          <div className="flex items-center gap-3 text-right">
            <div className="hidden sm:block"><p className="text-sm font-bold">{user?.name || user?.email}</p><p className="text-xs text-white/50">{user?.email}</p></div>
            <button type="button" onClick={() => void signOut()} className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 text-white/70 hover:text-white" aria-label="Sign out"><LogOut size={18} /></button>
          </div>
        </div>
      </header>}

      <div className={embedded ? "mx-auto max-w-6xl" : "mx-auto max-w-6xl px-4 py-8 sm:px-7 sm:py-12"}>
        <div className="mb-8 flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-500"><LockKeyhole size={22} /></span>
          <div><p className="text-xs font-black uppercase tracking-[.2em] text-primary-800">Private account</p><h1 className="mt-1 text-3xl font-black">Your payment plans</h1><p className="mt-2 text-sm text-[#756B61]">Review your agreement, pay the deposit, and track your automatic Stripe payments securely.</p></div>
        </div>

        {error && <p className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
        {loading ? <div className="grid min-h-60 place-items-center"><LoaderCircle className="animate-spin text-primary-700" size={34} /></div> : null}
        {!loading && plans.length === 0 ? <div className="rounded-2xl border border-[#DED1C2] bg-white p-8 text-center"><ReceiptText className="mx-auto text-[#A79683]" size={34} /><h2 className="mt-4 text-xl font-black">No payment plan yet</h2><p className="mt-2 text-sm text-[#756B61]">Your approved payment plan will appear here when IPC sends it.</p></div> : null}

        <div className="space-y-7">
          {plans.map((plan) => (
            <section key={plan.public_id} className="overflow-hidden rounded-3xl border border-[#DED1C2] bg-white shadow-[0_16px_50px_rgba(66,48,31,.08)]">
              <div className="flex flex-wrap items-start justify-between gap-4 bg-[#171411] px-5 py-5 text-white sm:px-7">
                <div><p className="text-xs font-bold uppercase tracking-wider text-primary-400">{plan.application_reference}</p><h2 className="mt-1 text-2xl font-black">{plan.approved_modules.join(", ")}</h2></div>
                <span className="rounded-full bg-primary-500 px-3 py-1.5 text-xs font-black uppercase text-black">{plan.status.replaceAll("_", " ")}</span>
              </div>
              <div className="p-5 sm:p-7">
                <dl className="grid gap-3 sm:grid-cols-4">
                  <Metric label="Total payable" value={money(plan.amount_payable, plan.currency)} />
                  <Metric label="Deposit" value={money(plan.deposit_amount, plan.currency)} />
                  <Metric label="Payment schedule" value={plan.installment_count ? `${plan.installment_count} × ${billingIntervalLabels[plan.billing_interval].toLowerCase()}` : "Single payment"} />
                  <Metric label="First installment" value={date(plan.first_installment_date)} />
                </dl>
                {plan.start_date_and_cohorts && <div className="mt-5 rounded-2xl bg-[#F7F1E9] p-5"><p className="text-xs font-black uppercase tracking-wider text-[#887C70]">Study dates and cohorts</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{plan.start_date_and_cohorts}</p></div>}

                <div className="mt-6 overflow-x-auto rounded-2xl border border-[#E5DACC]">
                  <table className="w-full min-w-[650px] text-left text-sm">
                    <thead className="bg-[#F3EBE1] text-xs uppercase tracking-wider text-[#6F655B]"><tr><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Due</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th></tr></thead>
                    <tbody className="divide-y divide-[#E8DED2]">{plan.installments.map((item) => <tr key={item.id}><td className="px-4 py-3 font-semibold">{item.kind === "deposit" ? "Deposit" : `Installment ${item.sequence}`}</td><td className="px-4 py-3">{date(item.due_date)}</td><td className="px-4 py-3 font-bold">{money(item.amount, plan.currency)}</td><td className="px-4 py-3 capitalize">{item.status.replaceAll("_", " ")}</td><td className="px-4 py-3 text-right">{item.stripe_hosted_invoice_url ? <a href={item.stripe_hosted_invoice_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-[#171411] px-3 py-2 text-xs font-bold text-white" aria-label={item.status === "paid" ? `View or print invoice for installment ${item.sequence}` : `Pay invoice for installment ${item.sequence}`}>{item.status === "paid" ? <ReceiptText size={14} /> : <CreditCard size={14} />} {item.status === "paid" ? "View / print invoice" : "Pay invoice"}</a> : "—"}</td></tr>)}</tbody>
                  </table>
                </div>

                {plan.status === "offered" && <div className="mt-6 rounded-2xl border border-primary-200 bg-primary-50 p-5"><label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={Boolean(accepted[plan.public_id])} onChange={(event) => setAccepted((current) => ({ ...current, [plan.public_id]: event.target.checked }))} className="mt-0.5 h-5 w-5 accent-primary-600" /><span>I have reviewed the modules, amounts, dates, and installment schedule and accept the IPC payment-plan terms.</span></label><button type="button" disabled={!accepted[plan.public_id] || Boolean(busy)} onClick={() => void acceptPlan(plan)} className="mt-4 h-12 w-full rounded-xl bg-primary-500 font-black text-black disabled:opacity-50">{busy === `accept-${plan.public_id}` ? "Accepting…" : "Accept payment plan"}</button></div>}
                {(["accepted", "deposit_pending"].includes(plan.status)) && <button type="button" disabled={Boolean(busy) || !plan.stripe_configured} onClick={() => void payDeposit(plan)} className="mt-6 h-12 w-full rounded-xl bg-[#171411] font-black text-white disabled:opacity-50">{busy === `pay-${plan.public_id}` ? "Opening Stripe…" : plan.deposit_amount === "0.00" ? "Start installment plan" : `Pay ${money(plan.deposit_amount, plan.currency)} deposit securely`}</button>}
                {!plan.stripe_configured && ["offered", "accepted", "deposit_pending"].includes(plan.status) && <p className="mt-3 text-sm text-amber-800">Online payment is being configured. IPC will email you when Stripe payment is available.</p>}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-[#E5DACC] p-4"><dt className="text-xs text-[#756B61]">{label}</dt><dd className="mt-1 font-black">{value}</dd></div>;
}
