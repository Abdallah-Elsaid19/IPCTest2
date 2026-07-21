import { useState } from "react";
import SectionHeader from "@/components/base/SectionHeader";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const questions = [
  ["Are scholarships currently open?", "Availability is intake-specific and depends on confirmed funding and eligibility. This page invites enquiries but does not guarantee that a current programme is open."],
  ["Does a scholarship guarantee membership or professional recognition?", "No. Scholarship support and professional recognition are separate. Any membership or recognition decision remains subject to the applicable requirements, evidence and review."],
  ["Can an academic partner nominate a learner group?", "Yes. Academic partners can enquire about learner cohorts, programme interests, employability, research and progression pathways. IPC will confirm whether a suitable route is available."],
  ["Can an employer or sponsor support a defined cohort?", "Yes. The enquiry should explain the target learner group, number of places, sponsorship objective and intended professional or social impact."],
  ["What should an individual learner include?", "Include your current study or role, project-controls interest, preferred activity or programme, development objective and a short explanation of why support would make a meaningful difference."],
  ["Can a sponsor influence selection or recognition decisions?", "No. Sponsorship should remain transparent and separate from membership, professional-recognition, judging and editorial decisions."],
];

export default function ScholarshipFaq() {
  const content = useManagedSection("faq", { eyebrow: "Scholarship questions", title: "Clear guidance before making an enquiry", description: "Understand availability, eligibility, support, recognition and sponsorship safeguards.", items: questions });
  const items = content.items.filter(isManagedItemActive).map((item) => Array.isArray(item) ? { question: item[0], answer: item[1] } : item);
  const [openQuestions, setOpenQuestions] = useState<Set<number>>(() => new Set());
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
        <div className="reveal mx-auto mt-12 max-w-4xl space-y-3 md:mt-16">
          {items.map(({ question, answer }, index) => {
            const open = openQuestions.has(index);
            return (
              <article key={question} className="border border-background-200/70 bg-background-50">
                <h3>
                  <button type="button" aria-expanded={open} aria-controls={`scholarship-faq-${index}`} onClick={() => setOpenQuestions((current) => { const next = new Set(current); if (next.has(index)) next.delete(index); else next.add(index); return next; })} className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left font-heading text-sm font-semibold text-background-950 transition-colors hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600 sm:px-6 sm:text-base">
                    <span>{question}</span><i className={`${open ? "ri-subtract-line" : "ri-add-line"} shrink-0 text-primary-600`} aria-hidden="true" />
                  </button>
                </h3>
                {open && <div id={`scholarship-faq-${index}`} className="px-5 pb-5 sm:px-6 sm:pb-6"><p className="text-sm leading-relaxed text-foreground-600">{answer}</p></div>}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
