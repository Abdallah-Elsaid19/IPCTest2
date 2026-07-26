import SectionHeader from "@/components/base/SectionHeader";
import { useManagedSection } from "@/components/content/ManagedContentProvider";

interface MembershipPathwayRow {
  grade: string;
  professionalStage: string;
  competenceEmphasis: string;
  evidenceExpected: string;
  bestValue: string;
  progression: string;
}

const pathwayRows: MembershipPathwayRow[] = [
  {
    grade: "Affiliate Member\nAffIPC",
    professionalStage: "Entry, student, career change or early interest.",
    competenceEmphasis:
      "Awareness, learning commitment, conduct and professional intention.",
    evidenceExpected:
      "Short statement, CV/profile and agreement to conduct expectations.",
    bestValue:
      "Belonging, networking, confidence and start of professional identity.",
    progression: "Professional Member or AFIPC L3.",
  },
  {
    grade: "Professional Member\nMIPC",
    professionalStage: "Practising professional in project or related environment.",
    competenceEmphasis:
      "Practical project involvement, reporting awareness and professional reliability.",
    evidenceExpected:
      "CV, statement, role description and evidence of project-related responsibilities.",
    bestValue:
      "Post-nominal membership status and clearer professional positioning.",
    progression: "AFIPC L3, AFIPC L4 or FIPC depending on evidence.",
  },
  {
    grade: "Associate Fellow Level 3\nAFIPC L3",
    professionalStage:
      "Foundation project controls practitioner or technician level.",
    competenceEmphasis:
      "Core project controls knowledge: WBS, schedule, cost, progress, risk, change and reporting.",
    evidenceExpected:
      "CV, statement, training/CPD and examples of foundation controls understanding.",
    bestValue:
      "Recognised foundation competence and stronger early-career profile.",
    progression: "AFIPC L4 after applied experience develops.",
  },
  {
    grade: "Associate Fellow Level 4\nAFIPC L4",
    professionalStage: "Applied practitioner with live project responsibility.",
    competenceEmphasis:
      "Applied planning, cost, risk, change, forecasting, reporting, dashboards and stakeholder communication.",
    evidenceExpected:
      "CV, portfolio, anonymised work examples, professional statement and reference where available.",
    bestValue: "Professional differentiation for practitioners and consultants.",
    progression: "FIPC Level 6 when senior evidence is available.",
  },
  {
    grade: "Fellow Level 6\nFIPC",
    professionalStage:
      "Senior professional, leader, adviser, consultant or recognised expert.",
    competenceEmphasis:
      "Leadership, assurance, strategic baseline control, independent judgement, risk/change challenge, improvement and contribution to the profession.",
    evidenceExpected:
      "Senior CV, portfolio, professional statement, evidence of impact, references and review where required.",
    bestValue:
      "Highest individual IPC recognition and senior professional credibility.",
    progression:
      "Leadership, mentoring, speaking, judging, standards and thought leadership.",
  },
];

const headers = [
  "Grade",
  "Professional stage",
  "Competence emphasis",
  "Evidence expected",
  "Best value",
  "Progression",
];

export default function MembershipComparisonTable() {
  const content = useManagedSection("comparison", {
    eyebrow: "Membership Pathway",
    title: "Compare IPC Membership Grades",
    description:
      "Explore the professional position, evidence expectations and recognition associated with each IPC membership grade.",
  });

  return (
    <section
      aria-labelledby="membership-comparison-title"
      className="border-y border-background-200/70 bg-background-100 section-padding"
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

        <div
          className="reveal mt-12 overflow-hidden border border-background-300 bg-background-50 md:mt-16"
        >
          <div className="overflow-x-auto">
            <table
              className="w-full min-w-[1180px] table-fixed border-collapse text-left"
              aria-label="IPC membership grades pathway comparison"
            >
              <caption className="sr-only">
                Comparison of IPC membership grades by professional stage,
                competence emphasis, expected evidence, value and progression.
              </caption>
              <colgroup>
                <col className="w-[12%]" />
                <col className="w-[17%]" />
                <col className="w-[23%]" />
                <col className="w-[19%]" />
                <col className="w-[15%]" />
                <col className="w-[17%]" />
              </colgroup>
              <thead className="bg-background-950">
                <tr>
                  {headers.map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="border-r border-background-700/70 px-5 py-6 font-heading text-xs font-bold uppercase tracking-[0.08em] text-primary-400 last:border-r-0 lg:px-6 lg:text-sm"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pathwayRows.map((row) => (
                  <tr
                    key={row.grade}
                    className="border-t border-background-300 align-top first:border-t-0"
                  >
                    <th
                      scope="row"
                      className="whitespace-pre-line border-r border-background-300 bg-background-100 px-5 py-6 font-heading text-base font-semibold leading-relaxed text-background-950 lg:px-6 lg:py-7"
                    >
                      {row.grade}
                    </th>
                    {[
                      row.professionalStage,
                      row.competenceEmphasis,
                      row.evidenceExpected,
                      row.bestValue,
                      row.progression,
                    ].map((value, index) => (
                      <td
                        key={index}
                        className="border-r border-background-300 px-5 py-6 text-sm leading-7 text-foreground-700 last:border-r-0 lg:px-6 lg:py-7 lg:text-base"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-foreground-500 md:hidden">
          Swipe horizontally to view the full comparison.
        </p>
      </div>
    </section>
  );
}
