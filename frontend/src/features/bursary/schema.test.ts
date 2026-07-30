import { describe, expect, it } from "vitest";

import { bursaryPathways } from "./pathways";
import {
  bursaryApplicationSchema,
  defaultBursaryApplicationValues,
  normaliseMobileNumber,
  type BursaryApplicationFormValues,
} from "./schema";

function validValues(): BursaryApplicationFormValues {
  const values = structuredClone(defaultBursaryApplicationValues);
  Object.assign(values.personalDetails, {
    firstName: "Abdallah",
    lastName: "Elsaid",
    membershipReference: "IPC-MEMBER-TEST",
    dateOfBirth: "1990-05-12",
    email: "abdallah@example.com",
    phoneCountryIso2: "GB",
    phoneDialCode: "+44",
    phoneNationalNumber: "07400 123456",
    mobilePhoneE164: "+447400123456",
    homeAddressLine1: "1 Example Street",
    townOrCity: "London",
    postcode: "SW1A 1AA",
    country: "United Kingdom",
    linkedInProfileUrl: "https://www.linkedin.com/in/abdallah-elsaid",
    currentlyEmployed: true,
    preferredContactMethod: "email",
  });
  Object.assign(values.organisationDetails, {
    organisationNotApplicable: false,
    organisationName: "Example Projects Ltd",
    jobTitle: "Project controls analyst",
  });
  Object.assign(values.bursaryRequest, {
    bursaryAmountRequestedGbp: 3000,
    requestedBursaryPercentage: 50,
    proceedWithLowerBursary: "discuss",
    financialCircumstances: "Support is needed due to current financial commitments.",
    scholarshipOutcome: "Progression into a senior project controls role.",
    measurableResult: "Deliver a monthly controls maturity dashboard.",
    learningApplicationAndContribution: "Apply learning and share a community case study.",
  });
  Object.assign(values.pathwaySelection, {
    preferredPathway: "operational",
    preferredStartMonthOrIntake: "September 2026",
    relevantExperience: "Five years in project planning and cost control.",
    pathwayFitReason: "The pathway matches current responsibilities.",
  });
  Object.assign(values.termsAndConsents, {
    linkedInAwardPostConsent: true,
    secondProgressPostConsent: true,
    tagIpcConsent: true,
    reshareAndQuoteConsent: true,
    professionalHeadshotConsent: true,
    participationConsent: true,
    approvedMediaUseConsent: true,
    reportRestrictionsConsent: true,
    publicityRestrictions: ["none_declared"],
  });
  Object.assign(values.reviewAndDeclaration, {
    section1Complete: true,
    section2CompleteOrNotApplicable: true,
    section3Complete: true,
    section4Complete: true,
    section5Complete: true,
    informationAccurateDeclaration: true,
    noAwardGuaranteeDeclaration: true,
    pathwayTermsDeclaration: true,
    processingConsentDeclaration: true,
    applicantIdentityDeclaration: true,
    fullLegalName: "Abdallah Elsaid",
    dateSigned: "2026-07-30",
    electronicSignature: "Abdallah Elsaid",
    signaturePlace: "London",
  });
  return values;
}

describe("bursary application validation", () => {
  it("rejects an invalid phone number for the selected country", () => {
    const values = validValues();
    values.personalDetails.phoneNationalNumber = "12345";
    values.personalDetails.mobilePhoneE164 = "";
    expect(bursaryApplicationSchema.safeParse(values).success).toBe(false);
  });

  it("normalises a selected country and national number to E.164", () => {
    expect(normaliseMobileNumber("GB", "07400 123456")).toEqual({
      e164: "+447400123456",
      nationalNumber: "7400123456",
      dialCode: "+44",
    });
  });

  it("revalidates the same number when the selected country changes", () => {
    const values = validValues();
    values.personalDetails.phoneCountryIso2 = "US";
    values.personalDetails.phoneDialCode = "+1";
    expect(bursaryApplicationSchema.safeParse(values).success).toBe(false);
  });

  it("requires organisation name and job title when employed", () => {
    const values = validValues();
    values.organisationDetails.organisationName = "";
    values.organisationDetails.jobTitle = "";
    expect(bursaryApplicationSchema.safeParse(values).success).toBe(false);
  });

  it("accepts organisation not applicable when not employed", () => {
    const values = validValues();
    values.personalDetails.currentlyEmployed = false;
    values.organisationDetails.organisationNotApplicable = true;
    values.organisationDetails.organisationName = "";
    values.organisationDetails.jobTitle = "";
    expect(bursaryApplicationSchema.safeParse(values).success).toBe(true);
  });

  it.each([-1, 101])("rejects bursary percentage %s", (percentage) => {
    const values = validValues();
    values.bursaryRequest.requestedBursaryPercentage = percentage;
    expect(bursaryApplicationSchema.safeParse(values).success).toBe(false);
  });

  it("requires exactly one stable pathway value", () => {
    const values = validValues();
    values.pathwaySelection.preferredPathway = "" as "operational";
    expect(bursaryApplicationSchema.safeParse(values).success).toBe(false);
  });

  it("preserves mandatory Operational and Strategic core components", () => {
    for (const pathwayValue of ["operational", "strategic"]) {
      const pathway = bursaryPathways.find(({ value }) => value === pathwayValue);
      expect(pathway?.components).toContain("Project Management Professional (PMP)");
      expect(pathway?.components).toContain("AI in Project Controls");
    }
  });

  it("requires all eight mandatory Section 5 consents", () => {
    const values = validValues();
    values.termsAndConsents.tagIpcConsent = false as true;
    expect(bursaryApplicationSchema.safeParse(values).success).toBe(false);
  });

  it("makes None declared mutually exclusive with restrictions", () => {
    const values = validValues();
    values.termsAndConsents.publicityRestrictions = ["none_declared", "security"];
    expect(bursaryApplicationSchema.safeParse(values).success).toBe(false);
  });

  it("requires restriction details for an actual restriction", () => {
    const values = validValues();
    values.termsAndConsents.publicityRestrictions = ["confidentiality"];
    values.termsAndConsents.publicityRestrictionDetails = "";
    expect(bursaryApplicationSchema.safeParse(values).success).toBe(false);
  });

  it("keeps optional marketing consent non-blocking", () => {
    const values = validValues();
    values.termsAndConsents.generalMarketingConsent = false;
    expect(bursaryApplicationSchema.safeParse(values).success).toBe(true);
  });

  it("requires all final declaration boxes", () => {
    const values = validValues();
    values.reviewAndDeclaration.applicantIdentityDeclaration = false as true;
    expect(bursaryApplicationSchema.safeParse(values).success).toBe(false);
  });
});
