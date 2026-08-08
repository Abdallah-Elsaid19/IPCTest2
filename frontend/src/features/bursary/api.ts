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

export interface BursarySubmissionResponse {
  id: number;
  applicationReference: string;
  status: BursaryStatus;
  submittedAt: string;
}

export interface CurrentBursaryApplicationResponse {
  hasApplication: boolean;
  editable: boolean;
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
  preferred_pathway: string;
  preferred_modules: string[];
  preferred_pathway_label: string;
  status_history: BursaryStatusHistory[];
};

export interface BursaryAdminQuery {
  page?: number;
  search?: string;
  status?: "" | BursaryStatus;
  pathway?: string;
  employed?: "" | "true" | "false";
  country?: string;
  dateFrom?: string;
  dateTo?: string;
  ordering?: string;
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
};

export const bursaryApi = {
  current: (applicationReference = "", signal?: AbortSignal) =>
    apiJson<CurrentBursaryApplicationResponse>(
      `/api/bursary-applications/current${applicationReference ? `?applicationReference=${encodeURIComponent(applicationReference)}` : ""}`,
      undefined,
      { signal, requestSource: "CurrentBursaryApplication" },
    ),
  submit: (payload: BursaryApplicationFormValues) =>
    apiJson<BursarySubmissionResponse>(
      "/api/bursary-applications",
      prepareBursarySubmissionPayload(payload),
      { requestSource: "BursaryApplicationForm" },
    ),
  resubmit: (payload: BursaryApplicationFormValues, applicationReference = "") =>
    apiJson<BursarySubmissionResponse>(
      `/api/bursary-applications/current${applicationReference ? `?applicationReference=${encodeURIComponent(applicationReference)}` : ""}`,
      prepareBursarySubmissionPayload(payload),
      { method: "PATCH", requestSource: "BursaryApplicationResubmission" },
    ),
  list: (query: BursaryAdminQuery, signal?: AbortSignal) => {
    const params = new URLSearchParams();
    if (query.page && query.page > 1) params.set("page", String(query.page));
    if (query.search) params.set("search", query.search);
    if (query.status) params.set("status", query.status);
    if (query.pathway) params.set("pathway", query.pathway);
    if (query.employed) params.set("employed", query.employed);
    if (query.country) params.set("country", query.country);
    if (query.dateFrom) params.set("date_from", query.dateFrom);
    if (query.dateTo) params.set("date_to", query.dateTo);
    if (query.ordering) params.set("ordering", query.ordering);
    const suffix = params.size ? `?${params.toString()}` : "";
    return apiJson<PaginatedBursaryApplications>(
      `/api/admin/bursary-applications${suffix}`,
      undefined,
      { signal, cache: "no-store", requestSource: "AdminBursaryApplications" },
    );
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
};
