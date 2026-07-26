import SectionHeader from "@/components/base/SectionHeader";
import {
  isManagedItemActive,
  useManagedSection,
} from "@/components/content/ManagedContentProvider";

const conditions = [
  {
    title: "Programme eligibility",
    description:
      "The applicant must meet the eligibility, entry and participation requirements of the relevant programme and education partner.",
  },
  {
    title: "Truthful information",
    description:
      "Applications must be accurate. False or misleading information may result in rejection or withdrawal of an award.",
  },
  {
    title: "Participation and completion",
    description:
      "Successful applicants are expected to attend, participate, complete required work and communicate promptly about barriers.",
  },
  {
    title: "Professional conduct",
    description:
      "Award holders must act respectfully and follow relevant conduct, safeguarding, equality, confidentiality and professional behaviour requirements.",
  },
  {
    title: "Progress updates",
    description:
      "The Institute may request proportionate progress updates, reflections or confirmation of continued participation.",
  },
  {
    title: "Individual award terms",
    description:
      "The value, duration, covered activities and conditions of each award will be confirmed individually in writing.",
  },
  {
    title: "No automatic professional recognition",
    description:
      "A scholarship does not automatically grant Associate Fellowship or Fellowship. Professional recognition remains subject to the relevant competence and evidence requirements.",
  },
  {
    title: "Withdrawal where necessary",
    description:
      "Support may be reviewed or withdrawn for serious misconduct, non-participation, false information or failure to meet agreed conditions.",
  },
];

export default function ScholarshipRecipientCommitment() {
  const content = useManagedSection("recipient_commitment", {
    eyebrow: "Conditions and Responsibilities",
    title: "Support creates opportunity and also carries responsibility.",
    description:
      "Successful applicants should understand the conditions of their award before accepting it.",
    items: conditions,
    closing_title: "Equality, confidentiality and fair review",
    closing_description:
      "Applications should be handled fairly, respectfully and confidentially. The Institute will seek to avoid unlawful discrimination and will consider equality, safeguarding, data protection, suitability and conflict-of-interest principles when reviewing applications.",
  });
  const items = content.items.filter(isManagedItemActive);

  return (
    <section className="bg-background-950 section-padding text-background-50">
      <div className="container-content">
        <div className="reveal max-w-4xl">
          <SectionHeader
            eyebrow={content.eyebrow}
            title={content.title}
            subtitle={content.description}
            light
            eyebrowClassName="text-primary-400"
          />
        </div>
        <ol className="reveal mt-12 grid border-l border-t border-background-800 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <li key={item.title} className="min-h-56 border-b border-r border-background-800 p-5 md:p-6">
              <span className="font-mono text-[10px] font-bold text-primary-400">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-6 font-heading text-base font-semibold text-background-50">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-[1.7] text-background-300">
                {item.description}
              </p>
            </li>
          ))}
        </ol>
        <aside className="reveal mt-8 border-l-2 border-primary-500 bg-background-900 p-6 md:p-8">
          <h3 className="font-heading text-lg font-semibold text-primary-300">
            {content.closing_title}
          </h3>
          <p className="mt-3 max-w-5xl text-sm leading-[1.8] text-background-300">
            {content.closing_description}
          </p>
        </aside>
      </div>
    </section>
  );
}
