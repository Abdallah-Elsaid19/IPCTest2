import { Link } from "react-router-dom";
import SectionHeader from "@/components/base/SectionHeader";
import {
  isManagedItemActive,
  useManagedSection,
} from "@/components/content/ManagedContentProvider";

const sponsorRoutes = [
  {
    id: "learner",
    title: "Sponsor one learner",
    description: "Support an individual's programme or professional development.",
  },
  {
    id: "category",
    title: "Sponsor a category",
    description: "Support veterans, career returners, consultants or emerging talent.",
  },
  {
    id: "intake",
    title: "Sponsor an intake",
    description: "Create a wider cohort-based scholarship or bursary initiative.",
  },
  {
    id: "development",
    title: "Sponsor member development",
    description: "Support events, mentoring, clubs, awards or professional publications.",
  },
];

export default function ScholarshipPartners() {
  const content = useManagedSection("partners", {
    eyebrow: "For Organisations and Donors",
    title: "Sponsor opportunity, talent and professional mobility.",
    description:
      "Employers, consultancies, training providers, universities, recruitment companies, NGOs, charities, foundations and individual donors can help increase the number and value of scholarship places. Sponsorship can support one learner, a group, an award category, a regional community, a professional event or an entire scholarship pathway.",
    items: sponsorRoutes,
    cta_label: "Explore Sponsorship",
    cta_url: "/sponsorship",
  });
  const items = content.items.filter(isManagedItemActive);

  return (
    <section id="partners" className="scroll-mt-20 bg-background-100 section-padding">
      <div className="container-content">
        <div className="reveal">
          <SectionHeader
            eyebrow={content.eyebrow}
            title={content.title}
            subtitle={content.description}
            centered
          />
        </div>
        <div className="mt-12 grid border-l border-t border-background-300 md:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((partner, index) => (
            <article key={partner.id} className="min-h-60 border-b border-r border-background-300 bg-background-50 p-6">
              <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-primary-700">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-8 font-heading text-xl font-semibold text-background-950">
                {partner.title}
              </h3>
              <p className="mt-4 text-sm leading-[1.75] text-foreground-600">
                {partner.description}
              </p>
            </article>
          ))}
        </div>
        <div className="reveal mt-8 flex justify-center">
          <Link to={content.cta_url} className="btn-primary">
            {content.cta_label}
            <i className="ri-arrow-right-line" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
