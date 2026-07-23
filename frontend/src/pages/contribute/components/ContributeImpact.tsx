import { Link } from "react-router-dom";
import SectionHeader from "@/components/base/SectionHeader";
import { informationSessionPath } from "./data";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const outcomes=[
  ["Access created","What barrier was reduced and what professional opportunity became available?","ri-door-open-line"],
  ["Participation","Which learning, mentoring, event, club, award or research activity was completed?","ri-group-line"],
  ["Capability","What knowledge, confidence, evidence or professional connection was developed?","ri-line-chart-line"],
  ["Progression","What realistic next step followed—employment, further study, mentoring, membership or contribution?","ri-arrow-up-circle-line"],
  ["Public value","How did the activity support social mobility, regional skills, sustainability or responsible delivery?","ri-community-line"],
  ["Responsible reporting","How will activity and outcomes be reported accurately, proportionately and with consent?","ri-file-chart-line"],
];

export default function ContributeImpact(){const section=useManagedSection("impact",{eyebrow:"From funding to professional impact",title:"Make every contribution purposeful, visible and accountable.",description:"The strongest funding route begins with a clear audience and ends with a credible professional outcome—not a vague promise.",items:outcomes.map(([title,description,icon])=>({title,description,icon}))});return <section id="impact" className="scroll-mt-16 bg-background-50 section-padding"><div className="container-content"><div className="reveal grid gap-8 lg:grid-cols-[1fr_.55fr] lg:items-end"><SectionHeader eyebrow={section.eyebrow} title={section.title} subtitle={section.description}/><div className="lg:text-right"><Link to={informationSessionPath} className="btn-ghost">Design an impact route<i className="ri-arrow-right-line" /></Link></div></div><div className="mt-12 grid border-l border-t border-background-300 sm:grid-cols-2 lg:grid-cols-3">{section.items.filter(isManagedItemActive).map(({title,description,icon},index)=><article key={title} className="group min-h-64 border-b border-r border-background-300 p-6 transition-colors hover:bg-background-100 md:p-8"><div className="flex items-center justify-between"><span className="font-mono text-[10px] font-bold tracking-widest text-primary-600">0{index+1}</span><i className={`${icon} text-xl text-primary-600`} /></div><h3 className="mt-10 text-xl font-semibold text-background-950">{title}</h3><p className="mt-4 text-sm leading-[1.75] text-foreground-600">{description}</p></article>)}</div></div></section>}
