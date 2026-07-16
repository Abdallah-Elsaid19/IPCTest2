import { ArrowLeft, CalendarDays, Clock3, MapPin, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { registrationApi } from "./api";
import type { RegistrationEvent } from "./types";
import SEO from "@/components/seo/SEO";
import { truncateDescription } from "@/config/seoConfig";
import { buildEventSchema } from "@/lib/seo/structuredData";

const dateTime = (value: string | null, options: Intl.DateTimeFormatOptions) =>
  value ? new Intl.DateTimeFormat("en-GB", options).format(new Date(value)) : "To be confirmed";

export default function EventDetailPage() {
  const { slug = "" } = useParams();
  const [event, setEvent] = useState<RegistrationEvent | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    registrationApi.config(slug).then(setEvent).catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : "Could not load this event.");
    });
  }, [slug]);

  if (error) return <div className="container-content py-24 text-center"><SEO title="Event Unavailable" description="This event could not be found." canonicalPath={`/events/${slug}`} noIndex /><h1 className="font-heading text-3xl font-bold">Event unavailable</h1><p className="mt-3 text-foreground-600">{error}</p><Link to="/events" className="btn-primary mt-7 inline-flex">Back to events</Link></div>;
  if (!event) return <div className="container-content grid min-h-[55vh] place-items-center" role="status"><SEO title="Event" description="Loading event details…" canonicalPath={`/events/${slug}`} noIndex /><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" /></div>;

  const location = event.is_online_event ? "Online event" : event.venue_name || event.location || "Venue to be confirmed";
  const eventDescription = event.description || `Join this Institute of Project Controls event: ${event.title}.`;
  const eventSchema = buildEventSchema({
    name: event.title,
    description: eventDescription,
    canonicalPath: `/events/${event.slug}`,
    image: event.image_url || undefined,
    startDate: event.starts_at,
    endDate: event.ends_at,
    isOnline: event.is_online_event,
    location,
  });
  const cta = event.eventbrite_id ? (
    <a href={event.eventbrite_url} target="_blank" rel="noreferrer" className="btn-primary inline-flex w-full justify-center">Register on Eventbrite</a>
  ) : event.registration_is_open ? (
    <Link to={`/events/${event.slug}/register`} className="btn-primary inline-flex w-full justify-center">Register now</Link>
  ) : <div className="rounded-lg bg-background-100 p-4 text-sm font-semibold text-foreground-700">{event.registration_closed_reason}</div>;

  return <div className="bg-background-50 pb-20">
    <SEO
      title={event.title}
      description={truncateDescription(eventDescription)}
      canonicalPath={`/events/${event.slug}`}
      image={event.image_url || undefined}
      type="article"
      structuredData={eventSchema}
    />
    <section className="relative min-h-[390px] overflow-hidden bg-background-950">
      {event.image_url && <img src={event.image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />}
      <div className="absolute inset-0 bg-gradient-to-r from-background-950 via-background-950/85 to-transparent" />
      <div className="container-content relative flex min-h-[390px] items-end py-14 pt-28 text-background-50">
        <div className="max-w-3xl"><Link to="/events" className="mb-6 inline-flex items-center gap-2 text-sm text-primary-300"><ArrowLeft size={16} /> All events</Link><p className="eyebrow text-primary-400">IPC Event</p><h1 className="mt-3 font-heading text-4xl font-bold leading-tight md:text-6xl">{event.title}</h1></div>
      </div>
    </section>
    <div className="container-content grid gap-9 py-12 lg:grid-cols-[minmax(0,1fr)_360px]">
      <article><h2 className="font-heading text-2xl font-bold text-background-950">About this event</h2><div className="mt-5 whitespace-pre-line text-base leading-8 text-foreground-700">{event.description || "Further event details will be published shortly."}</div></article>
      <aside className="h-fit border border-background-200 bg-white p-6 shadow-lg lg:sticky lg:top-24">
        <h2 className="font-heading text-xl font-bold">Event details</h2>
        <div className="my-6 space-y-4 text-sm text-foreground-700">
          <p className="flex gap-3"><CalendarDays className="shrink-0 text-primary-600" size={19}/><span>{dateTime(event.starts_at, { day: "2-digit", month: "long", year: "numeric", timeZone: event.timezone })}</span></p>
          <p className="flex gap-3"><Clock3 className="shrink-0 text-primary-600" size={19}/><span>{dateTime(event.starts_at, { hour: "2-digit", minute: "2-digit", timeZone: event.timezone })}{event.ends_at ? ` – ${dateTime(event.ends_at, { hour: "2-digit", minute: "2-digit", timeZone: event.timezone })}` : ""} ({event.timezone})</span></p>
          <p className="flex gap-3"><MapPin className="shrink-0 text-primary-600" size={19}/><span>{location}</span></p>
          {!event.eventbrite_id && event.available_places !== null && <p className="flex gap-3"><Users className="shrink-0 text-primary-600" size={19}/><span>{event.available_places} place(s) available</span></p>}
        </div>{cta}
      </aside>
    </div>
  </div>;
}
