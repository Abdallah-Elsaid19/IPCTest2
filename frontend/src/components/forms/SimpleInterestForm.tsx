import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { apiJson } from "@/lib/api";
import {
  createSimpleInterestSchema,
  type SimpleInterestFormData,
  type SimpleInterestType,
} from "@/lib/validations/simpleInterestSchemas";

const inputClass = "w-full border bg-background-50 px-4 py-3 text-sm text-background-950 focus:border-primary-500 focus:outline-none";
const errorClass = "mt-1 text-xs text-red-700";

interface AwardProgrammeOption {
  id: number;
  title: string;
}

export function SimpleInterestForm({ type }: { type: SimpleInterestType }) {
  const [submission, setSubmission] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [awardProgrammes, setAwardProgrammes] = useState<AwardProgrammeOption[]>([]);
  const [areProgrammesLoading, setAreProgrammesLoading] = useState(type === "awards");
  const [programmesError, setProgrammesError] = useState("");
  const schema = useMemo(() => createSimpleInterestSchema(type), [type]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SimpleInterestFormData>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      category: "",
      event_name: "",
      event_type: "London Master Class",
      organisation: "",
      programme: "",
      interest_type: "General",
      message: "",
      dietary_access_needs: "",
      consent: true,
    },
  });

  useEffect(() => {
    if (type !== "awards") return;
    const controller = new AbortController();
    setAreProgrammesLoading(true);
    setProgrammesError("");
    apiJson<AwardProgrammeOption[]>("/api/award-programmes", undefined, {
      signal: controller.signal,
    })
      .then(setAwardProgrammes)
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setProgrammesError(
          error instanceof Error ? error.message : "Award programmes could not be loaded.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setAreProgrammesLoading(false);
      });
    return () => controller.abort();
  }, [type]);

  async function onSubmit(data: SimpleInterestFormData) {
    setSubmission(null);
    try {
      if (type === "contact") {
        await apiJson("/api/contact", { name: data.name, email: data.email, category: data.category, message: data.message });
      }
      if (type === "event") {
        await apiJson("/api/events/register", {
          name: data.name,
          email: data.email,
          event_name: data.event_name,
          event_type: data.event_type,
          organisation: data.organisation,
          dietary_access_needs: data.dietary_access_needs,
        });
      }
      if (type === "awards") {
        await apiJson("/api/awards/interest", {
          name: data.name,
          email: data.email,
          programme: Number(data.programme),
          interest_type: data.interest_type,
          message: data.message,
        });
      }
      if (type === "newsletter") {
        await apiJson("/api/newsletter", { email: data.email, consent: true, source: "website_footer" });
      }
      setSubmission({ type: "success", message: "Thank you. Your submission has been received." });
      reset();
    } catch (error) {
      setSubmission({ type: "error", message: error instanceof Error ? error.message : "Submission failed. Please try again." });
    }
  }

  const errorBorder = (name: keyof SimpleInterestFormData) => errors[name] ? "border-red-500" : "border-background-300";

  if (type === "newsletter") {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2" noValidate>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            aria-label="Email for newsletter"
            placeholder="Email address"
            className={`${inputClass} ${errorBorder("email")}`}
            {...register("email")}
          />
          <button type="submit" disabled={isSubmitting} className="btn-primary px-5 py-3 disabled:cursor-wait disabled:opacity-60">
            {isSubmitting ? "Signing up..." : "Sign up"}
          </button>
        </div>
        {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        {submission && <p role="status" className={`text-xs ${submission.type === "error" ? "text-red-400" : "text-background-400"}`}>{submission.message}</p>}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 md:grid-cols-2" noValidate>
      <div>
        <input placeholder="Name" className={`${inputClass} ${errorBorder("name")}`} aria-label="Name" {...register("name")} />
        {errors.name && <p className={errorClass}>{errors.name.message}</p>}
      </div>
      <div>
        <input type="email" placeholder="Email" className={`${inputClass} ${errorBorder("email")}`} aria-label="Email" {...register("email")} />
        {errors.email && <p className={errorClass}>{errors.email.message}</p>}
      </div>

      {type === "contact" && (
        <div>
          <input placeholder="Enquiry category" className={`${inputClass} ${errorBorder("category")}`} aria-label="Enquiry category" {...register("category")} />
          {errors.category && <p className={errorClass}>{errors.category.message}</p>}
        </div>
      )}

      {type === "event" && (
        <>
          <div>
            <input placeholder="Event name" className={`${inputClass} ${errorBorder("event_name")}`} aria-label="Event name" {...register("event_name")} />
            {errors.event_name && <p className={errorClass}>{errors.event_name.message}</p>}
          </div>
          <div>
            <select className={`${inputClass} ${errorBorder("event_type")}`} aria-label="Event type" {...register("event_type")}>
              <option>London Master Class</option><option>Regional Club</option><option>Other</option>
            </select>
            {errors.event_type && <p className={errorClass}>{errors.event_type.message}</p>}
          </div>
          <div>
            <input placeholder="Organisation" className={`${inputClass} ${errorBorder("organisation")}`} aria-label="Organisation" {...register("organisation")} />
            {errors.organisation && <p className={errorClass}>{errors.organisation.message}</p>}
          </div>
        </>
      )}

      {type === "awards" && (
        <>
          <div>
            <label htmlFor="award-programme" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-foreground-600">
              Award programme
            </label>
            <select
              id="award-programme"
              className={`${inputClass} ${errorBorder("programme")}`}
              disabled={areProgrammesLoading || Boolean(programmesError) || awardProgrammes.length === 0}
              {...register("programme")}
            >
              <option value="">
                {areProgrammesLoading
                  ? "Loading award programmes..."
                  : awardProgrammes.length
                    ? "Select an award programme"
                    : "No award programmes available"}
              </option>
              {awardProgrammes.map((programme) => (
                <option key={programme.id} value={programme.id}>
                  {programme.title}
                </option>
              ))}
            </select>
            {errors.programme && <p className={errorClass}>{errors.programme.message}</p>}
            {programmesError && <p role="alert" className={errorClass}>{programmesError}</p>}
          </div>
          <div>
            <label htmlFor="award-interest-type" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-foreground-600">
              Enquiry type
            </label>
            <select id="award-interest-type" className={`${inputClass} ${errorBorder("interest_type")}`} {...register("interest_type")}>
              <option>Nominate</option><option>Sponsor</option><option>Judge</option><option>General</option>
            </select>
            {errors.interest_type && <p className={errorClass}>{errors.interest_type.message}</p>}
          </div>
        </>
      )}

      <div className="md:col-span-2">
        <textarea
          placeholder={type === "event" ? "Access or dietary needs" : "Message"}
          rows={4}
          className={`${inputClass} ${errorBorder(type === "event" ? "dietary_access_needs" : "message")}`}
          aria-label={type === "event" ? "Access or dietary needs" : "Message"}
          {...register(type === "event" ? "dietary_access_needs" : "message")}
        />
        {type === "event" && errors.dietary_access_needs && <p className={errorClass}>{errors.dietary_access_needs.message}</p>}
        {type !== "event" && errors.message && <p className={errorClass}>{errors.message.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting || (type === "awards" && (areProgrammesLoading || Boolean(programmesError) || awardProgrammes.length === 0))} className="btn-primary px-6 py-3 disabled:cursor-wait disabled:opacity-60 md:col-span-2">
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
      {submission && <p role="status" className={`text-sm md:col-span-2 ${submission.type === "error" ? "text-red-700" : "text-accent-700"}`}>{submission.message}</p>}
    </form>
  );
}
