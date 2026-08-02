import { describe, expect, it } from "vitest";

import { bursaryModules } from "./pathways";
import {
  bursaryApplicationSchema,
  defaultBursaryApplicationValues,
  latestEligibleBirthDate,
  normaliseMobileNumber,
  type BursaryApplicationFormValues,
} from "./schema";

function validValues(): BursaryApplicationFormValues {
  const values = structuredClone(defaultBursaryApplicationValues);
  Object.assign(values.personalDetails, {
    firstName: "Abdallah",
    lastName: "Elsaid",
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
  Object.assign(values.emergencyInformation, {
    emergencyContactFullName: "Amina Elsaid",
    emergencyContactEmail: "amina@example.com",
    emergencyContactPhone: "+201001234567",
    identityDocument: "existing",
    applicantPhoto: "existing",
    hasDisabilityOrHealthCondition: false,
  });
  Object.assign(values.pathwaySelection, {
    preferredModules: ["ai", "pmp"],
    relevantExperience: "Five years in project planning and cost control.",
    pathwayFitReason: "IPC support would make this module accessible to me.",
  });
  Object.assign(values.termsAndConsents, {
    mandatoryTermsAccepted: true,
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
    dateSigned: "2026-07-30",
    electronicSignature: "data:image/png;base64,iVBORw0KGgo=",
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

  it("requires the applicant to be at least 20 years old", () => {
    const values = validValues();
    const today = new Date();
    values.personalDetails.dateOfBirth = `${today.getFullYear() - 19}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    expect(bursaryApplicationSchema.safeParse(values).success).toBe(false);
    values.personalDetails.dateOfBirth = latestEligibleBirthDate(today);
    expect(bursaryApplicationSchema.safeParse(values).success).toBe(true);
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

  it("requires at least one stable module value", () => {
    const values = validValues();
    values.pathwaySelection.preferredModules = [];
    expect(bursaryApplicationSchema.safeParse(values).success).toBe(false);
  });

  it("offers the published bursary modules", () => {
    expect(bursaryModules.map(({ value }) => value)).toEqual([
      "ai",
      "pmi_sp",
      "evm",
      "risk",
      "ppc",
      "msp",
      "managing_portfolios",
      "stakeholder_management",
      "pmp",
      "pmo",
    ]);
    expect(bursaryApplicationSchema.safeParse({
      ...validValues(),
      pathwaySelection: {
        ...validValues().pathwaySelection,
        preferredModules: ["operational"],
      },
    }).success).toBe(false);
  });

  it("requires the combined mandatory Section 5 consent", () => {
    const values = validValues();
    values.termsAndConsents.mandatoryTermsAccepted = false as true;
    expect(bursaryApplicationSchema.safeParse(values).success).toBe(false);
  });

  it("requires support details when disability support is declared", () => {
    const values = validValues();
    values.emergencyInformation.hasDisabilityOrHealthCondition = true;
    expect(bursaryApplicationSchema.safeParse(values).success).toBe(false);
    values.emergencyInformation.primaryHealthProblem = "I may need additional time and accessible learning materials.";
    expect(bursaryApplicationSchema.safeParse(values).success).toBe(true);
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

  it("requires a drawn signature before final submission", () => {
    const values = validValues();
    values.reviewAndDeclaration.electronicSignature = "";
    expect(bursaryApplicationSchema.safeParse(values).success).toBe(false);
  });
});
