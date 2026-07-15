import { apiJson } from "@/lib/api";
import type {
  AdminApplicationDetail,
  AdminEvent,
  AdminEventPayload,
  AdminUser,
  AdminUserPayload,
  ApplicationStatus,
  DashboardData,
  DashboardEnquiry,
  DashboardRegistration,
  PaginatedAdminApplications,
  PaginatedAdminUsers,
} from "./types";

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

export const adminApi = {
  dashboard: (forceRefresh = false) => apiJson<DashboardData>(`/api/admin/dashboard${forceRefresh ? "?refresh=1" : ""}`),
  replyToEnquiry: (source: DashboardEnquiry["type"], id: string, message: string) =>
    apiJson<{ detail: string; status: string }>(
      `/api/admin/enquiries/${source}/${id}/reply`,
      { message },
    ),
  application: (id: number) => apiJson<AdminApplicationDetail>(`/api/admin/applications/${id}`),
  events: () => apiJson<AdminEvent[]>("/api/admin/events"),
  eventbriteAttendees: () =>
    apiJson<DashboardRegistration[]>("/api/admin/eventbrite/attendees"),
  eventRegistrations: () =>
    apiJson<Array<DashboardRegistration & { id: number }>>("/api/admin/event-registrations"),
  resendEventConfirmation: (id: number) =>
    apiJson<{ sent: boolean; confirmation_email_status: "sent" | "failed" }>(`/api/admin/event-registrations/${id}/resend-confirmation`, {}),
  event: (id: number) => apiJson<AdminEvent>(`/api/admin/events/${id}`),
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
  updateApplicationStatus: (id: number, status: ApplicationStatus) =>
    apiJson<AdminApplicationDetail>(
      `/api/admin/applications/${id}/status`,
      { status },
      { method: "PATCH" },
    ),
  users: (query: AdminUserQuery) => {
    const params = new URLSearchParams();
    if (query.page && query.page > 1) params.set("page", String(query.page));
    if (query.search) params.set("search", query.search);
    if (query.active) params.set("active", query.active);
    if (query.role) params.set("role", query.role);
    const suffix = params.size ? `?${params}` : "";
    return apiJson<PaginatedAdminUsers>(`/api/admin/users${suffix}`);
  },
  user: (id: number) => apiJson<AdminUser>(`/api/admin/users/${id}`),
  createUser: (payload: AdminUserPayload) => apiJson<AdminUser>("/api/admin/users", payload),
  updateUser: (id: number, payload: AdminUserPayload) => apiJson<AdminUser>(`/api/admin/users/${id}`, payload, { method: "PATCH" }),
  deleteUser: (id: number) => apiJson<Record<string, never>>(`/api/admin/users/${id}`, undefined, { method: "DELETE" }),
  sendPasswordReset: (id: number) => apiJson<{ detail: string }>(`/api/admin/users/${id}/send-password-reset`, {}),
  confirmPasswordReset: (payload: { uid: string; token: string; password: string }) => apiJson<{ detail: string }>("/api/auth/password-reset/confirm", payload),
};
