export interface DashboardCounts {
  users: number;
  active_users: number;
  applications: number;
  applications_pending: number;
  contact_submissions: number;
  contact_open: number;
  club_enquiries: number;
  club_new: number;
  award_interests: number;
  award_new: number;
  event_registrations: number;
  published_events: number;
  newsletter_subscribers: number;
  membership_grades: number;
  award_programmes: number;
  media_assets: number;
}

export interface AdminClubMembership {
  id: number;
  applicant_name: string;
  applicant_email: string;
  club_name: string;
  club_slug: string;
  status: "pending" | "active" | "rejected" | "suspended" | "left";
  role: "member" | "moderator";
  created_at: string;
  updated_at: string;
}

export interface AdminClubMember {
  name: string;
  initials: string;
  club_role: "member" | "moderator";
  job_title: string;
  employer: string;
  city: string;
}

export interface AdminClub {
  public_id: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  location: string;
  specialism: string;
  active_member_count: number;
  discussion_count: number;
  message_count: number;
  members: AdminClubMember[];
}

export interface DashboardApplication {
  id: number;
  reference: string;
  name: string;
  email: string;
  grade: string;
  status: string;
  approved_user_email?: string | null;
  submitted_at: string;
}

export type ApplicationStatus = "submitted" | "under_review" | "approved" | "refused";

export interface ApplicationEvidence {
  id: number;
  evidence_type: string;
  original_name: string;
  file_url: string;
  content_type: string;
  file_size: number;
  uploaded_by_name: string;
  uploaded_at: string;
  updated_at: string;
}

export interface ApplicationReference {
  id: number;
  name: string;
  email: string;
  organisation: string;
  relationship: string;
  notes: string;
  created_at: string;
}

export interface ApplicationStatusHistory {
  id: number;
  from_status: string | null;
  to_status: string;
  changed_by_name: string;
  note: string;
  created_at: string;
}

export interface ApplicationReviewerNote {
  id: number;
  author_name: string;
  note: string;
  is_internal: boolean;
  created_at: string;
}

export interface AdminApplicationDetail {
  id: number;
  application_id: number;
  application_reference: string;
  status: ApplicationStatus;
  status_label: string;
  created_at: string;
  updated_at: string;
  submitted_at: string;
  grade: string;
  membership_grade_code: string;
  membership_grade_title: string;
  form_definition_code: string;
  form_definition_name: string;
  form_version: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
  country: string;
  organisation: string;
  contact_preference: string;
  contact_preference_label: string;
  grade_specific_data: Record<string, unknown>;
  code_of_conduct_consent: boolean;
  privacy_consent: boolean;
  evidence_files: ApplicationEvidence[];
  application_references: ApplicationReference[];
  reviewer_notes: ApplicationReviewerNote[];
  status_history: ApplicationStatusHistory[];
  reviewed_by: number | null;
  reviewed_by_name: string;
  reviewed_at: string | null;
  approved_user: number | null;
  approved_user_email: string | null;
  approved_user_is_managed_account: boolean;
  approved_by: number | null;
  approved_by_name: string;
  approved_at: string | null;
  account_created_at: string | null;
  welcome_email_sent_at: string | null;
  welcome_email_sent?: boolean;
  welcome_email_error?: string | null;
  refusal_reason: string;
  refused_by: number | null;
  refused_at: string | null;
  refusal_email_sent_at: string | null;
  refusal_email_sent?: boolean;
  refusal_email_error?: string | null;
}

export interface DashboardEnquiry {
  id: string;
  type: "contact" | "club" | "award";
  name: string;
  email: string;
  subject: string;
  status: string;
  created_at: string;
}

export interface AdminEnquiryDetail extends DashboardEnquiry {
  message: string;
  updated_at: string | null;
  metadata: Array<{ label: string; value: string | null }>;
}

export interface DashboardRegistration {
  id: number | string;
  name: string;
  email: string;
  event_name: string;
  status: string;
  created_at: string;
  source?: "ipc" | "eventbrite";
  reference?: string;
  quantity?: number;
  ticket_name?: string;
  confirmation_email_status?: "pending" | "sent" | "failed";
}

export interface EventbriteAttendeeResponse {
  results: DashboardRegistration[];
  total_count: number;
  is_stale: boolean;
  synced_at: string | null;
}

