import AudienceCard from "@/components/base/AudienceCard";
import SectionHeader from "@/components/base/SectionHeader";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const scholarshipRoutes = [
  { id: "access-hardship", icon: "ri-door-open-line", title: "Access and Hardship", description: "For people facing financial, social, geographic or opportunity barriers. Assessment considers genuine need, motivation, relevance, commitment and likely benefit." },
  { id: "character-service", icon: "ri-hand-heart-line", title: "Character, Service and Community Impact", description: "For people demonstrating service, resilience, leadership or positive contribution. Assessment considers character, evidence of service, intended impact and professional direction." },
  { id: "charity-ngo", icon: "ri-community-line", title: "Charity, NGO and Social Good", description: "For voluntary-sector, NGO and social-impact workers. Assessment considers organisational context, potential impact, learning need and realistic application." },
  { id: "service-transition", icon: "ri-shield-star-line", title: "Armed Forces, Veterans and Public Service Transition", description: "For service leavers, veterans, reservists, affected families, emergency-services and public-service professionals. Assessment considers service, transferable experience, transition need, motivation and career plan." },
  { id: "second-chance", icon: "ri-restart-line", title: "Second Chance Career Repositioning", description: "For people affected by redundancy, career disruption, long-term unemployment or a major professional reset. Assessment considers readiness, transferable skills, a realistic route and commitment." },
  { id: "independent", icon: "ri-briefcase-4-line", title: "Self-Employed Professionals and Consultants", description: "For independent professionals without employer-funded development. Assessment considers practice relevance, access need, professional impact and contribution." },
  { id: "returners-talent", icon: "ri-graduation-cap-line", title: "Career Returners and Emerging Talent", description: "For returners, school and college leavers, graduates, apprentices and junior staff without sufficient employer support. Assessment considers potential, motivation, commitment and need." },
];

export default function ScholarshipAudienceGrid() {
  const intro = useManagedSection("audiences_intro", {
    eyebrow: "Scholarship pathways",
    title: "Seven access routes for different circumstances and potential.",
    subtitle: "IPC may support up to 40 places per intake across the scholarship framework, subject to application quality, available funding, programme eligibility and social-impact priorities. Allocation between categories may change.",
  });
  const routes = useManagedSection("audiences", scholarshipRoutes).filter(isManagedItemActive);
  return (
    <section className="bg-background-50 section-padding">
      <div className="container-content">
        <div className="reveal"><SectionHeader eyebrow={intro.eyebrow} title={intro.title} subtitle={intro.subtitle} centered /></div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
          {routes.map((route, index) => (
            <div key={route.id} className="reveal h-full" style={{ transitionDelay: `${index * 100}ms` }}>
              <AudienceCard icon={route.icon} title={route.title} description={route.description} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
