import SectionHeader from "@/components/base/SectionHeader";
import { useManagedSection } from "@/components/content/ManagedContentProvider";

const conditions = [
  "Support is subject to eligibility and availability.",
  "Applications do not guarantee an award.",
  "Support may be full, partial or activity-specific.",
  "Programme admission and scholarship decisions may be separate.",
  "False or misleading information may lead to withdrawal.",
  "Awards may include reasonable participation or progress conditions.",
  "Private or sensitive documents should not be sent through an insecure public form.",
  "Final conditions are confirmed individually in writing.",
];

export default function ScholarshipConditions() {
  const content = useManagedSection("conditions", {
    eyebrow: "Important Information",
    title: "Clear conditions protect applicants and the purpose of support.",
    description:
      "The Institute confirms the scope and conditions of each award individually and aims to communicate decisions responsibly.",
    items: conditions,
  });

  return (
    <section className="bg-background-100 section-padding">
      <div className="container-content">
        <div className="reveal">
          <SectionHeader
            eyebrow={content.eyebrow}
            title={content.title}
            subtitle={content.description}
            centered
          />
        </div>
        <ul className="reveal mx-auto mt-12 max-w-5xl divide-y divide-background-300 border-y border-background-300 md:mt-16">
          {content.items.map((item, index) => (
            <li key={item} className="grid gap-3 py-5 sm:grid-cols-[3rem_minmax(0,1fr)] sm:items-start">
              <span className="font-mono text-[10px] font-bold text-primary-700">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-sm leading-relaxed text-foreground-700 md:text-base">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
