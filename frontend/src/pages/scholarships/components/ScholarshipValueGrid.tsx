import FeatureCard from "@/components/base/FeatureCard";
import SectionHeader from "@/components/base/SectionHeader";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const scholarshipSupport = [
  { icon: "ri-funds-line", title: "Programme or learning fees", description: "Approved fee support for the confirmed learning route." },
  { icon: "ri-user-star-line", title: "Professional membership or affiliation", description: "A defined relationship with IPC and the project-controls community." },
  { icon: "ri-file-list-3-line", title: "Examination support", description: "Assessment or examination support where relevant to the confirmed route." },
  { icon: "ri-presentation-line", title: "Selected London Master Class access", description: "Selected technical or professional-development event access where approved." },
  { icon: "ri-team-line", title: "Mentoring", description: "Guidance from suitable practitioners or professional contributors where available." },
  { icon: "ri-train-line", title: "Event or travel support", description: "Proportionate event or travel support where specifically approved." },
  { icon: "ri-route-line", title: "Professional-development costs", description: "Related costs confirmed as part of an individual award." },
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
        <p className="mt-10 text-center text-sm font-semibold text-foreground-700">Each award is confirmed individually in writing.</p>
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
