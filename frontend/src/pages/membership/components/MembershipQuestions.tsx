import { useState } from "react";
import { Link } from "react-router-dom";
import ResponsiveImage from "@/components/base/ResponsiveImage";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const membershipCtaImage = "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/6a827fecd1aa450dabef7052b7453c42.webp";

interface MembershipQuestion {
  id: string;
  question: string;
  answer: string;
  is_active?: boolean;
}

const membershipQuestions: MembershipQuestion[] = [
  {
    id: "job-title",
    question: "Do I need a job title containing “Project Controls”?",
    answer:
      "No. IPC can recognise planners, schedulers, cost professionals, estimators, PMO analysts, risk professionals, commercial specialists, project managers and other related roles where relevant evidence is available.",
  },
  {
    id: "confidential-evidence",
    question: "Can confidential evidence be anonymised?",
    answer:
      "Yes. Applicants should remove confidential client names, project identifiers, personal information and sensitive commercial records where necessary.",
  },
  {
    id: "wrong-grade",
    question: "What happens if I choose the wrong grade?",
    answer:
      "The review may recommend another grade or explain what evidence is needed to progress. The aim is a useful professional outcome rather than a simple rejection.",
  },
  {
    id: "recognition-status",
    question: "Is IPC recognition a qualification or chartered status?",
    answer:
      "No. IPC is a standards-informed, evidence-based professional membership and recognition pathway. It should not be presented as a regulated qualification, apprenticeship award, chartered status or statutory licence.",
  },
  {
    id: "responsible-practice",
    question: "Are AI, digital tools and sustainability included?",
    answer:
      "Yes. Modern recognition can consider responsible use of AI and digital systems, data assurance, sustainability and carbon alongside core project-controls practice.",
  },
];

interface MembershipQuestionsProps {
  onOpenGradeFinder: (trigger: HTMLButtonElement) => void;
}

export default function MembershipQuestions({ onOpenGradeFinder }: MembershipQuestionsProps) {
  const content = useManagedSection("questions", { eyebrow: "Membership Questions", title: "Clear answers before you apply.", description: "Understand eligibility, evidence, confidentiality, progression and professional scope.", items: membershipQuestions, cta_eyebrow: "Your Next Professional Step", cta_title: "Choose a grade. Prepare your evidence. Make your contribution visible.", cta_description: "Explore individual membership or speak with IPC about a corporate, consultancy or academic pathway.", primary_cta_label: "Find your grade", secondary_cta_label: "Contact membership team", secondary_cta_url: "/information-session" });
  const questions = content.items.filter(isManagedItemActive);
  const [openQuestions, setOpenQuestions] = useState<Set<string>>(
    () => new Set(),
  );

  const toggleQuestion = (id: string) => {
    setOpenQuestions((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section
      aria-labelledby="membership-questions-title"
      className="border-b border-background-200/70 bg-background-50 section-padding"
    >
      <div className="container-content">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-primary-500" aria-hidden="true" />
              <span className="eyebrow text-primary-600">{content.eyebrow}</span>
            </div>
            <h2
              id="membership-questions-title"
              className="mt-6 max-w-md font-heading text-[clamp(2.5rem,5vw,4.75rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-background-950"
            >
              {content.title}
            </h2>
            <p className="mt-7 max-w-md text-base leading-[1.75] text-foreground-600 md:text-lg">
              {content.description}
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="space-y-3">
              {questions.map((item) => {
                const isOpen = openQuestions.has(item.id);
                const panelId = `membership-question-${item.id}`;

                return (
                  <article key={item.id} className="border border-background-300 bg-background-50/95">
                    <h3 className={isOpen ? "-m-px border border-primary-600 bg-background-50" : ""}>
                      <button
                        type="button"
                        onClick={() => toggleQuestion(item.id)}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left font-heading text-sm font-semibold text-background-950 transition-colors hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600 sm:px-6 sm:text-base motion-reduce:transition-none"
                      >
                        <span>{item.question}</span>
                        <i
                          className={`${isOpen ? "ri-subtract-line" : "ri-add-line"} shrink-0 text-primary-600`}
                          aria-hidden="true"
                        />
                      </button>
                    </h3>
                    {isOpen && (
                      <div id={panelId} className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
                        <p className="text-sm leading-[1.75] text-foreground-600">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </div>

        <div className="relative mt-20 overflow-hidden bg-secondary-900 text-background-50 lg:mt-28 lg:min-h-[520px]">
          <div className="relative aspect-[16/9] overflow-hidden lg:absolute lg:inset-y-0 lg:right-0 lg:w-[60%] lg:aspect-auto">
            <ResponsiveImage
              src={membershipCtaImage}
              alt=""
              width={2048}
              height={1152}
              sizes="(max-width: 1023px) 100vw, 60vw"
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-background-950/45" aria-hidden="true" />
            <div
              className="absolute inset-0 bg-gradient-to-t from-secondary-900 via-secondary-900/20 to-transparent lg:bg-gradient-to-r lg:from-secondary-900 lg:via-secondary-900/65 lg:to-transparent"
              aria-hidden="true"
            />
          </div>

          <div className="relative z-10 px-6 pb-10 pt-4 sm:px-10 sm:pb-12 lg:flex lg:min-h-[520px] lg:w-[58%] lg:flex-col lg:justify-center lg:px-14 lg:py-14">
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-primary-500" aria-hidden="true" />
              <span className="eyebrow text-primary-400">{content.cta_eyebrow}</span>
            </div>
            <h2 className="mt-6 max-w-2xl font-heading text-[clamp(2.25rem,4.5vw,4rem)] font-semibold leading-[1.04] tracking-[-0.045em]">
              {content.cta_title}
            </h2>
            <p className="mt-7 max-w-lg text-sm leading-[1.75] text-background-300 sm:text-base">
              {content.cta_description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={(event) => onOpenGradeFinder(event.currentTarget)}
                className="btn-primary inline-flex min-h-12 items-center justify-center gap-5 px-6"
              >
                {content.primary_cta_label}
                <i className="ri-arrow-right-line" aria-hidden="true" />
              </button>
              <Link
                to={content.secondary_cta_url}
                className="inline-flex min-h-12 items-center justify-center gap-5 border border-primary-500/70 px-6 text-sm font-semibold text-background-50 transition-colors hover:border-primary-400 hover:text-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-900 motion-reduce:transition-none"
              >
                {content.secondary_cta_label}
                <i className="ri-arrow-right-line text-primary-400" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
