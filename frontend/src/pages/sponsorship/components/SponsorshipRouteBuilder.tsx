import { useState } from "react";
import { Link } from "react-router-dom";
import SectionHeader from "@/components/base/SectionHeader";
import { informationSessionPath } from "./constants";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

type QuestionKey = "objective" | "audience" | "support";

const questions: { key: QuestionKey; label: string; options: { label: string; value: string }[] }[] = [
  {
    key: "objective",
    label: "What is your main objective?",
    options: [
      { label: "Widen access", value: "access" },
      { label: "Support learning", value: "learning" },
      { label: "Recognise excellence", value: "recognition" },
      { label: "Share knowledge", value: "knowledge" },
      { label: "Support community", value: "community" },
    ],
  },
  {
    key: "audience",
    label: "Who should benefit most?",
    options: [
      { label: "Learners or career changers", value: "learners" },
      { label: "IPC members", value: "members" },
      { label: "Wider profession", value: "profession" },
      { label: "Regional community", value: "regional" },
    ],
  },
  {
    key: "support",
    label: "How would you like to contribute?",
    options: [
      { label: "Funding", value: "funding" },
      { label: "Venue or hosting", value: "venue" },
      { label: "Speakers or mentors", value: "people" },
      { label: "Combined package", value: "combined" },
    ],
  },
];

export default function SponsorshipRouteBuilder() {
  const content = useManagedSection("route_builder", {
    eyebrow: "Sponsorship route builder", title: "Create an indicative partnership route.", description: "Answer three questions to generate a recommended starting conversation.",
    button_label: "Build recommended route", result_cta_label: "Start the conversation", result_cta_url: informationSessionPath,
    questions,
    results: {
      incomplete: { title: "Complete all three questions", description: "Choose one answer in each section so the page can suggest the most relevant sponsorship route." },
      access: { title: "Scholarship or learner-access sponsorship", description: "Support a defined learner or emerging-talent group through access, mentoring, events or professional-development opportunities." },
      recognition: { title: "Awards and prizes sponsorship", description: "Support professional recognition, prizes, finalist profiles or awards activity while protecting judging independence." },
      knowledge: { title: "Publication, research or technical-learning sponsorship", description: "Support evidence-led knowledge, technical sessions, research, case studies or professional publications subject to review." },
      community: { title: "Regional club sponsorship", description: "Support local talks, networking, mentoring, site visits, venues or regional professional activity." },
      default: { title: "Event and professional-learning sponsorship", description: "Support master classes, roundtables, mentoring, employer forums or wider event access." },
    },
  });
  const managedQuestions = content.questions.filter(isManagedItemActive) as typeof questions;
  const [answers, setAnswers] = useState<Partial<Record<QuestionKey, string>>>({});
  const [result, setResult] = useState<{ title: string; description: string } | null>(null);

  const buildRoute = () => {
    if (!answers.objective || !answers.audience || !answers.support) {
      setResult(content.results.incomplete);
    } else if (answers.objective === "access" || answers.audience === "learners") {
      setResult(content.results.access);
    } else if (answers.objective === "recognition") {
      setResult(content.results.recognition);
    } else if (answers.objective === "knowledge") {
      setResult(content.results.knowledge);
    } else if (answers.objective === "community" || answers.audience === "regional") {
      setResult(content.results.community);
    } else {
      setResult(content.results.default);
    }
  };

  return (
    <section id="route-builder" className="scroll-mt-20 bg-background-100 section-padding">
      <div className="container-content">
        <div className="reveal">
          <SectionHeader
            eyebrow={content.eyebrow}
            title={content.title}
            subtitle={content.description}
            centered
          />
        </div>
        <div className="reveal mx-auto mt-12 max-w-5xl border border-background-200/70 bg-background-50 p-6 md:mt-16 md:p-8">
          <div className="grid gap-7 lg:grid-cols-3">
            {managedQuestions.map((question) => (
              <fieldset key={question.key}>
                <legend className="mb-4 text-sm font-semibold text-background-950">{question.label}</legend>
                <div className="grid gap-2">
                  {question.options.map((option) => {
                    const selected = answers[question.key] === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setAnswers((current) => ({ ...current, [question.key]: option.value }))}
                        className={`min-h-11 border px-3 py-2 text-left text-xs font-semibold transition-colors ${selected ? "border-background-950 bg-background-950 text-background-50" : "border-background-300 bg-background-50 text-background-950 hover:border-primary-400"}`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
          <button type="button" onClick={buildRoute} className="btn-primary mt-8 inline-flex min-h-12 items-center justify-center">{content.button_label}</button>
          {result && (
            <div role="status" className="mt-6 border-l-[3px] border-primary-500 bg-background-100 p-5">
              <strong className="text-sm text-background-950">{result.title}</strong>
              <p className="mt-2 text-sm leading-relaxed text-foreground-600">{result.description}</p>
              {result.title !== "Complete all three questions" && (
                <Link to={content.result_cta_url} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-700">{content.result_cta_label}<i className="ri-arrow-right-line" aria-hidden="true" /></Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
