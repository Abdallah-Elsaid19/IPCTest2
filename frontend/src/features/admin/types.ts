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

export interface DashboardApplication {
  id: number;
  reference: string;
  name: string;
  email: string;
  grade: string;
  status: string;
  submitted_at: string;
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

export interface DashboardRegistration {
  id: number;
  name: string;
  email: string;
  event_name: string;
  status: string;
  created_at: string;
}

export interface DashboardEvent {
  id: number;
  title: string;
  location: string;
  starts_at: string;
  registrations: number;
  capacity: number | null;
}

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

export type AdminRole = "admin" | "reviewer" | "staff";

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  role: AdminRole | null;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
}

export interface AdminUserPayload {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: AdminRole | null;
  is_staff: boolean;
  is_active: boolean;
}

export interface PaginatedAdminUsers {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminUser[];
}
