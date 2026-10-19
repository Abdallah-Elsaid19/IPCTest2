import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiJson } from "@/lib/api";
import { bursaryApi } from "./api";
import { defaultBursaryApplicationValues } from "./schema";

vi.mock("@/lib/api", () => ({ apiJson: vi.fn().mockResolvedValue({}) }));

describe("bursary email edit access", () => {
  beforeEach(() => vi.mocked(apiJson).mockClear());

  it("sends the edit credential in a header, outside the URL and shared request cache", async () => {
    await bursaryApi.current("IPC-BSA-TEST", undefined, "private-token");
    expect(apiJson).toHaveBeenCalledWith(
      "/api/bursary-applications/current?applicationReference=IPC-BSA-TEST",
      undefined,
      expect.objectContaining({
        cache: "no-store",
        dedupe: false,
        headers: { "X-Bursary-Edit-Token": "private-token" },
      }),
    );
  });

  it("uses the same credential when resubmitting the existing application", async () => {
    await bursaryApi.resubmit(defaultBursaryApplicationValues, "IPC-BSA-TEST", "private-token");
    expect(apiJson).toHaveBeenCalledWith(
      "/api/bursary-applications/current?applicationReference=IPC-BSA-TEST",
      expect.any(FormData),
      expect.objectContaining({
        method: "PATCH",
        dedupe: false,
        headers: { "X-Bursary-Edit-Token": "private-token" },
      }),
    );
  });

  it("preserves account access when no email credential is present", async () => {
    await bursaryApi.current("IPC-BSA-TEST");
    expect(apiJson).toHaveBeenCalledWith(
      "/api/bursary-applications/current?applicationReference=IPC-BSA-TEST",
      undefined,
      expect.objectContaining({ headers: undefined, dedupe: true }),
    );
  });
});
