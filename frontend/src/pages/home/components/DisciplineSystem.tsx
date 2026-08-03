import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const disciplineBackgroundImage = "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/c41914b6eabf473eb69f27db8a0ae2cd.png";

function splitDisciplineLabel(label: string) {
  if (label.length <= 16) return [label];

  const words = label.trim().split(/\s+/);
  if (words.length < 2) return [label];

  let splitAt = 1;
  let smallestDifference = Number.POSITIVE_INFINITY;
  for (let index = 1; index < words.length; index += 1) {
    const firstLineLength = words.slice(0, index).join(" ").length;
    const secondLineLength = words.slice(index).join(" ").length;
    const difference = Math.abs(firstLineLength - secondLineLength);
    if (difference < smallestDifference) {
      smallestDifference = difference;
      splitAt = index;
    }
  }

  return [words.slice(0, splitAt).join(" "), words.slice(splitAt).join(" ")];
}

const disciplines = [
  {
    id: "d1",
    label: "Governance & assurance",
    angle: 0,
    // TODO(reference-image): The icon for item 01 is cropped out and unreadable.
    icon: "",
    desc: "Support stage gates, approvals, escalation, reporting cycles and decision confidence.",
  },
  {
    id: "d2",
    label: "Scope & structures",
    angle: 60,
    // TODO(reference-image): The icon for item 02 is cropped out and unreadable.
    icon: "",
    desc: "Align WBS, CBS and coding so schedule, cost, risk and reporting describe the same project.",
  },
  {
    id: "d3",
    label: "Planning & scheduling",
    angle: 120,
    icon: "P",
    desc: "Build credible logic, maintain baselines and explain constraints, variance and recovery.",
  },
  {
    id: "d4",
    label: "Cost & forecasting",
    angle: 180,
    icon: "£",
    desc: "Turn estimates, commitments, actuals and trends into realistic forecasts and choices.",
  },
  {
    id: "d5",
    label: "Risk, change & commercial",
    angle: 240,
    icon: "R",
    desc: "Connect uncertainty, contingency, change control and defensible project records.",
  },
  {
    id: "d6",
    label: "Digital, AI & sustainability",
    angle: 300,
    icon: "AI",
    desc: "Improve insight while protecting data quality, explainability, accountability and public value.",
  },
];

