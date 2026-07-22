import type { AwardPageContent } from "../types";

export default function AwardsFinalCta({ content }: { content: AwardPageContent["final_cta"] }) {
  if (content.is_active === false) return null;
  const items = content.items.filter((item) => item.is_active !== false);
  return (
    <section className="bg-background-50 py-20 md:py-28">
      <div className="container-content text-center"><div className="mx-auto max-w-2xl reveal"><span className="eyebrow mb-4 block text-primary-600">{content.eyebrow}</span><h3 className="mb-4 font-heading text-2xl font-semibold text-background-950 md:text-3xl lg:text-4xl">{content.title}</h3><p className="mb-8 text-base leading-relaxed text-foreground-600 md:text-lg">{content.description}</p><a href={content.cta_url} className="btn-primary inline-flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600"><i className="ri-mail-line text-sm text-background-50" /></span>{content.cta_label}</a><div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-4 text-left sm:grid-cols-3">{items.map((item, index) => <div key={item.title} className={`bg-background-100 p-4 reveal reveal-delay-${index + 1}`}><span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-accent-700">{item.title}</span><p className="text-xs text-foreground-500">{item.description}</p></div>)}</div></div></div>
    </section>
  );
}
