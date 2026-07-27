import { useEffect } from "react";

import {
  ManagedContentProvider,
  ManagedSectionGate,
  useManagedContentStatus,
} from "@/components/content/ManagedContentProvider";
import ManagedPageSeo from "@/components/content/ManagedPageSeo";
import { pageSeo } from "@/config/pageSeo";

import {
  AcademicSolutions,
  CapabilityDiagnostic,
  EmployerSolutions,
  ServiceArchitecture,
  ServiceAudienceMatrix,
  ServiceEngagement,
  ServiceExperienceFaq,
  ServiceOutcomes,
  ServicePrincipleLedger,
  ServicesExperienceCta,
  ServicesExperienceHero,
  ServicesImpactStrip,
  WhyServices,
} from "./components/ServicesExperience";
import ServicesPagePlaceholder from "./components/ServicesPagePlaceholder";

export default function ServicesPage() {
  return (
    <ManagedContentProvider endpoint="/api/services/content" slug="services">
      <ServicesContent />
    </ManagedContentProvider>
  );
}

function ServicesContent() {
  const { isLoading } = useManagedContentStatus();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.08, rootMargin: "0px 0px -32px 0px" });
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [isLoading]);

  return (
    <>
      <ManagedSectionGate name="seo"><ManagedPageSeo fallback={{ ...pageSeo.services, canonical_path: pageSeo.services.canonicalPath }} /></ManagedSectionGate>
      <ServicesExperienceHero />
      {isLoading ? (
        <ServicesPagePlaceholder />
      ) : (
        <>
          <ManagedSectionGate name="impact_strip"><ServicesImpactStrip /></ManagedSectionGate>
          <ManagedSectionGate name="why_services"><WhyServices /></ManagedSectionGate>
          <ManagedSectionGate name="audiences"><ServiceAudienceMatrix /></ManagedSectionGate>
          <ManagedSectionGate name="portfolio"><ServiceArchitecture /></ManagedSectionGate>
          <ManagedSectionGate name="quality"><CapabilityDiagnostic /></ManagedSectionGate>
          <ManagedSectionGate name="employer_solutions"><EmployerSolutions /></ManagedSectionGate>
          <ManagedSectionGate name="academic_solutions"><AcademicSolutions /></ManagedSectionGate>
          <ManagedSectionGate name="outcomes"><ServiceOutcomes /></ManagedSectionGate>
          <ManagedSectionGate name="engagement"><ServiceEngagement /></ManagedSectionGate>
          <ManagedSectionGate name="principles"><ServicePrincipleLedger /></ManagedSectionGate>
          <ManagedSectionGate name="faq"><ServiceExperienceFaq /></ManagedSectionGate>
          <ManagedSectionGate name="final_cta"><ServicesExperienceCta /></ManagedSectionGate>
        </>
      )}
    </>
  );
}
