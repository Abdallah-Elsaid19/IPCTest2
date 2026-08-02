import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const grades = [
  { id: "affiliate", label: "Affiliate Member", level: "AffIPC", path: "/membership/affiliate", desc: "For students, graduates, apprentices, career changers and people beginning a project controls journey." },
  { id: "professional", label: "Professional Member", level: "MIPC", path: "/membership/professional", desc: "For practising professionals in project controls and related delivery roles." },
  { id: "af-l3", label: "Associate Fellow Level 3", level: "AFIPC L3", path: "/membership/associate-fellow-l3", desc: "Foundation recognition for technician-level knowledge, application and professional conduct." },
  { id: "af-l4", label: "Associate Fellow Level 4", level: "AFIPC L4", path: "/membership/associate-fellow-l4", desc: "Applied practitioner recognition for professionals using project controls methods on live projects." },
  { id: "fellow", label: "Fellow Level 6", level: "FIPC", path: "/membership/fellow", desc: "Senior recognition for leaders, managers, consultants, assurance specialists and recognised experts." },
];

export default function RecognitionPathway() {
  const content = useManagedSection("recognition_pathway", {
    eyebrow: "Membership & professional recognition",
    title: "A visible pathway from entering the profession to senior Fellowship.",
    description: "Apply at the level that reflects your current evidence. Progress as your competence, responsibility, judgement and contribution grow.",
    cta_label: "View the Full Recognition Framework",
    cta_url: "/membership",
    secondary_cta_label: "Ask Which Grade Fits",
    secondary_cta_url: "/information-session",
    items: grades,
  });
  const managedGrades = content.items.filter(isManagedItemActive);
  const [hovered, setHovered] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(() => undefined, { threshold: 0.2 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden bg-background-50 section-padding">
      <div className="absolute inset-0 dot-grid opacity-25" />
      <div className="pointer-events-none absolute left-0 top-1/2 h-[600px] w-[400px] -translate-y-1/2 opacity-[0.04]">
        <svg viewBox="0 0 400 600" className="h-full w-full">
          <path d="M 0 300 Q 200 100 400 50 Q 250 300 400 550 Q 200 500 0 300" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="0.5" />
          <path d="M 0 300 Q 180 140 380 100 Q 230 300 380 500 Q 180 460 0 300" fill="none" stroke="oklch(0.685 0.132 72)" strokeWidth="0.3" strokeDasharray="3 10" />
        </svg>
      </div>

      <div className="container-content relative z-10">
        <div className="mb-14 flex items-center gap-4 md:mb-20">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary-500">{content.eyebrow}</span>
          <span className="h-px flex-1 bg-gradient-to-r from-primary-500/40 to-transparent" />
        </div>

        <div className="grid grid-cols-1 items-start gap-y-12 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-0 xl:gap-x-16">
          <div className="mb-12 lg:sticky lg:top-28 lg:col-span-5 lg:mb-0">
            <h2 className="mb-6 font-heading text-[clamp(1.8rem,3.5vw,3rem)] font-extrabold leading-[1.08] tracking-[-0.03em] text-foreground-950">
              {content.title}
            </h2>
            <p className="mb-8 max-w-[400px] text-sm font-medium leading-[1.8] text-foreground-600 md:text-base">{content.description}</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link to={content.cta_url} className="group inline-flex items-center gap-2 text-sm font-semibold text-foreground-900 transition-colors hover:text-primary-600">
                <span>{content.cta_label}</span>
                <i className="ri-arrow-right-line text-xs transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to={content.secondary_cta_url} className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 transition-colors hover:text-primary-600">
                {content.secondary_cta_label}
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <div className="flex flex-col">
              {managedGrades.map((grade, index) => {
                const isHovered = hovered === grade.id;
                const isAdjacent = hovered !== null && hovered !== grade.id;
                return (
                  <Link
                    key={grade.id}
                    to={grade.path}
                    className={`group relative flex items-center gap-4 border-b border-foreground-200/40 py-6 transition-all duration-500 md:gap-6 md:py-7 ${
                      isHovered ? "bg-background-100/60" : ""
                    } ${isAdjacent ? "opacity-35" : "opacity-100"}`}
                    onMouseEnter={() => setHovered(grade.id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center border transition-all duration-500 ${
                      isHovered ? "scale-110 border-primary-500 bg-primary-500 text-background-950" : "border-foreground-300 bg-transparent text-foreground-500"
                    }`}>
                      <span className="font-mono text-xs font-bold">{String(index + 1).padStart(2, "0")}</span>
                      {isHovered && <span className="absolute -right-1.5 -top-1.5 h-3 w-3 animate-ping bg-primary-500" style={{ animationDuration: "2s" }} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-3">
                        <span className={`font-heading text-lg font-bold transition-colors md:text-xl ${isHovered ? "text-primary-600" : "text-foreground-900"}`}>{grade.label}</span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground-400">{grade.level}</span>
                      </div>
                      <p className={`mt-1 max-w-[420px] text-sm leading-relaxed transition-all ${isHovered ? "text-foreground-700" : "text-foreground-500"}`}>
                        {(grade as { description?: string }).description ?? grade.desc}
                      </p>
                    </div>
                    <div className={`flex shrink-0 items-center transition-all duration-500 ${isHovered ? "translate-x-0 opacity-100" : "-translate-x-3 opacity-0"}`}>
                      <i className="ri-arrow-right-up-line text-lg text-primary-500" />
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="pointer-events-none mt-4 hidden pt-2 lg:block">
              <svg viewBox="0 0 600 30" className="h-8 w-full opacity-25">
                <path d="M 20 20 Q 200 5 400 15 Q 500 20 580 8" fill="none" stroke="oklch(0.685 0.132 72 / 0.4)" strokeWidth="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 gold-rule opacity-25" />
    </section>
  );
}
