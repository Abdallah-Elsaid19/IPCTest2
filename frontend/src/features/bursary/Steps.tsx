import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, ExternalLink, FileCheck, FileText, Upload } from "lucide-react";
import {
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import { useFormContext } from "react-hook-form";
import "flag-icons/css/flag-icons.min.css";

import learnerTermsUrl from "@/assets/documents/ipc-learner-terms-and-conditions-direct-debit-2026-v4.3.pdf?url";
import {
  Callout,
  ConsentCheckbox,
  FieldShell,
  RadioGroup,
  SelectField,
  StepHeading,
  TextareaField,
  TextField,
} from "./FormFields";
import { countriesByIso2, phoneCountries, residentialCountries } from "./countries";
import { getSelectedFile } from "@/lib/validations/uploadSchema";

import { moduleLabels } from "./api";
import { bursaryModules, calculateBursaryFundingEstimate } from "./pathways";
import {
  defaultBursaryApplicationValues,
  latestEligibleBirthDate,
  type BursaryApplicationFormValues,
} from "./schema";
import { SignaturePad } from "./SignaturePad";

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
            className={`flex min-h-12 w-full items-center justify-between gap-3 border bg-white px-4 py-3 text-left text-sm outline-none focus:ring-2 focus:ring-primary-500/20 ${countryError ? "border-red-500" : "border-background-300"}`}
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
            <div className="absolute z-40 mt-2 w-full min-w-0 max-w-[calc(100vw-2rem)] overflow-hidden border border-background-300 bg-white shadow-xl sm:min-w-[18rem]">
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
                      className="flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-primary-50 focus:bg-primary-50 focus:outline-none"
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
              className={`min-h-12 w-full border bg-white px-4 py-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${error ? "border-red-500" : "border-background-300"}`}
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
  const { watch, setValue } = useFormContext<BursaryApplicationFormValues>();
  const employed = watch("personalDetails.currentlyEmployed");

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

  return (
    <>
      <StepHeading
        title="Personal Details"
        intro="Complete this section as the learner and applicant. Fields marked with a gold asterisk are mandatory. Use your legal name where requested and provide contact details that IPC may use for this application."
      >
        <Callout><strong>Purpose of this form.</strong> This learner-facing application enables IPC to assess a request for a bursary and scholarship place. It is not an employer agreement. Save a completed copy for your records before submission.</Callout>
      </StepHeading>
      <div className="grid min-w-0 gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <TextField name="personalDetails.firstName" label="First name" required autoComplete="given-name" />
        <TextField name="personalDetails.lastName" label="Last name" required autoComplete="family-name" />
        <TextField name="personalDetails.dateOfBirth" label="Date of birth" type="date" required max={latestEligibleBirthDate()} helper="You must be at least 20 years old to apply." autoComplete="bday" />
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
        <TextField name="personalDetails.linkedInProfileUrl" label="LinkedIn profile URL" type="url" inputMode="url" placeholder="https://www.linkedin.com/in/your-profile" />
        <TextField name="personalDetails.currentProfessionalStatus" label="Current job title, professional status or area of practice" />
        <RadioGroup
          name="personalDetails.currentlyEmployed"
          legend="Are you currently employed by an organisation?"
          required
          options={[
            { value: true, label: "Yes" },
            { value: false, label: "No" },
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
        <div className="mb-6 flex items-start gap-3 border border-primary-300 bg-primary-50 p-5" role="status">
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
        <TextareaField name="organisationDetails.pathwayRoleSupport" label="How will the selected module support your current role and organisation?" />
      </div>}
    </>
  );
}

function ApplicationUploadField({
  name,
  label,
  accept,
  helper,
  required = true,
}: {
  name: "emergencyInformation.identityDocument" | "emergencyInformation.applicantPhoto";
  label: string;
  accept: string;
  helper: string;
  required?: boolean;
}) {
  const { setValue, watch, formState: { errors } } = useFormContext<BursaryApplicationFormValues>();
  const value = watch(name);
  const selectedFile = typeof value === "string" ? undefined : getSelectedFile(value);
  const fieldError = name.endsWith("identityDocument")
    ? errors.emergencyInformation?.identityDocument?.message
    : errors.emergencyInformation?.applicantPhoto?.message;

  return (
    <FieldShell name={name} label={label} required={required} helper={helper} wide>
      {({ id, describedBy }) => (
        <label htmlFor={id} className={`flex min-h-28 cursor-pointer items-center justify-center gap-3 border border-dashed bg-white px-5 py-6 text-center transition hover:border-primary-600 hover:bg-primary-50 ${fieldError ? "border-red-500" : "border-background-400"}`}>
          <input
            id={id}
            type="file"
            accept={accept}
            aria-describedby={describedBy}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.item(0);
              if (file) setValue(name, file, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
            }}
          />
          {value === "existing" || selectedFile ? <FileCheck size={22} className="shrink-0 text-emerald-700" /> : <Upload size={22} className="shrink-0 text-primary-800" />}
          <span>
            <strong className="block text-sm text-background-950">
              {selectedFile?.name || (value === "existing" ? "File already provided" : "Add evidence")}
            </strong>
            <span className="mt-1 block text-xs text-foreground-500">Choose a file from your device</span>
          </span>
        </label>
      )}
    </FieldShell>
  );
}

