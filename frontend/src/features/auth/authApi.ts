import { apiJson } from "@/lib/api";
import type { AuthResponse } from "./types";

interface PasswordResetRequestResponse {
  detail: string;
  destination?: string;
}

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiJson<AuthResponse>("/api/auth/login", credentials),
  me: () => apiJson<AuthResponse>("/api/auth/me"),
  refresh: () => apiJson<void>("/api/auth/refresh", undefined, { method: "POST" }),
  logout: () => apiJson<void>("/api/auth/logout", undefined, { method: "POST" }),
  requestPasswordReset: (email: string) =>
    apiJson<PasswordResetRequestResponse>("/api/auth/password-reset/request", { email }),
  updateProfile: (payload: FormData) =>
    apiJson<AuthResponse>("/api/auth/me", payload, { method: "PATCH" }),
};
