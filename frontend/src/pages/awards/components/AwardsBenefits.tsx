import AudienceCard from "@/components/base/AudienceCard";
import SectionHeader from "@/components/base/SectionHeader";
import type { AwardContentCard, AwardSectionIntro } from "../types";

export default function AwardsBenefits({ content, benefits, isLoading, error }: { content: AwardSectionIntro; benefits: AwardContentCard[]; isLoading: boolean; error: string }) {
  if (content.is_active === false) return null;
  return (
    <section className="bg-background-50 section-padding">
      <div className="container-content">
        <div className="reveal"><SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} centered /></div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-16 lg:grid-cols-4">
          {isLoading && <div className="col-span-full flex items-center justify-center gap-3 py-16 text-foreground-600" role="status"><span className="h-6 w-6 animate-spin rounded-full border-2 border-background-300 border-t-primary-600" aria-hidden="true" />Loading award benefits…</div>}
          {error && <div className="col-span-full border border-red-200 bg-red-50 px-6 py-8 text-center text-red-800" role="alert">{error}</div>}
          {!isLoading && !error && benefits.map((benefit, index) => <div key={benefit.title} className={`reveal reveal-delay-${index + 1}`}><AudienceCard icon={benefit.icon} title={benefit.title} description={benefit.description} /></div>)}
        </div>
      </div>
    </section>
  );
}
