import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, LoaderCircle, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type {
  AdminEvent,
  AdminEventPayload,
} from "@/features/admin/types";

const optionalUrl = z.string().trim().refine(
  (value) => !value || /^https?:\/\//i.test(value),
  "Enter a complete http:// or https:// URL.",
);

const schema = z.object({
  title: z.string().trim().min(2, "Title is required.").max(220),
  slug: z.string().trim().min(2, "Slug is required.").max(240)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only."),
  event_type: z.enum(["london_master_class", "regional_club", "other"]),
  description: z.string().trim(),
  location: z.string().trim().max(220),
  region: z.string().trim().max(120),
  venue_name: z.string().trim().max(220),
  starts_at: z.string(),
  ends_at: z.string(),
  capacity: z.string().refine(
    (value) => value === "" || (/^\d+$/.test(value) && Number(value) >= 0),
    "Capacity must be a positive whole number.",
  ),
  image_url: optionalUrl,
  eventbrite_id: z.string().trim().max(64),
  eventbrite_url: optionalUrl,
  status: z.string().trim().max(32),
  is_online_event: z.boolean(),
  is_featured: z.boolean(),
  is_published: z.boolean(),
  registration_title: z.string().trim().min(2).max(120),
  registration_description: z.string().trim().max(1000),
  registration_opens_at: z.string(),
  registration_closes_at: z.string(),
  max_tickets_per_registration: z.string().refine(
    (value) => /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 20,
    "Enter a whole number from 1 to 20.",
  ),
  timezone: z.string().trim().min(1).max(64),
}).refine(
  (values) => !values.starts_at || !values.ends_at || new Date(values.ends_at) >= new Date(values.starts_at),
  { path: ["ends_at"], message: "End date must be after the start date." },
);

type FormValues = z.infer<typeof schema>;

const emptyValues: FormValues = {
  title: "",
  slug: "",
  event_type: "other",
  description: "",
  location: "",
  region: "",
  venue_name: "",
  starts_at: "",
  ends_at: "",
  capacity: "",
  image_url: "",
  eventbrite_id: "",
  eventbrite_url: "",
  status: "",
  is_online_event: false,
  is_featured: false,
  is_published: false,
  registration_title: "Event registration",
  registration_description: "",
  registration_opens_at: "",
  registration_closes_at: "",
  max_tickets_per_registration: "4",
  timezone: "Europe/London",
};

const toLocalDateTime = (value: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const slugify = (value: string) => value
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "")
  .slice(0, 240);

