import { apiJson } from "@/lib/api";
import { getSelectedFile } from "@/lib/validations/uploadSchema";
import type { BursaryApplicationFormValues } from "./schema";

export function prepareBursarySubmissionPayload(
  values: BursaryApplicationFormValues,
): FormData {
  const organisationDetails = values.personalDetails.currentlyEmployed
    ? {
        ...values.organisationDetails,
        organisationNotApplicable: false,
        employmentStartDate: values.organisationDetails.employmentStartDate || null,
      }
    : {
        organisationNotApplicable: true,
        organisationName: "",
        organisationWebsite: "",
        industryOrSector: "",
        organisationAddressLine1: "",
        organisationAddressLine2: "",
        organisationTownOrCity: "",
        organisationCountyOrRegion: "",
        organisationPostcode: "",
        organisationCountry: "",
        organisationSize: "",
        jobTitle: "",
        departmentOrBusinessUnit: "",
        employmentStartDate: null,
        employmentType: "",
        pathwayRoleSupport: "",
      };

  const { identityDocument, applicantPhoto, ...emergencyInformation } = values.emergencyInformation;
  const payload = {
    ...values,
    organisationDetails,
    emergencyInformation,
  };
  const formData = new FormData();
  formData.append("payload", JSON.stringify(payload));
  if (identityDocument !== "existing") {
    const file = getSelectedFile(identityDocument);
    if (file) formData.append("identityDocument", file);
  }
  if (applicantPhoto && applicantPhoto !== "existing") {
    const file = getSelectedFile(applicantPhoto);
    if (file) formData.append("applicantPhoto", file);
  }
  return formData;
}

export type BursaryStatus =
  | "submitted"
  | "under_review"
  | "needs_information"
  | "approved"
  | "rejected";

export type BursaryPaymentPlanStatus =
  | "draft"
  | "offered"
  | "accepted"
  | "deposit_pending"
  | "active"
  | "past_due"
  | "completed"
  | "cancelled"
  | "expired";

export interface BursaryPaymentInstallment {
  id: number;
  sequence: number;
  kind: "deposit" | "installment";
  amount: string;
  due_date: string;
  status: string;
  paid_at: string | null;
  stripe_invoice_id: string;
  stripe_hosted_invoice_url: string;
  failure_message: string;
}

export interface BursaryPaymentPlan {
  public_id: string;
  application_reference: string;
  applicant_name: string;
  applicant_email: string;
  status: BursaryPaymentPlanStatus;
  currency: "GBP";
  approved_modules: string[];
  start_date_and_cohorts: string;
  study_duration_months: number | null;
  amount_payable: string;
  deposit_amount: string;
  installment_count: number;
  installment_amount: string;
  final_installment_amount: string;
  first_installment_date: string | null;
  scheduled_total: string;
  offer_expires_at: string | null;
  offered_at: string | null;
  accepted_at: string | null;
  terms_version: string;
  stripe_configured: boolean;
  portal_login_email: string | null;
  offer_email_sent_at: string | null;
  offer_email_message_id?: string;
  offer_email_error?: string;
  stripe_checkout_session_id?: string;
  stripe_subscription_schedule_id?: string;
  last_stripe_error?: string;
  installments: BursaryPaymentInstallment[];
  created_at: string;
  updated_at: string;
}

export interface BursaryPaymentPlanInput {
  approved_modules: string[];
  start_date_and_cohorts: string;
  study_duration_months: number | null;
  amount_payable: string;
  deposit_amount: string;
  installment_count: number;
  installment_amount: string;
  first_installment_date: string | null;
  offer_expires_at: string | null;
}

export interface BursarySubmissionResponse {
  id: number;
  applicationReference: string;
  status: BursaryStatus;
  submittedAt: string;
}

export interface CurrentBursaryApplicationResponse {
  hasApplication: boolean;
  editable: boolean;
  resubmissionStatus?: "approved" | "under_review" | null;
  applicationReference: string;
  status: BursaryStatus | null;
  statusLabel: string;
  updatedAt: string | null;
  values: BursaryApplicationFormValues | null;
}

