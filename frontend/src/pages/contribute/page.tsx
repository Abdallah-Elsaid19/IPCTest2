import { useEffect } from "react";
import {
  ManagedContentProvider,
  ManagedSectionGate,
} from "@/components/content/ManagedContentProvider";
import ManagedPageSeo from "@/components/content/ManagedPageSeo";
import { pageSeo } from "@/config/pageSeo";
import ContributeAssurance from "./components/ContributeAssurance";
import ContributeApplicantMatcher from "./components/ContributeApplicantMatcher";
import ContributeEmployer from "./components/ContributeEmployer";
import ContributeFaq from "./components/ContributeFaq";
import ContributeFinalCta from "./components/ContributeFinalCta";
import ContributeHero from "./components/ContributeHero";
import ContributeImpact from "./components/ContributeImpact";
import ContributeGovernance from "./components/ContributeGovernance";
import ContributePartners from "./components/ContributePartners";
import ContributePrinciples from "./components/ContributePrinciples";
import ContributeProcess from "./components/ContributeProcess";
import ContributeProgrammes from "./components/ContributeProgrammes";
import ContributePurpose from "./components/ContributePurpose";
import ContributeRouteBuilder from "./components/ContributeRouteBuilder";
import ContributeResearch from "./components/ContributeResearch";
import ContributeRoutes from "./components/ContributeRoutes";

export default function ContributePage(){useEffect(()=>{const observer=new IntersectionObserver((entries)=>entries.forEach((entry)=>{if(entry.isIntersecting){entry.target.classList.add("visible");observer.unobserve(entry.target)}}),{threshold:.1,rootMargin:"0px 0px -40px 0px"});document.querySelectorAll(".reveal").forEach((element)=>observer.observe(element));return()=>observer.disconnect()},[]);return <ManagedContentProvider endpoint="/api/fund/content" slug="fund"><div><ManagedSectionGate name="seo"><ManagedPageSeo fallback={{...pageSeo.contribute,canonical_path:pageSeo.contribute.canonicalPath}}/></ManagedSectionGate><ManagedSectionGate name="hero"><ContributeHero/></ManagedSectionGate><ManagedSectionGate name="purpose"><ContributePurpose/></ManagedSectionGate><ManagedSectionGate name="programmes"><ContributeProgrammes/></ManagedSectionGate><ManagedSectionGate name="routes"><ContributeRoutes/></ManagedSectionGate><ManagedSectionGate name="applicant_matcher"><ContributeApplicantMatcher/></ManagedSectionGate><ManagedSectionGate name="impact"><ContributeImpact/></ManagedSectionGate><ManagedSectionGate name="research"><ContributeResearch/></ManagedSectionGate><ManagedSectionGate name="employer"><ContributeEmployer/></ManagedSectionGate><ManagedSectionGate name="partners"><ContributePartners/></ManagedSectionGate><ManagedSectionGate name="principles"><ContributePrinciples/></ManagedSectionGate><ManagedSectionGate name="route_builder"><div id="funder-route" className="scroll-mt-20"><ContributeRouteBuilder/></div></ManagedSectionGate><ManagedSectionGate name="governance"><ContributeGovernance/></ManagedSectionGate><ManagedSectionGate name="process"><ContributeProcess/></ManagedSectionGate><ManagedSectionGate name="assurance"><ContributeAssurance/></ManagedSectionGate><ManagedSectionGate name="faq"><ContributeFaq/></ManagedSectionGate><ManagedSectionGate name="final_cta"><ContributeFinalCta/></ManagedSectionGate></div></ManagedContentProvider>}
