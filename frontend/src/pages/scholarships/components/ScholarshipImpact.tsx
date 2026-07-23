import { Link } from "react-router-dom";
import FeatureCard from "@/components/base/FeatureCard";
import SectionHeader from "@/components/base/SectionHeader";
import { informationSessionPath } from "./constants";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const impact = [
  { icon: "ri-door-open-line", title: "Access", description: "What opportunity became available because of the scholarship or bursary?" },
  { icon: "ri-calendar-check-line", title: "Participation", description: "Which learning, mentoring, event or community activities were completed?" },
  { icon: "ri-seedling-line", title: "Development", description: "What knowledge, confidence, professional connection or evidence was developed?" },
  { icon: "ri-arrow-up-line", title: "Progression", description: "What realistic next step followed—study, employment, membership, mentoring or further development?" },
  { icon: "ri-shield-user-line", title: "Consent", description: "Any learner story, image or testimonial must be used transparently and with permission." },
];

export default function ScholarshipImpact() {
  const content = useManagedSection("impact", { eyebrow: "Impact and accountability", title: "Measure what the support made possible", description: "Scholarship impact should be reported carefully, with consent and without overstating outcomes.", cta_label: "Discuss an impact framework", cta_url: informationSessionPath, items: impact });
  const items = content.items.filter(isManagedItemActive);
  return (
    <section className="bg-background-100 section-padding">
      <div className="container-content">
        <div className="reveal">
          <SectionHeader
            eyebrow={content.eyebrow}
            title={content.title}
            subtitle={content.description}
            centered
          />
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-16 lg:grid-cols-5">
          {items.map((item, index) => (
            <div key={item.title} className="reveal" style={{ transitionDelay: `${index * 70}ms` }}><FeatureCard {...item} /></div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
