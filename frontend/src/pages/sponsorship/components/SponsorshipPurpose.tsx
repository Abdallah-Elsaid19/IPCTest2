import FeatureCard from "@/components/base/FeatureCard";
import SectionHeader from "@/components/base/SectionHeader";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const values = [
  { icon: "ri-door-open-line", title: "Open professional opportunity", description: "Support scholarships, learner places, event access and career-development routes." },
  { icon: "ri-team-line", title: "Strengthen the talent pipeline", description: "Connect future and current professionals with technical learning, mentors and employers." },
  { icon: "ri-book-open-line", title: "Help useful practice travel", description: "Support publications, case studies, research, speakers and professional discussion." },
  { icon: "ri-award-line", title: "Celebrate excellence", description: "Enable awards, prizes and professional profiles without compromising judging independence." },
];
const fallbackContent = { eyebrow: "Why sponsor IPC", title: "Connect organisational support with visible professional value.", description: "Effective sponsorship should do more than place a logo. It should widen access, strengthen capability, recognise excellence or help useful knowledge reach the profession. IPC sponsorship routes are designed to support members, learners, employers, academic partners and regional communities while protecting professional independence.", items: values };

export default function SponsorshipPurpose() {
  const content = useManagedSection("purpose", fallbackContent);
  return (
    <section className="bg-background-50 section-padding">
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
            <div key={item.title} className="reveal h-full" style={{ transitionDelay: `${index * 80}ms` }}>
              <FeatureCard {...item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
