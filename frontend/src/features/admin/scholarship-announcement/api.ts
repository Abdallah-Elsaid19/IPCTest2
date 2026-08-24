import { apiJson } from "@/lib/api";

export interface ScholarshipAnnouncementContent {
  id: number;
  announcement_at: string;
  announcement_round: 1 | 2;
  is_active: boolean;
  fund_label: string;
  announcement_button_label: string;
  countdown_eyebrow: string;
  countdown_title: string;
  countdown_description: string;
  reminder_button_label: string;
  reminder_disclaimer: string;
  previous_round_button_label: string;
  recipients_eyebrow: string;
  recipients_title: string;
  recipients_description: string;
  recipients_highlight: string;
  register_title: string;
  register_description: string;
  register_date_label: string;
  register_intake_label: string;
  register_intake_value: string;
  register_total_label: string;
  register_status_label: string;
  register_status_value: string;
  empty_title: string;
  empty_description: string;
  publication_notice: string;
  apply_button_label: string;
  seo_title: string;
  seo_description: string;
  has_arrived: boolean;
  updated_by: number | null;
  updated_at: string;
}

export interface ScholarshipWinner {
  id: number;
  application: number | null;
  application_reference: string;
  name: string;
  award: string;
  country: string;
  modules: string[];
  category: string;
  award_year: number;
  award_round: 1 | 2;
  photo_url: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export type ScholarshipWinnerPayload = Omit<
  ScholarshipWinner,
  "id" | "application" | "application_reference" | "created_at" | "updated_at"
>;

const adminBase = "/api/admin";

export const scholarshipAnnouncementAdminApi = {
  content: (signal?: AbortSignal) => apiJson<ScholarshipAnnouncementContent>(
    `${adminBase}/scholarship-announcement`,
    undefined,
    { signal, cache: "no-store", requestSource: "AdminScholarshipAnnouncement" },
  ),
  updateContent: (payload: Partial<ScholarshipAnnouncementContent>) =>
    apiJson<ScholarshipAnnouncementContent>(
      `${adminBase}/scholarship-announcement`,
      payload,
      { method: "PATCH", requestSource: "AdminScholarshipAnnouncementUpdate" },
    ),
  winners: (signal?: AbortSignal) => apiJson<ScholarshipWinner[]>(
    `${adminBase}/scholarship-winners?ordering=award_round,display_order,name`,
    undefined,
    { signal, cache: "no-store", requestSource: "AdminScholarshipWinners" },
  ),
  createWinner: (payload: ScholarshipWinnerPayload) => apiJson<ScholarshipWinner>(
    `${adminBase}/scholarship-winners`,
    payload,
    { method: "POST", requestSource: "AdminScholarshipWinnerCreate" },
  ),
  updateWinner: (id: number, payload: Partial<ScholarshipWinnerPayload>) =>
    apiJson<ScholarshipWinner>(
      `${adminBase}/scholarship-winners/${id}`,
      payload,
      { method: "PATCH", requestSource: "AdminScholarshipWinnerUpdate" },
    ),
  deleteWinner: (id: number) => apiJson<void>(
    `${adminBase}/scholarship-winners/${id}`,
    undefined,
    { method: "DELETE", requestSource: "AdminScholarshipWinnerDelete" },
  ),
};
