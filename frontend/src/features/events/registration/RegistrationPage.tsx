import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check, LoaderCircle, Minus, Plus, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/features/auth/AuthContext";
import { notifications } from "@/lib/notifications";
import { clearRegistrationSession, idempotencyKey, registrationApi } from "./api";
import type { RegistrationEvent, RegistrationPayload, RegistrationPerson } from "./types";

const personSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(80),
  last_name: z.string().trim().min(1, "Last name is required").max(80),
  email: z.email("Enter a valid email address"),
  mobile: z.string().trim().refine((value) => !value || /^[+()\d\s-]{7,20}$/.test(value), "Enter a valid mobile number"),
  company: z.string().trim().max(180),
  job_title: z.string().trim().max(160),
  city: z.string().trim().max(120),
  dietary_access_needs: z.string().trim().max(1000).optional(),
});

const formSchema = z.object({
  quantity: z.number().int().min(1),
  contact: personSchema,
  attendees: z.array(personSchema).min(1),
  answers: z.record(z.string(), z.union([z.string(), z.boolean(), z.array(z.string())])),
  marketing_consent: z.boolean(),
  terms_accepted: z.boolean().refine(Boolean, "You must accept the registration terms"),
});
type FormValues = z.infer<typeof formSchema>;

const blankPerson = (): RegistrationPerson => ({ first_name: "", last_name: "", email: "", mobile: "", company: "", job_title: "", city: "", dietary_access_needs: "" });
const fieldClass = "mt-2 h-12 w-full rounded-lg border border-background-300 bg-white px-4 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100";

// Kept local so all steps share the exact same accessible field styling.
function TextField({ label, error, optional, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; optional?: boolean }) {
  return <label className="block text-sm font-semibold text-background-900">{label}{optional && <span className="ml-1 font-normal text-foreground-500">(optional)</span>}<input {...props} className={`${fieldClass} ${error ? "border-red-500" : ""}`} aria-invalid={Boolean(error)} />{error && <span className="mt-1 block text-xs text-red-700">{error}</span>}</label>;
}

