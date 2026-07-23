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

export default function ManagedPageSeo({ fallback }: { fallback: ManagedSeoContent }) {
  const seo = useManagedSection("seo", fallback);
  return <SEO title={seo.title} description={seo.description} canonicalPath={seo.canonical_path ?? seo.canonical_url ?? fallback.canonical_path ?? "/"} noIndex={seo.noindex || seo.nofollow} />;
}
