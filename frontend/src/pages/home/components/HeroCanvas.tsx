import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ResponsiveImage from "@/components/base/ResponsiveImage";

const dataAnnotations = [
  { top: "22%", left: "48%", label: "Schedule Confidence 97%" },
  { top: "44%", left: "42%", label: "Risk Exposure — Tier 1" },
  { top: "62%", left: "50%", label: "Cost Baseline ±1.8%" },
  { top: "78%", left: "46%", label: "EAC Forecast £312m" },
];

export default function HeroCanvas() {
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
      className="relative w-full min-h-[100dvh] bg-background-950 overflow-hidden"
    >
      {/* ── Dot Grid Pattern ── */}
      <div className="absolute inset-0 dot-grid-gold opacity-35" />

      {/* ── Halftone Map ── */}
      <div className="absolute inset-0 halftone-map opacity-40" />

      {/* ── Gold Radial Arc System ── */}
      <div className="absolute inset-0 pointer-events-none">
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
        className="absolute top-0 right-0 w-[58%] h-full transition-transform duration-1000 ease-out"
        style={{ transform: `translateX(${scrollY * -15}px)` }}
      >
        <div className="relative w-full h-full">
          <ResponsiveImage
            src="https://readdy.ai/api/search-image?query=Highly%20detailed%20realistic%20extreme%20close-up%20portrait%20of%20a%20majestic%20owl%20with%20one%20large%20piercing%20amber-gold%20eye%20clearly%20visible%20intricate%20layered%20feather%20textures%20in%20charcoal%20grey%20and%20warm%20brown%20tones%20the%20feathers%20gradually%20dissolve%20into%20abstract%20geometric%20dot%20patterns%20toward%20the%20edges%20deep%20black%20background%20with%20subtle%20radial%20rings%20dramatic%20side%20lighting%20casting%20architectural%20shadows%20the%20owl%20appears%20as%20an%20institutional%20symbol%20of%20wisdom%20intelligence%20and%20foresight%20editorial%20photography%20high%20contrast%20moody%20atmosphere&width=1400&height=900&seq=ipc-owl-hero-2026&orientation=landscape"
            alt="IPC - Institute of Project Controls symbol of wisdom, foresight and professional judgement"
            width={1400}
            height={900}
            sizes="(max-width: 768px) 100vw, 58vw"
            priority
            className="w-full h-full object-cover object-left"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-background-950/30 to-background-950/85" />
          <div className="absolute inset-0 bg-gradient-to-b from-background-950/50 via-transparent to-background-950/70" />
        </div>
      </div>

      {/* ── Feather-to-data transition mesh ── */}
      <div className="absolute inset-y-0 right-[54%] w-[8%] pointer-events-none feather-texture opacity-40" style={{
        background: "linear-gradient(90deg, oklch(var(--background-950) / 0) 0%, oklch(var(--primary-500) / 0.06) 40%, oklch(var(--primary-500) / 0.02) 100%)"
      }} />

      {/* ── Data Annotations ── */}
      {dataAnnotations.map((dp, i) => (
        <div
          key={i}
          className="absolute group cursor-default z-20"
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
      <div className="absolute top-[28%] left-[40%] technical-crosshair opacity-30 z-10" />
      <div className="absolute top-[55%] left-[36%] technical-crosshair opacity-20 z-10" />
      <div className="absolute top-[70%] left-[44%] technical-crosshair opacity-25 z-10" />

      {/* ── Headline — Integrated into composition ── */}
      <div className="relative z-20 flex items-end min-h-[100dvh] pb-24 md:pb-32 px-8 md:px-14 lg:px-20 pr-6 md:pr-12">
        <div className="w-full max-w-[600px]">
          <div
            className={`mb-8 md:mb-10 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ transitionDelay: "200ms" }}
          >
            <span className="text-[10px] font-mono text-primary-500/70 tracking-[0.3em] uppercase block mb-5">
              Institute of Project Controls
            </span>
            <h1 className="font-heading text-[clamp(2.5rem,6vw,5.5rem)] font-extrabold text-background-50 leading-[0.95] tracking-[-0.03em]">
              Evidence-led<br />
              <span className="text-primary-500">professional</span><br />
              <span className="text-background-300">judgement.</span>
            </h1>
          </div>

          <div
            className={`flex flex-col sm:flex-row sm:items-end gap-6 md:gap-10 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ transitionDelay: "500ms" }}
          >
            <div className="w-20 gold-rule mb-2 sm:mb-0 sm:self-end" />
            <p className="text-sm md:text-base text-background-400 max-w-[400px] leading-[1.7] font-medium">
              The institution for professionals who plan, control and deliver the world&rsquo;s most complex projects — from nuclear energy to national infrastructure.
            </p>
            <Link
              to="/membership"
              className="group hidden sm:inline-flex items-center gap-3 px-5 py-3 bg-primary-500 text-background-950 text-sm font-bold tracking-wide hover:bg-primary-400 transition-colors duration-400 whitespace-nowrap shrink-0"
            >
              <span>Recognition Pathway</span>
              <i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Mobile CTA ── */}
      <div className="sm:hidden absolute bottom-20 left-8 right-6 z-20">
        <Link
          to="/membership"
          className="inline-flex items-center gap-3 px-5 py-3 bg-primary-500 text-background-950 text-sm font-bold tracking-wide"
        >
          <span>Recognition Pathway</span>
          <i className="ri-arrow-right-line" />
        </Link>
      </div>

      {/* ── Bottom Edge ── */}
      <div className="absolute inset-x-0 bottom-0 z-20">
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
    </section>
  );
}

