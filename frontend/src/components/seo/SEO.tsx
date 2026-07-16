import { Helmet } from "react-helmet-async";
import { SEO_CONFIG, buildCanonicalUrl, toAbsoluteUrl } from "@/config/seoConfig";

export interface SEOProps {
  title: string;
  description: string;
  canonicalPath?: string;
  image?: string;
  keywords?: string[];
  noIndex?: boolean;
  type?: "website" | "article";
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
}

function buildFullTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return SEO_CONFIG.defaultTitle;
  return trimmed.includes(SEO_CONFIG.siteName) ? trimmed : `${trimmed} | ${SEO_CONFIG.siteName}`;
}

/**
 * Renders all page-level SEO tags (title, description, canonical, robots,
 * Open Graph, Twitter card and optional JSON-LD) via react-helmet-async.
 * Every route should render this once so navigation never inherits stale
 * metadata from the previous page.
 */
export default function SEO({
  title,
  description,
  canonicalPath = "/",
  image,
  keywords,
  noIndex = false,
  type = "website",
  structuredData,
}: SEOProps) {
  const fullTitle = buildFullTitle(title);
  const canonicalUrl = buildCanonicalUrl(canonicalPath);
  const absoluteImage = toAbsoluteUrl(image || SEO_CONFIG.defaultImage);
  const robotsContent = noIndex ? "noindex, nofollow" : "index, follow";
  const schemas = structuredData ? (Array.isArray(structuredData) ? structuredData : [structuredData]) : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && keywords.length > 0 && <meta name="keywords" content={keywords.join(", ")} />}
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:site_name" content={SEO_CONFIG.siteName} />
      <meta property="og:locale" content={SEO_CONFIG.locale} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />

      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
