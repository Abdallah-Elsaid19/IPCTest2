import { useManagedSection } from "@/components/content/ManagedContentProvider";

type GradeKey = "affipc" | "mipc" | "afipcL3" | "afipcL4" | "fipc";

interface GradeColumn {
  key: GradeKey;
  label: string;
}

interface ComparisonRow {
  label: string;
  values: Record<GradeKey, string>;
}

const gradeColumns: GradeColumn[] = [
  { key: "affipc", label: "Affiliate Member" },
  { key: "mipc", label: "Professional Member" },
  { key: "afipcL3", label: "Associate Fellow Level 3" },
  { key: "afipcL4", label: "Associate Fellow Level 4" },
  { key: "fipc", label: "Fellow" },
];

const fullGradeNames: Record<GradeKey, string> = Object.fromEntries(
  gradeColumns.map((column) => [column.key, column.label]),
) as Record<GradeKey, string>;

const comparisonRows: ComparisonRow[] = [
  {
    label: "Typical position",
    values: {
      affipc: "Exploring or entering",
      mipc: "Active practitioner",
      afipcL3: "Foundation capability",
      afipcL4: "Independent applied practice",
      fipc: "Strategic leadership",
    },
  },
  {
    label: "Evidence depth",
    values: {
      affipc: "Simple statement",
      mipc: "Professional profile",
      afipcL3: "Work examples",
      afipcL4: "Portfolio and case study",
      fipc: "Senior portfolio and review",
    },
  },
  {
    label: "Primary signal",
    values: {
      affipc: "Affiliation",
      mipc: "Professional identity",
      afipcL3: "Foundation competence",
      afipcL4: "Applied judgement",
      fipc: "Leadership and contribution",
    },
  },
  {
    label: "Post-nominal",
    values: {
      affipc: "AffIPC",
      mipc: "MIPC",
      afipcL3: "AFIPC L3",
      afipcL4: "AFIPC L4",
      fipc: "FIPC",
    },
  },
];

export default function MembershipComparisonTable() {
  const content = useManagedSection("comparison", {
    eyebrow: "Membership Pathway",
    title: "Compare IPC Membership Grades",
    description: "Explore the professional position, evidence expectations and recognition associated with each IPC membership grade.",
    columns: gradeColumns,
    rows: comparisonRows,
  });
  const columns = content.columns as GradeColumn[];
  const rows = content.rows as ComparisonRow[];
  return (
    <section
      aria-labelledby="membership-comparison-title"
      className="border-y border-background-200/70 bg-background-100 section-padding"
    >
      <div className="container-content">
        <div className="mx-auto mb-10 max-w-3xl text-center md:mb-14">
          <span className="eyebrow mb-3 block text-primary-600">
            {content.eyebrow}
          </span>
          <h2
            id="membership-comparison-title"
            className="mb-4 font-heading text-3xl font-semibold text-background-950 md:text-4xl"
          >
            {content.title}
          </h2>
          <p className="mx-auto max-w-2xl leading-relaxed text-foreground-600">
            {content.description}
          </p>
        </div>

        <div
          className="w-full border border-background-300 bg-background-50"
        >
          <table className="w-full  table-fixed border-collapse text-left" aria-label="IPC membership grades comparison">
            <caption className="sr-only">
              Comparison of the professional position, evidence depth, primary signal and post-nominal for IPC membership grades.
            </caption>
            <colgroup>
              <col className="w-[15%]" />
              {columns.map((column) => (
                <col key={column.key} className="w-[17%]" />
              ))}
            </colgroup>
            <thead className="bg-background-950 text-background-50">
              <tr>
                <th
                  scope="col"
                  className="border-r border-background-800 bg-background-950 px-2 py-3 font-heading text-[10px] font-semibold leading-tight text-primary-400 sm:px-3 sm:py-4 sm:text-xs md:px-4 md:text-sm lg:px-5 lg:py-5"
                >
                  Comparison
                </th>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className="break-words border-r border-background-800/70 px-2 py-3 font-heading text-[10px] font-semibold leading-tight last:border-r-0 sm:px-3 sm:py-4 sm:text-xs md:px-4 md:text-sm lg:px-3 lg:py-5"
                  >
                    {fullGradeNames[column.key] || column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-background-300 first:border-t-0">
                  <th
                    scope="row"
                    className="break-words border-r border-background-300 bg-background-200 px-2 py-3 font-heading text-[10px] font-semibold leading-snug text-background-950 sm:px-3 sm:py-4 sm:text-xs md:px-4 md:text-sm lg:px-5 lg:py-5"
                  >
                    {row.label}
                  </th>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="break-words border-r border-background-300 px-2 py-3 text-[10px] leading-snug text-foreground-700 last:border-r-0 sm:px-3 sm:py-4 sm:text-xs md:px-4 md:text-sm md:leading-relaxed lg:px-5 lg:py-5"
                    >
                      {row.values[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
