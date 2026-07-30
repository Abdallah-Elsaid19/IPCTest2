import { ArrowLeft, ExternalLink, LoaderCircle, Printer, Save, UserCheck, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";

import { StatusBadge } from "@/features/admin/components/AdminPage";
import { useAuth } from "@/features/auth/AuthContext";
import {
  bursaryApi,
  type BursaryApplicationDetail,
  type BursaryStatus,
} from "@/features/bursary/api";
import { notifications } from "@/lib/notifications";

const statusOptions: Array<{ value: BursaryStatus; label: string }> = [
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under review" },
  { value: "needs_information", label: "Needs information" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const finalStatuses = new Set<BursaryStatus>(["approved", "rejected"]);

const allowedStatusOptions = (currentStatus: BursaryStatus) => statusOptions.filter(
  (option) => option.value !== currentStatus
    && !(currentStatus !== "submitted" && option.value === "submitted"),
);

const formatDate = (value: unknown, includeTime = false) => {
  if (!value) return "Not provided";
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-GB", includeTime
    ? { dateStyle: "medium", timeStyle: "short" }
    : { dateStyle: "medium" }).format(parsed);
};
const formatCurrency = (value: unknown) => value === null || value === "" || value === undefined
  ? "Not provided"
  : new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(value));
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
    format?: "date" | "datetime" | "currency" | "percent" | "boolean" | "url" | "multiline" | "restrictions";
    wide?: boolean;
  }>;
}) {
  const render = (key: string, format?: string): ReactNode => {
    const value = application[key];
    if (format === "date") return formatDate(value);
    if (format === "datetime") return formatDate(value, true);
    if (format === "currency") return formatCurrency(value);
    if (format === "percent") return value === null || value === undefined ? "Not provided" : `${Number(value).toLocaleString()}%`;
    if (format === "boolean") return value === true ? "Accepted / Yes" : "Not accepted / No";
    if (format === "url") {
      const url = safeExternalUrl(value);
      return url ? <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 break-all font-semibold text-primary-800 underline">{String(value)} <ExternalLink size={13} /></a> : "Not provided";
    }
    if (format === "restrictions") {
      const values = Array.isArray(value) ? value : [];
      return values.length ? (
        <span className="flex flex-wrap gap-2">
          {values.map((item) => <span key={String(item)} className="rounded-full bg-[#F6E8D2] px-2.5 py-1 text-xs font-semibold text-[#704707]">{label(String(item))}</span>)}
        </span>
      ) : "None recorded";
    }
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
        setNextStatus(allowedStatusOptions(value.status)[0]?.value ?? value.status);
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
  const availableStatuses = application ? allowedStatusOptions(application.status) : [];
  const openStatusModal = () => {
    if (!application || finalStatuses.has(application.status)) return;
    setNextStatus(allowedStatusOptions(application.status)[0]?.value ?? application.status);
    setStatusReason("");
    setShowStatusModal(true);
  };

  const updateStatus = async (assignToMe = false) => {
    if (!application || statusLock.current || finalStatuses.has(application.status)) return;
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
          <button type="button" onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D4C6B5] bg-white px-4 text-xs font-bold hover:border-primary-500"><Printer size={15} /> Print summary</button>
          {!isFinalStatus && (
            <button type="button" onClick={openStatusModal} className="inline-flex h-10 items-center rounded-xl bg-primary-500 px-4 text-xs font-bold text-[#171411] hover:bg-primary-600">Change status</button>
          )}
        </div>
      </div>

      <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Preferred pathway", application.preferred_pathway_label],
          ["Bursary requested", formatCurrency(application.bursary_amount_requested_gbp)],
          ["Requested percentage", `${Number(application.requested_bursary_percentage).toLocaleString()}%`],
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
            { key: "title", label: "Title" }, { key: "first_name", label: "First name" },
            { key: "membership_reference", label: "Membership reference" },
            { key: "last_name", label: "Last name" }, { key: "preferred_name", label: "Preferred name" },
            { key: "date_of_birth", label: "Date of birth", format: "date" }, { key: "email", label: "Email" },
            { key: "mobile_phone_e164", label: "Mobile (E.164)" }, { key: "phone_country_iso2", label: "Phone country" },
            { key: "phone_dial_code", label: "Calling code" }, { key: "phone_national_number", label: "National number" },
            { key: "home_address_line_1", label: "Home address line 1" }, { key: "home_address_line_2", label: "Home address line 2" },
            { key: "town_or_city", label: "Town or city" }, { key: "county_or_region", label: "County or region" },
            { key: "postcode", label: "Postcode" }, { key: "country", label: "Country" },
            { key: "linkedin_profile_url", label: "LinkedIn profile", format: "url", wide: true },
            { key: "currently_employed", label: "Currently employed", format: "boolean" },
            { key: "current_professional_status", label: "Professional status" },
            { key: "preferred_contact_method", label: "Preferred contact method" },
          ]} />
        </DetailSection>
        <DetailSection title="2. Organisation Details">
          <DetailGrid application={application} fields={[
            { key: "organisation_not_applicable", label: "Not applicable", format: "boolean" },
            { key: "organisation_name", label: "Organisation name" }, { key: "organisation_website", label: "Website", format: "url" },
            { key: "industry_or_sector", label: "Industry or sector" }, { key: "organisation_size", label: "Organisation size" },
            { key: "organisation_address_line_1", label: "Address line 1" }, { key: "organisation_address_line_2", label: "Address line 2" },
            { key: "organisation_town_or_city", label: "Town or city" }, { key: "organisation_county_or_region", label: "County or region" },
            { key: "organisation_postcode", label: "Postcode" }, { key: "organisation_country", label: "Country" },
            { key: "job_title", label: "Job title" }, { key: "department_or_business_unit", label: "Department / unit" },
            { key: "employment_start_date", label: "Employment start date", format: "date" }, { key: "employment_type", label: "Employment type" },
            { key: "line_manager_name", label: "Line manager name" }, { key: "line_manager_email", label: "Line manager email" },
            { key: "employer_awareness", label: "Employer awareness" },
            { key: "pathway_role_support", label: "How pathway supports role", format: "multiline", wide: true },
          ]} />
        </DetailSection>
        <DetailSection title="3. IPC Bursary Request and Scholarship Outcomes">
          <DetailGrid application={application} fields={[
            { key: "quoted_pathway_cost_gbp", label: "Quoted pathway cost", format: "currency" },
            { key: "bursary_amount_requested_gbp", label: "Bursary requested", format: "currency" },
            { key: "requested_bursary_percentage", label: "Requested percentage", format: "percent" },
            { key: "other_contribution_available_gbp", label: "Other contribution", format: "currency" },
            { key: "proceed_with_lower_bursary", label: "Proceed with lower bursary" },
            { key: "financial_circumstances", label: "Financial circumstances", format: "multiline", wide: true },
            { key: "scholarship_outcome", label: "Scholarship outcome", format: "multiline", wide: true },
            { key: "measurable_result", label: "Measurable result", format: "multiline", wide: true },
            { key: "learning_application_and_contribution", label: "Learning application and contribution", format: "multiline", wide: true },
          ]} />
        </DetailSection>
        <DetailSection title="4. Pathway Selection">
          <DetailGrid application={application} fields={[
            { key: "preferred_pathway_label", label: "Preferred pathway" },
            { key: "preferred_start_month_or_intake", label: "Preferred start / intake" },
            { key: "highest_relevant_qualification", label: "Highest relevant qualification" },
            { key: "professional_memberships_or_certifications", label: "Memberships / certifications", format: "multiline", wide: true },
            { key: "relevant_experience", label: "Relevant experience", format: "multiline", wide: true },
            { key: "pathway_fit_reason", label: "Pathway fit reason", format: "multiline", wide: true },
          ]} />
        </DetailSection>
        <DetailSection title="5. Mandatory Terms and Consents">
          <DetailGrid application={application} fields={[
            { key: "linkedin_award_post_consent", label: "LinkedIn award post", format: "boolean" },
            { key: "second_progress_post_consent", label: "Second progress post", format: "boolean" },
            { key: "tag_ipc_consent", label: "Tag IPC", format: "boolean" },
            { key: "reshare_and_quote_consent", label: "Reshare and quote", format: "boolean" },
            { key: "professional_headshot_consent", label: "Professional headshot", format: "boolean" },
            { key: "participation_consent", label: "Participation", format: "boolean" },
            { key: "approved_media_use_consent", label: "Approved media use", format: "boolean" },
            { key: "report_restrictions_consent", label: "Report restrictions", format: "boolean" },
            { key: "publicity_restrictions", label: "Publicity restrictions", format: "restrictions", wide: true },
            { key: "publicity_restriction_details", label: "Restriction details", format: "multiline", wide: true },
            { key: "professional_headshot_reference", label: "Headshot file / secure reference", format: "multiline", wide: true },
            { key: "general_marketing_consent", label: "Optional general marketing", format: "boolean" },
            { key: "terms_accepted_at", label: "Terms accepted", format: "datetime" },
          ]} />
        </DetailSection>
        <DetailSection title="6. Review, Declaration and Signature">
          <DetailGrid application={application} fields={[
            { key: "section_1_complete", label: "Section 1 confirmed", format: "boolean" },
            { key: "section_2_complete_or_not_applicable", label: "Section 2 confirmed", format: "boolean" },
            { key: "section_3_complete", label: "Section 3 confirmed", format: "boolean" },
            { key: "section_4_complete", label: "Section 4 confirmed", format: "boolean" },
            { key: "section_5_complete", label: "Section 5 confirmed", format: "boolean" },
            { key: "information_accurate_declaration", label: "Information accurate", format: "boolean" },
            { key: "no_award_guarantee_declaration", label: "No award guarantee", format: "boolean" },
            { key: "pathway_terms_declaration", label: "Pathway terms", format: "boolean" },
            { key: "processing_consent_declaration", label: "Processing consent", format: "boolean" },
            { key: "applicant_identity_declaration", label: "Applicant identity", format: "boolean" },
            { key: "full_legal_name", label: "Full legal name" }, { key: "date_signed", label: "Date signed", format: "date" },
            { key: "electronic_signature", label: "Electronic signature" }, { key: "signature_place", label: "Place of signature" },
            { key: "preferred_secure_submission_reference", label: "Preferred secure submission reference", wide: true },
            { key: "additional_review_information", label: "Additional review information", format: "multiline", wide: true },
            { key: "declarations_accepted_at", label: "Declarations accepted", format: "datetime" },
          ]} />
        </DetailSection>
      </div>

      <section className="mt-6 grid gap-5 lg:grid-cols-2 print:hidden">
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
              {nextStatus === "rejected" ? "Rejection reason sent to the applicant *" : "Internal reason or note"}
              <textarea
                value={statusReason}
                onChange={(event) => setStatusReason(event.target.value)}
                rows={4}
                maxLength={4000}
                required={nextStatus === "rejected"}
                placeholder={nextStatus === "rejected" ? "Explain why the application was rejected." : ""}
                className="mt-2 w-full rounded-xl border border-[#D4C6B5] bg-white p-3 outline-none focus:border-primary-500"
              />
            </label>
            <p className="mt-4 rounded-xl bg-[#F6E8D2] p-3 text-xs leading-5 text-[#704707]">
              {nextStatus === "rejected"
                ? "This reason will be included in the rejection email and the member-panel notification."
                : "This changes review status only. The applicant's submitted answers remain unchanged."}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowStatusModal(false)} disabled={isSavingStatus} className="h-10 rounded-xl border border-[#D4C6B5] px-4 text-xs font-bold">Cancel</button>
              <button type="button" onClick={() => void updateStatus()} disabled={isSavingStatus || nextStatus === application.status || (nextStatus === "rejected" && !statusReason.trim())} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary-500 px-4 text-xs font-bold disabled:opacity-50">{isSavingStatus && <LoaderCircle size={15} className="animate-spin" />} Confirm status change</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
