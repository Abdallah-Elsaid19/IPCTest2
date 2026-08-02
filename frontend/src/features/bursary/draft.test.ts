import { describe, expect, it } from "vitest";

import { BURSARY_DRAFT_TTL_MS, parseBursaryDraft } from "./draft";

describe("bursary draft persistence", () => {
  it("restores incomplete values and the current step without requiring a valid submission", () => {
    const now = 1_000;
    const draft = parseBursaryDraft(JSON.stringify({
      version: 1,
      updatedAt: now,
      expiresAt: now + BURSARY_DRAFT_TTL_MS,
      currentStep: 3,
      completedSteps: [0, 1, 2],
      values: {
        personalDetails: {
          firstName: "Abdallah",
          email: "abdallah@example.com",
        },
        emergencyInformation: {
          emergencyContactFullName: "Amina Elsaid",
        },
      },
    }), now);

    expect(draft?.currentStep).toBe(3);
    expect(draft?.completedSteps).toEqual([0, 1, 2]);
    expect(draft?.values.personalDetails.firstName).toBe("Abdallah");
    expect(draft?.values.personalDetails.lastName).toBe("");
    expect(draft?.values.emergencyInformation.emergencyContactFullName).toBe("Amina Elsaid");
  });

  it("rejects expired and corrupt drafts", () => {
    expect(parseBursaryDraft("{not-json", 1_000)).toBeNull();
    expect(parseBursaryDraft(JSON.stringify({
      version: 1,
      expiresAt: 999,
      values: {},
    }), 1_000)).toBeNull();
  });

  it("clamps invalid navigation state and ignores unknown fields", () => {
    const draft = parseBursaryDraft(JSON.stringify({
      version: 1,
      expiresAt: 10_000,
      currentStep: 99,
      completedSteps: [-1, 0, 0, 8, "2"],
      values: {
        personalDetails: {
          firstName: "Amina",
          injected: "ignored",
        },
        injectedSection: { value: "ignored" },
      },
    }), 1_000);

    expect(draft?.currentStep).toBe(5);
    expect(draft?.completedSteps).toEqual([0]);
    expect(draft?.values.personalDetails.firstName).toBe("Amina");
    expect("injected" in (draft?.values.personalDetails || {})).toBe(false);
    expect("injectedSection" in (draft?.values || {})).toBe(false);
  });
});
