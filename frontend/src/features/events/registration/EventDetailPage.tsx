import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Clock3,
  ExternalLink,
  Images,
  MapPin,
  Monitor,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SEO from "@/components/seo/SEO";
import { truncateDescription } from "@/config/seoConfig";
import { buildEventSchema } from "@/lib/seo/structuredData";
import { registrationApi } from "./api";
import type { RegistrationEvent } from "./types";

const dateTime = (
  value: string | null,
  options: Intl.DateTimeFormatOptions,
) =>
  value
    ? new Intl.DateTimeFormat("en-GB", options).format(new Date(value))
    : "To be confirmed";

function EventDescription({ description }: { description: string }) {
  const paragraphs = useMemo(
    () =>
      description
        .replace(/\r\n/g, "\n")
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean),
    [description],
  );

  if (!paragraphs.length) {
    return (
      <p className="text-base leading-8 text-foreground-700">
        Further event details will be published shortly.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {paragraphs.map((paragraph, index) => (
        <p
          key={`${paragraph.slice(0, 48)}-${index}`}
          className="whitespace-pre-line text-base leading-8 text-foreground-700 md:text-lg"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}

const eventbriteAllowedTags = new Set([
  "A",
  "ASIDE",
  "B",
  "BLOCKQUOTE",
  "BR",
  "DIV",
  "EM",
  "H1",
  "H2",
  "H3",
  "H4",
  "I",
  "IFRAME",
  "IMG",
  "LI",
  "OL",
  "P",
  "SPAN",
  "STRONG",
  "UL",
]);

function safeExternalUrl(value: string, allowEmail = false) {
  try {
    const url = new URL(value, window.location.origin);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.href;
    }
    if (allowEmail && url.protocol === "mailto:") {
      return url.href;
    }
  } catch {
    return "";
  }
  return "";
}

type EventbriteMedia = {
  type: "image" | "video";
  src: string;
  alt: string;
};

function sanitizeEventbriteHtml(html: string) {
  if (!html || typeof window === "undefined") {
    return { html: "", media: [] as EventbriteMedia[] };
  }

  const documentNode = new DOMParser().parseFromString(html, "text/html");
  const media: EventbriteMedia[] = [];
  documentNode
    .querySelectorAll(
      "script,style,link,meta,object,embed,form,input,button,textarea,select,svg",
    )
    .forEach((element) => element.remove());

  Array.from(documentNode.body.querySelectorAll("*")).forEach((element) => {
    if (!eventbriteAllowedTags.has(element.tagName)) {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }

    const href = element.getAttribute("href") || "";
    const src = element.getAttribute("src") || "";
    const alt = element.getAttribute("alt") || "";
    Array.from(element.attributes).forEach((attribute) =>
      element.removeAttribute(attribute.name),
    );

    if (element.tagName === "A") {
      const safeHref = safeExternalUrl(href, true);
      if (safeHref) {
        element.setAttribute("href", safeHref);
        element.setAttribute("target", "_blank");
        element.setAttribute("rel", "noreferrer noopener");
      }
    }

    if (element.tagName === "IMG") {
      const safeSrc = safeExternalUrl(src);
      if (safeSrc) {
        media.push({
          type: "image",
          src: safeSrc,
          alt: alt || "Event image",
        });
        element.setAttribute("src", safeSrc);
        element.setAttribute("alt", alt);
        element.setAttribute("loading", "lazy");
        element.setAttribute("decoding", "async");
        const mediaWrapper = element.parentElement;
        if (
          mediaWrapper &&
          !mediaWrapper.textContent?.trim() &&
          mediaWrapper.querySelectorAll("img, iframe").length === 1
        ) {
          mediaWrapper.classList.add("eventbrite-media-item");
        } else {
          element.classList.add("eventbrite-media");
        }
      } else {
        element.remove();
      }
    }

    if (element.tagName === "IFRAME") {
      const safeSrc = safeExternalUrl(src);
      const hostname = safeSrc ? new URL(safeSrc).hostname : "";
      const isSupportedVideo =
        hostname.endsWith("youtube.com") ||
        hostname.endsWith("youtube-nocookie.com") ||
        hostname.endsWith("vimeo.com");
      if (isSupportedVideo) {
        media.push({
          type: "video",
          src: safeSrc,
          alt: "Event video",
        });
        element.setAttribute("src", safeSrc);
        element.setAttribute("title", "Event video");
        element.setAttribute("loading", "lazy");
        element.setAttribute("allowfullscreen", "");
        const mediaWrapper = element.parentElement;
        if (
          mediaWrapper &&
          !mediaWrapper.textContent?.trim() &&
          mediaWrapper.querySelectorAll("img, iframe").length === 1
        ) {
          mediaWrapper.classList.add("eventbrite-media-item");
        } else {
          element.classList.add("eventbrite-media");
        }
      } else {
        element.remove();
      }
    }
  });

  documentNode.body
    .querySelectorAll(
      ".eventbrite-media-item, img.eventbrite-media, iframe.eventbrite-media",
    )
    .forEach((element) => element.remove());

  Array.from(documentNode.body.querySelectorAll("div"))
    .reverse()
    .forEach((element) => {
      if (!element.textContent?.trim() && !element.querySelector("img, iframe")) {
        element.remove();
      }
    });

  const uniqueMedia = media.filter(
    (item, index, items) =>
      items.findIndex(
        (candidate) =>
          candidate.type === item.type && candidate.src === item.src,
      ) === index,
  );

  return {
    html: documentNode.body.innerHTML,
    media: uniqueMedia,
  };
}

function EventbriteDescription({
  event,
  html,
}: {
  event: RegistrationEvent;
  html: string;
}) {
  if (!html) {
    return <EventDescription description={event.description} />;
  }

  return (
    <div
      className="
        max-w-none text-base leading-8 text-foreground-700 md:text-lg
        [&_a]:font-semibold [&_a]:text-primary-700 [&_a]:underline [&_a]:decoration-primary-300
        [&_a]:underline-offset-4 hover:[&_a]:text-primary-600
        [&_aside]:my-7 [&_aside]:border-l-4 [&_aside]:border-primary-500
        [&_aside]:bg-background-100 [&_aside]:px-6 [&_aside]:py-5
        [&_blockquote]:my-7 [&_blockquote]:border-l-4 [&_blockquote]:border-primary-500
        [&_blockquote]:bg-background-100 [&_blockquote]:px-6 [&_blockquote]:py-5
        [&_h1]:mb-5 [&_h1]:mt-12 [&_h1]:font-heading [&_h1]:text-3xl
        [&_h1]:font-semibold [&_h1]:leading-tight [&_h1]:text-background-950
        [&_h2]:mb-5 [&_h2]:mt-12 [&_h2]:border-t [&_h2]:border-background-300
        [&_h2]:pt-9 [&_h2]:font-heading [&_h2]:text-3xl [&_h2]:font-semibold
        [&_h2]:leading-tight [&_h2]:text-background-950 md:[&_h2]:text-4xl
        [&_h3]:mb-4 [&_h3]:mt-9 [&_h3]:font-heading [&_h3]:text-2xl
        [&_h3]:font-semibold [&_h3]:text-background-950
        [&_h4]:mb-3 [&_h4]:mt-7 [&_h4]:font-heading [&_h4]:text-xl
        [&_h4]:font-semibold [&_h4]:text-background-950
        [&_li]:mb-2 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:space-y-2
        [&_ol]:pl-6 [&_p]:my-5 [&_strong]:font-semibold [&_strong]:text-background-950
        [&_ul]:my-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6
      "
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function EventMediaModal({
  eventTitle,
  media,
  onClose,
}: {
  eventTitle: string;
  media: EventbriteMedia[];
  onClose: () => void;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-background-950/85 p-4 backdrop-blur-sm md:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-media-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-7xl flex-col overflow-hidden border border-background-700 bg-background-50 shadow-2xl">
        <header className="flex items-start justify-between gap-6 border-b border-background-300 px-5 py-5 md:px-8">
          <div>
            <p className="eyebrow text-primary-700">Event media</p>
            <h2
              id="event-media-title"
              className="mt-2 font-heading text-2xl font-semibold leading-tight text-background-950 md:text-3xl"
            >
              Media about this event
            </h2>
            <p className="mt-2 line-clamp-1 text-sm text-foreground-600">
              {eventTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 shrink-0 place-items-center border border-background-300 bg-white text-background-950 transition-colors hover:border-primary-500 hover:bg-primary-500"
            aria-label="Close event media"
          >
            <X size={22} />
          </button>
        </header>

        <div className="overflow-y-auto p-5 md:p-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {media.map((item, index) =>
              item.type === "image" ? (
                <a
                  key={`${item.src}-${index}`}
                  href={item.src}
                  target="_blank"
                  rel="noreferrer"
                  className="group block overflow-hidden border border-background-300 bg-white"
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] h-full max-h-64 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </a>
              ) : (
                <div
                  key={`${item.src}-${index}`}
                  className="overflow-hidden border border-background-300 bg-background-950"
                >
                  <iframe
                    src={item.src}
                    title={`${item.alt} ${index + 1}`}
                    loading="lazy"
                    allowFullScreen
                    className="aspect-video max-h-64 w-full"
                  />
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EventDetailPage() {
  const { slug = "" } = useParams();
  const [event, setEvent] = useState<RegistrationEvent | null>(null);
  const [error, setError] = useState("");
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const eventbriteContent = useMemo(
    () => sanitizeEventbriteHtml(event?.details_content?.html || ""),
    [event?.details_content?.html],
  );

  useEffect(() => {
    registrationApi
      .config(slug)
      .then(setEvent)
      .catch((reason: unknown) => {
        setError(
          reason instanceof Error ? reason.message : "Could not load this event.",
        );
      });
  }, [slug]);

  if (error) {
    return (
      <div className="container-content py-24 text-center">
        <SEO
          title="Event Unavailable"
          description="This event could not be found."
          canonicalPath={`/events/${slug}`}
          noIndex
        />
        <h1 className="font-heading text-3xl font-bold">Event unavailable</h1>
        <p className="mt-3 text-foreground-600">{error}</p>
        <Link to="/events" className="btn-primary mt-7 inline-flex">
          Back to events
        </Link>
      </div>
    );
  }

  if (!event) {
    return (
      <div
        className="container-content grid min-h-[55vh] place-items-center"
        role="status"
      >
        <SEO
          title="Event"
          description="Loading event details…"
          canonicalPath={`/events/${slug}`}
          noIndex
        />
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  const location = event.is_online_event
    ? "Online event"
    : event.venue_name || event.location || "Venue to be confirmed";
  const eventDescription =
    event.description ||
    `Join this Institute of Project Controls event: ${event.title}.`;
  const displayTimeZone = event.eventbrite_id ? "UTC" : event.timezone;
  const displayTimeZoneLabel = event.eventbrite_id ? "GMT" : event.timezone;
  const date = dateTime(event.starts_at, {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: displayTimeZone,
  });
  const startTime = dateTime(event.starts_at, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: displayTimeZone,
  });
  const endTime = event.ends_at
    ? dateTime(event.ends_at, {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: displayTimeZone,
      })
    : "";
  const time = endTime ? `${startTime} – ${endTime}` : startTime;
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

  const registrationCta = event.eventbrite_id ? (
    <a
      href={event.eventbrite_url}
      target="_blank"
      rel="noreferrer"
      className="btn-primary inline-flex w-full justify-center"
    >
      Register on Eventbrite
      <ExternalLink size={16} />
    </a>
  ) : event.registration_is_open ? (
    <Link
      to={`/events/${event.slug}/register`}
      className="btn-primary inline-flex w-full justify-center"
    >
      Register now
      <ArrowRight size={16} />
    </Link>
  ) : (
    <div className="bg-background-100 p-4 text-sm font-semibold text-foreground-700">
      {event.registration_closed_reason}
    </div>
  );

  return (
    <main className="bg-background-50 pb-20">
      <SEO
        title={event.title}
        description={truncateDescription(eventDescription)}
        canonicalPath={`/events/${event.slug}`}
        image={event.image_url || undefined}
        type="article"
        structuredData={eventSchema}
      />

      <section className="relative overflow-hidden bg-background-950 pt-24 text-background-50">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_15%_20%,rgba(214,146,31,.24),transparent_30%),radial-gradient(circle_at_85%_80%,rgba(214,146,31,.14),transparent_34%)]" />
        <div className="container-content relative grid min-h-[540px] items-stretch gap-10 py-12 lg:grid-cols-[1.08fr_.92fr] lg:py-16">
          <div className="flex max-w-4xl flex-col justify-center">
            <Link
              to="/events"
              className="mb-8 inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary-300 transition-colors hover:text-primary-200"
            >
              <ArrowLeft size={16} />
              All events
            </Link>
            <p className="eyebrow text-primary-400">
              {event.is_online_event ? "Online IPC Event" : "IPC Event"}
            </p>
            <h1 className="mt-5 font-heading text-[clamp(2.6rem,5vw,5rem)] font-semibold leading-[.98] tracking-[-.045em]">
              {event.title}
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-background-300">
              Review the event programme, practical details and registration
              route below.
            </p>
          </div>

          <div className="relative min-h-72 overflow-hidden border border-background-800 bg-background-900 lg:min-h-full">
            {event.image_url ? (
              <picture>
                <source media="(min-width: 768px)" srcSet={event.image_url} />
                <img
                  src={event.image_thumbnail_url || event.image_url}
                  alt={event.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </picture>
            ) : (
              <div className="grid h-full min-h-72 place-items-center text-primary-400">
                <CalendarDays size={72} strokeWidth={1} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background-950/75 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 bg-primary-500 px-6 py-4 text-background-950">
              <span className="block text-xs font-bold uppercase tracking-[.18em]">
                Event date
              </span>
              <strong className="mt-1 block text-lg">{date}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-background-300 bg-primary-500 text-background-950">
        <dl className="container-content grid sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: CalendarDays, label: "Date", value: date },
            {
              icon: Clock3,
              label: "Time",
              value: `${time} (${displayTimeZoneLabel})`,
            },
            {
              icon: event.is_online_event ? Monitor : MapPin,
              label: "Format",
              value: location,
            },
            {
              icon: Building2,
              label: "Venue",
              value:
                event.venue_name ||
                (event.is_online_event ? "Online" : "To be confirmed"),
            },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="border-b border-background-950/20 p-5 sm:border-r lg:border-b-0"
            >
              <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em]">
                <Icon size={16} />
                {label}
              </dt>
              <dd className="mt-2 text-sm font-semibold leading-6">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="container-content grid gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-20">
        <article className="min-w-0">
          <p className="eyebrow text-primary-700">Event programme</p>
          <h2 className="mt-4 max-w-3xl font-heading text-3xl font-semibold leading-tight text-background-950 md:text-5xl">
            About this event
          </h2>
          <div className="mt-8 border-t border-background-300 pt-8">
            <EventbriteDescription event={event} html={eventbriteContent.html} />
          </div>
        </article>

        <aside className="h-fit border border-background-300 bg-white p-6 shadow-[0_20px_55px_rgba(33,29,25,.10)] lg:sticky lg:top-28">
          <p className="eyebrow text-primary-700">Registration</p>
          <h2 className="mt-4 font-heading text-2xl font-semibold text-background-950">
            Secure your place
          </h2>
          <p className="mt-3 text-sm leading-6 text-foreground-600">
            Registration and ticket availability are confirmed through the
            official booking route.
          </p>
          <div className="my-6 space-y-4 border-y border-background-300 py-6 text-sm text-foreground-700">
            <p className="flex gap-3">
              <CalendarDays className="shrink-0 text-primary-600" size={19} />
              <span>{date}</span>
            </p>
            <p className="flex gap-3">
              <Clock3 className="shrink-0 text-primary-600" size={19} />
              <span>{time}</span>
            </p>
            <p className="flex gap-3">
              <MapPin className="shrink-0 text-primary-600" size={19} />
              <span>{location}</span>
            </p>
            {!event.eventbrite_id && event.available_places !== null && (
              <p className="flex gap-3">
                <Users className="shrink-0 text-primary-600" size={19} />
                <span>{event.available_places} place(s) available</span>
              </p>
            )}
          </div>
          {registrationCta}
          {eventbriteContent.media.length > 0 && (
            <button
              type="button"
              onClick={() => setIsMediaOpen(true)}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 border border-background-950 bg-white px-5 py-4 text-sm font-bold uppercase tracking-[.06em] text-background-950 transition-colors hover:border-primary-500 hover:bg-background-100"
            >
              <Images size={18} />
              Media about this event
              <span className="text-xs text-primary-700">
                ({eventbriteContent.media.length})
              </span>
            </button>
          )}
          {event.eventbrite_id && (
            <p className="mt-4 text-xs leading-5 text-foreground-500">
              Booking opens securely in Eventbrite in a new tab.
            </p>
          )}
        </aside>
      </section>
      {isMediaOpen && eventbriteContent.media.length > 0 && (
        <EventMediaModal
          eventTitle={event.title}
          media={eventbriteContent.media}
          onClose={() => setIsMediaOpen(false)}
        />
      )}
    </main>
  );
}
