import SectionHeader from "@/components/base/SectionHeader";
import type { AwardPageContent } from "../types";

export default function AwardsRecognition({
  content,
  benefits,
}: {
  content: AwardPageContent["recognition_intro"];
  benefits: AwardPageContent["recognition_benefits"];
}) {
  if (content.is_active === false) return null;
  const activeBenefits = benefits.filter((item) => item.is_active !== false);

  return (
    <section className="bg-background-50 section-padding">
      <div className="container-content">
        <div className="reveal mx-auto max-w-4xl">
          <SectionHeader
            eyebrow={content.eyebrow}
            title={content.title}
            subtitle={content.description}
            centered
          />
        </div>
        <div className="mt-12 grid border-l border-t border-background-300 sm:grid-cols-2 md:mt-16 lg:grid-cols-4">
          {activeBenefits.map((benefit, index) => (
            <article
              key={benefit.title}
              className={`reveal reveal-delay-${(index % 4) + 1} min-h-52 border-b border-r border-background-300 p-6 transition-colors hover:bg-background-100 md:p-7`}
            >
              <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-primary-700">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-7 font-heading text-lg font-semibold text-background-950">
                {benefit.title}
              </h3>
              <p className="mt-4 text-sm leading-[1.75] text-foreground-600">
                {benefit.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
