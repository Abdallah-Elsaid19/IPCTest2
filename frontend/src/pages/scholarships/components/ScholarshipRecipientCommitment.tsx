import SectionHeader from "@/components/base/SectionHeader";
import {
  isManagedItemActive,
  useManagedSection,
} from "@/components/content/ManagedContentProvider";

const conditionGroups = [
  {
    title: "Funding conditions",
    items: [
      "Funding is discretionary and subject to available IPC scholarship resources.",
      "The final award may be 50%, 60%, 70% or another amount stated in the written decision.",
      "The award applies only to eligible costs identified in the written scholarship offer.",
      "Funding is not normally retrospective.",
      "Funding cannot be duplicated with costs already covered by another funding source.",
      "Kent Business College admission remains a separate requirement.",
    ],
  },
  {
    title: "Learner responsibilities",
    items: [
      "Provide complete and truthful application information.",
      "Confirm how the remaining 30%–50% will be funded.",
      "Meet the programme’s entry and participation requirements.",
      "Attend, engage and complete required programme work.",
      "Inform IPC and KBC promptly if circumstances change.",
      "Follow the relevant codes of conduct and use recognition titles accurately.",
    ],
  },
];

export default function ScholarshipRecipientCommitment() {
  const content = useManagedSection("recipient_commitment", {
    eyebrow: "Scholarship Conditions",
    title: "What the 50%–70% contribution means in practice.",
    groups: conditionGroups,
  });
  const groups = content.groups.filter(isManagedItemActive);

  return (
    <section className="bg-background-950 section-padding text-background-50">
      <div className="container-content">
        <div className="reveal max-w-4xl">
          <SectionHeader
            eyebrow={content.eyebrow}
            title={content.title}
            light
            eyebrowClassName="text-primary-400"
          />
        </div>
        <div className="reveal mt-12 grid gap-5 md:mt-16 md:grid-cols-2">
          {groups.map((group) => (
            <article
              key={group.title}
              className="group relative border border-background-700 bg-background-900 p-6 transition-colors hover:border-primary-500/60 md:p-8"
            >
              <h3 className="font-heading text-2xl font-semibold text-background-50">
                {group.title}
              </h3>
              <ul className="mt-6 space-y-4">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="grid grid-cols-[0.75rem_1fr] gap-3 text-sm leading-[1.7] text-background-200 md:text-base"
                  >
                    <span
                      className="mt-2 h-2 w-2 rounded-full bg-primary-400 shadow-[0_0_0_4px_rgba(214,147,38,0.12)]"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <span
                className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-primary-500 transition-transform duration-300 group-hover:scale-x-100"
                aria-hidden="true"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
