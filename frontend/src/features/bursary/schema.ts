import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";
import { z } from "zod";

const requiredText = (label: string, max = 12_000) =>
  z.string().trim().min(1, `${label} is required.`).max(max);
const optionalText = (max = 8_000) => z.string().max(max);
const optionalUrl = z.union([z.literal(""), z.url("Enter a valid URL.")]);
const optionalEmail = z.union([z.literal(""), z.email("Enter a valid email address.")]);
const isoDate = (message: string) =>
  z.string().refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00`)), message);
const accepted = (message: string) => z.literal(true, { error: message });

export const pathwayValues = [
  "operational",
  "strategic",
  "chartered",
  "certified_pmo_professional",
  "apm",
] as const;

export const publicityRestrictionValues = [
  "none_declared",
  "safeguarding",
  "accessibility",
  "religious",
  "security",
  "confidentiality",
  "employer_related",
  "other",
] as const;

export function normaliseMobileNumber(countryIso2: string, nationalNumber: string) {
  if (!countryIso2 || !nationalNumber) return null;
  const phone = parsePhoneNumberFromString(nationalNumber, countryIso2 as CountryCode);
  if (!phone?.isValid() || phone.country !== countryIso2) return null;
  return {
    e164: phone.number,
    nationalNumber: String(phone.nationalNumber),
    dialCode: `+${phone.countryCallingCode}`,
  };
}

export const bursaryApplicationSchema = z.object({
  personalDetails: z.object({
    title: optionalText(40),
    membershipReference: requiredText("Membership reference", 40),
    firstName: requiredText("First name", 120),
    lastName: requiredText("Last name", 120),
    preferredName: optionalText(120),
    dateOfBirth: isoDate("Enter a valid date of birth."),
    email: z.email("Enter a valid email address.").trim().toLowerCase(),
    phoneCountryIso2: requiredText("Country calling code", 2),
    phoneDialCode: z.string().regex(/^\+\d{1,4}$/, "Select a valid country calling code."),
    phoneNationalNumber: z.string().regex(/^[\d\s().-]+$/, "Use numbers only."),
    mobilePhoneE164: z.string(),
    homeAddressLine1: requiredText("Home address line 1", 255),
    homeAddressLine2: optionalText(255),
    townOrCity: requiredText("Town or city", 120),
    countyOrRegion: optionalText(120),
    postcode: requiredText("Postcode", 32),
    country: requiredText("Country", 120),
    linkedInProfileUrl: z.url("Enter a valid LinkedIn profile URL.").refine((value) => {
      try {
        const host = new URL(value).hostname.toLowerCase().replace(/\.$/, "");
        return host === "linkedin.com" || host.endsWith(".linkedin.com");
      } catch {
        return false;
      }
    }, "Enter a valid LinkedIn profile URL."),
    currentlyEmployed: z.boolean({ error: "Select whether you are currently employed." }),
    currentProfessionalStatus: optionalText(180),
    preferredContactMethod: z.enum(["email", "phone", "either"], {
      error: "Select a preferred contact method.",
    }),
  }),
  organisationDetails: z.object({
    organisationNotApplicable: z.boolean(),
    organisationName: optionalText(255),
    organisationWebsite: optionalUrl,
    industryOrSector: optionalText(180),
    organisationAddressLine1: optionalText(255),
    organisationAddressLine2: optionalText(255),
    organisationTownOrCity: optionalText(120),
    organisationCountyOrRegion: optionalText(120),
    organisationPostcode: optionalText(32),
    organisationCountry: optionalText(120),
    organisationSize: optionalText(80),
    jobTitle: optionalText(180),
    departmentOrBusinessUnit: optionalText(180),
    employmentStartDate: z.union([z.literal(""), isoDate("Enter a valid employment start date.")]),
    employmentType: optionalText(80),
    lineManagerName: optionalText(180),
    lineManagerEmail: optionalEmail,
    employerAwareness: z.union([z.literal(""), z.enum(["yes", "no", "discuss_later"])]),
    pathwayRoleSupport: optionalText(),
  }),
  bursaryRequest: z.object({
    quotedPathwayCostGbp: z.number().min(0, "Enter zero or a positive amount.").optional(),
    bursaryAmountRequestedGbp: z.number({ error: "Enter the bursary amount requested." }).min(0, "Enter zero or a positive amount."),
    requestedBursaryPercentage: z.number({ error: "Enter the requested percentage." }).min(0, "Percentage cannot be below 0.").max(100, "Percentage cannot be above 100."),
    otherContributionAvailableGbp: z.number().min(0, "Enter zero or a positive amount.").optional(),
    proceedWithLowerBursary: z.enum(["yes", "no", "discuss"], {
      error: "Select whether you could proceed with a lower bursary.",
    }),
    financialCircumstances: requiredText("Financial circumstances"),
    scholarshipOutcome: requiredText("Scholarship outcome"),
    measurableResult: requiredText("Measurable result"),
    learningApplicationAndContribution: requiredText("Learning application and contribution"),
  }),
  pathwaySelection: z.object({
    preferredPathway: z.enum(pathwayValues, { error: "Select one preferred pathway." }),
    preferredStartMonthOrIntake: requiredText("Preferred start month or intake", 120),
    highestRelevantQualification: optionalText(255),
    professionalMembershipsOrCertifications: optionalText(),
    relevantExperience: requiredText("Relevant experience"),
    pathwayFitReason: requiredText("Pathway fit"),
  }),
  termsAndConsents: z.object({
    linkedInAwardPostConsent: accepted("You must accept this mandatory term."),
    secondProgressPostConsent: accepted("You must accept this mandatory term."),
    tagIpcConsent: accepted("You must accept this mandatory term."),
    reshareAndQuoteConsent: accepted("You must accept this mandatory term."),
    professionalHeadshotConsent: accepted("You must accept this mandatory term."),
    participationConsent: accepted("You must accept this mandatory term."),
    approvedMediaUseConsent: accepted("You must accept this mandatory term."),
    reportRestrictionsConsent: accepted("You must accept this mandatory term."),
    publicityRestrictions: z.array(z.enum(publicityRestrictionValues)).min(1, "Select None declared or a restriction."),
    publicityRestrictionDetails: optionalText(),
    professionalHeadshotReference: optionalText(500),
    generalMarketingConsent: z.boolean(),
  }),
  reviewAndDeclaration: z.object({
    section1Complete: accepted("Confirm that Section 1 is complete."),
    section2CompleteOrNotApplicable: accepted("Confirm that Section 2 is complete or not applicable."),
    section3Complete: accepted("Confirm that Section 3 is complete."),
    section4Complete: accepted("Confirm that Section 4 is complete."),
    section5Complete: accepted("Confirm that Section 5 is complete."),
    informationAccurateDeclaration: accepted("You must confirm this declaration."),
    noAwardGuaranteeDeclaration: accepted("You must confirm this declaration."),
    pathwayTermsDeclaration: accepted("You must confirm this declaration."),
    processingConsentDeclaration: accepted("You must confirm this declaration."),
    applicantIdentityDeclaration: accepted("You must confirm this declaration."),
    fullLegalName: requiredText("Full legal name", 255),
    dateSigned: isoDate("Enter a valid signing date."),
    electronicSignature: requiredText("Typed or electronic signature", 255),
    signaturePlace: requiredText("Place or city of signature", 180),
    preferredSecureSubmissionReference: optionalText(180),
    additionalReviewInformation: optionalText(),
  }),
}).superRefine((values, context) => {
  const { personalDetails, organisationDetails, termsAndConsents, reviewAndDeclaration } = values;
  if (personalDetails.dateOfBirth) {
    const dateOfBirth = new Date(`${personalDetails.dateOfBirth}T00:00:00`);
    if (dateOfBirth >= new Date()) {
      context.addIssue({
        code: "custom",
        path: ["personalDetails", "dateOfBirth"],
        message: "Enter a valid date of birth in the past.",
      });
    }
  }

  try {
    const phone = normaliseMobileNumber(
      personalDetails.phoneCountryIso2,
      personalDetails.phoneNationalNumber,
    );
    if (!phone) throw new Error("invalid");
    if (phone.e164 !== personalDetails.mobilePhoneE164) {
      context.addIssue({
        code: "custom",
        path: ["personalDetails", "mobilePhoneE164"],
        message: "The mobile number could not be normalised. Re-enter it.",
      });
    }
  } catch {
    context.addIssue({
      code: "custom",
      path: ["personalDetails", "phoneNationalNumber"],
      message: "Enter a valid mobile number for the selected country.",
    });
  }

  if (personalDetails.currentlyEmployed) {
    if (organisationDetails.organisationNotApplicable) {
      context.addIssue({
        code: "custom",
        path: ["organisationDetails", "organisationNotApplicable"],
        message: "Employed applicants must complete this section.",
      });
    }
    if (!organisationDetails.organisationName.trim()) {
      context.addIssue({
        code: "custom",
        path: ["organisationDetails", "organisationName"],
        message: "Organisation name is required when employed.",
      });
    }
    if (!organisationDetails.jobTitle.trim()) {
      context.addIssue({
        code: "custom",
        path: ["organisationDetails", "jobTitle"],
        message: "Your job title is required when employed.",
      });
    }
  } else if (!organisationDetails.organisationNotApplicable) {
    context.addIssue({
      code: "custom",
      path: ["organisationDetails", "organisationNotApplicable"],
      message: "Mark this section not applicable when you are not employed.",
    });
  }

  const restrictions = termsAndConsents.publicityRestrictions;
  if (restrictions.includes("none_declared") && restrictions.length > 1) {
    context.addIssue({
      code: "custom",
      path: ["termsAndConsents", "publicityRestrictions"],
      message: "None declared cannot be selected with another restriction.",
    });
  }
  if (restrictions.some((value) => value !== "none_declared") && !termsAndConsents.publicityRestrictionDetails.trim()) {
    context.addIssue({
      code: "custom",
      path: ["termsAndConsents", "publicityRestrictionDetails"],
      message: "Describe the restriction, required approval or safe alternative.",
    });
  }

  if (reviewAndDeclaration.dateSigned) {
    const signed = new Date(`${reviewAndDeclaration.dateSigned}T00:00:00`);
    if (signed > new Date()) {
      context.addIssue({
        code: "custom",
        path: ["reviewAndDeclaration", "dateSigned"],
        message: "The date signed cannot be in the future.",
      });
    }
  }
});

export type BursaryApplicationFormValues = z.infer<typeof bursaryApplicationSchema>;

export const defaultBursaryApplicationValues: BursaryApplicationFormValues = {
  personalDetails: {
    title: "", membershipReference: "", firstName: "", lastName: "", preferredName: "", dateOfBirth: "", email: "",
    phoneCountryIso2: "", phoneDialCode: "", phoneNationalNumber: "", mobilePhoneE164: "",
    homeAddressLine1: "", homeAddressLine2: "", townOrCity: "", countyOrRegion: "",
    postcode: "", country: "", linkedInProfileUrl: "",
    currentlyEmployed: undefined as unknown as boolean,
    currentProfessionalStatus: "",
    preferredContactMethod: undefined as unknown as "email",
  },
  organisationDetails: {
    organisationNotApplicable: true, organisationName: "", organisationWebsite: "",
    industryOrSector: "", organisationAddressLine1: "", organisationAddressLine2: "",
    organisationTownOrCity: "", organisationCountyOrRegion: "", organisationPostcode: "",
    organisationCountry: "", organisationSize: "", jobTitle: "", departmentOrBusinessUnit: "",
    employmentStartDate: "", employmentType: "", lineManagerName: "", lineManagerEmail: "",
    employerAwareness: "", pathwayRoleSupport: "",
  },
  bursaryRequest: {
    quotedPathwayCostGbp: undefined,
    bursaryAmountRequestedGbp: undefined as unknown as number,
    requestedBursaryPercentage: undefined as unknown as number,
    otherContributionAvailableGbp: undefined,
    proceedWithLowerBursary: undefined as unknown as "discuss",
    financialCircumstances: "", scholarshipOutcome: "",
    measurableResult: "", learningApplicationAndContribution: "",
  },
  pathwaySelection: {
    preferredPathway: undefined as unknown as "operational", preferredStartMonthOrIntake: "",
    highestRelevantQualification: "", professionalMembershipsOrCertifications: "",
    relevantExperience: "", pathwayFitReason: "",
  },
  termsAndConsents: {
    linkedInAwardPostConsent: false as true, secondProgressPostConsent: false as true,
    tagIpcConsent: false as true, reshareAndQuoteConsent: false as true,
    professionalHeadshotConsent: false as true, participationConsent: false as true,
    approvedMediaUseConsent: false as true, reportRestrictionsConsent: false as true,
    publicityRestrictions: [], publicityRestrictionDetails: "",
    professionalHeadshotReference: "", generalMarketingConsent: false,
  },
  reviewAndDeclaration: {
    section1Complete: false as true, section2CompleteOrNotApplicable: false as true,
    section3Complete: false as true, section4Complete: false as true,
    section5Complete: false as true, informationAccurateDeclaration: false as true,
    noAwardGuaranteeDeclaration: false as true, pathwayTermsDeclaration: false as true,
    processingConsentDeclaration: false as true, applicantIdentityDeclaration: false as true,
    fullLegalName: "", dateSigned: "", electronicSignature: "", signaturePlace: "",
    preferredSecureSubmissionReference: "", additionalReviewInformation: "",
  },
};

export const stepFieldNames: Array<Array<keyof BursaryApplicationFormValues | `${string}.${string}`>> = [
  [
    "personalDetails.membershipReference", "personalDetails.firstName", "personalDetails.lastName", "personalDetails.dateOfBirth",
    "personalDetails.email", "personalDetails.phoneCountryIso2", "personalDetails.phoneDialCode",
    "personalDetails.phoneNationalNumber", "personalDetails.mobilePhoneE164",
    "personalDetails.homeAddressLine1", "personalDetails.townOrCity", "personalDetails.postcode",
    "personalDetails.country", "personalDetails.linkedInProfileUrl",
    "personalDetails.currentlyEmployed", "personalDetails.preferredContactMethod",
  ],
  [
    "organisationDetails.organisationNotApplicable", "organisationDetails.organisationName",
    "organisationDetails.organisationWebsite", "organisationDetails.jobTitle",
    "organisationDetails.lineManagerEmail",
  ],
  ["bursaryRequest"],
  ["pathwaySelection"],
  ["termsAndConsents"],
  ["reviewAndDeclaration"],
];
