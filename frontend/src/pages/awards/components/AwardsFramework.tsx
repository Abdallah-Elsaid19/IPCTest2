import SectionHeader from "@/components/base/SectionHeader";
import type { AwardCategory } from "@/features/awards/types";
import type { AwardSectionIntro } from "../types";

const familyVisuals = [
  "from-[#1c1d20] via-[#292a2e] to-[#3a3021]",
  "from-[#123f3a] via-[#174b44] to-[#2f5d50]",
  "from-[#5b1f2a] via-[#702a39] to-[#3b2028]",
  "from-[#171719] via-[#252528] to-[#40351f]",
];

export default function AwardsFramework({
  content,
  categories,
}: {
  content: AwardSectionIntro;
  categories: AwardCategory[] | null;
}) {
  if (content.is_active === false) return null;
  const programmeItems = (content.programme_items || []).filter(
    (item) => item.is_active !== false,
  );

  return (
    <section id="award-families" className="scroll-mt-20 bg-background-100 section-padding">
      <div className="container-content">
        <div className="reveal mx-auto max-w-4xl">
          <SectionHeader
            eyebrow={content.eyebrow}
            title={content.title}
            subtitle={content.description}
            centered
          />
        </div>

        {programmeItems.length > 0 && (
          <div className="reveal relative mt-12 grid border border-background-300 bg-background-50 md:mt-16 md:grid-cols-2">
            {programmeItems.map((item, index) => (
              <div
                key={item.title}
                className={`min-h-72 p-7 md:p-10 ${
                  index === 0
                    ? "bg-background-950 text-background-50"
                    : "text-background-950"
                }`}
              >
                <span className={`eyebrow ${index === 0 ? "text-primary-400" : "text-primary-700"}`}>
                  {item.eyebrow}
                </span>
                <h3 className="mt-5 font-heading text-2xl font-semibold leading-tight">
                  {item.title}
                </h3>
                <p className={`mt-5 text-sm leading-[1.8] ${
                  index === 0 ? "text-background-300" : "text-foreground-600"
                }`}>
                  {item.description}
                </p>
              </div>
            ))}
            <div
              className="absolute left-1/2 top-1/2 hidden h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center border-4 border-background-100 bg-primary-500 font-heading text-2xl text-background-950 md:flex"
              aria-hidden="true"
            >
              →
            </div>
          </div>
        )}

        <div className="reveal mx-auto mt-20 max-w-4xl text-center">
          <span className="eyebrow text-primary-700">
            {content.families_eyebrow || "Award families"}
          </span>
          <h2 className="mt-4 font-heading text-3xl font-semibold leading-tight text-background-950 md:text-5xl">
            {content.families_title || content.title}
          </h2>
          {content.families_description && (
            <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-foreground-600 md:text-lg">
              {content.families_description}
            </p>
          )}
        </div>

        <div className="mt-12 grid grid-cols-1 border-l border-t border-background-300 sm:grid-cols-2 lg:grid-cols-4">
          {categories === null && [0, 1, 2, 3].map((item) => (
            <div key={item} className="h-[420px] animate-pulse border-b border-r border-background-300 bg-background-50" />
          ))}
          {categories?.map((category, index) => (
            <article
              key={category.id}
              className="group flex min-h-[27rem] flex-col border-b border-r border-background-300 bg-background-50 transition-colors hover:bg-background-950"
            >
              <div className={`relative h-40 overflow-hidden bg-gradient-to-br ${familyVisuals[index % familyVisuals.length]}`}>
                <span className="absolute -right-10 -top-14 h-40 w-40 rounded-full border border-primary-300/20 transition-transform duration-700 group-hover:scale-110" aria-hidden="true" />
                <span className="absolute -right-2 -top-4 h-24 w-24 rounded-full bg-primary-500/10" aria-hidden="true" />
                <i
                  className={`${category.icon_class} absolute right-6 top-6 text-4xl text-primary-300/80`}
                  aria-hidden="true"
                />
                <span className="absolute bottom-5 left-5 font-mono text-xs font-bold tracking-[0.2em] text-primary-300">
                  FAMILY 0{index + 1}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-heading text-xl font-semibold text-background-950 transition-colors group-hover:text-background-50">
                    {category.title}
                  </h3>
                  <i className={`${category.icon_class} text-xl text-primary-600 group-hover:text-primary-400`} aria-hidden="true" />
                </div>
                <p className="mt-4 text-sm leading-relaxed text-foreground-600 transition-colors group-hover:text-background-400">
                  {category.description}
                </p>
                <ul className="mt-auto min-h-36 space-y-2 border-t border-background-300 pt-5 text-xs leading-relaxed text-foreground-600 group-hover:border-background-700 group-hover:text-background-300">
                  {category.highlights.map((item) => (
                    <li key={item} className="flex gap-2">
                      <i className="ri-check-line shrink-0 text-primary-600 group-hover:text-primary-400" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
          {categories?.length === 0 && (
            <div className="border-b border-r border-background-300 bg-background-50 p-8 text-sm text-foreground-600 sm:col-span-2 lg:col-span-4">
              No award families are currently available.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
