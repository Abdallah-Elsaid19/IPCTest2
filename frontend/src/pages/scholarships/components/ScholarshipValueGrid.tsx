import FeatureCard from "@/components/base/FeatureCard";
import SectionHeader from "@/components/base/SectionHeader";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const scholarshipSupport = [
  { icon: "ri-user-star-line", title: "Affiliate or student connection", description: "A visible first relationship with the Institute and the project-controls profession." },
  { icon: "ri-presentation-line", title: "Master classes and events", description: "Access to selected technical, career and professional-development activity where included." },
  { icon: "ri-team-line", title: "Mentoring and guidance", description: "Support from practitioners, employers, academics or recognised professionals where available." },
  { icon: "ri-article-line", title: "Research and publication routes", description: "Opportunities to connect student work, projects or applied research to professional audiences." },
  { icon: "ri-community-line", title: "Employer and community engagement", description: "Structured contact with corporate partners, consultants, regional clubs and professional speakers." },
  { icon: "ri-route-line", title: "Career progression support", description: "Help participants understand membership grades, evidence-building and future professional routes." },
];

export default function ScholarshipValueGrid() {
  const intro = useManagedSection("values_intro", { eyebrow: "What support may include", title: "More than funding: a connection to professional development.", subtitle: "The exact package should be defined for each programme. Support may combine access, learning, mentoring and professional community." });
  const items = useManagedSection("values", scholarshipSupport).filter(isManagedItemActive);
  return (
    <section id="benefits" className="scroll-mt-20 bg-background-100 section-padding">
      <div className="container-content">
        <div className="reveal">
          <SectionHeader
            eyebrow={intro.eyebrow}
            title={intro.title}
            subtitle={intro.subtitle}
            centered
          />
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
          {items.map((item, index) => (
            <div key={item.title} className="reveal" style={{ transitionDelay: `${index * 80}ms` }}>
              <FeatureCard icon={item.icon} title={item.title} description={item.description} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
