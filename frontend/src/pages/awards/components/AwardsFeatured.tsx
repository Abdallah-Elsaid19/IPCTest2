import SectionHeader from "@/components/base/SectionHeader";
import type { AwardProgramme } from "@/features/awards/types";
import type { AwardSectionIntro } from "../types";

export default function AwardsFeatured({ content, programmes, error, onRetry }: { content: AwardSectionIntro; programmes: AwardProgramme[] | null; error: string; onRetry: () => void }) {
  if (content.is_active === false) return null;

  return (
    <section id="featured" className="bg-background-100 section-padding">
      <div className="container-content">
        <div className="reveal"><SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} centered /></div>
        <div className="mt-12 md:mt-16">
          <div className="flex flex-col items-start gap-8 lg:flex-row">
            <div className="shrink-0 reveal reveal-delay-1 lg:w-[35%]">
              <div className="sticky top-24 overflow-hidden"><img loading="lazy" decoding="async" src={content.image_url} alt={content.image_alt} className="h-auto w-full image-zoom" /></div>
            </div>
            <div className="grid flex-1 grid-cols-1 gap-5 lg:grid-cols-2">
              {programmes === null && [0, 1, 2, 3].map((item) => <div key={item} className="h-72 animate-pulse border border-background-200/70 bg-background-50" />)}
              {programmes?.map((award) => (
                <div key={award.id} className="border card-hover border-background-200/70 bg-background-50 p-6 transition-all duration-300 hover:border-primary-200 md:p-7">
                  <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-primary-500"><i className="ri-award-line text-lg text-background-950" /></div>
                    <div><span className="mb-2 inline-block rounded-full bg-primary-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary-600">{award.category_title}</span><h3 className="font-heading text-lg font-semibold leading-tight text-background-950">{award.title}</h3></div>
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-foreground-600">{award.description}</p>
                  <div className="border-t border-background-200 pt-4">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-foreground-500">Criteria</span>
                    <ul className="space-y-1.5">{award.criteria.map((criterion) => <li key={criterion} className="flex items-start gap-2 text-xs leading-relaxed text-foreground-600"><i className="ri-check-line mt-0.5 shrink-0 text-accent-600" />{criterion}</li>)}</ul>
                  </div>
                </div>
              ))}
              {programmes?.length === 0 && <div className="border border-background-200 bg-background-50 p-8 text-center text-sm text-foreground-600 lg:col-span-2"><p>{error || "No active award programmes are currently available."}</p>{error && <button type="button" onClick={onRetry} className="mt-4 border border-primary-500 px-5 py-2.5 text-xs font-bold text-primary-700 transition hover:bg-primary-50">Try again</button>}</div>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
