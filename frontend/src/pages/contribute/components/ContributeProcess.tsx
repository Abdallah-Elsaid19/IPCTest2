import { Link } from "react-router-dom";
import SectionHeader from "@/components/base/SectionHeader";
import { informationSessionPath } from "./data";

const steps=[
  ["Define","Clarify the objective, beneficiary group, problem being addressed and intended professional outcome."],
  ["Design","Agree the route, activities, available places, responsibilities, visibility and delivery period."],
  ["Safeguard","Confirm privacy, independence, eligibility, conflicts, communications and reporting arrangements."],
  ["Deliver","Run the scholarship, learning, club, award, publication or research activity as agreed."],
  ["Report","Review participation, outputs, professional outcomes, lessons and future recommendations."],
];
export default function ContributeProcess(){return <section className="bg-background-100 section-padding"><div className="container-content"><div className="reveal"><SectionHeader eyebrow="Funding partnership process" title="From ambition to accountable professional impact." subtitle="A clear process protects the funder, the Institute and the people the programme is designed to support." centered/></div><ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">{steps.map(([title,copy],index)=><li key={title} className="reveal min-h-72 border border-background-300 border-t-2 border-t-primary-500 bg-background-50 p-6"><span className="font-mono text-xs font-bold text-primary-700">0{index+1}</span><h3 className="mt-10 text-xl font-semibold text-background-950">{title}</h3><p className="mt-4 text-sm leading-[1.75] text-foreground-600">{copy}</p></li>)}</ol><div className="mt-9 flex flex-wrap justify-center gap-3"><Link to={informationSessionPath} className="btn-primary">Start a funding enquiry</Link><a href="#routes" className="btn-ghost">Build route first</a></div></div></section>}
