import FeatureCard from "@/components/base/FeatureCard";
import SectionHeader from "@/components/base/SectionHeader";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const safeguards = [
  { icon: "ri-scales-3-line", title: "No influence over recognition", description: "Sponsors do not decide membership grades, evidence outcomes or professional-review decisions." },
  { icon: "ri-award-line", title: "No control over judging", description: "Awards and prizes must use declared criteria, conflicts management and appropriate independent assessment." },
  { icon: "ri-lock-line", title: "No automatic data access", description: "Member, learner, nominee and attendee information remains protected and consent-based." },
  { icon: "ri-article-line", title: "No guaranteed editorial outcome", description: "Sponsored articles, case studies or speakers remain subject to relevance, evidence and review." },
  { icon: "ri-file-shield-2-line", title: "Clear commercial disclosure", description: "Sponsorship and promotional relationships should be labelled transparently." },
  { icon: "ri-check-double-line", title: "Proportionate claims", description: "Impact and visibility statements must remain specific, supportable and free from exaggeration." },
];
const fallbackIntro = { eyebrow: "Ethics and independence", title: "Visibility must never weaken professional trust.", description: "Sponsorship arrangements should protect recognition, judging, editorial independence, privacy and the credibility of the Institute." };

export default function SponsorshipIntegrity() {
  const intro = useManagedSection("integrity_intro", fallbackIntro);
  const items = useManagedSection("integrity_principles", safeguards).filter(isManagedItemActive);
  return (
    <section id="safeguards" className="scroll-mt-20 bg-background-950 section-padding">
      <div className="container-content">
        <div className="reveal">
          <SectionHeader
            eyebrow={intro.eyebrow}
            title={intro.title}
            subtitle={intro.description}
            light
            centered
          />
        </div>
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
          {items.map((item, index) => (
            <div key={item.title} className="reveal h-full" style={{ transitionDelay: `${index * 80}ms` }}>
              <FeatureCard {...item} light />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
