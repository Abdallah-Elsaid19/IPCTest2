import SectionHeader from "@/components/base/SectionHeader";
import { useManagedSection } from "@/components/content/ManagedContentProvider";

const steps = [
  {
    title: "Select a scholarship or bursary route",
    description:
      "Choose the category that best explains your circumstances, contribution, transition, need or future potential. More than one route may apply.",
  },
  {
    title: "Prepare a professional background",
    description:
      "Include a CV, LinkedIn profile or short background summary. If your experience is outside project controls, explain its transferable value.",
  },
  {
    title: "Write a 500-1,000 word personal statement",
    description:
      "Explain your circumstances, motivation, chosen category, relevant service or experience, barriers faced and the difference support would make.",
  },
  {
    title: "Add supporting evidence",
    description:
      "This may include references, community or service evidence, career plans, relevant public profiles, transition information or proportionate evidence of need.",
  },
  {
    title: "Email the Institute",
    description:
      "Send the application to office@instituteofprojectcontrols.org. The Institute may request clarification, further evidence or a short discussion.",
  },
];

export default function ScholarshipApplicationProcess() {
  const content = useManagedSection("application_process", {
    eyebrow: "How to Apply",
    title: "A clear email application process for the launch phase.",
    description:
      "Applicants do not need to create an online account. Prepare the information below and email the Institute directly.",
    steps,
  });

  return (
    <section id="apply" className="scroll-mt-20 bg-background-50 section-padding">
      <div className="container-content">
        <div className="reveal">
          <SectionHeader
            eyebrow={content.eyebrow}
            title={content.title}
            subtitle={content.description}
            centered
          />
        </div>
        <ol className="reveal mt-12 grid border-l border-t border-background-300 sm:grid-cols-2 md:mt-16 lg:grid-cols-5">
          {content.steps.map((step, index) => (
            <li key={step.title} className="min-h-64 border-b border-r border-background-300 p-5 md:p-6">
              <span className="font-mono text-xs font-bold text-primary-700">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-8 font-heading text-lg font-semibold text-background-950">
                {step.title}
              </h3>
              <p className="mt-4 text-sm leading-[1.75] text-foreground-600">
                {step.description}
              </p>
            </li>
          ))}
        </ol>

      </div>
    </section>
  );
}
