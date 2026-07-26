import { useState } from "react";
import SectionHeader from "@/components/base/SectionHeader";
import {
  isManagedItemActive,
  useManagedSection,
} from "@/components/content/ManagedContentProvider";

const questions = [
  { question: "Do I need existing project controls knowledge?", answer: "No. Existing technical knowledge is not the main scholarship criterion. Applicants may be completely new to project controls. The Institute is primarily interested in character, need, service, motivation, potential and commitment to complete." },
  { question: "Are 40 places guaranteed in every intake?", answer: "No. The Institute aims to support up to 40 places per intake, but the actual number depends on funding availability, programme capacity, eligibility, application quality and final approval." },
  { question: "Does every scholarship cover the full programme?", answer: "Not necessarily. Awards may be full, partial or focused on specific professional development activities. The exact support will be confirmed in writing for each successful applicant." },
  { question: "Can self-employed professionals and consultants apply?", answer: "Yes. A specific bursary route is available for self-employed professionals, freelancers, sole traders and consultants who do not have access to a large employer training budget." },
  { question: "Can armed forces veterans and public-service professionals apply?", answer: "Yes. The transition category helps applicants translate transferable leadership, logistics, planning and risk experience into civilian project controls careers." },
  { question: "Can a person with a previous conviction apply?", answer: "Yes. The Second Chance Career Repositioning category supports positive reintegration and rebuilding. Applications will be handled fairly and sensitively, while suitability, safeguarding and relevant requirements may still be considered." },
  { question: "Do all applicants need more than 10,000 social media followers?", answer: "No. A follower threshold is relevant only to the Social Media for Good route and is not a general scholarship requirement." },
  { question: "What if none of the categories describes me?", answer: "Use the open application route. Explain your circumstances, the barrier you face, your professional or social contribution and the difference support would make." },
  { question: "Does receiving a scholarship automatically make me a Fellow?", answer: "No. A scholarship may support learning and professional development, but Associate Fellowship and Fellowship remain competence-based recognition routes with separate evidence requirements." },
  { question: "Will I have to share my personal story publicly?", answer: "No. Applicants should not be required to disclose private financial, medical, criminal justice or personal circumstances publicly. A success story may only be shared with appropriate consent and agreed wording." },
  { question: "Can an employer, university or charity sponsor applicants?", answer: "Yes. Organisations can sponsor individuals, groups, award categories, events, mentoring and related professional development through the Institute's sponsorship route." },
];

export default function ScholarshipFaq() {
  const content = useManagedSection("faq", {
    eyebrow: "Frequently Asked Questions",
    title: "Questions about eligibility, funding and applications.",
    description:
      "Clear information about who may apply, what support can include and how the scheme operates.",
    items: questions,
  });
  const items = content.items.filter(isManagedItemActive);
  const [openQuestion, setOpenQuestion] = useState<number | null>(0);

  return (
    <section className="bg-background-50 section-padding">
      <div className="container-content grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="reveal lg:col-span-5">
          <SectionHeader
            eyebrow={content.eyebrow}
            title={content.title}
            subtitle={content.description}
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
