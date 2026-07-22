import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SectionHeader from "@/components/base/SectionHeader";
import AudienceCard from "@/components/base/AudienceCard";
import FeatureCard from "@/components/base/FeatureCard";
import { apiJson, type EventItem } from "@/lib/api";
import SEO from "@/components/seo/SEO";
import { pageSeo } from "@/config/pageSeo";
import { subscribeToContentUpdates } from "@/lib/contentSync";

type UpcomingEvent = {
  id?: number;
  date: string;
  time: string;
  location: string;
  venue: string;
  title: string;
  description: string;
  highlight?: boolean;
  image?: string;
  url?: string;
  external?: boolean;
};

type EventContentCard = {
  icon: string;
  title: string;
  description: string;
  is_active?: boolean;
};

type EventFormatContent = EventContentCard & {
  image: string;
};

type FeaturedProgrammeContent = {
  eyebrow: string;
  title: string;
  description: string;
  image_url: string;
  image_alt: string;
  highlights: Array<EventContentCard & { tone?: "primary" | "accent" }>;
  is_active?: boolean;
};

type EventPageContent = {
  featured_programme: FeaturedProgrammeContent;
  formats: EventFormatContent[];
  audiences: EventContentCard[];
  updated_at: string;
};

export default function Events() {
  const formatDate = (value?: string | null) => {
    if (!value) return "Date to be confirmed";
    return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
  };

  const formatTimeRange = (start?: string | null, end?: string | null) => {
    if (!start) return "Time to be confirmed";
    const formatter = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
    const startText = formatter.format(new Date(start));
    return end ? `${startText} - ${formatter.format(new Date(end))}` : startText;
  };

  const [eventbriteEvents, setEventbriteEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");
  const [pageContent, setPageContent] = useState<EventPageContent | null>(null);
  const [contentError, setContentError] = useState("");
  const featuredProgrammeContent = pageContent?.featured_programme;
  const featuredProgramme = featuredProgrammeContent && featuredProgrammeContent.is_active !== false
    ? {
        ...featuredProgrammeContent,
        highlights: Array.isArray(featuredProgrammeContent.highlights)
          ? featuredProgrammeContent.highlights.filter((item) => item.is_active !== false)
          : [],
      }
    : undefined;
  const formats = Array.isArray(pageContent?.formats)
    ? pageContent.formats.filter((item) => item.is_active !== false)
    : [];
  const audiences = Array.isArray(pageContent?.audiences)
    ? pageContent.audiences.filter((item) => item.is_active !== false)
    : [];

  const upcomingEvents = useMemo(() => {
    if (!eventbriteEvents.length) return [];
    return eventbriteEvents.map((event, index) => ({
      id: event.id,
      date: formatDate(event.starts_at),
      time: formatTimeRange(event.starts_at, event.ends_at),
      location: event.location || event.region || "Online / venue to be confirmed",
      venue: event.venue_name || event.location || "Venue to be confirmed",
      title: event.title,
      description: event.description || "Event details will be confirmed shortly.",
      highlight: index === 0,
      image: event.image_url || undefined,
      url: event.eventbrite_url || `/events/${event.slug}`,
      external: Boolean(event.eventbrite_id),
    }));
  }, [eventbriteEvents]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [upcomingEvents.length, formats.length, audiences.length]);

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      try {
        setEventsError("");
        const events = await apiJson<EventItem[]>("/api/events");
        if (!cancelled) setEventbriteEvents(events);
      } catch (error) {
        if (!cancelled) {
          setEventbriteEvents([]);
          setEventsError(error instanceof Error ? error.message : "Events could not be loaded.");
        }
      } finally {
        if (!cancelled) setEventsLoading(false);
      }
    }

    loadEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadEventContent = useCallback(async () => {
    setContentError("");
    try {
      setPageContent(await apiJson<EventPageContent>("/api/events/content", undefined, { cache: "no-store" }));
    } catch (error) {
      setPageContent(null);
      setContentError(error instanceof Error ? error.message : "Events content could not be loaded.");
    }
  }, []);

  useEffect(() => {
    void loadEventContent();
    return subscribeToContentUpdates("events", () => void loadEventContent());
  }, [loadEventContent]);
  return (
    <div>
      <SEO {...pageSeo.events} />
      {/* Hero */}
      <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center overflow-hidden bg-background-950">
        <div className="absolute inset-0 opacity-25">
          <img
            loading="eager"
            fetchPriority="high"
            decoding="async"
            src="https://readdy.ai/api/search-image?query=Grand%20institutional%20conference%20hall%20with%20hundreds%20of%20professionals%20seated%20in%20tiered%20rows%2C%20dramatic%20stage%20lighting%20in%20warm%20golden%20tones%2C%20large%20LED%20screens%20displaying%20data%20visualizations%2C%20elegant%20architectural%20ceiling%20details%2C%20premium%20corporate%20event%20atmosphere%2C%20deep%20charcoal%20background%20elements%2C%20cinematic%20lighting%2C%20editorial%20photography%20quality%2C%20no%20visible%20text&width=1600&height=900&seq=events-hero-professional-03&orientation=landscape"
            alt="Professional conference event"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-background-950 via-background-950/85 to-background-950/55" />
        <div className="relative z-10 container-content w-full pt-24 md:pt-32">
          <div className="max-w-3xl reveal">
            <span className="eyebrow text-primary-400 mb-4 block">Community</span>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-background-50 leading-[1.1] mb-6">
              Events
            </h1>
            <p className="text-base md:text-lg text-background-200 leading-relaxed max-w-2xl mb-10">
              A professional institute should create spaces where people meet, learn and exchange practice. 
              Networking is not only social â€” it helps professionals understand different sectors, compare methods, 
              hear lessons learned, meet employers, build confidence and identify mentors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#upcoming" className="btn-primary inline-flex items-center gap-2">
                <i className="ri-calendar-event-line" />
                View Upcoming Events
              </a>
              <Link to="/information-session" className="btn-secondary inline-flex items-center gap-2">
                <i className="ri-mail-line" />
                Enquire About Events
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section id="upcoming" className="bg-background-50 section-padding">
        <div className="container-content">
          <div className="reveal">
            <SectionHeader
              eyebrow="Calendar"
              title="Upcoming events"
              subtitle="Master classes, technical sessions, roundtables, mentoring circles and club meetings across London, Nottingham, Manchester and Kent."
            />
          </div>
          <div className="mt-12 md:mt-16">
            {eventsLoading && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading events">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="animate-pulse overflow-hidden border border-background-200/70 bg-background-100">
                    <div className="h-56 bg-background-200" />
                    <div className="space-y-4 p-6"><div className="h-3 w-2/5 bg-background-200" /><div className="h-6 w-4/5 bg-background-200" /><div className="h-16 bg-background-200" /></div>
                  </div>
                ))}
              </div>
            )}
            {!eventsLoading && upcomingEvents.length === 0 && (
              <div className="reveal border border-background-200/70 bg-background-100 p-6 md:p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center bg-primary-100 text-primary-700">
                  <i className="ri-calendar-event-line text-xl" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-background-950 mb-2">
                  {eventsError ? "Events are temporarily unavailable" : "No upcoming events yet"}
                </h3>
                <p className="text-sm text-foreground-600 max-w-xl mx-auto">
                  {eventsError || "New IPC events will be published here as soon as registration opens."}
                </p>
              </div>
            )}
            {/* Featured Event â€” with image */}
            {upcomingEvents.filter(e => e.highlight).map((event, index) => (
              <div
                key={event.title}
                className="reveal reveal-delay-1 group relative overflow-hidden  bg-background-950 shadow-lg mb-8"
              >
                <div className="flex flex-col lg:flex-row">
                  <div className="lg:w-[45%] shrink-0 relative overflow-hidden">
                    <img
            loading="lazy"
            decoding="async"
                      src={event.image}
                      alt={event.title}
                      className="w-full h-64 lg:h-full object-cover image-zoom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-950/55 via-transparent to-transparent" />
                    <div className="absolute top-0 right-0">
                      <div className="bg-primary-500 text-background-950 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5">
                        Featured
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-primary-500 flex items-center justify-center shrink-0">
                        <i className="ri-calendar-line text-xl text-background-950" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-background-50 leading-tight">{event.date}</p>
                        <p className="text-xs text-background-400">{event.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <i className="ri-map-pin-line text-xs text-accent-600" />
                      <span className="text-xs font-medium text-accent-300">{event.location}</span>
                    </div>
                    <h3 className="font-heading text-xl md:text-2xl font-semibold text-background-50 mb-3 leading-tight">
                      {event.title}
                    </h3>
                    <p className="text-sm text-background-300 leading-relaxed mb-4">{event.description}</p>
                    <p className="text-xs text-background-400 mb-5">
                      <i className="ri-building-line mr-1" />
                      {event.venue}
                    </p>
                    <div>
                      <a
                        href={event.url || "#register"}
                        target={event.external ? "_blank" : undefined}
                        rel={event.external ? "noreferrer" : undefined}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-primary-500 text-background-950 hover:bg-primary-400 transition-all duration-300 whitespace-nowrap"
                      >
                        {event.external ? "Register on Eventbrite" : "View event"}
                        <i className="ri-arrow-right-line" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Remaining Events */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {upcomingEvents.filter(e => !e.highlight).map((event, index) => (
                <article
                  key={event.id ?? event.title}
                  className={`reveal reveal-delay-${Math.min(index + 2, 6)} group flex h-full flex-col overflow-hidden  bg-background-950 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-primary-500/60 hover:shadow-xl`}
                >
                  <div className="relative h-56 overflow-hidden bg-background-200">
                    <img loading="lazy" decoding="async" src={event.image} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-950 via-background-950/10 to-transparent" />
                    <span className="absolute bottom-4 left-4 inline-flex max-w-[calc(100%-2rem)] items-center gap-1.5 bg-background-950/85 px-3 py-1.5 text-xs font-medium text-background-50 backdrop-blur-sm">
                      <i className="ri-map-pin-line shrink-0 text-primary-400" />
                      <span className="truncate">{event.location}</span>
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-4 flex items-start gap-3 border-b border-background-800 pb-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-primary-500 text-background-950">
                        <i className="ri-calendar-line text-lg" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-tight text-background-50">{event.date}</p>
                        <p className="mt-1 text-xs text-background-400">{event.time}</p>
                      </div>
                    </div>
                    <h3 className="mb-3 font-heading text-xl font-semibold leading-tight text-background-50">{event.title}</h3>
                    <p className="mb-4 line-clamp-4 text-sm leading-relaxed text-background-300">{event.description}</p>
                    <p className="mb-5 mt-auto flex items-start gap-2 text-xs text-background-400">
                      <i className="ri-building-line mt-0.5 shrink-0 text-accent-600" />
                      <span>{event.venue}</span>
                    </p>
                    <a
                      href={event.url || "#register"}
                      target={event.external ? "_blank" : undefined}
                      rel={event.external ? "noreferrer" : undefined}
                      className="inline-flex w-full items-center justify-center gap-2 bg-primary-500 px-5 py-3 text-sm font-semibold text-background-950 transition-colors hover:bg-primary-400"
                    >
                      {event.external ? "Register on Eventbrite" : "View event"}
                      <i className={event.external ? "ri-external-link-line" : "ri-arrow-right-line"} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* London Master Class */}
      <section className="bg-background-950 section-padding">
        <div className="container-content">
          {!pageContent && !contentError && (
            <div className="flex items-center justify-center gap-3 py-20 text-background-300" role="status">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-background-700 border-t-primary-500" aria-hidden="true" />
              Loading featured programme…
            </div>
          )}
          {contentError && (
            <div className="border border-red-900 bg-red-950/50 px-6 py-8 text-center text-red-200" role="alert">
              {contentError}
            </div>
          )}
          {featuredProgramme && <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
            <div className="flex-1 reveal">
              <span className="eyebrow text-primary-400 mb-4 block">{featuredProgramme.eyebrow}</span>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-background-50 mb-6">
                {featuredProgramme.title}
              </h2>
              <p className="text-base md:text-lg text-background-300 leading-relaxed mb-8">
                {featuredProgramme.description}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {featuredProgramme.highlights.map((highlight, index) => {
                  const accent = highlight.tone === "accent";
                  return (
                    <div key={highlight.title} className={`bg-background-900 p-5 reveal reveal-delay-${index + 1}`}>
                      <div className={`w-10 h-10 ${accent ? "bg-accent-500/20" : "bg-primary-500/20"} flex items-center justify-center mb-3`}>
                        <i className={`${highlight.icon} ${accent ? "text-accent-400" : "text-primary-400"} text-lg`} />
                      </div>
                      <h4 className="font-heading text-sm font-semibold text-background-50 mb-2">{highlight.title}</h4>
                      <p className="text-xs text-background-400 leading-relaxed">{highlight.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="lg:w-[42%] shrink-0 reveal reveal-delay-1">
              <div className="overflow-hidden">
                <img
            loading="lazy"
            decoding="async"
                  src={featuredProgramme.image_url}
                  alt={featuredProgramme.image_alt}
                  className="w-full h-auto image-zoom"
                />
              </div>
            </div>
          </div>}
        </div>
      </section>

      {/* Event Formats â€” with images */}
      <section className="bg-background-50 section-padding">
        <div className="container-content">
          <div className="reveal">
            <SectionHeader
              eyebrow="Formats"
              title="Event formats"
              subtitle="The Institute uses multiple formats to serve different learning styles, seniority levels and professional needs."
              centered
            />
          </div>
          <div className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {!pageContent && !contentError && (
              <div className="col-span-full flex items-center justify-center gap-3 py-16 text-foreground-600" role="status">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-background-300 border-t-primary-600" aria-hidden="true" />
                Loading event formats…
              </div>
            )}
            {contentError && (
              <div className="col-span-full border border-red-200 bg-red-50 px-6 py-8 text-center text-red-800" role="alert">
                {contentError}
              </div>
            )}
            {pageContent && formats.map((format, index) => (
              <div key={format.title} className={`reveal reveal-delay-${index + 1}`}>
                <div className="bg-background-100 border border-background-200/70 overflow-hidden h-full transition-all duration-300 hover:border-primary-200 group">
                  <div className="relative overflow-hidden h-48">
                    <img
            loading="lazy"
            decoding="async"
                      src={format.image}
                      alt={format.title}
                      className="w-full h-full object-cover image-zoom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-950/60 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <div className="w-8 h-8 bg-background-50/20 backdrop-blur-sm flex items-center justify-center">
                        <i className={`${format.icon} text-background-50`} />
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="font-heading text-base font-semibold text-background-950 mb-2">{format.title}</h4>
                    <p className="text-sm text-foreground-600 leading-relaxed">{format.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Events Support â€” with background image */}
      <section className="relative bg-background-950 section-padding overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <img
            loading="lazy"
            decoding="async"
            src="https://readdy.ai/api/search-image?query=Diverse%20group%20of%20professionals%20networking%20at%20an%20elegant%20evening%20reception%2C%20warm%20golden%20ambient%20lighting%2C%20modern%20venue%20with%20high%20ceilings%2C%20people%20in%20conversation%20holding%20drinks%2C%20sophisticated%20corporate%20event%20atmosphere%2C%20soft%20bokeh%20background%2C%20abstract%20blur%20effect%2C%20no%20visible%20faces%20in%20focus&width=1600&height=800&seq=events-audience-bg-02&orientation=landscape"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 container-content">
          <div className="reveal">
            <SectionHeader
              eyebrow="Audience"
              title="Who events support"
              subtitle="Events serve the full spectrum of the project controls community, from learners to senior leaders."
              light
              centered
              eyebrowClassName="text-white"
            />
          </div>
          <div className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {!pageContent && !contentError && (
              <div className="col-span-full flex items-center justify-center gap-3 py-16 text-background-300" role="status">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-background-700 border-t-primary-500" aria-hidden="true" />
                Loading event audiences…
              </div>
            )}
            {contentError && (
              <div className="col-span-full border border-red-900 bg-red-950/50 px-6 py-8 text-center text-red-200" role="alert">
                {contentError}
              </div>
            )}
            {pageContent && audiences.map((audience, index) => (
              <div key={audience.title} className={`reveal reveal-delay-${index + 1}`}>
                <FeatureCard icon={audience.icon} title={audience.title} description={audience.description} light />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="register" className="bg-background-100 section-padding">
        <div className="container-content">
          <div className="reveal max-w-3xl mb-10">
            <span className="eyebrow text-primary-600 mb-4 block">Register</span>
            <h2 className="font-heading text-3xl md:text-4xl font-semibold text-background-950 mb-4">Event registration</h2>
            <p className="text-foreground-600 leading-relaxed">Choose a published event above to view its details and complete the secure step-by-step registration.</p>
          </div>
          <a href="#upcoming" className="btn-primary inline-flex items-center gap-2">Choose an event <i className="ri-arrow-up-line" /></a>
        </div>
      </section>
      {/* CTA */}
      <section className="bg-background-50 py-20 md:py-28">
        <div className="container-content text-center">
          <div className="reveal max-w-2xl mx-auto">
            <span className="eyebrow text-primary-600 mb-4 block">Get Involved</span>
            <h3 className="font-heading text-2xl md:text-3xl lg:text-4xl font-semibold text-background-950 mb-4">
              Join the conversation
            </h3>
            <p className="text-foreground-600 mb-8 text-base md:text-lg leading-relaxed">
              Enquire about upcoming master classes, regional club events, roundtables and mentoring circles. 
              Register your interest for specific events or discuss speaking, sponsorship and partnership opportunities.
            </p>
            <Link to="/information-session" className="btn-primary inline-flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                <i className="ri-mail-line text-background-50 text-sm" />
              </span>
              Enquire About Events
            </Link>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
              <div className="bg-background-100 p-4 reveal reveal-delay-1">
                <span className="text-xs font-semibold text-accent-700 uppercase tracking-wide block mb-1">Attend</span>
                <p className="text-xs text-foreground-500">Register for upcoming master classes and club events</p>
              </div>
              <div className="bg-background-100 p-4 reveal reveal-delay-2">
                <span className="text-xs font-semibold text-accent-700 uppercase tracking-wide block mb-1">Speak</span>
                <p className="text-xs text-foreground-500">Share your expertise as a speaker or panellist</p>
              </div>
              <div className="bg-background-100 p-4 reveal reveal-delay-3">
                <span className="text-xs font-semibold text-accent-700 uppercase tracking-wide block mb-1">Sponsor</span>
                <p className="text-xs text-foreground-500">Support events through ethical sponsorship</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
