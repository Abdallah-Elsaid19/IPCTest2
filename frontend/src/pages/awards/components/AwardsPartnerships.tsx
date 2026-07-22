import type { AwardPartnership, AwardSectionIntro } from "../types";

export default function AwardsPartnerships({ content, partnerships }: { content: AwardSectionIntro; partnerships: AwardPartnership[] }) {
  if (content.is_active === false) return null;
  return (
    <section id="awards-partnerships" className="scroll-mt-20 bg-background-950 section-padding text-background-50">
      <div className="container-content">
        <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-end"><div className="reveal"><span className="eyebrow mb-4 block text-primary-400">{content.eyebrow}</span><h2 className="font-heading text-4xl font-semibold leading-tight md:text-5xl">{content.title}</h2></div><p className="max-w-2xl text-base leading-relaxed text-background-300 reveal">{content.description}</p></div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">{partnerships.map((item, index) => <article key={item.title} className={`reveal reveal-delay-${index + 1} flex min-h-[25rem] flex-col border border-background-800 border-t-2 border-t-primary-500 bg-background-900 p-7`}><h3 className="font-heading text-xl font-semibold">{item.title}</h3><ul className="mt-7 space-y-3 text-sm text-background-300">{item.items.map((benefit) => <li key={benefit} className="flex gap-3"><i className="ri-check-line text-primary-400" />{benefit}</li>)}</ul><a href={item.cta_url} className="mt-auto pt-8 text-sm font-bold text-primary-300">{item.cta_label} →</a></article>)}</div>
        <p className="mt-7 border-l-2 border-primary-500 px-5 py-3 text-xs leading-relaxed text-background-400">{content.disclaimer}</p>
      </div>
    </section>
  );
}
