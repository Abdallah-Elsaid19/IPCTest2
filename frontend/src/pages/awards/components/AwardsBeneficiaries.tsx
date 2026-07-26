import SectionHeader from "@/components/base/SectionHeader";
import type { AwardBeneficiary, AwardSectionIntro } from "../types";

export default function AwardsBeneficiaries({
  content,
  beneficiaries,
}: {
  content: AwardSectionIntro;
  beneficiaries: AwardBeneficiary[];
}) {
  if (content.is_active === false) return null;

  return (
    <section id="eligibility" className="scroll-mt-20 bg-background-100 section-padding">
      <div className="container-content">
        <div className="reveal mx-auto max-w-4xl">
          <SectionHeader
            eyebrow={content.eyebrow}
            title={content.title}
            subtitle={content.description}
            centered
          />
        </div>
        <div className="mt-12 grid border-l border-t border-background-300 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
          {beneficiaries.map((item, index) => (
            <article
              key={item.title}
              className={`reveal reveal-delay-${index + 1} min-h-60 border-b border-r border-background-300 bg-background-50 p-7 transition-colors hover:bg-background-950 md:p-8 group`}
            >
              <span className="flex h-11 w-11 items-center justify-center bg-primary-500 font-mono text-xs font-bold text-background-950">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-8 font-heading text-xl font-semibold text-background-950 transition-colors group-hover:text-background-50">
                {item.title}
              </h3>
              <p className="mt-4 text-sm leading-[1.75] text-foreground-600 transition-colors group-hover:text-background-300">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
