import { useState } from "react";
import { Link } from "react-router-dom";

interface ApplicationStep {
  id: string;
  title: string;
  description: string;
  position: string;
}

const applicationSteps: ApplicationStep[] = [
  {
    id: "01",
    title: "Choose your pathway",
    description: "Identify the professional grade that best reflects your current experience and level of responsibility.",
    position: "left-1/2 top-0 -translate-x-1/2",
  },
  {
    id: "02",
    title: "Prepare your evidence",
    description: "Provide relevant qualifications, experience and evidence of professional competence.",
    position: "right-0 top-[26%]",
  },
  {
    id: "03",
    title: "Submit your application",
    description: "Complete the application and submit the required supporting documents for review.",
    position: "bottom-[8%] right-[10%]",
  },
  {
    id: "04",
    title: "Professional assessment",
    description: "Your application is assessed proportionately against the relevant professional requirements.",
    position: "bottom-[8%] left-[10%]",
  },
  {
    id: "05",
    title: "Recognition",
    description: "Approved applicants receive their professional grade, digital credential and title-use guidance.",
    position: "left-0 top-[26%]",
  },
];

export default function CtaTerminal() {
  const [activeStep, setActiveStep] = useState(4);

  return (
    <section className="relative bg-background-50 section-padding overflow-hidden">
      {/* ── Gold rule top ── */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />

      {/* ── Halftone map ── */}
      <div className="absolute inset-0 halftone-map opacity-10" />

      {/* ── Dot grid ── */}
      <div className="absolute inset-0 dot-grid opacity-20" />

      {/* ── Massive owl ring composition ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg viewBox="0 0 600 600" className="w-[650px] h-[650px] lg:w-[750px] lg:h-[750px] opacity-[0.06]">
          <circle cx="300" cy="300" r="290" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="0.5" />
          <circle cx="300" cy="300" r="260" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="0.5" strokeDasharray="2 10" />
          <circle cx="300" cy="300" r="220" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="1" strokeDasharray="80 10" />
          <circle cx="300" cy="300" r="170" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="0.5" />
          <circle cx="300" cy="300" r="110" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="1" strokeDasharray="4 16" />
          <circle cx="300" cy="300" r="50" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="1.5" />

          {/* ── Radial lines ── */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
            const rad = (deg - 90) * (Math.PI / 180);
            return (
              <line
                key={deg}
                x1={300 + 50 * Math.cos(rad)}
                y1={300 + 50 * Math.sin(rad)}
                x2={300 + 290 * Math.cos(rad)}
                y2={300 + 290 * Math.sin(rad)}
                stroke="oklch(0.685 0.132 72 / 0.5)"
                strokeWidth="0.3"
              />
            );
          })}

          {/* ── Inner owl eye representation ── */}
          <ellipse cx="300" cy="300" rx="22" ry="26" fill="none" stroke="oklch(0.685 0.132 72 / 0.3)" strokeWidth="1" />
          <circle cx="300" cy="300" r="8" fill="oklch(0.685 0.132 72 / 0.15)" stroke="oklch(0.685 0.132 72 / 0.2)" strokeWidth="0.5" />
          <circle cx="302" cy="298" r="2.5" fill="oklch(0.685 0.132 72 / 0.3)" />
        </svg>
      </div>

      {/* ── Wing-inspired decorative arcs ── */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] pointer-events-none opacity-[0.03]">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          <path d="M 400 0 Q 200 200 400 400" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="0.5" />
          <path d="M 400 30 Q 220 200 400 370" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="0.3" />
          <path d="M 400 60 Q 240 200 400 340" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="0.2" />
        </svg>
      </div>

      <div className="container-content relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0 items-center">
          {/* ── Left: Statement ── */}
          <div className="lg:col-span-6">
            <span className="text-[10px] font-mono text-primary-600 tracking-[0.3em] uppercase block mb-6">
              Evidence-based application
            </span>
            <h2 className="font-heading text-[clamp(2rem,4.5vw,3.5rem)] font-extrabold text-foreground-950 leading-[1.05] tracking-[-0.03em] mb-8">
              A clear route to<br />
              <span className="text-primary-500">professional</span><br />
              recognition.
            </h2>
            <p className="text-sm md:text-base text-foreground-600 leading-[1.8] font-medium max-w-[440px] mb-10">
              Every application should be assessed proportionately, consistently and with respect for the applicant’s current level of responsibility.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/membership"
                className="group inline-flex max-w-full items-center justify-center gap-3 bg-primary-500 px-5 py-3.5 text-center text-sm font-bold tracking-wide text-background-950 transition-colors duration-400 hover:bg-primary-400 sm:px-6"
              >
                <span>Find your starting grade</span>
                <i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>

          {/* ── Right: Abstract ring compass ── */}
          <div className="relative flex items-center justify-center lg:col-span-5 lg:col-start-8">
            <div className="relative h-[340px] w-full max-w-[480px] sm:h-[400px]">
              <svg viewBox="0 0 340 340" className="absolute inset-0 h-full w-full">
                <circle cx="170" cy="170" r="155" fill="none" stroke="oklch(0.685 0.132 72 / 0.06)" strokeWidth="0.5" strokeDasharray="1 5" />
                <circle cx="170" cy="170" r="135" fill="none" stroke="oklch(0.685 0.132 72 / 0.1)" strokeWidth="0.5" />
                <circle cx="170" cy="170" r="110" fill="none" stroke="oklch(0.685 0.132 72 / 0.18)" strokeWidth="1.5" strokeDasharray="60 8" />
                <circle cx="170" cy="170" r="80" fill="none" stroke="oklch(0.685 0.132 72 / 0.12)" strokeWidth="0.5" />
                <circle cx="170" cy="170" r="45" fill="none" stroke="oklch(0.685 0.132 72 / 0.22)" strokeWidth="1" />

                {/* ── Radar arcs ── */}
                {[0, 90, 180, 270].map((deg) => {
                  const rad = (deg - 90) * (Math.PI / 180);
                  const x = 170 + 45 * Math.cos(rad);
                  const y = 170 + 45 * Math.sin(rad);
                  const x2 = 170 + 155 * Math.cos(rad);
                  const y2 = 170 + 155 * Math.sin(rad);
                  return (
                    <line
                      key={deg}
                      x1={x}
                      y1={y}
                      x2={x2}
                      y2={y2}
                      stroke="oklch(0.685 0.132 72 / 0.08)"
                      strokeWidth="0.5"
                    />
                  );
                })}

                {/* ── Centre ── */}
                <circle cx="170" cy="170" r="16" fill="oklch(0.685 0.132 72 / 0.12)" stroke="oklch(0.685 0.132 72 / 0.35)" strokeWidth="1" />
                <text x="170" y="166" textAnchor="middle" className="text-[10px] font-bold fill-foreground-950 tracking-[0.1em]" style={{ fontFamily: "var(--font-label)" }}>IPC</text>
                <text x="170" y="180" textAnchor="middle" className="text-[7px] fill-foreground-500 tracking-[0.15em]" style={{ fontFamily: "var(--font-label)" }}>ROUTE</text>
              </svg>

              {/* ── Floating technical labels ── */}
              {applicationSteps.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  className={`absolute z-20 flex h-11 w-11 items-center justify-center rounded-full border font-mono text-[10px] font-bold shadow-sm transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background-50 ${step.position} ${
                    activeStep === index
                      ? "scale-110 border-primary-500 bg-primary-500 text-background-950 shadow-lg"
                      : "border-primary-500/35 bg-background-50 text-primary-700 hover:border-primary-500/75"
                  }`}
                  aria-label={`${step.title}: ${step.description}`}
                  aria-pressed={activeStep === index}
                  onMouseEnter={() => setActiveStep(index)}
                  onFocus={() => setActiveStep(index)}
                  onClick={() => setActiveStep(index)}
                >
                  {step.id}
                </button>
              ))}

              <div
                className="absolute left-1/2 top-1/2 z-10 w-[min(72vw,320px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-foreground-200/70 bg-background-100 px-6 py-6 text-left shadow-[0_18px_50px_rgba(66,48,31,0.14)]"
                aria-live="polite"
              >
                <div key={applicationSteps[activeStep].id} className="cta-step-content animate-fade-in">
                  <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-primary-700">
                    Step {activeStep + 1} of {applicationSteps.length}
                  </span>
                  <span className="mt-3 block font-heading text-xl font-bold leading-tight text-primary-700">
                    {applicationSteps[activeStep].title}
                  </span>
                  <span className="mt-3 block text-sm leading-relaxed text-foreground-600">
                    {applicationSteps[activeStep].description}
                  </span>
                </div>
                <div className="mt-5 h-1 overflow-hidden rounded-full bg-primary-500/15">
                  <span
                    className="cta-step-progress block h-full rounded-full bg-primary-500 transition-[width] duration-500 ease-out"
                    style={{ width: `${((activeStep + 1) / applicationSteps.length) * 100}%` }}
                  />
                </div>
              </div>

              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.2em] text-foreground-500">
                <span className="sm:hidden">Tap to explore</span><span className="hidden sm:inline">Hover or select to explore</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom rule ── */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />
      </div>
    </section>
  );
}
