import { Link } from "react-router-dom";
import SectionHeader from "@/components/base/SectionHeader";
import { informationSessionPath } from "./constants";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const steps = [
  ["Choose the category", "Identify the scholarship category that best reflects the barrier, transition, service or opportunity."],
  ["Describe the opportunity", "Explain the intended programme or professional route and the outcome you want to achieve."],
  ["Provide context", "Include your role, study or employment status, personal statement, barrier or need, CV or background summary and relevant supporting evidence."],
  ["IPC reviews the enquiry", "The Institute considers the programme, eligibility, available funding and the appropriate route."],
  ["Receive next steps", "IPC confirms whether more information is needed or whether a current or future pathway may be suitable."],
];

export default function ScholarshipApplicationProcess() {
  const content = useManagedSection("application_process", { eyebrow: "How to enquire", title: "A clear first step without an unnecessary application portal", description: "Scholarship enquiries can begin by email so IPC can understand the proposed route, learner group, intended outcome and current programme availability.", cta_label: "Start scholarship enquiry", cta_url: informationSessionPath, steps });
  const managedSteps = content.steps.filter(isManagedItemActive).map((step) => Array.isArray(step) ? { title: step[0], description: step[1] } : step);
  return (
    <section id="apply" className="scroll-mt-20 bg-background-100 section-padding">
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
          {managedSteps.map(({ title, description }, index) => (
            <li key={title} className="reveal h-full min-h-64 border border-background-200/70 bg-background-50 p-6 transition-all duration-300 hover:border-primary-200">
              <span className="font-heading text-3xl font-bold text-primary-500">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-7 font-heading text-lg font-semibold text-background-950">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground-600">{description}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 text-center">
          <Link to={content.cta_url} className="btn-primary inline-flex items-center gap-2"><i className="ri-mail-line" aria-hidden="true" />{content.cta_label}</Link>
        </div>
        <div className="mx-auto mt-10 max-w-3xl border-l-2 border-primary-500 bg-background-50 p-6 text-left">
          <h3 className="font-heading text-lg font-semibold text-background-950">Information to include</h3>
          <p className="mt-3 text-sm leading-relaxed text-foreground-600">Full name and contact details; current role, study or employment status; scholarship category; intended programme or professional route; short personal statement; barrier or need; intended professional outcome; CV or background summary; and supporting evidence or a reference where relevant. An enquiry is not an award.</p>
        </div>
      </div>
    </section>
  );
}