export interface BursaryApplicationListItem {
  id: number;
  application_reference: string;
  membership_reference: string;
  applicant_name: string;
  email: string;
  mobile_phone_e164: string;
  country: string;
  currently_employed: boolean;
  organisation_name: string;
  preferred_pathway: string;
  preferred_modules: string[];
  preferred_pathway_label: string;
  award_round: 1 | 2;
  award_round_label: string;
  status: BursaryStatus;
  status_label: string;
  submitted_at: string;
}

export interface BursarySummary {
  total: number;
  submitted: number;
  under_review: number;
  approved: number;
  rejected: number;
}

export interface PaginatedBursaryApplications {
  count: number;
  next: string | null;
  previous: string | null;
  results: BursaryApplicationListItem[];
  summary: BursarySummary;
  google_sheet_url: string;
}

export interface BursaryStatusHistory {
  id: number;
  previous_status: string;
  new_status: string;
  changed_by: number | null;
  changed_by_name: string;
  internal_reason: string;
  changed_at: string;
}

export type BursaryApplicationDetail = Record<string, unknown> & {
  can_request_information: boolean;
  post_approval_information_requested: boolean;
  id: number;
  application_reference: string;
  form_version: string;
  status: BursaryStatus;
  status_label: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
  assigned_reviewer: number | null;
  assigned_reviewer_name: string;
  reviewer_internal_notes: string;
  award_round: 1 | 2;
  award_round_label: string;
  first_name: string;
  last_name: string;
  membership_reference: string;
  preferred_name: string;
  email: string;
  mobile_phone_e164: string;
  phone_country_iso2: string;
  phone_dial_code: string;
  phone_national_number: string;
  country: string;
  organisation_name: string;
  currently_employed: boolean;
  has_disability_or_health_condition: boolean;
  preferred_pathway: string;
  preferred_modules: string[];
  preferred_pathway_label: string;
  status_history: BursaryStatusHistory[];
};

export interface BursaryAdminQuery {
  page?: number;
  search?: string;
  status?: "" | BursaryStatus;
  awardRound?: "" | "1" | "2";
  pathway?: string;
  employed?: "" | "true" | "false";
  country?: string;
  dateFrom?: string;
  dateTo?: string;
  ordering?: string;
}

function bursaryAdminQueryParams(query: BursaryAdminQuery, includePage = true) {
  const params = new URLSearchParams();
  if (includePage && query.page && query.page > 1) params.set("page", String(query.page));
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  if (query.awardRound) params.set("award_round", query.awardRound);
  if (query.pathway) params.set("pathway", query.pathway);
  if (query.employed) params.set("employed", query.employed);
  if (query.country) params.set("country", query.country);
  if (query.dateFrom) params.set("date_from", query.dateFrom);
  if (query.dateTo) params.set("date_to", query.dateTo);
  if (query.ordering) params.set("ordering", query.ordering);
  return params;
}

export const moduleLabels: Record<string, string> = {
  ai: "AI",
  pmi_sp: "PMI-SP",
  evm: "EVM",
  risk: "Risk",
  ppc: "PPC",
  msp: "MSP",
  managing_portfolios: "Managing Portfolios",
  stakeholder_management: "Stakeholder",
  pmo_module: "PMO",
  pmp: "PMP",
  pmo: "Certified PMO",
  mba_level_7: "MBA Level 7",
};

