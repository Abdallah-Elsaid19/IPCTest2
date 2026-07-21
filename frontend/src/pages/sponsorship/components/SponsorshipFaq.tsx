import { useState } from "react";
import SectionHeader from "@/components/base/SectionHeader";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const questions = [
  ["What can an organisation sponsor?", "Potential routes include scholarships, learner places, events, master classes, awards, regional clubs, publications, research and selected professional-development activity."],
  ["Can a sponsor influence membership or recognition decisions?", "No. Sponsorship must remain separate from membership grades, evidence assessment and professional-review decisions."],
  ["Can sponsors access attendee, member or learner data?", "Not automatically. Any data use must be transparent, consent-based, proportionate and compliant with the relevant privacy arrangements."],
  ["Can a sponsor provide a speaker or case study?", "Yes, where the content is relevant, evidence-led and useful to the audience. It remains subject to IPC review and should not become an undisclosed sales presentation."],
  ["Can a sponsor judge an award category?", "Any judging involvement must be explicitly agreed, conflicts-managed and compatible with independence. Sponsorship alone does not create an automatic judging right."],
  ["What impact information can a sponsor receive?", "Reporting can include supported activity, participation, access created, outputs and agreed outcomes, while protecting personal and confidential information."],
];
const fallbackContent = { eyebrow: "Sponsorship questions", title: "Clear boundaries before a partnership begins.", description: "Understand visibility, privacy, recognition, judging, content and reporting.", items: questions.map(([question, answer]) => ({ question, answer })) };

export default function SponsorshipFaq() {
  const content = useManagedSection("faq", fallbackContent);
  const [openQuestions, setOpenQuestions] = useState<Set<number>>(() => new Set());

  return (
    <section className="bg-background-100 section-padding">
      <div className="container-content">
        <div className="reveal">
          <SectionHeader
            eyebrow={content.eyebrow}
            title={content.title}
            subtitle={content.description}
            centered
          />
        </div>
        <div className="reveal mx-auto mt-12 max-w-4xl space-y-3 md:mt-16">
          {content.items.filter(isManagedItemActive).map(({ question, answer }, index) => {
            const open = openQuestions.has(index);
            return (
              <article key={question} className="border border-background-200/70 bg-background-50">
                <h3>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`sponsorship-faq-${index}`}
                    onClick={() => setOpenQuestions((current) => {
                      const next = new Set(current);
                      if (next.has(index)) next.delete(index);
                      else next.add(index);
                      return next;
                    })}
                    className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left font-heading text-sm font-semibold text-background-950 transition-colors hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600 sm:px-6 sm:text-base"
                  >
                    <span>{question}</span>
                    <i className={`${open ? "ri-subtract-line" : "ri-add-line"} shrink-0 text-primary-600`} aria-hidden="true" />
                  </button>
                </h3>
                {open && (
                  <div id={`sponsorship-faq-${index}`} className="px-5 pb-5 sm:px-6 sm:pb-6">
                    <p className="text-sm leading-relaxed text-foreground-600">{answer}</p>
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
