import { describe, expect, it } from "vitest";

import {
  internationalTelephoneSchema,
  normaliseInternationalTelephone,
} from "./internationalTelephoneSchema";

describe("international telephone validation", () => {
  it("accepts and normalises an Egyptian number with +20", () => {
    expect(normaliseInternationalTelephone("+20 106 705 5973")).toBe("+201067055973");
    expect(internationalTelephoneSchema.safeParse("+20 106 705 5973").success).toBe(true);
  });

  it("keeps support for existing UK national numbers", () => {
    expect(normaliseInternationalTelephone("07700 900123")).toBe("+447700900123");
  });

  it("rejects a number without a usable country code", () => {
    expect(internationalTelephoneSchema.safeParse("12345").success).toBe(false);
  });
});
