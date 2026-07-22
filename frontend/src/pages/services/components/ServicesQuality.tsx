import { Link } from "react-router-dom";

const standards = [
  ["Evidence-led", "Professional claims should be supported by appropriate evidence and judgement."],
  ["Independent", "Sponsorship must not influence recognition, judging or editorial decisions."],
  ["Proportionate", "Requirements should increase with accountability and influence."],
  ["Consent-based", "Partners do not receive automatic access to private member or learner data."],
  ["Future-facing", "AI, digital systems, sustainability and public value sit alongside core competence."],
];

export default function ServicesQuality() {
  return (
    <section className="bg-background-50 section-padding">
      <div className="container-content grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="reveal flex min-h-[400px] flex-col justify-between bg-accent-700 p-7 text-background-50 md:p-10"><div><span className="eyebrow text-primary-300">Quality and trust</span><h2 className="mt-4 font-heading text-3xl font-semibold leading-tight md:text-4xl">Services should create aspiration without exaggeration.</h2><p className="mt-5 text-sm leading-relaxed text-background-200 md:text-base">Every route should be clear, practical, evidence-led and capable of being explained to professionals, employers, clients and partners.</p></div><Link to="/information-session" className="btn-primary mt-8 w-fit">Discuss a service route</Link></div>
        <dl className="reveal grid gap-3">{standards.map(([title, text]) => <div key={title} className="grid gap-2 border border-background-200/80 bg-background-50 p-5 sm:grid-cols-[150px_1fr]"><dt className="text-xs font-bold uppercase tracking-wider text-primary-700">{title}</dt><dd className="text-sm leading-relaxed text-foreground-600">{text}</dd></div>)}</dl>
      </div>
    </section>
  );
}
