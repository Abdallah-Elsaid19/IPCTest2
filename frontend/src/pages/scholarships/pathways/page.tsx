import { Link, Navigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  BriefcaseBusiness,
  Clock3,
  FileCheck2,
  GraduationCap,
  Network,
  PoundSterling,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import SEO from "@/components/seo/SEO";
import {
  isManagedItemActive,
  ManagedContentProvider,
  useManagedSection,
} from "@/components/content/ManagedContentProvider";
import { PATHWAYS, type Pathway, type PathwayId } from "../ScholarshipsGateway";

type VisualDetail = {
  accent: string;
  accentSoft: string;
  promise: string;
  themes: string[];
  evidence: string[];
  journey: string[];
};

type PathwayFunding = {
  governmentBand: string;
  ipcFund: string;
  governmentSummary: string;
  bursarySupport: string;
  bursarySummary: string;
  commitment: string;
  is_active?: boolean;
};

type PathwayDetailContent = VisualDetail & {
  id: PathwayId;
  creditNumbers: number[];
  funding: PathwayFunding;
};

const VISUAL_DETAILS: Record<PathwayId, VisualDetail> = {
  operational: {
    accent: "#d69a32",
    accentSoft: "#f4e4c6",
    promise: "Turn project information into dependable plans, credible schedules and practical performance insight.",
    themes: ["Planning systems", "Schedule confidence", "Earned value", "Operational risk", "Delivery reporting", "AI-assisted controls"],
    evidence: ["Integrated project plan", "Schedule analysis", "Earned value report", "Risk register", "Controls dashboard", "AI-assisted workflow"],
    journey: ["Build the baseline", "Test the schedule", "Measure performance", "Control risk", "Report clearly", "Improve decisions"],
  },
  strategic: {
    accent: "#8870ad",
    accentSoft: "#e7dff0",
    promise: "Connect project controls insight with programme, portfolio and organisational decision-making.",
    themes: ["Programme leadership", "Portfolio governance", "Strategic risk", "PMO maturity", "Executive reporting", "Scenario modelling"],
    evidence: ["Programme governance pack", "Portfolio prioritisation", "Strategic risk view", "PMO maturity review", "Executive dashboard", "Forecast scenario"],
    journey: ["Frame strategy", "Align programmes", "Prioritise portfolios", "Strengthen governance", "Model scenarios", "Advise leaders"],
  },
  pmo: {
    accent: "#c4862c",
    accentSoft: "#f2e1c7",
    promise: "Develop the systems, governance and assurance practices that make a PMO valuable to its organisation.",
    themes: ["PMO operating model", "Governance design", "Assurance", "Reporting systems", "Stakeholder value", "Decision support"],
    evidence: ["PMO charter", "Governance framework", "Assurance review", "Reporting catalogue", "Stakeholder map", "Improvement roadmap"],
    journey: ["Define purpose", "Design governance", "Build services", "Assure delivery", "Measure value", "Mature the PMO"],
  },
  chartered: {
    accent: "#9b7ac3",
    accentSoft: "#e9e0f2",
    promise: "Build advanced technical knowledge and professional evidence for senior recognition and strategic progression.",
    themes: ["Advanced PMO practice", "Planning and control", "Risk and quality", "Stakeholder systems", "Responsible AI", "Specialist elective"],
    evidence: ["Professional portfolio", "Controls framework", "Risk and quality review", "Stakeholder strategy", "AI governance note", "Elective evidence"],
    journey: ["Diagnose capability", "Develop technical depth", "Apply at work", "Build evidence", "Reflect professionally", "Prepare for recognition"],
  },
  apm: {
    accent: "#d69a32",
    accentSoft: "#f4e4c6",
    promise: "Create a focused foundation in practical project management and AI-enabled project controls.",
    themes: ["Project foundations", "Scope and planning", "Stakeholders", "Risk and quality", "Delivery leadership", "AI in projects"],
    evidence: ["Project brief", "Delivery plan", "Stakeholder map", "Risk log", "Progress report", "AI-assisted project output"],
    journey: ["Frame the project", "Plan delivery", "Engage people", "Manage risk", "Track progress", "Demonstrate impact"],
  },
};

const creditNumbers: Record<PathwayId, number[]> = {
  operational: [2, 1, 1, 1, 1],
  strategic: [2, 1, 1, 1, 1],
  pmo: [1, 1, 1, 1],
  chartered: [4, 1, 1],
  apm: [2, 1],
};

const PATHWAY_FUNDING: Record<PathwayId, PathwayFunding> = {
  operational: {
    governmentBand: "£6,000",
    ipcFund: "Up to £1,000",
    governmentSummary: "For eligible employed participants using the funded route. Kent Business College confirms eligibility and the applicable start-date rules.",
    bursarySupport: "Up to 50%",
    bursarySummary: "IPC Fund support may cover up to 50% of the eligible IPC Bursary Route cost where the participant is not employed or cannot make the funded-route weekly commitment.",
    commitment: "Normally employed, employer-supported and able to protect eight hours each week.",
  },
  strategic: {
    governmentBand: "£6,000",
    ipcFund: "Up to £1,000",
    governmentSummary: "For eligible employed participants using the funded route. Kent Business College confirms eligibility and the applicable start-date rules.",
    bursarySupport: "Up to 50%",
    bursarySummary: "IPC Fund support may cover up to 50% of the eligible IPC Bursary Route cost where the participant is not employed or cannot make the funded-route weekly commitment.",
    commitment: "Normally employed, employer-supported and able to protect eight hours each week.",
  },
  pmo: {
    governmentBand: "£27,000",
    ipcFund: "Up to £7,000",
    governmentSummary: "For eligible employed participants using the funded PMO route. The Government Funding Band and IPC Fund are separate contributions.",
    bursarySupport: "Up to 75%",
    bursarySummary: "Where the funded route is not suitable, the IPC Fund may support up to 75% of the eligible PMO IPC Bursary Route cost.",
    commitment: "The funded route normally requires employment, employer support and eight protected hours each week.",
  },
  chartered: {
    governmentBand: "£27,000",
    ipcFund: "Up to £7,000",
    governmentSummary: "For eligible employed participants using the funded Chartered route. The Government Funding Band and IPC Fund are separate contributions.",
    bursarySupport: "Up to 75%",
    bursarySummary: "Where the funded route is not suitable, the IPC Fund may support up to 75% of the eligible Chartered IPC Bursary Route cost.",
    commitment: "The funded route normally requires employment, employer support and eight protected hours each week.",
  },
  apm: {
    governmentBand: "£6,000",
    ipcFund: "Up to £1,000",
    governmentSummary: "For eligible employed participants using the funded APM route, subject to formal assessment and current rules.",
    bursarySupport: "Individual review",
    bursarySummary: "The IPC Bursary Route and any IPC Fund contribution are assessed individually; no fixed bursary percentage is stated.",
    commitment: "Funded-route employment, employer support and protected learning-time requirements apply.",
  },
};

const DEFAULT_PATHWAY_DETAILS: PathwayDetailContent[] = (Object.keys(VISUAL_DETAILS) as PathwayId[]).map((id) => ({
  id,
  ...VISUAL_DETAILS[id],
  creditNumbers: creditNumbers[id],
  funding: PATHWAY_FUNDING[id],
}));

const PUBLIC_PATHWAY_IDS = new Set<PathwayId>(["chartered", "pmo", "apm"]);

const creditSpanClasses: Record<number, string> = {
  1: "sm:col-span-1",
  2: "sm:col-span-2",
  3: "sm:col-span-3",
  4: "sm:col-span-4",
  5: "sm:col-span-5",
  6: "sm:col-span-6",
};

function ManagedScholarshipPathwayDetailPage() {
  const { pathwayId } = useParams();
  const pathwaysActive = useManagedSection<boolean>("pathways_active", true);
  const managedPathways = useManagedSection<Pathway[]>("pathways", PATHWAYS).filter(
    (item) => isManagedItemActive(item) && PUBLIC_PATHWAY_IDS.has(item.id),
  );
  const pathways = pathwaysActive ? managedPathways : [];
  const managedDetails = useManagedSection<PathwayDetailContent[]>("pathway_details", DEFAULT_PATHWAY_DETAILS).filter(isManagedItemActive);
  const pathway = pathways.find((item) => item.id === pathwayId);

  if (!pathwaysActive || !pathway) return <Navigate to="/scholarships" replace />;

  const detailContent = managedDetails.find((item) => item.id === pathway.id)
    ?? DEFAULT_PATHWAY_DETAILS.find((item) => item.id === pathway.id)
    ?? DEFAULT_PATHWAY_DETAILS[0];
  const detail = detailContent;
  const funding = detailContent.funding;
  const credits = detailContent.creditNumbers;
  const totalCredits = credits.reduce((sum, value) => sum + value, 0);
  return (
    <div className="overflow-hidden bg-background-50">
      <SEO
        title={`${pathway.name} | IPC Scholarships`}
        description={`${pathway.summary} Explore the credit structure, learning rhythm, funding routes and Kent Business College assessment.`}
        canonicalPath={`/scholarships/pathways/${pathway.id}`}
        keywords={[`${pathway.short} project controls pathway`, "IPC scholarship pathway", "Kent Business College pathway"]}
      />

      <section className="relative isolate overflow-hidden bg-[#10151f] pb-20 pt-28 text-background-50 md:pb-28 md:pt-36">
        <div className="absolute inset-0 dot-grid-gold opacity-15" aria-hidden="true" />
        <div className="absolute right-[-12rem] top-[-8rem] h-[34rem] w-[34rem] rounded-full border opacity-30" style={{ borderColor: detail.accent }} aria-hidden="true" />
        <div className="absolute right-[-4rem] top-0 h-[22rem] w-[22rem] rounded-full border opacity-20" style={{ borderColor: detail.accent }} aria-hidden="true" />
        <div className="container-content relative">
          <Link to="/scholarships#pathways" className="inline-flex items-center gap-2 text-sm text-background-300 transition-colors hover:text-primary-300">
            <ArrowLeft size={16} aria-hidden="true" /> Back to all pathways
          </Link>

          <div className="mt-12 grid items-end gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="reveal">
              <p className="eyebrow" style={{ color: detail.accent }}>IPC pathway guide · {pathway.stage}</p>
              <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.03] tracking-[-0.04em] sm:text-6xl sm:tracking-[-0.05em] lg:text-7xl">{pathway.name}</h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-background-200">{detail.promise}</p>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-background-400">{pathway.audience}</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a href={pathway.url} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  View at Kent Business College <ArrowRight size={16} aria-hidden="true" />
                </a>
                <a href="#structure" className="btn-secondary">Explore the structure</a>
              </div>
            </div>

            <aside className="reveal grid grid-cols-2 gap-px bg-white/15">
              {[
                [pathway.credits, "Pathway structure"],
                [pathway.duration, "Study duration"],
                [pathway.hours, pathway.hoursLabel],
              ].map(([value, label]) => (
                <div key={label} className="min-h-36 bg-[#171d28] p-5 md:p-6">
                  <p className="font-heading text-3xl font-semibold" style={{ color: detail.accent }}>{value}</p>
                  <p className="mt-3 text-xs leading-5 text-background-400">{label}</p>
                </div>
              ))}
            </aside>
          </div>
        </div>
      </section>

      <section id="structure" className="scroll-mt-24 bg-background-50 section-padding">
        <div className="container-content">
          <div className="reveal max-w-4xl">
            <p className="eyebrow text-primary-700">Credit architecture</p>
            <h2 className="mt-5 text-4xl text-background-950 md:text-5xl">See how the pathway fits together.</h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-foreground-600">{pathway.additional}</p>
          </div>

          <div className="reveal mt-12 border border-background-300 bg-[#eef0f3] p-5 md:p-8">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-6">
              {pathway.modules.map((module, index) => {
                if (!isManagedItemActive(module)) return null;
                return (
                  <article
                    key={module.name}
                    className={`min-h-44 border p-4 md:p-6 ${
                      pathway.id === "pmo"
                        ? "sm:col-span-3"
                        : creditSpanClasses[Math.round((credits[index] / totalCredits) * 6)]
                    }`}
                    style={{
                      borderColor: detail.accent,
                      backgroundColor: index === 0 ? "#10151f" : detail.accentSoft,
                      color: index === 0 ? "#fff" : "#171717",
                    }}
                  >
                    <span className="font-mono text-xs font-bold">{module.credits}</span>
                    <h3 className="mt-5 text-lg leading-6">{module.name}</h3>
                    {module.note && (
                      module.note.includes(" • ") ? (
                        <ul className={`mt-3 list-disc space-y-1 pl-4 text-xs leading-5 ${index === 0 ? "text-background-400" : "text-foreground-600"}`}>
                          {module.note.split(" • ").map((option) => <li key={option}>{option}</li>)}
                        </ul>
                      ) : (
                        <p className={`mt-3 text-xs leading-5 ${index === 0 ? "text-background-400" : "text-foreground-600"}`}>{module.note}</p>
                      )
                    )}
                  </article>
                );
              })}
            </div>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-foreground-500">
              <span>{totalCredits} credits in total</span>
              <span>Credit selections confirmed before enrolment</span>
              <span>Availability subject to assessment</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#eef0f3] section-padding">
        <div className="container-content grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="reveal">
            <p className="eyebrow text-primary-700">Capability map</p>
            <h2 className="mt-5 text-4xl leading-tight text-background-950 md:text-5xl">What you will develop.</h2>
            <p className="mt-5 text-base leading-7 text-foreground-600">The pathway connects technical learning with visible professional practice and decision-making.</p>
          </div>
          <div className="reveal relative grid gap-px bg-background-300 sm:grid-cols-2">
            {detail.themes.map((theme, index) => (
              <div key={theme} className="relative min-h-40 overflow-hidden bg-background-50 p-6">
                <span className="font-mono text-xs font-bold" style={{ color: detail.accent }}>{String(index + 1).padStart(2, "0")}</span>
                <p className="mt-7 text-lg font-semibold text-background-950">{theme}</p>
                <span className="absolute -bottom-9 -right-9 h-24 w-24 rounded-full border opacity-20" style={{ borderColor: detail.accent }} aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#10151f] section-padding text-background-50">
        <div className="container-content">
          <div className="reveal max-w-4xl">
            <p className="eyebrow" style={{ color: detail.accent }}>Applied journey</p>
            <h2 className="mt-5 text-4xl md:text-5xl">From learning to workplace evidence.</h2>
          </div>
          <ol className="reveal mt-12 grid gap-px bg-white/15 sm:grid-cols-2 lg:grid-cols-6">
            {detail.journey.map((step, index) => (
              <li key={step} className="relative min-h-44 bg-[#171d28] p-5">
                <span className="font-mono text-xs" style={{ color: detail.accent }}>{String(index + 1).padStart(2, "0")}</span>
                <p className="mt-8 text-base font-semibold">{step}</p>
                {index < detail.journey.length - 1 && <ArrowRight className="absolute bottom-5 right-5 hidden text-background-600 lg:block" size={17} aria-hidden="true" />}
              </li>
            ))}
          </ol>
          <div className="reveal mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {detail.evidence.map((item) => (
              <div key={item} className="flex items-center gap-3 border border-white/15 p-4">
                <FileCheck2 size={18} style={{ color: detail.accent }} aria-hidden="true" />
                <span className="text-sm text-background-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background-50 section-padding">
        <div className="container-content">
          <div className="reveal max-w-4xl">
            <p className="eyebrow text-primary-700">Weekly learning rhythm</p>
            <h2 className="mt-5 text-4xl text-background-950 md:text-5xl">A practical eight-hour pattern.</h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-foreground-600">
              The rhythm combines live learning, guided study and applied portfolio work. Coaching and progress-review time should be planned separately unless confirmed otherwise.
            </p>
          </div>
          <div className="reveal mt-12 grid gap-5 lg:grid-cols-[1fr_1fr_1fr]">
            {[
              [Clock3, "2h", "Live online teaching", "Tutor explanation, discussion, workshops, cases and questions."],
              [BookOpen, "3h", "Guided digital learning", "Reading, quizzes, podcasts, reflection and knowledge checks."],
              [BriefcaseBusiness, "3h", "Portfolio application", "Workplace outputs, anonymised evidence, commentary and reflection."],
            ].map(([Icon, time, title, copy], index) => {
              const RhythmIcon = Icon as typeof Clock3;
              return (
                <article key={String(title)} className="border border-background-300 p-6 md:p-8">
                  <div className="flex items-center justify-between">
                    <RhythmIcon size={26} style={{ color: detail.accent }} aria-hidden="true" />
                  <span className="inline-flex min-h-14 min-w-16 items-center justify-center bg-[#F8E6D3] px-4 font-heading text-xl font-bold text-black">
                    {String(time)}
                  </span>
                  </div>
                  <div className="mt-7 h-1 bg-background-200">
                    <div className="h-full" style={{ width: index === 0 ? "40%" : "50%", backgroundColor: detail.accent }} />
                  </div>
                  <h3 className="mt-6 text-xl text-background-950">{String(title)}</h3>
                  <p className="mt-3 text-sm leading-6 text-foreground-600">{String(copy)}</p>
                </article>
              );
            })}
          </div>
          <div className="reveal mt-8 grid gap-px bg-background-300 md:grid-cols-3">
            {[
              [Users, "Monthly", "One-hour coaching"],
              [Network, "Every 10 weeks", "Progress review"],
              [ShieldCheck, "Throughout", "Employer support and confidentiality"],
            ].map(([Icon, timing, title]) => {
              const SupportIcon = Icon as typeof Users;
              return (
                <div key={String(title)} className="flex items-center gap-4 bg-[#eef0f3] p-6">
                  <SupportIcon size={23} style={{ color: detail.accent }} aria-hidden="true" />
                  <div><p className="text-xs font-bold uppercase tracking-wide text-foreground-500">{String(timing)}</p><p className="mt-1 font-semibold text-background-950">{String(title)}</p></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#211a2d] section-padding text-background-50">
        <div className="container-content grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="reveal">
            <BrainCircuit size={32} className="text-[#c8b8dc]" aria-hidden="true" />
            <p className="mt-7 eyebrow text-[#c8b8dc]">AI and professional judgement</p>
            <h2 className="mt-5 text-4xl leading-tight md:text-5xl">Use better tools. Keep human oversight.</h2>
            <p className="mt-6 text-base leading-8 text-background-300">AI learning is positioned as a professional capability: supporting analysis, forecasting, reporting and scenarios without replacing accountable judgement.</p>
          </div>
          <div className="reveal grid gap-px bg-white/15 sm:grid-cols-2">
            {["Planning and forecasting", "Risk and pattern identification", "Automated reporting", "Scenario exploration", "Responsible data use", "Governance and human review"].map((item, index) => (
              <div key={item} className="bg-[#211a2d] p-6">
                <span className="font-mono text-xs text-[#bca9d7]">{String(index + 1).padStart(2, "0")}</span>
                <p className="mt-4 text-sm text-background-200">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isManagedItemActive(funding) && (
      <section className="bg-background-50 section-padding">
        <div className="container-content">
          <div className="reveal max-w-4xl">
            <p className="eyebrow text-primary-700">Pathway Fund</p>
            <h2 className="mt-5 text-4xl text-background-950 md:text-5xl">Explore the IPC Bursary Route.</h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-foreground-600">IPC bursary support is assessed individually and is not an automatic award.</p>
          </div>
          <div className="reveal mt-12 max-w-3xl">
            <article className="overflow-hidden border border-background-300 bg-[#f5f1f8]">
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="eyebrow text-[#655080]">IPC Bursary Route</p>
                    <h3 className="mt-3 text-2xl text-background-950">IPC Fund support</h3>
                  </div>
                  <PoundSterling className="text-[#71599b]" size={30} aria-hidden="true" />
                </div>
                <p className="mt-9 font-heading text-6xl font-semibold text-[#655080]">{funding.bursarySupport}</p>
                <p className="mt-5 text-sm leading-7 text-foreground-700">{funding.bursarySummary}</p>
                <div className="mt-7 border-t border-[#cfc1dc] pt-6">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#655080]">Who may use this route?</p>
                  <p className="mt-3 text-sm leading-6 text-foreground-600">Professionals who are not employed, are not eligible for Government Funding, or cannot commit to the funded route’s protected weekly learning time.</p>
                </div>
              </div>
            </article>
          </div>

          <div className="reveal mt-5 grid gap-px bg-background-300 md:grid-cols-3">
            {[
              [GraduationCap, "IPC Bursary Route terms", pathway.bursaryRoute],
              [Sparkles, "IPC support", pathway.ipcSupport],
              [Route, "Payment arrangement", pathway.payment],
            ].map(([Icon, title, copy]) => {
              const AccessIcon = Icon as typeof GraduationCap;
              return (
                <article key={String(title)} className="bg-background-50 p-6">
                  <AccessIcon size={22} style={{ color: detail.accent }} aria-hidden="true" />
                  <h3 className="mt-4 font-semibold text-background-950">{String(title)}</h3>
                  <p className="mt-3 text-xs leading-6 text-foreground-600">{String(copy)}</p>
                </article>
              );
            })}
          </div>
          {pathway.pathwayValue && (
            <aside className="reveal mt-5 border-l-4 p-6 md:p-8" style={{ borderColor: detail.accent, backgroundColor: detail.accentSoft }}>
              <p className="text-2xl font-semibold text-background-950">{pathway.pathwayValue}</p>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-foreground-700">{pathway.supportExample}</p>
            </aside>
          )}
          <p className="mt-6 text-xs leading-6 text-foreground-500">Funding, IPC support, payment plans and admission remain subject to formal assessment, current rules, availability and written confirmation.</p>
        </div>
      </section>
      )}

      <section className="bg-[#10151f] py-20 text-background-50 md:py-28">
        <div className="container-content grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="reveal max-w-3xl">
            <Target size={29} style={{ color: detail.accent }} aria-hidden="true" />
            <p className="mt-7 eyebrow" style={{ color: detail.accent }}>Formal next step</p>
            <h2 className="mt-5 text-4xl leading-tight md:text-6xl">Discuss {pathway.name} with Kent Business College.</h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-background-300">Kent Business College will confirm the pathway structure, funding position, timetable, employer requirements and enrolment process.</p>
          </div>
          <a href={pathway.url} target="_blank" rel="noopener noreferrer" className="btn-primary">
            Assess this pathway at Kent <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </section>
    </div>
  );
}

export default function ScholarshipPathwayDetailPage() {
  return (
    <ManagedContentProvider endpoint="/api/scholarships" slug="scholarships">
      <ManagedScholarshipPathwayDetailPage />
    </ManagedContentProvider>
  );
}