export type MembershipGradeCode = "AffIPC" | "MIPC" | "AFIPC_L3" | "AFIPC_L4" | "FIPC";

export interface AdminMembershipGrade {
  id: number;
  code: MembershipGradeCode;
  slug: string;
  title: string;
  short_title: string;
  description: string;
  image_url: string;
  post_nominal: string;
  pathway_title: string;
  pathway_description: string;
  evidence_requirements: string;
  cpd_requirements: string;
  professional_recognition: string;
  application_pathway: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  benefits: Array<{ id: number; title: string; description: string; display_order: number }>;
  requirements: Array<{ id: number; requirement_type: string; title: string; description: string; is_required: boolean; display_order: number }>;
}

export type AdminMembershipGradePayload = Omit<
  AdminMembershipGrade,
  "id" | "created_at" | "updated_at" | "benefits" | "requirements"
>;

export interface DashboardEvent {
  id: number;
  title: string;
  location: string;
  starts_at: string;
  registrations: number;
  capacity: number | null;
}

export type AdminEventType = "london_master_class" | "regional_club" | "other";

export interface AdminEvent {
  id: number;
  title: string;
  slug: string;
  event_type: AdminEventType;
  description: string;
  location: string;
  region: string;
  venue_name: string;
  starts_at: string | null;
  ends_at: string | null;
  capacity: number | null;
  image_url: string;
  image_thumbnail_url?: string;
  eventbrite_id: string | null;
  eventbrite_url: string;
  status: string;
  lifecycle_status: string;
  is_online_event: boolean;
  is_featured: boolean;
  is_published: boolean;
  is_hidden_on_site: boolean;
  created_at: string;
  updated_at: string;
  registration_title?: string;
  registration_description?: string;
  registration_opens_at?: string | null;
  registration_closes_at?: string | null;
  max_tickets_per_registration?: number;
  timezone?: string;
}

export type AdminEventPayload = Omit<
  AdminEvent,
  "id" | "is_hidden_on_site" | "created_at" | "updated_at" | "lifecycle_status"
>;

export interface DashboardUser {
  id: number;
  username: string;
  name: string;
  email: string;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
}

export interface DashboardData {
  generated_at: string;
  counts: DashboardCounts;
  application_statuses: Record<string, number>;
  enquiry_statuses: Record<string, Record<string, number>>;
  recent_applications: DashboardApplication[];
  recent_enquiries: DashboardEnquiry[];
  recent_registrations: DashboardRegistration[];
  upcoming_events: DashboardEvent[];
  recent_users: DashboardUser[];
}

export type AdminNotificationType = "contact" | "application" | "subscriber" | "support";

export interface AdminNotification {
  id: number;
  notification_type: AdminNotificationType;
  notification_type_label: string;
  title: string;
  message: string;
  source_type: AdminNotificationType;
  source_id: number;
  target_url: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedAdminNotifications {
  count: number;
  next: string | null;
  previous: string | null;
  unread_count: number;
  results: AdminNotification[];
}

export type AdminRole = "admin" | "user";

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  role: AdminRole;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
  ipc_email: string;
  personal_email: string | null;
  telephone: string;
  membership_application_id: number | null;
  membership_reference: string | null;
  membership_grade: string | null;
  application_status: ApplicationStatus | null;
  application_submitted_at: string | null;
  application_approved_at: string | null;
  account_created_at: string;
}

export interface AdminUserPayload {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  telephone: string;
  role: AdminRole;
  is_active: boolean;
}

export interface PaginatedAdminUsers {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminUser[];
}

export interface PaginatedAdminApplications {
  count: number;
  next: string | null;
  previous: string | null;
  results: DashboardApplication[];
}

export interface PaginatedAdminEnquiries {
  count: number;
  next: string | null;
  previous: string | null;
  results: DashboardEnquiry[];
}

export type AwardNominationStatus =
  | "under_review"
  | "more_info_required"
  | "approved"
  | "rejected"
  | "withdrawn";

export interface AdminAwardNomination {
  public_id: string;
  programme_title: string;
  programme_slug: string;
  applicant_name: string;
  applicant_email: string;
  nominee_type: "self" | "other";
  nominee_name: string;
  nominee_email: string;
  statement: string;
  responses: Record<string, unknown>;
  status: string;
  status_label: string;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  documents: Array<{
    id: number;
    name: string;
    content_type: string;
    size: number;
    download_url: string;
  }>;
}
