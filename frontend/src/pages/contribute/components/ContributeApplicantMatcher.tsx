import { useState } from "react";
import { Link } from "react-router-dom";
import SectionHeader from "@/components/base/SectionHeader";
import {
  isManagedItemActive,
  useManagedSection,
} from "@/components/content/ManagedContentProvider";
import { informationSessionPath } from "./data";

const benefits = [
  ["Less duplication", "Provide core information once rather than completing separate forms for every pathway."],
  ["Better matching", "Consider career stage, access barriers, professional objectives and location."],
  ["Clear evidence", "Applicants understand which statement, documents or endorsements may be requested."],
  ["Respectful outcomes", "Receive a relevant route, request for information or honest development guidance."],
];

const questions = [
  { key: "stage", label: "What is your current position?", options: [["Student or apprentice","student"],["Career changer or returner","career"],["Working professional","professional"],["Researcher or academic","researcher"],["Employer or team","team"]] },
  { key: "support", label: "What support are you looking for?", options: [["Access to the profession","access"],["Learning or mentoring","learning"],["Regional opportunity","regional"],["Research support","research"],["Award or visibility","recognition"]] },
  { key: "outcome", label: "What outcome matters most?", options: [["Employment or transition","employment"],["Technical capability","capability"],["Professional network","network"],["Research or publication","evidence"]] },
  { key: "ready", label: "Are you ready to register interest?", options: [["Yes","yes"],["I need guidance first","guidance"]] },
] as const;

type Answers = Partial<Record<(typeof questions)[number]["key"], string>>;

function getResult(answers: Answers) {
  if (answers.stage === "team") return ["Employer-funded development", "This route may be suitable for employer-supported membership, team capability, learning and professional progression."];
  if (answers.support === "recognition") return ["Awards & Emerging Talent", "This route may be suitable for student, research, emerging-professional or specialist achievement recognition."];
  if (answers.stage === "researcher" || answers.support === "research" || answers.outcome === "evidence") return ["Applied Research & Innovation", "This route may be suitable for applied research, practitioner access, publications and evidence-led knowledge sharing."];
  if (answers.stage === "student" || answers.stage === "career" || answers.support === "access" || answers.outcome === "employment") return ["Future Talent Access", "This route may be suitable for scholarships, bursaries, mentoring, events and supported entry into the professional community."];
  return ["Professional Learning & Regional Skills", "This route may be suitable for Master Classes, mentoring, regional activity and professional-development access."];
}

export default function ContributeApplicantMatcher() {
  const [answers,setAnswers]=useState<Answers>({});
  const complete=questions.every((question)=>answers[question.key]);
  const [title,copy]=getResult(answers);
  const section=useManagedSection("applicant_matcher",{
    eyebrow:"One clear application journey",
    title:"Apply once. Discover the routes that fit.",
    description:"A unified eligibility journey is simpler than asking applicants to understand every funding programme before they begin.",
    notice:"This matcher is indicative only. Final eligibility depends on published criteria, available funding and IPC review.",
    items:benefits.map(([title,description])=>({title,description})),
  });
  return <section id="applicant-route" className="scroll-mt-20 bg-background-50 section-padding"><div className="container-content"><SectionHeader eyebrow={section.eyebrow} title={section.title} subtitle={section.description} centered/><p className="mx-auto mt-6 max-w-3xl border-l-2 border-primary-500 pl-4 text-sm text-foreground-600">{section.notice}</p><div className="mt-12 grid gap-10 lg:grid-cols-[.75fr_1.25fr]"><div className="grid gap-4 sm:grid-cols-2">{section.items.filter(isManagedItemActive).map(({title:heading,description:text},index)=><article key={heading} className="border border-background-300 bg-background-100 p-6"><span className="font-mono text-[10px] font-bold text-primary-700">0{index+1}</span><h3 className="mt-5 text-lg font-semibold">{heading}</h3><p className="mt-3 text-sm leading-relaxed text-foreground-600">{text}</p></article>)}</div><div className="border border-background-300 bg-background-100 p-6 md:p-8"><span className="eyebrow text-primary-700">Funding route matcher</span><h3 className="mt-3 text-2xl font-semibold">Which opportunity should you explore?</h3><p className="mt-2 text-sm text-foreground-600">Answer four questions to see an indicative starting route.</p><div className="mt-7 space-y-6">{questions.map((question)=><fieldset key={question.key}><legend className="mb-3 font-semibold">{question.label}</legend><div className="flex flex-wrap gap-2">{question.options.map(([label,value])=><button key={value} type="button" onClick={()=>setAnswers((current)=>({...current,[question.key]:value}))} aria-pressed={answers[question.key]===value} className={`border px-4 py-3 text-left text-sm transition-colors ${answers[question.key]===value?"border-background-950 bg-background-950 text-background-50":"border-background-300 bg-background-50 hover:border-primary-500"}`}>{label}</button>)}</div></fieldset>)}</div>{complete&&<div className="mt-8 bg-background-950 p-6 text-background-50"><span className="font-mono text-[10px] uppercase tracking-widest text-primary-400">Indicative route</span><h4 className="mt-3 text-xl font-semibold text-primary-300">{title}</h4><p className="mt-3 text-sm leading-relaxed text-background-300">{copy}</p><Link to={informationSessionPath} state={{enquiry:title}} className="btn-primary mt-6">Register interest</Link></div>}</div></div></div></section>;
}
