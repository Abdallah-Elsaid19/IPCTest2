import { Link } from "react-router-dom";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

interface ApplicationJourneyStep {
  id: string;
  title: string;
  description: string;
}

const applicationJourneySteps: ApplicationJourneyStep[] = [
  {
    id: "01",
    title: "Explore",
    description:
      "Review the grades, member value and professional scope of IPC recognition.",
  },
  {
    id: "02",
    title: "Select",
    description:
      "Use the grade finder and comparison to identify the most suitable starting route.",
  },
  {
    id: "03",
    title: "Prepare",
    description:
      "Collect the CV, statement, CPD, examples, portfolio, case study or references required.",
  },
  {
    id: "04",
    title: "Review",
    description:
      "IPC reviews the submitted evidence and may request clarification or a professional discussion.",
  },
  {
    id: "05",
    title: "Recognition",
    description:
      "Receive a decision, grade recommendation, evidence request or professional-development guidance.",
  },
];

interface ApplicationJourneyProps {
  onOpenGradeFinder: (trigger: HTMLButtonElement) => void;
}

export default function ApplicationJourney({ onOpenGradeFinder }: ApplicationJourneyProps) {
  const content = useManagedSection("application_journey", { eyebrow: "Application Journey", title: "Professional, transparent and designed to create a useful next step.", description: "Recognition should test evidence and judgement without rewarding confidence over competence or job title over proof.", cta_label: "Check your grade first", steps: applicationJourneySteps });
  const steps = content.steps.filter(isManagedItemActive);
  return (
    <section
        id="application-journey"
        aria-labelledby="application-journey-title"
        className="scroll-mt-20 border-b border-background-200/70 bg-background-50 section-padding"
      >
        <div className="container-content">
        <div className="mb-8 flex items-center gap-4">
          <span className="h-px w-10 bg-primary-500" aria-hidden="true" />
          <span className="eyebrow text-primary-600">{content.eyebrow}</span>
        </div>

        <h2
          id="application-journey-title"
          className="max-w-5xl font-heading text-[clamp(2.5rem,5.4vw,5rem)] font-semibold leading-[1.04] tracking-[-0.045em] text-background-950"
        >
          {content.title}
        </h2>

        <p className="mt-8 max-w-4xl text-base leading-[1.8] text-foreground-600 md:text-lg">
          {content.description}
        </p>

        <ol className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 md:mt-14 lg:grid-cols-5">
          {steps.map((step) => (
            <li
              key={step.id}
              className="min-h-[280px] border border-background-300 border-t-[3px] border-t-primary-500 bg-background-100 p-6 md:p-7"
            >
              <span className="font-mono text-xs font-bold text-primary-600">
                {step.id}
              </span>
              <h3 className="mt-10 font-heading text-xl font-semibold text-background-950">
                {step.title}
              </h3>
              <p className="mt-4 text-sm leading-[1.75] text-foreground-600">
                {step.description}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
         
          <button
            type="button"
            onClick={(event) => onOpenGradeFinder(event.currentTarget)}
            className="btn-primary inline-flex min-h-14  "
          >
            {content.cta_label}
          </button>
        </div>
        </div>
      </section>
  );
}
