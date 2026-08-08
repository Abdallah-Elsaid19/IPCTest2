import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";
import { z } from "zod";

import {
  requiredIdentityDocumentSchema,
  requiredImageSchema,
} from "@/lib/validations/uploadSchema";

const requiredText = (label: string, max = 12_000) =>
  z.string().trim().min(1, `${label} is required.`).max(max);
const optionalText = (max = 8_000) => z.string().max(max);
const optionalUrl = z.union([z.literal(""), z.url("Enter a valid URL.")]);
const isoDate = (message: string) =>
  z.string().refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00`)), message);
const accepted = (message: string) => z.literal(true, { error: message });
const signatureImage = z.string()
  .min(1, "Draw your signature before submitting.")
  .max(300_000, "The drawn signature is too large. Clear it and sign again.")
  .refine((value) => /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(value), "Draw your signature before submitting.");

export function localIsoDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function latestEligibleBirthDate(date = new Date()) {
  const eligible = new Date(date.getFullYear() - 20, date.getMonth(), date.getDate());
  return localIsoDate(eligible);
}

export const pathwayValues = [
  "ai",
  "pmi_sp",
  "evm",
  "risk",
  "ppc",
  "msp",
  "managing_portfolios",
  "stakeholder_management",
  "pmo_module",
  "pmp",
  "pmo",
] as const;

export const healthProblemCategoryValues = [
  "physical_disability",
  "sensory_impairment",
  "mental_health",
  "long_term_health_condition",
  "learning_difficulty",
  "neurodivergence",
  "other",
] as const;

const existingOrIdentityDocument = z.union([
  z.literal("existing"),
  requiredIdentityDocumentSchema,
]);
const existingOrApplicantPhoto = z.union([
  z.literal(""),
  z.literal("existing"),
  requiredImageSchema,
]).optional();

const optionalLinkedInUrl = z.union([
  z.literal(""),
  z.url("Enter a valid LinkedIn profile URL.").refine((value) => {
    try {
      const host = new URL(value).hostname.toLowerCase().replace(/\.$/, "");
      return host === "linkedin.com" || host.endsWith(".linkedin.com");
    } catch {
      return false;
    }
  }, "Enter a valid LinkedIn profile URL."),
]);

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
    firstName: requiredText("First name", 120),
    lastName: requiredText("Last name", 120),
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
    linkedInProfileUrl: optionalLinkedInUrl,
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
    pathwayRoleSupport: optionalText(),
  }),
  emergencyInformation: z.object({
    emergencyContactFullName: requiredText("Emergency contact full name", 180),
    emergencyContactEmail: z.email("Enter a valid emergency contact email address."),
    emergencyContactPhone: z.string().trim().regex(/^\+?[\d\s().-]{7,40}$/, "Enter a valid emergency contact phone number."),
    identityDocument: existingOrIdentityDocument,
    applicantPhoto: existingOrApplicantPhoto,
    hasDisabilityOrHealthCondition: z.boolean({ error: "Select Yes or No." }),
    healthProblemCategories: z.array(z.enum(healthProblemCategoryValues)),
    primaryHealthProblem: optionalText(2000),
  }),
  pathwaySelection: z.object({
    preferredModules: z.array(z.enum(pathwayValues))
      .min(1, "Select at least one preferred module."),
    professionalMembershipsOrCertifications: optionalText(),
    relevantExperience: optionalText(),
    pathwayFitReason: optionalText(),
  }),
  termsAndConsents: z.object({
    mandatoryTermsAccepted: accepted("Accept all mandatory terms before continuing."),
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
    dateSigned: isoDate("Enter a valid signing date."),
    electronicSignature: signatureImage,
  }),
}).superRefine((values, context) => {
  const { personalDetails, organisationDetails, emergencyInformation } = values;
  if (personalDetails.dateOfBirth) {
    if (personalDetails.dateOfBirth > latestEligibleBirthDate()) {
      context.addIssue({
        code: "custom",
        path: ["personalDetails", "dateOfBirth"],
        message: "You must be at least 20 years old to apply.",
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

  if (emergencyInformation.hasDisabilityOrHealthCondition) {
    if (!emergencyInformation.primaryHealthProblem.trim()) {
      context.addIssue({
        code: "custom",
        path: ["emergencyInformation", "primaryHealthProblem"],
        message: "Tell us about the support or adjustments you may need.",
      });
    }
  }

});

export type BursaryApplicationFormValues = z.infer<typeof bursaryApplicationSchema>;

export const defaultBursaryApplicationValues: BursaryApplicationFormValues = {
  personalDetails: {
    firstName: "", lastName: "", dateOfBirth: "", email: "",
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
    employmentStartDate: "", employmentType: "", pathwayRoleSupport: "",
  },
  emergencyInformation: {
    emergencyContactFullName: "",
    emergencyContactEmail: "", emergencyContactPhone: "",
    identityDocument: undefined as unknown as File,
    applicantPhoto: "",
    hasDisabilityOrHealthCondition: undefined as unknown as boolean,
    healthProblemCategories: [], primaryHealthProblem: "",
  },
  pathwaySelection: {
    preferredModules: [],
    professionalMembershipsOrCertifications: "",
    relevantExperience: "", pathwayFitReason: "",
  },
  termsAndConsents: {
    mandatoryTermsAccepted: false as true,
    generalMarketingConsent: false,
  },
  reviewAndDeclaration: {
    section1Complete: false as true, section2CompleteOrNotApplicable: false as true,
    section3Complete: false as true, section4Complete: false as true,
    section5Complete: false as true, informationAccurateDeclaration: false as true,
    noAwardGuaranteeDeclaration: false as true, pathwayTermsDeclaration: false as true,
    processingConsentDeclaration: false as true, applicantIdentityDeclaration: false as true,
    dateSigned: localIsoDate(), electronicSignature: "",
  },
};

export const stepFieldNames: Array<Array<keyof BursaryApplicationFormValues | `${string}.${string}`>> = [
  [
    "personalDetails.firstName", "personalDetails.lastName", "personalDetails.dateOfBirth",
    "personalDetails.email", "personalDetails.phoneCountryIso2", "personalDetails.phoneDialCode",
    "personalDetails.phoneNationalNumber", "personalDetails.mobilePhoneE164",
    "personalDetails.homeAddressLine1", "personalDetails.townOrCity", "personalDetails.postcode",
    "personalDetails.country", "personalDetails.linkedInProfileUrl",
    "personalDetails.currentlyEmployed", "personalDetails.preferredContactMethod",
  ],
  [
    "organisationDetails.organisationNotApplicable", "organisationDetails.organisationName",
    "organisationDetails.organisationWebsite", "organisationDetails.jobTitle",
  ],
  ["emergencyInformation"],
  ["pathwaySelection"],
  ["termsAndConsents"],
  ["reviewAndDeclaration"],
];
