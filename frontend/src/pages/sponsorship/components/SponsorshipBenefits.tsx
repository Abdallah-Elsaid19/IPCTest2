import FeatureCard from "@/components/base/FeatureCard";
import SectionHeader from "@/components/base/SectionHeader";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const benefits = [
  { icon: "ri-global-line", title: "Website recognition", description: "Approved sponsor profile or acknowledgement on relevant pages." },
  { icon: "ri-calendar-event-line", title: "Event visibility", description: "Agreed recognition in event materials and communication." },
  { icon: "ri-user-star-line", title: "Guest participation", description: "Agreed guest places for selected events or activities." },
  { icon: "ri-lightbulb-flash-line", title: "Thought leadership", description: "Approved articles, interviews, panels or technical contributions." },
  { icon: "ri-award-line", title: "Named initiative", description: "An approved scholarship, award, event or programme may carry sponsor acknowledgement." },
  { icon: "ri-links-line", title: "Professional association", description: "Connect the organisation with competence and project controls excellence." },
  { icon: "ri-team-line", title: "Talent engagement", description: "Support a professional community while respecting privacy and fair access." },
  { icon: "ri-file-chart-line", title: "Impact reporting", description: "Receive proportionate information about supported activity." },
  { icon: "ri-map-pin-line", title: "Regional presence", description: "Build visibility through London, Nottingham, Manchester or Kent." },
  { icon: "ri-building-line", title: "Employer reputation", description: "Demonstrate commitment to capability and responsible delivery." },
  { icon: "ri-article-line", title: "Publication acknowledgement", description: "Approved recognition in magazine, research or awards material." },
  { icon: "ri-discuss-line", title: "Strategic dialogue", description: "Participate in agreed employer or academic roundtables." },
];

const fallbackContent = {
  eyebrow: "Sponsor benefits",
  title: "Professional visibility connected to meaningful contribution.",
  description: "Benefits are matched to the scope and nature of the partnership. They recognise support without compromising independence.",
  items: benefits,
};

export default function SponsorshipBenefits() {
  const content = useManagedSection("benefits", fallbackContent);
  return (
    <section className="bg-background-50 section-padding">
      <div className="container-content">
        <div className="reveal">
          <SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} centered />
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-16 lg:grid-cols-4">
          {content.items.filter(isManagedItemActive).map((item, index) => (
            <div key={item.title} className="reveal h-full" style={{ transitionDelay: `${index * 50}ms` }}>
              <FeatureCard {...item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
