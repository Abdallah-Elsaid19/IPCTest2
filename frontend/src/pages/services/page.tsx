import { useEffect } from "react";
import {
  ManagedContentProvider,
  ManagedSectionGate,
} from "@/components/content/ManagedContentProvider";
import ManagedPageSeo from "@/components/content/ManagedPageSeo";
import { pageSeo } from "@/config/pageSeo";
import ServicesAudiences from "./components/ServicesAudiences";
import ServicesFaq from "./components/ServicesFaq";
import ServicesFinalCta from "./components/ServicesFinalCta";
import ServicesHero from "./components/ServicesHero";
import ServicesJourney from "./components/ServicesJourney";
import ServicesPortfolio from "./components/ServicesPortfolio";
import ServicesPrinciples from "./components/ServicesPrinciples";
import ServicesQuality from "./components/ServicesQuality";
import ServicesRouteBuilder from "./components/ServicesRouteBuilder";

export default function ServicesPage() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
    }), { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <ManagedContentProvider endpoint="/api/services/content" slug="services">
    <div>
      <ManagedSectionGate name="seo">
        <ManagedPageSeo fallback={{ ...pageSeo.services, canonical_path: pageSeo.services.canonicalPath }} />
      </ManagedSectionGate>
      <ManagedSectionGate name="hero"><ServicesHero /></ManagedSectionGate>
      <ManagedSectionGate name="principles"><ServicesPrinciples /></ManagedSectionGate>
      <ManagedSectionGate name="portfolio"><ServicesPortfolio /></ManagedSectionGate>
      <ManagedSectionGate name="audiences"><ServicesAudiences /></ManagedSectionGate>
      <ManagedSectionGate name="journey"><ServicesJourney /></ManagedSectionGate>
      <ManagedSectionGate name="route_builder"><ServicesRouteBuilder /></ManagedSectionGate>
      <ManagedSectionGate name="quality"><ServicesQuality /></ManagedSectionGate>
      <ManagedSectionGate name="faq"><ServicesFaq /></ManagedSectionGate>
      <ManagedSectionGate name="final_cta"><ServicesFinalCta /></ManagedSectionGate>
    </div>
    </ManagedContentProvider>
  );
}
