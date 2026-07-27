import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/seo/SEO";
import { pageSeo } from "@/config/pageSeo";
import { buildAboutPageSchema } from "@/lib/seo/structuredData";
import { apiJson } from "@/lib/api";
import { subscribeToContentUpdates } from "@/lib/contentSync";

interface AboutCardContent {
  icon: string;
  title: string;
  description: string;
  is_active?: boolean;
}

interface AboutStatistic {
  number: string;
  label: string;
  is_active?: boolean;
}

interface VisionPillar {
  icon: string;
  title: string;
  is_active?: boolean;
}

interface AboutIntro {
  eyebrow: string;
  title: string;
  title_accent?: string;
  description: string;
  is_active?: boolean;
}

interface AboutLinkCard {
  title: string;
  description: string;
  cta_label: string;
  cta_url: string;
  is_active?: boolean;
}

interface AboutFaqItem {
  question: string;
  answer: string;
  is_active?: boolean;
}

interface AboutPageContent {
  hero: AboutIntro & { cta_label: string; cta_url: string };
  purpose: Omit<AboutIntro, "description"> & { paragraphs: string[] };
  why_intro: AboutIntro;
  vision: Omit<AboutIntro, "description"> & { paragraphs: string[] };
  mission_intro: AboutIntro;
  values_intro: AboutIntro & { closing?: string };
  identity_intro: AboutIntro;
  discipline: AboutIntro & {
    callout: string;
    domains: Array<{ title: string; detail: string; is_active?: boolean }>;
    levels: Array<{ title: string; description: string; is_active?: boolean }>;
  };
  standards: AboutIntro & {
    principles: Array<{ title: string; description: string; is_active?: boolean }>;
    conduct: Array<{ title: string; description: string; is_active?: boolean }>;
  };
  audiences_intro: AboutIntro;
  audiences: AboutLinkCard[];
  professional_promise: AboutIntro & {
    cta_label: string;
    cta_url: string;
    items: Array<{ title: string; description: string; is_active?: boolean }>;
  };
  faq: AboutIntro & { items: AboutFaqItem[] };
  final_cta: AboutIntro & {
    supporting_description: string;
    primary_cta_label: string;
    primary_cta_url: string;
    secondary_cta_label: string;
    secondary_cta_url: string;
  };
  seo: {
    title: string;
    description: string;
    canonical_path: string;
    noindex?: boolean;
  };
  statistics: AboutStatistic[];
  why_exists: AboutCardContent[];
  vision_pillars: VisionPillar[];
  missions: AboutCardContent[];
  core_values: AboutCardContent[];
  identity_symbols: AboutCardContent[];
  updated_at: string;
}

const staticAboutHero: AboutPageContent["hero"] = {
  eyebrow: "About the Institute",
  title: "A professional institution for the people behind",
  title_accent: "credible project decisions.",
  description: "The Institute of Project Controls exists to recognise, develop and connect the professionals who make project performance visible, forecasts credible, change controlled and decisions evidence-based.",
  cta_label: "Explore Membership",
  cta_url: "/membership",
};

function AboutContentError({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background-950 px-6">
      <div className="border border-red-900/60 bg-red-950/30 px-8 py-6 text-center text-red-200" role="alert">
        {message}
      </div>
    </div>
  );
}

