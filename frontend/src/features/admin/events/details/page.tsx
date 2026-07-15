import { ArrowLeft, CalendarDays, ExternalLink, LoaderCircle, Pencil } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";

import { adminApi } from "@/features/admin/adminApi";
import { AdminPageHeader, StatusBadge } from "@/features/admin/components/AdminPage";
import EventFormModal from "@/features/admin/events/EventFormModal";
import type { AdminEvent, AdminEventPayload } from "@/features/admin/types";
import { formatDate } from "@/features/admin/utils";
import { notifications } from "@/lib/notifications";

function DetailCard({ title, children }: { title: string; children: ReactNode }) {
  return <section className="rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] shadow-[0_8px_25px_rgba(66,48,31,0.04)]"><h2 className="border-b border-[#E8DED2] px-5 py-4 font-black">{title}</h2><div className="p-5">{children}</div></section>;
}

function DetailGrid({ items }: { items: Array<[string, ReactNode]> }) {
  return <dl className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{items.map(([label, value]) => <div key={label}><dt className="text-[10px] font-bold uppercase tracking-wider text-[#857A70]">{label}</dt><dd className="mt-1 break-words text-sm font-semibold leading-6 text-[#332D27]">{value === "" || value === null || value === undefined ? "—" : value}</dd></div>)}</dl>;
}

export default function AdminEventDetailsPage() {
  const eventId = Number(useParams().id);
  const [event, setEvent] = useState<AdminEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!Number.isInteger(eventId) || eventId <= 0) {
      setError("This event ID is invalid.");
      setIsLoading(false);
      return () => { active = false; };
    }
    void adminApi.event(eventId)
      .then((response) => { if (active) setEvent(response); })
      .catch((requestError: unknown) => { if (active) setError(requestError instanceof Error ? requestError.message : "Could not load this event."); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [eventId]);

  const saveEvent = async (payload: AdminEventPayload) => {
    if (!event) return;
    setIsSaving(true);
    try {
      const updated = await adminApi.updateEvent(event.id, payload);
      setEvent(updated);
      setEditing(false);
      notifications.success("Event updated successfully.");
    } catch (requestError) {
      notifications.error(requestError instanceof Error ? requestError.message : "Could not update the event.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="grid min-h-[55vh] place-items-center"><div className="text-center text-[#6D645B]" role="status"><LoaderCircle className="mx-auto animate-spin text-primary-600" size={30} /><p className="mt-3 text-xs font-bold uppercase tracking-[0.18em]">Loading event</p></div></div>;
  if (error || !event) return <div className="grid min-h-[55vh] place-items-center px-5 text-center"><div><p className="text-sm font-bold">{error || "Event not found."}</p><Link to="/admin/events" className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-primary-500 px-4 text-xs font-bold text-[#0B0B0B]"><ArrowLeft size={15} /> Back to Events</Link></div></div>;

  const isEventbriteEvent = Boolean(event.eventbrite_id);

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-7 text-[#221E1A] md:px-8 md:py-9">
      <AdminPageHeader eyebrow="Event record" title={event.title} description={isEventbriteEvent ? "This event is synced from Eventbrite and is read-only in IPC." : "View and manage this local IPC event record."} action={<div className="flex gap-2"><Link to="/admin/events" className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D4C6B5] bg-white px-4 text-xs font-bold"><ArrowLeft size={15} /> Back</Link>{!isEventbriteEvent && <button type="button" onClick={() => setEditing(true)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary-500 px-4 text-xs font-bold text-[#0B0B0B]"><Pencil size={15} /> Edit</button>}</div>} />

      <div className="mt-8 overflow-hidden rounded-2xl bg-[#0B0B0B] text-white shadow-xl">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="h-72 bg-[#25211D] lg:h-full">{event.image_url ? <img src={event.image_url} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full min-h-72 place-items-center text-primary-500"><CalendarDays size={52} strokeWidth={1.2} /></div>}</div>
          <div className="p-7 md:p-10"><div className="flex flex-wrap gap-2"><StatusBadge status={event.status || "No status"} /><span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${event.is_published ? "bg-emerald-100 text-emerald-800" : "bg-white/15 text-white/65"}`}>{event.is_published ? "Published" : "Draft"}</span>{event.is_featured && <span className="rounded-full bg-primary-500 px-3 py-1 text-[10px] font-black uppercase text-[#0B0B0B]">Featured</span>}{isEventbriteEvent && <span className="rounded-full bg-[#F4ECE1] px-3 py-1 text-[10px] font-black uppercase text-[#4F4841]">Eventbrite · Read only</span>}</div><h2 className="mt-5 text-3xl font-black">{event.title}</h2><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-white/60">{event.description || "No description has been added."}</p>{event.eventbrite_url && <a href={event.eventbrite_url} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary-400">Open Eventbrite <ExternalLink size={15} /></a>}</div>
        </div>
      </div>

      <div className="mt-6 grid gap-5">
        <DetailCard title="Event information"><DetailGrid items={[["Slug", event.slug], ["Event type", event.event_type.replaceAll("_", " ")], ["Status", event.status], ["Location", event.location], ["Region", event.region], ["Venue name", event.venue_name], ["Starts at", formatDate(event.starts_at)], ["Ends at", formatDate(event.ends_at)], ["Capacity", event.capacity], ["Online event", event.is_online_event ? "Yes" : "No"], ["Featured", event.is_featured ? "Yes" : "No"], ["Published", event.is_published ? "Yes" : "No"]]} /></DetailCard>
        <DetailCard title="Eventbrite and media"><DetailGrid items={[["Image URL", event.image_url], ["Eventbrite ID", event.eventbrite_id], ["Eventbrite URL", event.eventbrite_url]]} /></DetailCard>
        <DetailCard title="Audit information"><DetailGrid items={[["Created", formatDate(event.created_at)], ["Last updated", formatDate(event.updated_at)]]} /></DetailCard>
      </div>

      <EventFormModal event={event} open={editing} isSaving={isSaving} onClose={() => { if (!isSaving) setEditing(false); }} onSave={saveEvent} />
    </div>
  );
}
