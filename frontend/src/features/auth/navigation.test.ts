import { describe, expect, it } from "vitest";
import { authPageUrl, postLoginPath, safeReturnPath } from "./navigation";

describe("payment portal sign-in navigation", () => {
  const member = { is_staff: false, has_payment_portal: true, membership_active: true };

  it("persists the destination in the URL across a reload and password recovery", () => {
    const loginUrl = authPageUrl("/login", "/payments?checkout=success");
    const next = new URL(loginUrl, "https://ipc.example").searchParams.get("next");
    expect(next).toBe("/payments?checkout=success");
    expect(postLoginPath(member, next)).toBe("/payments?checkout=success");
    const recovery = authPageUrl("/forgot-password", next);
    expect(new URL(recovery, "https://ipc.example").searchParams.get("next")).toBe(next);
  });

  it("honors payment destinations for existing members and staff", () => {
    expect(postLoginPath(member, "/payments")).toBe("/payments");
    expect(postLoginPath({ ...member, is_staff: true }, "/payments")).toBe("/payments");
  });

  it("keeps the expected defaults when no destination is provided", () => {
    expect(postLoginPath(member, null)).toBe("/home");
    expect(postLoginPath({ ...member, membership_active: false }, null)).toBe("/payments");
    expect(postLoginPath({ ...member, is_staff: true }, null)).toBe("/admin");
  });

  it.each(["//example.org", "https://example.org", "/\\example.org", "/\n/example.org",
    "/login", "/login/", "/other/../login", "/login?next=/payments", "/forgot-password", "/reset-password", undefined])(
    "rejects unsafe or looping destinations: %s", (destination) => {
      expect(safeReturnPath(destination)).toBeNull();
      expect(authPageUrl("/login", destination)).toBe("/login");
      expect(postLoginPath(member, destination)).toBe("/home");
    },
  );
});
