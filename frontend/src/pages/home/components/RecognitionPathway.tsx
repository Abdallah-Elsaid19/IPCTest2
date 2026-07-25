import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const grades = [
  { id: "affiliate", label: "Affiliate", level: "Entry", path: "/membership/affiliate", desc: "For those building foundational knowledge in project controls." },
  { id: "professional", label: "Professional Member", level: "MIPC", path: "/membership/professional", desc: "Recognising active professional involvement and identity in project controls." },
  { id: "af-l3", label: "Associate Fellow L3", level: "Advanced", path: "/membership/associate-fellow-l3", desc: "Leading complex project controls with strategic oversight." },
  { id: "af-l4", label: "Associate Fellow L4", level: "Senior", path: "/membership/associate-fellow-l4", desc: "Defining standards and mentoring the next generation." },
  { id: "fellow", label: "Fellow", level: "Pinnacle", path: "/membership/fellow", desc: "Recognised authority shaping the future of project controls globally." },
];

export default function RecognitionPathway() {
  const content = useManagedSection("recognition_pathway", { eyebrow: "Recognition", title: "Find the level that reflects your current contribution.", description: "Evidence, professional judgement, accountability and influence deepen as members progress.", cta_label: "View all grades", cta_url: "/membership", items: grades });
  const managedGrades = content.items.filter(isManagedItemActive);
  const [hovered, setHovered] = useState<string | null>(null);
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
    <section ref={ref} className="relative bg-background-50 section-padding overflow-hidden">
      {/* ── Dot grid ── */}
      <div className="absolute inset-0 dot-grid opacity-25" />

      {/* ── Wing-inspired graphic ── */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[400px] h-[600px] pointer-events-none opacity-[0.04]">
        <svg viewBox="0 0 400 600" className="w-full h-full">
          <path d="M 0 300 Q 200 100 400 50 Q 250 300 400 550 Q 200 500 0 300" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="0.5" />
          <path d="M 0 300 Q 180 140 380 100 Q 230 300 380 500 Q 180 460 0 300" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="0.3" strokeDasharray="3 10" />
        </svg>
      </div>

      <div className="container-content relative z-10">
        {/* ── Header ── */}
        <div className="flex items-center gap-4 mb-14 md:mb-20">
          <span className="text-[10px] font-mono text-primary-500 tracking-[0.3em] uppercase">{content.eyebrow}</span>
          <span className="flex-1 h-px bg-gradient-to-r from-primary-500/40 to-transparent" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-start">
          {/* ── Left ── */}
          <div className="lg:col-span-5 mb-12 lg:mb-0 lg:sticky lg:top-28">
            <h2 className="font-heading text-[clamp(1.8rem,3.5vw,3rem)] font-extrabold text-foreground-950 leading-[1.08] tracking-[-0.03em] mb-6">
             {content.title}
            </h2>
            <p className="text-sm md:text-base text-foreground-600 leading-[1.8] font-medium max-w-[400px] mb-8">
             {content.description}</p>
            <Link
              to={content.cta_url}
              className="group inline-flex items-center gap-2 text-sm font-semibold text-foreground-900 hover:text-primary-600 transition-colors duration-300"
            >
              <span>{content.cta_label}</span>
              <i className="ri-arrow-right-line text-xs group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>

          {/* ── Right: Wing-shaped progression ── */}
          <div className="lg:col-span-7 lg:col-start-6">
            <div className="flex flex-col gap-0">
              {managedGrades.map((grade, i) => {
                const isHovered = hovered === grade.id;
                const isAdjacent = hovered !== null && hovered !== grade.id;

                return (
                  <Link
                    key={grade.id}
                    to={grade.path}
                    className={`group relative flex items-center gap-4 md:gap-6 py-6 md:py-7 border-b border-foreground-200/40 transition-all duration-500 ${
                      isHovered ? "pl-8 bg-background-100/60" : "pl-0"
                    } ${isAdjacent ? "opacity-35" : "opacity-100"}`}
                    style={{ paddingLeft: `${Math.min(i * 20, 80) + (isHovered ? 8 : 0)}px` }}
                    onMouseEnter={() => setHovered(grade.id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {/* ── Node marker ── */}
                    <div className={`relative shrink-0 w-10 h-10 flex items-center justify-center border transition-all duration-500 ${
                      isHovered
                        ? "border-primary-500 bg-primary-500 text-background-950 scale-110"
                        : "border-foreground-300 bg-transparent text-foreground-500"
                    }`}>
                      <span className="text-xs font-mono font-bold">{String(i + 1).padStart(2, "0")}</span>
                      {isHovered && (
                        <span className="absolute -right-1.5 -top-1.5 w-3 h-3 bg-primary-500 animate-ping" style={{ animationDuration: "2s" }} />
                      )}
                    </div>

                    {/* ── Content ── */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <span className={`font-heading text-lg md:text-xl font-bold transition-colors duration-400 ${
                          isHovered ? "text-primary-600" : "text-foreground-900"
                        }`}>
                          {grade.label}
                        </span>
                        <span className="text-[10px] font-mono text-foreground-400 tracking-[0.2em] uppercase">
                          {grade.level}
                        </span>
                      </div>
                      <p className={`text-sm leading-relaxed mt-1 transition-all duration-400 max-w-[420px] ${
                        isHovered ? "text-foreground-700" : "text-foreground-500"
                      }`}>
                        {(grade as { description?: string }).description ?? grade.desc}
                      </p>
                    </div>

                    {/* ── Wing arrow ── */}
                    <div className={`flex items-center shrink-0 transition-all duration-500 ${
                      isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"
                    }`}>
                      <i className="ri-arrow-right-up-line text-primary-500 text-lg" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* ── Wing contour line ── */}
            <div className="mt-4 pt-2 hidden lg:block pointer-events-none">
              <svg viewBox="0 0 600 30" className="w-full h-8 opacity-25">
                <path d="M 20 20 Q 200 5 400 15 Q 500 20 580 8" fill="none" stroke="oklch(0.685 0.132 72 / 0.4)" strokeWidth="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 gold-rule opacity-25" />
    </section>
  );
}
