import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const metrics = [
  { id: "places", value: "Reported", title: "Funded places awarded", description: "Published after an approved cycle." },
  { id: "learning", value: "Reported", title: "Learning or mentoring completions", description: "Reported after delivery." },
  { id: "research", value: "Reviewed", title: "Research outputs supported", description: "Subject to review and publication." },
  { id: "progression", value: "Consent-led", title: "Progression outcomes", description: "Reported proportionately and with consent." },
];
const assurance = [
  { id: "scope", label: "01 / SCOPE", title: "Clear purpose and boundaries", description: "Define what is funded, who benefits, what is excluded and what success should mean." },
  { id: "governance", label: "02 / GOVERNANCE", title: "Responsibilities and approvals", description: "Confirm decision routes, ownership, safeguarding, conflicts and communication responsibilities." },
  { id: "performance", label: "03 / PERFORMANCE", title: "Proportionate evidence", description: "Track delivery, participation, outputs and outcomes without unnecessary burden." },
  { id: "transparency", label: "04 / TRANSPARENCY", title: "Honest impact reporting", description: "Report what happened, what changed, what remains uncertain and what should improve next." },
];

export default function ContributeAssurance() {
  const section = useManagedSection("assurance", {
    eyebrow: "Accountability and assurance",
    title: "Fund impact with professional discipline.",
    description: "Funding should be governed with the same principles project-controls professionals apply to complex delivery: clarity, evidence, assurance and transparent reporting.",
    statistics: metrics,
    notice: "Impact figures are published only after verification and with a clearly stated reporting period.",
    items: assurance,
  });
  return (
    <section className="bg-background-950 section-padding text-background-50">
      <div className="container-content">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="reveal lg:col-span-5"><span className="eyebrow text-primary-400">{section.eyebrow}</span><h2 className="mt-5 font-heading text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[.98] tracking-[-.04em]">{section.title}</h2><p className="mt-8 max-w-xl leading-[1.8] text-background-300">{section.description}</p></div>
          <div className="reveal grid gap-4 sm:grid-cols-2 lg:col-span-7">{section.statistics.filter(isManagedItemActive).map((item) => <article key={item.id} className="border border-background-800 bg-background-900/70 p-6"><strong className="font-heading text-xl text-primary-400">{item.value}</strong><h3 className="mt-5 text-lg font-semibold">{item.title}</h3><p className="mt-2 text-sm text-background-400">{item.description}</p></article>)}</div>
        </div>
        <p className="mt-6 border-l-2 border-primary-500 pl-4 text-xs leading-relaxed text-background-400">{section.notice}</p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{section.items.filter(isManagedItemActive).map((item) => <article key={item.id} className="min-h-64 border border-background-800 bg-background-900/70 p-6"><span className="font-mono text-[10px] font-bold tracking-widest text-primary-400">{item.label}</span><h3 className="mt-9 text-xl font-semibold">{item.title}</h3><p className="mt-4 text-sm leading-[1.75] text-background-400">{item.description}</p></article>)}</div>
      </div>
    </section>
  );
}
