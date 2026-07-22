import { useEffect } from "react";
import SEO from "@/components/seo/SEO";
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
    <div>
      <SEO {...pageSeo.services} />
      <ServicesHero />
      <ServicesPrinciples />
      <ServicesPortfolio />
      <ServicesAudiences />
      <ServicesJourney />
      <ServicesRouteBuilder />
      <ServicesQuality />
      <ServicesFaq />
      <ServicesFinalCta />
    </div>
  );
}
