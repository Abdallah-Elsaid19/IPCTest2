import SEO from "@/components/seo/SEO";
import { pageSeo } from "@/config/pageSeo";

export default function Privacy() {
  return (
    <div className="pt-24 md:pt-32 pb-20 container-content">
      <SEO {...pageSeo.privacy} />
      <h1 className="font-heading text-4xl md:text-5xl text-background-950 mb-6">
        Privacy & Policies
      </h1>
      <p className="text-foreground-600 text-lg max-w-reading">
        This page will contain policy navigation, accordion sections, and formal callouts.
      </p>
    </div>
  );
}