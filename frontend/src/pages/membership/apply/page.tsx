import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, useParams } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, FileText, ShieldCheck, Upload } from "lucide-react";

import { createGradeApplicationSchema, type GradeApplicationData } from "@/lib/validations/gradeApplicationSchema";
import { getSelectedFile } from "@/lib/validations/uploadSchema";
import {
  getMembershipApplicationConfig,
  membershipApplicationConfigs,
  type ApplicationField,
  type GradeApplicationConfig,
} from "./membershipApplicationConfig";
import SEO from "@/components/seo/SEO";

type FormValue = string | boolean | string[];

const personalFields: ApplicationField[] = [
  { name: "first_name", label: "First name", type: "text", required: true },
  { name: "last_name", label: "Last name", type: "text", required: true },
  { name: "username", label: "Username", type: "text", required: true, placeholder: "e.g. abdoelsaid368", help: "3-30 lowercase letters, numbers, dots, underscores or hyphens." },
  { name: "email", label: "Email address", type: "email", required: true },
  { name: "phone", label: "Phone number", type: "tel", required: true },
  { name: "organisation", label: "Organisation / employer", type: "text" },
  { name: "country", label: "Country of residence", type: "text", required: true },
  { name: "contact_preference", label: "Preferred contact method", type: "select", required: true, options: ["Email", "Phone", "Either email or phone"] },
];

const steps = ["Personal Information", "Membership-Specific Information", "Documents", "Review & Submit"];

function emptyValues(config: GradeApplicationConfig): GradeApplicationData {
  const values: Record<string, unknown> = {
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone: "",
    organisation: "",
    country: "",
    contact_preference: "Email",
    website_alt: "",
  };
  config.fields.forEach((field) => {
    values[field.name] = field.type === "checkbox" ? false : field.type === "checkboxes" ? [] : "";
  });
  return values as GradeApplicationData;
}

function displayValue(value: unknown) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "Not provided";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return typeof value === "string" && value ? value : "Not provided";
}

function contactPreferenceValue(value: unknown) {
  if (value === "Phone") return "phone";
  if (value === "Either email or phone") return "either";
  return "email";
}

function responseErrorMessage(body: unknown, fallback: string) {
  if (!body || typeof body !== "object") return fallback;
  const payload = body as Record<string, unknown>;
  if (typeof payload.detail === "string") return payload.detail;
  const messages = Object.entries(payload).flatMap(([field, value]) => {
    if (Array.isArray(value)) return value.map((item) => `${field.replaceAll("_", " ")}: ${String(item)}`);
    if (value && typeof value === "object") {
      return Object.entries(value as Record<string, unknown>).map(([nested, item]) => `${nested.replaceAll("_", " ")}: ${String(item)}`);
    }
    return typeof value === "string" ? [`${field.replaceAll("_", " ")}: ${value}`] : [];
  });
  return messages[0] || fallback;
}

