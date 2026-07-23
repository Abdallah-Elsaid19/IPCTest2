import { Link } from "react-router-dom";
import { useManagedSection } from "@/components/content/ManagedContentProvider";

export default function ServicesFinalCta() {
  const section = useManagedSection("final_cta", {
    eyebrow: "Start the right conversation",
    title: "Choose a service. Define the outcome. Build professional capability.",
    description: "Share your role or organisation, main objective, preferred pathway and intended result.",
    primary_cta_label: "Start service enquiry",
    primary_cta_url: "/information-session",
    secondary_cta_label: "Explore portfolio",
    secondary_cta_url: "#services",
    notice: "IPC recognition does not replace competence, evidence or ethical conduct and should not be represented as a regulated qualification, chartered status or statutory licence.",
  });
  return (
    <section className="bg-background-50 pb-20 md:pb-28">
      <div className="container-content">
        <div className="reveal grid items-end gap-8 bg-accent-700 p-7 text-background-50 md:p-12 lg:grid-cols-[1fr_auto] lg:p-16">
          <div><span className="eyebrow text-primary-300">{section.eyebrow}</span><h2 className="mt-4 max-w-3xl font-heading text-3xl font-semibold leading-tight md:text-5xl">{section.title}</h2><p className="mt-5 max-w-2xl text-sm leading-relaxed text-background-200 md:text-base">{section.description}</p></div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link to={section.primary_cta_url} state={{ enquiry: "Professional Services Enquiry" }} className="btn-primary">
              {section.primary_cta_label}
            </Link>
            <a href={section.secondary_cta_url} className="btn-secondary">
              {section.secondary_cta_label}
            </a>
          </div>
        </div>
        <p className="mt-5 text-xs leading-relaxed text-foreground-500">{section.notice}</p>
      </div>
    </section>
  );
}
