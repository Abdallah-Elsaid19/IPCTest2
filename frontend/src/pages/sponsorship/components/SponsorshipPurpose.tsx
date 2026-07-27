import FeatureCard from "@/components/base/FeatureCard";
import SectionHeader from "@/components/base/SectionHeader";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const values = [
  { icon: "ri-focus-3-line", title: "Defined activity", description: "Support a learner, event, award, club, publication or wider programme." },
  { icon: "ri-file-list-3-line", title: "Tailored partnerships", description: "Sponsorship scope is discussed individually and confirmed in writing." },
  { icon: "ri-shield-check-line", title: "Protected independence", description: "Sponsorship does not determine recognition, scholarship or award outcomes." },
];
const fallbackContent = {
  eyebrow: "Why sponsorship matters",
  title: "Professional capability grows when opportunity, recognition and community are funded deliberately.",
  description: "Many talented people lack employer-supported development, access to technical networks or a visible route into the profession.",
  body: [
    "Employers also need project controls professionals who can build credible schedules, produce reliable forecasts, control change, manage uncertainty, protect data integrity and support informed decisions.",
    "Sponsorship connects these needs. It creates access for learners and professionals while helping organisations support a discipline that protects project value.",
    "IPC partnerships are designed to create visible and credible impact while the Institute protects professional integrity, confidentiality, fairness and independent judgement.",
  ],
  items: values,
};

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
        <div className="reveal mx-auto mt-10 max-w-4xl space-y-4 text-base leading-relaxed text-foreground-600 md:text-lg">
          {content.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 md:mt-16 lg:grid-cols-3">
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
