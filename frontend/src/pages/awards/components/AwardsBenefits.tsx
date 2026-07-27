import SectionHeader from "@/components/base/SectionHeader";
import type { AwardContentCard, AwardSectionIntro } from "../types";

export default function AwardsBenefits({
  content,
  benefits,
  isLoading,
  error,
}: {
  content: AwardSectionIntro;
  benefits: AwardContentCard[];
  isLoading: boolean;
  error: string;
}) {
  if (content.is_active === false) return null;

  return (
    <section className="bg-background-50 section-padding">
      <div className="container-content">
        <div className="reveal">
          <SectionHeader
            eyebrow={content.eyebrow}
            title={content.title}
            centered
            className="mx-auto max-w-5xl"
          />
          {content.description && (
            <p className="mt-7 text-left text-base leading-relaxed text-foreground-600 md:text-lg">
              {content.description}
            </p>
          )}
          <div className="mt-7 space-y-5 text-left text-sm leading-[1.85] text-foreground-600 md:text-base">
            {content.secondary_description && <p>{content.secondary_description}</p>}
            {content.tertiary_description && <p>{content.tertiary_description}</p>}
          </div>
          {content.closing_description && (
            <p className="mt-7 border-l-2 border-primary-500 bg-background-100 px-6 py-5 text-left text-sm font-semibold leading-relaxed text-background-950 md:text-base">
              {content.closing_description}
            </p>
          )}
        </div>

        <div className="mt-12 grid grid-cols-1 border-l border-t border-background-300 sm:grid-cols-2 md:mt-16 lg:grid-cols-4">
          {isLoading && (
            <div className="col-span-full flex items-center justify-center gap-3 py-16 text-foreground-600" role="status">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-background-300 border-t-primary-600" aria-hidden="true" />
              Loading award benefits…
            </div>
          )}
          {error && (
            <div className="col-span-full border border-red-200 bg-red-50 px-6 py-8 text-center text-red-800" role="alert">
              {error}
            </div>
          )}
          {!isLoading && !error && benefits.map((benefit, index) => (
            <article
              key={benefit.title}
              className={`reveal reveal-delay-${index + 1} group relative min-h-64 overflow-hidden border-b border-r border-background-300 p-6 transition-colors hover:bg-background-100 md:p-8`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-primary-700">
                  0{index + 1}
                </span>
                <i className={`${benefit.icon} text-xl text-primary-700`} aria-hidden="true" />
              </div>
              <h3 className="mt-10 font-heading text-xl font-semibold text-background-950">
                {benefit.title}
              </h3>
              <p className="mt-4 text-sm leading-[1.75] text-foreground-600">
                {benefit.description}
              </p>
              <span
                className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-primary-500 transition-transform duration-300 group-hover:scale-x-100"
                aria-hidden="true"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
