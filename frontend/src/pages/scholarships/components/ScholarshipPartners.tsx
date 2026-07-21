import { Link } from "react-router-dom";
import SectionHeader from "@/components/base/SectionHeader";
import { informationSessionPath } from "./constants";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const partners = [
  {
    icon: "ri-building-4-line",
    title: "Employers & consultancies",
    benefits: ["Support selected learners", "Develop future talent", "Offer mentoring or speakers", "Create career-access opportunities", "Strengthen social value"],
    cta: "Discuss employer support",
  },
  {
    icon: "ri-graduation-cap-line",
    title: "Academic partners",
    benefits: ["Nominate or support learner groups", "Connect study with professional practice", "Support research and employability", "Develop employer links", "Create progression routes"],
    cta: "Discuss academic partnership",
  },
  {
    icon: "ri-hand-heart-line",
    title: "Sponsors & foundations",
    benefits: ["Fund learner or cohort access", "Support events and mentoring", "Enable research or publication", "Receive ethical visibility", "Protect selection independence"],
    cta: "Discuss sponsorship",
  },
];

export default function ScholarshipPartners() {
  const content = useManagedSection("partners", { eyebrow: "For sponsors and partners", title: "Turn support into visible, ethical professional impact", description: "Employers, consultancies, academic partners and sponsors can help widen access to project-controls learning, community and career opportunity.", items: partners });
  const items = content.items.filter(isManagedItemActive);
  return (
    <section id="partners" className="scroll-mt-20 bg-background-50 section-padding">
      <div className="container-content">
        <div className="reveal">
          <SectionHeader
            eyebrow={content.eyebrow}
            title={content.title}
            subtitle={content.description}
            centered
          />
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 md:mt-16 lg:grid-cols-3">
          {items.map((partner, index) => (
            <article key={partner.title} className="reveal flex h-full min-h-96 flex-col border border-background-200/70 bg-background-50 p-6 transition-all duration-300 hover:border-primary-200 md:p-7" style={{ transitionDelay: `${index * 90}ms` }}>
              <div className="flex h-12 w-12 items-center justify-center bg-accent-100"><i className={`${partner.icon} text-xl text-accent-600`} aria-hidden="true" /></div>
              <h3 className="mt-5 font-heading text-xl font-semibold text-background-950">{partner.title}</h3>
              <ul className="mt-5 space-y-3 text-sm text-foreground-600">
                {partner.benefits.map((benefit) => <li key={benefit} className="flex items-start gap-3"><i className="ri-check-line mt-0.5 text-primary-600" aria-hidden="true" /><span>{benefit}</span></li>)}
              </ul>
              <Link to={(partner as { cta_url?: string }).cta_url ?? informationSessionPath} className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-semibold text-primary-700">{partner.cta}<i className="ri-arrow-right-line" aria-hidden="true" /></Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