export default function RegistrationPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<RegistrationEvent | null>(null);
  const [loadError, setLoadError] = useState("");
  const [step, setStep] = useState(0);
  const [copyBuyer, setCopyBuyer] = useState(false);
  const submitting = useRef(false);
  const draftKey = `ipc:event-registration:${slug}:draft`;
  const saved = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem(draftKey) || "null") as Partial<FormValues> | null; } catch { return null; }
  }, [draftKey]);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      quantity: saved?.quantity || 1,
      contact: saved?.contact || { ...blankPerson(), first_name: user?.first_name || "", last_name: user?.last_name || "", email: user?.email || "" },
      attendees: saved?.attendees?.length ? saved.attendees : [blankPerson()],
      answers: saved?.answers || {}, marketing_consent: saved?.marketing_consent || false, terms_accepted: false,
    },
  });
  const { control, register, watch, setValue, getValues, trigger, handleSubmit, formState: { errors, isDirty, isSubmitting } } = form;
  const attendees = useFieldArray({ control, name: "attendees" });
  const quantity = watch("quantity");

  useEffect(() => { registrationApi.config(slug).then(setEvent).catch((reason: unknown) => setLoadError(reason instanceof Error ? reason.message : "Could not load registration.")); }, [slug]);
  useEffect(() => {
    while (attendees.fields.length < quantity) attendees.append(blankPerson());
    while (attendees.fields.length > quantity) attendees.remove(attendees.fields.length - 1);
  }, [quantity, attendees]);
  useEffect(() => {
    const subscription = watch((value) => sessionStorage.setItem(draftKey, JSON.stringify(value)));
    return () => subscription.unsubscribe();
  }, [draftKey, watch]);
  useEffect(() => {
    const warning = (event: BeforeUnloadEvent) => { if (isDirty && !submitting.current) event.preventDefault(); };
    window.addEventListener("beforeunload", warning);
    return () => window.removeEventListener("beforeunload", warning);
  }, [isDirty]);
  useEffect(() => {
    if (copyBuyer) setValue("attendees.0", { ...getValues("contact"), dietary_access_needs: getValues("attendees.0.dietary_access_needs") || "" }, { shouldValidate: true });
  }, [copyBuyer, getValues, setValue]);

  const maximum = event ? Math.max(1, Math.min(event.max_tickets_per_registration, event.available_places ?? event.max_tickets_per_registration)) : 1;
  const steps = ["Tickets", "Your details", "Attendees", "Review"];
  const next = async () => {
    let valid = true;
    if (step === 0) valid = await trigger("quantity");
    if (step === 1) valid = await trigger("contact");
    if (step === 2) {
      valid = await trigger("attendees");
      const answers = getValues("answers");
      const missing = event?.questions.find((question) => question.is_required && !answers[String(question.id)]);
      if (missing) { notifications.error(`${missing.label} is required.`); valid = false; }
    }
    if (valid) setStep((current) => Math.min(current + 1, 3));
  };
  const submit = handleSubmit(async (values) => {
    if (submitting.current) return;
    submitting.current = true;
    try {
      const payload: RegistrationPayload = {
        ...values,
        answers: Object.entries(values.answers).map(([questionId, value]) => ({ question_id: Number(questionId), value })),
      };
      const record = await registrationApi.create(slug, payload, idempotencyKey(slug));
      clearRegistrationSession(slug);
      navigate(`/events/registration/${record.reference}/confirmed?token=${encodeURIComponent(record.access_token || "")}`, { replace: true });
    } catch (reason) {
      notifications.error(reason instanceof Error ? reason.message : "Registration could not be completed.");
      submitting.current = false;
    }
  });

  if (loadError) return <div className="container-content py-24 text-center"><h1 className="font-heading text-3xl font-bold">Registration unavailable</h1><p className="mt-3">{loadError}</p><Link to="/events" className="btn-primary mt-6 inline-flex">Back to events</Link></div>;
  if (!event) return <div className="container-content grid min-h-[55vh] place-items-center"><LoaderCircle className="animate-spin text-primary-600" size={38}/></div>;
  if (!event.registration_is_open || event.eventbrite_id) return <div className="container-content py-24 text-center"><h1 className="font-heading text-3xl font-bold">Registration unavailable</h1><p className="mt-3 text-foreground-600">{event.registration_closed_reason}</p><Link to={`/events/${event.slug}`} className="btn-primary mt-6 inline-flex">View event</Link></div>;

  const renderPerson = (prefix: "contact" | `attendees.${number}`, includeNeeds = false) => {
    const pathError = prefix === "contact" ? errors.contact : errors.attendees?.[Number(prefix.split(".")[1])];
    return <div className="grid gap-5 md:grid-cols-2">
      <TextField label="First name" autoComplete="given-name" {...register(`${prefix}.first_name`)} error={pathError?.first_name?.message}/>
      <TextField label="Last name" autoComplete="family-name" {...register(`${prefix}.last_name`)} error={pathError?.last_name?.message}/>
      <TextField label="Email address" type="email" autoComplete="email" {...register(`${prefix}.email`)} error={pathError?.email?.message}/>
      <TextField label="Mobile" optional autoComplete="tel" {...register(`${prefix}.mobile`)} error={pathError?.mobile?.message}/>
      <TextField label="Company" optional autoComplete="organization" {...register(`${prefix}.company`)} error={pathError?.company?.message}/>
      <TextField label="Job title" optional {...register(`${prefix}.job_title`)} error={pathError?.job_title?.message}/>
      <TextField label="City" optional autoComplete="address-level2" {...register(`${prefix}.city`)} error={pathError?.city?.message}/>
      {includeNeeds && <label className="block text-sm font-semibold md:col-span-2">Dietary or accessibility needs <span className="font-normal text-foreground-500">(optional)</span><textarea {...register(`${prefix}.dietary_access_needs`)} className="mt-2 min-h-24 w-full rounded-lg border border-background-300 p-4 text-sm outline-none focus:border-primary-500" /></label>}
    </div>;
  };

  const renderQuestion = (question: RegistrationEvent["questions"][number]) => {
    const name = `answers.${question.id}` as const;
    if (question.question_type === "long_text") return <textarea {...register(name)} className="mt-2 min-h-24 w-full rounded-lg border p-3" />;
    if (question.question_type === "select" || question.question_type === "yes_no") {
      const options = question.question_type === "yes_no" ? ["Yes", "No"] : question.options;
      return <select {...register(name)} className={fieldClass}><option value="">Select</option>{options.map((option) => <option key={option}>{option}</option>)}</select>;
    }
    if (question.question_type === "radio") return <span className="mt-3 flex flex-wrap gap-4">{question.options.map((option) => <label key={option} className="flex items-center gap-2 font-normal"><input type="radio" value={option} {...register(name)} className="accent-primary-600" />{option}</label>)}</span>;
    if (question.question_type === "checkbox") return <span className="mt-3 flex flex-wrap gap-4">{question.options.map((option) => <label key={option} className="flex items-center gap-2 font-normal"><input type="checkbox" value={option} {...register(name)} className="accent-primary-600" />{option}</label>)}</span>;
    return <input {...register(name)} className={fieldClass} />;
  };

  return <div className="bg-background-50 py-10 md:py-16"><main className="container-content">
    <Link to={`/events/${event.slug}`} className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-foreground-700"><ArrowLeft size={16}/> Back to event</Link>
    <div className="mb-8"><p className="eyebrow text-primary-700">Secure registration</p><h1 className="mt-2 font-heading text-3xl font-bold md:text-5xl">{event.title}</h1></div>
    <ol className="mb-8 grid grid-cols-4 gap-2" aria-label="Registration progress">{steps.map((label, index) => <li key={label} className={`border-t-4 pt-3 text-xs font-bold ${index <= step ? "border-primary-500 text-background-950" : "border-background-200 text-foreground-400"}`}><span className="hidden sm:inline">{index + 1}. </span>{label}</li>)}</ol>
    <form onSubmit={submit} className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="border border-background-200 bg-white p-6 shadow-lg md:p-9">
        {step === 0 && <div><h2 className="font-heading text-2xl font-bold">Select tickets</h2><p className="mt-2 text-sm text-foreground-600">{event.registration_description || "Choose the number of people attending."}</p><div className="mt-7 flex items-center justify-between rounded-xl border border-background-200 p-5"><div><p className="font-bold">{event.registration_title}</p><p className="mt-1 text-sm text-foreground-500">Free</p></div><div className="flex items-center gap-4"><button type="button" onClick={() => setValue("quantity", Math.max(1, quantity - 1))} disabled={quantity <= 1} className="grid h-10 w-10 place-items-center rounded-full border disabled:opacity-40" aria-label="Remove ticket"><Minus size={17}/></button><strong aria-live="polite">{quantity}</strong><button type="button" onClick={() => setValue("quantity", Math.min(maximum, quantity + 1))} disabled={quantity >= maximum} className="grid h-10 w-10 place-items-center rounded-full border disabled:opacity-40" aria-label="Add ticket"><Plus size={17}/></button></div></div>{event.available_places !== null && <p className="mt-3 text-xs text-foreground-500">{event.available_places} place(s) currently available</p>}</div>}
        {step === 1 && <div><h2 className="font-heading text-2xl font-bold">Your details</h2><p className="mb-7 mt-2 text-sm text-foreground-600">We’ll send the confirmation and event updates to this contact.</p>{renderPerson("contact")}</div>}
        {step === 2 && <div><h2 className="font-heading text-2xl font-bold">Attendee details</h2><label className="my-6 flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={copyBuyer} onChange={(event) => setCopyBuyer(event.target.checked)} className="h-4 w-4 accent-primary-600"/> Attendee 1 is the booking contact</label><div className="space-y-9">{attendees.fields.map((field, index) => <fieldset key={field.id} className="border-t border-background-200 pt-6"><legend className="mb-5 font-heading text-lg font-bold">Attendee {index + 1}</legend>{renderPerson(`attendees.${index}`, true)}</fieldset>)}</div>{event.questions.length > 0 && <div className="mt-9 border-t border-background-200 pt-7"><h3 className="font-heading text-xl font-bold">Additional questions</h3><div className="mt-5 space-y-5">{event.questions.map((question) => <label key={question.id} className="block text-sm font-semibold">{question.label}{question.is_required && <span className="text-red-700"> *</span>}{question.help_text && <span className="mt-1 block text-xs font-normal text-foreground-500">{question.help_text}</span>}{renderQuestion(question)}</label>)}</div></div>}</div>}
        {step === 3 && <div><h2 className="font-heading text-2xl font-bold">Review registration</h2><div className="mt-6 divide-y divide-background-200 rounded-xl bg-background-100 px-5"><div className="flex justify-between py-4"><span>Ticket</span><strong>{event.registration_title} × {quantity}</strong></div><div className="flex justify-between py-4"><span>Contact</span><strong>{getValues("contact.first_name")} {getValues("contact.last_name")}</strong></div><div className="flex justify-between py-4"><span>Total</span><strong>Free</strong></div></div><label className="mt-7 flex items-start gap-3 text-sm"><input type="checkbox" {...register("terms_accepted")} className="mt-1 h-4 w-4 accent-primary-600"/><span>I confirm these details are correct and accept the IPC registration terms and privacy policy.</span></label>{errors.terms_accepted && <p className="ml-7 mt-1 text-xs text-red-700">{errors.terms_accepted.message}</p>}<label className="mt-4 flex items-start gap-3 text-sm"><input type="checkbox" {...register("marketing_consent")} className="mt-1 h-4 w-4 accent-primary-600"/><span>Send me optional news about future IPC events. You can unsubscribe at any time.</span></label><div className="mt-7 flex gap-3 rounded-lg border border-background-200 p-4 text-xs text-foreground-600"><ShieldCheck className="shrink-0 text-primary-700" size={20}/> Your registration is submitted securely. We do not collect payment details for this free event.</div></div>}
        <div className="mt-9 flex justify-between border-t border-background-200 pt-6"><button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0 || isSubmitting} className="inline-flex items-center gap-2 px-4 py-3 text-sm font-bold disabled:opacity-30"><ArrowLeft size={17}/> Back</button>{step < 3 ? <button type="button" onClick={next} className="btn-primary inline-flex items-center gap-2">Continue <ArrowRight size={17}/></button> : <button type="submit" disabled={isSubmitting} className="btn-primary inline-flex min-w-44 items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? <><LoaderCircle className="animate-spin" size={18}/> Confirming…</> : <><Check size={18}/> Confirm registration</>}</button>}</div>
      </section>
      <aside className="border border-background-200 bg-background-950 p-6 text-background-50 shadow-xl lg:sticky lg:top-24"><p className="eyebrow text-primary-400">Order summary</p><h2 className="mt-3 font-heading text-xl font-bold">{event.title}</h2><div className="my-6 border-y border-background-800 py-5 text-sm"><p className="flex justify-between"><span>{event.registration_title}</span><strong>× {quantity}</strong></p><p className="mt-3 flex justify-between text-background-300"><span>Total</span><strong className="text-background-50">Free</strong></p></div><p className="text-xs leading-5 text-background-400">Your place is reserved only after the final confirmation succeeds.</p></aside>
    </form>
  </main></div>;
}
