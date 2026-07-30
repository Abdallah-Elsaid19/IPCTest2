import { apiJson } from "@/lib/api";
import type { AuthResponse, AuthUser } from "./types";

interface PasswordResetRequestResponse {
  detail: string;
  destination?: string;
}

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiJson<AuthResponse>("/api/auth/login", credentials),
  me: () => apiJson<{ user: AuthUser | null }>("/api/auth/session"),
  refresh: () => apiJson<void>("/api/auth/refresh", undefined, { method: "POST" }),
  logout: () => apiJson<void>("/api/auth/logout", undefined, { method: "POST" }),
  requestPasswordReset: (email: string) =>
    apiJson<PasswordResetRequestResponse>("/api/auth/password-reset/request", { email }),
  updateProfile: (payload: FormData) =>
    apiJson<AuthResponse>("/api/auth/me", payload, { method: "PATCH" }),
};
