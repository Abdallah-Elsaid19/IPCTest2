import {
  ManagedContentProvider,
  ManagedSectionGate,
} from "@/components/content/ManagedContentProvider";
import ManagedPageSeo from "@/components/content/ManagedPageSeo";
import { pageSeo } from "@/config/pageSeo";
import { buildBreadcrumbSchema } from "@/lib/seo/structuredData";

import {
  AudienceValue,
  ContributorValue,
  EditorialProcess,
  EditorialThemes,
  EditorialValues,
  PartnerValue,
  PublicationFaq,
  PublicationFinalCta,
  PublicationHero,
  PublicationRoutes,
  PublicationSponsorship,
  ResearchIntegrity,
  SubmissionFormats,
  WhyPublish,
} from "./components/PublicationSections";

export default function PublicationsPage() {
  return (
    <ManagedContentProvider endpoint="/api/publications/content" slug="publications">
      <ManagedSectionGate name="seo">
        <ManagedPageSeo
          fallback={{
            ...pageSeo.publications,
            canonical_path: pageSeo.publications.canonicalPath,
          }}
          structuredData={buildBreadcrumbSchema([
            { name: "Home", path: "/home" },
            { name: "Publications, Research & Professional Knowledge", path: "/publications" },
          ])}
        />
      </ManagedSectionGate>
      <ManagedSectionGate name="hero"><PublicationHero /></ManagedSectionGate>
      <ManagedSectionGate name="why_publish"><WhyPublish /></ManagedSectionGate>
      <ManagedSectionGate name="routes"><PublicationRoutes /></ManagedSectionGate>
      <ManagedSectionGate name="themes"><EditorialThemes /></ManagedSectionGate>
      <ManagedSectionGate name="formats"><SubmissionFormats /></ManagedSectionGate>
      <ManagedSectionGate name="audiences"><AudienceValue /></ManagedSectionGate>
      <ManagedSectionGate name="principles"><EditorialValues /></ManagedSectionGate>
      <ManagedSectionGate name="integrity"><ResearchIntegrity /></ManagedSectionGate>
      <ManagedSectionGate name="process"><EditorialProcess /></ManagedSectionGate>
      <ManagedSectionGate name="contributor_value"><ContributorValue /></ManagedSectionGate>
      <ManagedSectionGate name="partner_value"><PartnerValue /></ManagedSectionGate>
      <ManagedSectionGate name="sponsorship"><PublicationSponsorship /></ManagedSectionGate>
      <ManagedSectionGate name="faq"><PublicationFaq /></ManagedSectionGate>
      <ManagedSectionGate name="final_cta"><PublicationFinalCta /></ManagedSectionGate>
    </ManagedContentProvider>
  );
}
