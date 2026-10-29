import { ArrowLeft, ExternalLink, LoaderCircle, Mail, Pencil, Printer, Save, UserCheck, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";

import { StatusBadge } from "@/features/admin/components/AdminPage";
import { useAuth } from "@/features/auth/AuthContext";
import {
  bursaryApi,
  bursaryCurrencyOptions,
  type BursaryApplicationDetail,
  type BursaryPaymentPlan,
  type BursaryPaymentPlanInput,
  type BursaryStatus,
} from "@/features/bursary/api";
import { calculateBursaryFundingEstimate } from "@/features/bursary/pathways";
import { apiBlob } from "@/lib/api";
import { notifications } from "@/lib/notifications";
import { allowedBursaryStatuses } from "../statusTransitions";

const statusOptions: Array<{ value: BursaryStatus; label: string }> = [
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under review" },
  { value: "needs_information", label: "Needs information" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const billingIntervalOptions: Array<{ value: BursaryPaymentPlanInput["billing_interval"]; label: string }> = [
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
  { value: "year", label: "Yearly" },
];

const finalStatuses = new Set<BursaryStatus>(["approved", "rejected"]);

// Plans in these states can be reopened for editing; collecting plans keep their paid terms.
const editablePlanStatuses = new Set<BursaryPaymentPlan["status"]>(["offered", "accepted", "deposit_pending", "active", "past_due"]);
const collectingPlanStatuses = new Set<BursaryPaymentPlan["status"]>(["active", "past_due"]);

const planForm = (
  plan: BursaryPaymentPlan | null,
  defaults: { approved_modules: string[]; amount_payable: string } = { approved_modules: [], amount_payable: "" },
): BursaryPaymentPlanInput => {
  const amount = plan?.amount_payable ?? String(defaults.amount_payable || "");
  return {
    currency: plan?.currency ?? "GBP",
    approved_modules: plan?.approved_modules ?? defaults.approved_modules,
    start_date_and_cohorts: plan?.start_date_and_cohorts ?? "",
    study_duration_months: plan?.study_duration_months ?? null,
    amount_payable: amount,
    deposit_amount: plan?.deposit_amount ?? amount,
    installment_count: plan?.installment_count ?? 0,
    billing_interval: plan?.billing_interval ?? "month",
    installment_amount: plan?.installment_amount ?? "0.00",
    first_installment_date: plan?.first_installment_date ?? null,
    offer_expires_at: plan?.offer_expires_at ?? null,
  };
};

const allowedStatusOptions = (application: BursaryApplicationDetail) => {
  const allowed = allowedBursaryStatuses(application);
  return statusOptions.filter((option) => allowed.includes(option.value));
};

const formatDate = (value: unknown, includeTime = false) => {
  if (!value) return "Not provided";
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-GB", includeTime
    ? { dateStyle: "medium", timeStyle: "short" }
    : { dateStyle: "medium" }).format(parsed);
};
const formatGbp = (value: number) => new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
}).format(value);
const safeExternalUrl = (value: unknown) => {
  try {
    const url = new URL(String(value));
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
};
const label = (value: string) => value
  .replaceAll("_", " ")
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

function AuthenticatedImage({ src }: { src: string }) {
  const [objectUrl, setObjectUrl] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    let createdUrl = "";
    setObjectUrl("");
    setFailed(false);
    void apiBlob(src)
      .then((blob) => {
        if (!active) return;
        createdUrl = URL.createObjectURL(blob);
        setObjectUrl(createdUrl);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [src]);

  if (failed) return <span>Applicant photo could not be loaded.</span>;
  if (!objectUrl) return <span>Loading applicant photo…</span>;
  return (
    <a href={objectUrl} target="_blank" rel="noreferrer">
      <img src={objectUrl} alt="Applicant" className="max-h-52 max-w-full border border-[#DED2C3] bg-white object-contain p-2" />
    </a>
  );
}

function AuthenticatedFileLink({ src }: { src: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const openDocument = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setFailed(false);
    const target = window.open("about:blank", "_blank");
    try {
      const blob = await apiBlob(src);
      const objectUrl = URL.createObjectURL(blob);
      if (target) target.location.href = objectUrl;
      else window.location.href = objectUrl;
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch {
      target?.close();
      setFailed(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (failed) return <span>Secure document could not be loaded.</span>;
  return (
    <button type="button" onClick={() => void openDocument()} disabled={isLoading} className="inline-flex items-center gap-1 font-semibold text-primary-800 underline disabled:cursor-wait disabled:opacity-60">
      {isLoading ? "Opening secure document…" : "Open secure document"} <ExternalLink size={13} />
    </button>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="break-inside-avoid rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] shadow-sm">
      <div className="border-b border-[#E8DED2] px-5 py-4">
        <h2 className="font-black text-[#241F1A]">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function DetailGrid({
  application,
  fields,
}: {
  application: BursaryApplicationDetail;
  fields: Array<{
    key: string;
    label: string;
    format?: "date" | "datetime" | "boolean" | "consent" | "choice" | "phone-country" | "url" | "multiline" | "signature" | "file" | "image";
    wide?: boolean;
  }>;
}) {
  const render = (key: string, format?: string): ReactNode => {
    const value = application[key];
    if (format === "date") return formatDate(value);
    if (format === "datetime") return formatDate(value, true);
    if (format === "boolean") return value === true ? "Yes" : "No";
    if (format === "consent") return value === true ? "Accepted" : "Not accepted";
    if (format === "choice") return value ? label(String(value)) : "Not provided";
    if (format === "phone-country") {
      const dialCode = application.phone_dial_code;
      return [value, dialCode].filter(Boolean).join(" · ") || "Not provided";
    }
    if (format === "url") {
      const url = safeExternalUrl(value);
      return url ? <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 break-all font-semibold text-primary-800 underline">{String(value)} <ExternalLink size={13} /></a> : "Not provided";
    }
    if (format === "signature") {
      const signature = typeof value === "string" && value.startsWith("data:image/png;base64,") ? value : "";
      return signature
        ? <img src={signature} alt="Applicant's drawn signature" className="max-h-36 max-w-full border border-[#DED2C3] bg-white p-2" />
        : value ? String(value) : "Not provided";
    }
    if (format === "file") return value
      ? <AuthenticatedFileLink src={String(value)} />
      : "Not provided";
    if (format === "image") return value
      ? <AuthenticatedImage src={String(value)} />
      : "Not provided";
    if (format === "multiline") return value ? <span className="whitespace-pre-wrap">{String(value)}</span> : "Not provided";
    if (value === null || value === undefined || value === "") return "Not provided";
    return String(value);
  };
  return (
    <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
      {fields.map((field) => (
        <div key={field.key} className={field.wide ? "sm:col-span-2 xl:col-span-3" : ""}>
          <dt className="text-[10px] font-bold uppercase tracking-wider text-[#857A70]">{field.label}</dt>
          <dd className="mt-1 break-words text-sm font-medium leading-6 text-[#332D27]">
            {render(field.key, field.format)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ModulePricing({ selectedModules }: { selectedModules: string[] }) {
  const estimate = calculateBursaryFundingEstimate(selectedModules);
  if (!estimate.lines.length) return null;

  return (
    <div className="mt-6 overflow-x-auto border border-[#E8DED2]">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="bg-[#F3EBE1] text-[10px] uppercase tracking-wider text-[#6F655B]">
          <tr>
            <th className="px-4 py-3">Module</th>
            <th className="px-4 py-3 text-right">Module cost</th>
            <th className="px-4 py-3 text-right">IPC Fund contribution</th>
            <th className="px-4 py-3 text-right">Estimated amount you pay</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E8DED2] bg-white">
          {estimate.lines.map((line) => (
            <tr key={line.value}>
              <td className="px-4 py-3 font-semibold text-[#332D27]">{line.title}</td>
              <td className="px-4 py-3 text-right">{formatGbp(line.costGbp)}</td>
              <td className="px-4 py-3 text-right text-emerald-700">
                -{formatGbp(line.discountGbp)} ({line.supportPercentage}%)
              </td>
              <td className="px-4 py-3 text-right font-bold text-primary-800">{formatGbp(line.amountPayableGbp)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t-2 border-[#D7C9B8] bg-[#FAF5EE] font-black text-[#241F1A]">
          <tr>
            <th className="px-4 py-3">Total</th>
            <td className="px-4 py-3 text-right">{formatGbp(estimate.totalCostGbp)}</td>
            <td className="px-4 py-3 text-right text-emerald-700">-{formatGbp(estimate.totalDiscountGbp)}</td>
            <td className="px-4 py-3 text-right text-primary-800">{formatGbp(estimate.totalPayableGbp)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

const paidInstallmentsOf = (plan: BursaryPaymentPlan | null) => (
  plan && collectingPlanStatuses.has(plan.status)
    ? plan.installments.filter((item) => item.kind === "installment" && item.status === "paid")
    : []
);

// Even split of the unpaid balance in whole cents; the final installment absorbs the remainder.
const autoInstallmentCents = (form: BursaryPaymentPlanInput, paidTotal: number, paidCount: number) => {
  const remaining = form.installment_count - paidCount;
  const balanceCents = Math.round((Number(form.amount_payable || 0) - Number(form.deposit_amount || 0) - paidTotal) * 100);
  return remaining > 0 ? Math.floor(balanceCents / remaining) : 0;
};

const hasManualInstallment = (plan: BursaryPaymentPlan | null) => {
  if (!plan?.installment_count) return false;
  const paid = paidInstallmentsOf(plan);
  const paidTotal = paid.reduce((total, item) => total + Number(item.amount), 0);
  return Math.round(Number(plan.installment_amount) * 100) !== autoInstallmentCents(planForm(plan), paidTotal, paid.length);
};

function PaymentPlanBuilder({ application }: { application: BursaryApplicationDetail }) {
  const [plan, setPlan] = useState<BursaryPaymentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [offering, setOffering] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [manualRegular, setManualRegular] = useState(false);
  const [form, setForm] = useState<BursaryPaymentPlanInput>(() => planForm(null));

  useEffect(() => {
    const controller = new AbortController();
    void bursaryApi.getPaymentPlan(application.id, controller.signal)
      .then(({ payment_plan, defaults }) => {
        setPlan(payment_plan);
        setForm(planForm(payment_plan, defaults));
        setManualRegular(hasManualInstallment(payment_plan));
      })
      .catch((reason) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load the payment plan.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [application.id]);

  const amount = Number(form.amount_payable || 0);
  const deposit = Number(form.deposit_amount || 0);
  const collecting = Boolean(plan && collectingPlanStatuses.has(plan.status));
  const paidInstallments = paidInstallmentsOf(plan);
  const paidTotal = paidInstallments.reduce((total, item) => total + Number(item.amount), 0);
  const remaining = form.installment_count - paidInstallments.length;
  const balanceCents = Math.round((amount - deposit - paidTotal) * 100);
  const regularCents = manualRegular
    ? Math.round(Number(form.installment_amount || 0) * 100)
    : autoInstallmentCents(form, paidTotal, paidInstallments.length);
  const regular = regularCents / 100;
  const finalInstallment = form.installment_count > 0 && remaining > 0
    ? (balanceCents - regularCents * (remaining - 1)) / 100
    : 0;
  const validTotal = amount > 0 && deposit >= 0 && deposit <= amount && (
    form.installment_count === 0
      ? deposit === amount && !collecting
      : regular > 0 && remaining > 0 && finalInstallment > 0 && Boolean(form.first_installment_date)
  );
  const editable = !plan || plan.status === "draft" || editing;
  const money = (value: number | string) => new Intl.NumberFormat("en-GB", { style: "currency", currency: form.currency }).format(Number(value));

  const update = <K extends keyof BursaryPaymentPlanInput>(key: K, value: BursaryPaymentPlanInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const saved = await bursaryApi.savePaymentPlan(application.id, {
        ...form,
        installment_amount: form.installment_count > 0 ? regular.toFixed(2) : "0.00",
      });
      setPlan(saved);
      setForm(planForm(saved));
      setManualRegular(hasManualInstallment(saved));
      setEditing(false);
      notifications.success(collectingPlanStatuses.has(saved.status)
        ? "Payment plan updated and the Stripe schedule replaced."
        : "Payment plan saved as a draft.");
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Could not save the payment plan.";
      setError(message);
      notifications.error(message);
    } finally {
      setSaving(false);
    }
  };

  const offer = async () => {
    setOffering(true);
    setError("");
    try {
      const offered = await bursaryApi.offerPaymentPlan(application.id);
      setPlan(offered);
      notifications.success("Payment plan offered to the applicant.");
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Could not offer the payment plan.";
      setError(message);
      notifications.error(message);
    } finally {
      setOffering(false);
    }
  };

  if (loading) return <DetailSection title="Payment plan"><p className="text-sm text-[#756B61]">Loading payment plan…</p></DetailSection>;
  return (
    <DetailSection title="Payment plan">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#332D27]">{form.approved_modules.join(", ") || application.preferred_pathway_label}</p>
          <p className="mt-1 text-xs text-[#756B61]">Study dates and payment dates are recorded separately.</p>
        </div>
        <div className="flex items-center gap-2">
          {plan && editablePlanStatuses.has(plan.status) && !editing && (
            <button type="button" onClick={() => setEditing(true)} className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#D4C6B5] bg-white px-4 text-xs font-bold hover:border-primary-500">
              <Pencil size={14} /> Edit plan
            </button>
          )}
          {plan && <StatusBadge status={plan.status} />}
        </div>
      </div>
      {editing && plan && (
        <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          {collecting
            ? "Paid payments stay as they are. Saving cancels the current Stripe schedule and creates a new one for the unpaid installments, charged to the applicant's saved card. The currency and deposit cannot change."
            : "Saving returns this plan to draft. The applicant must be offered the updated plan and accept it again before paying."}
        </p>
      )}
      {!plan?.stripe_configured && plan && (
        <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">Stripe keys are not configured yet. The plan can be prepared, but checkout will remain unavailable.</p>
      )}
      {plan?.offer_email_sent_at && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
          Payment-plan email sent to {plan.applicant_email} on {formatDate(plan.offer_email_sent_at)}. Portal login: {plan.portal_login_email}.
        </p>
      )}
      {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="text-sm font-semibold sm:col-span-2 xl:col-span-4">Start dates and cohorts
          <textarea disabled={!editable} rows={4} value={form.start_date_and_cohorts} onChange={(event) => update("start_date_and_cohorts", event.target.value)} className="mt-2 w-full rounded-xl border border-[#D4C6B5] bg-white p-3 font-normal outline-none focus:border-primary-500 disabled:bg-[#F4EFE8]" placeholder="Start PMP on 7 October 2026…" />
        </label>
        <label className="text-sm font-semibold">Currency
          <select disabled={!editable || collecting} value={form.currency} onChange={(event) => update("currency", event.target.value as BursaryPaymentPlanInput["currency"])} className="mt-2 h-12 w-full rounded-xl border border-[#D4C6B5] bg-white px-3 font-normal disabled:bg-[#F4EFE8]">
            {bursaryCurrencyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold">Study duration (months)
          <input disabled={!editable} type="number" min="1" value={form.study_duration_months ?? ""} onChange={(event) => update("study_duration_months", event.target.value ? Number(event.target.value) : null)} className="mt-2 h-12 w-full rounded-xl border border-[#D4C6B5] px-3 font-normal disabled:bg-[#F4EFE8]" />
        </label>
        <label className="text-sm font-semibold">Amount payable ({form.currency})
          <input disabled={!editable} type="number" min="0.01" step="0.01" value={form.amount_payable} onChange={(event) => update("amount_payable", event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#D4C6B5] px-3 font-normal disabled:bg-[#F4EFE8]" />
        </label>
        <label className="text-sm font-semibold">Deposit ({form.currency})
          <input disabled={!editable || collecting} type="number" min="0" step="0.01" value={form.deposit_amount} onChange={(event) => update("deposit_amount", event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#D4C6B5] px-3 font-normal disabled:bg-[#F4EFE8]" />
        </label>
        <label className="text-sm font-semibold">Number of installments
          <input disabled={!editable} type="number" min="0" max="60" value={form.installment_count} onChange={(event) => update("installment_count", Number(event.target.value))} className="mt-2 h-12 w-full rounded-xl border border-[#D4C6B5] px-3 font-normal disabled:bg-[#F4EFE8]" />
        </label>
        {form.installment_count > 0 && <>
          <label className="text-sm font-semibold">Payment frequency
            <select disabled={!editable} value={form.billing_interval} onChange={(event) => update("billing_interval", event.target.value as BursaryPaymentPlanInput["billing_interval"])} className="mt-2 h-12 w-full rounded-xl border border-[#D4C6B5] bg-white px-3 font-normal disabled:bg-[#F4EFE8]">
              {billingIntervalOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">Regular {billingIntervalOptions.find((option) => option.value === form.billing_interval)?.label.toLowerCase()} payment ({form.currency})
            <input disabled={!editable} type="number" min="0.01" step="0.01" value={manualRegular ? form.installment_amount : regular > 0 ? regular.toFixed(2) : ""} onChange={(event) => { setManualRegular(true); update("installment_amount", event.target.value); }} className="mt-2 h-12 w-full rounded-xl border border-[#D4C6B5] px-3 font-normal disabled:bg-[#F4EFE8]" />
            {editable && (manualRegular
              ? <button type="button" onClick={() => setManualRegular(false)} className="mt-1 text-xs font-semibold text-primary-800 underline">Calculate automatically</button>
              : <span className="mt-1 block text-xs font-normal text-[#756B61]">Calculated automatically; type a value to override it.</span>)}
          </label>
          <label className="text-sm font-semibold">{collecting ? "Next installment date" : "First installment date"}
            <input disabled={!editable} type="date" value={form.first_installment_date ?? ""} onChange={(event) => update("first_installment_date", event.target.value || null)} className="mt-2 h-12 w-full rounded-xl border border-[#D4C6B5] px-3 font-normal disabled:bg-[#F4EFE8]" />
          </label>
        </>}
        <label className="text-sm font-semibold">Offer expires (optional)
          <input disabled={!editable} type="datetime-local" value={form.offer_expires_at ? form.offer_expires_at.slice(0, 16) : ""} onChange={(event) => update("offer_expires_at", event.target.value ? new Date(event.target.value).toISOString() : null)} className="mt-2 h-12 w-full rounded-xl border border-[#D4C6B5] px-3 font-normal disabled:bg-[#F4EFE8]" />
        </label>
      </div>
      <div className={`mt-5 rounded-xl border p-4 ${validTotal ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
        <p className="text-sm font-black">Plan check</p>
        <p className="mt-2 text-sm">{money(deposit)} deposit{paidInstallments.length ? ` + ${paidInstallments.length} paid (${money(paidTotal)})` : ""}{form.installment_count > 0 ? ` + ${Math.max(remaining - 1, 0)} × ${money(regular)} + final installment ${money(finalInstallment)}` : ""} = {money(amount)}</p>
        <p className="mt-1 text-xs">{validTotal ? "The schedule balances exactly." : collecting && remaining < 1 ? `${paidInstallments.length} installment(s) are already paid; schedule at least one more.` : "Adjust the plan before saving; the full amount must be scheduled."}</p>
      </div>
      {plan?.installments.length ? <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#F3EBE1] text-[10px] uppercase tracking-wider text-[#6F655B]"><tr><th className="px-3 py-2">Payment</th><th className="px-3 py-2">Due</th><th className="px-3 py-2">Amount</th><th className="px-3 py-2">Status</th><th className="px-3 py-2 text-right">Invoice</th></tr></thead><tbody className="divide-y divide-[#E8DED2]">{plan.installments.map((item) => {
        const invoiceUrl = item.status === "paid" ? safeExternalUrl(item.stripe_hosted_invoice_url) : "";
        return <tr key={item.id}><td className="px-3 py-2 capitalize">{item.kind === "deposit" ? "Deposit" : `Installment ${item.sequence}`}</td><td className="px-3 py-2">{formatDate(item.due_date)}</td><td className="px-3 py-2 font-semibold">{money(item.amount)}</td><td className="px-3 py-2"><StatusBadge status={item.status} /></td><td className="px-3 py-2 text-right">{invoiceUrl ? <a href={invoiceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-[#171411] px-3 py-2 text-xs font-bold text-white hover:bg-black" aria-label={`View or print invoice for ${item.kind === "deposit" ? "deposit" : `installment ${item.sequence}`}`}>View / print invoice <ExternalLink size={13} /></a> : <span className="text-[#9A8E82]">&mdash;</span>}</td></tr>;
      })}</tbody></table></div> : null}
      {editing && <div className="mt-5 flex flex-wrap justify-end gap-3">
        <button type="button" disabled={saving} onClick={() => { setEditing(false); setForm(planForm(plan)); setManualRegular(hasManualInstallment(plan)); setError(""); }} className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#D4C6B5] bg-white px-5 text-xs font-bold disabled:opacity-50">Cancel</button>
        <button type="button" disabled={saving || !validTotal} onClick={() => void save()} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary-500 px-5 text-xs font-black disabled:opacity-50">{saving && <LoaderCircle size={15} className="animate-spin" />} Save changes</button>
      </div>}
      {editable && !editing && <div className="mt-5 flex flex-wrap justify-end gap-3">
        <button type="button" disabled={saving || !validTotal} onClick={() => void save()} className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#D4C6B5] bg-white px-5 text-xs font-bold disabled:opacity-50">{saving && <LoaderCircle size={15} className="animate-spin" />} Save draft</button>
        <button type="button" disabled={offering || !plan || !validTotal} onClick={() => void offer()} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary-500 px-5 text-xs font-black disabled:opacity-50">{offering && <LoaderCircle size={15} className="animate-spin" />} Offer to applicant</button>
      </div>}
      {plan?.status === "offered" && !editing && <div className="mt-5 flex justify-end">
        <button type="button" disabled={offering} onClick={() => void offer()} className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#D4C6B5] bg-white px-5 text-xs font-bold disabled:opacity-50">{offering && <LoaderCircle size={15} className="animate-spin" />} Resend payment-plan email</button>
      </div>}
    </DetailSection>
  );
}

export default function AdminBursaryApplicationDetailsPage() {
  const { id } = useParams();
  const applicationId = Number(id);
  const { user } = useAuth();
  const [application, setApplication] = useState<BursaryApplicationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [nextStatus, setNextStatus] = useState<BursaryStatus>("under_review");
  const [statusReason, setStatusReason] = useState("");
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const statusLock = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    if (!Number.isInteger(applicationId) || applicationId <= 0) {
      setError("This application ID is invalid.");
      setIsLoading(false);
      return () => controller.abort();
    }
    void bursaryApi.detail(applicationId, controller.signal)
      .then((value) => {
        setApplication(value);
        setNextStatus(allowedStatusOptions(value)[0]?.value ?? value.status);
        setNotes(value.reviewer_internal_notes || "");
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) setError(requestError instanceof Error ? requestError.message : "Could not load this application.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [applicationId]);

  const applicantName = useMemo(
    () => application ? `${application.first_name} ${application.last_name}`.trim() : "",
    [application],
  );
  const isFinalStatus = application ? finalStatuses.has(application.status) : false;
  const availableStatuses = application ? allowedStatusOptions(application) : [];
  const openStatusModal = () => {
    if (!application || !availableStatuses.length) return;
    setNextStatus(availableStatuses[0].value);
    setStatusReason("");
    setShowStatusModal(true);
  };

  const resendInformationRequest = async () => {
    if (!application) return;
    setIsResending(true);
    try {
      const { recipients } = await bursaryApi.resendInformationRequest(application.id);
      notifications.success(`Information request resent to ${recipients.join(", ")}.`);
    } catch (requestError) {
      notifications.error(requestError instanceof Error ? requestError.message : "Could not resend the information request.");
    } finally {
      setIsResending(false);
    }
  };

  const updateStatus = async (assignToMe = false) => {
    if (!application || statusLock.current) return;
    if (assignToMe ? isFinalStatus : !availableStatuses.some((option) => option.value === nextStatus)) return;
    statusLock.current = true;
    setIsSavingStatus(true);
    try {
      const updated = await bursaryApi.updateStatus(application.id, {
        status: assignToMe ? application.status : nextStatus,
        internal_reason: statusReason.trim(),
        ...(assignToMe && user?.id ? { assigned_reviewer: user.id } : {}),
      });
      setApplication(updated);
      setNextStatus(updated.status);
      setShowStatusModal(false);
      setStatusReason("");
      notifications.success(assignToMe ? "Application assigned to you." : "Application status updated.");
    } catch (requestError) {
      notifications.error(requestError instanceof Error ? requestError.message : "Could not update the application.");
    } finally {
      statusLock.current = false;
      setIsSavingStatus(false);
    }
  };

  const saveNotes = async () => {
    if (!application || isSavingNotes) return;
    setIsSavingNotes(true);
    try {
      const updated = await bursaryApi.updateNotes(application.id, notes);
      setApplication(updated);
      notifications.success("Internal review note saved.");
    } catch (requestError) {
      notifications.error(requestError instanceof Error ? requestError.message : "Could not save the review note.");
    } finally {
      setIsSavingNotes(false);
    }
  };

  if (isLoading) return <div className="grid min-h-[55vh] place-items-center" role="status"><LoaderCircle className="animate-spin text-primary-700" size={30} /><span className="sr-only">Loading bursary application</span></div>;
  if (error || !application) return <div className="grid min-h-[55vh] place-items-center px-5 text-center text-red-800">{error || "Application not found."}</div>;

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-7 text-[#221E1A] md:px-8 md:py-9">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/admin/bursary-applications" className="inline-flex items-center gap-1 text-xs font-bold text-primary-800 hover:underline"><ArrowLeft size={14} /> Applications</Link>
          <p className="mt-4 font-mono text-xs font-bold text-primary-800">{application.application_reference}</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#171411] md:text-4xl">{applicantName}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <StatusBadge status={application.status} />
            <span className="text-xs text-[#756B61]">Submitted {formatDate(application.submitted_at, true)}</span>
            <span className="text-xs text-[#756B61]">Updated {formatDate(application.updated_at, true)}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          {!isFinalStatus && !application.assigned_reviewer && user?.id && (
            <button type="button" onClick={() => void updateStatus(true)} disabled={isSavingStatus} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D4C6B5] bg-white px-4 text-xs font-bold hover:border-primary-500"><UserCheck size={15} /> Assign to me</button>
          )}
          {application.status === "needs_information" && (
            <button type="button" onClick={() => void resendInformationRequest()} disabled={isResending} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D4C6B5] bg-white px-4 text-xs font-bold hover:border-primary-500 disabled:opacity-50">{isResending ? <LoaderCircle size={15} className="animate-spin" /> : <Mail size={15} />} Resend information request</button>
          )}
          <button type="button" onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D4C6B5] bg-white px-4 text-xs font-bold hover:border-primary-500"><Printer size={15} /> Print summary</button>
          {availableStatuses.length > 0 && (
            <button type="button" onClick={openStatusModal} className="inline-flex h-10 items-center rounded-xl bg-primary-500 px-4 text-xs font-bold text-[#171411] hover:bg-primary-600">{application.status === "approved" ? "Request information (once)" : "Change status"}</button>
          )}
        </div>
      </div>

      {application.post_approval_information_requested && (
        <p className="mt-4 text-sm text-[#756B61]">
          {application.status === "needs_information"
            ? "The one information request after approval has been sent. The application will return to Approved automatically when the applicant resubmits."
            : "The one information request after approval has been used."}
        </p>
      )}

      <section className="mt-7 grid gap-3 sm:grid-cols-2">
        {[
          ["Award round", application.award_round_label],
          ["Selected modules", application.preferred_pathway_label],
          ["Assigned reviewer", application.assigned_reviewer_name || "Unassigned"],
        ].map(([itemLabel, value]) => (
          <article key={itemLabel} className="rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#857A70]">{itemLabel}</p>
            <p className="mt-2 text-lg font-black">{value}</p>
          </article>
        ))}
      </section>

      <div className="mt-6 space-y-5">
        <DetailSection title="1. Personal Details">
          <DetailGrid application={application} fields={[
            { key: "first_name", label: "First name" },
            { key: "last_name", label: "Last name" },
            { key: "date_of_birth", label: "Date of birth", format: "date" }, { key: "email", label: "Email" },
            { key: "phone_country_iso2", label: "Country calling code", format: "phone-country" },
            { key: "phone_national_number", label: "Mobile phone number" },
            { key: "home_address_line_1", label: "Home address line 1" }, { key: "home_address_line_2", label: "Home address line 2" },
            { key: "town_or_city", label: "Town or city" }, { key: "county_or_region", label: "County or region" },
            { key: "postcode", label: "Postcode" }, { key: "country", label: "Country" },
            { key: "linkedin_profile_url", label: "LinkedIn profile URL", format: "url", wide: true },
            { key: "current_professional_status", label: "Current job title, professional status or area of practice" },
            { key: "currently_employed", label: "Currently employed by an organisation", format: "boolean" },
            { key: "preferred_contact_method", label: "Preferred contact method", format: "choice" },
          ]} />
        </DetailSection>
        <DetailSection title="2. Organisation Details">
          {application.currently_employed ? (
            <DetailGrid application={application} fields={[
              { key: "organisation_name", label: "Organisation name" }, { key: "organisation_website", label: "Organisation website", format: "url" },
              { key: "industry_or_sector", label: "Industry or sector" }, { key: "organisation_size", label: "Organisation size" },
              { key: "organisation_address_line_1", label: "Organisation address line 1" }, { key: "organisation_address_line_2", label: "Organisation address line 2" },
              { key: "organisation_town_or_city", label: "Town or city" }, { key: "organisation_county_or_region", label: "County or region" },
              { key: "organisation_postcode", label: "Postcode" }, { key: "organisation_country", label: "Country" },
              { key: "job_title", label: "Your job title" }, { key: "department_or_business_unit", label: "Department or business unit" },
              { key: "employment_start_date", label: "Employment start date", format: "date" }, { key: "employment_type", label: "Employment type" },
              { key: "pathway_role_support", label: "How will the selected module support your current role and organisation?", format: "multiline", wide: true },
            ]} />
          ) : (
            <p className="text-sm text-[#756B61]">Not applicable — the applicant selected that they are not currently employed.</p>
          )}
        </DetailSection>
        <DetailSection title="3. Emergency Contact and Identification">
          <DetailGrid application={application} fields={[
            { key: "emergency_contact_full_name", label: "Emergency contact full name" },
            { key: "emergency_contact_email", label: "Emergency contact email address" },
            { key: "emergency_contact_phone", label: "Emergency contact phone number" },
            { key: "identity_document", label: "Proof of identification", format: "file", wide: true },
            { key: "applicant_photo", label: "Your photo", format: "image", wide: true },
            { key: "has_disability_or_health_condition", label: "Long-term disability, health problem or learning difficulty", format: "boolean" },
            ...(application.has_disability_or_health_condition ? [{
              key: "primary_health_problem",
              label: "Additional support required to complete the course",
              format: "multiline" as const,
              wide: true,
            }] : []),
          ]} />
        </DetailSection>
        <DetailSection title="4. Module Selection">
          <DetailGrid application={application} fields={[
            { key: "preferred_pathway_label", label: "Preferred modules", wide: true },
          ]} />
          <ModulePricing selectedModules={application.preferred_modules} />
        </DetailSection>
        <DetailSection title="5. Mandatory Terms and Consents">
          <DetailGrid application={application} fields={[
            { key: "mandatory_terms_accepted", label: "Learner terms and mandatory bursary commitments", format: "consent", wide: true },
          ]} />
        </DetailSection>
        <DetailSection title="6. Review and Declaration">
          <DetailGrid application={application} fields={[
            { key: "date_signed", label: "Date signed", format: "date" },
            { key: "electronic_signature", label: "Drawn signature", format: "signature", wide: true },
          ]} />
        </DetailSection>
      </div>

      <section className="mt-6 grid gap-5 lg:grid-cols-2 print:hidden">
        {application.status === "approved" && <div className="lg:col-span-2"><PaymentPlanBuilder application={application} /></div>}
        <DetailSection title="Internal review note">
          <label htmlFor="bursary-review-notes" className="sr-only">Internal review note</label>
          <textarea id="bursary-review-notes" rows={7} value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={12000} className="w-full rounded-xl border border-[#D4C6B5] bg-white p-4 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" />
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-[#756B61]">Visible only to authorised staff.</p>
            <button type="button" onClick={() => void saveNotes()} disabled={isSavingNotes} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary-500 px-4 text-xs font-bold disabled:opacity-50">{isSavingNotes ? <LoaderCircle size={15} className="animate-spin" /> : <Save size={15} />} Save note</button>
          </div>
        </DetailSection>
        <DetailSection title="Status audit history">
          <ol className="space-y-4">
            {application.status_history.map((history) => (
              <li key={history.id} className="border-l-2 border-primary-400 pl-4">
                <p className="text-sm font-semibold">{history.previous_status ? `${label(history.previous_status)} → ` : ""}{label(history.new_status)}</p>
                <p className="mt-1 text-xs text-[#756B61]">{formatDate(history.changed_at, true)}{history.changed_by_name ? ` · ${history.changed_by_name}` : ""}</p>
                {history.internal_reason && <p className="mt-2 whitespace-pre-wrap text-sm text-[#554E47]">{history.internal_reason}</p>}
              </li>
            ))}
          </ol>
        </DetailSection>
      </section>

      {showStatusModal && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-4 print:hidden" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="bursary-status-title" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div><h2 id="bursary-status-title" className="text-xl font-black">Change application status</h2><p className="mt-1 text-sm text-[#756B61]">{application.application_reference}</p></div>
              <button type="button" onClick={() => setShowStatusModal(false)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-[#F4ECE1]" aria-label="Close"><X size={18} /></button>
            </div>
            <label className="mt-5 block text-sm font-semibold">New status
              <select value={nextStatus} onChange={(event) => setNextStatus(event.target.value as BursaryStatus)} className="mt-2 h-12 w-full rounded-xl border border-[#D4C6B5] bg-white px-3 outline-none focus:border-primary-500">
                {availableStatuses.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="mt-4 block text-sm font-semibold">
              {nextStatus === "rejected"
                ? "Rejection reason sent to the applicant *"
                : nextStatus === "approved"
                  ? "Message sent to the applicant (optional)"
                : nextStatus === "needs_information"
                  ? "Information requested from the applicant *"
                  : "Internal reason or note"}
              <textarea
                value={statusReason}
                onChange={(event) => setStatusReason(event.target.value)}
                rows={4}
                maxLength={4000}
                required={nextStatus === "rejected" || nextStatus === "needs_information"}
                placeholder={nextStatus === "rejected"
                  ? "Explain why the application was rejected."
                  : nextStatus === "approved"
                    ? "Add any approval details or next steps for the applicant."
                  : nextStatus === "needs_information"
                    ? "Explain clearly what information the applicant should update."
                    : ""}
                className="mt-2 w-full rounded-xl border border-[#D4C6B5] bg-white p-3 outline-none focus:border-primary-500"
              />
            </label>
            <p className="mt-4 rounded-xl bg-[#F6E8D2] p-3 text-xs leading-5 text-[#704707]">
              {application.status === "approved" && nextStatus === "needs_information"
                ? "This is the only information request allowed after approval. The applicant will receive a secure edit link, and the application will return to Approved automatically when they resubmit."
                : nextStatus === "approved"
                ? "If entered, this message will be included in the approval email sent to the applicant."
                : nextStatus === "rejected" || nextStatus === "needs_information"
                  ? "This message will be included in the email and the member-panel notification sent to the applicant."
                  : "This changes review status only. The applicant's submitted answers remain unchanged."}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowStatusModal(false)} disabled={isSavingStatus} className="h-10 rounded-xl border border-[#D4C6B5] px-4 text-xs font-bold">Cancel</button>
              <button type="button" onClick={() => void updateStatus()} disabled={isSavingStatus || nextStatus === application.status || ((nextStatus === "rejected" || nextStatus === "needs_information") && !statusReason.trim())} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary-500 px-4 text-xs font-bold disabled:opacity-50">{isSavingStatus && <LoaderCircle size={15} className="animate-spin" />} Confirm status change</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
