import { useEffect } from "react";
import { ManagedContentProvider } from "@/components/content/ManagedContentProvider";
import ManagedPageSeo from "@/components/content/ManagedPageSeo";
import { pageSeo } from "@/config/pageSeo";
import ScholarshipAudienceGrid from "./components/ScholarshipAudienceGrid";
import ScholarshipApplicationProcess from "./components/ScholarshipApplicationProcess";
import ScholarshipCommitment from "./components/ScholarshipCommitment";
import ScholarshipEligibility from "./components/ScholarshipEligibility";
import ScholarshipEnquiryCta from "./components/ScholarshipEnquiryCta";
import ScholarshipFaq from "./components/ScholarshipFaq";
import ScholarshipHero from "./components/ScholarshipHero";
import ScholarshipImpact from "./components/ScholarshipImpact";
import ScholarshipPartners from "./components/ScholarshipPartners";
import ScholarshipPrinciplesGrid from "./components/ScholarshipPrinciplesGrid";
import ScholarshipValueGrid from "./components/ScholarshipValueGrid";

export default function Scholarships() {
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
    <ManagedContentProvider endpoint="/api/scholarships" slug="scholarships">
      <div>
      <ManagedPageSeo fallback={{ ...pageSeo.scholarships, canonical_path: pageSeo.scholarships.canonicalPath }} />
      <ScholarshipHero />
      <ScholarshipCommitment />
      <ScholarshipPrinciplesGrid />
      <ScholarshipAudienceGrid />
      <ScholarshipValueGrid />
      <ScholarshipEligibility />
      <ScholarshipApplicationProcess />
      <ScholarshipPartners />
      <ScholarshipImpact />
      <ScholarshipFaq />
      <ScholarshipEnquiryCta />
      </div>
    </ManagedContentProvider>
  );
}
