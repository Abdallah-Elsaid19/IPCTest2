import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const pillars = [
  { num: "01", label: "Competence-based recognition framework", detail: "Independent evidence assessment against defined standards." },
  { num: "02", label: "Global professional community", detail: "Practitioners across energy, infrastructure, rail, nuclear and defence." },
  { num: "03", label: "Continuous professional development", detail: "Structured learning pathways mapped to recognition grades." },
];

export default function InstitutionAuthority() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

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

  return (
    <section ref={ref} className="relative bg-background-50 section-padding overflow-hidden">
      {/* ── Dot grid ── */}
      <div className="absolute inset-0 dot-grid opacity-25" />

      {/* ── Large wing-inspired arc ── */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none opacity-[0.04]">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          <path d="M 400 0 Q 200 200 400 400" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="0.5" />
          <path d="M 400 20 Q 220 200 400 380" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="0.5" />
          <path d="M 400 40 Q 240 200 400 360" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="0.5" />
          <path d="M 400 60 Q 260 200 400 340" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="0.5" />
          <path d="M 400 80 Q 280 200 400 320" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="0.3" />
        </svg>
      </div>

      {/* ── Gold corner accent ── */}
      <div className="absolute top-0 right-0 w-40 h-40 border-t border-r border-primary-500/15 pointer-events-none" />

      <div className="container-content relative z-10">
        {/* ── Top annotation ── */}
        <div className="flex items-center gap-4 mb-16 md:mb-20">
          <span className="text-[10px] font-mono text-primary-500 tracking-[0.3em] uppercase">The Institute</span>
          <span className="flex-1 h-px bg-gradient-to-r from-primary-500/40 to-transparent" />
        </div>

        {/* ── Asymmetrical grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* ── Left: Statement ── */}
          <div className="lg:col-span-7 lg:pr-16 xl:pr-24">
            <h2 className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-extrabold text-foreground-950 leading-[1.05] tracking-[-0.03em] mb-8">
              Setting the standard for
              <span className="text-primary-600"> project controls</span>{" "}
              professionals worldwide.
            </h2>

            <div className="w-16 h-[2px] bg-primary-500 mb-8" />

            <div className="max-w-[540px]">
              <p className="text-base md:text-lg text-foreground-700 leading-[1.8] font-medium mb-6">
                The Institute recognises individual competence through an evidence-based framework. Every grade is earned — not awarded. This ensures that IPC recognition carries genuine professional weight across the sectors where project controls is most critical.
              </p>
              <p className="text-sm text-foreground-500 leading-[1.8] mb-10">
                Our community spans energy, infrastructure, rail, nuclear, construction, defence and transport — the disciplines where precision, foresight, and technical authority define success.
              </p>

              <Link
                to="/about"
                className="group inline-flex items-center gap-3 text-sm font-semibold text-foreground-900 hover:text-primary-600 transition-colors duration-300"
              >
                <span className="w-8 h-[1px] bg-foreground-400 group-hover:bg-primary-500 group-hover:w-12 transition-all duration-400" />
                <span>About the Institute</span>
                <i className="ri-arrow-right-line text-foreground-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all duration-300 text-xs" />
              </Link>
            </div>
          </div>

          {/* ── Right: Wing-layered image + pillars ── */}
          <div className="lg:col-span-5 mt-14 lg:mt-0">
            <div className="relative">
              {/* ── Offset image with wing curve overlay ── */}
              <div className="relative ml-8 lg:ml-0 lg:-mr-8">
                <div className="relative overflow-hidden editorial-mask">
                  <img
            loading="lazy"
            decoding="async"
                    src="https://readdy.ai/api/search-image?query=Close-up%20editorial%20shot%20of%20precision%20structural%20steel%20framework%20on%20a%20major%20British%20infrastructure%20project%20deep%20charcoal%20shadows%20warm%20golden%20light%20highlighting%20bolt%20patterns%20and%20weld%20lines%20architectural%20geometry%20industrial%20precision%20monochrome%20tones%20with%20subtle%20amber%20accents%20no%20people&width=800&height=1000&seq=ipc-authority-img-2026&orientation=portrait"
                    alt="Structural precision engineering — British infrastructure steel framework"
                    className="w-full aspect-[4/5] object-cover object-top transition-transform duration-1000 ease-out hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background-950/40 to-transparent" />
                </div>

                {/* ── Wing-inspired curve overlay on image ── */}
                <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none opacity-20">
                  <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-full h-full">
                    <path d="M 0 100 Q 100 20 200 60 Q 300 100 400 50" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="0.5" />
                    <path d="M 0 90 Q 120 30 200 70 Q 280 110 400 60" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="0.3" strokeDasharray="3 6" />
                  </svg>
                </div>

                {/* ── Gold corner ── */}
                <div className="absolute top-0 right-0 w-14 h-14 border-t border-r border-primary-500/35" />
              </div>

              {/* ── Pillar annotation rail ── */}
              <div className="absolute -left-4 lg:-left-8 top-8 bottom-8 flex flex-col justify-center gap-5">
                {pillars.map((p, i) => (
                  <div
                    key={p.num}
                    className={`flex items-start gap-3 transition-all duration-700 ${
                      visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                    }`}
                    style={{ transitionDelay: `${i * 150}ms` }}
                  >
                    <span className="text-[10px] font-mono text-primary-500 w-6 text-right shrink-0 mt-0.5">{p.num}</span>
                    <span className="w-2 h-[1px] bg-primary-500/40 mt-2 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[11px] text-foreground-600 font-semibold leading-tight block">{p.label}</span>
                      <span className="text-[10px] text-foreground-400 leading-relaxed block mt-0.5">{p.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Bottom metadata ── */}
            <div className="flex items-center gap-6 mt-8 pt-6 border-t border-foreground-200/40">
              <div>
                <span className="text-[10px] font-mono text-foreground-400 tracking-[0.2em] uppercase block mb-1">Established</span>
                <span className="text-sm font-bold text-foreground-900">2024</span>
              </div>
              <div className="w-px h-8 bg-foreground-200/40" />
              <div>
                <span className="text-[10px] font-mono text-foreground-400 tracking-[0.2em] uppercase block mb-1">Grades</span>
                <span className="text-sm font-bold text-foreground-900">Five</span>
              </div>
              <div className="w-px h-8 bg-foreground-200/40" />
              <div>
                <span className="text-[10px] font-mono text-foreground-400 tracking-[0.2em] uppercase block mb-1">Reach</span>
                <span className="text-sm font-bold text-foreground-900">International</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom gold rule ── */}
      <div className="absolute bottom-0 left-0 right-0 gold-rule opacity-30" />
    </section>
  );
}