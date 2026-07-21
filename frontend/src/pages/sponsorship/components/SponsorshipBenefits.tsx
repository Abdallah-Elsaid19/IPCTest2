import FeatureCard from "@/components/base/FeatureCard";
import SectionHeader from "@/components/base/SectionHeader";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const benefits = [
  { icon: "ri-layout-4-line", title: "Agreed brand visibility", description: "Appropriate acknowledgement on programme pages, selected communications, event materials or publications." },
  { icon: "ri-focus-2-line", title: "Purpose association", description: "Be visibly connected with access, learning, excellence, community or shared professional knowledge." },
  { icon: "ri-discuss-line", title: "Professional engagement", description: "Participate through approved speakers, mentors, hosts, case studies or employer discussions." },
  { icon: "ri-user-follow-line", title: "Talent-pipeline contribution", description: "Support learners and emerging professionals without receiving private applicant data or preferential access." },
  { icon: "ri-file-chart-line", title: "Impact reporting", description: "Receive proportionate information on supported activity, participation and outcomes." },
  { icon: "ri-lightbulb-flash-line", title: "Thought-leadership routes", description: "Contribute credible technical knowledge subject to review, evidence and editorial standards." },
];
const fallbackContent = { eyebrow: "Sponsor value", title: "Credible visibility built around contribution—not interruption.", description: "Sponsor value should come from supporting useful professional activity and being associated with a clear, ethical purpose.", items: benefits };

export default function SponsorshipBenefits() {
  const content = useManagedSection("benefits", fallbackContent);
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
