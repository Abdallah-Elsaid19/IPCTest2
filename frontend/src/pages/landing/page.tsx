import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { LANDING_BACKGROUND_VIDEO } from "@/config/media";
import SEO from "@/components/seo/SEO";
import { pageSeo } from "@/config/pageSeo";
import { buildOrganizationSchema, buildWebsiteSchema } from "@/lib/seo/structuredData";

const landingStructuredData = [buildOrganizationSchema(), buildWebsiteSchema()];

export default function LandingPage() {
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-[100svh] min-h-[32rem] w-full overflow-hidden bg-background-950 sm:h-[100dvh]"
    >
      <SEO {...pageSeo.landing} structuredData={landingStructuredData} />
      {/* ── Dot Grid Pattern ── */}
      <div className="absolute inset-0 dot-grid-gold opacity-20" />

      {/* ── Halftone Map ── */}
      <div className="absolute inset-0 halftone-map opacity-25" />

      {/* ── Concentric Ring System — Centered ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Centered ring system */}
          <circle
            cx="720"
            cy="420"
            r="340"
            fill="none"
            stroke="oklch(0.685 0.132 72 / 0.05)"
            strokeWidth="0.5"
            strokeDasharray="3 14"
          />
          <circle
            cx="720"
            cy="420"
            r="280"
            fill="none"
            stroke="oklch(0.685 0.132 72 / 0.08)"
            strokeWidth="0.5"
          />
          <circle
            cx="720"
            cy="420"
            r="220"
            fill="none"
            stroke="oklch(0.685 0.132 72 / 0.1)"
            strokeWidth="1"
            strokeDasharray="50 10"
          />
          <circle
            cx="720"
            cy="420"
            r="160"
            fill="none"
            stroke="oklch(0.685 0.132 72 / 0.14)"
            strokeWidth="1"
            strokeDasharray="70 12"
          />
          <circle
            cx="720"
            cy="420"
            r="100"
            fill="none"
            stroke="oklch(0.685 0.132 72 / 0.2)"
            strokeWidth="1"
          />
          <circle
            cx="720"
            cy="420"
            r="45"
            fill="none"
            stroke="oklch(0.685 0.132 72 / 0.28)"
            strokeWidth="1.5"
          />

          {/* Eye crosshairs */}
          <line
            x1="650"
            y1="420"
            x2="790"
            y2="420"
            stroke="oklch(0.685 0.132 72 / 0.15)"
            strokeWidth="0.5"
            strokeDasharray="4 8"
          />
          <line
            x1="720"
            y1="350"
            x2="720"
            y2="490"
            stroke="oklch(0.685 0.132 72 / 0.15)"
            strokeWidth="0.5"
            strokeDasharray="4 8"
          />

          {/* Risk quadrants */}
          <line
            x1="540"
            y1="420"
            x2="900"
            y2="420"
            stroke="oklch(0.685 0.132 72 / 0.04)"
            strokeWidth="0.5"
          />
          <line
            x1="720"
            y1="240"
            x2="720"
            y2="600"
            stroke="oklch(0.685 0.132 72 / 0.04)"
            strokeWidth="0.5"
          />

          {/* Wing-inspired arcs around center */}
          <path
            d="M 380 420 A 340 340 0 0 1 1060 420"
            fill="none"
            stroke="oklch(0.685 0.132 72 / 0.06)"
            strokeWidth="0.5"
            strokeDasharray="6 16"
          />
          <path
            d="M 380 420 A 340 340 0 0 0 1060 420"
            fill="none"
            stroke="oklch(0.685 0.132 72 / 0.04)"
            strokeWidth="0.5"
            strokeDasharray="3 12"
          />

          {/* Data pathway dots */}
          <circle cx="440" cy="250" r="2" fill="oklch(0.685 0.132 72 / 0.35)" />
          <circle cx="500" cy="300" r="1.5" fill="oklch(0.685 0.132 72 / 0.25)" />
          <circle cx="560" cy="580" r="2" fill="oklch(0.685 0.132 72 / 0.3)" />
          <circle cx="480" cy="540" r="1.5" fill="oklch(0.685 0.132 72 / 0.2)" />
          <circle cx="940" cy="260" r="2" fill="oklch(0.685 0.132 72 / 0.35)" />
          <circle cx="880" cy="590" r="1.5" fill="oklch(0.685 0.132 72 / 0.25)" />
          <circle cx="1000" cy="340" r="1.5" fill="oklch(0.685 0.132 72 / 0.2)" />
        </svg>
      </div>

      {/* ── Full-screen Owl Video Background ── */}
      <video
        src={LANDING_BACKGROUND_VIDEO}
        autoPlay
        loop
        muted
        playsInline
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />

      {/* ── Light Charcoal Overlay ── */}
      <div className="absolute inset-0 bg-background-950/60 pointer-events-none" />

      {/* ── Centered Content ── */}
      <div className="relative z-20 flex h-full flex-col items-center justify-center px-4 py-8 text-center sm:px-6 md:px-10">
        {/* Institutional label */}
        <div
          className={`mb-5 md:mb-7 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "400ms" }}
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-primary-500/80 sm:text-[10px] sm:tracking-[0.35em]">
            Recognition · Competence · Community · Career
          </span>
        </div>

        {/* Main headline */}
        <div
          className={`mb-5 md:mb-7 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "600ms" }}
        >
          <h1 className="font-heading text-[clamp(2.15rem,11vw,5.5rem)] font-extrabold leading-[0.95] tracking-[-0.03em] text-background-50">
            A professional home
            <br />
            for <span className="text-primary-500">project controls</span>
          </h1>
        </div>

        {/* Supporting text */}
        <div
          className={`mb-8 md:mb-12 max-w-[520px] transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "800ms" }}
        >
          <div className="w-16 gold-rule mx-auto mb-5" />
          <p className="text-sm md:text-[15px] text-background-400 leading-[1.7] font-medium">
            Turning project information into decisions.
          </p>
        </div>

        {/* Single CTA Button */}
        <div
          className={`transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "1000ms" }}
        >
          <Link
            to="/home"
            className="group inline-flex max-w-full items-center justify-center gap-3 bg-primary-500 px-5 py-3.5 text-center text-sm font-bold tracking-wide text-background-950 transition-all duration-300 hover:bg-primary-400 sm:px-8 sm:py-4"
          >
            <span>Explore the Institution</span>
            <i className="ri-arrow-right-line group-hover:translate-x-1.5 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </div>
  );
}
