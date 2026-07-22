import SectionHeader from "@/components/base/SectionHeader";
import type { AwardSectionIntro, AwardTimelineStep } from "../types";

export default function AwardsTimeline({ content, steps, isLoading, error }: { content: AwardSectionIntro; steps: AwardTimelineStep[]; isLoading: boolean; error: string }) {
  if (content.is_active === false) return null;

  return (
    <section className="relative overflow-hidden bg-background-950 section-padding">
      <div className="absolute inset-0 opacity-40"><img loading="lazy" decoding="async" src={content.image_url} alt={content.image_alt} className="h-full w-full object-cover" /></div>
      <div className="absolute inset-0 bg-background-950/70" aria-hidden="true" />
      <div className="container-content relative z-10">
        <div className="reveal"><SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} light centered className="[&_.eyebrow]:text-background-50" /></div>
        <div className="mx-auto mt-12 max-w-4xl md:mt-16">
          {isLoading && <div className="flex items-center justify-center gap-3 py-16 text-background-300" role="status"><span className="h-6 w-6 animate-spin rounded-full border-2 border-background-700 border-t-primary-500" aria-hidden="true" />Loading nomination timeline…</div>}
          {error && <div className="border border-red-900 bg-red-950/50 px-6 py-8 text-center text-red-200" role="alert">{error}</div>}
          {!isLoading && !error && <div className="relative">
            <div className="absolute bottom-0 left-6 top-0 w-px bg-background-700 md:left-8" />
            {steps.map((step, index) => <div key={step.phase} className={`reveal reveal-delay-${index + 1} relative pb-10 pl-16 last:pb-0 md:pl-20`}><div className="absolute left-2 top-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary-500 bg-background-950 md:left-4"><div className="h-2.5 w-2.5 rounded-full bg-primary-500" /></div><div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3"><h4 className="font-heading text-lg font-semibold text-background-50 md:text-xl">{step.phase}</h4><span className="whitespace-nowrap rounded-full bg-primary-500/10 px-2.5 py-0.5 text-xs font-medium text-primary-400">{step.period}</span></div><p className="text-sm leading-relaxed text-background-400">{step.description}</p></div>)}
          </div>}
        </div>
      </div>
    </section>
  );
}
