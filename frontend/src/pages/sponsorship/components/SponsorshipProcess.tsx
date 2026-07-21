import { Link } from "react-router-dom";
import SectionHeader from "@/components/base/SectionHeader";
import { informationSessionPath } from "./constants";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const steps = [
  ["Discover", "Clarify the organisation, objective, target audience, preferred route and intended professional impact."],
  ["Design", "Agree the supported activity, scope, responsibilities, visibility, safeguards and delivery period."],
  ["Approve", "Confirm governance, conflicts, privacy, commercial disclosure and final partnership terms."],
  ["Deliver", "Run the programme, event, award, club, scholarship or publication activity as agreed."],
  ["Review", "Report proportionately on delivery, participation, outcomes, lessons and future recommendations."],
];
const fallbackContent = { eyebrow: "Partnership process", title: "From sponsorship objective to accountable delivery.", description: "A professional process protects both the sponsor and the Institute by defining the purpose, boundaries, deliverables and review arrangements.", steps: steps.map(([title, description], index) => ({ id: String(index + 1).padStart(2, "0"), title, description })), cta_label: "Start sponsorship enquiry", cta_url: informationSessionPath };

export default function SponsorshipProcess() {
  const content = useManagedSection("process", fallbackContent);
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
        <ol className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-16 lg:grid-cols-5">
          {content.steps.filter(isManagedItemActive).map((step) => (
            <li key={step.id} className="reveal h-full min-h-64 border border-background-200/70 border-t-[3px] border-t-primary-500 bg-background-50 p-6 transition-colors hover:border-primary-300">
              <span className="font-heading text-sm font-bold text-primary-600">{step.id}</span>
              <h3 className="mt-8 font-heading text-lg font-semibold text-background-950">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground-600">{step.description}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-wrap  justify-center  ">
          <Link to={content.cta_url} className="btn-primary   ">{content.cta_label}<i className="ri-arrow-right-line" aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}
