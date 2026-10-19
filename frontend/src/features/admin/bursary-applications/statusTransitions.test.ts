import { describe, expect, it } from "vitest";
import { allowedBursaryStatuses } from "./statusTransitions";

describe("information requests after approval", () => {
  it("allows only the first information request from Approved", () => {
    expect(allowedBursaryStatuses({ status: "approved", can_request_information: true, post_approval_information_requested: false }))
      .toEqual(["needs_information"]);
    expect(allowedBursaryStatuses({ status: "approved", can_request_information: false, post_approval_information_requested: true }))
      .toEqual([]);
  });

  it("waits for the applicant to finish the one approved update", () => {
    expect(allowedBursaryStatuses({ status: "needs_information", can_request_information: false, post_approval_information_requested: true }))
      .toEqual([]);
  });

  it("preserves normal review and final rejection", () => {
    expect(allowedBursaryStatuses({ status: "under_review", can_request_information: true, post_approval_information_requested: false }))
      .toEqual(["needs_information", "approved", "rejected"]);
    expect(allowedBursaryStatuses({ status: "rejected", can_request_information: false, post_approval_information_requested: false }))
      .toEqual([]);
  });
});