function Field({ field, value, error, onChange }: {
  field: ApplicationField;
  value: FormValue;
  error?: string;
  onChange: (value: FormValue) => void;
}) {
  const id = `field-${field.name}`;
  const inputClass = "w-full border bg-background-50 px-4 py-3 text-sm text-background-950 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10";
  const border = error ? "border-red-500" : "border-background-300";

  if (field.type === "checkbox") {
    return (
      <div className="md:col-span-2">
        <label htmlFor={id} className={`flex cursor-pointer items-start gap-3 border p-4 ${error ? "border-red-500 bg-red-50" : "border-background-200 bg-background-100"}`}>
          <input id={id} type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[oklch(var(--primary-500))]" />
          <span className="text-sm leading-relaxed text-foreground-700">{field.label}<span className="text-red-600"> *</span></span>
        </label>
        {error && <p className="mt-1.5 text-xs text-red-700">{error}</p>}
      </div>
    );
  }

  if (field.type === "checkboxes") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <fieldset className="md:col-span-2">
        <legend className="mb-3 text-sm font-medium text-background-950">{field.label}{field.required && <span className="text-red-600"> *</span>}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {field.options?.map((option) => (
            <label key={option} className={`flex cursor-pointer items-center gap-3 border bg-background-50 px-4 py-3 text-sm text-foreground-700 hover:border-primary-300 ${error ? "border-red-300" : "border-background-200"}`}>
              <input type="checkbox" checked={selected.includes(option)} onChange={(event) => onChange(event.target.checked ? [...selected, option] : selected.filter((item) => item !== option))} className="h-4 w-4 accent-[oklch(var(--primary-500))]" />
              {option}
            </label>
          ))}
        </div>
        {field.help && <p className="mt-2 text-xs text-foreground-500">{field.help}</p>}
        {error && <p className="mt-1.5 text-xs text-red-700">{error}</p>}
      </fieldset>
    );
  }

  return (
    <label htmlFor={id} className={field.type === "textarea" ? "md:col-span-2" : ""}>
      <span className="mb-2 block text-sm font-medium text-background-950">{field.label}{field.required && <span className="text-red-600"> *</span>}</span>
      {field.type === "textarea" ? (
        <textarea id={id} rows={field.rows || 5} maxLength={field.maxLength} value={String(value || "")} placeholder={field.placeholder} onChange={(event) => onChange(event.target.value)} className={`${inputClass} ${border} resize-y`} />
      ) : field.type === "select" ? (
        <select id={id} value={String(value || "")} onChange={(event) => onChange(event.target.value)} className={`${inputClass} ${border}`}>
          <option value="">Select an option</option>
          {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : (
        <input id={id} type={field.type} value={String(value || "")} placeholder={field.placeholder} onChange={(event) => onChange(event.target.value)} className={`${inputClass} ${border}`} />
      )}
      <div className="mt-1.5 flex items-start justify-between gap-4">
        <span className={`text-xs ${error ? "text-red-700" : "text-foreground-500"}`}>{error || field.help}</span>
        {field.maxLength && <span className="shrink-0 text-xs text-foreground-400">{String(value || "").length} / {field.maxLength}</span>}
      </div>
    </label>
  );
}

function Progress({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8" aria-label={`Step ${currentStep + 1} of 4`}>
      <div className="grid grid-cols-4">
        {steps.map((label, index) => (
          <div key={label} className="relative flex flex-col items-center px-1 text-center">
            <div className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${index <= currentStep ? "bg-primary-500 text-background-950" : "bg-background-200 text-foreground-500"}`}>
              {index < currentStep ? <Check size={17} strokeWidth={2.5} /> : index + 1}
            </div>
            <span className={`mt-2 hidden text-[11px] leading-tight sm:block ${index === currentStep ? "font-semibold text-background-950" : "text-foreground-500"}`}>{label}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-background-200"><div className="h-full bg-primary-500 transition-all duration-300" style={{ width: `${((currentStep + 1) / 4) * 100}%` }} /></div>
    </div>
  );
}

function Success({ config }: { config: GradeApplicationConfig }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center md:py-24">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-700"><ShieldCheck size={30} /></div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">Application received</p>
      <h1 className="font-heading text-3xl font-semibold text-background-950 md:text-4xl">Application submitted successfully</h1>
      <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-foreground-600">Thank you for applying for {config.title} ({config.postNominal}). Your documents were uploaded securely with your application.</p>
      <div className="mt-8 border border-background-200 bg-background-100 p-6 text-left">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-foreground-600">What happens next</h2>
        <ol className="space-y-3 text-sm text-foreground-700">
          <li>1. The membership team checks eligibility and application completeness.</li>
          <li>2. Your evidence is assessed against the IPC competence framework.</li>
          {config.discussionRequired && <li>3. The team arranges your professional discussion.</li>}
          <li>{config.discussionRequired ? "4" : "3"}. You receive the decision and feedback, normally within two to four weeks.</li>
          <li>{config.discussionRequired ? "5" : "4"}. Recognition is issued following a successful assessment.</li>
        </ol>
      </div>
      <Link to="/membership" className="mt-8 inline-flex items-center justify-center gap-2 bg-primary-500 px-6 py-3 text-sm font-semibold text-background-950 hover:bg-primary-600"><ChevronLeft size={16} /> Back to membership</Link>
    </div>
  );
}

export default function MembershipApplicationPage() {
  const { grade } = useParams();
  const config = getMembershipApplicationConfig(grade);
  const activeConfig = config || membershipApplicationConfigs.affiliate;
  const storageKey = `ipc-membership-application-${grade}`;
  const schema = useMemo(() => createGradeApplicationSchema(activeConfig), [activeConfig]);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const {
    handleSubmit,
    register,
    watch,
    setValue,
    trigger,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GradeApplicationData>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: emptyValues(activeConfig),
  });
  const values = watch();
  const allFields = useMemo(() => [...personalFields, ...activeConfig.fields], [activeConfig]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) reset({ ...emptyValues(activeConfig), ...JSON.parse(saved) });
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, [activeConfig, reset, storageKey]);

  useEffect(() => {
    const subscription = watch((currentValues) => {
      const draft = Object.fromEntries(allFields.map((field) => [field.name, currentValues[field.name]]));
      localStorage.setItem(storageKey, JSON.stringify(draft));
    });
    return () => subscription.unsubscribe();
  }, [allFields, storageKey, watch]);

  const applySeo = (
    <SEO
      title={`Apply — ${activeConfig.title}`}
      description={`Complete your ${activeConfig.title} (${activeConfig.postNominal}) membership application with the Institute of Project Controls.`}
      canonicalPath={`/membership/${grade}/apply`}
      noIndex
    />
  );

  if (!config) return <Navigate to="/membership" replace />;
  if (submitted) return <section className="min-h-[75vh] bg-background-50 pt-20">{applySeo}<Success config={config} /></section>;

  const errorFor = (name: string) => {
    const error = errors[name];
    return typeof error?.message === "string" ? error.message : undefined;
  };
  const valueFor = (name: string) => (values[name] ?? "") as FormValue;
  const updateValue = (name: string, value: FormValue) => setValue(name, value, { shouldDirty: true, shouldTouch: true });

  async function goNext() {
    const names = currentStep === 0
      ? personalFields.map((field) => field.name)
      : currentStep === 1
        ? config.fields.map((field) => field.name)
        : config.documents.map((document) => document.name);
    if (!(await trigger(names))) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setCurrentStep((step) => Math.min(step + 1, 3));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(data: GradeApplicationData) {
    setSubmitError("");
    if (data.website_alt) return;
    try {
      const gradeSpecificData = Object.fromEntries(config.fields.map((field) => [field.name, data[field.name]]));
      const payload = new FormData();
      payload.set("grade", config.gradeCode);
      payload.set("first_name", String(data.first_name));
      payload.set("last_name", String(data.last_name));
      payload.set("username", String(data.username));
      payload.set("email", String(data.email));
      payload.set("phone", String(data.phone));
      payload.set("organisation", String(data.organisation || ""));
      payload.set("country", String(data.country));
      payload.set("contact_preference", contactPreferenceValue(data.contact_preference));
      payload.set("grade_specific_data", JSON.stringify(gradeSpecificData));
      payload.set("code_of_conduct_consent", String(Boolean(data.code_of_conduct)));
      payload.set("privacy_consent", "true");
      config.documents.forEach((document) => {
        const file = getSelectedFile(data[document.name] as FileList | File | undefined);
        if (file) payload.set(document.apiField, file, file.name);
      });

      const endpoint = config.endpoint || "/api/applications";
      const response = await fetch(endpoint, { method: "POST", body: payload, headers: { Accept: "application/json" }, credentials: "include" });
      if (!response.ok) {
        let message = `Submission failed (${response.status}). Please try again.`;
        try { message = responseErrorMessage(await response.json(), message); } catch { /* Non-JSON response. */ }
        throw new Error(message);
      }
      localStorage.removeItem(storageKey);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "We could not submit your application. Please try again.");
    }
  }

  return (
    <section className="min-h-screen bg-background-50 pb-20 pt-28 md:pt-32">
      {applySeo}
      <div className="container-content max-w-4xl">
        <Progress currentStep={currentStep} />
        <div className="mb-5 bg-background-950 px-6 py-6 text-background-50 md:px-8">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-400">Membership application</p>
          <h1 className="font-heading text-2xl font-semibold">{config.title}</h1>
          <p className="mt-1 text-sm text-background-400">Post-nominal: {config.postNominal}</p>
        </div>

        <form onSubmit={handleSubmit(submit)} className="border border-background-200 bg-background-50 p-6 shadow-sm md:p-8" encType="multipart/form-data" noValidate>
          <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true"><label>Website <input type="text" tabIndex={-1} autoComplete="off" {...register("website_alt")} /></label></div>

          {currentStep === 0 && (
            <div>
              <h2 className="text-xl font-semibold text-background-950">Personal Information</h2>
              <p className="mt-2 text-sm text-foreground-600">Tell us how to identify and contact you. Fields marked * are required.</p>
              <div className="mt-7 grid gap-5 md:grid-cols-2">{personalFields.map((field) => <Field key={field.name} field={field} value={valueFor(field.name)} error={errorFor(field.name)} onChange={(value) => updateValue(field.name, value)} />)}</div>
            </div>
          )}

          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-background-950">Membership-Specific Information</h2>
              <p className="mt-2 text-sm text-foreground-600">Answer the questions below against the competence expectations for {config.postNominal}.</p>
              <div className="mt-7 grid gap-5 md:grid-cols-2">{config.fields.map((field) => <Field key={field.name} field={field} value={valueFor(field.name)} error={errorFor(field.name)} onChange={(value) => updateValue(field.name, value)} />)}</div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-background-950">Documents</h2>
              <div className="mt-4 flex gap-3 border border-primary-200 bg-primary-50 p-4 text-sm leading-relaxed text-foreground-700"><Upload className="mt-0.5 shrink-0 text-primary-700" size={19} /><p>All requested documents are required. Upload PDF, DOC or DOCX files up to 10MB each. Files are stored securely outside the application database.</p></div>
              <div className="mt-7 space-y-5">
                {config.documents.map((document) => {
                  const selected = getSelectedFile(values[document.name] as FileList | File | undefined);
                  return (
                    <div key={document.name} className={`block border bg-background-100 p-5 ${errorFor(document.name) ? "border-red-500" : "border-background-200"}`}>
                      <label>
                        <span className="mb-2 block text-sm font-medium text-background-950">{document.label} <span className="text-red-600">*</span></span>
                        <input type="file" accept=".pdf,.doc,.docx" onChange={(event) => setValue(document.name, event.target.files, { shouldDirty: true, shouldTouch: true, shouldValidate: true })} className="block w-full text-sm text-foreground-600 file:mr-4 file:border-0 file:bg-primary-100 file:px-4 file:py-2.5 file:font-medium file:text-primary-800 hover:file:bg-primary-200" />
                      </label>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span className={`text-xs ${errorFor(document.name) ? "text-red-700" : "text-foreground-500"}`}>{errorFor(document.name) || document.help}</span>
                        {selected && <button type="button" onClick={(event) => { setValue(document.name, undefined, { shouldDirty: true, shouldValidate: true }); const input = event.currentTarget.closest("div")?.parentElement?.querySelector<HTMLInputElement>('input[type="file"]'); if (input) input.value = ""; }} className="text-xs font-medium text-red-700 underline">Remove</button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-background-950">Review &amp; Submit</h2>
              <p className="mt-2 text-sm text-foreground-600">Check your information before submitting. Use Back to make any changes.</p>
              <div className="mt-7 space-y-6">
                {[{ title: "Personal Information", fields: personalFields }, { title: "Membership-Specific Information", fields: config.fields }].map((section) => (
                  <section key={section.title} className="border border-background-200">
                    <h3 className="border-b border-background-200 bg-background-100 px-5 py-3 text-sm font-semibold text-background-950">{section.title}</h3>
                    <dl className="grid gap-x-8 gap-y-4 p-5 md:grid-cols-2">{section.fields.map((field) => <div key={field.name} className={field.type === "textarea" || field.type === "checkboxes" || field.type === "checkbox" ? "md:col-span-2" : ""}><dt className="text-xs font-semibold uppercase tracking-wide text-foreground-500">{field.label}</dt><dd className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground-800">{displayValue(values[field.name])}</dd></div>)}</dl>
                  </section>
                ))}
                <section className="border border-background-200">
                  <h3 className="border-b border-background-200 bg-background-100 px-5 py-3 text-sm font-semibold text-background-950">Uploaded documents</h3>
                  <dl className="space-y-3 p-5">{config.documents.map((document) => <div key={document.name} className="flex items-start gap-3"><FileText className="mt-0.5 shrink-0 text-primary-700" size={17} /><div><dt className="text-sm font-medium text-background-950">{document.label}</dt><dd className="text-xs text-foreground-500">{getSelectedFile(values[document.name] as FileList | File | undefined)?.name || "Not selected"}</dd></div></div>)}</dl>
                </section>
              </div>
              {submitError && <div role="alert" className="mt-6 border border-red-300 bg-red-50 p-4 text-sm text-red-800">{submitError}</div>}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-background-200 pt-6">
            <button type="button" onClick={() => setCurrentStep((step) => Math.max(0, step - 1))} disabled={currentStep === 0 || isSubmitting} className="inline-flex items-center gap-2 border border-background-300 px-5 py-3 text-sm font-medium text-background-950 hover:border-primary-500 disabled:invisible"><ChevronLeft size={16} /> Back</button>
            {currentStep < 3 ? <button type="button" onClick={goNext} className="inline-flex items-center gap-2 bg-primary-500 px-6 py-3 text-sm font-semibold text-background-950 hover:bg-primary-600">{currentStep === 2 ? "Review Application" : "Continue"} <ChevronRight size={16} /></button> : <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 bg-primary-500 px-6 py-3 text-sm font-semibold text-background-950 hover:bg-primary-600 disabled:cursor-wait disabled:opacity-60">{isSubmitting ? "Submitting…" : "Submit Application"} <ChevronRight size={16} /></button>}
          </div>
          <p className="mt-5 text-center text-xs text-foreground-500">Your non-file draft is saved automatically on this device.</p>
        </form>
      </div>
    </section>
  );
}
