import { useState } from "react";
import SectionHeader from "@/components/base/SectionHeader";
import {
  isManagedItemActive,
  useManagedSection,
} from "@/components/content/ManagedContentProvider";

const questions = [
  {
    question: "Does IPC guarantee 70% funding to every applicant?",
    answer:
      "No. Funding is discretionary and depends on applicant need, available scholarship resources, programme route and the written award decision. The contribution may be 50%, 60%, 70% or another approved amount.",
  },
  {
    question: "Who pays the remaining 30%–50%?",
    answer:
      "The remaining contribution may be paid by the learner, an employer, a sponsor or another approved co-funding source. The complete funding route must be confirmed before enrolment.",
  },
  {
    question:
      "Can the IPC contribution be combined with public funding?",
    answer:
      "It may be possible where the relevant funding rules allow it, but the same eligible cost cannot be funded twice. IPC and Kent Business College will confirm the permitted arrangement in writing.",
  },
  {
    question: "Should I apply to IPC or Kent Business College first?",
    answer:
      "Explore the official Kent Business College programme page first, then submit your IPC scholarship application. Kent Business College confirms programme suitability and admission; IPC confirms the scholarship contribution.",
  },
  {
    question: "Can self-employed professionals and consultants apply?",
    answer:
      "Yes. Freelancers, sole traders and consultants may apply where they meet the scholarship criteria and do not have access to sufficient employer-funded professional development.",
  },
  {
    question: "Do I need existing project controls expertise?",
    answer:
      "No. Applicants may be new to project controls. IPC considers character, need, service, motivation, transferable experience, potential and the ability to benefit from the opportunity.",
  },
  {
    question: "Does scholarship approval guarantee admission?",
    answer:
      "No. Scholarship approval and programme admission are separate decisions. Kent Business College must confirm that the applicant meets the programme’s entry, suitability and participation requirements.",
  },
];

export default function ScholarshipFaq() {
  const content = useManagedSection("faq", {
    eyebrow: "Frequently Asked Questions",
    title: "IPC and Kent Business College scholarship questions.",
    items: questions,
  });
  const items = content.items.filter(isManagedItemActive);
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  return (
    <section className="bg-background-50 section-padding">
      <div className="container-content grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="reveal lg:col-span-5">
          <SectionHeader
            eyebrow={content.eyebrow}
            title={content.title}
          />
        </div>
        <div className="reveal space-y-3 lg:col-span-7">
          {items.map((item, index) => {
            const open = openQuestion === index;
            return (
              <article key={item.question} className="border border-background-300 bg-background-50">
                <h3>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`scholarship-faq-${index}`}
                    onClick={() => setOpenQuestion(open ? null : index)}
                    className="flex w-full items-center justify-between gap-5 p-5 text-left font-heading text-sm font-semibold text-background-950 transition-colors hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600 sm:p-6 sm:text-base"
                  >
                    <span>{item.question}</span>
                    <i className={`${open ? "ri-subtract-line" : "ri-add-line"} shrink-0 text-primary-600`} aria-hidden="true" />
                  </button>
                </h3>
                {open && (
                  <div id={`scholarship-faq-${index}`} className="px-5 pb-5 sm:px-6 sm:pb-6">
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
    </section>
  );
}
