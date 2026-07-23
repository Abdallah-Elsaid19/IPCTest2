import { Link } from "react-router-dom";
import SectionHeader from "@/components/base/SectionHeader";
import { informationSessionPath } from "./data";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const programmeInfo = [
  ["Funding values", "To be announced"],
  ["Next application window", "Register for updates"],
  ["Current status", "Programme design stage"],
];

const programmes = [
  {
    number: "01", status: "Register interest", title: "Future Talent Access",
    description: "Support students, apprentices, graduates, returners and career changers through funded access to professional learning and community.",
    details: [["May support", "Scholarships, bursaries, Affiliate access, mentoring, events and career workshops."], ["Best for", "People entering or repositioning into project controls."], ["Outcome", "Confidence, employability, professional identity and progression."]],
    quote: "Potential should not be limited by access.", cta: "Check your route",
  },
  {
    number: "02", status: "Register interest", title: "Professional Learning & Regional Skills",
    description: "Fund Master Classes, mentoring circles, technical talks, regional clubs, employer forums and selected professional-development access.",
    details: [["May support", "Funded places, speakers, venues, mentoring, accessibility and local activity."], ["Best for", "Practitioners, teams, regional communities and emerging professionals."], ["Outcome", "Applied capability, CPD, connection and stronger local talent networks."]],
    quote: "Build capability where people live and deliver.", cta: "Check your route",
  },
  {
    number: "03", status: "Call forthcoming", title: "Applied Research & Innovation",
    description: "Support research and practice-led insight that advances project-controls evidence, methods and decision quality.",
    details: [["May support", "Research, datasets, practitioner access, publications and dissemination."], ["Best for", "Researchers, academics, practitioners and organisational collaborators."], ["Outcome", "Applied knowledge, professional evidence and better controls practice."]],
    quote: "Fund the evidence that moves the profession forward.", cta: "Explore research",
  },
];

export default function ContributeProgrammes() {
  const section=useManagedSection("programmes",{eyebrow:"Core funding programmes",title:"Three flagship routes first. Additional pathways when the evidence is ready.",description:"The launch proposition prioritises future talent, professional learning and applied research. Every live route should publish its value, places, criteria and dates.",information_title:"Funding information centre",information_description:"Replace placeholders only after formal programme approval.",information:programmeInfo.map(([label,value])=>({label,value})),items:programmes.map((programme)=>({...programme,may_support:programme.details[0][1],best_for:programme.details[1][1],outcome:programme.details[2][1],cta_label:programme.cta,cta_url:informationSessionPath})),notice:"No funding amount or deadline is claimed until formally approved. The catalogue supports up to 40 scholarship or bursary places per intake, subject to eligibility and funding."});
  return <section className="bg-background-100 section-padding"><div className="container-content">
    <div className="reveal grid gap-8 lg:grid-cols-[1fr_.65fr] lg:items-end"><SectionHeader eyebrow={section.eyebrow} title={section.title} subtitle={section.description}/><aside className="border border-background-300 bg-background-50 p-6"><h3 className="text-lg font-semibold">{section.information_title}</h3><p className="mt-2 text-sm text-foreground-600">{section.information_description}</p><dl className="mt-5 divide-y divide-background-300">{section.information.filter(isManagedItemActive).map(({label,value})=><div key={label} className="flex justify-between gap-5 py-3 text-sm"><dt className="font-semibold">{label}</dt><dd className="text-right text-foreground-600">{value}</dd></div>)}</dl></aside></div>
    <div className="mt-12 grid gap-5 lg:grid-cols-3">{section.items.filter(isManagedItemActive).map((programme)=><article key={programme.title} className="reveal flex min-h-[38rem] flex-col border border-background-300 border-t-2 border-t-primary-500 bg-background-50 p-7"><div className="flex items-center justify-between gap-4"><span className="font-mono text-xs font-bold text-primary-700">Flagship programme {programme.number}</span><span className="bg-primary-100 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-primary-800">{programme.status}</span></div><h3 className="mt-8 text-2xl font-semibold">{programme.title}</h3><p className="mt-4 text-sm leading-[1.75] text-foreground-600">{programme.description}</p><dl className="mt-7 divide-y divide-background-300 border-y border-background-300">{[["May support",programme.may_support],["Best for",programme.best_for],["Outcome",programme.outcome]].map(([label,value])=><div key={label} className="py-4"><dt className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary-700">{label}</dt><dd className="mt-2 text-sm leading-relaxed text-foreground-600">{value}</dd></div>)}</dl><blockquote className="mt-6 border-l-2 border-primary-500 pl-4 font-heading text-lg italic">{programme.quote}</blockquote><Link to={programme.cta_url} state={{enquiry:programme.title}} className="mt-auto pt-8 text-sm font-semibold text-primary-800">{programme.cta_label} <i className="ri-arrow-right-line" /></Link></article>)}</div>
    <p className="mt-6 border-l-2 border-primary-500 pl-4 text-sm leading-relaxed text-foreground-600">{section.notice}</p>
  </div></section>;
}
