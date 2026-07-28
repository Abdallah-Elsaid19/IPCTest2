import { apiJson } from "@/lib/api";
import type { Dashboard, DirectoryItem, Notification, Page, Preference, Profile, WorkflowItem } from "./types";

export const panelApi = {
  dashboard: (signal?: AbortSignal) => apiJson<Dashboard>("/api/user/dashboard", undefined, { signal, requestSource: "user-panel" }),
  profile: (signal?: AbortSignal) => apiJson<Profile>("/api/user/profile", undefined, { signal, requestSource: "user-panel" }),
  updateProfile: (body: Partial<Profile>) => apiJson<Profile>("/api/user/profile", body, { method: "PATCH", requestSource: "user-panel" }),
  interests: () => apiJson<{ slug: string; name: string }[]>("/api/user/interests", undefined, { requestSource: "user-panel" }),
  list: <T = DirectoryItem>(path: string, signal?: AbortSignal) =>
    apiJson<Page<T> | T[]>(`/api/user/${path}`, undefined, { signal, requestSource: "user-panel" }),
  create: <T>(path: string, body: unknown) => apiJson<T>(`/api/user/${path}`, body, { requestSource: "user-panel" }),
  update: <T>(path: string, body: unknown) => apiJson<T>(`/api/user/${path}`, body, { method: "PATCH", requestSource: "user-panel" }),
  action: <T>(path: string, body: unknown = {}) => apiJson<T>(`/api/user/${path}`, body, { requestSource: "user-panel" }),
  preferences: () => apiJson<Preference>("/api/user/preferences", undefined, { requestSource: "user-panel" }),
  updatePreferences: (body: Partial<Preference>) => apiJson<Preference>("/api/user/preferences", body, { method: "PATCH", requestSource: "user-panel" }),
  notifications: (signal?: AbortSignal) => apiJson<Page<Notification> & { unread_count: number }>("/api/user/notifications", undefined, { signal, requestSource: "user-panel" }),
  markNotificationRead: (id: string) =>
    apiJson<Notification>(`/api/user/notifications/${id}/read`, {}),
  markAllNotificationsRead: () =>
    apiJson<{ updated: number; unread_count: number }>("/api/user/notifications/read-all", {}),
};

export function rows<T>(payload: Page<T> | T[] | undefined): T[] {
  if (!payload) return [];
  return Array.isArray(payload) ? payload : payload.results;
}
