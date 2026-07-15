import { useEffect, useRef, useState } from "react";

const metrics = [
  { value: "1,200+", label: "Recognised Professionals" },
  { value: "47", label: "Countries Represented" },
  { value: "5", label: "Recognition Grades" },
  { value: "7", label: "Technical Disciplines" },
];

export default function CommunityMetrics() {
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

  return (
    <section ref={ref} className="relative bg-background-950 section-padding overflow-hidden">
      {/* ── Halftone map ── */}
      <div className="absolute inset-0 halftone-map opacity-35" />

      {/* ── Concentric ring composition ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg viewBox="0 0 800 800" className="w-[800px] h-[800px] lg:w-[900px] lg:h-[900px] opacity-[0.06]">
          <circle cx="400" cy="400" r="380" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="0.5" />
          <circle cx="400" cy="400" r="320" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="0.5" strokeDasharray="3 12" />
          <circle cx="400" cy="400" r="250" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="0.5" strokeDasharray="6 6" />
          <circle cx="400" cy="400" r="170" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="1" strokeDasharray="2 20" />
          <circle cx="400" cy="400" r="80" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="1.5" />
          {/* ── Radial lines ── */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const rad = (deg - 90) * (Math.PI / 180);
            return (
              <line
                key={deg}
                x1={400 + 80 * Math.cos(rad)}
                y1={400 + 80 * Math.sin(rad)}
                x2={400 + 380 * Math.cos(rad)}
                y2={400 + 380 * Math.sin(rad)}
                stroke="oklch(0.685 0.132 72 / 0.5)"
                strokeWidth="0.3"
                strokeDasharray="2 8"
              />
            );
          })}
        </svg>
      </div>

      <div className="container-content relative z-10">
        {/* ── Header ── */}
        <div className="flex items-center gap-4 mb-14 md:mb-20">
          <span className="text-[10px] font-mono text-primary-400 tracking-[0.3em] uppercase">Community</span>
          <span className="flex-1 h-px bg-gradient-to-r from-primary-500/40 to-transparent" />
        </div>

        <div className="text-center mb-14">
          <h2 className="font-heading text-[clamp(2rem,4.5vw,3.5rem)] font-extrabold text-background-50 leading-[1.05] tracking-[-0.03em]">
            A <span className="text-primary-500">growing</span> professional community.
          </h2>
        </div>

        {/* ── Metric nodes ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className={`relative flex flex-col items-center text-center group transition-all duration-700 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              {/* ── Ring accent ── */}
              <div className="relative mb-5 w-20 h-20 flex items-center justify-center">
                <svg viewBox="0 0 80 80" className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-105">
                  <circle cx="40" cy="40" r="36" fill="none" stroke="oklch(0.685 0.132 72 / 0.12)" strokeWidth="0.5" />
                  <circle cx="40" cy="40" r="30" fill="none" stroke="oklch(0.685 0.132 72 / 0.2)" strokeWidth="1" strokeDasharray={`${30 + i * 5} ${10 - i}`} className="transition-all duration-700 group-hover:stroke-primary-400/50" />
                  <circle cx="40" cy="40" r="20" fill="none" stroke="oklch(0.685 0.132 72 / 0.1)" strokeWidth="0.5" />
                </svg>
              </div>
              <span className="font-heading text-3xl md:text-4xl font-extrabold text-background-50 tracking-tight mb-2 group-hover:text-primary-400 transition-colors duration-400">
                {m.value}
              </span>
              <span className="text-xs md:text-sm text-background-400 font-medium leading-tight max-w-[160px]">
                {m.label}
              </span>
              {/* ── Gold dot cluster on hover ── */}
              <span className={`absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary-500 rounded-full transition-all duration-500 ${visible ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: `${i * 150 + 400}ms` }} />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
    </section>
  );
}