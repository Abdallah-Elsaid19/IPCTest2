import { useState } from "react";
import { enquiryHref } from "./data";
import { useManagedSection } from "@/components/content/ManagedContentProvider";

type Answers = { who?: string; objective?: string; stage?: string };
type Result = { title: string; text: string; subject: string };

const questions = [
  { key: "who" as const, label: "Who is the service for?", options: [["Individual professional", "individual"], ["Employer or team", "employer"], ["Consultancy", "consultancy"], ["Academic partner", "academic"], ["Sponsor", "sponsor"]] },
  { key: "objective" as const, label: "Main objective?", options: [["Recognition", "recognition"], ["Workforce capability", "capability"], ["Learning & CPD", "learning"], ["Student employability", "students"], ["Awards or impact", "impact"]] },
  { key: "stage" as const, label: "Current stage?", options: [["Exploring", "exploring"], ["Defined need", "defined"], ["Ready to enquire", "ready"]] },
];

function recommend(answers: Answers): Result {
  if (answers.objective === "capability" || answers.who === "employer" || answers.who === "consultancy") return { title: "Workforce Capability Partnership", text: "Share the organisation, target team, capability priorities and intended outcome.", subject: "Workforce Capability Partnership Enquiry" };
  if (answers.objective === "learning") return { title: "Learning & CPD Service", text: "Share the topic, audience, format and development outcome.", subject: "Learning and CPD Enquiry" };
  if (answers.objective === "students" || answers.who === "academic") return { title: "Academic Partnership", text: "Share the institution, programme, learner group and collaboration goals.", subject: "Academic Partnership Enquiry" };
  if (answers.objective === "impact" || answers.who === "sponsor") return { title: "Awards, Scholarships & Impact", text: "Share the beneficiary group, proposed support and intended impact.", subject: "Awards Scholarships and Impact Enquiry" };
  return { title: "Professional Recognition", text: "Send your current role, experience, likely grade and a short statement.", subject: "Professional Recognition Enquiry" };
}

export default function ServicesRouteBuilder() {
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<Result | null>(null);
  const [incomplete, setIncomplete] = useState(false);
  const section = useManagedSection("route_builder", {
    eyebrow: "Service route builder",
    title: "Find the strongest starting route.",
    description: "Answer three questions to generate an indicative recommendation.",
    button_label: "Show recommended route",
    help_text: "This guide is indicative only.",
  });

  const submit = () => {
    if (!answers.who || !answers.objective || !answers.stage) { setIncomplete(true); setResult(null); return; }
    setIncomplete(false); setResult(recommend(answers));
  };

  return (
    <section id="route-builder" className="scroll-mt-16 bg-background-950 section-padding text-background-50">
      <div className="container-content grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
        <div className="reveal"><span className="eyebrow text-primary-300">{section.eyebrow}</span><h2 className="mt-4 font-heading text-3xl font-semibold leading-tight md:text-5xl">{section.title}</h2><p className="mt-5 text-base leading-relaxed text-background-300 md:text-lg">{section.description}</p>
          <div className="mt-9 grid gap-3 sm:grid-cols-2">{[["Clear direction", "Reduce uncertainty before sending a detailed enquiry."], ["Relevant context", "Know which information IPC needs."], ["Professional scope", "Keep recognition and partnership clearly separated."], ["Useful next step", "Move from interest to a structured conversation."]].map(([title, text]) => <div key={title} className="border border-background-50/10 bg-background-50/[0.045] p-4"><strong className="text-sm text-primary-300">{title}</strong><p className="mt-2 text-xs leading-relaxed text-background-400">{text}</p></div>)}</div>
        </div>
        <div className="reveal bg-background-50 p-6 text-background-950 md:p-9">
          <span className="eyebrow text-primary-700">Interactive guide</span>
          <div className="mt-5 space-y-6">
            {questions.map((question) => (
              <fieldset key={question.key} className="border-b border-background-200 pb-6"><legend className="mb-3 text-base font-semibold">{question.label}</legend><div className="flex flex-wrap gap-2">{question.options.map(([label, value]) => { const selected = answers[question.key] === value; return <button key={value} type="button" aria-pressed={selected} onClick={() => setAnswers((current) => ({ ...current, [question.key]: value }))} className={`border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${selected ? "border-background-950 bg-background-950 text-background-50" : "border-background-300 bg-background-50 hover:border-primary-500"}`}>{label}</button>; })}</div></fieldset>
            ))}
          </div>
          <button type="button" onClick={submit} className="btn-primary mt-1">{section.button_label}</button>
          <p className="mt-3 text-xs text-foreground-500">{section.help_text}</p>
          <div aria-live="polite">
            {incomplete && <div className="mt-6 border-l-2 border-primary-500 bg-background-100 p-5"><h3 className="font-semibold">Complete all three questions</h3><p className="mt-1 text-sm text-foreground-600">Choose one answer in each section.</p></div>}
            {result && <div className="mt-6 border-l-2 border-primary-500 bg-background-100 p-5"><h3 className="font-semibold">{result.title}</h3><p className="mt-2 text-sm text-foreground-600">{result.text}</p><a href={enquiryHref(result.subject)} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-700">Start this enquiry<i className="ri-arrow-right-line" aria-hidden="true" /></a></div>}
          </div>
        </div>
      </div>
    </section>
  );
}
