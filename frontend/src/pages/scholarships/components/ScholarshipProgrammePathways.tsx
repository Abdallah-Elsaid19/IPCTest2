import SectionHeader from "@/components/base/SectionHeader";
import {
  isManagedItemActive,
  useManagedSection,
} from "@/components/content/ManagedContentProvider";

const programmePathways = [
  {
    id: "level-4",
    level: "Level 4",
    title: "Associate Project Manager",
    description:
      "An applied pathway for people coordinating projects, leading work packages, supporting governance, working with stakeholders or moving from technical and operational roles into structured project delivery.",
    suitable_for:
      "Project coordinators, supervisors, team leaders, PMO staff, consultants, self-employed professionals and emerging managers.",
    development_aim:
      "Build applied project leadership, planning, stakeholder, risk, governance and delivery capability.",
    ipc_pathway:
      "May support progression towards Professional Member or Associate Fellow Level 4 recognition.",
  },
  {
    id: "level-6",
    level: "Level 6",
    title: "Project Controls Professional",
    description:
      "An advanced pathway for experienced practitioners and managers working across planning, cost, risk, change, forecasting, reporting, assurance, data quality and project controls leadership.",
    suitable_for:
      "Planners, cost professionals, project controllers, risk professionals, managers, consultants and senior practitioners.",
    development_aim:
      "Develop integrated controls judgement, leadership, assurance, strategic reporting and decision support.",
    ipc_pathway:
      "May support progression towards Associate Fellow Level 4 or Fellow Level 6 recognition, subject to evidence.",
  },
];

export default function ScholarshipProgrammePathways() {
  const content = useManagedSection("impact", {
    eyebrow: "Potential Programme Pathways",
    title: "Support across practitioner and professional levels.",
    description:
      "The scholarship scheme is intended to support access to selected project controls and project management pathways. The programme offered to an applicant should reflect eligibility, career stage, existing experience and development need.",
    items: programmePathways,
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

        <div className="reveal mt-12 grid border-l border-t border-background-800 md:mt-16 md:grid-cols-2">
          {items.map((pathway, index) => (
              <article
                key={pathway.id}
                className="group relative flex min-h-[34rem] flex-col border-b border-r border-background-800 bg-background-900/70 p-6 transition-all duration-300 hover:bg-background-900 md:p-8"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary-400">
                    {pathway.level}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-background-600">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="mt-8 max-w-md font-heading text-2xl font-semibold leading-tight text-background-50 md:text-3xl">
                  {pathway.title}
                </h3>
                <p className="mt-5 max-w-xl text-sm leading-[1.8] text-background-400">
                  {pathway.description}
                </p>

                <dl className="mt-8 divide-y divide-background-800 border-t border-background-800">
                  <div className="grid gap-2 py-5 sm:grid-cols-[8rem_1fr]">
                    <dt className="text-xs font-bold text-primary-300">Suitable for</dt>
                    <dd className="text-xs leading-[1.7] text-background-400">
                      {pathway.suitable_for}
                    </dd>
                  </div>
                  <div className="grid gap-2 py-5 sm:grid-cols-[8rem_1fr]">
                    <dt className="text-xs font-bold text-primary-300">Development aim</dt>
                    <dd className="text-xs leading-[1.7] text-background-400">
                      {pathway.development_aim}
                    </dd>
                  </div>
                  <div className="grid gap-2 py-5 sm:grid-cols-[8rem_1fr]">
                    <dt className="text-xs font-bold text-primary-300">IPC pathway</dt>
                    <dd className="text-xs leading-[1.7] text-background-400">
                      {pathway.ipc_pathway}
                    </dd>
                  </div>
                </dl>

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
