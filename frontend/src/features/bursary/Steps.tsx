import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, ExternalLink } from "lucide-react";
import {
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import { useFormContext } from "react-hook-form";
import "flag-icons/css/flag-icons.min.css";

import {
  Callout,
  ConsentCheckbox,
  FieldShell,
  NumberField,
  RadioGroup,
  SelectField,
  StepHeading,
  TextareaField,
  TextField,
} from "./FormFields";
import { countriesByIso2, phoneCountries, residentialCountries } from "./countries";
import { bursaryApi, pathwayLabels } from "./api";
import { bursaryPathways } from "./pathways";
import {
  defaultBursaryApplicationValues,
  type BursaryApplicationFormValues,
} from "./schema";

const countryOptions = residentialCountries.map(({ iso2, name }) => ({ value: name, label: name, iso2 }));

function CountryFlag({ iso2 }: { iso2: CountryCode }) {
  return (
    <span
      className={`fi fi-${iso2.toLowerCase()} shrink-0 rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.12)]`}
      aria-hidden="true"
    />
  );
}

function PhoneFields() {
  const {
    register,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext<BursaryApplicationFormValues>();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const iso2 = watch("personalDetails.phoneCountryIso2");
  const national = watch("personalDetails.phoneNationalNumber");
  const selected = countriesByIso2.get(iso2 as CountryCode);
  const phoneError = errors.personalDetails?.phoneNationalNumber?.message;
  const countryError = errors.personalDetails?.phoneCountryIso2?.message;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return phoneCountries;
    return phoneCountries.filter((country) =>
      country.name.toLowerCase().includes(query)
      || country.iso2.toLowerCase().includes(query)
      || country.dialCode.includes(query),
    );
  }, [search]);

  useEffect(() => {
    const handleOutside = (event: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, []);

  useEffect(() => {
    if (!iso2 || !national) {
      setValue("personalDetails.mobilePhoneE164", "", { shouldValidate: false });
      return;
    }
    const phone = parsePhoneNumberFromString(national, iso2 as CountryCode);
    const isSelectedCountry = phone?.country === iso2;
    setValue(
      "personalDetails.mobilePhoneE164",
      phone?.isValid() && isSelectedCountry ? phone.number : "",
      { shouldDirty: true, shouldValidate: false },
    );
  }, [iso2, national, setValue]);

  const selectCountry = (country: (typeof phoneCountries)[number]) => {
    setValue("personalDetails.phoneCountryIso2", country.iso2, {
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue("personalDetails.phoneDialCode", country.dialCode, {
      shouldDirty: true,
      shouldTouch: true,
    });
    setOpen(false);
    setSearch("");
    void trigger([
      "personalDetails.phoneCountryIso2",
      "personalDetails.phoneDialCode",
      "personalDetails.phoneNationalNumber",
      "personalDetails.mobilePhoneE164",
    ]);
  };

  const normalisePastedNumber = () => {
    if (!iso2 || !national) return;
    const phone = parsePhoneNumberFromString(national, iso2 as CountryCode);
    if (phone?.isValid() && phone.country === iso2 && national.trim().startsWith("+")) {
      setValue("personalDetails.phoneNationalNumber", phone.formatNational(), {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  };

  return (
    <div className="md:col-span-2">
      <div className="grid min-w-0 gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div ref={wrapperRef} className="relative min-w-0 w-full">
          <label htmlFor="bursary-phone-country-selector" className="mb-2 block text-sm font-semibold text-background-950">
            Country calling code <span className="text-primary-700" aria-hidden="true">*</span>
          </label>
          <label htmlFor="bursary-phone-country-search" className="sr-only">Country calling code</label>
          <button
            id="bursary-phone-country-selector"
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-haspopup="listbox"
            aria-expanded={open}
            className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-left text-sm outline-none focus:ring-2 focus:ring-primary-500/20 ${countryError ? "border-red-500" : "border-background-300"}`}
          >
            {selected ? (
              <span className="flex min-w-0 items-center gap-2.5">
                <CountryFlag iso2={selected.iso2} />
                <span className="min-w-0 truncate">{selected.name}</span>
                <strong className="shrink-0">{selected.dialCode}</strong>
              </span>
            ) : <span className="text-foreground-500">Select country calling code</span>}
            <ChevronDown size={17} className="shrink-0" />
          </button>
          {open && (
            <div className="absolute z-40 mt-2 w-full min-w-[18rem] overflow-hidden rounded-xl border border-background-300 bg-white shadow-xl">
              <input
                id="bursary-phone-country-search"
                type="search"
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search country or code"
                aria-controls="bursary-phone-country-list"
                className="min-h-12 w-full border-b border-background-200 px-4 text-sm outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500/30"
              />
              <ul id="bursary-phone-country-list" role="listbox" className="max-h-64 overflow-y-auto p-1">
                {filtered.map((country) => (
                  <li key={country.iso2} role="option" aria-selected={country.iso2 === iso2}>
                    <button
                      type="button"
                      onClick={() => selectCountry(country)}
                      className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-primary-50 focus:bg-primary-50 focus:outline-none"
                    >
                      <CountryFlag iso2={country.iso2} />
                      <span className="min-w-0 flex-1 truncate">{country.name}</span>
                      <strong>{country.dialCode}</strong>
                    </button>
                  </li>
                ))}
                {!filtered.length && <li className="px-3 py-6 text-center text-sm text-foreground-500">No country found.</li>}
              </ul>
            </div>
          )}
          <input type="hidden" {...register("personalDetails.phoneCountryIso2")} />
          <input type="hidden" {...register("personalDetails.phoneDialCode")} />
          {countryError && <p role="alert" className="mt-1.5 text-xs font-medium text-red-700">{countryError}</p>}
        </div>
        <FieldShell
          name="personalDetails.phoneNationalNumber"
          label="Mobile phone number"
          required
          helper="Enter the national number. You may also paste a full international number."
        >
          {({ id, error, describedBy }) => (
            <input
              id={id}
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              required
              aria-invalid={Boolean(error)}
              aria-describedby={describedBy}
              className={`min-h-12 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${error ? "border-red-500" : "border-background-300"}`}
              {...register("personalDetails.phoneNationalNumber", {
                onChange: (event) => {
                  event.target.value = event.target.value.replace(/[^\d+().\s-]/g, "");
                },
                onBlur: normalisePastedNumber,
              })}
            />
          )}
        </FieldShell>
      </div>
      {!phoneError && iso2 && national && watch("personalDetails.mobilePhoneE164") && (
        <p className="mt-2 text-xs text-emerald-700">
          International format: {watch("personalDetails.mobilePhoneE164")}
        </p>
      )}
    </div>
  );
}

export function PersonalDetailsStep() {
  const {
    watch,
    setValue,
    setError,
    clearErrors,
    getFieldState,
  } = useFormContext<BursaryApplicationFormValues>();
  const employed = watch("personalDetails.currentlyEmployed");
  const membershipReference = watch("personalDetails.membershipReference");
  const [membershipReferenceStatus, setMembershipReferenceStatus] = useState<
    "idle" | "checking" | "verified"
  >("idle");

  useEffect(() => {
    if (employed === false) {
      setValue(
        "organisationDetails",
        { ...defaultBursaryApplicationValues.organisationDetails },
        { shouldDirty: true, shouldValidate: true },
      );
    } else if (employed === true) {
      setValue("organisationDetails.organisationNotApplicable", false, { shouldDirty: true });
    }
  }, [employed, setValue]);

  useEffect(() => {
    const reference = membershipReference.trim();
    const fieldName = "personalDetails.membershipReference" as const;
    const currentError = getFieldState(fieldName).error;
    if (currentError?.type === "membershipReferenceOwnership") {
      clearErrors(fieldName);
    }
    if (!reference) {
      setMembershipReferenceStatus("idle");
      return;
    }

    const controller = new AbortController();
    setMembershipReferenceStatus("checking");
    const timer = window.setTimeout(async () => {
      try {
        const result = await bursaryApi.validateMembershipReference(reference, controller.signal);
        if (controller.signal.aborted) return;
        if (!result.authenticated) {
          setMembershipReferenceStatus("idle");
          return;
        }
        if (result.valid) {
          clearErrors(fieldName);
          setMembershipReferenceStatus("verified");
        } else {
          setMembershipReferenceStatus("idle");
          setError(fieldName, {
            type: "membershipReferenceOwnership",
            message: result.message || "This membership reference is not linked to the account currently signed in.",
          });
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setMembershipReferenceStatus("idle");
        setError(fieldName, {
          type: "membershipReferenceOwnership",
          message: "We could not verify this membership reference. Please try again.",
        });
      }
    }, 450);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [clearErrors, getFieldState, membershipReference, setError]);

  return (
    <>
      <StepHeading
        title="Personal Details"
        intro="Complete this section as the learner and applicant. Fields marked with a gold asterisk are mandatory. Use your legal name where requested and provide contact details that IPC may use for this application."
      >
        <Callout><strong>Purpose of this form.</strong> This learner-facing application enables IPC to assess a request for a bursary and scholarship place. It is not an employer agreement. Save a completed copy for your records before submission.</Callout>
      </StepHeading>
      <div className="grid min-w-0 gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <TextField
          name="personalDetails.membershipReference"
          label="Membership reference"
          required
          wide
          placeholder="For example, IPC-XXXXXXXXXX"
          helper={
            membershipReferenceStatus === "checking"
              ? "Checking this reference against your signed-in account..."
              : membershipReferenceStatus === "verified"
                ? "Verified — this membership reference belongs to your account."
                : "Enter the reference from your IPC membership record. It must belong to the account currently signed in."
          }
        />
        <TextField name="personalDetails.title" label="Title" autoComplete="honorific-prefix" />
        <TextField name="personalDetails.preferredName" label="Preferred name" autoComplete="nickname" />
        <TextField name="personalDetails.firstName" label="First name" required autoComplete="given-name" />
        <TextField name="personalDetails.lastName" label="Last name" required autoComplete="family-name" />
        <TextField name="personalDetails.dateOfBirth" label="Date of birth" type="date" required helper="Use DD/MM/YYYY when entering or reviewing this date." autoComplete="bday" />
        <TextField name="personalDetails.email" label="Email address" type="email" inputMode="email" required autoComplete="email" />
        <PhoneFields />
        <TextField name="personalDetails.homeAddressLine1" label="Home address line 1" required autoComplete="address-line1" />
        <TextField name="personalDetails.homeAddressLine2" label="Home address line 2" autoComplete="address-line2" />
        <TextField name="personalDetails.townOrCity" label="Town or city" required autoComplete="address-level2" />
        <TextField name="personalDetails.countyOrRegion" label="County or region" autoComplete="address-level1" />
        <TextField name="personalDetails.postcode" label="Postcode" required autoComplete="postal-code" />
        <SelectField
          name="personalDetails.country"
          label="Country"
          required
          options={countryOptions.map(({ value, label }) => ({ value, label }))}
        />
        <TextField name="personalDetails.linkedInProfileUrl" label="LinkedIn profile URL" type="url" inputMode="url" required placeholder="https://www.linkedin.com/in/your-profile" />
        <TextField name="personalDetails.currentProfessionalStatus" label="Current job title, professional status or area of practice" />
        <RadioGroup
          name="personalDetails.currentlyEmployed"
          legend="Are you currently employed by an organisation?"
          required
          options={[
            { value: true, label: "Yes — complete Section 2" },
            { value: false, label: "No — Section 2 is not applicable" },
          ]}
        />
        <RadioGroup
          name="personalDetails.preferredContactMethod"
          legend="Preferred contact method"
          required
          options={[
            { value: "email", label: "Email" },
            { value: "phone", label: "Phone" },
            { value: "either", label: "Either" },
          ]}
        />
      </div>
    </>
  );
}

export function OrganisationDetailsStep() {
  const { watch } = useFormContext<BursaryApplicationFormValues>();
  const employed = watch("personalDetails.currentlyEmployed");
  const notApplicable = watch("organisationDetails.organisationNotApplicable");

  return (
    <>
      <StepHeading
        title="Organisation Details"
        intro="Complete this section only if you are employed by an organisation. If you are not employed, tick the not-applicable box and continue to Section 3."
      >
        <Callout><strong>Learner-facing section.</strong> The details below help IPC understand the professional context for your application. This form does not request apprenticeship levy funding, Department for Education funding or an employer payment commitment.</Callout>
      </StepHeading>
      {!employed && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary-300 bg-primary-50 p-5" role="status">
          <Check className="mt-0.5 shrink-0 text-primary-800" size={20} />
          <div>
            <p className="font-semibold text-background-950">Not applicable — you indicated that you are not currently employed.</p>
            <p className="mt-1 text-sm text-foreground-600">Organisation fields are not required and this section will be shown as skipped.</p>
          </div>
        </div>
      )}
      {!notApplicable && <div className="grid gap-5 md:grid-cols-2">
        <TextField name="organisationDetails.organisationName" label="Organisation name" required={Boolean(employed)} />
        <TextField name="organisationDetails.organisationWebsite" label="Organisation website" type="url" />
        <TextField name="organisationDetails.industryOrSector" label="Industry or sector" />
        <SelectField
          name="organisationDetails.organisationSize"
          label="Organisation size"
          options={["1-10", "11-50", "51-200", "201-500", "501-1,000", "1,001+"].map((value) => ({ value, label: value }))}
        />
        <TextField name="organisationDetails.organisationAddressLine1" label="Organisation address line 1" />
        <TextField name="organisationDetails.organisationAddressLine2" label="Organisation address line 2" />
        <TextField name="organisationDetails.organisationTownOrCity" label="Town or city" />
        <TextField name="organisationDetails.organisationCountyOrRegion" label="County or region" />
        <TextField name="organisationDetails.organisationPostcode" label="Postcode" />
        <SelectField name="organisationDetails.organisationCountry" label="Country" options={countryOptions.map(({ value, label }) => ({ value, label }))} />
        <TextField name="organisationDetails.jobTitle" label="Your job title" required={Boolean(employed)} />
        <TextField name="organisationDetails.departmentOrBusinessUnit" label="Department or business unit" />
        <TextField name="organisationDetails.employmentStartDate" label="Employment start date" type="date" />
        <SelectField name="organisationDetails.employmentType" label="Employment type" options={["Full time", "Part time", "Contract", "Temporary", "Other"].map((value) => ({ value, label: value }))} />
        <TextField name="organisationDetails.lineManagerName" label="Line manager name" />
        <TextField name="organisationDetails.lineManagerEmail" label="Line manager email" type="email" inputMode="email" />
        <RadioGroup
          name="organisationDetails.employerAwareness"
          legend="Does your employer know that you are applying?"
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
            { value: "discuss_later", label: "Prefer to discuss later" },
          ]}
        />
        <TextareaField name="organisationDetails.pathwayRoleSupport" label="How will the selected pathway support your current role and organisation?" />
      </div>}
    </>
  );
}

export function BursaryRequestStep() {
  return (
    <>
      <StepHeading
        title="IPC Bursary Request and Scholarship Outcomes"
        intro="Explain the IPC bursary support you are requesting and the outcomes you intend to achieve through the scholarship. This section is for an IPC bursary only."
      >
        <Callout><strong>IPC bursary only.</strong> This section is not an employer funding agreement, apprenticeship levy request, Department for Education funding application or student finance application. An application does not guarantee an award, and IPC may offer a different amount or place conditions on an award.</Callout>
      </StepHeading>
      <div className="grid gap-5 md:grid-cols-2">
        <NumberField name="bursaryRequest.quotedPathwayCostGbp" label="Quoted pathway cost (GBP), if known" />
        <NumberField name="bursaryRequest.bursaryAmountRequestedGbp" label="IPC bursary amount requested (GBP)" required />
        <NumberField name="bursaryRequest.requestedBursaryPercentage" label="Requested bursary as % of eligible cost" required helper="Enter a percentage, for example 50%." />
        <NumberField name="bursaryRequest.otherContributionAvailableGbp" label="Other contribution available (GBP)" helper="Personal, employer, sponsor or other confirmed support." />
        <RadioGroup
          name="bursaryRequest.proceedWithLowerBursary"
          legend="Could you proceed if IPC offers a lower bursary?"
          required
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
            { value: "discuss", label: "I would need to discuss the offer" },
          ]}
        />
        <TextareaField name="bursaryRequest.financialCircumstances" label="Financial circumstances and why IPC support is needed" required />
        <TextareaField name="bursaryRequest.scholarshipOutcome" label="What professional, academic or community outcome will this scholarship enable?" required />
        <TextareaField name="bursaryRequest.measurableResult" label="What measurable result do you aim to achieve during the pathway?" required />
        <TextareaField name="bursaryRequest.learningApplicationAndContribution" label="How will you apply the learning within 3 to 12 months and contribute to the IPC community or profession?" required />
      </div>
    </>
  );
}

export function PathwaySelectionStep() {
  const { register, watch, formState: { errors } } = useFormContext<BursaryApplicationFormValues>();
  const selected = watch("pathwaySelection.preferredPathway");
  const error = errors.pathwaySelection?.preferredPathway?.message;
  return (
    <>
      <StepHeading
        title="Pathway Selection"
        intro="Select one preferred pathway. Final confirmation is subject to eligibility, bursary assessment, cohort capacity and an agreed learning plan."
      />
      <fieldset>
        <legend className="mb-4 text-sm font-semibold text-background-950">Preferred pathway <span className="text-primary-700">*</span></legend>
        <div className="grid gap-4 lg:grid-cols-2">
          {bursaryPathways.map((pathway) => (
            <label key={pathway.value} className={`relative flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition hover:border-primary-500 ${selected === pathway.value ? "border-primary-600 bg-primary-50 shadow-sm" : "border-background-300 bg-white"}`}>
              <input
                type="radio"
                value={pathway.value}
                className="mt-1 h-5 w-5 shrink-0 accent-[oklch(var(--primary-600))]"
                {...register("pathwaySelection.preferredPathway")}
              />
              <span>
                <strong className="block text-lg text-background-950">{pathway.title}</strong>
                <span className="mt-1 block text-xs font-semibold uppercase tracking-wide text-primary-800">{pathway.meta}</span>
                {pathway.components.length > 0 && (
                  <span className="mt-4 block">
                    <span className="text-xs font-semibold uppercase tracking-wide text-foreground-500">Mandatory core components</span>
                    <span className="mt-2 block space-y-1 text-sm text-foreground-700">
                      {pathway.components.map((component) => <span key={component} className="block">• {component}</span>)}
                    </span>
                  </span>
                )}
                <span className="mt-4 block text-sm leading-6 text-foreground-600">{pathway.description}</span>
              </span>
            </label>
          ))}
        </div>
        {error && <p role="alert" className="mt-2 text-xs font-medium text-red-700">{error}</p>}
      </fieldset>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <TextField name="pathwaySelection.preferredStartMonthOrIntake" label="Preferred start month or intake" required />
        <TextField name="pathwaySelection.highestRelevantQualification" label="Highest relevant qualification" />
        <TextareaField name="pathwaySelection.professionalMembershipsOrCertifications" label="Relevant professional memberships or certifications" rows={3} />
        <TextareaField name="pathwaySelection.relevantExperience" label="Relevant project, programme, PMO or project controls experience" required />
        <TextareaField name="pathwaySelection.pathwayFitReason" label="Why is this pathway the right fit for your goals?" required />
      </div>
    </>
  );
}

const mandatoryConsents = [
  ["linkedInAwardPostConsent", "LinkedIn award post within 14 days", "I will publish a LinkedIn post announcing the award within 14 calendar days of written award confirmation."],
  ["secondProgressPostConsent", "Second progress or completion post", "I will publish a second LinkedIn post during the pathway or on completion to share progress, outcomes or completion."],
  ["tagIpcConsent", "Tag the Institute of Project Controls", "I will tag the Institute of Project Controls in both required LinkedIn posts."],
  ["reshareAndQuoteConsent", "Reshare and quote", "I allow IPC to reshare, quote and reference the required posts, with reasonable editing for length while preserving their meaning."],
  ["professionalHeadshotConsent", "Professional headshot", "I will provide a current professional headshot suitable for approved IPC communications."],
  ["participationConsent", "Participation", "I will participate, where reasonably requested and agreed, in approved photos, videos, interviews, testimonials and case studies connected to the bursary or scholarship."],
  ["approvedMediaUseConsent", "Approved use of name, image, video and story", "I permit IPC to use my approved name, image, video and learner story on its website, social media, digital advertising, email, brochures, events, reports, publications and sponsor-impact materials."],
  ["reportRestrictionsConsent", "Report restrictions promptly", "I will tell IPC about any safeguarding, accessibility, religious, security, confidentiality or employer-related publicity restriction, required approval or change in circumstances."],
] as const;

const restrictionOptions = [
  ["none_declared", "None declared"],
  ["safeguarding", "Safeguarding"],
  ["accessibility", "Accessibility"],
  ["religious", "Religious"],
  ["security", "Security"],
  ["confidentiality", "Confidentiality"],
  ["employer_related", "Employer-related"],
  ["other", "Other"],
] as const;

export function TermsAndConsentsStep() {
  const { watch, setValue, formState: { errors } } = useFormContext<BursaryApplicationFormValues>();
  const selected = watch("termsAndConsents.publicityRestrictions");
  const restrictionError = errors.termsAndConsents?.publicityRestrictions?.message;

  const toggleRestriction = (value: (typeof restrictionOptions)[number][0], checked: boolean) => {
    if (value === "none_declared" && checked) {
      setValue("termsAndConsents.publicityRestrictions", ["none_declared"], { shouldDirty: true, shouldValidate: true });
      return;
    }
    const withoutNone = selected.filter((item) => item !== "none_declared" && item !== value);
    const next = checked ? [...withoutNone, value] : withoutNone;
    setValue("termsAndConsents.publicityRestrictions", next.length ? next : ["none_declared"], {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <>
      <StepHeading
        title="Mandatory Terms and Consents"
        intro="The mandatory acknowledgements below are conditions of an IPC bursary or scholarship award. Tick every mandatory box. The newsletter choice is optional."
      >
        <Callout><strong>Safe and approved publicity.</strong> IPC will consider restrictions recorded on this page and will not knowingly require disclosure of confidential, secure, safeguarding-sensitive or employer-protected information. Where possible, IPC may agree a safe alternative that still demonstrates scholarship impact.</Callout>
      </StepHeading>
      <fieldset>
        <legend className="sr-only">Eight mandatory bursary terms</legend>
        <div className="space-y-3">
          {mandatoryConsents.map(([name, title, copy]) => (
            <ConsentCheckbox key={name} name={`termsAndConsents.${name}`} title={title} copy={copy} />
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-8 rounded-2xl border border-background-300 bg-background-100 p-5">
        <legend className="px-2 text-base font-semibold text-background-950">Publicity restriction or reasonable-adjustment record</legend>
        <p className="mb-4 text-sm leading-6 text-foreground-600">Tick all that apply, then describe the restriction, required approval, protected detail or safe alternative below.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {restrictionOptions.map(([value, label]) => (
            <label key={value} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-background-300 bg-white px-3 py-2 text-sm hover:border-primary-500">
              <input
                type="checkbox"
                checked={selected.includes(value)}
                onChange={(event) => toggleRestriction(value, event.target.checked)}
                className="h-4 w-4 accent-[oklch(var(--primary-600))]"
              />
              {label}
            </label>
          ))}
        </div>
        {restrictionError && <p role="alert" className="mt-2 text-xs font-medium text-red-700">{restrictionError}</p>}
        <div className="mt-5">
          <TextareaField name="termsAndConsents.publicityRestrictionDetails" label="Publicity restriction details" helper="Only provide what IPC needs to record the restriction or safe alternative." />
        </div>
      </fieldset>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <TextField
          name="termsAndConsents.professionalHeadshotReference"
          label="Professional headshot file name or secure link"
          helper="This site does not expose a public upload. Enter a file name or an existing secure link if available."
          wide
        />
      </div>
      <div className="mt-5">
        <ConsentCheckbox
          name="termsAndConsents.generalMarketingConsent"
          optional
          copy="I agree to receive IPC newsletters, events and general marketing communications. I understand this is not required for bursary consideration and I may unsubscribe at any time."
        />
      </div>
    </>
  );
}

const checklist = [
  ["section1Complete", "Section 1 — Personal Details is complete."],
  ["section2CompleteOrNotApplicable", "Section 2 — Organisation Details is complete or marked not applicable."],
  ["section3Complete", "Section 3 — IPC Bursary Request and Scholarship Outcomes is complete."],
  ["section4Complete", "Section 4 — one preferred pathway is selected."],
  ["section5Complete", "Section 5 — all mandatory terms are accepted and any restrictions are recorded."],
] as const;

const declarations = [
  ["informationAccurateDeclaration", "I confirm that the information provided is accurate and complete."],
  ["noAwardGuaranteeDeclaration", "I understand that an application does not guarantee a bursary or scholarship award."],
  ["pathwayTermsDeclaration", "If awarded, I agree to the pathway plan and mandatory terms in this form."],
  ["processingConsentDeclaration", "I consent to IPC processing the application information for the purposes stated above."],
  ["applicantIdentityDeclaration", "I confirm that I am the learner and applicant signing this form."],
] as const;

function ReviewCard({
  title,
  valid,
  onEdit,
  children,
}: {
  title: string;
  valid: boolean;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-background-300 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-background-950">{title}</h3>
          <p className={`mt-1 text-xs font-semibold ${valid ? "text-emerald-700" : "text-red-700"}`}>{valid ? "Technically valid" : "Needs attention"}</p>
        </div>
        <button type="button" onClick={onEdit} className="rounded-lg border border-background-300 px-3 py-2 text-xs font-semibold hover:border-primary-500 hover:bg-primary-50">Edit</button>
      </div>
      <div className="mt-4 text-sm leading-6 text-foreground-600">{children}</div>
    </section>
  );
}

export function ReviewAndDeclarationStep({
  completedSteps,
  onEdit,
}: {
  completedSteps: Set<number>;
  onEdit: (step: number) => void;
}) {
  const { watch } = useFormContext<BursaryApplicationFormValues>();
  const values = watch();
  const birthYear = values.personalDetails.dateOfBirth.slice(0, 4);
  return (
    <>
      <StepHeading
        title="Review, Declaration and Signature"
        intro="Review Sections 1 to 5 before signing. Your signature must be provided by you as the learner and applicant."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <ReviewCard title="1. Personal Details" valid={completedSteps.has(0)} onEdit={() => onEdit(0)}>
          <p><strong>{values.personalDetails.firstName} {values.personalDetails.lastName}</strong></p>
          <p>{values.personalDetails.email} · {values.personalDetails.mobilePhoneE164}</p>
          <p>Date of birth: {birthYear ? `••/••/${birthYear}` : "Not provided"} · {values.personalDetails.country}</p>
        </ReviewCard>
        <ReviewCard title="2. Organisation Details" valid={completedSteps.has(1)} onEdit={() => onEdit(1)}>
          {values.organisationDetails.organisationNotApplicable
            ? <p>Not applicable — not currently employed.</p>
            : <><p><strong>{values.organisationDetails.organisationName}</strong></p><p>{values.organisationDetails.jobTitle}</p></>}
        </ReviewCard>
        <ReviewCard title="3. Bursary Request and Outcomes" valid={completedSteps.has(2)} onEdit={() => onEdit(2)}>
          <p>Requested: <strong>£{Number(values.bursaryRequest.bursaryAmountRequestedGbp || 0).toLocaleString("en-GB")}</strong> ({values.bursaryRequest.requestedBursaryPercentage || 0}%)</p>
          <p>Sensitive financial statement: Provided for IPC review.</p>
        </ReviewCard>
        <ReviewCard title="4. Pathway Selection" valid={completedSteps.has(3)} onEdit={() => onEdit(3)}>
          <p><strong>{pathwayLabels[values.pathwaySelection.preferredPathway] || "Not selected"}</strong></p>
          <p>Preferred intake: {values.pathwaySelection.preferredStartMonthOrIntake || "Not provided"}</p>
        </ReviewCard>
        <ReviewCard title="5. Mandatory Terms and Consents" valid={completedSteps.has(4)} onEdit={() => onEdit(4)}>
          <p>Eight mandatory terms accepted.</p>
          <p>Restrictions: {values.termsAndConsents.publicityRestrictions.map((value) => value.replaceAll("_", " ")).join(", ")}</p>
          <p>General marketing: {values.termsAndConsents.generalMarketingConsent ? "Yes" : "No"}</p>
        </ReviewCard>
      </div>
      <div className="mt-8">
        <Callout><strong>Submission checklist.</strong> Confirm that the application is complete, the preferred pathway is selected, the bursary request and outcomes are explained, and every mandatory term in Section 5 is ticked.</Callout>
      </div>
      <fieldset className="mt-6 space-y-3">
        <legend className="mb-3 font-semibold text-background-950">Required submission checklist</legend>
        {checklist.map(([name, copy]) => (
          <ConsentCheckbox key={name} name={`reviewAndDeclaration.${name}`} copy={copy} />
        ))}
      </fieldset>
      <section className="mt-8 rounded-2xl border border-background-300 bg-background-100 p-5">
        <h3 className="font-semibold text-background-950">Applicant declaration</h3>
        <p className="mt-3 text-sm leading-7 text-foreground-700">
          I declare that the information in this application is accurate and complete to the best of my knowledge. I understand that submission does not guarantee an award and that IPC may consider eligibility, pathway fit, available funds, cohort capacity and evidence supplied. If awarded, I agree to follow the approved learning plan and the mandatory terms in Section 5. I authorise IPC to contact me about this application and to process the information provided for application assessment, award administration, learner support, safeguarding, compliance and impact reporting. I will notify IPC promptly if any material information or declared restriction changes.
        </p>
      </section>
      <fieldset className="mt-6 space-y-3">
        <legend className="sr-only">Required applicant declarations</legend>
        {declarations.map(([name, copy]) => (
          <ConsentCheckbox key={name} name={`reviewAndDeclaration.${name}`} copy={copy} />
        ))}
      </fieldset>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <TextField name="reviewAndDeclaration.fullLegalName" label="Full legal name" required autoComplete="name" />
        <TextField name="reviewAndDeclaration.dateSigned" label="Date signed" type="date" required helper="Use DD/MM/YYYY when entering or reviewing this date." />
        <TextField name="reviewAndDeclaration.electronicSignature" label="Typed or electronic signature" required helper="Type your signature manually. It is not generated for you." />
        <TextField name="reviewAndDeclaration.signaturePlace" label="Place or city of signature" required />
        <TextField name="reviewAndDeclaration.preferredSecureSubmissionReference" label="Preferred secure submission reference" wide />
        <TextareaField name="reviewAndDeclaration.additionalReviewInformation" label="Anything else IPC should consider before reviewing this application?" />
      </div>
      <p className="mt-6 text-xs leading-5 text-foreground-500">
        LinkedIn links open externally. IPC will only use the submitted information for the stated application purposes.{" "}
        <a href="/privacy" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary-800 underline">
          Privacy information <ExternalLink size={12} />
        </a>
      </p>
    </>
  );
}
