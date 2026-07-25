import type { AwardContentCard, AwardSectionIntro } from "../types";

export default function AwardsIntegrity({ content, principles, isLoading, error }: { content: AwardSectionIntro; principles: AwardContentCard[]; isLoading: boolean; error: string }) {
  if (content.is_active === false) return null;
  return (
    <section className="relative overflow-hidden bg-background-100 section-padding">
      <div className="absolute inset-0 opacity-8"><img loading="lazy" decoding="async" src={content.image_url} alt={content.image_alt} className="h-full w-full object-cover" /></div>
      <div className="container-content relative z-10">
        <div className="mx-auto max-w-4xl reveal">
          <div className="border border-background-800 bg-background-950 p-8 text-center md:p-12">
            <span className="eyebrow mb-4 block text-primary-400">{content.eyebrow}</span>
            <h2 className="mb-6 font-heading text-3xl font-bold text-background-50 md:text-4xl">{content.title}</h2>
            <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-background-300 md:text-lg">{content.description}</p>
            <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
              {isLoading && <div className="col-span-full flex items-center justify-center gap-3 py-12 text-background-300" role="status"><span className="h-6 w-6 animate-spin rounded-full border-2 border-background-700 border-t-primary-500" aria-hidden="true" />Loading integrity principles…</div>}
              {error && <div className="col-span-full border border-red-900 bg-red-950/50 px-6 py-8 text-center text-red-200" role="alert">{error}</div>}
              {!isLoading && !error && principles.map((principle, index) => <div key={principle.title} className={`bg-background-900 p-5 card-hover reveal reveal-delay-${index + 1}`}><i className={`${principle.icon} mb-3 block text-xl text-primary-500`} /><h4 className="mb-2 font-heading text-base font-semibold text-background-50">{principle.title}</h4><p className="text-sm leading-relaxed text-background-400">{principle.description}</p></div>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
