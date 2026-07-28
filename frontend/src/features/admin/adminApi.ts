import { apiJson } from "@/lib/api";
import type {
  AdminAwardCategory,
  AdminAwardProgramme,
  AwardCategoryPayload,
  AwardProgrammePayload,
} from "@/features/awards/types";
import type {
  AdminAwardNomination,
  AdminClubMembership,
  AdminClub,
  AwardNominationStatus,
  AdminApplicationDetail,
  AdminEvent,
  AdminEventPayload,
  AdminMembershipGrade,
  AdminMembershipGradePayload,
  AdminNotification,
  AdminEnquiryDetail,
  AdminUser,
  AdminUserPayload,
  ApplicationStatus,
  DashboardData,
  DashboardEnquiry,
  DashboardRegistration,
  EventbriteAttendeeResponse,
  PaginatedAdminApplications,
  PaginatedAdminEnquiries,
  PaginatedAdminNotifications,
  PaginatedAdminUsers,
} from "./types";
import type { AdminContentTable, ContentSectionValue } from "./content/types";
import type { SupportMessage, SupportTicket } from "@/features/user-panel/types";

export interface AdminUserQuery {
  page?: number;
  search?: string;
  active?: "" | "true" | "false";
  role?: "" | "admin" | "user";
}

export interface AdminApplicationQuery {
  page?: number;
  search?: string;
  status?: "" | ApplicationStatus;
  grade?: "" | "AffIPC" | "MIPC" | "AFIPC_L3" | "AFIPC_L4" | "FIPC";
}

export interface AdminEnquiryQuery {
  page?: number;
  source?: "" | DashboardEnquiry["type"];
  status?: string;
  date?: string;
}

let eventbriteAttendeeCache: DashboardRegistration[] | null = null;
let eventbriteAttendeeTotal = 0;
let eventbriteAttendeeCacheExpiresAt = 0;
let eventbriteAttendeeRequest: Promise<EventbriteAttendeeResponse> | null = null;

function loadEventbriteAttendees() {
  if (eventbriteAttendeeCache && Date.now() < eventbriteAttendeeCacheExpiresAt) {
    return Promise.resolve({ results: eventbriteAttendeeCache, total_count: eventbriteAttendeeTotal, is_stale: false, synced_at: null });
  }
  if (eventbriteAttendeeRequest) return eventbriteAttendeeRequest;
  eventbriteAttendeeRequest = apiJson<EventbriteAttendeeResponse>("/api/admin/eventbrite/attendees")
    .then((response) => {
      eventbriteAttendeeCache = response.results;
      eventbriteAttendeeTotal = response.total_count;
      eventbriteAttendeeCacheExpiresAt = Date.now() + 5 * 60 * 1000;
      return response;
    })
    .finally(() => {
      eventbriteAttendeeRequest = null;
    });
  return eventbriteAttendeeRequest;
}

function refreshEventbriteAttendees() {
  return apiJson<EventbriteAttendeeResponse>("/api/admin/eventbrite/attendees?refresh=1")
    .then((response) => {
      eventbriteAttendeeCache = response.results;
      eventbriteAttendeeTotal = response.total_count;
      eventbriteAttendeeCacheExpiresAt = Date.now() + 5 * 60 * 1000;
      return response;
    });
}

