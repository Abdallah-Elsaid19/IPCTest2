import FeatureCard from "@/components/base/FeatureCard";
import SectionHeader from "@/components/base/SectionHeader";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const principles = [
  { icon: "ri-scales-3-line", title: "Fair access", description: "Clear criteria, explainable decisions and no guaranteed awards." },
  { icon: "ri-focus-3-line", title: "Professional relevance", description: "Support connects directly to project controls and employability." },
  { icon: "ri-shield-check-line", title: "Ethical sponsorship", description: "Funding must not influence membership or recognition decisions." },
  { icon: "ri-arrow-up-circle-line", title: "Visible progression", description: "Each pathway should create a realistic professional next step." },
];

export default function ScholarshipPrinciplesGrid() {
  const content = useManagedSection("principles", { eyebrow: "Selection principles", title: "Purposeful, fair and professionally relevant support", subtitle: "Scholarship pathways should widen access while protecting clear criteria, professional relevance and independent decisions.", items: principles });
  const items = content.items.filter(isManagedItemActive);
  return (
    <section className="bg-background-100 section-padding">
      <div className="container-content">
        <div className="reveal">
          <SectionHeader
            eyebrow={content.eyebrow}
            title={content.title}
            subtitle={content.subtitle}
            centered
          />
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-16 lg:grid-cols-4">
          {items.map((item, index) => (
            <div key={item.title} className="reveal" style={{ transitionDelay: `${index * 80}ms` }}>
              <FeatureCard {...item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
