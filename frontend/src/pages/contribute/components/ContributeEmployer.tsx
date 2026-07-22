import { Link } from "react-router-dom";
import { informationSessionPath } from "./data";

const toolkit = [
  ["Manager approval letter","A concise case explaining professional value, outcomes and requested support."],
  ["Organisational benefits summary","Capability, retention, succession planning, tender credibility and reporting quality."],
  ["Learning and CPD plan","How Master Classes, mentoring, practice and reflection connect to development."],
  ["Recognition pathway","How an employee can move from affiliation to applied or senior standing."],
  ["Purchase and invoicing guidance","A future operational section for approved payment and corporate arrangements."],
];

export default function ContributeEmployer(){return <section className="bg-background-100 section-padding"><div className="container-content grid gap-12 lg:grid-cols-12"><div className="reveal lg:col-span-5"><span className="eyebrow text-primary-700">Employer-funded development</span><h2 className="mt-5 font-heading text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[.98] tracking-[-.04em]">Help professionals make the business case internally.</h2><p className="mt-7 max-w-xl leading-[1.8] text-foreground-600">Not every funding route requires an external donor. Employers can support membership, learning, mentoring and progression where there is a clear organisational benefit.</p><Link to={informationSessionPath} state={{enquiry:"Employer-funded development toolkit"}} className="btn-primary mt-8">Request employer toolkit</Link></div><ol className="reveal border-t border-background-300 lg:col-span-7">{toolkit.map(([title,copy],index)=><li key={title} className="grid grid-cols-[3rem_1fr] gap-5 border-b border-background-300 py-6"><span className="font-mono text-xs font-bold text-primary-700">0{index+1}</span><div><h3 className="text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-foreground-600">{copy}</p></div></li>)}</ol></div></section>}
