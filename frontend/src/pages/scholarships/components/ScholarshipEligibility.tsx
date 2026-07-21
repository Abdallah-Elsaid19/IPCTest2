import { useState } from "react";
import FeatureCard from "@/components/base/FeatureCard";
import SectionHeader from "@/components/base/SectionHeader";

type QuestionKey = "who" | "objective" | "stage";

const criteria = [
  { icon: "ri-checkbox-circle-line", title: "Eligibility", description: "The applicant or learner group fits the published route and programme purpose." },
  { icon: "ri-door-open-line", title: "Access need", description: "The support addresses a genuine barrier, opportunity gap or development need." },
  { icon: "ri-fire-line", title: "Motivation", description: "The applicant can explain their project-controls interest and intended next step." },
  { icon: "ri-links-line", title: "Relevance", description: "The opportunity connects to project controls, employability, learning or applied research." },
  { icon: "ri-hand-heart-line", title: "Professional conduct", description: "Participants agree to responsible, respectful and ethical behaviour." },
  { icon: "ri-line-chart-line", title: "Impact", description: "The route offers a credible development outcome rather than a vague or unsupported claim." },
];

const options: Record<QuestionKey, { label: string; value: string }[]> = {
  who: [
    { label: "Individual learner", value: "individual" },
    { label: "Career changer", value: "career" },
    { label: "Academic organisation", value: "academic" },
    { label: "Employer or sponsor", value: "sponsor" },
  ],
  objective: [
    { label: "Learning or event access", value: "learning" },
    { label: "Career transition", value: "career" },
    { label: "Support a learner group", value: "cohort" },
    { label: "Research or employability", value: "research" },
  ],
  stage: [
    { label: "Initial enquiry", value: "initial" },
    { label: "A defined learner or cohort plan exists", value: "defined" },
    { label: "Current or prospective partner", value: "partner" },
  ],
};

export default function ScholarshipEligibility() {
  const [answers, setAnswers] = useState<Partial<Record<QuestionKey, string>>>({});
  const [result, setResult] = useState<{ title: string; copy: string } | null>(null);

  const showResult = () => {
    const { who, objective, stage } = answers;
    if (!who || !objective || !stage) {
      setResult({ title: "Complete all three questions", copy: "Choose one answer in each section so the page can suggest the most relevant enquiry route." });
    } else if (who === "academic" || objective === "research") {
      setResult({ title: "Academic partner route", copy: "Send the organisation name, learner group, course or programme, number of places and the intended employability, research or professional outcome." });
    } else if (who === "sponsor" || objective === "cohort") {
      setResult({ title: "Sponsored cohort route", copy: "Send the organisation name, sponsorship objective, target learner group, proposed number of places and intended professional or social impact." });
    } else if (who === "career" || objective === "career") {
      setResult({ title: "Career access route", copy: "Send your previous experience, transferable skills, intended project-controls direction and the development opportunity you are seeking." });
    } else {
      setResult({ title: "Individual learner route", copy: "Send your current study or role, programme interest, development objective and reason support is needed." });
    }
  };

  return (
    <section id="eligibility" className="scroll-mt-20 bg-background-50 section-padding">
      <div className="container-content">
        <div className="reveal">
          <SectionHeader
            eyebrow="Eligibility and selection"
            title="Support should be purposeful, fair and explainable"
            subtitle="Each scholarship programme should publish its own criteria. Selection should reflect the purpose of the intake, available funding and the likely professional benefit."
            centered
          />
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
          {criteria.map((item, index) => (
            <div key={item.title} className="reveal" style={{ transitionDelay: `${index * 70}ms` }}>
              <FeatureCard {...item} />
            </div>
          ))}
        </div>

        <div className="reveal mx-auto mt-14 max-w-4xl border border-background-200/70 bg-background-100 p-6 md:p-8">
          <span className="eyebrow mb-3 block text-primary-600">Indicative route checker</span>
          <h3 className="font-heading text-2xl font-semibold text-background-950">Which route is most likely to fit?</h3>
          <p className="mt-3 text-sm leading-relaxed text-foreground-600">Answer three questions. This guidance does not confirm eligibility, funding or an open intake.</p>
          <div className="mt-7 grid gap-6 md:grid-cols-3">
            {(["who", "objective", "stage"] as QuestionKey[]).map((question) => (
              <fieldset key={question}>
                <legend className="mb-3 text-sm font-semibold text-background-950">
                  {question === "who" ? "Who is making the enquiry?" : question === "objective" ? "What is the main objective?" : "What stage are you at?"}
                </legend>
                <div className="grid gap-2">
                  {options[question].map((option) => {
                    const selected = answers[question] === option.value;
                    return (
                      <button key={option.value} type="button" aria-pressed={selected} onClick={() => setAnswers((current) => ({ ...current, [question]: option.value }))} className={`min-h-11 border px-3 py-2 text-left text-xs font-semibold transition-colors ${selected ? "border-background-950 bg-background-950 text-background-50" : "border-background-300 bg-background-50 text-background-950 hover:border-primary-400"}`}>
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
          <button type="button" onClick={showResult} className="btn-primary mt-7 inline-flex min-h-12 items-center justify-center">Show likely route</button>
          {result && (
            <div role="status" className="mt-5 border-l-[3px] border-primary-500 bg-background-50 p-5">
              <strong className="text-sm text-background-950">{result.title}</strong>
              <p className="mt-2 text-sm leading-relaxed text-foreground-600">{result.copy}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
