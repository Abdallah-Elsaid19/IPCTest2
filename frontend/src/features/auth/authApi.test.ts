import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "@/lib/api";
import { authApi } from "./authApi";

vi.mock("@/lib/api", () => ({ apiJson: vi.fn().mockResolvedValue({}) }));

describe("password reset requests", () => {
  beforeEach(() => vi.mocked(apiJson).mockClear());

  it("preserves payment portal context in the reset email request", async () => {
    await authApi.requestPasswordReset("payer@example.org", "/payments");
    expect(apiJson).toHaveBeenCalledWith("/api/auth/password-reset/request", {
      email: "payer@example.org", next: "/payments",
    });
  });

  it("leaves ordinary account recovery unchanged", async () => {
    await authApi.requestPasswordReset("member@example.org");
    expect(apiJson).toHaveBeenCalledWith("/api/auth/password-reset/request", {
      email: "member@example.org",
    });
  });
});
