import { useEffect } from "react";
import InstitutionAuthority from "./components/InstitutionAuthority";
import DisciplineSystem from "./components/DisciplineSystem";
import RecognitionPathway from "./components/RecognitionPathway";
import HeroCanvas from "./components/HeroCanvas";
import {
  HomeAudiences,
  HomeAwards,
  HomeClubs,
  HomeDecisionConfidence,
  HomeEcosystem,
  HomeEvents,
  HomeFaq,
  HomeFinalCta,
  HomeGovernance,
  HomePartners,
  HomePublications,
  HomeScholarships,
  HomeSponsorship,
  HomeValues,
  HomeWhyIpc,
} from "./components/HomeContentSections";
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
      <HomeDecisionConfidence />
      <InstitutionAuthority />
      <HomeWhyIpc />
      <RecognitionPathway />
      <DisciplineSystem />
      <HomeValues />
      <HomeAudiences />
      <HomeEcosystem />
      <HomeEvents />
      <HomeScholarships />
      <HomeAwards />
      <HomeClubs />
      <HomePublications />
      <HomePartners />
      <HomeSponsorship />
      <HomeGovernance />
      <HomeFaq />
      <HomeFinalCta />
      </div>
    </ManagedContentProvider>
  );
}
