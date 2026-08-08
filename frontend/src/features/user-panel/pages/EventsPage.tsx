import { useCallback } from "react";
import { Link } from "react-router-dom";
import { apiJson } from "@/lib/api";
import { rows } from "../api";
import { useLoad } from "../hooks";
import { Card, Empty, ErrorState, Loading, PageHeading } from "../components/PanelUI";

type EventItem = { slug: string; title: string; description: string; location: string; starts_at: string | null; status: string };

const formatEventDateTime = (value: string) => `${new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
}).format(new Date(value))} GMT`;

export default function EventsPage() {
  const load = useCallback((signal: AbortSignal) => apiJson<EventItem[] | { results: EventItem[] }>("/api/events", undefined, { signal, requestSource: "user-panel" }), []);
  const { data, loading, error, reload } = useLoad(load);
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} retry={reload} />;
  const events = rows(data as never) as EventItem[];
  return <><PageHeading title="Events" description="Discover IPC masterclasses, club meetings and professional events, then register through the existing secure booking flow." />{events.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{events.map((event) => <Card key={event.slug} className="flex flex-col"><p className="text-xs font-bold uppercase tracking-wider text-primary-700">{event.starts_at ? formatEventDateTime(event.starts_at) : "Date to be confirmed"}</p><h2 className="mt-3 text-xl font-semibold">{event.title}</h2><p className="mt-2 text-sm text-foreground-500">{event.location}</p><p className="mt-3 flex-1 text-sm leading-6 text-foreground-600">{event.description}</p><Link to={`/events/${event.slug}`} className="btn-primary mt-5">View and register</Link></Card>)}</div> : <Empty title="No upcoming events" text="New IPC events will appear here once published." />}</>;
}
