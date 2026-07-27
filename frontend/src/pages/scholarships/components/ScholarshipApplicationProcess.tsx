import SectionHeader from "@/components/base/SectionHeader";
import { useManagedSection } from "@/components/content/ManagedContentProvider";

const steps = [
  {
    title: "Explore the Kent Business College programme",
    description:
      "Review the APM Level 4 or PCP Level 6 programme page and identify the route most relevant to your career.",
  },
  {
    title: "Submit an IPC scholarship application",
    description:
      "Email your CV or background summary, selected programme, scholarship category and a 500–1,000 word personal statement.",
  },
  {
    title: "IPC completes the values and funding review",
    description:
      "IPC assesses need, character, service, motivation, potential and available scholarship resources.",
  },
  {
    title: "Kent Business College completes admissions review",
    description:
      "KBC confirms programme fit, entry requirements, intake, delivery route and any other available funding.",
  },
  {
    title: "The funding package is confirmed",
    description:
      "IPC confirms its 50%–70% contribution and the applicant, employer or sponsor confirms the remaining contribution.",
  },
  {
    title: "Enrolment and professional journey begin",
    description:
      "The learner enrols with Kent Business College and begins engaging with the IPC membership, events and recognition pathway where included.",
  },
];

export default function ScholarshipApplicationProcess() {
  const content = useManagedSection("application_process", {
    eyebrow: "From Interest to Enrolment",
    title: "One coordinated application journey.",
    description:
      "Applicants engage with both partners, but each partner has a clearly defined decision.",
    steps,
  });

  return (
    <section id="apply" className="scroll-mt-20 bg-background-50 section-padding">
      <div className="container-content">
        <div className="reveal max-w-4xl">
          <SectionHeader
            eyebrow={content.eyebrow}
            title={content.title}
            subtitle={content.description}
          />
        </div>
        <ol className="reveal mt-12 space-y-4 md:mt-16">
          {content.steps.map((step, index) => (
            <li
              key={step.title}
              className="group relative grid gap-5 border border-background-300 bg-background-50 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-500/60 hover:shadow-[0_16px_40px_rgba(25,20,14,0.08)] sm:grid-cols-[3rem_1fr] md:p-7"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-background-950 font-mono text-xs font-bold text-primary-400">
                {index + 1}
              </span>
              <div>
                <h3 className="font-heading text-xl font-semibold leading-tight text-background-950 md:text-2xl">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-[1.75] text-foreground-600 md:text-base">
                  {step.description}
                </p>
              </div>
              <span
                className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-primary-500 transition-transform duration-300 group-hover:scale-x-100"
                aria-hidden="true"
              />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
