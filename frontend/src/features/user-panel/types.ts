export type Page<T> = { count: number; next: string | null; previous: string | null; results: T[] };
export type Completion = { percentage: number; missing: string[] };

export interface Profile {
  first_name: string;
  last_name: string;
  email: string;
  preferred_name: string;
  phone: string;
  country: string;
  city: string;
  timezone: string;
  biography: string;
  job_title: string;
  employer: string;
  industry: string;
  years_experience: number | null;
  professional_headline: string;
  qualifications: string;
  certifications: string;
  linkedin_url: string;
  website_url: string;
  interests: string[];
  completion: Completion;
}

export interface WorkflowItem {
  public_id?: string;
  application_reference?: string;
  title?: string;
  scholarship_title?: string;
  programme_title?: string;
  nominee_name?: string;
  grade_title?: string;
  status: string;
  updated_at?: string;
}

export interface Notification {
  public_id: string;
  notification_type: string;
  title: string;
  message: string;
  target_url: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface Dashboard {
  profile_completion: Completion;
  membership: WorkflowItem | null;
  scholarship_applications: WorkflowItem[];
  award_nominations: WorkflowItem[];
  bookings: Record<string, unknown>[];
  notifications: Notification[];
  unread_count: number;
  active_clubs: number;
  document_count: number;
}

export interface DirectoryItem {
  public_id?: string;
  slug: string;
  title?: string;
  name?: string;
  summary?: string;
  description?: string;
  category?: string;
  provider?: string;
  location?: string;
  specialism?: string;
  eligibility?: string;
  deadline?: string | null;
  membership_status?: string;
}

export interface Preference {
  profile_visibility: "private" | "members" | "public";
  email_notifications: boolean;
  club_communications: boolean;
  event_reminders: boolean;
  marketing_consent: boolean;
}

export interface SupportMessage {
  id: number;
  author_name: string;
  body: string;
  is_staff_reply: boolean;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface SupportTicket {
  public_id: string;
  requester_name?: string;
  requester_email?: string;
  category: string;
  subject: string;
  status: "open" | "closed";
  messages: SupportMessage[];
  unread_count: number;
  last_message: SupportMessage | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}