export function EmergencyInformationStep() {
  const { watch, setValue } = useFormContext<BursaryApplicationFormValues>();
  const hasSupportNeed = watch("emergencyInformation.hasDisabilityOrHealthCondition");

  useEffect(() => {
    if (hasSupportNeed === false) {
      setValue("emergencyInformation.primaryHealthProblem", "", { shouldDirty: true, shouldValidate: false });
    }
  }, [hasSupportNeed, setValue]);

  return (
    <>
      <StepHeading
        title="Emergency Contact and Identification"
        intro="Provide a trusted emergency contact, proof of identity and any support information that will help IPC look after you during the programme."
      />
      <div className="grid gap-5 md:grid-cols-2">
        <TextField name="emergencyInformation.emergencyContactFullName" label="Emergency contact full name" required autoComplete="name" />
        <TextField name="emergencyInformation.emergencyContactEmail" label="Emergency contact email address" type="email" inputMode="email" required autoComplete="email" />
        <TextField name="emergencyInformation.emergencyContactPhone" label="Emergency contact phone number" type="tel" inputMode="tel" required autoComplete="tel" />
        <ApplicationUploadField
          name="emergencyInformation.identityDocument"
          label="Proof of identification"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
          helper="Upload a clear government-issued proof of identity. PDF, DOC, DOCX, JPG, PNG or WebP; maximum 10MB."
        />
        <ApplicationUploadField
          name="emergencyInformation.applicantPhoto"
          label="Your photo"
          accept="image/jpeg,image/png,image/webp"
          helper="Optional. If you are selected as a winner, this photo will be displayed on the scholarship winners page. JPG, PNG or WebP; maximum 2MB."
          required={false}
        />
      </div>
      <div className="mt-8 border border-background-300 bg-background-100 p-5">
        <RadioGroup
          name="emergencyInformation.hasDisabilityOrHealthCondition"
          legend="Do you consider yourself to have a long-term disability, health problem or learning difficulty?"
          required
          options={[{ value: true, label: "Yes" }, { value: false, label: "No" }]}
        />
        {hasSupportNeed === true && (
          <div className="mt-6">
            <TextareaField
              name="emergencyInformation.primaryHealthProblem"
              label="If you require any additional support in order for you to successfully complete your course, please specify the details below"
              required
              rows={4}
              helper="Share only what you are comfortable providing and what IPC needs to support your participation."
            />
          </div>
        )}
      </div>
    </>
  );
}

