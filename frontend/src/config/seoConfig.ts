/**
 * Global SEO defaults for the Institute of Project Controls site.
 *
 * `siteUrl` intentionally has no hard-coded production domain fallback — set
 * VITE_SITE_URL in the deployment environment. Without it, canonical/OG URLs
 * fall back to the current browser origin so links are still well-formed in
 * local/preview builds.
 */
export const SEO_CONFIG = {
  siteName: "Institute of Project Controls",
  siteUrl: resolveSiteUrl(import.meta.env.VITE_SITE_URL),
  defaultTitle: "Institute of Project Controls | A Professional Home for Project Controls",
  defaultDescription:
    "A professional home for project controls. Recognition, competence, community and career progression for project controls professionals worldwide.",
  defaultImage:
    "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/e6e47869fdd1459f891ad4c5852798c5.png",
  organizationLogo:
    "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/e6e47869fdd1459f891ad4c5852798c5.png",
  locale: "en_GB",
} as const;

function resolveSiteUrl(configuredUrl?: string): string {
  const value = configuredUrl?.trim().replace(/\/$/, "") || "";
  const isPlaceholder = /actual-production-domain\.com|example\.(com|org|net)/i.test(value);
  if (value && !isPlaceholder) return value;
  return typeof window !== "undefined" ? window.location.origin : "";
}

function normalizePath(path: string): string {
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  return withLeadingSlash.replace(/\/{2,}/g, "/");
}

/** Converts a relative path (or passes through an already-absolute URL) into an absolute URL. */
export function toAbsoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  if (!SEO_CONFIG.siteUrl) return path;
  return new URL(normalizePath(path), SEO_CONFIG.siteUrl).toString();
}

/** Builds a stable, duplicate-slash-free canonical URL for a given route path. */
export function buildCanonicalUrl(path: string): string {
  return toAbsoluteUrl(normalizePath(path));
}

/** Trims free-text content (e.g. API descriptions) to a safe meta-description length. */
export function truncateDescription(text: string, maxLength = 160): string {
  const singleLine = text.replace(/\s+/g, " ").trim();
  if (singleLine.length <= maxLength) return singleLine;
  return `${singleLine.slice(0, maxLength - 1).trimEnd()}…`;
}
