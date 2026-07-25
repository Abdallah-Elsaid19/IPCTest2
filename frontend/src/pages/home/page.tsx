import { useEffect } from "react";
import InstitutionAuthority from "./components/InstitutionAuthority";
import DisciplineSystem from "./components/DisciplineSystem";
import RecognitionPathway from "./components/RecognitionPathway";
import IntelligenceLayer from "./components/IntelligenceLayer";
import KnowledgeMosaic from "./components/KnowledgeMosaic";
import CommunityMetrics from "./components/CommunityMetrics";
import CtaTerminal from "./components/CtaTerminal";
import HeroCanvas from "./components/HeroCanvas";
import MemberValue from "./components/MemberValue";
import OrganisationalValue from "./components/OrganisationalValue";
import CredibilityStrip from "./components/CredibilityStrip";
import { ManagedContentProvider } from "@/components/content/ManagedContentProvider";
import ManagedPageSeo from "@/components/content/ManagedPageSeo";
import { pageSeo } from "@/config/pageSeo";

export default function Home() {
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
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" }
    );

    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <ManagedContentProvider endpoint="/api/home/content" slug="home">
      <div className="bg-background-950 sm:bg-background-50">
      <ManagedPageSeo fallback={{ ...pageSeo.home, canonical_path: pageSeo.home.canonicalPath }} />
      <HeroCanvas />
      {/* <CredibilityStrip /> */}
      <InstitutionAuthority />
      <DisciplineSystem />
      <RecognitionPathway />
      <IntelligenceLayer />
      {/* <KnowledgeMosaic /> */}
      <MemberValue />
      <OrganisationalValue />
      {/* <CommunityMetrics /> */}
      <CtaTerminal />
      </div>
    </ManagedContentProvider>
  );
}
