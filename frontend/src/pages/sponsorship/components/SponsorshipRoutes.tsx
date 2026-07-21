import { useState } from "react";
import { Link } from "react-router-dom";
import SectionHeader from "@/components/base/SectionHeader";
import { informationSessionPath } from "./constants";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const routes = [
  {
    id: "scholarships",
    tab: "Scholarships",
    tabDescription: "Learners and emerging talent",
    eyebrow: "Scholarships & bursaries",
    title: "Widen access to project-controls opportunity.",
    description: "Support eligible learners, career changers or emerging professionals through agreed learning, mentoring, event or community pathways.",
    audience: "Students, apprentices, graduates, career changers and early-career professionals.",
    support: "Learner places, event access, mentoring, materials or professional-development activity.",
    outcome: "Access, confidence, employability, community and a clearer progression route.",
    designTitle: "Define the learner group and intended impact",
    designDescription: "The proposal should explain the target group, support model, eligibility, available places and how impact will be reported.",
    note: "Sponsorship does not guarantee membership, recognition or employment outcomes.",
    cta: "Discuss scholarship sponsorship",
  },
  {
    id: "events",
    tab: "Events",
    tabDescription: "Learning and professional exchange",
    eyebrow: "Events & master classes",
    title: "Support high-value professional learning and exchange.",
    description: "Enable London Master Classes, professional roundtables, regional activity, mentoring circles or employer forums.",
    audience: "Members, practitioners, employers, consultants, academics and emerging professionals.",
    support: "Venue, production, speaker support, learner places, accessibility or programme funding.",
    outcome: "Technical learning, professional connection, CPD and wider access to practice.",
    designTitle: "Define the event and audience",
    designDescription: "The proposal should confirm the format, learning outcome, audience, visibility, responsibilities and registration approach.",
    note: "Sponsor content remains subject to relevance, evidence and editorial review.",
    cta: "Discuss event sponsorship",
  },
  {
    id: "awards",
    tab: "Awards",
    tabDescription: "Excellence and contribution",
    eyebrow: "Awards & prizes",
    title: "Recognise evidence, excellence and professional contribution.",
    description: "Support academic, commercial or professional awards and prizes through transparent arrangements that protect judging independence.",
    audience: "Students, researchers, professionals, teams, employers and academic partners.",
    support: "Category funding, prizes, event support, accessibility, publication or finalist profiles.",
    outcome: "Visible recognition, professional stories, employer value and shared learning.",
    designTitle: "Protect judging and recognition independence",
    designDescription: "The package should define visibility while keeping sponsor interests separate from eligibility, scoring and final decisions.",
    note: "Sponsorship does not provide automatic judging rights or guarantee any award outcome.",
    cta: "Discuss awards sponsorship",
  },
  {
    id: "clubs",
    tab: "Regional clubs",
    tabDescription: "Local professional communities",
    eyebrow: "Regional clubs",
    title: "Help professional communities grow locally.",
    description: "Support regional talks, networking, mentoring, site visits, student engagement and employer activity.",
    audience: "Professionals, learners, employers, consultants and academic partners in regional communities.",
    support: "Venue, refreshments, learner access, speakers, travel, site visits or local programme funding.",
    outcome: "Stronger local networks, CPD, mentoring and employer or academic connection.",
    designTitle: "Define the region and community need",
    designDescription: "The proposal should identify the regional club, intended activity, audience, hosting requirements and safeguards.",
    note: "Regional sponsorship does not provide access to private member or attendee data.",
    cta: "Discuss regional sponsorship",
  },
  {
    id: "publications",
    tab: "Publications",
    tabDescription: "Research and professional knowledge",
    eyebrow: "Publications & research",
    title: "Help useful professional knowledge reach the sector.",
    description: "Support articles, case studies, applied research, journal activity, reports and knowledge-sharing initiatives.",
    audience: "Practitioners, researchers, academics, employers, consultants and learners.",
    support: "Editorial production, research access, accessibility, design, distribution or publication funding.",
    outcome: "Evidence-led knowledge, transferable lessons, research visibility and better professional practice.",
    designTitle: "Protect editorial credibility",
    designDescription: "The arrangement should define the supported work while preserving author, reviewer and editorial independence.",
    note: "Sponsorship does not guarantee publication, endorsement or favourable editorial treatment.",
    cta: "Discuss publication sponsorship",
  },
] as const;
const fallbackIntro = { eyebrow: "Sponsorship opportunities", title: "Choose the route that matches your organisation’s purpose.", description: "Select an opportunity to see the audience, possible support and the professional outcome the partnership should create." };

