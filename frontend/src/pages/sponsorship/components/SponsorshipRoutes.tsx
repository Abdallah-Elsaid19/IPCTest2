import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SectionHeader from "@/components/base/SectionHeader";
import { informationSessionPath } from "./constants";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

interface RouteOpportunity {
  code: string;
  title: string;
  description: string;
  label: string;
  detail: string;
  is_active?: boolean;
}

interface SponsorshipRoute {
  id: string;
  icon: string;
  tab: string;
  tabDescription: string;
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  opportunities: RouteOpportunity[];
  cta: string;
  is_active?: boolean;
}

const makeRoute = (
  id: string,
  icon: string,
  tab: string,
  tabDescription: string,
  title: string,
  description: string,
): SponsorshipRoute => ({
  id,
  icon,
  tab,
  tabDescription,
  eyebrow: tab,
  title,
  description,
  highlights: [],
  opportunities: [],
  cta: `Discuss ${tab.toLowerCase()} sponsorship`,
});

const routes: SponsorshipRoute[] = [
  makeRoute("learners", "ri-graduation-cap-line", "Learners & Scholarships", "Education and progression", "Sponsor access to education and professional progression.", "Support eligible learners with education, membership, events, mentoring and career development."),
  makeRoute("events", "ri-calendar-event-line", "Events & Master Classes", "Professional learning", "Support professional learning and high-value conversation.", "Enable master classes, technical workshops, speaker support and delegate access."),
  makeRoute("awards", "ri-award-line", "Awards & Prizes", "Professional recognition", "Help make outstanding achievement visible.", "Support academic, commercial, professional and special recognition awards."),
  makeRoute("clubs", "ri-community-line", "Regional Clubs", "Local communities", "Build strong local professional communities.", "Support regional talks, networking, mentoring and employer engagement."),
  makeRoute("publications", "ri-book-open-line", "Magazine & Journal", "Professional knowledge", "Support knowledge professionals can use.", "Connect applied practice, academic research and employer insight."),
  makeRoute("research", "ri-flask-line", "Research & Innovation", "Evidence-led development", "Fund evidence-led development of the discipline.", "Connect employers, consultants, academics and practitioners around practical questions."),
  makeRoute("community", "ri-hand-heart-line", "Community Activities", "Service and social impact", "Sponsor professional service and wider social impact.", "Support access, employability, mentoring and professional confidence."),
  makeRoute("strategic", "ri-links-line", "Strategic Partnership", "Multi-activity relationship", "Combine routes around a shared objective.", "Build a longer-term relationship across recognition, talent, research and community."),
];

const fallbackIntro = {
  eyebrow: "Sponsorship routes",
  title: "Support one priority or build a multi-activity partnership.",
  description: "Sponsorship can focus on a learner, event, award, publication or regional community, or combine several activities into one strategic programme.",
};

export default function SponsorshipRoutes() {
  const intro = useManagedSection("routes_intro", fallbackIntro);
  const managedRoutes = useManagedSection<SponsorshipRoute[]>("routes", routes).filter(isManagedItemActive);
  const [activeId, setActiveId] = useState("learners");
  const activeRoute = managedRoutes.find((route) => route.id === activeId) ?? managedRoutes[0] ?? routes[0];

  useEffect(() => {
    if (!managedRoutes.some((route) => route.id === activeId) && managedRoutes[0]) {
      setActiveId(managedRoutes[0].id);
    }
  }, [activeId, managedRoutes]);

  return (
    <section id="sponsorship-routes" className="scroll-mt-28 bg-background-100 section-padding">
      <div className="container-content">
        <div className="reveal">
          <SectionHeader eyebrow={intro.eyebrow} title={intro.title} subtitle={intro.description} centered />
        </div>

        <div className="reveal mt-12 border border-background-200/70 bg-background-50 md:mt-16">
          <div className="overflow-x-auto border-b border-background-200/70">
            <div role="tablist" aria-label="Sponsorship routes" className="grid min-w-[1040px] grid-cols-8">
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
                    className={`min-h-32 border-r border-background-200/70 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 ${active ? "bg-background-950 text-background-50" : "bg-background-50 text-background-950 hover:bg-background-100"}`}
                  >
                    <i className={`${route.icon} mb-3 block text-xl ${active ? "text-primary-300" : "text-primary-700"}`} aria-hidden="true" />
                    <strong className="block text-xs leading-snug">{route.tab}</strong>
                    <span className={`mt-1.5 block text-[11px] leading-relaxed ${active ? "text-background-300" : "text-foreground-500"}`}>{route.tabDescription}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div id="sponsorship-route-panel" role="tabpanel">
            <div className="grid gap-8 bg-background-950 p-6 text-background-50 md:p-9 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
              <div>
                <span className="eyebrow mb-3 block text-primary-300">{activeRoute.eyebrow}</span>
                <h3 className="font-heading text-2xl font-semibold md:text-3xl">{activeRoute.title}</h3>
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-background-200 md:text-base">{activeRoute.description}</p>
              </div>
              {activeRoute.highlights.length > 0 && (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {activeRoute.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-2 border border-background-50/10 bg-background-50/5 p-3 text-xs leading-relaxed text-background-200">
                      <i className="ri-check-line mt-0.5 text-primary-300" aria-hidden="true" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {activeRoute.opportunities.length > 0 && (
              <div className="grid md:grid-cols-2 xl:grid-cols-4">
                {activeRoute.opportunities.filter(isManagedItemActive).map((opportunity) => (
                  <article key={opportunity.code} className="group relative min-h-72 border-b border-r border-background-200/70 p-6 transition-colors hover:bg-background-100">
                    <span className="font-heading text-xs font-bold tracking-[0.18em] text-primary-700">{opportunity.code}</span>
                    <h4 className="mt-7 font-heading text-lg font-semibold leading-tight text-background-950">{opportunity.title}</h4>
                    <p className="mt-3 text-sm leading-relaxed text-foreground-600">{opportunity.description}</p>
                    <div className="mt-6 border-t border-background-200 pt-4 text-xs leading-relaxed text-foreground-600">
                      <strong className="block text-background-950">{opportunity.label}</strong>
                      <span className="mt-1 block">{opportunity.detail}</span>
                    </div>
                    <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-primary-500 transition-transform duration-300 group-hover:scale-x-100" />
                  </article>
                ))}
              </div>
            )}

            <div className="flex flex-col items-start justify-between gap-4 border-t border-background-200/70 p-6 sm:flex-row sm:items-center">
              <p className="max-w-3xl text-xs leading-relaxed text-foreground-500">Every arrangement defines the supported activity, agreed visibility, responsibilities, privacy safeguards, delivery period and review process.</p>
              <Link to={informationSessionPath} className="btn-primary shrink-0">{activeRoute.cta}<i className="ri-arrow-right-line" aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
