import { useEffect, useRef, useState } from "react";

const forecastNodes = [
  { x: 10, y: 48, number: "01", label: "Data provenance", description: "Understand where information came from, who approved it and whether it is fit for purpose." },
  { x: 27, y: 43, number: "02", label: "Model validation", description: "Test outputs against known project facts, alternative methods and sensitivity analysis." },
  { x: 44, y: 46, number: "03", label: "Human accountability", description: "AI supports professional judgement; it does not replace responsibility." },
  { x: 61, y: 37, number: "04", label: "Explainability", description: "Communicate methods, assumptions, limitations and confidence in plain language." },
  { x: 78, y: 30, number: "05", label: "Confidentiality", description: "Protect employer, client, personal and commercially sensitive information." },
  { x: 95, y: 18, number: "06", label: "Bias and optimism", description: "Challenge misleading comparisons, weak assumptions and unjustified confidence." },
];

const aiModules = [
  { label: "Project controls fundamentals", confidence: "Scope, baseline, cost, schedule, risk and change", status: "01" },
  { label: "Digital controls systems", confidence: "Planning, cost, risk, EVM, BI and BIM", status: "02" },
  { label: "Data governance", confidence: "Quality, provenance, security and audit trail", status: "03" },
  { label: "AI and analytics", confidence: "Automation, anomaly detection and scenario testing", status: "04" },
  { label: "Professional judgement", confidence: "Validation, challenge and accountability", status: "05" },
];

