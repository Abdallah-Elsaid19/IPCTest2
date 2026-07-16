import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  EyeOff,
  LoaderCircle,
  MapPin,
  Mail,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { adminApi } from "@/features/admin/adminApi";
import { AdminPageHeader, EmptyState, StatusBadge } from "@/features/admin/components/AdminPage";
import EventFormModal from "@/features/admin/events/EventFormModal";
import type { AdminEvent, AdminEventPayload, DashboardRegistration } from "@/features/admin/types";
import { formatDate } from "@/features/admin/utils";
import { notifications } from "@/lib/notifications";

const formatEventType = (value: AdminEvent["event_type"]) => ({
  london_master_class: "London Master Class",
  regional_club: "Regional Club",
  other: "Other",
}[value]);

const formatTime = (value: string | null) => value
  ? new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date(value))
  : "Time TBC";

const formatEventDate = (value: string | null) => value
  ? new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value))
  : "Date TBC";

const EVENTS_PER_PAGE = 6;
const REGISTRATIONS_PER_PAGE = 10;

function EventCard({
  event,
  isVisibilitySaving,
  onEdit,
  onDelete,
  onToggleVisibility,
}: {
  event: AdminEvent;
  isVisibilitySaving: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
}) {
  const isEventbriteEvent = Boolean(event.eventbrite_id);
  const isEnded = event.lifecycle_status === "ended";
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E2D7C9] bg-[#FFFDF9] p-3 text-[#221E1A] shadow-[0_10px_30px_rgba(66,48,31,0.08)] transition hover:-translate-y-1 hover:shadow-[0_16px_38px_rgba(66,48,31,0.14)]">
      <div className="relative h-56 overflow-hidden rounded-xl bg-[#E9DFD2]">
        {event.image_url ? (
          <img src={event.image_url} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center bg-gradient-to-br from-[#EDE3D6] to-[#D2C0AA] text-primary-800"><CalendarDays size={44} strokeWidth={1.3} /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-primary-500 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-[#0B0B0B]">{formatEventType(event.event_type)}</span>
          {event.is_featured && <span className="rounded-full bg-white px-3 py-1 text-[9px] font-black uppercase tracking-wider text-[#0B0B0B]">Featured</span>}
          {isEventbriteEvent && <span className="rounded-full bg-[#F4ECE1] px-3 py-1 text-[9px] font-black uppercase tracking-wider text-[#4F4841]">Eventbrite · Read only</span>}
          {isEnded && <span className="rounded-full bg-[#322D28] px-3 py-1 text-[9px] font-black uppercase tracking-wider text-white">Ended</span>}
        </div>
        <span className={`absolute bottom-4 right-4 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider ${event.is_published ? "bg-emerald-100 text-emerald-800" : "bg-white/90 text-[#554E47]"}`}>{event.is_published ? "Published" : "Draft"}</span>
        {event.is_hidden_on_site && <span className="absolute bottom-4 left-4 rounded-full bg-red-100 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-red-800">Hidden from site</span>}
      </div>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
        <div className="order-2 mt-5 space-y-3 border-t border-[#E7DED3] pt-4 text-sm font-semibold text-[#6F6861]">
          <p className="flex items-center gap-3"><CalendarDays size={18} className="shrink-0 text-[#B4AAA0]" />{formatEventDate(event.starts_at)}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <p className="flex items-center gap-3"><Clock3 size={18} className="shrink-0 text-[#B4AAA0]" />Start at {formatTime(event.starts_at)}</p>
            <p className="flex items-center gap-3"><Clock3 size={18} className="shrink-0 text-[#B4AAA0]" />Ends at {formatTime(event.ends_at)}</p>
          </div>
        </div>
        <p className="sr-only">{event.lifecycle_status || event.status || "No status"}</p>
        <h2 className="order-1 min-h-14 text-xl font-black leading-snug text-[#202A38]">{event.title}</h2>
        <p className="hidden">{event.description || "Event details have not been added yet."}</p>
        <div className="order-3 mt-4 space-y-2 text-sm font-semibold text-[#6F6861]">
          <p className="flex items-center gap-2"><MapPin size={17} className="text-[#B4AAA0]" />{event.is_online_event ? "Online event" : event.venue_name || event.location || "Venue TBC"}</p>
        </div>
        <div className="order-4 mt-auto grid grid-cols-2 gap-2 pt-6">
          <Link to={`/admin/events/${event.id}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-primary-500 bg-white text-xs font-bold text-primary-800 transition hover:bg-[#FFF7EB]"><Eye size={15} /> View</Link>
          {isEventbriteEvent ? (
            <span className="inline-flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-[#E9E3DC] text-xs font-bold text-[#999087]" title="Edit this event in Eventbrite, then run sync."><Pencil size={15} /> Read only</span>
          ) : (
            <button type="button" onClick={onEdit} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary-500 text-xs font-bold text-[#0B0B0B] transition hover:bg-primary-400"><Pencil size={15} /> Edit</button>
          )}
          <button
            type="button"
            onClick={onToggleVisibility}
            disabled={isVisibilitySaving || isEnded || (!event.is_published && !event.is_hidden_on_site)}
            className={`${isEventbriteEvent ? "col-span-2" : ""} inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#D8CCBD] bg-[#F4ECE1] text-xs font-bold text-[#554E47] transition hover:border-primary-500 hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-45`}
          >
            {isVisibilitySaving ? <LoaderCircle size={15} className="animate-spin" /> : event.is_hidden_on_site ? <Eye size={15} /> : <EyeOff size={15} />}
            {isEnded ? "Ended · hidden from website" : event.is_hidden_on_site ? "Show on IPC website" : event.is_published ? "Hide from IPC website" : "Not published on website"}
          </button>
          {!isEventbriteEvent && (
            <button type="button" onClick={onDelete} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 text-xs font-bold text-red-700 transition hover:bg-red-100" aria-label={`Delete ${event.title}`}><Trash2 size={15}/> Delete</button>
          )}
        </div>
      </div>
    </article>
  );
}

function PaginationControls({
  page,
  pageCount,
  total,
  label,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  total: number;
  label: string;
  onPageChange: (page: number) => void;
}) {
  const pageNumbers: Array<number | "ellipsis-start" | "ellipsis-end"> =
    pageCount <= 7
      ? Array.from({ length: pageCount }, (_, index) => index + 1)
      : [
          1,
          ...(page > 3 ? ["ellipsis-start" as const] : []),
          ...Array.from(
            new Set([page - 1, page, page + 1].filter((item) => item > 1 && item < pageCount)),
          ),
          ...(page < pageCount - 2 ? ["ellipsis-end" as const] : []),
          pageCount,
        ];

  return (
    <div className="flex flex-col gap-3 border-t border-[#E8DED2] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-[#746A60]">
        Page {page} of {pageCount} · {total} {label}
      </p>
      <div className="flex gap-2">
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#D4C6B5] bg-white px-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={15} /> Previous</button>
        <div className="flex items-center gap-1">
          {pageNumbers.map((item) => typeof item === "number" ? (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? "page" : undefined}
              className={`grid h-9 min-w-9 place-items-center rounded-lg border px-2 text-xs font-black transition ${item === page ? "border-primary-500 bg-primary-500 text-[#0B0B0B]" : "border-[#D4C6B5] bg-white text-[#625A52] hover:border-primary-500"}`}
            >
              {item}
            </button>
          ) : <span key={item} className="px-1 text-[#8A8178]">…</span>)}
        </div>
        <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= pageCount} className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#D4C6B5] bg-white px-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40">Next <ChevronRight size={15} /></button>
      </div>
    </div>
  );
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [localRegistrations, setLocalRegistrations] = useState<DashboardRegistration[]>([]);
  const [eventbriteAttendees, setEventbriteAttendees] = useState<DashboardRegistration[]>([]);
  const [attendeesError, setAttendeesError] = useState("");
  const [isEventbriteRefreshing, setIsEventbriteRefreshing] = useState(false);
  const [eventPage, setEventPage] = useState(1);
  const [registrationPage, setRegistrationPage] = useState(1);
  const [busyVisibilityId, setBusyVisibilityId] = useState<number | null>(null);
  const [busyEmailId, setBusyEmailId] = useState<number | null>(null);
  const [eventSearch, setEventSearch] = useState("");
  const [eventSource, setEventSource] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventVisibility, setEventVisibility] = useState("");
  const [registrationSearch, setRegistrationSearch] = useState("");
  const [registrationSource, setRegistrationSource] = useState("");
  const [registrationStatus, setRegistrationStatus] = useState("");
  const [registrationEvent, setRegistrationEvent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<AdminEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const saveLock = useRef(false);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      setEvents(await adminApi.events());
    } catch (error) {
      notifications.error(error instanceof Error ? error.message : "Could not load events.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadEvents(); }, [loadEvents]);

  useEffect(() => {
    let active = true;
    void adminApi.eventbriteAttendees()
      .then((response) => {
        if (!active) return;
        setEventbriteAttendees(response.results);
        if (response.is_stale) {
          setIsEventbriteRefreshing(true);
          void adminApi.refreshEventbriteAttendees()
            .then((fresh) => {
              if (active) {
                setEventbriteAttendees(fresh.results);
                setAttendeesError("");
              }
            })
            .catch((error: unknown) => {
              if (active) setAttendeesError(error instanceof Error ? error.message : "Eventbrite attendees could not be refreshed.");
            })
            .finally(() => { if (active) setIsEventbriteRefreshing(false); });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setAttendeesError(
            error instanceof Error
              ? error.message
              : "Eventbrite attendees could not be loaded.",
          );
        }
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    void adminApi.eventRegistrations()
      .then((response) => { if (active) setLocalRegistrations(response.map((item) => ({ ...item, source: "ipc" }))); })
      .catch((error: unknown) => { if (active) setAttendeesError(error instanceof Error ? error.message : "IPC registrations could not be loaded."); });
    return () => { active = false; };
  }, []);

  const openCreate = () => {
    setEditingEvent(null);
    setFormOpen(true);
  };
  const openEdit = (event: AdminEvent) => {
    setEditingEvent(event);
    setFormOpen(true);
  };
  const saveEvent = async (payload: AdminEventPayload) => {
    if (saveLock.current) return;
    saveLock.current = true;
    setIsSaving(true);
    try {
      const saved = editingEvent
        ? await adminApi.updateEvent(editingEvent.id, payload)
        : await adminApi.createEvent(payload);
      setEvents((current) => editingEvent
        ? current.map((item) => item.id === saved.id ? saved : item)
        : [saved, ...current]);
      if (!editingEvent) setEventPage(1);
      setFormOpen(false);
      setEditingEvent(null);
      notifications.success(editingEvent ? "Event updated successfully." : "Event created successfully.");
    } catch (error) {
      notifications.error(error instanceof Error ? error.message : "Could not save the event.");
    } finally {
      saveLock.current = false;
      setIsSaving(false);
    }
  };

  const toggleVisibility = async (event: AdminEvent) => {
    if (busyVisibilityId !== null) return;
    setBusyVisibilityId(event.id);
    try {
      const updated = await adminApi.setEventVisibility(
        event.id,
        !event.is_hidden_on_site,
      );
      setEvents((current) => current.map((item) => (
        item.id === updated.id ? updated : item
      )));
      notifications.success(
        updated.is_hidden_on_site
          ? "Event hidden from the IPC website."
          : "Event is visible on the IPC website again.",
      );
    } catch (error) {
      notifications.error(
        error instanceof Error ? error.message : "Could not change event visibility.",
      );
    } finally {
      setBusyVisibilityId(null);
    }
  };

  const deleteEvent = async () => {
    if (!deletingEvent || deletingEvent.eventbrite_id || isDeleting) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteEvent(deletingEvent.id);
      setEvents((current) => current.filter((event) => event.id !== deletingEvent.id));
      notifications.success("IPC event deleted successfully.");
      setDeletingEvent(null);
    } catch (error) {
      notifications.error(error instanceof Error ? error.message : "Could not delete the event.");
    } finally {
      setIsDeleting(false);
    }
  };

  const resendConfirmation = async (registration: DashboardRegistration) => {
    if (typeof registration.id !== "number" || busyEmailId !== null) return;
    setBusyEmailId(registration.id);
    try {
      await adminApi.resendEventConfirmation(registration.id);
      setLocalRegistrations((current) => current.map((item) => item.id === registration.id ? { ...item, confirmation_email_status: "sent" } : item));
      notifications.success("Confirmation email sent.");
    } catch (error) {
      notifications.error(error instanceof Error ? error.message : "Could not send the confirmation email.");
    } finally {
      setBusyEmailId(null);
    }
  };

  const registrations = [
    ...localRegistrations,
    ...eventbriteAttendees,
  ]
    .sort((left, right) => (
      new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
    ))
    .slice(0, 200);
  const normalizedEventSearch = eventSearch.trim().toLowerCase();
  const filteredEvents = events.filter((event) => {
    const matchesSearch = !normalizedEventSearch || [
      event.title,
      event.description,
      event.location,
      event.region,
      event.venue_name,
      event.status,
      event.lifecycle_status,
    ].some((value) => value.toLowerCase().includes(normalizedEventSearch));
    const matchesSource = !eventSource || (
      eventSource === "eventbrite" ? Boolean(event.eventbrite_id) : !event.eventbrite_id
    );
    const matchesType = !eventType || event.event_type === eventType;
    const matchesVisibility = !eventVisibility
      || (eventVisibility === "visible" && event.is_published && !event.is_hidden_on_site && event.lifecycle_status !== "ended")
      || (eventVisibility === "hidden" && event.is_hidden_on_site)
      || (eventVisibility === "draft" && !event.is_published)
      || (eventVisibility === "ended" && event.lifecycle_status === "ended");
    return matchesSearch && matchesSource && matchesType && matchesVisibility;
  });
  const registrationEventOptions = Array.from(
    new Set(registrations.map((item) => item.event_name).filter(Boolean)),
  ).sort();
  const registrationStatusOptions = Array.from(
    new Set(registrations.map((item) => item.status).filter(Boolean)),
  ).sort();
  const normalizedRegistrationSearch = registrationSearch.trim().toLowerCase();
  const filteredRegistrations = registrations.filter((item) => {
    const matchesSearch = !normalizedRegistrationSearch || [
      item.name,
      item.email,
      item.event_name,
    ].some((value) => value.toLowerCase().includes(normalizedRegistrationSearch));
    const matchesSource = !registrationSource || item.source === registrationSource;
    const matchesStatus = !registrationStatus || item.status === registrationStatus;
    const matchesEvent = !registrationEvent || item.event_name === registrationEvent;
    return matchesSearch && matchesSource && matchesStatus && matchesEvent;
  });
  const eventPageCount = Math.max(1, Math.ceil(filteredEvents.length / EVENTS_PER_PAGE));
  const registrationPageCount = Math.max(
    1,
    Math.ceil(filteredRegistrations.length / REGISTRATIONS_PER_PAGE),
  );
  const visibleEvents = filteredEvents.slice(
    (eventPage - 1) * EVENTS_PER_PAGE,
    eventPage * EVENTS_PER_PAGE,
  );
  const visibleRegistrations = filteredRegistrations.slice(
    (registrationPage - 1) * REGISTRATIONS_PER_PAGE,
    registrationPage * REGISTRATIONS_PER_PAGE,
  );

  useEffect(() => {
    setEventPage((current) => Math.min(current, eventPageCount));
  }, [eventPageCount]);

  useEffect(() => {
    setRegistrationPage((current) => Math.min(current, registrationPageCount));
  }, [registrationPageCount]);

  const filterControlClass = "h-10 rounded-xl border border-[#D9CDBE] bg-white px-3 text-xs font-semibold text-[#4F4841] outline-none focus:border-primary-500";

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-7 text-[#221E1A] md:px-8 md:py-9">
      <AdminPageHeader
        eyebrow="Programme"
        title="Events"
        description="Create, publish and manage IPC events using the live database records."
        action={<button type="button" onClick={openCreate} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary-500 px-5 text-xs font-black text-[#0B0B0B] shadow-sm transition hover:bg-primary-400"><Plus size={17} /> Create event</button>}
      />

      {isLoading ? (
        <div className="grid min-h-[45vh] place-items-center" role="status"><div className="text-center text-[#6D645B]"><LoaderCircle className="mx-auto animate-spin text-primary-600" size={30} /><p className="mt-3 text-xs font-bold uppercase tracking-[0.18em]">Loading events</p></div></div>
      ) : events.length ? (
        <section className="mt-8 overflow-hidden rounded-2xl border border-[#DED2C3] bg-white/35">
          <div className="flex flex-col gap-3 border-b border-[#E8DED2] bg-[#FFFDF9] p-4 xl:flex-row xl:items-center">
            <div className="relative min-w-0 flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8178]" />
              <input value={eventSearch} onChange={(changeEvent) => { setEventSearch(changeEvent.target.value); setEventPage(1); }} placeholder="Search events..." className="h-10 w-full rounded-xl border border-[#D9CDBE] bg-white pl-9 pr-9 text-sm outline-none focus:border-primary-500" />
              {eventSearch && <button type="button" onClick={() => { setEventSearch(""); setEventPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8178]" aria-label="Clear event search"><X size={15} /></button>}
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={eventSource} onChange={(changeEvent) => { setEventSource(changeEvent.target.value); setEventPage(1); }} className={filterControlClass} aria-label="Filter event source"><option value="">All sources</option><option value="local">IPC local</option><option value="eventbrite">Eventbrite</option></select>
              <select value={eventType} onChange={(changeEvent) => { setEventType(changeEvent.target.value); setEventPage(1); }} className={filterControlClass} aria-label="Filter event type"><option value="">All event types</option><option value="london_master_class">London Master Class</option><option value="regional_club">Regional Club</option><option value="other">Other</option></select>
              <select value={eventVisibility} onChange={(changeEvent) => { setEventVisibility(changeEvent.target.value); setEventPage(1); }} className={filterControlClass} aria-label="Filter event visibility"><option value="">All visibility</option><option value="visible">Visible on site</option><option value="hidden">Hidden from site</option><option value="draft">Draft / unpublished</option><option value="ended">Ended</option></select>
            </div>
          </div>
          {visibleEvents.length ? <div className="grid gap-6 p-5 md:grid-cols-2 2xl:grid-cols-3">
            {visibleEvents.map((event) => <EventCard key={event.id} event={event} isVisibilitySaving={busyVisibilityId === event.id} onEdit={() => openEdit(event)} onDelete={() => setDeletingEvent(event)} onToggleVisibility={() => void toggleVisibility(event)} />)}
          </div> : <div className="p-5"><EmptyState>No events match the current filters.</EmptyState></div>}
          <PaginationControls page={eventPage} pageCount={eventPageCount} total={filteredEvents.length} label="events" onPageChange={setEventPage} />
        </section>
      ) : (
        <div className="mt-8"><EmptyState>No events exist yet. Create the first IPC event.</EmptyState></div>
      )}

      <section className="mt-10 overflow-hidden rounded-2xl border border-[#DED2C3] bg-[#FFFDF9]">
        <div className="flex items-center justify-between gap-4 border-b border-[#E8DED2] px-5 py-4"><div><h2 className="font-black">Recent registrations</h2><p className="mt-1 text-xs text-[#7B7167]">Latest IPC and Eventbrite registration records.</p></div>{isEventbriteRefreshing && <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-primary-800"><LoaderCircle size={14} className="animate-spin" /> Updating Eventbrite</span>}</div>
        <div className="flex flex-col gap-3 border-b border-[#E8DED2] p-4 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8178]" />
            <input value={registrationSearch} onChange={(changeEvent) => { setRegistrationSearch(changeEvent.target.value); setRegistrationPage(1); }} placeholder="Search registrant, email, or event..." className="h-10 w-full rounded-xl border border-[#D9CDBE] bg-white pl-9 pr-9 text-sm outline-none focus:border-primary-500" />
            {registrationSearch && <button type="button" onClick={() => { setRegistrationSearch(""); setRegistrationPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8178]" aria-label="Clear registration search"><X size={15} /></button>}
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={registrationSource} onChange={(changeEvent) => { setRegistrationSource(changeEvent.target.value); setRegistrationPage(1); }} className={filterControlClass} aria-label="Filter registration source"><option value="">All sources</option><option value="ipc">IPC website</option><option value="eventbrite">Eventbrite</option></select>
            <select value={registrationStatus} onChange={(changeEvent) => { setRegistrationStatus(changeEvent.target.value); setRegistrationPage(1); }} className={filterControlClass} aria-label="Filter registration status"><option value="">All statuses</option>{registrationStatusOptions.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select>
            <select value={registrationEvent} onChange={(changeEvent) => { setRegistrationEvent(changeEvent.target.value); setRegistrationPage(1); }} className={`${filterControlClass} max-w-56`} aria-label="Filter registration event"><option value="">All events</option>{registrationEventOptions.map((eventName) => <option key={eventName} value={eventName}>{eventName}</option>)}</select>
          </div>
        </div>
        {attendeesError && <p className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-xs font-semibold text-amber-800">Local registrations are shown, but Eventbrite attendees are unavailable: {attendeesError}</p>}
        {filteredRegistrations.length ? (
          <><div className="overflow-x-auto"><table className="w-full min-w-[1080px] text-left text-sm"><thead className="bg-[#ECE2D6] text-[10px] uppercase tracking-wider text-[#766C62]"><tr><th className="px-5 py-3.5">Reference</th><th className="px-5 py-3.5">Registrant</th><th className="px-5 py-3.5">Event / ticket</th><th className="px-5 py-3.5">Qty</th><th className="px-5 py-3.5">Source</th><th className="px-5 py-3.5">Status</th><th className="px-5 py-3.5">Email</th><th className="px-5 py-3.5 text-right">Actions</th></tr></thead><tbody className="divide-y divide-[#E8DED2]">{visibleRegistrations.map((item) => <tr key={`${item.source || "ipc"}-${item.id}`} className="hover:bg-[#FAF5EE]"><td className="px-5 py-4 font-mono text-xs font-bold text-primary-800">{item.reference || `IPC-LEGACY-${item.id}`}</td><td className="px-5 py-4"><p className="font-semibold">{item.name}</p><p className="mt-1 text-xs text-[#8A7E72]">{item.email || "Email unavailable"}</p></td><td className="px-5 py-4 text-[#554E47]"><p>{item.event_name}</p>{item.ticket_name && <p className="mt-1 text-xs text-[#8A7E72]">{item.ticket_name}</p>}</td><td className="px-5 py-4 font-bold">{item.quantity || 1}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${item.source === "eventbrite" ? "bg-[#EEE4D7] text-primary-800" : "bg-[#E8E5E1] text-[#615B55]"}`}>{item.source === "eventbrite" ? "Eventbrite" : "IPC website"}</span></td><td className="px-5 py-4"><StatusBadge status={item.status} /></td><td className="px-5 py-4"><StatusBadge status={item.confirmation_email_status || "external"} /></td><td className="px-5 py-4"><div className="flex justify-end gap-2">{item.source !== "eventbrite" && item.reference && <Link to={`/events/registration/${item.reference}`} className="grid h-9 w-9 place-items-center rounded-lg border border-[#D4C6B5] bg-white" aria-label="View registration"><Eye size={15}/></Link>}{item.source !== "eventbrite" && <button type="button" onClick={() => void resendConfirmation(item)} disabled={busyEmailId !== null} className="grid h-9 w-9 place-items-center rounded-lg bg-primary-500 disabled:opacity-50" aria-label="Resend confirmation">{busyEmailId === item.id ? <LoaderCircle className="animate-spin" size={15}/> : <Mail size={15}/>}</button>}</div></td></tr>)}</tbody></table></div><PaginationControls page={registrationPage} pageCount={registrationPageCount} total={filteredRegistrations.length} label="registrations" onPageChange={setRegistrationPage} /></>
        ) : <div className="p-5"><EmptyState>No event registrations have been received.</EmptyState></div>}
      </section>

      <EventFormModal event={editingEvent} open={formOpen} isSaving={isSaving} onClose={() => { if (!isSaving) setFormOpen(false); }} onSave={saveEvent} />
      {deletingEvent && (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-event-title">
          <div className="w-full max-w-md rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] p-6 shadow-2xl">
            <div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-red-100 text-red-700"><Trash2 size={20}/></span><button type="button" onClick={() => setDeletingEvent(null)} disabled={isDeleting} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-[#F4ECE1] disabled:opacity-50" aria-label="Close delete confirmation"><X size={18}/></button></div>
            <h2 id="delete-event-title" className="mt-5 text-xl font-black text-[#202A38]">Delete IPC event?</h2>
            <p className="mt-3 text-sm leading-6 text-[#655D55]">This permanently deletes <strong>{deletingEvent.title}</strong> from IPC. Existing registration records will remain available. This action does not apply to Eventbrite events.</p>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setDeletingEvent(null)} disabled={isDeleting} className="h-10 rounded-xl border border-[#D4C6B5] bg-white px-4 text-xs font-bold disabled:opacity-50">Cancel</button><button type="button" onClick={() => void deleteEvent()} disabled={isDeleting} className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-bold text-white disabled:cursor-wait disabled:opacity-60">{isDeleting ? <LoaderCircle size={15} className="animate-spin"/> : <Trash2 size={15}/>} {isDeleting ? "Deleting..." : "Delete event"}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
