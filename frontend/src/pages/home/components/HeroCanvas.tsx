import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ResponsiveImage from "@/components/base/ResponsiveImage";
import { useManagedSection } from "@/components/content/ManagedContentProvider";

const dataAnnotations = [
  { top: "22%", left: "48%", label: "Schedule assurance" },
  { top: "44%", left: "42%", label: "Risk and uncertainty" },
  { top: "62%", left: "50%", label: "Cost baseline integrity" },
  { top: "78%", left: "46%", label: "Forecast judgement" },
];

export default function HeroCanvas() {
  const content = useManagedSection("hero", {
    announcement: "Membership and professional recognition applications are open. Join the specialist professional community for project controls.",
    eyebrow: "The Specialist Professional Home for Project Controls",
    title: "Professional recognition for the people behind credible project decisions.",
    title_lines: ["Professional recognition for", "the people behind credible", "project decisions."],
    description: "The Institute of Project Controls recognises, develops and connects the professionals who plan, measure, forecast, assure and improve project delivery.",
    details: [
      "Build a visible professional identity through membership, Associate Fellowship and Fellowship.",
      "Project controls connects scope, schedule, cost, risk, change, data and professional judgement so leaders can act with greater confidence.",
    ],
    cta_label: "Explore Membership & Recognition",
    cta_url: "/membership",
    tertiary_cta_label: "Contact the Institute",
    tertiary_cta_url: "/contact",
    image_url: "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/4f05a0f54f8c4bbbab2916e0126a28b9.webp",
    image_alt: "IPC symbol of wisdom, foresight and professional judgement",
    annotations: dataAnnotations.map((item) => item.label),
  });
  const annotations = content.annotations.map((item, index) => ({ ...dataAnnotations[index % dataAnnotations.length], label: typeof item === "string" ? item : String(item) }));
  const [scrollY, setScrollY] = useState(0);
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisible(true);
    const onScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, -rect.top / rect.height));
        setScrollY(progress);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100svh] w-full overflow-hidden bg-background-950 sm:min-h-[100dvh]"
    >
      {/* ── Dot Grid Pattern ── */}
      <div className="absolute inset-0 dot-grid-gold opacity-35" />

      {/* ── Halftone Map ── */}
      <div className="absolute inset-0 halftone-map opacity-40" />

      {/* ── Gold Radial Arc System ── */}
      <div className="absolute inset-0 hidden pointer-events-none sm:block">
        <svg viewBox="0 0 1440 900" preserveAspectRatio="none" className="w-full h-full">
          <circle cx="920" cy="340" r="280" fill="none" stroke="oklch(0.685 0.132 72 / 0.07)" strokeWidth="0.5" strokeDasharray="2 8" />
          <circle cx="920" cy="340" r="240" fill="none" stroke="oklch(0.685 0.132 72 / 0.1)" strokeWidth="0.5" />
          <circle cx="920" cy="340" r="195" fill="none" stroke="oklch(0.685 0.132 72 / 0.15)" strokeWidth="1" strokeDasharray="50 6" />
          <circle cx="920" cy="340" r="145" fill="none" stroke="oklch(0.685 0.132 72 / 0.2)" strokeWidth="1.5" strokeDasharray="70 8" />
          <circle cx="920" cy="340" r="90" fill="none" stroke="oklch(0.685 0.132 72 / 0.25)" strokeWidth="1" />
          <circle cx="920" cy="340" r="38" fill="none" stroke="oklch(0.685 0.132 72 / 0.35)" strokeWidth="1.5" />

          {/* ── Eye crosshairs ── */}
          <line x1="870" y1="340" x2="970" y2="340" stroke="oklch(0.685 0.132 72 / 0.25)" strokeWidth="0.5" strokeDasharray="4 6" />
          <line x1="920" y1="290" x2="920" y2="390" stroke="oklch(0.685 0.132 72 / 0.25)" strokeWidth="0.5" strokeDasharray="4 6" />

          {/* ── Risk quadrants around eye ── */}
          <line x1="920" y1="195" x2="920" y2="485" stroke="oklch(0.685 0.132 72 / 0.07)" strokeWidth="0.5" />
          <line x1="640" y1="340" x2="1200" y2="340" stroke="oklch(0.685 0.132 72 / 0.07)" strokeWidth="0.5" />

          {/* ── Outer partial arcs ── */}
          <path d="M 600 340 A 320 320 0 0 1 1240 340" fill="none" stroke="oklch(0.685 0.132 72 / 0.06)" strokeWidth="1" strokeDasharray="8 20" />
          <path d="M 1240 340 A 320 320 0 0 1 920 660" fill="none" stroke="oklch(0.685 0.132 72 / 0.04)" strokeWidth="0.5" strokeDasharray="3 15" />

          {/* ── Forecast curves ── */}
          <path d="M 480 520 Q 600 480 700 460 Q 800 440 900 430" fill="none" stroke="oklch(0.685 0.132 72 / 0.15)" strokeWidth="1" />
          <path d="M 480 540 Q 620 510 740 500 Q 860 490 940 475" fill="none" stroke="oklch(0.685 0.132 72 / 0.08)" strokeWidth="0.5" strokeDasharray="4 8" />

          {/* ── Wing-inspired curves from owl area ── */}
          <path d="M 920 340 Q 800 250 680 220 Q 550 190 480 200" fill="none" stroke="oklch(0.685 0.132 72 / 0.1)" strokeWidth="0.5" />
          <path d="M 920 340 Q 780 400 650 410 Q 520 420 450 400" fill="none" stroke="oklch(0.685 0.132 72 / 0.07)" strokeWidth="0.5" />
          <path d="M 920 340 Q 850 200 780 180 Q 660 150 550 180" fill="none" stroke="oklch(0.685 0.132 72 / 0.05)" strokeWidth="0.5" strokeDasharray="2 10" />

          {/* ── Data pathway lines from feathers ── */}
          <line x1="1000" y1="250" x2="1300" y2="180" stroke="oklch(0.685 0.132 72 / 0.1)" strokeWidth="0.5" strokeDasharray="2 6" />
          <line x1="1050" y1="400" x2="1350" y2="350" stroke="oklch(0.685 0.132 72 / 0.08)" strokeWidth="0.5" strokeDasharray="3 8" />
          <line x1="1030" y1="500" x2="1320" y2="550" stroke="oklch(0.685 0.132 72 / 0.06)" strokeWidth="0.5" strokeDasharray="2 10" />

          {/* ── Milestone nodes along pathways ── */}
          <circle cx="1100" cy="210" r="2" fill="oklch(0.685 0.132 72 / 0.5)" />
          <circle cx="1200" cy="190" r="1.5" fill="oklch(0.685 0.132 72 / 0.3)" />
          <circle cx="1150" cy="370" r="2" fill="oklch(0.685 0.132 72 / 0.4)" />
          <circle cx="1250" cy="360" r="1.5" fill="oklch(0.685 0.132 72 / 0.25)" />
          <circle cx="1140" cy="520" r="1.5" fill="oklch(0.685 0.132 72 / 0.35)" />
          <circle cx="1240" cy="540" r="2" fill="oklch(0.685 0.132 72 / 0.3)" />
        </svg>
      </div>

      {/* ── Owl Image — Dominant Visual Anchor ── */}
      <div
        className="absolute inset-x-0 bottom-0 h-[59%] transition-transform duration-1000 ease-out sm:inset-y-0 sm:left-auto sm:right-0 sm:h-full sm:w-[58%]"
        style={{ transform: `translateX(${scrollY * -15}px)` }}
      >
        <div className="relative w-full h-full">
          <ResponsiveImage
            src={content.image_url}
            alt={content.image_alt}
            width={1400}
            height={900}
            sizes="(max-width: 768px) 100vw, 58vw"
            priority
            className="h-full w-full object-cover object-[center_48%] sm:object-left"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-background-950/20 via-transparent to-background-950/75 sm:from-transparent sm:via-background-950/30 sm:to-background-950/85" />
          <div className="absolute inset-0 bg-gradient-to-b from-background-950 via-background-950/20 to-background-950/55 sm:from-background-950/50 sm:via-transparent sm:to-background-950/70" />
        </div>
      </div>

      {/* ── Feather-to-data transition mesh ── */}
      {/* Blend the image into the dark section below without a visible colour step. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[52%] bg-gradient-to-b from-transparent via-background-950/75 to-background-950 sm:h-[46%]"
        aria-hidden="true"
      />

      <div className="absolute inset-y-0 right-[54%] hidden w-[8%] pointer-events-none feather-texture opacity-40 sm:block" style={{
        background: "linear-gradient(90deg, oklch(var(--background-950) / 0) 0%, oklch(var(--primary-500) / 0.06) 40%, oklch(var(--primary-500) / 0.02) 100%)"
      }} />

      {/* ── Data Annotations ── */}
      {annotations.map((dp, i) => (
        <div
          key={i}
          className="absolute hidden group cursor-default z-20 sm:block"
          style={{ top: dp.top, left: dp.left }}
        >
          <div className="relative">
            <span className="block w-2 h-2 rounded-full bg-primary-500 animate-pulse-slow" />
            <span
              className="absolute inset-0 w-2 h-2 rounded-full bg-primary-500/30 animate-ping"
              style={{ animationDuration: "3s" }}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <span className="text-[9px] font-mono text-primary-400 whitespace-nowrap bg-background-950/90 px-2 py-1 border border-primary-500/20">
                {dp.label}
              </span>
            </div>
          </div>
        </div>
      ))}

      {/* ── Technical Crosshairs ── */}
      <div className="absolute top-[28%] left-[40%] hidden technical-crosshair opacity-30 z-10 sm:block" />
      <div className="absolute top-[55%] left-[36%] hidden technical-crosshair opacity-20 z-10 sm:block" />
      <div className="absolute top-[70%] left-[44%] hidden technical-crosshair opacity-25 z-10 sm:block" />

      {/* ── Headline — Integrated into composition ── */}
      <div className="relative z-20 flex min-h-[100svh] items-start px-8 pb-24 pt-[6.1rem] sm:min-h-[80dvh] sm:items-end sm:px-8 sm:pb-24 sm:pt-20 md:px-14 md:pb-32 lg:px-80 lg:pr-12 lg:pt-32">
        <div className="w-full max-w-[1050px]">
          <div
            className={`mb-5 transition-all duration-1000 sm:mb-8 md:mb-10 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ transitionDelay: "200ms" }}
          >
            {/* <span className="mb-3 hidden max-w-xl border-l-2 border-primary-500 pl-3 text-[10px] leading-relaxed text-background-300 sm:block">
              {content.announcement}
            </span> */}
            <span className="mb-5 hidden text-[13px] font-mono uppercase tracking-[0.3em] text-primary-500/70 sm:block">
              {content.eyebrow}
            </span>
            <h1 aria-label={content.title} className="max-w-[330px] font-heading text-[clamp(2.35rem,10vw,2.75rem)] font-extrabold leading-[0.95] tracking-[-0.045em] text-background-50 sm:max-w-[1050px] sm:text-[clamp(3rem,4.2vw,4.5rem)] sm:leading-[0.94] sm:tracking-[-0.035em]">
              {content.title_lines.map((line) => (
                <span key={line} className="block sm:whitespace-nowrap">{line}</span>
              ))}
            </h1>
          </div>

          <div
            className={`flex flex-col gap-4 transition-all duration-1000 sm:gap-6 md:gap-10 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ transitionDelay: "500ms" }}
          >
            <div className="mb-2 hidden w-20 gold-rule sm:block" />
            <p className="max-w-[315px] text-[13px] font-normal leading-[1.55] text-background-300 sm:max-w-[400px] sm:text-sm sm:font-medium sm:leading-loose md:text-base">
              {content.description}</p>
            {/* <p className="hidden max-w-[540px] text-xs leading-relaxed text-background-400 lg:block">{content.details.join(" ")}</p> */}
            <div className="flex flex-wrap gap-3">
              <Link
                to={content.cta_url}
                className="group inline-flex w-fit shrink-0 items-center gap-3 bg-primary-500 px-5 py-3 text-[12px] font-bold tracking-wide text-background-950 transition-colors duration-400 hover:bg-primary-400 sm:text-sm"
              >
                <span>{content.cta_label}</span>
                <i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link to="/contact" className="inline-flex min-h-[46px] items-center border border-background-500 px-5 text-xs font-semibold text-background-50 transition-colors hover:border-primary-400 hover:text-primary-300">{content.tertiary_cta_label}</Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Edge ── */}
      <div className="absolute inset-x-0 bottom-20 z-20 hidden sm:block">
        <div className="h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
        <div className="flex items-center justify-between px-8 md:px-14 lg:px-20 py-3">
          <span className="text-[9px] font-mono text-background-500 tracking-[0.2em] uppercase">
            Scroll
          </span>
          <span className="text-[9px] font-mono text-background-600 tracking-[0.2em] uppercase">
            Discover
          </span>
        </div>
      </div>
      <div className="absolute inset-x-8 bottom-5 z-20 flex items-center gap-4 sm:hidden">
        <span className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-background-600/60">
          <span className="h-1.5 w-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_oklch(var(--primary-500))]" />
        </span>
        <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-background-300">Scroll</span>
        <span className="h-5 w-px bg-background-700/70" />
        <span className="whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.28em] text-primary-500">Focus • Control • Impact</span>
        <span className="h-px min-w-4 flex-1 bg-background-700/50" />
      </div>
    </section>
  );
}
