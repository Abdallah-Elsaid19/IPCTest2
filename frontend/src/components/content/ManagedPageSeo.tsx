import SEO from "@/components/seo/SEO";
import { useManagedSection } from "./ManagedContentProvider";

interface ManagedSeoContent {
  title: string;
  description: string;
  canonical_path?: string;
  canonical_url?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

export default function ManagedPageSeo({ fallback, structuredData }: { fallback: ManagedSeoContent; structuredData?: Record<string, unknown> | Array<Record<string, unknown>> }) {
  const seo = useManagedSection("seo", fallback);
  return <SEO title={seo.title} description={seo.description} canonicalPath={seo.canonical_path ?? seo.canonical_url ?? fallback.canonical_path ?? "/"} noIndex={seo.noindex || seo.nofollow} structuredData={structuredData} />;
}
