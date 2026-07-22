import { useEffect } from "react";
import SEO from "@/components/seo/SEO";
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

export default function ContributePage(){useEffect(()=>{const observer=new IntersectionObserver((entries)=>entries.forEach((entry)=>{if(entry.isIntersecting){entry.target.classList.add("visible");observer.unobserve(entry.target)}}),{threshold:.1,rootMargin:"0px 0px -40px 0px"});document.querySelectorAll(".reveal").forEach((element)=>observer.observe(element));return()=>observer.disconnect()},[]);return <div><SEO {...pageSeo.contribute}/><ContributeHero/><ContributePurpose/><ContributeProgrammes/><ContributeRoutes/><ContributeApplicantMatcher/><ContributeImpact/><ContributeResearch/><ContributeEmployer/><ContributePartners/><ContributePrinciples/><div id="funder-route" className="scroll-mt-20"><ContributeRouteBuilder/></div><ContributeGovernance/><ContributeProcess/><ContributeAssurance/><ContributeFaq/><ContributeFinalCta/></div>}
