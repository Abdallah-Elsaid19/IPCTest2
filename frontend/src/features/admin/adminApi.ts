import { apiJson } from "@/lib/api";
import type { AdminUser, AdminUserPayload, DashboardData, PaginatedAdminUsers } from "./types";

export interface AdminUserQuery {
  page?: number;
  search?: string;
  active?: "" | "true" | "false";
  staff?: "" | "true" | "false";
  role?: "" | "admin" | "reviewer" | "staff";
}

export const adminApi = {
  dashboard: (forceRefresh = false) => apiJson<DashboardData>(`/api/admin/dashboard${forceRefresh ? "?refresh=1" : ""}`),
  users: (query: AdminUserQuery) => {
    const params = new URLSearchParams();
    if (query.page && query.page > 1) params.set("page", String(query.page));
    if (query.search) params.set("search", query.search);
    if (query.active) params.set("active", query.active);
    if (query.staff) params.set("staff", query.staff);
    if (query.role) params.set("role", query.role);
    const suffix = params.size ? `?${params}` : "";
    return apiJson<PaginatedAdminUsers>(`/api/admin/users${suffix}`);
  },
  createUser: (payload: AdminUserPayload) => apiJson<AdminUser>("/api/admin/users", payload),
  updateUser: (id: number, payload: AdminUserPayload) => apiJson<AdminUser>(`/api/admin/users/${id}`, payload, { method: "PATCH" }),
  deleteUser: (id: number) => apiJson<Record<string, never>>(`/api/admin/users/${id}`, undefined, { method: "DELETE" }),
  sendPasswordReset: (id: number) => apiJson<{ detail: string }>(`/api/admin/users/${id}/send-password-reset`, {}),
  confirmPasswordReset: (payload: { uid: string; token: string; password: string }) => apiJson<{ detail: string }>("/api/auth/password-reset/confirm", payload),
};
