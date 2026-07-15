import { CalendarPlus, CheckCircle2, Mail, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { registrationApi } from "./api";
import type { RegistrationRecord } from "./types";

export default function RegistrationDetailsPage({ confirmed = false }: { confirmed?: boolean }) {
  const { reference = "" } = useParams();
  const [search] = useSearchParams();
  const token = search.get("token") || "";
  const [record, setRecord] = useState<RegistrationRecord | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { registrationApi.detail(reference, token).then(setRecord).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Registration could not be loaded.")); }, [reference, token]);

  const googleCalendar = useMemo(() => {
    if (!record?.event.starts_at) return "";
    const stamp = (value: string) => new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const start = stamp(record.event.starts_at);
    const end = stamp(record.event.ends_at || record.event.starts_at);
    const params = new URLSearchParams({ action: "TEMPLATE", text: record.event.title, dates: `${start}/${end}`, details: `IPC registration ${record.reference}`, location: record.event.is_online_event ? "Online event" : record.event.venue_name || record.event.location });
    return `https://calendar.google.com/calendar/render?${params}`;
  }, [record]);

  if (error) return <div className="container-content py-24 text-center"><h1 className="font-heading text-3xl font-bold">Registration unavailable</h1><p className="mt-3">{error}</p><Link to="/events" className="btn-primary mt-6 inline-flex">Back to events</Link></div>;
  if (!record) return <div className="container-content grid min-h-[55vh] place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" /></div>;
  const query = token ? `?token=${encodeURIComponent(token)}` : "";
  return <div className="bg-background-50 py-16 md:py-24"><main className="container-content max-w-4xl">
    <div className="border border-background-200 bg-white p-6 shadow-xl md:p-10">
      {confirmed && <div className="mb-8 flex items-start gap-4 border-b border-background-200 pb-8"><CheckCircle2 className="mt-1 shrink-0 text-primary-600" size={38}/><div><p className="eyebrow text-primary-700">Registration complete</p><h1 className="mt-2 font-heading text-3xl font-bold md:text-4xl">You’re registered</h1><p className="mt-2 text-foreground-600">Reference <strong>{record.reference}</strong></p></div></div>}
      {!confirmed && <><p className="eyebrow text-primary-700">Registration</p><h1 className="mt-2 font-heading text-3xl font-bold">{record.reference}</h1></>}
      <div className="mt-7 grid gap-6 bg-background-100 p-6 md:grid-cols-2"><div><p className="text-xs font-bold uppercase tracking-wider text-foreground-500">Event</p><p className="mt-2 font-bold">{record.event_name}</p></div><div><p className="text-xs font-bold uppercase tracking-wider text-foreground-500">Ticket</p><p className="mt-2 font-bold">{record.ticket_name} × {record.quantity}</p></div><div><p className="text-xs font-bold uppercase tracking-wider text-foreground-500">Date and time</p><p className="mt-2">{record.event.starts_at ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: record.event.timezone }).format(new Date(record.event.starts_at)) : "To be confirmed"} ({record.event.timezone})</p></div><div><p className="text-xs font-bold uppercase tracking-wider text-foreground-500">Location</p><p className="mt-2 flex gap-2"><MapPin size={17}/>{record.event.is_online_event ? "Online event" : record.event.venue_name || record.event.location}</p></div><div><p className="text-xs font-bold uppercase tracking-wider text-foreground-500">Total</p><p className="mt-2 font-bold">Free</p></div></div>
      <div className="mt-7 flex items-start gap-3 rounded-lg border border-primary-200 bg-primary-50 p-4 text-sm"><Mail className="mt-0.5 shrink-0 text-primary-700" size={19}/><p>{record.confirmation_email_status === "sent" ? `A confirmation email was sent to ${record.email}.` : record.confirmation_email_status === "failed" ? "Your booking is confirmed, but the email could not be sent. Please keep this reference." : "Your booking is confirmed and the confirmation email is being prepared."}</p></div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row"><a href={`/api/events/registrations/${encodeURIComponent(record.reference)}/calendar${query}`} className="btn-primary inline-flex justify-center gap-2"><CalendarPlus size={18}/> Download calendar</a>{googleCalendar && <a href={googleCalendar} target="_blank" rel="noreferrer" className="btn-secondary inline-flex justify-center">Add to Google Calendar</a>}<Link to="/events" className="inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-foreground-700">Back to events</Link></div>
    </div>
  </main></div>;
}

export function RegistrationCalendarRedirect() {
  const { reference = "" } = useParams();
  const [search] = useSearchParams();
  useEffect(() => { window.location.assign(`/api/events/registrations/${encodeURIComponent(reference)}/calendar?token=${encodeURIComponent(search.get("token") || "")}`); }, [reference, search]);
  return <div className="container-content grid min-h-[50vh] place-items-center text-sm font-semibold">Preparing your calendar file…</div>;
}