export default function EventFormModal({
  event,
  open,
  isSaving,
  onClose,
  onSave,
}: {
  event: AdminEvent | null;
  open: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (payload: AdminEventPayload) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, dirtyFields },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  });
  const title = watch("title");
  const imageUrl = watch("image_url");

  useEffect(() => {
    if (!open) return;
    reset(event ? {
      title: event.title,
      slug: event.slug,
      event_type: event.event_type,
      description: event.description,
      location: event.location,
      region: event.region,
      venue_name: event.venue_name,
      starts_at: toLocalDateTime(event.starts_at),
      ends_at: toLocalDateTime(event.ends_at),
      capacity: event.capacity === null ? "" : String(event.capacity),
      image_url: event.image_url,
      eventbrite_id: event.eventbrite_id || "",
      eventbrite_url: event.eventbrite_url,
      status: event.status,
      is_online_event: event.is_online_event,
      is_featured: event.is_featured,
      is_published: event.is_published,
      registration_title: event.registration_title || "Event registration",
      registration_description: event.registration_description || "",
      registration_opens_at: toLocalDateTime(event.registration_opens_at || null),
      registration_closes_at: toLocalDateTime(event.registration_closes_at || null),
      max_tickets_per_registration: String(event.max_tickets_per_registration || 4),
      timezone: event.timezone || "Europe/London",
    } : emptyValues);
  }, [event, open, reset]);

  useEffect(() => {
    if (open && !event && !dirtyFields.slug) {
      setValue("slug", slugify(title), { shouldValidate: false });
    }
  }, [dirtyFields.slug, event, open, setValue, title]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape" && !isSaving) onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isSaving, onClose, open]);

  if (!open) return null;

  const submit = (values: FormValues) => onSave({
    ...values,
    starts_at: values.starts_at ? new Date(values.starts_at).toISOString() : null,
    ends_at: values.ends_at ? new Date(values.ends_at).toISOString() : null,
    capacity: values.capacity === "" ? null : Number(values.capacity),
    eventbrite_id: values.eventbrite_id || null,
    registration_opens_at: values.registration_opens_at ? new Date(values.registration_opens_at).toISOString() : null,
    registration_closes_at: values.registration_closes_at ? new Date(values.registration_closes_at).toISOString() : null,
    max_tickets_per_registration: Number(values.max_tickets_per_registration),
  });

  const inputClass = "mt-2 h-11 w-full rounded-xl border border-[#D9CDBE] bg-white px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15";
  const labelClass = "text-xs font-bold uppercase tracking-wide text-[#655D55]";
  const errorText = (message?: string) => message && (
    <span className="mt-1 block text-[11px] normal-case text-red-600">{message}</span>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 p-4 py-8" role="dialog" aria-modal="true">
      <form onSubmit={handleSubmit(submit)} className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/80 bg-[#FFFDF9] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[#E6DCCE] bg-[#FFFDF9] px-6 py-5">
          <div>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-primary-800">Events</p>
            <h2 className="mt-1 text-xl font-black text-[#171411]">{event ? "Edit event" : "Create event"}</h2>
          </div>
          <button type="button" onClick={onClose} disabled={isSaving} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-[#F1E8DC] disabled:opacity-50" aria-label="Close event form"><X size={18} /></button>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          <label className={labelClass}>Title<input autoFocus {...register("title")} className={inputClass} />{errorText(errors.title?.message)}</label>
          <label className={labelClass}>Slug<input {...register("slug")} className={inputClass} />{errorText(errors.slug?.message)}</label>
          <label className={labelClass}>Event type<select {...register("event_type")} className={inputClass}><option value="london_master_class">London Master Class</option><option value="regional_club">Regional Club</option><option value="other">Other</option></select>{errorText(errors.event_type?.message)}</label>
          <label className={labelClass}>Status<input {...register("status")} placeholder="live, draft, completed..." className={inputClass} />{errorText(errors.status?.message)}</label>
          <label className={`${labelClass} md:col-span-2`}>Description<textarea {...register("description")} rows={5} className={`${inputClass} h-auto resize-y py-3`} />{errorText(errors.description?.message)}</label>
          <label className={labelClass}>Location<input {...register("location")} className={inputClass} />{errorText(errors.location?.message)}</label>
          <label className={labelClass}>Region<input {...register("region")} className={inputClass} />{errorText(errors.region?.message)}</label>
          <label className={labelClass}>Venue name<input {...register("venue_name")} className={inputClass} />{errorText(errors.venue_name?.message)}</label>
          <label className={labelClass}>Capacity<input type="number" min="0" {...register("capacity")} className={inputClass} />{errorText(errors.capacity?.message)}</label>
          <label className={labelClass}>Starts at<input type="datetime-local" {...register("starts_at")} className={inputClass} />{errorText(errors.starts_at?.message)}</label>
          <label className={labelClass}>Ends at<input type="datetime-local" {...register("ends_at")} className={inputClass} />{errorText(errors.ends_at?.message)}</label>
          <div className="border-t border-[#E3D8CA] pt-5 md:col-span-2"><h3 className="text-sm font-black text-[#171411]">Local registration settings</h3><p className="mt-1 text-xs text-[#766C62]">Used only for IPC-created events. Eventbrite registrations remain external.</p></div>
          <label className={labelClass}>Ticket label<input {...register("registration_title")} className={inputClass} />{errorText(errors.registration_title?.message)}</label>
          <label className={labelClass}>Maximum tickets per order<input type="number" min="1" max="20" {...register("max_tickets_per_registration")} className={inputClass} />{errorText(errors.max_tickets_per_registration?.message)}</label>
          <label className={`${labelClass} md:col-span-2`}>Registration description<textarea {...register("registration_description")} rows={3} className={`${inputClass} h-auto resize-y py-3`} />{errorText(errors.registration_description?.message)}</label>
          <label className={labelClass}>Registration opens<input type="datetime-local" {...register("registration_opens_at")} className={inputClass} />{errorText(errors.registration_opens_at?.message)}</label>
          <label className={labelClass}>Registration closes<input type="datetime-local" {...register("registration_closes_at")} className={inputClass} />{errorText(errors.registration_closes_at?.message)}</label>
          <label className={labelClass}>Timezone<input {...register("timezone")} className={inputClass} />{errorText(errors.timezone?.message)}</label>
          <label className={`${labelClass} md:col-span-2`}>Image URL<input type="url" {...register("image_url")} className={inputClass} />{errorText(errors.image_url?.message)}</label>
          {imageUrl ? <img src={imageUrl} alt="Event preview" className="h-44 w-full rounded-xl object-cover md:col-span-2" /> : <div className="grid h-28 place-items-center rounded-xl bg-[#EEE5D9] text-[#8B8075] md:col-span-2"><ImageIcon size={24} /></div>}
          <label className={labelClass}>Eventbrite ID<input {...register("eventbrite_id")} readOnly className={`${inputClass} cursor-not-allowed bg-[#F1ECE5] text-[#8A8178]`} placeholder="Assigned only by Eventbrite sync" />{errorText(errors.eventbrite_id?.message)}</label>
          <label className={labelClass}>Eventbrite URL<input type="url" {...register("eventbrite_url")} className={inputClass} />{errorText(errors.eventbrite_url?.message)}</label>

          <div className="flex flex-wrap gap-5 rounded-xl border border-[#E3D8CA] bg-[#F7F2EB] p-4 md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" {...register("is_online_event")} className="h-4 w-4 accent-[#D79525]" /> Online event</label>
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" {...register("is_featured")} className="h-4 w-4 accent-[#D79525]" /> Featured</label>
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" {...register("is_published")} className="h-4 w-4 accent-[#D79525]" /> Published on website</label>
          </div>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-[#E6DCCE] bg-[#FFFDF9] px-6 py-4">
          <button type="button" onClick={onClose} disabled={isSaving} className="h-10 rounded-xl border border-[#D4C6B5] px-4 text-xs font-bold disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={isSaving} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary-500 px-5 text-xs font-bold text-[#0B0B0B] disabled:cursor-not-allowed disabled:opacity-60">{isSaving && <LoaderCircle size={15} className="animate-spin" />}{event ? "Save changes" : "Create event"}</button>
        </div>
      </form>
    </div>
  );
}
