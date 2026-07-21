import FeatureCard from "@/components/base/FeatureCard";
import SectionHeader from "@/components/base/SectionHeader";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const principles = [
  { icon: "ri-focus-3-line", title: "Purpose-led", description: "Sponsorship should create access, capability or useful professional knowledge." },
  { icon: "ri-eye-line", title: "Ethically visible", description: "Receive agreed recognition without influencing independent decisions." },
  { icon: "ri-line-chart-line", title: "Outcome-focused", description: "Define the audience, activity, support and intended professional impact." },
  { icon: "ri-file-list-3-line", title: "Transparent packages", description: "Clear scope, visibility, responsibilities and deliverables." },
  { icon: "ri-shield-check-line", title: "Independent decisions", description: "No sponsor control over recognition, judging or editorial outcomes." },
  { icon: "ri-lock-line", title: "Consent-based engagement", description: "No automatic access to private member or attendee data." },
  { icon: "ri-bar-chart-box-line", title: "Impact reporting", description: "Measure activity and outcomes without overstating claims." },
];
const fallbackContent = { eyebrow: "Professional impact", title: "Support opportunity through transparent, accountable partnership.", description: "IPC sponsorship connects organisational support with clear professional purpose and safeguards.", items: principles };

export default function SponsorshipPrinciples() {
  const content = useManagedSection("principles", fallbackContent);
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
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-16 lg:grid-cols-4">
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