export default function SponsorshipRoutes() {
  const intro = useManagedSection("routes_intro", fallbackIntro);
  const managedRoutes = useManagedSection("routes", routes).filter(isManagedItemActive);
  const [activeId, setActiveId] = useState<(typeof routes)[number]["id"]>("scholarships");
  const activeRoute = managedRoutes.find((route) => route.id === activeId) ?? managedRoutes[0] ?? routes[0];

  return (
    <section id="opportunities" className="scroll-mt-20 bg-background-100 section-padding">
      <div className="container-content">
        <div className="reveal">
          <SectionHeader
            eyebrow={intro.eyebrow}
            title={intro.title}
            subtitle={intro.description}
            centered
          />
        </div>

        <div className="reveal mt-12 border border-background-200/70 bg-background-50 md:mt-16">
          <div role="tablist" aria-label="Sponsorship opportunities" className="grid grid-cols-1 border-b border-background-200/70 sm:grid-cols-2 lg:grid-cols-5">
            {managedRoutes.map((route) => {
              const active = route.id === activeId;
              return (
                <button
                  key={route.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls="sponsorship-route-panel"
                  onClick={() => setActiveId(route.id)}
                  className={`min-h-24 border-b border-background-200/70 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 lg:border-b-0 lg:border-r ${active ? "bg-background-950 text-background-50" : "bg-background-50 text-background-950 hover:bg-background-100"}`}
                >
                  <strong className={`block text-sm ${active ? "text-primary-300" : "text-primary-700"}`}>{route.tab}</strong>
                  <span className={`mt-1 block text-xs leading-relaxed ${active ? "text-background-300" : "text-foreground-600"}`}>{route.tabDescription}</span>
                </button>
              );
            })}
          </div>

          <div id="sponsorship-route-panel" role="tabpanel" className="grid lg:grid-cols-[1.2fr_0.8fr]">
            <div className="p-6 md:p-9 lg:p-10">
              <span className="eyebrow mb-3 block text-primary-600">{activeRoute.eyebrow}</span>
              <h3 className="font-heading text-2xl font-semibold text-background-950 md:text-3xl">{activeRoute.title}</h3>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-foreground-600 md:text-base">{activeRoute.description}</p>
              <dl className="mt-7 grid gap-4 md:grid-cols-3">
                {[
                  ["Audience", activeRoute.audience],
                  ["Possible support", activeRoute.support],
                  ["Professional outcome", activeRoute.outcome],
                ].map(([label, value]) => (
                  <div key={label} className="h-full border border-background-200/70 bg-background-100 p-4">
                    <dt className="text-xs font-bold uppercase tracking-wider text-primary-700">{label}</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-foreground-600">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <aside className="flex flex-col justify-between bg-accent-700 p-6 text-background-50 md:p-9 lg:p-10">
              <div>
                <span className="eyebrow mb-3 block text-primary-300">Partnership design</span>
                <h3 className="font-heading text-xl font-semibold">{activeRoute.designTitle}</h3>
                <p className="mt-4 text-sm leading-relaxed text-background-200">{activeRoute.designDescription}</p>
                <p className="mt-6 border border-background-50/15 bg-background-50/5 p-4 text-xs leading-relaxed text-background-300">{activeRoute.note}</p>
              </div>
              <Link to={informationSessionPath} className="btn-primary mt-8 inline-flex w-fit items-center gap-2">{activeRoute.cta}<i className="ri-arrow-right-line" aria-hidden="true" /></Link>
            </aside>
          </div>
        </div>
        <p className="mt-5 text-center text-xs leading-relaxed text-foreground-500">All sponsorship arrangements should define the supported activity, agreed visibility, responsibilities, privacy safeguards, delivery period and review process.</p>
      </div>
    </section>
  );
}
