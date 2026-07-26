import { useEffect, useMemo, useState } from "react";

import SectionHeader from "@/components/base/SectionHeader";
import type { AwardProgramme } from "@/features/awards/types";
import type { AwardSectionIntro } from "../types";

const familyOrder = ["academic", "commercial", "professional", "special"];

export default function AwardsFeatured({
  content,
  programmes,
  error,
  onRetry,
}: {
  content: AwardSectionIntro;
  programmes: AwardProgramme[] | null;
  error: string;
  onRetry: () => void;
}) {
  const grouped = useMemo(() => {
    const groups = new Map<string, AwardProgramme[]>();
    (programmes || []).forEach((programme) => {
      const family = programme.category;
      groups.set(family, [...(groups.get(family) || []), programme]);
    });
    return [...groups.entries()].sort(([left], [right]) => {
      const leftIndex = familyOrder.indexOf(left);
      const rightIndex = familyOrder.indexOf(right);
      return (leftIndex < 0 ? 99 : leftIndex) - (rightIndex < 0 ? 99 : rightIndex);
    });
  }, [programmes]);
  const [activeFamily, setActiveFamily] = useState("academic");

  useEffect(() => {
    if (grouped.length > 0 && !grouped.some(([family]) => family === activeFamily)) {
      setActiveFamily(grouped[0][0]);
    }
  }, [activeFamily, grouped]);

  if (content.is_active === false) return null;

  const activeProgrammes = grouped.find(([family]) => family === activeFamily)?.[1] || [];
  const activeFamilyTitle = activeProgrammes[0]?.category_title || "Award family";
  const quarterlyItems = (content.quarterly_items || []).filter(
    (item) => item.is_active !== false,
  );

  return (
    <>
      <section id="award-categories" className="scroll-mt-20 bg-background-50 section-padding">
        <div className="container-content">
          <div className="reveal mx-auto max-w-4xl">
            <SectionHeader
              eyebrow={content.eyebrow}
              title={content.title}
              subtitle={content.description}
              centered
            />
          </div>

          {programmes === null && (
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="h-72 animate-pulse border border-background-300 bg-background-100" />
              ))}
            </div>
          )}

          {programmes !== null && grouped.length > 0 && (
            <div className="mt-12 md:mt-16">
              <div
                className="grid border-l border-t border-background-300 sm:grid-cols-2 lg:grid-cols-4"
                role="tablist"
                aria-label="Award families"
              >
                {grouped.map(([family, familyProgrammes], index) => {
                  const selected = family === activeFamily;
                  return (
                    <button
                      key={family}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      aria-controls="award-family-panel"
                      onClick={() => setActiveFamily(family)}
                      className={`min-h-24 border-b border-r border-background-300 p-5 text-left transition-colors ${
                        selected
                          ? "bg-background-950 text-background-50"
                          : "bg-background-100 text-background-950 hover:bg-background-200"
                      }`}
                    >
                      <span className={`font-mono text-[10px] font-bold tracking-[0.18em] ${
                        selected ? "text-primary-400" : "text-primary-700"
                      }`}>
                        FAMILY 0{index + 1} · {familyProgrammes.length} AWARDS
                      </span>
                      <strong className="mt-2 block text-sm leading-tight">
                        {familyProgrammes[0].category_title}
                      </strong>
                    </button>
                  );
                })}
              </div>

              <div id="award-family-panel" role="tabpanel" className="mt-10">
                <div className="mb-8 flex items-end justify-between gap-6">
                  <div>
                    <span className="eyebrow text-primary-700">Selected family</span>
                    <h3 className="mt-2 font-heading text-3xl font-semibold text-background-950">
                      {activeFamilyTitle}
                    </h3>
                  </div>
                  <span className="hidden font-mono text-xs font-bold text-foreground-500 sm:block">
                    {String(activeProgrammes.length).padStart(2, "0")} ACTIVE ROUTES
                  </span>
                </div>

                <div className="grid border-l border-t border-background-300 md:grid-cols-2 xl:grid-cols-3">
                  {activeProgrammes.map((award, index) => (
                    <article
                      key={award.id}
                      className="group flex min-h-72 flex-col border-b border-r border-background-300 bg-background-50 p-6 transition-colors hover:bg-background-100 md:p-7"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-mono text-xs font-bold tracking-[0.18em] text-primary-700">
                          {activeFamily.charAt(0).toUpperCase()}
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <i className="ri-award-line text-xl text-primary-600" aria-hidden="true" />
                      </div>
                      <h4 className="mt-7 font-heading text-xl font-semibold leading-tight text-background-950">
                        {award.title}
                      </h4>
                      <p className="mt-4 text-sm leading-[1.75] text-foreground-600">
                        {award.description}
                      </p>
                      {award.criteria.length > 0 && (
                        <div className="mt-auto min-h-20 border-t border-background-300 pt-4">
                          <p className="text-xs font-medium leading-relaxed text-foreground-600">
                            {award.criteria[0]}
                          </p>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            </div>
          )}

          {programmes?.length === 0 && (
            <div className="mt-12 border border-background-300 bg-background-100 p-8 text-center text-sm text-foreground-600">
              <p>{error || "No active award programmes are currently available."}</p>
              {error && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-4 border border-primary-500 px-5 py-2.5 text-xs font-bold text-primary-700 transition hover:bg-primary-50"
                >
                  Try again
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {quarterlyItems.length > 0 && (
        <section className="bg-accent-900 section-padding text-background-50">
          <div className="container-content">
            <div className="reveal mx-auto max-w-4xl text-center">
              <span className="eyebrow text-primary-300">
                {content.quarterly_eyebrow}
              </span>
              <h2 className="mt-4 font-heading text-3xl font-semibold leading-tight md:text-5xl">
                {content.quarterly_title}
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-background-200 md:text-lg">
                {content.quarterly_description}
              </p>
              {content.quarterly_supporting_copy && (
                <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-background-300">
                  {content.quarterly_supporting_copy}
                </p>
              )}
            </div>
            <div className="mt-12 grid border-l border-t border-white/20 sm:grid-cols-2 lg:grid-cols-4">
              {quarterlyItems.map((item) => (
                <article key={item.title} className="min-h-48 border-b border-r border-white/20 bg-white/5 p-6">
                  <h3 className="font-heading text-xl font-semibold text-primary-300">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-background-200">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
