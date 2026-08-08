import { useEffect } from "react";
import { ManagedContentProvider, ManagedSectionGate } from "@/components/content/ManagedContentProvider";
import ManagedPageSeo from "@/components/content/ManagedPageSeo";
import { pageSeo } from "@/config/pageSeo";
import SponsorshipBenefits from "./components/SponsorshipBenefits";
import SponsorshipFaq from "./components/SponsorshipFaq";
import SponsorshipFinalCta from "./components/SponsorshipFinalCta";
import SponsorshipHero from "./components/SponsorshipHero";
import SponsorshipIntegrity from "./components/SponsorshipIntegrity";
import SponsorshipPartners from "./components/SponsorshipPartners";
import SponsorshipPrinciples from "./components/SponsorshipPrinciples";
import SponsorshipProcess from "./components/SponsorshipProcess";
import SponsorshipPurpose from "./components/SponsorshipPurpose";
import SponsorshipRecognitionLevels from "./components/SponsorshipRecognitionLevels";
import SponsorshipRoutes from "./components/SponsorshipRoutes";
import SponsorshipScholarshipFeature from "./components/SponsorshipScholarshipFeature";

export default function Sponsorship() {
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
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );

    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <ManagedContentProvider endpoint="/api/sponsorship" slug="sponsorship">
      <div>
      <ManagedPageSeo fallback={{ ...pageSeo.sponsorship, canonical_path: pageSeo.sponsorship.canonicalPath }} />
      <SponsorshipHero />
      <SponsorshipPrinciples />
      <SponsorshipPurpose />
      <SponsorshipPartners />
      <SponsorshipRoutes />
      <SponsorshipScholarshipFeature />
      <SponsorshipBenefits />
      <SponsorshipRecognitionLevels />
      <SponsorshipIntegrity />
      <SponsorshipProcess />
      <ManagedSectionGate name="faq">
        <SponsorshipFaq />
      </ManagedSectionGate>
      <SponsorshipFinalCta />
      </div>
    </ManagedContentProvider>
  );
}
