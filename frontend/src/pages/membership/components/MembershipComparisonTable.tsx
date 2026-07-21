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
  { key: "affipc", label: "AffIPC" },
  { key: "mipc", label: "MIPC" },
  { key: "afipcL3", label: "AFIPC L3" },
  { key: "afipcL4", label: "AFIPC L4" },
  { key: "fipc", label: "FIPC" },
];

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

        <p
          id="membership-comparison-scroll-hint"
          className="mb-3 flex items-center gap-2 text-xs font-medium text-foreground-500 lg:hidden"
        >
          <i className="ri-drag-move-2-line text-primary-600" aria-hidden="true" />
          Swipe or scroll horizontally to compare every grade.
        </p>

        <div
          className="overflow-x-auto border border-background-300 bg-background-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background-100"
          role="region"
          aria-label="IPC membership grades comparison"
          aria-describedby="membership-comparison-scroll-hint"
          tabIndex={0}
        >
          <table className="w-full min-w-[1080px] table-fixed border-collapse text-left">
            <caption className="sr-only">
              Comparison of the professional position, evidence depth, primary signal and post-nominal for IPC membership grades.
            </caption>
            <colgroup>
              <col className="w-[190px]" />
              {columns.map((column) => (
                <col key={column.key} className="w-[178px]" />
              ))}
            </colgroup>
            <thead className="bg-background-950 text-background-50">
              <tr>
                <th
                  scope="col"
                  className="sticky left-0 z-20 border-r border-background-800 bg-background-950 px-5 py-5 font-heading text-sm font-semibold text-primary-400"
                >
                  Comparison
                </th>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className="border-r border-background-800/70 px-5 py-5 font-heading text-sm font-semibold last:border-r-0"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-background-300 first:border-t-0">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 border-r border-background-300 bg-background-200 px-5 py-5 font-heading text-sm font-semibold text-background-950"
                  >
                    {row.label}
                  </th>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="border-r border-background-300 px-5 py-5 text-sm leading-relaxed text-foreground-700 last:border-r-0"
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