function FundingEstimate({ selectedModules }: { selectedModules: readonly string[] }) {
  const estimate = calculateBursaryFundingEstimate(selectedModules);
  const formatGbp = (value: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <section className="mt-8 border border-background-300 bg-white">
      <div className="border-b border-background-300 px-5 py-5 md:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-800">Funding estimate</p>
        <h3 className="mt-2 text-xl font-semibold text-background-950">Your selected modules and estimated costs</h3>
      </div>
      <div className="divide-y divide-background-200 px-5 md:px-6">
        {estimate.lines.map((line) => (
          <div key={line.value} className="grid gap-2 py-4 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-8">
            <div>
              <p className="font-semibold text-background-950">{line.title}</p>
              <p className="mt-1 text-xs text-foreground-500">Potential IPC Fund contribution: {line.supportPercentage}%</p>
            </div>
            <p className="text-foreground-600 sm:text-right">Cost: <strong className="text-background-950">{formatGbp(line.costGbp)}</strong></p>
            <p className="text-foreground-600 sm:min-w-28 sm:text-right">You pay: <strong className="text-background-950">{formatGbp(line.amountPayableGbp)}</strong></p>
          </div>
        ))}
      </div>
      <dl className="grid border-t border-background-300 bg-background-100 sm:grid-cols-3">
        <div className="p-5 md:p-6">
          <dt className="text-xs font-semibold uppercase tracking-wider text-foreground-500">Total module cost</dt>
          <dd className="mt-2 text-2xl font-semibold text-background-950">{formatGbp(estimate.totalCostGbp)}</dd>
        </div>
        <div className="border-y border-background-300 p-5 sm:border-x sm:border-y-0 md:p-6">
          <dt className="text-xs font-semibold uppercase tracking-wider text-foreground-500">IPC Fund contribution</dt>
          <dd className="mt-2 text-2xl font-semibold text-emerald-700">-{formatGbp(estimate.totalDiscountGbp)}</dd>
        </div>
        <div className="p-5 md:p-6">
          <dt className="text-xs font-semibold uppercase tracking-wider text-foreground-500">Estimated amount you pay</dt>
          <dd className="mt-2 text-2xl font-semibold text-primary-800">{formatGbp(estimate.totalPayableGbp)}</dd>
        </div>
      </dl>
      <p className="border-t border-background-300 px-5 py-4 text-xs leading-5 text-foreground-500 md:px-6">
        This estimate uses the currently displayed IPC Fund contribution rates. Final module costs and IPC Fund contributions are subject to assessment, approval, available funds and written confirmation.
      </p>
    </section>
  );
}

export function ModuleSelectionStep() {
  const { register, watch, formState: { errors } } = useFormContext<BursaryApplicationFormValues>();
  const selected = watch("pathwaySelection.preferredModules") || [];
  const error = errors.pathwaySelection?.preferredModules?.message;
  return (
    <>
      <StepHeading
        title="Module Selection"
        intro="Select one or more preferred modules. Final confirmation is subject to eligibility, bursary assessment, cohort capacity and an agreed learning plan."
      />
      <fieldset>
        <legend className="mb-4 text-sm font-semibold text-background-950">Preferred modules <span className="text-primary-700">*</span></legend>
        <div className="grid gap-4 lg:grid-cols-2">
          {bursaryModules.map((module) => (
            <label key={module.value} className={`relative flex cursor-pointer items-start gap-4 border p-5 transition hover:border-primary-500 ${selected.includes(module.value) ? "border-primary-600 bg-primary-50 shadow-sm" : "border-background-300 bg-white"}`}>
              <input
                type="checkbox"
                value={module.value}
                className="mt-1 h-5 w-5 shrink-0 accent-[oklch(var(--primary-600))]"
                {...register("pathwaySelection.preferredModules")}
              />
              <span>
                <strong className="block text-lg text-background-950">{module.title}</strong>
                <span className="mt-1 block text-xs font-semibold uppercase tracking-wide text-primary-800">{module.meta}</span>
                <span className="mt-4 block text-sm leading-6 text-foreground-600">{module.description}</span>
              </span>
            </label>
          ))}
        </div>
        {error && <p role="alert" className="mt-2 text-xs font-medium text-red-700">{error}</p>}
      </fieldset>
      <FundingEstimate selectedModules={selected} />
    </>
  );
}

const mandatoryConsentCopy = [
  "I confirm that I have read and accept the IPC Learner Terms & Conditions (Version 4.3, effective 06 August 2026).",
  "I also accept the bursary participation terms: sharing an award and progress update where appropriate, mentioning IPC, allowing IPC to reshare approved content, taking part only where mutually agreed, permitting agreed use of approved programme content, and promptly telling IPC about any privacy, accessibility, employer or other adjustment I may need.",
].join(" ");