export const bursaryApi = {
  current: (applicationReference = "", signal?: AbortSignal, editToken = "") =>
    apiJson<CurrentBursaryApplicationResponse>(
      `/api/bursary-applications/current${applicationReference ? `?applicationReference=${encodeURIComponent(applicationReference)}` : ""}`,
      undefined,
      {
        signal,
        cache: "no-store",
        dedupe: !editToken,
        headers: editToken ? { "X-Bursary-Edit-Token": editToken } : undefined,
        requestSource: "CurrentBursaryApplication",
      },
    ),
  submit: (payload: BursaryApplicationFormValues) =>
    apiJson<BursarySubmissionResponse>(
      "/api/bursary-applications",
      prepareBursarySubmissionPayload(payload),
      { requestSource: "BursaryApplicationForm" },
    ),
  resubmit: (payload: BursaryApplicationFormValues, applicationReference = "", editToken = "") =>
    apiJson<BursarySubmissionResponse>(
      `/api/bursary-applications/current${applicationReference ? `?applicationReference=${encodeURIComponent(applicationReference)}` : ""}`,
      prepareBursarySubmissionPayload(payload),
      {
        method: "PATCH",
        dedupe: !editToken,
        headers: editToken ? { "X-Bursary-Edit-Token": editToken } : undefined,
        requestSource: "BursaryApplicationResubmission",
      },
    ),
  list: (query: BursaryAdminQuery, signal?: AbortSignal) => {
    const params = bursaryAdminQueryParams(query);
    const suffix = params.size ? `?${params.toString()}` : "";
    return apiJson<PaginatedBursaryApplications>(
      `/api/admin/bursary-applications${suffix}`,
      undefined,
      { signal, cache: "no-store", requestSource: "AdminBursaryApplications" },
    );
  },
  exportUrl: (query: BursaryAdminQuery) => {
    const params = bursaryAdminQueryParams(query, false);
    const suffix = params.size ? `?${params.toString()}` : "";
    return `/api/admin/bursary-applications/export${suffix}`;
  },
  detail: (id: number, signal?: AbortSignal) =>
    apiJson<BursaryApplicationDetail>(
      `/api/admin/bursary-applications/${id}`,
      undefined,
      { signal, requestSource: "AdminBursaryApplicationDetail" },
    ),
  updateStatus: (
    id: number,
    payload: { status: BursaryStatus; internal_reason?: string; assigned_reviewer?: number | null },
  ) =>
    apiJson<BursaryApplicationDetail>(
      `/api/admin/bursary-applications/${id}/status`,
      payload,
      { method: "PATCH", requestSource: "AdminBursaryStatus" },
    ),
  updateNotes: (id: number, reviewer_internal_notes: string) =>
    apiJson<BursaryApplicationDetail>(
      `/api/admin/bursary-applications/${id}/notes`,
      { reviewer_internal_notes },
      { method: "PATCH", requestSource: "AdminBursaryNotes" },
    ),
  getPaymentPlan: (id: number, signal?: AbortSignal) =>
    apiJson<{ payment_plan: BursaryPaymentPlan | null; defaults: { approved_modules: string[]; amount_payable: string } }>(
      `/api/admin/bursary-applications/${id}/payment-plan`,
      undefined,
      { signal, cache: "no-store", requestSource: "AdminBursaryPaymentPlan" },
    ),
  savePaymentPlan: (id: number, payload: BursaryPaymentPlanInput) =>
    apiJson<BursaryPaymentPlan>(
      `/api/admin/bursary-applications/${id}/payment-plan`,
      payload,
      { method: "PUT", requestSource: "AdminBursaryPaymentPlan" },
    ),
  offerPaymentPlan: (id: number) =>
    apiJson<BursaryPaymentPlan>(
      `/api/admin/bursary-applications/${id}/payment-plan/offer`,
      {},
      { requestSource: "AdminBursaryPaymentPlan" },
    ),
};

export const bursaryPaymentApi = {
  list: (signal?: AbortSignal) =>
    apiJson<{ plans: BursaryPaymentPlan[] }>("/api/payment-portal", undefined, {
      signal,
      cache: "no-store",
      requestSource: "PaymentPortal",
    }),
  detail: (publicId: string, signal?: AbortSignal) =>
    apiJson<BursaryPaymentPlan>(`/api/bursary-payment-plans/${publicId}`, undefined, {
      signal,
      cache: "no-store",
      requestSource: "BursaryPaymentPlan",
    }),
  accept: (publicId: string) =>
    apiJson<BursaryPaymentPlan>(`/api/bursary-payment-plans/${publicId}/accept`, {
      terms_accepted: true,
    }, { requestSource: "BursaryPaymentPlan" }),
  checkout: (publicId: string) =>
    apiJson<{ checkout_url: string; session_id: string }>(
      `/api/bursary-payment-plans/${publicId}/checkout`,
      {},
      { requestSource: "BursaryPaymentPlan" },
    ),
};
