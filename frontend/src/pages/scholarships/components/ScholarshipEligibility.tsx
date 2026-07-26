import SectionHeader from "@/components/base/SectionHeader";
import {
  isManagedItemActive,
  useManagedSection,
} from "@/components/content/ManagedContentProvider";

const schemeTypes = [
  {
    id: "scholarship",
    title: "Scholarship",
    subtitle: "Recognition of merit, character and contribution.",
    description:
      "A scholarship may be awarded because an applicant demonstrates strong integrity, leadership, service, social impact, community contribution, influence for a positive cause or professional potential.",
    supporting_copy:
      "Scholarship merit does not mean the applicant must already have advanced technical knowledge. Merit can be demonstrated through character, responsibility, resilience, volunteering, leadership, public benefit and commitment to use the opportunity well.",
    points: [
      "Character and integrity",
      "Service to others",
      "Community or social contribution",
      "Leadership and positive influence",
      "Motivation and future professional potential",
    ],
  },
  {
    id: "bursary",
    title: "Bursary",
    subtitle: "Support where access would otherwise be difficult.",
    description:
      "A bursary is primarily designed to reduce a financial, employment, educational, professional or social barrier. The applicant may have strong motivation but no employer support, limited income, interrupted employment or significant personal circumstances.",
    supporting_copy:
      "Bursary applicants are still expected to show commitment and suitability. Need alone does not guarantee an award, but it is a major factor in understanding whether support could create a meaningful opportunity.",
    points: [
      "Financial hardship or limited income",
      "Lack of employer sponsorship",
      "Career interruption or unemployment",
      "Barriers to education or professional development",
      "Need for structured career repositioning",
    ],
  },
];

export default function ScholarshipEligibility() {
  const content = useManagedSection("eligibility", {
    eyebrow: "Understanding the Scheme",
    title: "Scholarship and bursary are related, but not identical.",
    description:
      "The Institute uses both terms so that professional potential and genuine need can be recognised fairly.",
    items: schemeTypes,
  });
  const items = content.items.filter(isManagedItemActive);

  return (
    <section id="eligibility" className="scroll-mt-20 bg-background-100 section-padding">
      <div className="container-content">
        <div className="reveal">
          <SectionHeader
            eyebrow={content.eyebrow}
            title={content.title}
            subtitle={content.description}
            centered
          />
        </div>
        <div className="reveal mt-12 grid border-l border-t border-background-300 md:mt-16 md:grid-cols-2">
          {items.map((item) => (
            <article key={item.id} className="border-b border-r border-background-300 bg-background-50 p-6 md:p-9">
              <span className="eyebrow text-primary-700">{item.title}</span>
              <h3 className="mt-5 font-heading text-2xl font-semibold text-background-950">
                {item.subtitle}
              </h3>
              <div className="mt-5 space-y-4 text-sm leading-[1.8] text-foreground-600">
                <p>{item.description}</p>
                <p>{item.supporting_copy}</p>
              </div>
              <ul className="mt-7 space-y-3 border-t border-background-300 pt-6">
                {item.points.map((point) => (
                  <li key={point} className="flex gap-3 text-sm text-foreground-700">
                    <i className="ri-check-line text-primary-600" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
