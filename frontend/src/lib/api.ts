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

  if (csrfPromise) return csrfPromise;
  csrfPromise = (async () => {
    const response = await fetch("/api/csrf", { credentials: "include" });
    if (!response.ok) throw new Error("Could not initialise form security. Please refresh and try again.");
    const csrfToken = readCookie("csrftoken");
    if (!csrfToken) throw new Error("Could not initialise form security. Please refresh and try again.");
    return csrfToken;
  })().finally(() => {
    csrfPromise = null;
  });
  return csrfPromise;
}

type ApiRequestOptions = NonNullable<Parameters<typeof fetch>[1]> & {
  dedupe?: boolean;
  idempotencyKey?: string;
  requestSource?: string;
};
type RequestOutcome = "sent" | "reused" | "cancelled" | "failed" | "completed";

type PendingRequest = {
  promise: Promise<unknown>;
  controller: AbortController;
  subscribers: number;
  abortTimer?: number;
};

const pendingRequests = new Map<string, PendingRequest>();
let csrfPromise: Promise<string> | null = null;
let refreshPromise: Promise<boolean> | null = null;
let requestSequence = 0;

function hashValue(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `${(hash >>> 0).toString(36)}:${value.length}`;
}

function bodyFingerprint(body: unknown): string {
  if (body === undefined) return "";
  if (body instanceof FormData) {
    const entries: string[] = [];
    body.forEach((value, key) => {
      entries.push(
        typeof File !== "undefined" && value instanceof File
          ? `${key}=file:${value.name}:${value.size}:${value.lastModified}`
          : `${key}=${value}`,
      );
    });
    return hashValue(entries.sort().join("&"));
  }
  try {
    return hashValue(JSON.stringify(body));
  } catch {
    return hashValue(String(body));
  }
}

function subscribeToPending<T>(entry: PendingRequest, signal?: AbortSignal): Promise<T> {
  entry.subscribers += 1;
  if (entry.abortTimer !== undefined) {
    window.clearTimeout(entry.abortTimer);
    entry.abortTimer = undefined;
  }

  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    entry.subscribers -= 1;
    if (entry.subscribers === 0) {
      // StrictMode unmounts and remounts effects synchronously. Deferring the
      // abort one task lets the remounted effect reuse the in-flight request,
      // while genuine navigation still cancels it immediately afterwards.
      entry.abortTimer = window.setTimeout(() => entry.controller.abort(), 0);
    }
  };

  if (!signal) return entry.promise.finally(release) as Promise<T>;
  if (signal.aborted) {
    release();
    return Promise.reject(new DOMException("The request was aborted.", "AbortError"));
  }

  return new Promise<T>((resolve, reject) => {
    const onAbort = () => {
      release();
      reject(new DOMException("The request was aborted.", "AbortError"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
    entry.promise.then(
      (value) => {
        if (!released) resolve(value as T);
      },
      (error) => {
        if (!released) reject(error);
      },
    ).finally(() => {
      signal.removeEventListener("abort", onAbort);
      release();
    });
  });
}

function diagnostic(
  outcome: RequestOutcome,
  details: { id: string; method: string; path: string; source: string; startedAt: number; status?: number; idempotencyKey?: string },
) {
  if (!import.meta.env.DEV) return;
  console.debug("[IPC API]", {
    requestId: details.id,
    method: details.method,
    endpoint: details.path,
    source: details.source,
    outcome,
    status: details.status,
    idempotencyKey: details.idempotencyKey,
    durationMs: Math.round(performance.now() - details.startedAt),
    timestamp: new Date().toISOString(),
  });
}

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
  const { dedupe = true, idempotencyKey, requestSource, ...fetchOptions } = options;
  const fingerprint = bodyFingerprint(body);
  const requestKey = `${method}:${path}:${fingerprint}`;
  const canDedupe = dedupe;
  const existing = canDedupe ? pendingRequests.get(requestKey) : undefined;
  const details = {
    id: `api-${Date.now().toString(36)}-${++requestSequence}`,
    method,
    path,
    source: requestSource || "unknown",
    startedAt: performance.now(),
    idempotencyKey,
  };
  if (existing) {
    diagnostic("reused", details);
    return subscribeToPending<T>(existing, options.signal);
  }

  const controller = new AbortController();

  const request = (async () => {
    const csrfHeaders = unsafeRequest ? { "X-CSRFToken": await getCsrfToken() } : {};
    const isAuthOperation = ["/api/auth/login", "/api/auth/refresh", "/api/auth/logout"].includes(path);
    const actionKey = unsafeRequest && !isAuthOperation
      ? idempotencyKey || crypto.randomUUID()
      : undefined;
    details.idempotencyKey = actionKey;
    const requestOptions: NonNullable<Parameters<typeof fetch>[1]> = {
      ...fetchOptions,
      signal: canDedupe ? controller.signal : fetchOptions.signal,
      method,
      credentials: "include",
      headers: body instanceof FormData
        ? { ...csrfHeaders, ...(actionKey ? { "Idempotency-Key": actionKey, "Idempotency-Fingerprint": fingerprint } : {}), ...(options.headers || {}) }
        : { "Content-Type": "application/json", ...csrfHeaders, ...(actionKey ? { "Idempotency-Key": actionKey, "Idempotency-Fingerprint": fingerprint } : {}), ...(options.headers || {}) },
      body: body !== undefined ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
    };

    diagnostic("sent", details);
    try {
      let response = await fetch(path, requestOptions);
      if (response.status === 401 && !isAuthOperation) {
        if (await refreshAccessToken()) {
          response = await fetch(path, requestOptions);
        } else {
          window.dispatchEvent(new Event("ipc:auth-expired"));
        }
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(formatApiError(data));
      diagnostic("completed", { ...details, status: response.status });
      return data as T;
    } catch (error) {
      diagnostic(error instanceof DOMException && error.name === "AbortError" ? "cancelled" : "failed", details);
      throw error;
    }
  })();

  if (!canDedupe) return request;

  const entry: PendingRequest = { promise: request, controller, subscribers: 0 };
  pendingRequests.set(requestKey, entry);
  void request.finally(() => {
    if (pendingRequests.get(requestKey) === entry) pendingRequests.delete(requestKey);
  }).catch(() => undefined);
  return subscribeToPending<T>(entry, options.signal);
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
