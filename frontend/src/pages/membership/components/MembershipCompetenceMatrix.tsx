import SectionHeader from "@/components/base/SectionHeader";
import {
  isManagedItemActive,
  useManagedSection,
} from "@/components/content/ManagedContentProvider";

interface CompetenceRow {
  area: string;
  affipc: string;
  mipc: string;
  afipc_l3: string;
  afipc_l4: string;
  fipc: string;
  is_active?: boolean;
}

interface CompetenceMatrixContent {
  eyebrow: string;
  title: string;
  description: string;
  competence_area_label: string;
  affipc_label: string;
  mipc_label: string;
  afipc_l3_label: string;
  afipc_l4_label: string;
  fipc_label: string;
  rows: CompetenceRow[];
}

const defaultCompetenceMatrix: CompetenceMatrixContent = {
  eyebrow: "Competence Matrix",
  title: "Depth of competence expected by grade.",
  description:
    "The Institute reviews competence proportionately. A Level 3 applicant is not judged like a Fellow. A Fellow is expected to show senior judgement and contribution, not simply long service.",
  competence_area_label: "Competence area",
  affipc_label: "AffIPC",
  mipc_label: "MIPC",
  afipc_l3_label: "AFIPC L3",
  afipc_l4_label: "AFIPC L4",
  fipc_label: "FIPC",
  rows: [
    {
      area: "Project lifecycle and governance",
      affipc: "Awareness",
      mipc: "Practical awareness",
      afipc_l3: "Foundation understanding",
      afipc_l4: "Applied use",
      fipc: "Strategic governance and assurance",
    },
    {
      area: "Planning and scheduling",
      affipc: "Awareness",
      mipc: "Role exposure",
      afipc_l3: "Foundation terms and logic",
      afipc_l4: "Applied schedule control",
      fipc: "Schedule assurance, strategy and recovery advice",
    },
    {
      area: "Cost, estimating and forecasting",
      affipc: "Awareness",
      mipc: "Basic exposure",
      afipc_l3: "Foundation cost control concepts",
      afipc_l4: "Applied cost reporting and forecasting",
      fipc: "Senior cost engineering judgement and assurance",
    },
    {
      area: "Risk, change and uncertainty",
      affipc: "Awareness",
      mipc: "Basic awareness",
      afipc_l3: "Understands registers and change logs",
      afipc_l4: "Analyses implications and supports controls",
      fipc: "Challenges assumptions and advises on mitigation",
    },
    {
      area: "Performance reporting and earned value",
      affipc: "Awareness",
      mipc: "Can support reporting",
      afipc_l3: "Understands progress and variance",
      afipc_l4: "Produces and interprets performance insight",
      fipc: "Assures reports and influences senior decisions",
    },
    {
      area: "AI, technology and data quality",
      affipc: "Digital awareness",
      mipc: "Tool use",
      afipc_l3: "Uses software with guidance",
      afipc_l4: "Validates dashboards and data outputs",
      fipc: "Leads digital improvement and responsible AI use",
    },
    {
      area: "Sustainability and net zero",
      affipc: "Awareness",
      mipc: "Recognises relevance",
      afipc_l3: "Understands environmental responsibilities",
      afipc_l4: "Considers carbon and resource impacts in controls",
      fipc: "Integrates sustainability into controls strategy",
    },
    {
      area: "Leadership and influence",
      affipc: "Personal conduct",
      mipc: "Team contribution",
      afipc_l3: "Reliable task ownership",
      afipc_l4: "Influences project stakeholders",
      fipc: "Leads people, standards and professional improvement",
    },
  ],
};

export default function MembershipCompetenceMatrix() {
  const content = useManagedSection<CompetenceMatrixContent>(
    "competence_matrix",
    defaultCompetenceMatrix,
  );
  const rows = content.rows.filter(isManagedItemActive);
  const columns = [
    { key: "affipc", label: content.affipc_label },
    { key: "mipc", label: content.mipc_label },
    { key: "afipc_l3", label: content.afipc_l3_label },
    { key: "afipc_l4", label: content.afipc_l4_label },
    { key: "fipc", label: content.fipc_label },
  ] as const;

  return (
    <section
      aria-labelledby="membership-competence-title"
      className="border-b border-background-200/70 bg-background-50 section-padding"
    >
      <div className="container-content">
        <div className="reveal">
          <SectionHeader
            eyebrow={content.eyebrow}
            title={content.title}
            subtitle={content.description}
            centered
          />
        </div>

        <div className="reveal mt-12 overflow-hidden border border-background-300 bg-background-50 md:mt-16">
          <div className="overflow-x-auto">
            <table
              className="w-full min-w-[960px] table-fixed border-collapse text-left lg:min-w-0"
              aria-label="Depth of competence expected for each IPC membership grade"
            >
            <caption className="sr-only">
              Competence expectations across the five IPC membership grades.
            </caption>
            <colgroup>
              <col className="w-[18%]" />
              <col className="w-[11%]" />
              <col className="w-[12%]" />
              <col className="w-[18%]" />
              <col className="w-[20%]" />
              <col className="w-[21%]" />
            </colgroup>
            <thead className="bg-background-950">
              <tr>
                <th
                  scope="col"
                  className="break-words border-r border-background-700 px-4 py-4 font-heading text-xs font-bold uppercase leading-tight text-primary-400 lg:px-5 lg:py-5"
                >
                  {content.competence_area_label}
                </th>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className="break-words border-r border-background-700 px-4 py-4 font-heading text-xs font-bold uppercase leading-tight text-primary-400 last:border-r-0 lg:px-5 lg:py-5"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.area}
                  className="border-t border-background-300 align-top"
                >
                  <th
                    scope="row"
                    className="break-words border-r border-background-300 bg-background-100 px-4 py-4 font-heading text-xs font-semibold leading-relaxed text-background-950 lg:px-5 lg:py-5 lg:text-sm"
                  >
                    {row.area}
                  </th>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="break-words border-r border-background-300 px-4 py-4 text-xs leading-relaxed text-foreground-700 last:border-r-0 lg:px-5 lg:py-5 lg:text-sm"
                    >
                      {row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-foreground-500 lg:hidden">
          Swipe horizontally to view the full competence matrix.
        </p>
      </div>
    </section>
  );
}
