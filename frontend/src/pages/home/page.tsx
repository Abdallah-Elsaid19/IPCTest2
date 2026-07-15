import { useEffect } from "react";
import InstitutionAuthority from "./components/InstitutionAuthority";
import DisciplineSystem from "./components/DisciplineSystem";
import RecognitionPathway from "./components/RecognitionPathway";
import IntelligenceLayer from "./components/IntelligenceLayer";
import KnowledgeMosaic from "./components/KnowledgeMosaic";
import CommunityMetrics from "./components/CommunityMetrics";
import CtaTerminal from "./components/CtaTerminal";
import HeroCanvas from "./components/HeroCanvas";

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
    <div className="bg-background-50">
      <HeroCanvas />
      <InstitutionAuthority />
      <DisciplineSystem />
      <RecognitionPathway />
      <IntelligenceLayer />
      <KnowledgeMosaic />
      <CommunityMetrics />
      <CtaTerminal />
    </div>
  );
}