import SectionHeader from "@/components/base/SectionHeader";
import type { AwardContentCard, AwardSectionIntro } from "../types";

export default function AwardsIntegrity({
  content,
  principles,
  isLoading,
  error,
}: {
  content: AwardSectionIntro;
  principles: AwardContentCard[];
  isLoading: boolean;
  error: string;
}) {
  if (content.is_active === false) return null;
  const criteria = (content.criteria || []).filter(
    (item) => item.is_active !== false,
  );

  return (
    <>
      <section className="bg-background-100 section-padding">
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
            <div className="border border-background-300 bg-background-50 p-6 md:p-8">
              <h3 className="font-heading text-2xl font-semibold text-background-950">
                {content.criteria_title || "General assessment weighting"}
              </h3>
              <dl className="mt-8 space-y-6">
                {criteria.map((criterion) => (
                  <div key={criterion.title}>
                    <div className="flex items-center justify-between gap-4 text-sm font-semibold text-background-950">
                      <dt>{criterion.title}</dt>
                      <dd className="font-mono text-primary-700">{criterion.weight}%</dd>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden bg-background-200">
                      <span
                        className="block h-full bg-primary-500"
                        style={{ width: `${Math.max(0, Math.min(100, criterion.weight))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </dl>
            </div>

            {content.checklist && content.checklist.length > 0 && (
              <aside className="border border-background-800 bg-background-950 p-7 text-background-50 md:p-9">
                <span className="eyebrow text-primary-400">What judges look for</span>
                <h3 className="mt-4 font-heading text-2xl font-semibold leading-tight">
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
              </aside>
            )}
          </div>
        </div>
      </section>

      <section className="bg-background-950 section-padding text-background-50">
        <div className="container-content">
          <div className="reveal mx-auto max-w-4xl text-center">
            <span className="eyebrow text-primary-400">
              {content.governance_eyebrow || "Judging integrity"}
            </span>
            <h2 className="mt-4 font-heading text-3xl font-semibold leading-tight md:text-5xl">
              {content.governance_title || content.title}
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-background-300 md:text-lg">
              {content.governance_description || content.description}
            </p>
          </div>

          <div className="mt-12 grid border-l border-t border-background-700 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading && (
              <div className="col-span-full py-16 text-center text-background-300" role="status">
                Loading integrity principles…
              </div>
            )}
            {error && (
              <div className="col-span-full border border-red-900 bg-red-950/50 px-6 py-8 text-center text-red-200" role="alert">
                {error}
              </div>
            )}
            {!isLoading && !error && principles.map((principle, index) => (
              <article
                key={principle.title}
                className={`reveal reveal-delay-${index + 1} min-h-60 border-b border-r border-background-700 bg-background-900 p-7 transition-colors hover:bg-background-800`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-primary-400">
                    0{index + 1}
                  </span>
                  <i className={`${principle.icon} text-xl text-primary-400`} aria-hidden="true" />
                </div>
                <h3 className="mt-8 font-heading text-xl font-semibold">
                  {principle.title}
                </h3>
                <p className="mt-4 text-sm leading-[1.75] text-background-400">
                  {principle.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
