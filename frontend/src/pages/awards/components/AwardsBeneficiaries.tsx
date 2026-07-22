import SectionHeader from "@/components/base/SectionHeader";
import type { AwardBeneficiary, AwardSectionIntro } from "../types";

export default function AwardsBeneficiaries({ content, beneficiaries }: { content: AwardSectionIntro; beneficiaries: AwardBeneficiary[] }) {
  if (content.is_active === false) return null;
  return (
    <section className="bg-background-100 section-padding">
      <div className="container-content">
        <div className="reveal"><SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} centered /></div>
        <div className="mt-12 grid items-stretch gap-8 md:mt-16 lg:grid-cols-[.75fr_1.25fr]">
          <div className="relative min-h-[30rem] overflow-hidden reveal"><img loading="lazy" decoding="async" src={content.image_url} alt={content.image_alt} className="h-full w-full object-cover image-zoom" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            {beneficiaries.map((item, index) => <article key={item.title} className={`reveal reveal-delay-${index + 1} flex min-h-60 flex-col border border-background-200 bg-background-50 p-7`}><span className="font-mono text-[10px] font-bold tracking-[0.2em] text-primary-600">0{index + 1}</span><h3 className="mt-8 font-heading text-xl font-semibold text-background-950">{item.title}</h3><p className="mt-4 text-sm leading-relaxed text-foreground-600">{item.description}</p><a href={item.cta_url} className="mt-auto pt-7 text-sm font-bold text-primary-700">{item.cta_label} →</a></article>)}
          </div>
        </div>
      </div>
    </section>
  );
}
