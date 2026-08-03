import { Link } from "react-router-dom";
import SectionHeader from "@/components/base/SectionHeader";
import { informationSessionPath } from "./constants";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const steps = [
  ["Choose an area of interest", "Select learners, events, awards, clubs, publications, research, community activity or strategic partnership."],
  ["Explain the desired impact", "Describe the audience, location, objective or social value the organisation wants to support."],
  ["Discuss scope and fit", "IPC considers availability, integrity, capacity, audience relevance and conflicts."],
  ["Agree benefits and boundaries", "Confirm branding, guest access, reporting, confidentiality and independence requirements."],
  ["Confirm the agreement", "A written sponsorship agreement sets out scope, duration and responsibilities."],
  ["Deliver and review impact", "The activity is delivered and proportionate impact information is shared."],
];
const fallbackContent = {
  eyebrow: "How sponsorship begins",
  title: "A simple conversation followed by a clear written agreement.",
  description: "There is no public checkout or fixed-price catalogue. The Institute first understands the sponsor’s objectives and intended impact.",
  steps: steps.map(([title, description], index) => ({ id: String(index + 1).padStart(2, "0"), title, description })),
  checklist_title: "Include these details in your enquiry.",
  checklist: ["Organisation name and website", "Primary contact and role", "Sponsorship route of interest", "Audience or location to support", "Preferred activity or programme", "Approximate duration or intake", "Professional or social-impact objective", "Branding or reporting requirements"],
  cta_label: "Start a Sponsorship Conversation",
  cta_url: informationSessionPath,
};

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
        <ol className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
          {content.steps.filter(isManagedItemActive).map((step) => (
            <li key={step.id} className="reveal h-full min-h-64 border border-background-200/70 border-t-[3px] border-t-primary-500 bg-background-50 p-6 transition-colors hover:border-primary-300">
              <span className="font-heading text-sm font-bold text-primary-600">{step.id}</span>
              <h3 className="mt-8 font-heading text-lg font-semibold text-background-950">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground-600">{step.description}</p>
            </li>
          ))}
        </ol>
        <div className="reveal mt-8 grid gap-6 border border-background-200/70 bg-background-100 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <h3 className="font-heading text-lg font-semibold text-background-950">{content.checklist_title}</h3>
            <ul className="mt-4 grid gap-x-8 gap-y-2 text-sm text-foreground-600 sm:grid-cols-2 lg:grid-cols-4">
              {content.checklist.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <i className="ri-check-line mt-0.5 text-primary-700" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <Link to={content.cta_url} className="btn-primary max-w-full whitespace-normal text-center">{content.cta_label}<i className="ri-arrow-right-line" aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}
