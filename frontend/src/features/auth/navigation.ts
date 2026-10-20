import type { AuthUser } from "./types";

export function safeReturnPath(value: unknown): string | null {
  if (typeof value !== "string" || !value.startsWith("/") ||
      value.startsWith("//") || /[\\\s]/.test(value)) return null;
  const pathname = new URL(value, "https://ipc.invalid").pathname.replace(/\/+$/, "");
  if (["/login", "/forgot-password", "/reset-password"].includes(pathname)) return null;
  return value;
}

export function authPageUrl(page: "/login" | "/forgot-password", next: unknown) {
  const path = safeReturnPath(next);
  return path ? `${page}?next=${encodeURIComponent(path)}` : page;
}

export function postLoginPath(
  user: Pick<AuthUser, "is_staff" | "has_payment_portal" | "membership_active">,
  requested: unknown,
) {
  return safeReturnPath(requested) || (user.is_staff
    ? "/admin"
    : user.has_payment_portal && !user.membership_active ? "/payments" : "/home");
}
