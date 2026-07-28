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
  const [activeAwardIndex, setActiveAwardIndex] = useState(0);

  useEffect(() => {
    if (grouped.length > 0 && !grouped.some(([family]) => family === activeFamily)) {
      setActiveFamily(grouped[0][0]);
    }
  }, [activeFamily, grouped]);

  const activeProgrammes = grouped.find(([family]) => family === activeFamily)?.[1] || [];
  const activeAward = activeProgrammes[activeAwardIndex] ?? activeProgrammes[0];
  const activeFamilyTitle = activeProgrammes[0]?.category_title || "Award family";
  const quarterlyItems = (content.quarterly_items || []).filter(
    (item) => item.is_active !== false,
  );

  useEffect(() => {
    if (activeAwardIndex >= activeProgrammes.length) {
      setActiveAwardIndex(0);
    }
  }, [activeAwardIndex, activeProgrammes.length]);

  if (content.is_active === false) return null;

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
                      onClick={() => {
                        setActiveFamily(family);
                        setActiveAwardIndex(0);
                      }}
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

                {activeAward && (
                  <div className="grid overflow-hidden border border-background-300 bg-background-50 lg:grid-cols-[.82fr_1.18fr]">
                    <div
                      role="tablist"
                      aria-label={`${activeFamilyTitle} awards`}
                      className="border-b border-background-300 lg:border-b-0 lg:border-r"
                    >
                      {activeProgrammes.map((award, index) => {
                        const selected = index === activeAwardIndex;
                        return (
                          <button
                            key={award.id}
                            type="button"
                            role="tab"
                            aria-selected={selected}
                            aria-controls="selected-award-panel"
                            onClick={() => setActiveAwardIndex(index)}
                            onPointerEnter={(event) => {
                              if (event.pointerType === "mouse") {
                                setActiveAwardIndex(index);
                              }
                            }}
                            className={`group flex min-h-24 w-full touch-manipulation items-center gap-4 border-b border-background-300 p-5 text-left transition-colors last:border-b-0 ${
                              selected
                                ? "bg-background-950 text-background-50"
                                : "bg-background-50 text-background-950 hover:bg-background-100"
                            }`}
                          >
                            <span
                              className={`font-mono text-[10px] font-bold tracking-[0.18em] ${
                                selected ? "text-primary-400" : "text-primary-700"
                              }`}
                            >
                              {activeFamily.charAt(0).toUpperCase()}
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <i
                              className={`ri-award-line text-xl ${
                                selected ? "text-primary-400" : "text-primary-700"
                              }`}
                              aria-hidden="true"
                            />
                            <strong className="flex-1 font-heading text-base leading-tight">
                              {award.title}
                            </strong>
                            <i className="ri-arrow-right-line text-lg" aria-hidden="true" />
                          </button>
                        );
                      })}
                    </div>

                    <article
                      id="selected-award-panel"
                      role="tabpanel"
                      key={activeAward.id}
                      className="relative flex min-h-[520px] flex-col justify-between overflow-hidden bg-background-950 p-8 text-background-50 md:p-12"
                    >
                      <span
                        className="absolute -right-14 -top-16 font-heading text-[240px] font-bold leading-none text-background-50/[0.025]"
                        aria-hidden="true"
                      >
                        {activeFamily.charAt(0).toUpperCase()}
                        {String(activeAwardIndex + 1).padStart(2, "0")}
                      </span>

                      <div className="relative">
                        <div className="flex items-center justify-between gap-5">
                          <span className="eyebrow text-primary-400">Selected award</span>
                          <i className="ri-award-line text-4xl text-primary-400" aria-hidden="true" />
                        </div>
                        <h4 className="mt-12 max-w-2xl font-heading text-4xl font-semibold leading-tight md:text-5xl">
                          {activeAward.title}
                        </h4>
                        <p className="mt-7 max-w-2xl text-lg leading-[1.8] text-background-300">
                          {activeAward.description}
                        </p>
                      </div>

                      <div className="relative mt-12 border-t border-background-50/15 pt-7">
                        {activeAward.criteria.length > 0 && (
                          <p className="max-w-2xl text-sm leading-relaxed text-background-300">
                            {activeAward.criteria[0]}
                          </p>
                        )}
                        <div className="mt-7 flex flex-wrap items-center justify-between gap-5">
                          <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-background-500">
                            {activeFamily.charAt(0).toUpperCase()}
                            {String(activeAwardIndex + 1).padStart(2, "0")}
                            {" · "}
                            {activeFamilyTitle}
                          </span>
                          <a href="#nominate" className="btn-primary">
                            Nominate this award
                            <i className="ri-arrow-right-line" aria-hidden="true" />
                          </a>
                        </div>
                      </div>
                    </article>
                  </div>
                )}
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
