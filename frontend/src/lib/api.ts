function formatApiError(data: unknown): string {
  if (!data || typeof data !== "object") return "Request failed";
  const payload = data as Record<string, unknown>;
  if (typeof payload.error === "string") return payload.error;
  if (typeof payload.detail === "string") return payload.detail;

  const messages = Object.entries(payload).flatMap(([field, value]) => {
    const label = field.replaceAll("_", " ");
    const formatMessage = (message: unknown) => field === "non_field_errors"
      ? String(message)
      : `${label}: ${String(message)}`;
    if (Array.isArray(value)) return value.map(formatMessage);
    if (typeof value === "string") return [formatMessage(value)];
    return [];
  });

  return messages[0] || "Request failed";
}

function readCookie(name: string): string {
  const prefix = `${name}=`;
  const cookie = document.cookie.split(";").map((item) => item.trim()).find((item) => item.startsWith(prefix));
  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : "";
}

async function getCsrfToken(): Promise<string> {
  let token = readCookie("csrftoken");
  if (token) return token;

  const response = await fetch("/api/csrf", { credentials: "include" });
  if (!response.ok) throw new Error("Could not initialise form security. Please refresh and try again.");
  token = readCookie("csrftoken");
  if (!token) throw new Error("Could not initialise form security. Please refresh and try again.");
  return token;
}

type ApiRequestOptions = NonNullable<Parameters<typeof fetch>[1]>;
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: { "X-CSRFToken": csrfToken },
      });
      return response.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiJson<T>(path: string, body?: unknown, options: ApiRequestOptions = {}): Promise<T> {
  const method = (options.method || (body ? "POST" : "GET")).toUpperCase();
  const unsafeRequest = !["GET", "HEAD", "OPTIONS", "TRACE"].includes(method);
  const csrfHeaders = unsafeRequest ? { "X-CSRFToken": await getCsrfToken() } : {};
  const requestOptions: ApiRequestOptions = {
    ...options,
    method,
    credentials: "include",
    headers: body instanceof FormData
      ? { ...csrfHeaders, ...(options.headers || {}) }
      : { "Content-Type": "application/json", ...csrfHeaders, ...(options.headers || {}) },
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
  };

  let response = await fetch(path, requestOptions);
  const isAuthOperation = ["/api/auth/login", "/api/auth/refresh", "/api/auth/logout"].includes(path);
  if (response.status === 401 && !isAuthOperation) {
    if (await refreshAccessToken()) {
      response = await fetch(path, requestOptions);
    } else {
      window.dispatchEvent(new Event("ipc:auth-expired"));
    }
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(formatApiError(data));
  return data as T;
}

export const fallbackGradeOptions: GradeOption[] = [
  { value: "AffIPC", label: "AffIPC" },
  { value: "MIPC", label: "MIPC" },
  { value: "AFIPC_L3", label: "AFIPC L3" },
  { value: "AFIPC_L4", label: "AFIPC L4" },
  { value: "FIPC", label: "FIPC" },
];

export const gradeOptions = fallbackGradeOptions;

export interface MembershipGrade {
  id: number;
  code: string;
  slug: string;
  title: string;
  short_title?: string;
  description?: string;
  image_url: string;
  post_nominal: string;
  pathway_title: string;
  pathway_description: string;
  evidence_requirements?: string;
  cpd_requirements?: string;
  professional_recognition?: string;
  application_pathway?: string;
}

export interface GradeOption {
  value: string;
  label: string;
}

export function toGradeOptions(grades: MembershipGrade[]): GradeOption[] {
  return grades.map((grade) => ({ value: grade.code, label: grade.short_title || grade.title || grade.code }));
}
export interface EventItem {
  id: number;
  title: string;
  slug: string;
  event_type: string;
  description?: string;
  location?: string;
  region?: string;
  venue_name?: string;
  starts_at?: string | null;
  ends_at?: string | null;
  capacity?: number | null;
  image_url?: string;
  eventbrite_url?: string;
  eventbrite_id?: string | null;
  is_published: boolean;
}
