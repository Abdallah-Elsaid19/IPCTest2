import SectionHeader from "@/components/base/SectionHeader";
import type { AwardSectionIntro, AwardTimelineStep } from "../types";

export default function AwardsTimeline({
  content,
  steps,
  isLoading,
  error,
}: {
  content: AwardSectionIntro;
  steps: AwardTimelineStep[];
  isLoading: boolean;
  error: string;
}) {
  if (content.is_active === false) return null;

  return (
    <section id="nominate" className="scroll-mt-20 bg-background-50 section-padding">
      <div className="container-content">
        <div className="reveal mx-auto max-w-4xl">
          <SectionHeader
            eyebrow={content.eyebrow}
            title={content.title}
            subtitle={content.description}
            centered
          />
        </div>

        <div className="mt-12 grid gap-8 md:mt-16 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            {isLoading && (
              <div className="flex items-center justify-center gap-3 py-16 text-foreground-600" role="status">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-background-300 border-t-primary-600" aria-hidden="true" />
                Loading nomination process…
              </div>
            )}
            {error && (
              <div className="border border-red-200 bg-red-50 px-6 py-8 text-center text-red-800" role="alert">
                {error}
              </div>
            )}
            {!isLoading && !error && (
              <ol className="grid border-l border-t border-background-300 sm:grid-cols-2">
                {steps.map((step) => (
                  <li
                    key={step.phase}
                    className="min-h-56 border-b border-r border-background-300 bg-background-100 p-6 md:p-7"
                  >
                    <span className="font-mono text-xs font-bold tracking-[0.18em] text-primary-700">
                      {step.period}
                    </span>
                    <h3 className="mt-7 font-heading text-xl font-semibold text-background-950">
                      {step.phase}
                    </h3>
                    <p className="mt-4 text-sm leading-[1.75] text-foreground-600">
                      {step.description}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {content.checklist && content.checklist.length > 0 && (
            <aside className="h-fit border border-background-800 bg-background-950 p-7 text-background-50 lg:sticky lg:top-24 md:p-9">
              <span className="eyebrow text-primary-400">Entry checklist</span>
              <h3 className="mt-4 font-heading text-2xl font-semibold">
                {content.checklist_title}
              </h3>
              <ul className="mt-7 space-y-3">
                {content.checklist.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-background-300">
                    <i className="ri-check-line mt-0.5 shrink-0 text-primary-400" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={content.cta_url || "#awards-interest"}
                className="btn-primary mt-8 w-full"
              >
                {content.cta_label || "Nominate by Email"}
              </a>
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}
