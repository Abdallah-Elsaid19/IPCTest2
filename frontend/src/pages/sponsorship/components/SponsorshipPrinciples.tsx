import FeatureCard from "@/components/base/FeatureCard";
import SectionHeader from "@/components/base/SectionHeader";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const principles = [
  { icon: "ri-graduation-cap-line", title: "Learners", description: "Support education, membership, mentoring and career access." },
  { icon: "ri-team-line", title: "Professional community", description: "Support master classes, clubs, events and knowledge exchange." },
  { icon: "ri-award-line", title: "Recognition", description: "Support awards, prizes, publications and professional visibility." },
  { icon: "ri-lightbulb-flash-line", title: "Thought leadership", description: "Connect your organisation with evidence-led project controls." },
];

const fallbackContent = {
  eyebrow: "Targeted professional impact",
  title: "Support opportunity across the project-controls profession.",
  description: "Sponsorship can focus on a defined audience, activity or professional outcome.",
  items: principles,
};

export default function SponsorshipPrinciples() {
  const content = useManagedSection("principles", fallbackContent);
  return (
    <section className="bg-background-100 section-padding">
      <div className="container-content">
        <div className="reveal">
          <SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} centered />
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