export const adminApi = {
  contentTables: () => apiJson<AdminContentTable[]>("/api/admin/content"),
  updateContentTable: (
    slug: string,
    payload: { sections?: Record<string, ContentSectionValue>; is_active?: boolean; status?: "draft" | "published" },
  ) => apiJson<AdminContentTable>(`/api/admin/content/${slug}`, payload, { method: "PATCH" }),
  dashboard: (forceRefresh = false) => apiJson<DashboardData>(`/api/admin/dashboard${forceRefresh ? "?refresh=1" : ""}`),
  notifications: (signal?: AbortSignal) =>
    apiJson<PaginatedAdminNotifications>(
      "/api/admin/notifications?page_size=12",
      undefined,
      { signal, requestSource: "AdminNotificationBell" },
    ),
  notificationUnreadCount: () =>
    apiJson<{ unread_count: number }>("/api/admin/notifications/unread-count"),
  markNotificationRead: (id: number) =>
    apiJson<AdminNotification>(
      `/api/admin/notifications/${id}/read`,
      {},
      { method: "PATCH" },
    ),
  markAllNotificationsRead: () =>
    apiJson<{ updated: number; unread_count: number }>(
      "/api/admin/notifications/read-all",
      {},
      { method: "PATCH" },
    ),
  enquiries: (query: AdminEnquiryQuery = {}, signal?: AbortSignal) => {
    const params = new URLSearchParams();
    params.set("page", String(query.page || 1));
    if (query.source) params.set("source", query.source);
    if (query.status) params.set("status", query.status);
    if (query.date) params.set("date", query.date);
    return apiJson<PaginatedAdminEnquiries>(
      `/api/admin/enquiries?${params.toString()}`,
      undefined,
      { signal },
    );
  },
  replyToEnquiry: (source: DashboardEnquiry["type"], id: string, message: string) =>
    apiJson<{ detail: string; status: string }>(
      `/api/admin/enquiries/${source}/${id}/reply`,
      { message },
    ),
  enquiry: (source: DashboardEnquiry["type"], id: string) =>
    apiJson<AdminEnquiryDetail>(`/api/admin/enquiries/${source}/${id}`),
  application: (id: number) => apiJson<AdminApplicationDetail>(`/api/admin/applications/${id}`),
  events: () => apiJson<AdminEvent[]>("/api/admin/events"),
  deleteEvent: (id: number) =>
    apiJson<Record<string, never>>(`/api/admin/events/${id}`, undefined, { method: "DELETE" }),
  awardProgrammes: () => apiJson<AdminAwardProgramme[]>("/api/admin/award-programmes"),
  createAwardProgramme: (payload: AwardProgrammePayload) =>
    apiJson<AdminAwardProgramme>("/api/admin/award-programmes", payload),
  updateAwardProgramme: (id: number, payload: AwardProgrammePayload) =>
    apiJson<AdminAwardProgramme>(`/api/admin/award-programmes/${id}`, payload, { method: "PATCH" }),
  deleteAwardProgramme: (id: number) =>
    apiJson<Record<string, never>>(`/api/admin/award-programmes/${id}`, undefined, { method: "DELETE" }),
  awardCategories: () => apiJson<AdminAwardCategory[]>("/api/admin/award-categories"),
  createAwardCategory: (payload: AwardCategoryPayload) =>
    apiJson<AdminAwardCategory>("/api/admin/award-categories", payload),
  updateAwardCategory: (id: number, payload: AwardCategoryPayload) =>
    apiJson<AdminAwardCategory>(`/api/admin/award-categories/${id}`, payload, { method: "PATCH" }),
  deleteAwardCategory: (id: number) =>
    apiJson<Record<string, never>>(`/api/admin/award-categories/${id}`, undefined, { method: "DELETE" }),
  awardNominations: () =>
    apiJson<AdminAwardNomination[]>("/api/admin/award-nominations"),
  updateAwardNominationStatus: (id: string, status: AwardNominationStatus) =>
    apiJson<AdminAwardNomination>(
      `/api/admin/award-nominations/${id}/status`,
      { status },
      { method: "PATCH" },
    ),
  supportTickets: (signal?: AbortSignal) =>
    apiJson<SupportTicket[]>("/api/admin/support", undefined, { signal }),
  replyToSupport: (id: string, body: string) =>
    apiJson<SupportMessage>(`/api/admin/support/${id}/reply`, { body }),
  markSupportRead: (id: string) =>
    apiJson<{ updated: number }>(`/api/admin/support/${id}/read`, {}),
  updateSupportState: (id: string, status: "open" | "closed") =>
    apiJson<SupportTicket>(
      `/api/admin/support/${id}/state`,
      { status },
      { method: "PATCH" },
    ),
  clubMemberships: (signal?: AbortSignal) =>
    apiJson<AdminClubMembership[]>("/api/admin/club-memberships", undefined, { signal }),
  clubs: (signal?: AbortSignal) =>
    apiJson<AdminClub[]>("/api/admin/clubs", undefined, { signal }),
  updateClubMembership: (id: number, status: "active" | "rejected" | "suspended") =>
    apiJson<AdminClubMembership>(
      `/api/admin/club-memberships/${id}`,
      { status },
      { method: "PATCH" },
    ),
  eventbriteAttendees: loadEventbriteAttendees,
  refreshEventbriteAttendees,
  eventRegistrations: () =>
    apiJson<Array<DashboardRegistration & { id: number }>>("/api/admin/event-registrations"),
  resendEventConfirmation: (id: number) =>
    apiJson<{ sent: boolean; confirmation_email_status: "sent" | "failed" }>(`/api/admin/event-registrations/${id}/resend-confirmation`, {}),
  event: (id: number) => apiJson<AdminEvent>(`/api/admin/events/${id}`),
  membershipGrades: () => apiJson<AdminMembershipGrade[]>("/api/admin/membership-grades"),
  createMembershipGrade: (payload: AdminMembershipGradePayload) =>
    apiJson<AdminMembershipGrade>("/api/admin/membership-grades", payload),
  updateMembershipGrade: (id: number, payload: AdminMembershipGradePayload) =>
    apiJson<AdminMembershipGrade>(`/api/admin/membership-grades/${id}`, payload, { method: "PATCH" }),
  createEvent: (payload: AdminEventPayload) =>
    apiJson<AdminEvent>("/api/admin/events", payload),
  updateEvent: (id: number, payload: AdminEventPayload) =>
    apiJson<AdminEvent>(`/api/admin/events/${id}`, payload, { method: "PATCH" }),
  setEventVisibility: (id: number, hidden: boolean) =>
    apiJson<AdminEvent>(
      `/api/admin/events/${id}/visibility`,
      { hidden },
      { method: "PATCH" },
    ),
  applications: (query: AdminApplicationQuery, signal?: AbortSignal) => {
    const params = new URLSearchParams();
    if (query.page && query.page > 1) params.set("page", String(query.page));
    if (query.search) params.set("search", query.search);
    if (query.status) params.set("status", query.status);
    if (query.grade) params.set("grade", query.grade);
    const suffix = params.size ? `?${params}` : "";
    return apiJson<PaginatedAdminApplications>(
      `/api/admin/applications${suffix}`,
      undefined,
      { signal },
    );
  },
  resendApplicationWelcome: (id: number) =>
    apiJson<AdminApplicationDetail>(
      `/api/admin/applications/${id}/resend-welcome-email`,
      {},
    ),
  updateApplicationStatus: (id: number, status: ApplicationStatus, refusalReason?: string) =>
    apiJson<AdminApplicationDetail>(
      `/api/admin/applications/${id}/status`,
      { status, ...(status === "refused" ? { refusal_reason: refusalReason } : {}) },
      { method: "PATCH" },
    ),
  users: (query: AdminUserQuery, signal?: AbortSignal) => {
    const params = new URLSearchParams();
    if (query.page && query.page > 1) params.set("page", String(query.page));
    if (query.search) params.set("search", query.search);
    if (query.active) params.set("active", query.active);
    if (query.role) params.set("role", query.role);
    const suffix = params.size ? `?${params}` : "";
    return apiJson<PaginatedAdminUsers>(`/api/admin/users${suffix}`, undefined, {
      signal,
      requestSource: "AdminUsersPage",
    });
  },
  user: (id: number) => apiJson<AdminUser>(`/api/admin/users/${id}`),
  createUser: (payload: AdminUserPayload) => apiJson<AdminUser>("/api/admin/users", payload),
  updateUser: (id: number, payload: AdminUserPayload) => apiJson<AdminUser>(`/api/admin/users/${id}`, payload, { method: "PATCH" }),
  deleteUser: (id: number) => apiJson<Record<string, never>>(`/api/admin/users/${id}`, undefined, { method: "DELETE" }),
  sendPasswordReset: (id: number) => apiJson<{ detail: string }>(`/api/admin/users/${id}/send-password-reset`, {}),
  confirmPasswordReset: (payload: { uid: string; token: string; password: string }) => apiJson<{ detail: string }>("/api/auth/password-reset/confirm", payload),
};
