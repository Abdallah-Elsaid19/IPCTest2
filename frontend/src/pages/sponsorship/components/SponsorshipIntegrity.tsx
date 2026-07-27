import FeatureCard from "@/components/base/FeatureCard";
import SectionHeader from "@/components/base/SectionHeader";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const safeguards = [
  { icon: "ri-user-star-line", title: "Independent membership decisions", description: "Sponsorship does not guarantee Affiliate, Member, Associate Fellow or Fellow recognition." },
  { icon: "ri-graduation-cap-line", title: "Independent scholarship selection", description: "Sponsors may agree a purpose, but eligibility and selection remain subject to fair criteria." },
  { icon: "ri-award-line", title: "Independent awards judging", description: "Award sponsorship does not give control over judges, finalists or winners." },
  { icon: "ri-article-line", title: "Editorial independence", description: "Sponsored content must be labelled and remains subject to editorial standards." },
  { icon: "ri-lock-line", title: "Consent-based talent engagement", description: "Sponsorship does not provide unrestricted access to member or learner data." },
  { icon: "ri-check-double-line", title: "Accurate public claims", description: "Sponsors should use only approved wording and descriptions of the relationship." },
];
const fallbackIntro = {
  eyebrow: "Independence and integrity",
  title: "Sponsorship supports the mission. It does not purchase outcomes.",
  description: "The long-term value of sponsorship depends on protecting professional credibility.",
  principle_title: "Credibility creates more value than paid influence.",
  principle_description: "A sponsor benefits most when recognition, scholarships, awards and publications remain trusted. Organisations can be associated with professional contribution without controlling professional judgement.",
  principle_items: ["Clear written agreement", "Defined benefits and boundaries", "Conflict-of-interest management", "Data protection and confidentiality", "Transparent sponsored content", "Proportionate impact reporting"],
};

export default function SponsorshipIntegrity() {
  const intro = useManagedSection("integrity_intro", fallbackIntro);
  const items = useManagedSection("integrity_principles", safeguards).filter(isManagedItemActive);
  return (
    <section id="safeguards" className="scroll-mt-20 bg-background-950 section-padding">
      <div className="container-content">
        <div className="reveal">
          <SectionHeader
            eyebrow={intro.eyebrow}
            title={intro.title}
            subtitle={intro.description}
            light
            centered
          />
        </div>
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
          {items.map((item, index) => (
            <div key={item.title} className="reveal h-full" style={{ transitionDelay: `${index * 80}ms` }}>
              <FeatureCard {...item} light />
            </div>
          ))}
        </div>
        <div className="reveal mt-8 grid gap-7 border border-background-50/15 bg-background-50/5 p-6 md:p-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <span className="eyebrow text-primary-300">The sponsorship principle</span>
            <h3 className="mt-4 font-heading text-xl font-semibold text-background-50">{intro.principle_title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-background-300">{intro.principle_description}</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {intro.principle_items.map((item) => (
              <li key={item} className="flex items-start gap-2 border border-background-50/10 p-3 text-xs leading-relaxed text-background-200">
                <i className="ri-check-line mt-0.5 text-primary-300" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
