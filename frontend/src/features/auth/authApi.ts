import { apiJson } from "@/lib/api";
import type { AuthResponse } from "./types";

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiJson<AuthResponse>("/api/auth/login", credentials),
  me: () => apiJson<AuthResponse>("/api/auth/me"),
  refresh: () => apiJson<void>("/api/auth/refresh", undefined, { method: "POST" }),
  logout: () => apiJson<void>("/api/auth/logout", undefined, { method: "POST" }),
};
