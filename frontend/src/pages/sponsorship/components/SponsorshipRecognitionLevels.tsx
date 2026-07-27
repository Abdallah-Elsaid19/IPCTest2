import SectionHeader from "@/components/base/SectionHeader";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const fallbackContent = {
  eyebrow: "Sponsorship recognition levels",
  title: "Flexible levels without publishing fixed prices.",
  description: "The Institute agrees a sponsorship level after understanding the activity, duration, audience and impact required.",
  items: [
    { level: "Entry level", title: "Supporter", description: "For an individual or small organisation supporting one activity.", benefits: ["One defined activity", "Agreed acknowledgement", "Simple impact confirmation"] },
    { level: "Focused support", title: "Bronze Sponsor", description: "For a club event, learner place, small event or award.", benefits: ["Defined programme scope", "Digital recognition", "Agreed guest access"] },
    { level: "Programme support", title: "Silver Sponsor", description: "For scholarship support, an event or publication activity.", benefits: ["Expanded recognition", "Content opportunity", "Impact summary"] },
    { level: "Major partnership", title: "Gold Sponsor", description: "For a major event, award programme or learner cohort.", benefits: ["High-visibility programme", "Thought leadership", "Strategic engagement"] },
    { level: "Strategic relationship", title: "Platinum or Founding Partner", description: "For sustained support across several Institute priorities.", benefits: ["Multi-activity agreement", "Longer-term impact", "Executive relationship"] },
  ],
  note_title: "Tailored by discussion",
  note: "These levels are not a public price list. Every arrangement is confirmed in writing, including scope, benefits, duration, branding, reporting, confidentiality and integrity requirements.",
};

export default function SponsorshipRecognitionLevels() {
  const content = useManagedSection("recognition_levels", fallbackContent);
  return (
    <section className="bg-background-100 section-padding">
      <div className="container-content">
        <div className="reveal">
          <SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} centered />
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 md:mt-16 lg:grid-cols-5">
          {content.items.filter(isManagedItemActive).map((item, index) => (
            <article key={item.title} className="reveal group relative flex h-full min-h-80 flex-col border border-background-200/70 bg-background-50 p-6 transition-colors hover:bg-white" style={{ transitionDelay: `${index * 60}ms` }}>
              <span className="eyebrow text-primary-700">{item.level}</span>
              <h3 className="mt-6 font-heading text-xl font-semibold text-background-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground-600">{item.description}</p>
              <ul className="mt-6 space-y-2 border-t border-background-200 pt-5 text-xs leading-relaxed text-foreground-600">
                {item.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2">
                    <i className="ri-check-line mt-0.5 text-primary-700" aria-hidden="true" />
                    {benefit}
                  </li>
                ))}
              </ul>
              <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-primary-500 transition-transform duration-300 group-hover:scale-x-100" />
            </article>
          ))}
        </div>
        <div className="reveal mt-8 border-l-[3px] border-primary-500 bg-background-50 p-6 md:p-8">
          <h3 className="font-heading text-lg font-semibold text-background-950">{content.note_title}</h3>
          <p className="mt-2 max-w-5xl text-sm leading-relaxed text-foreground-600">{content.note}</p>
        </div>
      </div>
    </section>
  );
}