export default function IntelligenceLayer() {
  const [visible, setVisible] = useState(false);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const linePath = forecastNodes.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const activePrinciple = activeNode === null ? null : forecastNodes[activeNode];

  return (
    <section ref={ref} className="relative bg-background-950 section-padding overflow-hidden">
      {/* ── Dot grid ── */}
      <div className="absolute inset-0 dot-grid opacity-[0.04]" />
      <div className="absolute inset-0 gold-dot-cluster opacity-30" />

      {/* ── Top rule ── */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/25 to-transparent" />

      <div className="container-content relative z-10">
        {/* ── Header ── */}
        <div className="flex items-center gap-4 mb-14 md:mb-20">
          <span className="text-[10px] font-mono text-primary-400 tracking-[0.3em] uppercase">Responsible Digital Practice</span>
          <span className="flex-1 h-px bg-gradient-to-r from-primary-500/40 to-transparent" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0">
          {/* ── Left: Statement + AI modules ── */}
          <div className="lg:col-span-5">
            <h2 className="font-heading text-[clamp(1.8rem,3.5vw,2.8rem)] font-extrabold text-background-50 leading-[1.08] tracking-[-0.03em] mb-6">
              Technology improves insight.<br />
              <span className="text-primary-400">Judgement protects</span><br />
              credibility.
            </h2>
            <p className="text-sm text-background-400 leading-[1.8] font-medium max-w-[420px] mb-10">
              IPC treats digital systems, dashboards, analytics and AI as core capabilities, supported by validation, explainability, confidentiality and human accountability.
            </p>

            {/* ── Owl oversight indicator ── */}
            <div className="flex items-center gap-4 mb-10 p-4 border border-primary-500/10 bg-background-900/50">
              <div className="w-8 h-8 flex items-center justify-center relative">
                <svg viewBox="0 0 32 32" className="w-full h-full">
                  <circle cx="16" cy="16" r="14" fill="none" stroke="oklch(0.685 0.132 72 / 0.3)" strokeWidth="0.5" />
                  <circle cx="16" cy="14" r="4" fill="oklch(0.685 0.132 72 / 0.2)" stroke="oklch(0.685 0.132 72 / 0.4)" strokeWidth="1" />
                  <circle cx="17" cy="13" r="1.5" fill="oklch(0.685 0.132 72 / 0.6)" />
                </svg>
              </div>
              <span className="text-xs text-background-300 font-medium">Judgement protects credibility.</span>
            </div>

            {/* ── AI modules ── */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-background-500 tracking-[0.2em] uppercase block mb-3">Intelligence layers</span>
              {aiModules.map((mod) => (
                <div
                  key={mod.label}
                  className="flex items-center justify-between py-3 px-4 border border-background-800/60 group hover:border-primary-500/20 transition-all duration-400 hover:bg-background-900/60"
                >
                  <span className="text-xs text-background-300 font-medium group-hover:text-background-100 transition-colors">{mod.label}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-background-500">{mod.confidence}</span>
                    <span className={`min-w-[38px] shrink-0 whitespace-nowrap px-2 py-0.5 text-center text-[9px] font-mono ${
                      Number(mod.status) % 2 !== 0
                        ? "text-emerald-400/80 border border-emerald-400/20 bg-emerald-400/5"
                        : "text-amber-400/80 border border-amber-400/20 bg-amber-400/5"
                    }`}>
                      {mod.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Forecast dashboard ── */}
          <div className="lg:col-span-6 lg:col-start-7">
            <div className="mb-6 flex items-center gap-4">
              <span className="text-[10px] font-mono text-primary-400/70 tracking-[0.2em] uppercase">Responsible Digital Practice Principles</span>
              <span className="flex-1 h-px bg-gradient-to-r from-primary-500/20 to-transparent hidden sm:block" />
            </div>

            {/* ── Chart ── */}
            <div className="relative w-full aspect-[16/10] max-w-[600px]">
              <svg viewBox="0 0 100 60" className="w-full h-full" preserveAspectRatio="none">
                {/* ── Grid ── */}
                {[10, 20, 30, 40, 50].map((y) => (
                  <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="oklch(0.685 0.132 72 / 0.05)" strokeWidth="0.5" strokeDasharray="2 6" />
                ))}
                {[0, 25, 50, 75, 100].map((x) => (
                  <line key={x} x1={x} y1="0" x2={x} y2="55" stroke="oklch(0.685 0.132 72 / 0.03)" strokeWidth="0.5" />
                ))}

                {/* ── Area fill ── */}
                <path d={`${linePath} L 95 55 L 5 55 Z`} fill="oklch(0.685 0.132 72 / 0.05)" />

                {/* ── Forecast line ── */}
                <path
                  d={linePath}
                  fill="none"
                  stroke="oklch(0.685 0.132 72 / 0.65)"
                  strokeWidth="1.5"
                  className={visible ? "animate-gold-extend" : ""}
                />

                {/* ── Data nodes ── */}
                {forecastNodes.map((p, i) => (
                  <g
                    key={p.label}
                    className="cursor-pointer outline-none"
                    role="button"
                    tabIndex={0}
                    aria-label={`${p.label}: ${p.description}`}
                    onMouseEnter={() => setActiveNode(i)}
                    onMouseLeave={() => setActiveNode(null)}
                    onFocus={() => setActiveNode(i)}
                    onBlur={() => setActiveNode(null)}
                  >
                    <title>{`${p.label}: ${p.description}`}</title>
                    <circle cx={p.x} cy={p.y} r="6" fill="transparent" />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={activeNode === i ? 3 : 1.5}
                      fill={activeNode === i ? "oklch(0.685 0.132 72)" : "oklch(0.685 0.132 72 / 0.4)"}
                      className="transition-all duration-300"
                    />
                    {activeNode === i && (
                      <>
                        <circle cx={p.x} cy={p.y} r="6" fill="none" stroke="oklch(0.685 0.132 72 / 0.25)" strokeWidth="1" className="animate-ping" style={{ animationDuration: "2.5s" }} />
                        <text x={p.x} y={p.y - 7} textAnchor="middle" className="text-[8px] fill-primary-400 font-mono">{p.number}</text>
                      </>
                    )}
                  </g>
                ))}
              </svg>
              {activePrinciple && (
                <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 w-[min(88%,360px)] -translate-x-1/2 border border-primary-500/20 bg-background-900/95 px-5 py-4 text-center shadow-2xl backdrop-blur-md">
                  <span className="mb-1.5 block font-heading text-sm font-bold text-primary-400">{activePrinciple.label}</span>
                  <span className="block text-xs leading-relaxed text-background-300">{activePrinciple.description}</span>
                </div>
              )}
            </div>

            {/* ── Chart footer ── */}
            <div className="flex justify-between mt-2">
              <span className="text-[10px] font-mono text-background-500">01</span>
              <span className="text-[10px] font-mono text-background-500">03</span>
              <span className="text-[10px] font-mono text-background-500">06</span>
            </div>

            {/* ── Legend ── */}
            <div className="mt-6 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-[2px] bg-primary-500" />
                <span className="text-[11px] text-background-400 font-medium">Digital controls systems</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-[2px] border-t border-dashed border-primary-500/50" />
                <span className="text-[11px] text-background-500 font-medium">Professional judgement</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-[2px] bg-sky-400/40" />
                <span className="text-[11px] text-background-500 font-medium">Human accountability</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />
    </section>
  );
}