export default function DisciplineSystem() {
  const content = useManagedSection("discipline_system", {
    eyebrow: "Competence framework",
    title: "Recognition built around the real work of project controls.",
    description: "The framework considers knowledge, skills, behaviour, evidence, responsibility and professional impact — not job title alone.",
    progression_title: "Progressive depth",
    progression: "The expected depth increases from awareness and supervised contribution to independent application, assurance, leadership and strategic influence.",
    levels: ["Level 3 foundation competence", "Level 4 applied practitioner judgement", "Level 6 leadership and assurance", "Evidence and professional conduct at every level"],
    items: disciplines,
  });
  const managedDisciplines = content.items.filter(isManagedItemActive).map((item, index) => ({ ...item, angle: "angle" in item ? Number(item.angle) : index * (360 / content.items.length), desc: (item as { description?: string }).description ?? item.desc }));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const active = managedDisciplines.find((d) => d.id === activeId);
  const cx = 260;
  const cy = 260;
  const outerR = 235;
  const midR = 170;
  const innerR = 100;
  const eyeR = 28;
  const activeIndex = managedDisciplines.findIndex((discipline) => discipline.id === activeId);
  const activeEndAngle = activeIndex >= 0
    ? activeIndex < managedDisciplines.length - 1
      ? managedDisciplines[activeIndex + 1].angle
      : 360
    : 0;
  const activeLookAngle = active
    ? ((active.angle + activeEndAngle) / 2 - 90) * (Math.PI / 180)
    : 0;
  const pupilTravel = active ? 12 : 0;
  const pupilOffsetX = pupilTravel * Math.cos(activeLookAngle);
  const pupilOffsetY = pupilTravel * Math.sin(activeLookAngle);

  const segmentPath = (startAngle: number, endAngle: number, r: number) => {
    const s = (startAngle - 90) * (Math.PI / 180);
    const e = (endAngle - 90) * (Math.PI / 180);
    const x1 = cx + r * Math.cos(s);
    const y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e);
    const y2 = cy + r * Math.sin(e);
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  return (
    <section ref={ref} className="relative bg-background-950 section-padding overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${disciplineBackgroundImage})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-background-950/80" aria-hidden="true" />
      {/* ── Dot grid ── */}
      <div className="absolute inset-0 dot-grid opacity-[0.05]" />

      {/* ── Halftone map ── */}
      <div className="absolute inset-0 halftone-map opacity-20" />

      {/* ── Wing-inspired outer arcs ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg viewBox="0 0 520 520" className="w-[750px] h-[750px] lg:w-[850px] lg:h-[850px] opacity-[0.07]">
          <path d="M 260 20 Q 100 260 260 500" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="0.5" />
          <path d="M 260 20 Q 140 260 260 500" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="0.3" strokeDasharray="4 12" />
          <path d="M 260 500 Q 420 260 260 20" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="0.5" />
          <path d="M 260 500 Q 380 260 260 20" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="0.3" strokeDasharray="4 12" />
        </svg>
      </div>

      {/* ── Concentric background rings ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg viewBox="0 0 520 520" className="w-[600px] h-[600px] lg:w-[700px] lg:h-[700px] opacity-25">
          <circle cx="260" cy="260" r="255" fill="none" stroke="oklch(0.685 0.132 72 / 0.06)" strokeWidth="0.5" />
          <circle cx="260" cy="260" r="220" fill="none" stroke="oklch(0.685 0.132 72 / 0.08)" strokeWidth="0.5" strokeDasharray="2 8" />
          <circle cx="260" cy="260" r="140" fill="none" stroke="oklch(0.685 0.132 72 / 0.1)" strokeWidth="0.5" strokeDasharray="4 6" />
          <circle cx="260" cy="260" r="65" fill="none" stroke="oklch(0.685 0.132 72 / 0.12)" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="container-content relative z-10">
        {/* ── Header ── */}
        <div className="flex items-center gap-4 mb-14 md:mb-20">
          <span className="text-[10px] font-mono text-primary-400 tracking-[0.3em] uppercase">{content.eyebrow}</span>
          <span className="flex-1 h-px bg-gradient-to-r from-primary-500/40 to-transparent" />
        </div>

        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
          {/* ── Left: Radial Diagram ── */}
          <div className="flex justify-center lg:col-span-7">
            <div className="relative aspect-square w-full max-w-[660px]">
              <svg viewBox="0 0 520 520" className="w-full h-full">
                {/* ── Outer decorative rings ── */}
                <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="oklch(0.685 0.132 72 / 0.1)" strokeWidth="0.5" />
                <circle cx={cx} cy={cy} r={midR} fill="none" stroke="oklch(0.685 0.132 72 / 0.15)" strokeWidth="0.5" strokeDasharray="3 9" />
                <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="oklch(0.685 0.132 72 / 0.2)" strokeWidth="1" />

                {/* ── Radial dividers ── */}
                {managedDisciplines.map((d) => {
                  const a = (d.angle - 90) * (Math.PI / 180);
                  const x = cx + outerR * Math.cos(a);
                  const y = cy + outerR * Math.sin(a);
                  return (
                    <line
                      key={`div-${d.id}`}
                      x1={cx}
                      y1={cy}
                      x2={x}
                      y2={y}
                      stroke="oklch(0.685 0.132 72 / 0.08)"
                      strokeWidth="0.5"
                    />
                  );
                })}

                {/* ── Discipline arcs ── */}
                {managedDisciplines.map((d, i) => {
                  const endAngle = i < managedDisciplines.length - 1 ? managedDisciplines[i + 1].angle : 360;
                  const isActive = activeId === d.id;
                  return (
                    <g
                      key={d.id}
                      className="cursor-pointer outline-none"
                      role="button"
                      tabIndex={0}
                      aria-label={`${d.label}: ${d.desc}`}
                      aria-pressed={isActive}
                      onClick={() => setActiveId(isActive ? null : d.id)}
                      onPointerEnter={(event) => {
                        if (event.pointerType !== "touch") setActiveId(d.id);
                      }}
                      onPointerLeave={(event) => {
                        if (event.pointerType !== "touch") setActiveId(null);
                      }}
                      onFocus={() => setActiveId(d.id)}
                      onBlur={() => setActiveId(null)}
                      style={{ touchAction: "manipulation" }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setActiveId(isActive ? null : d.id);
                        }
                      }}
                    >
                      <path
                        d={segmentPath(d.angle, endAngle, (outerR + innerR) / 2)}
                        fill="none"
                        stroke="transparent"
                        strokeWidth={outerR - innerR}
                        pointerEvents="stroke"
                      />
                      {/* ── Outer arc ── */}
                      <path
                        d={segmentPath(d.angle, endAngle, outerR)}
                        fill="none"
                        stroke={isActive ? "oklch(0.685 0.132 72 / 0.55)" : "oklch(0.685 0.132 72 / 0.15)"}
                        strokeWidth={isActive ? 2.5 : 1}
                        className="transition-all duration-500"
                      />
                      {/* ── Mid arc ── */}
                      <path
                        d={segmentPath(d.angle, endAngle, midR)}
                        fill="none"
                        stroke={isActive ? "oklch(0.685 0.132 72 / 0.4)" : "oklch(0.685 0.132 72 / 0.08)"}
                        strokeWidth={isActive ? 2 : 0.8}
                        className="transition-all duration-500"
                      />
                      {/* ── Inner arc ── */}
                      <path
                        d={segmentPath(d.angle, endAngle, innerR)}
                        fill="none"
                        stroke={isActive ? "oklch(0.685 0.132 72 / 0.3)" : "oklch(0.685 0.132 72 / 0.05)"}
                        strokeWidth={isActive ? 1.5 : 0.5}
                        className="transition-all duration-500"
                      />
                      {/* ── Active fill ── */}
                      {isActive && (
                        <path
                          d={`${segmentPath(d.angle, endAngle, outerR)} L ${cx + innerR * Math.cos((endAngle - 90) * Math.PI / 180)} ${cy + innerR * Math.sin((endAngle - 90) * Math.PI / 180)} A ${innerR} ${innerR} 0 0 0 ${cx + innerR * Math.cos((d.angle - 90) * Math.PI / 180)} ${cy + innerR * Math.sin((d.angle - 90) * Math.PI / 180)} Z`}
                          fill="oklch(0.685 0.132 72 / 0.05)"
                        />
                      )}
                      {/* ── Label ── */}
                      {(() => {
                        const midAngle = (d.angle + endAngle) / 2;
                        const a = (midAngle - 90) * (Math.PI / 180);
                        const labelR = (midR + outerR) / 2;
                        const lx = cx + labelR * Math.cos(a);
                        const ly = cy + labelR * Math.sin(a);
                        const labelLines = splitDisciplineLabel(d.label);
                        return (
                          <text
                            x={lx}
                            y={ly}
                            textAnchor="middle"
                            dominantBaseline="central"
                            className={`text-[7.5px] font-semibold uppercase fill-background-100 transition-all duration-400 ${isActive ? "text-[8px]" : ""}`}
                            style={{ fontFamily: "var(--font-label)" }}
                          >
                            {labelLines.map((line, lineIndex) => (
                              <tspan
                                key={line}
                                x={lx}
                                dy={lineIndex === 0 && labelLines.length > 1 ? "-0.55em" : lineIndex === 0 ? 0 : "1.2em"}
                              >
                                {line}
                              </tspan>
                            ))}
                          </text>
                        );
                      })()}
                    </g>
                  );
                })}

                {/* ── Owl Eye Centre Motif ── */}
                <circle cx={cx} cy={cy} r={38} fill="oklch(0.15 0 0 / 0.5)" stroke="oklch(0.685 0.132 72 / 0.3)" strokeWidth="1" />
                {/* ── Eye iris ── */}
                <circle cx={cx} cy={cy} r={eyeR} fill="oklch(0.2 0 0 / 0.7)" stroke="oklch(0.685 0.132 72 / 0.4)" strokeWidth="1.5" />
                {/* ── Pupil ── */}
                <g
                  className="pointer-events-none transition-transform duration-300 ease-out motion-reduce:transition-none"
                  style={{ transform: `translate(${pupilOffsetX}px, ${pupilOffsetY}px)` }}
                  aria-hidden="true"
                >
                  <circle cx={cx} cy={cy} r={9} fill="oklch(0.12 0 0 / 0.9)" stroke="oklch(0.685 0.132 72 / 0.25)" strokeWidth="0.5" />
                  {/* ── Eye highlight ── */}
                  <circle cx={cx} cy={cy} r={3} fill="oklch(0.685 0.132 72 / 0.5)" className={`transition-opacity duration-1000 ${visible ? "opacity-100" : "opacity-0"}`} />
                </g>

                {/* ── Inner eye ring ── */}
                <circle cx={cx} cy={cy} r={48} fill="none" stroke="oklch(0.685 0.132 72 / 0.15)" strokeWidth="0.5" strokeDasharray="3 5" />
                <circle cx={cx} cy={cy} r={54} fill="none" stroke="oklch(0.685 0.132 72 / 0.08)" strokeWidth="0.5" />

                {/* ── IPC label ── */}
                <text x={cx} y={cy - eyeR - 12} textAnchor="middle" className="text-[9px] font-bold fill-background-50 tracking-[0.15em]" style={{ fontFamily: "var(--font-label)" }}>IPC</text>
              </svg>

              {/* ── Active tooltip ── */}
              {active && (
                <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 hidden w-[min(88%,340px)] -translate-x-1/2 border border-primary-500/25 bg-background-900/95 px-6 py-4 text-center shadow-2xl backdrop-blur-md transition-all duration-300 sm:block">
                  <span className="mx-auto mb-3 block h-px w-10 bg-primary-500/60" />
                  <span className="mb-1.5 block font-heading text-sm font-bold text-primary-400">{active.label}</span>
                  <span className="block text-xs leading-relaxed text-background-300">{active.desc}</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Context ── */}
          <div className="lg:col-span-4 lg:col-start-9">
            <div className="mb-8 grid grid-cols-2 gap-2 sm:hidden" aria-label="Select a competence domain">
              {managedDisciplines.map((discipline, index) => {
                const selected = discipline.id === activeId;
                return (
                  <button
                    key={discipline.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setActiveId(selected ? null : discipline.id)}
                    className={`min-h-12 border px-3 py-2 text-left text-[11px] font-semibold leading-snug transition-colors ${selected ? "border-primary-500 bg-primary-500 text-background-950" : "border-background-700 bg-background-900/70 text-background-200"}`}
                  >
                    <span className="mb-1 block font-mono text-[9px] opacity-65">{String(index + 1).padStart(2, "0")}</span>
                    {discipline.label}
                  </button>
                );
              })}
              {active && (
                <div className="col-span-2 border border-primary-500/25 bg-background-900 p-4" role="status">
                  <strong className="block text-sm text-primary-400">{active.label}</strong>
                  <p className="mt-2 text-xs leading-relaxed text-background-300">{active.desc}</p>
                </div>
              )}
            </div>
            <h3 className="font-heading text-[clamp(1.5rem,3vw,2.5rem)] font-extrabold text-background-50 leading-[1.1] tracking-[-0.02em] mb-6">
              {content.title}
            </h3>
            <p className="text-sm md:text-base text-background-400 leading-[1.8] font-medium mb-8 max-w-[420px]">
              {content.description}
            </p>
            <div className="mb-8 border border-background-800 bg-background-900/50 p-5">
              <span className="font-heading text-sm font-semibold text-primary-400">{content.progression_title}</span>
              <p className="mt-2 text-xs leading-relaxed text-background-400">{content.progression}</p>
              <ul className="mt-4 grid gap-2 text-[11px] leading-relaxed text-background-300">
                {content.levels.map((level) => <li key={level} className="flex items-start gap-2"><i className="ri-check-line mt-0.5 text-primary-400" aria-hidden="true" />{level}</li>)}
              </ul>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-10 h-px bg-primary-500/40" />
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-background-500"><span className="sm:hidden">Tap to explore</span><span className="hidden sm:inline">Hover or focus to explore</span></span>
            </div>
            <Link
              to="/membership"
              className="group inline-flex items-center gap-3 mt-8 text-sm font-semibold text-primary-400 hover:text-primary-300 transition-colors duration-300"
            >
              <span>Explore the recognition framework</span>
              <i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
