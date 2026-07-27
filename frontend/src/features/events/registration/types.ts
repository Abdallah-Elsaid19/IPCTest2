export type RegistrationQuestion = {
  id: number;
  label: string;
  help_text: string;
  question_type: "short_text" | "long_text" | "select" | "radio" | "checkbox" | "yes_no";
  options: string[];
  is_required: boolean;
};

export type EventDetailsContent = {
  html?: string;
};

export type RegistrationEvent = {
  id: number;
  slug: string;
  title: string;
  description: string;
  details_content?: EventDetailsContent;
  location: string;
  venue_name: string;
  starts_at: string | null;
  ends_at: string | null;
  image_url: string;
  image_thumbnail_url?: string;
  eventbrite_id: string | null;
  eventbrite_url: string;
  is_online_event: boolean;
  capacity: number | null;
  registration_title: string;
  registration_description: string;
  max_tickets_per_registration: number;
  timezone: string;
  available_places: number | null;
  registration_is_open: boolean;
  registration_closed_reason: string;
  questions: RegistrationQuestion[];
};

export type RegistrationPerson = {
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  company: string;
  job_title: string;
  city: string;
  dietary_access_needs?: string;
};

export type RegistrationPayload = {
  quantity: number;
  contact: RegistrationPerson;
  attendees: RegistrationPerson[];
  answers: Array<{ question_id: number; value: unknown }>;
  marketing_consent: boolean;
  terms_accepted: boolean;
};

export type RegistrationRecord = {
  reference: string;
  created_at: string;
  event: RegistrationEvent;
  event_name: string;
  status: string;
  contact_first_name: string;
  contact_last_name: string;
  email: string;
  quantity: number;
  ticket_name: string;
  total_amount: string;
  currency: string;
  confirmation_email_status: "pending" | "sent" | "failed";
  attendees: Array<RegistrationPerson & { id: number }>;
  access_token?: string;
};
