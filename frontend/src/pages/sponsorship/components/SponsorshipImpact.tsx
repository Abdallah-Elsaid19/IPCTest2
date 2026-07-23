import { Link } from "react-router-dom";
import FeatureCard from "@/components/base/FeatureCard";
import SectionHeader from "@/components/base/SectionHeader";
import { informationSessionPath } from "./constants";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const impact = [
  { icon: "ri-checkbox-circle-line", title: "Delivery", description: "What activity was funded, hosted or enabled, and was it delivered as agreed?" },
  { icon: "ri-team-line", title: "Participation", description: "How many eligible learners, members, speakers, mentors or organisations took part?" },
  { icon: "ri-door-open-line", title: "Access", description: "What barrier was reduced or professional opportunity created?" },
  { icon: "ri-seedling-line", title: "Development", description: "What learning, mentoring, connection or professional evidence was developed?" },
  { icon: "ri-book-open-line", title: "Knowledge", description: "What useful content, research, case study or professional discussion was produced?" },
  { icon: "ri-shield-user-line", title: "Consent", description: "Any story, image, quotation or profile must be used transparently and with permission." },
];
const fallbackContent = { eyebrow: "Impact reporting", title: "Measure contribution without overstating impact.", description: "Reporting should match the size and nature of the sponsorship and should distinguish activity, participation, outputs and longer-term outcomes.", items: impact, cta_label: "Discuss an impact framework", cta_url: informationSessionPath };

export default function SponsorshipImpact() {
  const content = useManagedSection("impact", fallbackContent);
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
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
          {content.items.filter(isManagedItemActive).map((item, index) => (
            <div key={item.title} className="reveal h-full" style={{ transitionDelay: `${index * 70}ms` }}>
              <FeatureCard {...item} />
            </div>
          ))}
        </div>
       
      </div>
    </section>
  );
}
