import { SEO_CONFIG, toAbsoluteUrl } from "@/config/seoConfig";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface EventSchemaInput {
  name: string;
  description: string;
  canonicalPath: string;
  image?: string;
  startDate: string | null;
  endDate?: string | null;
  isOnline: boolean;
  location?: string;
  eventStatus?: "EventScheduled" | "EventCancelled" | "EventPostponed";
  offerAvailability?: "InStock" | "SoldOut";
}

/** Site-wide Organization schema — safe to include on every public page. */
export function buildOrganizationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SEO_CONFIG.siteName,
    url: SEO_CONFIG.siteUrl || undefined,
    logo: SEO_CONFIG.organizationLogo,
  };
}

/** WebSite schema for the homepage only. */
export function buildWebsiteSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SEO_CONFIG.siteName,
    url: SEO_CONFIG.siteUrl || undefined,
  };
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path),
    })),
  };
}

export function buildAboutPageSchema(description: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `About ${SEO_CONFIG.siteName}`,
    description,
    url: toAbsoluteUrl("/about"),
  };
}

export function buildContactPageSchema(description: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact ${SEO_CONFIG.siteName}`,
    description,
    url: toAbsoluteUrl("/contact"),
  };
}

/** Event schema — only known fields are populated; nothing is invented. */
export function buildEventSchema(event: EventSchemaInput): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description: event.description,
    url: toAbsoluteUrl(event.canonicalPath),
    eventAttendanceMode: event.isOnline
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: `https://schema.org/${event.eventStatus || "EventScheduled"}`,
    organizer: {
      "@type": "Organization",
      name: SEO_CONFIG.siteName,
      url: SEO_CONFIG.siteUrl || undefined,
    },
  };

  if (event.startDate) schema.startDate = event.startDate;
  if (event.endDate) schema.endDate = event.endDate;
  if (event.image) schema.image = toAbsoluteUrl(event.image);
  schema.location = event.isOnline
    ? { "@type": "VirtualLocation", url: toAbsoluteUrl(event.canonicalPath) }
    : { "@type": "Place", name: event.location || "Venue to be confirmed" };

  return schema;
}
