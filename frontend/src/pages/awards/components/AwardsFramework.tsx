import SectionHeader from "@/components/base/SectionHeader";
import type { AwardCategory } from "@/features/awards/types";
import type { AwardSectionIntro } from "../types";

export default function AwardsFramework({ content, categories }: { content: AwardSectionIntro; categories: AwardCategory[] | null }) {
  if (content.is_active === false) return null;

  return (
    <section className="bg-background-50 section-padding">
      <div className="container-content">
        <div className="reveal"><SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} centered /></div>
        <div className="mt-12 grid grid-cols-1 gap-6 md:mt-16 md:grid-cols-3">
          {categories === null && [0, 1, 2].map((item) => <div key={item} className="h-[500px] animate-pulse bg-background-100" />)}
          {categories?.map((category) => (
            <div key={category.id}>
              <div className="group card-hover h-full overflow-hidden border border-background-200/70 bg-background-100 transition-all duration-300 hover:border-primary-200">
                <div className="relative h-44 overflow-hidden">
                  <img loading="lazy" decoding="async" src={category.image_url} alt={category.title} className="h-full w-full object-cover image-zoom" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background-950/70 to-transparent" />
                  <div className="absolute bottom-3 left-3"><div className="flex h-10 w-10 items-center justify-center bg-background-50/20 backdrop-blur-sm"><i className={`${category.icon_class} text-lg text-background-50`} /></div></div>
                </div>
                <div className="p-6 md:p-7">
                  <h3 className="mb-3 font-heading text-xl font-semibold text-background-950">{category.title}</h3>
                  <p className="mb-5 text-sm leading-relaxed text-foreground-600">{category.description}</p>
                  <div className="space-y-2">{category.highlights.map((item) => <div key={item} className="flex items-center gap-2 text-sm text-background-950"><i className="ri-checkbox-circle-line shrink-0 text-base text-accent-600" /><span>{item}</span></div>)}</div>
                </div>
              </div>
            </div>
          ))}
          {categories?.length === 0 && <div className="border border-background-200 bg-background-100 p-8 text-center text-sm text-foreground-600 md:col-span-3">No award categories are currently available.</div>}
        </div>
      </div>
    </section>
  );
}