export function TermsAndConsentsStep() {
  return (
    <>
      <StepHeading
        title="Mandatory Terms and Consents"
        intro="Read the IPC Learner Terms & Conditions and review the bursary participation commitments before accepting."
      >
        <Callout><strong>Your comfort matters.</strong> Any participation or content use will be handled in an agreed context. If you need a privacy, accessibility, employer or other adjustment, tell IPC so a suitable approach can be agreed with you.</Callout>
      </StepHeading>
      <fieldset className="border border-background-300 bg-white p-4 text-sm">
        <legend className="sr-only">Mandatory bursary terms</legend>
        <section
          aria-labelledby="learner-terms-document-title"
          className="mb-3 flex flex-col gap-4 border border-background-300 bg-background-100 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 items-start gap-3">
            <FileText className="mt-0.5 shrink-0 text-primary-800" size={22} aria-hidden="true" />
            <div>
              <h3 id="learner-terms-document-title" className="font-semibold text-background-950">
                IPC Learner Terms &amp; Conditions
              </h3>
              <p className="mt-1 text-xs leading-5 text-foreground-600">
                Version 4.3 - Effective 06 August 2026 - PDF, 10 pages
              </p>
            </div>
          </div>
          <a
            href={learnerTermsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 border border-primary-700 px-4 py-2.5 text-xs font-semibold text-primary-800 transition hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            Open and read the terms
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </section>
        <ConsentCheckbox
          name="termsAndConsents.mandatoryTermsAccepted"
          title="Accept the learner terms and mandatory bursary commitments"
          copy={mandatoryConsentCopy}
        />
      </fieldset>
    </>
  );
}

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
    <section className="border border-background-300 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-background-950">{title}</h3>
          <p className={`mt-1 text-xs font-semibold ${valid ? "text-emerald-700" : "text-red-700"}`}>{valid ? "Technically valid" : "Needs attention"}</p>
        </div>
        <button type="button" onClick={onEdit} className="border border-background-300 px-3 py-2 text-xs font-semibold hover:border-primary-500 hover:bg-primary-50">Edit</button>
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
  const { register, watch } = useFormContext<BursaryApplicationFormValues>();
  const values = watch();
  const birthYear = values.personalDetails.dateOfBirth.slice(0, 4);
  return (
    <>
      <StepHeading
        title="Review and Declaration"
        intro="Review Sections 1 to 5, then sign and submit your application."
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
        <ReviewCard title="3. Emergency Contact and Identification" valid={completedSteps.has(2)} onEdit={() => onEdit(2)}>
          <p><strong>{values.emergencyInformation.emergencyContactFullName || "Not provided"}</strong></p>
          <p>Identity and applicant photo: provided for secure IPC review.</p>
          <p>Support needs declared: {values.emergencyInformation.hasDisabilityOrHealthCondition ? "Yes" : "No"}</p>
        </ReviewCard>
        <ReviewCard title="4. Module Selection" valid={completedSteps.has(3)} onEdit={() => onEdit(3)}>
          <p><strong>{values.pathwaySelection.preferredModules.map((value) => moduleLabels[value]).filter(Boolean).join(", ") || "Not selected"}</strong></p>
        </ReviewCard>
        <ReviewCard title="5. Mandatory Terms and Consents" valid={completedSteps.has(4)} onEdit={() => onEdit(4)}>
          <p>All mandatory bursary terms accepted.</p>
        </ReviewCard>
      </div>
      <div className="mt-8">
        <label htmlFor="bursary-date-signed-display" className="mb-2 block text-sm font-semibold text-background-950">
          Date signed <span className="text-primary-700" aria-hidden="true">*</span>
        </label>
        <input type="hidden" {...register("reviewAndDeclaration.dateSigned")} />
        <input
          id="bursary-date-signed-display"
          type="date"
          value={values.reviewAndDeclaration.dateSigned}
          disabled
          className="min-h-12 w-full border border-background-300 bg-background-100 px-4 py-3 text-sm text-background-700 disabled:cursor-not-allowed disabled:opacity-100 md:max-w-md"
        />
        <p className="mt-1.5 text-xs leading-5 text-foreground-500">Set automatically from your device.</p>
      </div>
      <SignaturePad />
      <p className="mt-6 text-xs leading-5 text-foreground-500">
        LinkedIn links open externally. IPC will only use the submitted information for the stated application purposes.{" "}
        <a href="/privacy" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary-800 underline">
          Privacy information <ExternalLink size={12} />
        </a>
      </p>
    </>
  );
}
