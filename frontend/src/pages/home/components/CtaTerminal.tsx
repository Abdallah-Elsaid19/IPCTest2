import { Link } from "react-router-dom";

export default function CtaTerminal() {
  return (
    <section className="relative bg-background-950 section-padding overflow-hidden">
      {/* ── Gold rule top ── */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />

      {/* ── Halftone map ── */}
      <div className="absolute inset-0 halftone-map opacity-40" />

      {/* ── Dot grid ── */}
      <div className="absolute inset-0 dot-grid opacity-[0.04]" />

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
            <span className="text-[10px] font-mono text-primary-400 tracking-[0.3em] uppercase block mb-6">
              Begin your professional journey
            </span>
            <h2 className="font-heading text-[clamp(2rem,4.5vw,3.5rem)] font-extrabold text-background-50 leading-[1.05] tracking-[-0.03em] mb-8">
              Recognition is<br />
              <span className="text-primary-500">earned,</span> not<br />
              given.
            </h2>
            <p className="text-sm md:text-base text-background-400 leading-[1.8] font-medium max-w-[440px] mb-10">
              Submit your evidence portfolio for independent assessment. Join a community of professionals whose competence is visible, verifiable, and respected across the sectors that matter most.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/membership"
                className="group inline-flex items-center gap-3 px-6 py-3.5 bg-primary-500 text-background-950 text-sm font-bold tracking-wide hover:bg-primary-400 transition-colors duration-400 whitespace-nowrap"
              >
                <span>Explore Membership</span>
                <i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link
                to="/contact"
                className="group inline-flex items-center gap-3 px-6 py-3.5 text-sm font-semibold text-background-300 hover:text-background-50 transition-colors duration-300 whitespace-nowrap border border-background-700/30 hover:border-primary-500/40"
              >
                <span>Contact the Institute</span>
                <i className="ri-arrow-right-line text-xs group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>

          {/* ── Right: Abstract ring compass ── */}
          <div className="lg:col-span-5 lg:col-start-8 relative hidden lg:flex items-center justify-center">
            <div className="relative w-[340px] h-[340px]">
              <svg viewBox="0 0 340 340" className="w-full h-full">
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
                <text x="170" y="166" textAnchor="middle" className="text-[10px] font-bold fill-background-50 tracking-[0.1em]" style={{ fontFamily: "var(--font-label)" }}>IPC</text>
                <text x="170" y="180" textAnchor="middle" className="text-[7px] fill-background-400 tracking-[0.15em]" style={{ fontFamily: "var(--font-label)" }}>EARNED</text>
              </svg>

              {/* ── Floating technical labels ── */}
              <div className="absolute top-[15%] right-[8%] text-right">
                <span className="text-[9px] font-mono text-primary-500/50 tracking-[0.2em] block">EVIDENCE</span>
                <span className="text-[9px] font-mono text-background-600 block">Portfolio</span>
              </div>
              <div className="absolute bottom-[20%] left-[5%]">
                <span className="text-[9px] font-mono text-primary-500/50 tracking-[0.2em] block">ASSESSMENT</span>
                <span className="text-[9px] font-mono text-background-600 block">Independent</span>
              </div>
              <div className="absolute top-[42%] right-[3%]">
                <span className="text-[9px] font-mono text-primary-500/50 tracking-[0.2em] block">RECOGNITION</span>
                <span className="text-[9px] font-mono text-background-600 block">Professional</span>
              </div>
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