function AboutContentLoading() {
  return (
    <section
      className="animate-pulse bg-background-100 py-16"
      aria-busy="true"
      aria-label="Loading About page sections"
      role="status"
    >
      <div className="container-content">
        <div className="h-3 w-40 rounded-sm bg-primary-500/30" />
        <div className="mt-7 h-10 max-w-2xl rounded-sm bg-background-400/60" />
        <div className="mt-4 h-10 max-w-xl rounded-sm bg-background-400/60" />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="min-h-40 border border-background-400 bg-background-200 p-6">
              <div className="h-4 w-2/3 rounded-sm bg-background-500/50" />
              <div className="mt-6 h-3 w-full rounded-sm bg-background-400/60" />
              <div className="mt-3 h-3 w-4/5 rounded-sm bg-background-400/60" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   SCROLL-DRIVEN ABOUT PAGE — OWL AS VISUAL GUIDE
   Scene flow: Hero → Who We Are → Why We Exist
   → Vision → Mission → Core Values → Identity → Finale
   ───────────────────────────────────────────── */

export default function AboutPage() {
  const [globalScrollY, setGlobalScrollY] = useState(0);
  const [heroProgress, setHeroProgress] = useState(0);
  const [content, setContent] = useState<AboutPageContent | null>(null);
  const [contentError, setContentError] = useState("");
  const heroRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);

  const loadContent = useCallback(async () => {
      try {
        const response = await apiJson<AboutPageContent>(
          "/api/about/content",
          undefined,
          { cache: "no-store" },
        );
        setContent(response);
        setContentError("");
      } catch (error) {
        setContentError(error instanceof Error ? error.message : "About content could not be loaded.");
      }
  }, []);

  useEffect(() => {
    void loadContent();
    return subscribeToContentUpdates("about", () => void loadContent());
  }, [loadContent]);

  /* ── Global scroll tracking ── */
  const onScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setGlobalScrollY(window.scrollY);
      /* Hero parallax progress */
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const heroH = heroRef.current.offsetHeight;
        const scrolled = -rect.top;
        setHeroProgress(Math.min(1, Math.max(0, scrolled / (heroH * 0.7))));
      }
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onScroll]);

  /* ── Section entrance observer ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("scene-visible");
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -30px 0px" }
    );

    document.querySelectorAll(".scene-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [content]);

  /* ── Ring rotation observer ── */
  useEffect(() => {
    const ringObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const rings = entry.target.querySelectorAll(".ring-animate");
          rings.forEach((r) => {
            if (entry.isIntersecting) {
              (r as HTMLElement).style.animationPlayState = "running";
            }
          });
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".radar-scene").forEach((el) => ringObserver.observe(el));
    return () => ringObserver.disconnect();
  }, [content]);

  if (contentError) {
    return (
      <div className="overflow-x-hidden bg-background-950 text-background-50">
        <SEO {...pageSeo.about} structuredData={buildAboutPageSchema(pageSeo.about.description)} />
        <SceneHero content={staticAboutHero} heroProgress={heroProgress} globalScrollY={globalScrollY} ref={heroRef} />
        <AboutContentError message={contentError} />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="overflow-x-hidden bg-background-950 text-background-50">
        <SEO {...pageSeo.about} structuredData={buildAboutPageSchema(pageSeo.about.description)} />
        <SceneHero content={staticAboutHero} heroProgress={heroProgress} globalScrollY={globalScrollY} ref={heroRef} />
        <AboutContentLoading />
      </div>
    );
  }

  return (
    <div className="bg-background-950 text-background-50 overflow-x-hidden">
      <SEO
        title={content.seo.title || pageSeo.about.title}
        description={content.seo.description || pageSeo.about.description}
        canonicalPath={content.seo.canonical_path || pageSeo.about.canonicalPath}
        noIndex={content.seo.noindex}
        structuredData={buildAboutPageSchema(content.seo.description || pageSeo.about.description)}
      />
      {/* ═══════════════════════════════════════════
          SCENE 1 — HERO — Owl Dominant
          ═══════════════════════════════════════════ */}
      <SceneHero content={staticAboutHero} heroProgress={heroProgress} globalScrollY={globalScrollY} ref={heroRef} />

      {/* ═══════════════════════════════════════════
          OWL TRANSITION BRIDGE — Wing Sweep
          ═══════════════════════════════════════════ */}
      <OwlTransitionBridge progress={heroProgress} />

      {/* ═══════════════════════════════════════════
          SCENE 2 — WHO WE ARE
          ═══════════════════════════════════════════ */}
      <SceneWhoWeAre content={content.purpose} statistics={content.statistics.filter((item) => item.is_active !== false)} />

      {/* ═══════════════════════════════════════════
          SCENE 3 — WHY IPC EXISTS (Eye Transition)
          ═══════════════════════════════════════════ */}
      <SceneWhyExist content={content.why_intro} pillars={content.why_exists.filter((item) => item.is_active !== false)} />

      {/* ═══════════════════════════════════════════
          SCENE 4 — OUR VISION
          ═══════════════════════════════════════════ */}
      <SceneVision content={content.vision} pillars={content.vision_pillars.filter((item) => item.is_active !== false)} />

      {/* ═══════════════════════════════════════════
          SCENE 5 — OUR MISSION
          ═══════════════════════════════════════════ */}
      <SceneMission content={content.mission_intro} missions={content.missions.filter((item) => item.is_active !== false)} />

      {/* ═══════════════════════════════════════════
          SCENE 6 — CORE VALUES (Radar + Owl Orbit)
          ═══════════════════════════════════════════ */}
      <SceneCoreValues content={content.values_intro} values={content.core_values.filter((item) => item.is_active !== false)} />

      {/* ═══════════════════════════════════════════
          SCENE 7 — THE IPC IDENTITY
          ═══════════════════════════════════════════ */}
      <SceneIdentity content={content.identity_intro} symbols={content.identity_symbols.filter((item) => item.is_active !== false)} />
      <SceneIntegratedDiscipline content={content.discipline} />
      <SceneStandardsRecognition content={content.standards} />
      <SceneAudiences content={content.audiences_intro} audiences={content.audiences.filter((item) => item.is_active !== false)} />
      <SceneProfessionalPromise content={content.professional_promise} />
      <SceneAboutFaq content={content.faq} />

      {/* ═══════════════════════════════════════════
          SCENE 8 — FINALE
          ═══════════════════════════════════════════ */}
      <SceneFinale content={content.final_cta} />

      {/* ── Subtle scroll-progress gold line at page bottom-left ── */}
      <div className="fixed bottom-0 left-0 h-[2px] bg-gradient-to-r from-primary-500/40 to-primary-500/10 z-50 transition-all duration-300"
        style={{ width: `${Math.min(100, (globalScrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100)}%` }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCENE 1 — HERO
   Full-height. Owl dominant center. Concentric rings, gold dots,
   technical linework, warm white / charcoal contrast.
   ═══════════════════════════════════════════════════════════════ */
function SceneHero({ content, heroProgress, globalScrollY, ref: forwardedRef }: {
  content: AboutPageContent["hero"];
  heroProgress: number;
  globalScrollY: number;
  ref: React.Ref<HTMLElement>;
}) {
  return (
    <section
      ref={forwardedRef}
      id="scene-hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background-950"
      style={{
        /* Owl lifts up and scales down slightly as user scrolls */
        ["--owl-y" as string]: `${-heroProgress * 80}px`,
        ["--owl-scale" as string]: `${1 - heroProgress * 0.08}`,
        ["--owl-opacity" as string]: `${1 - heroProgress * 0.5}`,
        ["--content-y" as string]: `${-heroProgress * 120}px`,
        ["--content-opacity" as string]: `${1 - heroProgress * 0.7}`,
        ["--ring-scale" as string]: `${1 + heroProgress * 0.15}`,
        ["--ring-opacity" as string]: `${Math.max(0.05, 0.25 - heroProgress * 0.2)}`,
      } as React.CSSProperties}
    >
      {/* ── Deep gold radial glow behind owl ── */}
      <div
        className="absolute left-[74%] top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-500"
        style={{
          background: "radial-gradient(ellipse at center, oklch(0.685 0.132 72 / 0.09) 0%, transparent 65%)",
          opacity: 1 - heroProgress * 0.6,
          transform: `translate(-50%, -50%) scale(${1 + heroProgress * 0.1})`,
        }}
      />

      {/* ── Concentric ring system ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg viewBox="0 0 1440 900" preserveAspectRatio="none" className="w-full h-full">
          {/* Outer data ring */}
          <circle cx="720" cy="420" r="350" fill="none"
            stroke="oklch(0.685 0.132 72 / 0.06)" strokeWidth="0.5" strokeDasharray="4 18"
            className="ring-animate" style={{ transformOrigin: "720px 420px", animation: "ring-rotate-slow 90s linear infinite", opacity: "var(--ring-opacity)" }} />
          {/* Mid ring */}
          <circle cx="720" cy="420" r="260" fill="none"
            stroke="oklch(0.685 0.132 72 / 0.1)" strokeWidth="0.5"
            className="ring-animate" style={{ transformOrigin: "720px 420px", animation: "ring-rotate-slow 70s linear infinite reverse", opacity: "var(--ring-opacity)" }} />
          {/* Inner precision ring */}
          <circle cx="720" cy="420" r="190" fill="none"
            stroke="oklch(0.685 0.132 72 / 0.14)" strokeWidth="1" strokeDasharray="60 12"
            className="ring-animate" style={{ transformOrigin: "720px 420px", animation: "ring-rotate-slow 50s linear infinite", opacity: "var(--ring-opacity)" }} />
          {/* Core ring */}
          <circle cx="720" cy="420" r="120" fill="none"
            stroke="oklch(0.685 0.132 72 / 0.2)" strokeWidth="1"
            className="ring-animate" style={{ transformOrigin: "720px 420px", animation: "ring-rotate-slow 35s linear infinite reverse", opacity: "var(--ring-opacity)" }} />
          {/* Eye-level crosshair */}
          <line x1="640" y1="420" x2="800" y2="420"
            stroke="oklch(0.685 0.132 72 / 0.12)" strokeWidth="0.5" strokeDasharray="4 10" />
          <line x1="720" y1="340" x2="720" y2="500"
            stroke="oklch(0.685 0.132 72 / 0.12)" strokeWidth="0.5" strokeDasharray="4 10" />
          {/* Wing-inspired arcs */}
          <path d="M 350 420 A 370 370 0 0 1 1090 420" fill="none"
            stroke="oklch(0.685 0.132 72 / 0.07)" strokeWidth="0.5" strokeDasharray="8 20" />
          <path d="M 350 420 A 370 370 0 0 0 1090 420" fill="none"
            stroke="oklch(0.685 0.132 72 / 0.05)" strokeWidth="0.5" strokeDasharray="3 14" />
          {/* Gold dot nodes */}
          <circle cx="370" cy="230" r="2.5" fill="oklch(0.685 0.132 72 / 0.4)" />
          <circle cx="1070" cy="230" r="2.5" fill="oklch(0.685 0.132 72 / 0.4)" />
          <circle cx="370" cy="610" r="2" fill="oklch(0.685 0.132 72 / 0.3)" />
          <circle cx="1070" cy="610" r="2" fill="oklch(0.685 0.132 72 / 0.3)" />
          <circle cx="530" cy="170" r="1.5" fill="oklch(0.685 0.132 72 / 0.25)" />
          <circle cx="910" cy="670" r="1.5" fill="oklch(0.685 0.132 72 / 0.25)" />
        </svg>
      </div>

      {/* ── Dot matrix overlay ── */}
      <div className="absolute inset-0 dot-grid opacity-[0.06] pointer-events-none" />

      {/* ── THE OWL — dominant center figure ── */}
      <div
        className="pointer-events-none absolute right-[2%] z-10 hidden transition-all duration-700 ease-out lg:block xl:right-[6%]"
        style={{
          top: "calc(50% + var(--owl-y))",
          transform: "translateY(-50%) scale(var(--owl-scale))",
          opacity: "var(--owl-opacity)",
        }}
      >
        <div className="relative h-[720px] w-[590px] xl:h-[780px] xl:w-[680px]">
          <img
            loading="eager"
            fetchPriority="high"
            decoding="async"
            src="https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/056a6bdb70814779a81249d39bfbd36c.webp"
            alt="Institute owl — wisdom and foresight"
            className="w-full h-full object-contain object-center owl-eye-glow"
          />
        </div>
      </div>

      {/* ── Hero content overlay ── */}
      <div
        className="pointer-events-none absolute inset-0 z-[15] bg-gradient-to-r from-background-950 via-background-950/80 to-transparent"
        aria-hidden="true"
      />

      <div
        className="container-content relative z-20 w-full text-left transition-all duration-700 ease-out lg:pr-[43%] xl:pr-[40%]"
        style={{
          transform: "translateY(var(--content-y))",
          opacity: "var(--content-opacity)",
        }}
      >
        {/* Institutional label */}
        <div className="mb-6">
          <span className="text-[10px] md:text-[11px] font-mono font-semibold text-primary-300 tracking-[0.35em] uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
            {content.eyebrow}
          </span>
        </div>

        {/* Gold rule */}
        <div className="mb-7 w-16 gold-rule" />

        {/* Headline */}
        <h1 className="mb-6 max-w-4xl font-heading text-[clamp(2.5rem,3.6vw,4.25rem)] font-extrabold leading-[0.98] tracking-[-0.035em] text-background-50 [overflow-wrap:normal] [text-shadow:0_3px_24px_rgba(0,0,0,1),0_1px_3px_rgba(0,0,0,1)] [word-break:normal]">
          {content.title}
          <br />
          <span className="text-primary-300">{content.title_accent}</span>
        </h1>

        {/* Subtitle */}
        <p className="mb-10 max-w-[560px] text-sm font-medium leading-relaxed text-background-100 drop-shadow-[0_2px_10px_rgba(0,0,0,1)] md:text-[15px]">
          {content.description}
        </p>

        {/* CTA */}
        <Link
          to={content.cta_url}
          className="inline-flex items-center gap-3 px-8 py-4 bg-primary-500 text-background-950 text-sm font-bold tracking-wide hover:bg-primary-400 transition-all duration-300 whitespace-nowrap cursor-pointer"
        >
          <span>{content.cta_label}</span>
          <i className="ri-arrow-right-line" />
        </Link>
      </div>

      {/* ── Scroll indicator ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 transition-opacity duration-500"
        style={{ opacity: 1 - heroProgress * 1.5 }}>
        <span className="text-[10px] font-mono text-background-500 tracking-[0.2em] uppercase">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-primary-500/50 to-transparent" />
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TRANSITION BRIDGE — Owl wing sweeps into "Who We Are"
   ═══════════════════════════════════════════════════════════════ */
function OwlTransitionBridge({ progress }: { progress: number }) {
  const active = progress > 0.25;

  return (
    <div className="relative h-[120px] md:h-[160px] bg-background-950 overflow-hidden" aria-hidden="true">
      {/* Wing sweep arc */}
      <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className="w-full h-full absolute inset-0">
        <path
          d="M -100 80 Q 720 -60 1540 80"
          fill="none"
          stroke="oklch(0.685 0.132 72 / 0.12)"
          strokeWidth="1"
          strokeDasharray="8 20"
          className="transition-all duration-1000"
          style={{
            strokeDashoffset: active ? 0 : 2000,
            opacity: active ? 1 : 0,
          }}
        />
        <path
          d="M -60 80 Q 720 -30 1500 80"
          fill="none"
          stroke="oklch(0.685 0.132 72 / 0.05)"
          strokeWidth="0.5"
          strokeDasharray="3 12"
          className="transition-all duration-1200"
          style={{
            strokeDashoffset: active ? 0 : 2000,
            opacity: active ? 1 : 0,
          }}
        />
      </svg>

      {/* Feather trail dots */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: active ? 0.7 : 0, transition: "opacity 1.2s ease" }}>
        {[0.15, 0.28, 0.42, 0.55, 0.68, 0.8, 0.92].map((x, i) => (
          <div key={i}
            className="absolute w-1 h-1 bg-primary-500/40"
            style={{
              left: `${x * 100}%`,
              top: `${50 + Math.sin(x * Math.PI) * 35}%`,
              opacity: 0.3 + i * 0.07,
              transform: `scale(${0.6 + i * 0.08})`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCENE 2 — WHO WE ARE
   Owl wing extends, revealing the institution's identity
   ═══════════════════════════════════════════════════════════════ */
function SceneWhoWeAre({
  content,
  statistics,
}: {
  content: AboutPageContent["purpose"];
  statistics: AboutStatistic[];
}) {
  return (
    <section id="scene-who" className="relative bg-background-50 py-24 md:py-36 overflow-hidden">
      {/* Wing-curve background accent */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] pointer-events-none opacity-[0.03]"
        style={{
          borderRadius: "50% 0 0 50%",
          border: "1px solid oklch(0.685 0.132 72 / 0.5)",
          transform: "scale(1.4, 0.7)",
        }}
      />

      <div className="container-content relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">
          {/* Left: Owl wing-extended image */}
          <div className="lg:w-[45%] shrink-0 scene-reveal transition-all duration-1000"
            style={{ opacity: 0, transform: "translateX(-40px)" }}>
            <div className="relative">
              <div className="overflow-hidden">
                <img
            loading="lazy"
            decoding="async"
                  src="https://readdy.ai/api/search-image?query=Eagle%20owl%20with%20one%20wing%20elegantly%20extended%20sideways%20in%20graceful%20spread%2C%20warm%20brown%20cream%20and%20charcoal%20feathers%2C%20golden%20orange%20eye%20visible%20in%20profile%2C%20wing%20feathers%20creating%20elegant%20arc%20shape%2C%20warm%20dark%20background%20with%20subtle%20gold%20particles%2C%20professional%20wildlife%20photography%2C%20no%20text&width=700&height=500&seq=about-owl-wing-02&orientation=landscape"
                  alt="Owl wing extended — revealing the institution"
                  className="w-full h-auto transition-transform duration-1000 hover:scale-[1.03]"
                />
              </div>
              {/* Gold accent block */}
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-primary-500 hidden md:block" />
            </div>
          </div>

          {/* Right: Who We Are content */}
          <div className="flex-1 scene-reveal transition-all duration-1000"
            style={{ opacity: 0, transform: "translateX(40px)", transitionDelay: "0.2s" }}>
            <span className="text-[11px] font-mono text-primary-600 tracking-[0.3em] uppercase mb-4 block">
              {content.eyebrow}
            </span>
            <div className="w-16 h-[2px] bg-primary-500 mb-6" />
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-background-950 leading-[1.1] mb-6">
              {content.title}
              <br />
              <span className="text-primary-600">{content.title_accent}</span>
            </h2>
            <div className="space-y-4 text-foreground-600 leading-relaxed text-base md:text-lg max-w-xl">
              {content.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-8 md:gap-14 mt-10 pt-8 border-t border-background-200">
              {statistics.map((statistic) => (
                <div key={statistic.label}>
                  <div className="font-heading text-3xl md:text-4xl font-bold text-primary-500">{statistic.number}</div>
                  <div className="text-xs text-foreground-500 tracking-wider uppercase mt-1">{statistic.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCENE 3 — WHY IPC EXISTS (Owl Eye → Analytical Circles)
   ═══════════════════════════════════════════════════════════════ */
function SceneWhyExist({
  content,
  pillars,
}: {
  content: AboutPageContent["why_intro"];
  pillars: AboutCardContent[];
}) {
  return (
    <section id="scene-why" className="relative bg-background-950 py-24 md:py-36 overflow-hidden">
      {/* Dot matrix background */}
      <div className="absolute inset-0 dot-grid-gold opacity-[0.05]" />

      {/* Owl eye to circles transition */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none radar-scene">
        <div className="relative w-[500px] h-[500px] md:w-[700px] md:h-[700px]">
          {/* Outer rings — expand from eye */}
          {[400, 320, 240, 160, 80].map((r, i) => (
            <div key={i}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-primary-500/10 ring-animate"
              style={{
                width: r,
                height: r,
                borderRadius: "50%",
                animation: `ring-rotate-slow ${40 + i * 15}s linear infinite`,
                animationDirection: i % 2 === 0 ? "normal" : "reverse",
                opacity: 0.08 + i * 0.03,
              }}
            />
          ))}

          {/* Crosshair axis */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-primary-500/8" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary-500/8" />

          {/* Data nodes on rings */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <div key={i} className="absolute w-2 h-2 bg-primary-500/30"
              style={{
                top: `calc(50% + ${Math.sin((angle * Math.PI) / 180) * 200}px)`,
                left: `calc(50% + ${Math.cos((angle * Math.PI) / 180) * 200}px)`,
                transform: "translate(-50%, -50%)",
                animation: `twinkle ${2 + i * 0.4}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="container-content relative z-10">
        <div className="max-w-3xl mx-auto text-center scene-reveal transition-all duration-1000"
          style={{ opacity: 0, transform: "translateY(30px)" }}>
          {/* Owl eye — small centered image as transition anchor */}
          <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-10 overflow-hidden rounded-full border-2 border-primary-500/20">
            <img
            loading="lazy"
            decoding="async"
              src="https://readdy.ai/api/search-image?query=Extreme%20close%20up%20of%20eagle%20owl%20golden%20orange%20eye%20with%20intricate%20iris%20detail%2C%20dark%20pupil%20centered%2C%20surrounding%20cream%20and%20brown%20feathers%20with%20fine%20texture%2C%20intense%20intelligent%20gaze%2C%20warm%20dramatic%20lighting%2C%20macro%20photography%2C%20dark%20vignette%20background%2C%20no%20text&width=300&height=300&seq=about-owl-eye-03&orientation=squarish"
              alt="The eye of foresight"
              className="w-full h-full object-cover owl-eye-glow"
            />
          </div>

          <span className="text-[11px] font-mono text-primary-400/80 tracking-[0.3em] uppercase mb-4 block">
            {content.eyebrow}
          </span>
          <div className="w-16 gold-rule mx-auto mb-7" />
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-background-50 leading-[1.1] mb-8">
            {content.title}
            <br />
            <span className="text-primary-400">{content.title_accent}</span>
          </h2>
          <p className="text-base md:text-lg text-background-300 leading-relaxed max-w-2xl mx-auto">
            {content.description}
          </p>

          {/* Three insight pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="scene-reveal transition-all duration-1000 group p-8 bg-background-900/60 border border-background-800 hover:border-primary-500/20"
                style={{ opacity: 0, transform: "translateY(24px)", transitionDelay: "0.15s" }}>
                <div className="w-12 h-12 bg-primary-500/10 flex items-center justify-center mb-5">
                  <i className={`${pillar.icon} text-xl text-primary-400`} />
                </div>
                <h4 className="font-heading text-lg font-semibold text-background-50 mb-3">{pillar.title}</h4>
                <p className="text-sm text-background-400 leading-relaxed">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCENE 4 — OUR VISION (Owl gliding through horizon)
   ═══════════════════════════════════════════════════════════════ */
function SceneVision({
  content,
  pillars,
}: {
  content: AboutPageContent["vision"];
  pillars: VisionPillar[];
}) {
  return (
    <section id="scene-vision" className="relative bg-background-50 py-24 md:py-36 overflow-hidden">
      {/* Architectural horizon lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg viewBox="0 0 1440 800" preserveAspectRatio="none" className="w-full h-full">
          <line x1="0" y1="280" x2="1440" y2="280" stroke="oklch(0.15 0 0 / 0.06)" strokeWidth="1" />
          <line x1="0" y1="400" x2="1440" y2="400" stroke="oklch(0.15 0 0 / 0.04)" strokeWidth="1" strokeDasharray="20 40" />
          <line x1="0" y1="520" x2="1440" y2="520" stroke="oklch(0.15 0 0 / 0.06)" strokeWidth="1" />
          {/* Gold arcs suggesting owl flight path */}
          <path d="M 100 600 Q 720 100 1340 600" fill="none" stroke="oklch(0.685 0.132 72 / 0.08)" strokeWidth="1" strokeDasharray="10 30" />
          <path d="M 200 600 Q 720 160 1240 600" fill="none" stroke="oklch(0.685 0.132 72 / 0.05)" strokeWidth="0.5" strokeDasharray="4 20" />
        </svg>
      </div>

      <div className="container-content relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">
          {/* Left: Vision text */}
          <div className="flex-1 scene-reveal transition-all duration-1000"
            style={{ opacity: 0, transform: "translateX(-30px)" }}>
            <span className="text-[11px] font-mono text-primary-600 tracking-[0.3em] uppercase mb-4 block">
              {content.eyebrow}
            </span>
            <div className="w-16 h-[2px] bg-primary-500 mb-6" />
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-background-950 leading-[1.1] mb-6">
              {content.title}
              <br />
              <span className="text-primary-600">{content.title_accent}</span>
            </h2>
            <div className="space-y-3 text-foreground-600 leading-relaxed text-base max-w-lg">
              {content.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            {/* Three vision pillars */}
            <div className="flex flex-col sm:flex-row gap-6 mt-10">
              {pillars.map((pillar) => (
                <div key={pillar.title} className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary-100 flex items-center justify-center shrink-0">
                    <i className={`${pillar.icon} text-base text-primary-600`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-background-950">{pillar.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Owl gliding image */}
          <div className="lg:w-[42%] shrink-0 scene-reveal transition-all duration-1000"
            style={{ opacity: 0, transform: "translateX(40px)", transitionDelay: "0.2s" }}>
            <div className="relative overflow-hidden">
              <img
            loading="lazy"
            decoding="async"
                src="https://readdy.ai/api/search-image?query=Eagle%20owl%20gliding%20gracefully%20in%20controlled%20aerial%20pose%2C%20wings%20fully%20spread%20in%20elegant%20V%20shape%2C%20warm%20brown%20cream%20charcoal%20feather%20tones%2C%20golden%20orange%20eyes%20focused%20forward%2C%20smooth%20professional%20motion%2C%20warm%20golden%20atmospheric%20background%20with%20subtle%20arc%20lines%2C%20cinematic%20composition%2C%20no%20text&width=700&height=500&seq=about-owl-glide-04&orientation=landscape"
                alt="Owl gliding — vision elevated"
                className="w-full h-auto transition-transform duration-1000 hover:scale-[1.03]"
              />
              {/* Gold corner accent */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary-500 hidden md:block" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCENE 5 — OUR MISSION (Owl path → mission framework)
   ═══════════════════════════════════════════════════════════════ */
function SceneMission({
  content,
  missions,
}: {
  content: AboutPageContent["mission_intro"];
  missions: AboutCardContent[];
}) {
  return (
    <section id="scene-mission" className="relative bg-background-950 py-24 md:py-36 overflow-hidden">
      {/* Owl silhouette passing through */}
      <div className="absolute top-0 right-0 w-[300px] md:w-[450px] opacity-[0.04] pointer-events-none">
        <img
            loading="lazy"
            decoding="async"
          src="https://readdy.ai/api/search-image?query=Eagle%20owl%20silhouette%20in%20dark%20charcoal%20against%20warm%20golden%20gradient%20background%2C%20ear%20tufts%20clearly%20visible%2C%20powerful%20profile%20stance%2C%20elegant%20minimal%20composition%2C%20subtle%20gold%20rim%20light%20on%20feather%20edges%2C%20no%20text%2C%20high%20contrast&width=600&height=400&seq=about-owl-silhouette-05&orientation=landscape"
          alt=""
          className="w-full h-auto"
        />
      </div>

      {/* Gold route path — owl's flight becomes mission line */}
      <svg viewBox="0 0 1440 300" preserveAspectRatio="none" className="absolute top-1/2 left-0 w-full h-[300px] pointer-events-none opacity-30">
        <path d="M -50 150 Q 200 50 400 120 T 800 80 T 1100 140 Q 1300 170 1500 130"
          fill="none" stroke="oklch(0.685 0.132 72 / 0.25)" strokeWidth="1.5" strokeDasharray="6 18" />
        <path d="M -50 150 Q 200 50 400 120 T 800 80 T 1100 140 Q 1300 170 1500 130"
          fill="none" stroke="oklch(0.685 0.132 72 / 0.08)" strokeWidth="4" />
      </svg>

      <div className="container-content relative z-10">
        <div className="text-center mb-16 scene-reveal transition-all duration-1000"
          style={{ opacity: 0, transform: "translateY(30px)" }}>
          <span className="text-[11px] font-mono text-primary-400/80 tracking-[0.3em] uppercase mb-4 block">
            {content.eyebrow}
          </span>
          <div className="w-16 gold-rule mx-auto mb-7" />
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-background-50 leading-[1.1] mb-6">
            {content.title}
          </h2>
          <p className="text-base text-background-300 max-w-xl mx-auto leading-relaxed">
            {content.description}
          </p>
        </div>

        {/* 4 mission items along the owl's path */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
          {missions.map((m, i) => (
            <div key={m.title}
              className="scene-reveal transition-all duration-1000 group p-7 md:p-9 bg-background-900/50 border border-background-800 hover:bg-background-900/80 hover:border-primary-500/20"
              style={{ opacity: 0, transform: "translateY(30px)", transitionDelay: `${i * 0.12}s` }}>
              {/* Owl wing accent */}
              <div className="w-8 h-[1px] bg-primary-500/40 mb-4 group-hover:w-14 transition-all duration-500" />
              <span className="font-heading text-3xl font-bold text-primary-500/20 block mb-3">0{i + 1}</span>
              <div className="w-10 h-10 bg-primary-500/10 flex items-center justify-center mb-4">
                <i className={`${m.icon} text-lg text-primary-400`} />
              </div>
              <h4 className="font-heading text-base font-semibold text-background-50 mb-2">{m.title}</h4>
              <p className="text-sm text-background-400 leading-relaxed">{m.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCENE 6 — CORE VALUES (Radar + Owl circulating)
   ═══════════════════════════════════════════════════════════════ */
function SceneCoreValues({
  content,
  values,
}: {
  content: AboutPageContent["values_intro"];
  values: AboutCardContent[];
}) {
  return (
    <section id="scene-values" className="relative bg-background-50 py-24 md:py-36 overflow-hidden radar-scene">
      {/* Large radar ring system */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-[700px] h-[700px] md:w-[900px] md:h-[900px]">
        {[420, 340, 260, 180, 100].map((r, i) => (
          <div key={i}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-primary-500/8 ring-animate"
            style={{
              width: r,
              height: r,
              borderRadius: "50%",
              animation: `ring-rotate-slow ${30 + i * 18}s linear infinite`,
              animationDirection: i % 2 === 0 ? "normal" : "reverse",
            }}
          />
        ))}
        {/* Cross lines */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-primary-500/5" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary-500/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-primary-500/30" />
      </div>

      <div className="container-content relative z-10">
        <div className="text-center mb-16 scene-reveal transition-all duration-1000"
          style={{ opacity: 0, transform: "translateY(30px)" }}>
          <span className="text-[11px] font-mono text-primary-600 tracking-[0.3em] uppercase mb-4 block">
            {content.eyebrow}
          </span>
          <div className="w-16 h-[2px] bg-primary-500 mx-auto mb-7" />
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-background-950 leading-[1.1] mb-6">
            {content.title}
            <br />
            <span className="text-primary-600">{content.title_accent}</span>
          </h2>
          <p className="text-base text-foreground-600 max-w-xl mx-auto leading-relaxed">
            {content.description}
          </p>
        </div>

        {/* Values grid — owl passes through activating each */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 md:gap-2">
          {values.map((v, i) => (
            <div key={v.title}
              className="scene-reveal transition-all duration-1000 group p-6 md:p-7 bg-background-50 border border-background-200/70 hover:border-primary-200 hover:bg-background-100"
              style={{ opacity: 0, transform: "translateY(20px)", transitionDelay: `${i * 0.08}s` }}>
              <div className="w-10 h-10 bg-primary-100 flex items-center justify-center mb-4">
                <i className={`${v.icon} text-lg text-primary-600`} />
              </div>
              <h4 className="font-heading text-sm font-semibold text-background-950 mb-2">{v.title}</h4>
              <p className="text-xs text-foreground-600 leading-relaxed">{v.description}</p>
            </div>
          ))}
        </div>

        {/* Owl circulating presence */}
        {/* <div className="mt-16 text-center scene-reveal transition-all duration-1000"
          style={{ opacity: 0, transform: "translateY(20px)", transitionDelay: "0.6s" }}>
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-accent-50 border border-accent-200">
            <div className="w-8 h-8 overflow-hidden rounded-full">
              <img
            loading="lazy"
            decoding="async"
                src="https://readdy.ai/api/search-image?query=Extreme%20close%20up%20of%20eagle%20owl%20golden%20orange%20eye%20with%20intricate%20iris%20detail%2C%20dark%20pupil%20centered%2C%20surrounding%20cream%20and%20brown%20feathers%20with%20fine%20texture%2C%20intense%20intelligent%20gaze%2C%20warm%20dramatic%20lighting%2C%20macro%20photography%2C%20dark%20vignette%20background%2C%20no%20text&width=300&height=300&seq=about-owl-eye-03&orientation=squarish"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs font-mono text-accent-700 tracking-wider">
              {content.closing}
            </span>
          </div>
        </div> */}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCENE 7 — THE IPC IDENTITY (All elements converge)
   ═══════════════════════════════════════════════════════════════ */
function SceneIdentity({
  content,
  symbols,
}: {
  content: AboutPageContent["identity_intro"];
  symbols: AboutCardContent[];
}) {
  return (
    <section id="scene-identity" className="relative bg-background-950 py-24 md:py-36 overflow-hidden">
      {/* Dot matrix + halftone map */}
      <div className="absolute inset-0 dot-grid-gold opacity-[0.04]" />
      <div className="absolute inset-0 halftone-map opacity-[0.06]" />

      {/* Concentric rings background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg viewBox="0 0 1440 900" preserveAspectRatio="none" className="w-full h-full opacity-30">
          <circle cx="720" cy="450" r="380" fill="none" stroke="oklch(0.685 0.132 72 / 0.05)" strokeWidth="0.5" strokeDasharray="3 14" />
          <circle cx="720" cy="450" r="300" fill="none" stroke="oklch(0.685 0.132 72 / 0.08)" strokeWidth="0.5" />
          <circle cx="720" cy="450" r="220" fill="none" stroke="oklch(0.685 0.132 72 / 0.1)" strokeWidth="1" strokeDasharray="50 10" />
          <circle cx="720" cy="450" r="140" fill="none" stroke="oklch(0.685 0.132 72 / 0.15)" strokeWidth="1" />
        </svg>
      </div>

      <div className="container-content relative z-10">
        <div className="text-center mb-16 scene-reveal transition-all duration-1000"
          style={{ opacity: 0, transform: "translateY(30px)" }}>
          <span className="text-[11px] font-mono text-primary-400/80 tracking-[0.3em] uppercase mb-4 block">
            {content.eyebrow}
          </span>
          <div className="w-16 gold-rule mx-auto mb-7" />
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-background-50 leading-[1.1] mb-6">
            {content.title}
            <br />
            <span className="text-primary-400">{content.title_accent}</span>
          </h2>
          <p className="text-base text-background-300 max-w-xl mx-auto leading-relaxed">
            {content.description}
          </p>
        </div>

        {/* Symbols grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 md:gap-2 mb-16">
          {symbols.map((s, i) => (
            <div key={s.title}
              className="scene-reveal transition-all duration-1000 group p-6 md:p-7 text-center bg-background-900/60 border border-background-800 hover:border-primary-500/20 hover:bg-background-900/80"
              style={{ opacity: 0, transform: "translateY(24px)", transitionDelay: `${i * 0.1}s` }}>
              <div className="w-14 h-14 mx-auto bg-primary-500/10 flex items-center justify-center mb-4">
                <i className={`${s.icon} text-2xl text-primary-400`} />
              </div>
              <h4 className="font-heading text-sm font-semibold text-background-50 mb-2">{s.title}</h4>
              <p className="text-xs text-background-400 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>

        {/* Connecting linework */}
        <div className="scene-reveal transition-all duration-1000"
          style={{ opacity: 0, transform: "translateY(20px)", transitionDelay: "0.5s" }}>
          <svg viewBox="0 0 1200 60" className="w-full h-auto opacity-40">
            <line x1="0" y1="30" x2="1200" y2="30" stroke="oklch(0.685 0.132 72 / 0.15)" strokeWidth="0.5" strokeDasharray="4 12" />
            <circle cx="200" cy="30" r="3" fill="oklch(0.685 0.132 72 / 0.4)" />
            <circle cx="440" cy="30" r="3" fill="oklch(0.685 0.132 72 / 0.4)" />
            <circle cx="680" cy="30" r="3" fill="oklch(0.685 0.132 72 / 0.4)" />
            <circle cx="920" cy="30" r="3" fill="oklch(0.685 0.132 72 / 0.4)" />
            <circle cx="1160" cy="30" r="3" fill="oklch(0.685 0.132 72 / 0.4)" />
          </svg>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCENE 8 — FINALE (Owl complete + institutional close)
   ═══════════════════════════════════════════════════════════════ */
function SceneIntegratedDiscipline({
  content,
}: {
  content: AboutPageContent["discipline"];
}) {
  const domains = content.domains.filter((item) => item.is_active !== false);
  const levels = content.levels.filter((item) => item.is_active !== false);

  return (
    <section className="relative overflow-hidden bg-background-100 py-24 md:py-36">
      <div className="container-content grid items-start gap-14 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
        <div className="scene-reveal transition-all duration-1000" style={{ opacity: 0, transform: "translateX(-30px)" }}>
          <span className="text-[11px] font-mono text-primary-600 tracking-[0.3em] uppercase mb-4 block">
            {content.eyebrow}
          </span>
          <div className="w-16 h-[2px] bg-primary-500 mb-6" />
          <h2 className="font-heading text-4xl font-bold leading-[1.05] text-background-950 md:text-5xl lg:text-6xl">
            {content.title}
          </h2>
          <p className="mt-7 max-w-lg text-base leading-relaxed text-foreground-600">
            {content.description}
          </p>
          <p className="mt-7 border border-primary-500/50 bg-primary-50 px-5 py-4 text-xs leading-relaxed text-primary-800">
            {content.callout}
          </p>
        </div>

        <div className="scene-reveal transition-all duration-1000" style={{ opacity: 0, transform: "translateX(30px)", transitionDelay: "0.15s" }}>
          <div className="hidden md:block">
            <div className="relative mx-auto h-[500px] max-w-[650px]">
              <div className="absolute left-1/2 top-1/2 h-[390px] w-[390px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-background-300" />
              <div className="absolute left-1/2 top-1/2 z-10 flex h-44 w-44 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-primary-500 bg-background-950 text-center text-background-50 shadow-xl">
                <strong className="font-heading text-xl font-semibold">Project Controls</strong>
                <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-primary-400">Integrated competence</span>
              </div>
              {domains.map(({ title, detail }, index) => {
                const angle = (index * 360) / domains.length - 90;
                return (
                  <div
                    key={title}
                    className="absolute z-20 w-32 -translate-x-1/2 -translate-y-1/2 border border-background-300 bg-background-50 px-3 py-3 text-center shadow-lg"
                    style={{
                      left: `${50 + Math.cos((angle * Math.PI) / 180) * 42}%`,
                      top: `${50 + Math.sin((angle * Math.PI) / 180) * 41}%`,
                    }}
                  >
                    <strong className="block text-xs text-background-950">{title}</strong>
                    <span className="mt-1 block text-[9px] text-foreground-500">{detail}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 md:hidden">
            <div className="col-span-2 border border-primary-500 bg-background-950 p-6 text-center text-background-50">
              <strong className="font-heading text-xl">Project Controls</strong>
              <span className="mt-2 block text-[10px] uppercase tracking-wider text-primary-400">Integrated competence</span>
            </div>
            {domains.map(({ title, detail }) => (
              <div key={title} className="border border-background-300 bg-background-50 p-4 text-center">
                <strong className="block text-xs text-background-950">{title}</strong>
                <span className="mt-1 block text-[10px] text-foreground-500">{detail}</span>
              </div>
            ))}
          </div>

          <dl className="mt-7 space-y-2">
            {levels.map(({ title, description }) => (
              <div key={title} className="grid gap-3 border border-background-300 bg-background-50 p-5 sm:grid-cols-[7rem_1fr]">
                <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary-600">{title}</dt>
                <dd className="text-xs leading-relaxed text-foreground-600">{description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function SceneStandardsRecognition({
  content,
}: {
  content: AboutPageContent["standards"];
}) {
  const principles = content.principles.filter((item) => item.is_active !== false);
  const conduct = content.conduct.filter((item) => item.is_active !== false);

  return (
    <section className="relative overflow-hidden bg-background-950 py-24 text-background-50 md:py-36">
      <div className="absolute inset-0 dot-grid-gold opacity-[0.04]" />
      <div className="container-content relative z-10 grid items-start gap-14 lg:grid-cols-[.82fr_1.18fr] lg:gap-20">
        <div className="scene-reveal transition-all duration-1000" style={{ opacity: 0, transform: "translateX(-30px)" }}>
          <span className="text-[11px] font-mono text-primary-400/80 tracking-[0.3em] uppercase mb-4 block">{content.eyebrow}</span>
          <div className="w-16 gold-rule mb-6" />
          <h2 className="font-heading text-4xl font-bold leading-[1.05] md:text-5xl lg:text-6xl">{content.title}</h2>
          <p className="mt-7 max-w-xl leading-relaxed text-background-300">
            {content.description}
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {principles.map(({ title, description }) => (
              <article key={title} className="border border-background-800 bg-background-900/60 p-5">
                <h3 className="text-xs font-bold text-primary-300">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-background-400">{description}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-3 scene-reveal transition-all duration-1000" style={{ opacity: 0, transform: "translateX(30px)", transitionDelay: "0.15s" }}>
          {conduct.map(({ title, description }, index) => (
            <article key={title} className="border border-background-800 bg-background-900/60 p-6 md:p-7" style={{ marginLeft: `${index * 6}%` }}>
              <h3 className="font-heading text-base font-semibold text-primary-300">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-background-400">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SceneAudiences({
  content,
  audiences,
}: {
  content: AboutPageContent["audiences_intro"];
  audiences: AboutLinkCard[];
}) {
  const cardStyles = [
    "bg-background-950 text-background-50 lg:col-span-5",
    "bg-background-50 text-background-950 lg:col-span-4",
    "bg-accent-700 text-background-50 lg:col-span-3",
    "bg-background-50 text-background-950 lg:col-span-7",
    "bg-background-100 text-background-950 lg:col-span-5",
  ];

  return (
    <section className="bg-background-50 py-24 md:py-36">
      <div className="container-content">
        <div className="scene-reveal transition-all duration-1000" style={{ opacity: 0, transform: "translateY(30px)" }}>
          <span className="text-[11px] font-mono text-primary-600 tracking-[0.3em] uppercase mb-4 block">{content.eyebrow}</span>
          <div className="w-16 h-[2px] bg-primary-500 mb-6" />
          <h2 className="max-w-5xl font-heading text-4xl font-bold leading-[1.05] text-background-950 md:text-5xl lg:text-6xl">
            {content.title}
          </h2>
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-foreground-600">
            {content.description}
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
          {audiences.map((audience, index) => (
            <article key={audience.title} className={`flex min-h-64 flex-col border border-background-300 p-7 ${cardStyles[index % cardStyles.length]}`}>
              <h3 className="font-heading text-lg font-semibold">{audience.title}</h3>
              <p className="mt-4 text-sm leading-relaxed opacity-65">{audience.description}</p>
              <Link to={audience.cta_url} className="mt-auto pt-8 text-sm font-bold">{audience.cta_label} →</Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SceneProfessionalPromise({
  content,
}: {
  content: AboutPageContent["professional_promise"];
}) {
  const items = content.items.filter((item) => item.is_active !== false);

  return (
    <section className="bg-background-100 py-24 md:py-36">
      <div className="container-content grid items-start gap-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-14">
        <div className="flex min-h-[28rem] flex-col bg-accent-700 p-8 text-background-50 md:p-10">
          <span className="text-[11px] font-mono text-primary-300 tracking-[0.25em] uppercase">{content.eyebrow}</span>
          <div className="mt-4 w-12 gold-rule" />
          <h2 className="mt-7 font-heading text-4xl font-bold leading-[1.05]">{content.title}</h2>
          <p className="mt-7 text-sm leading-relaxed text-background-200">{content.description}</p>
          <Link to={content.cta_url} className="mt-auto inline-flex min-h-12 items-center justify-center bg-primary-500 px-6 text-sm font-bold text-background-950 hover:bg-primary-400">{content.cta_label}</Link>
        </div>
        <dl className="space-y-3">
          {items.map((item) => (
            <div key={item.title} className="grid gap-3 border border-background-300 bg-background-50 p-6 sm:grid-cols-[8rem_1fr]">
              <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary-600">{item.title}</dt>
              <dd className="text-sm leading-relaxed text-foreground-600">{item.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function SceneAboutFaq({
  content,
}: {
  content: AboutPageContent["faq"];
}) {
  const items = content.items.filter((item) => item.is_active !== false);
  const [openItem, setOpenItem] = useState(0);

  return (
    <section className="bg-background-50 py-24 md:py-36">
      <div className="container-content grid items-start gap-14 lg:grid-cols-[.75fr_1.25fr] lg:gap-20">
        <div>
          <span className="text-[11px] font-mono text-primary-600 tracking-[0.3em] uppercase mb-4 block">{content.eyebrow}</span>
          <div className="w-16 h-[2px] bg-primary-500 mb-6" />
          <h2 className="font-heading text-4xl font-bold leading-[1.05] text-background-950 md:text-5xl lg:text-6xl">{content.title}</h2>
          <p className="mt-7 max-w-lg leading-relaxed text-foreground-600">{content.description}</p>
        </div>
        <div className="space-y-3">
          {items.map(({ question, answer }, index) => {
            const isOpen = openItem === index;
            return (
              <article key={question} className="border border-background-300 bg-background-50">
                <button type="button" onClick={() => setOpenItem(isOpen ? -1 : index)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-5 p-6 text-left font-bold text-background-950">
                  <span>{question}</span>
                  <span className="text-primary-600" aria-hidden="true">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && <p className="px-6 pb-6 text-sm leading-relaxed text-foreground-600">{answer}</p>}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SceneFinale({
  content,
}: {
  content: AboutPageContent["final_cta"];
}) {
  return (
    <section id="scene-finale" className="relative bg-background-50 py-24 md:py-36 overflow-hidden">
      {/* Final concentric ring backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-[800px] h-[800px]">
        {[380, 300, 220, 140].map((r, i) => (
          <div key={i}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-primary-500/6"
            style={{
              width: r,
              height: r,
              borderRadius: "50%",
              opacity: 0.25 + i * 0.08,
            }}
          />
        ))}
      </div>

      {/* Wing-inspired gold curves */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg viewBox="0 0 1440 800" preserveAspectRatio="none" className="w-full h-full opacity-[0.06]">
          <path d="M 200 400 Q 720 -80 1240 400" fill="none" stroke="oklch(0.685 0.132 72 / 1)" strokeWidth="2" />
          <path d="M 300 400 Q 720 20 1140 400" fill="none" stroke="oklch(0.685 0.132 72 / 1)" strokeWidth="1" strokeDasharray="8 20" />
          <path d="M 100 400 Q 720 -200 1340 400" fill="none" stroke="oklch(0.685 0.132 72 / 0.5)" strokeWidth="0.5" strokeDasharray="2 14" />
        </svg>
      </div>

      <div className="container-content relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">
          {/* Left: Final owl */}
          <div className="lg:w-[42%] shrink-0 scene-reveal transition-all duration-1000"
            style={{ opacity: 0, transform: "translateX(-30px)" }}>
            <div className="relative">
              <img
                loading="lazy"
                decoding="async"
                src="https://readdy.ai/api/search-image?query=Majestic%20eagle%20owl%20with%20pronounced%20ear%20tufts%20standing%20in%20powerful%20poised%20stance%2C%20intense%20golden%20orange%20eyes%20piercing%20forward%2C%20warm%20brown%20cream%20and%20charcoal%20feather%20tones%20with%20elegant%20realistic%20detail%2C%20dramatic%20side%20lighting%20with%20gold%20rim%20light%2C%20dark%20sophisticated%20background%2C%20institutional%20dignity%2C%20professional%20wildlife%20photography%2C%20no%20text%20no%20watermark&width=800&height=1000&seq=about-owl-hero-01&orientation=portrait"
                alt="Institute of Project Controls owl"
                className="w-full h-auto"
              />
              {/* Gold accent */}
              <div className="absolute -bottom-3 -right-3 w-16 h-16 bg-primary-500 hidden md:block" />
            </div>
          </div>

          {/* Right: Institutional close */}
          <div className="flex-1 scene-reveal transition-all duration-1000"
            style={{ opacity: 0, transform: "translateX(30px)", transitionDelay: "0.2s" }}>
            <span className="text-[11px] font-mono text-primary-600 tracking-[0.3em] uppercase mb-4 block">
              {content.eyebrow}
            </span>
            <div className="w-16 h-[2px] bg-primary-500 mb-6" />
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-background-950 leading-[1.1] mb-6">
              {content.title}
              <br />
              <span className="text-primary-600">{content.title_accent}</span>
            </h2>
            <p className="text-base md:text-lg text-foreground-600 leading-relaxed max-w-lg mb-8">
              {content.description}
            </p>
            <p className="text-sm text-foreground-500 leading-relaxed max-w-lg mb-10">
              {content.supporting_description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={content.primary_cta_url}
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 text-background-950 text-sm font-bold tracking-wide hover:bg-primary-400 transition-all duration-300 whitespace-nowrap cursor-pointer">
                <i className="ri-award-line" />
                <span>{content.primary_cta_label}</span>
              </Link>
              <Link to={content.secondary_cta_url}
                className="inline-flex items-center gap-2 px-8 py-4 bg-transparent text-background-950 text-sm font-bold tracking-wide border border-background-300 hover:border-primary-500 transition-all duration-300 whitespace-nowrap cursor-pointer">
                <i className="ri-mail-line" />
                <span>{content.secondary_cta_label}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
