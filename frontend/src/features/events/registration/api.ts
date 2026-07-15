import { apiJson } from "@/lib/api";
import type { RegistrationEvent, RegistrationPayload, RegistrationRecord } from "./types";

export const registrationApi = {
  config: (slug: string) => apiJson<RegistrationEvent>(`/api/events/${encodeURIComponent(slug)}/registration`),
  create: (slug: string, payload: RegistrationPayload, idempotencyKey: string) =>
    apiJson<RegistrationRecord>(`/api/events/${encodeURIComponent(slug)}/register`, payload, {
      headers: { "Idempotency-Key": idempotencyKey },
    }),
  detail: (reference: string, token: string) =>
    apiJson<RegistrationRecord>(`/api/events/registrations/${encodeURIComponent(reference)}${token ? `?token=${encodeURIComponent(token)}` : ""}`),
};

export function idempotencyKey(slug: string) {
  const storageKey = `ipc:event-registration:${slug}:idempotency`;
  let key = sessionStorage.getItem(storageKey);
  if (!key) {
    key = crypto.randomUUID();
    sessionStorage.setItem(storageKey, key);
  }
  return key;
}

export function clearRegistrationSession(slug: string) {
  sessionStorage.removeItem(`ipc:event-registration:${slug}:idempotency`);
  sessionStorage.removeItem(`ipc:event-registration:${slug}:draft`);
}
