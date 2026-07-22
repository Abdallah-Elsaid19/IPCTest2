const safeguards = [
  ["Independent selection","Partners do not decide grades, scholarship recipients, award winners or editorial outcomes."],
  ["Published eligibility","Every live opportunity defines its audience, evidence, criteria, deadlines and decision process."],
  ["Conflicts management","Reviewers and decision-makers declare and manage relevant interests."],
  ["Privacy and consent","Applicants understand how their data, images and stories may be used."],
];

const standard = [
  ["Purpose","The objective and the professional or public-value problem being addressed."],
  ["Eligibility","Who can apply and any geographical, study, employment or membership conditions."],
  ["Value","Number of places, award amount or clearly defined non-financial support."],
  ["Timeline","Opening date, deadline, decision date and delivery period."],
  ["Evidence","Required statement, documents, endorsement, portfolio or proposal."],
  ["Assessment","Criteria, review approach, conflicts safeguards and decision communication."],
  ["Reporting","How participation, outcomes and impact will be measured and communicated."],
];

export default function ContributeGovernance(){return <section className="bg-background-50 section-padding"><div className="container-content"><div className="reveal max-w-5xl"><span className="eyebrow text-primary-700">Governance before promotion</span><h2 className="mt-5 font-heading text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[.98] tracking-[-.04em]">A professional institute earns funding trust through visible rules.</h2><p className="mt-7 max-w-3xl leading-[1.8] text-foreground-600">A route should not be marked open until its purpose, eligibility, value, timeline, evidence and decision process are complete.</p></div><div className="mt-12 grid border-l border-t border-background-300 sm:grid-cols-2 lg:grid-cols-4">{safeguards.map(([title,copy],index)=><article key={title} className="border-b border-r border-background-300 p-6"><span className="font-mono text-[10px] font-bold text-primary-700">0{index+1}</span><h3 className="mt-8 text-lg font-semibold">{title}</h3><p className="mt-3 text-sm leading-relaxed text-foreground-600">{copy}</p></article>)}</div><div className="mt-14 grid gap-8 lg:grid-cols-[.55fr_1.45fr]"><div><span className="eyebrow text-primary-700">Funding information standard</span><h3 className="mt-5 font-heading text-3xl font-semibold">What every live programme must publish</h3></div><dl className="border-t border-background-300">{standard.map(([term,definition])=><div key={term} className="grid gap-2 border-b border-background-300 py-5 md:grid-cols-[10rem_1fr]"><dt className="font-semibold text-primary-800">{term}</dt><dd className="text-sm leading-relaxed text-foreground-600">{definition}</dd></div>)}</dl></div></div></section>}
