import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import SectionHeader from "@/components/base/SectionHeader";
import {
  isManagedItemActive,
  useManagedSection,
} from "@/components/content/ManagedContentProvider";

type BasicItem = {
  code?: string;
  title: string;
  description: string;
  icon?: string;
  is_active?: boolean;
};

type ServiceCard = BasicItem & {
  bullets: string[];
  meta_label: string;
  meta: string;
  cta: string;
  url: string;
};

type Pillar = BasicItem & {
  slug: string;
  short_title: string;
  highlights: string[];
  services: ServiceCard[];
};

const emptyBase = {
  eyebrow: "",
  title: "",
  description: "",
  items: [] as BasicItem[],
};

function SmartLink({
  to,
  className,
  children,
}: {
  to: string;
  className: string;
  children: React.ReactNode;
}) {
  return to.startsWith("#")
    ? <a href={to} className={className}>{children}</a>
    : <Link to={to} className={className}>{children}</Link>;
}

export function ServicesExperienceHero() {
  const content = useManagedSection("hero", {
    announcement: "Professional and organisational services are open: recognition, capability, learning, research, community and strategic partnership.",
    eyebrow: "Services & Professional Solutions",
    title: "Turn project controls competence into recognised capability.",
    description: "The Institute of Project Controls supports individuals, employers, education partners and professional communities through specialist services built around evidence, competence and credible project decisions.",
    body: "Build professional identity, strengthen organisational capability and connect learning, research and community activity to practical project-controls outcomes.",
    callout_title: "IPC is a specialist professional institution.",
    callout: " Its services are designed to strengthen capability and recognition through evidence — not pay-to-recognise certification or generic management consultancy.",
    primary_cta_label: "Explore Services",
    primary_cta_url: "#service-catalogue",
    secondary_cta_label: "Discuss Your Requirement",
    secondary_cta_url: "/information-session",
    tertiary_cta_label: "Explore Professional Recognition",
    tertiary_cta_url: "/membership",
    panel_eyebrow: "Four service outcomes",
    panel_title: "Professional value from evidence to impact.",
    panel_items: [
      { title: "Recognise", description: "Make professional competence and contribution visible.", icon: "ri-award-line" },
      { title: "Develop", description: "Build capability through structured learning and insight.", icon: "ri-line-chart-line" },
      { title: "Strengthen", description: "Improve organisational project-controls confidence.", icon: "ri-building-4-line" },
      { title: "Connect", description: "Bring professionals, employers and educators together.", icon: "ri-links-line" },
    ] as BasicItem[],
    panel_note: "Designed for professionals, employers, education partners and organisations that value credible project information and stronger delivery decisions.",
  });
  const panelItems = content.panel_items.filter(isManagedItemActive);

  return (
    <section className="relative overflow-hidden bg-background-950 text-background-50">
      <div className="border-b border-background-50/10 bg-black px-4 py-3 text-center text-xs font-semibold text-background-200">
        <strong className="text-primary-400">{content.announcement.split(":")[0]}</strong>
        {content.announcement.includes(":") ? `:${content.announcement.split(":").slice(1).join(":")}` : ""}
      </div>
      <div className="dot-grid absolute inset-0 opacity-[0.08]" aria-hidden="true" />
      <div className="absolute -right-48 top-24 h-[620px] w-[620px] rounded-full border border-primary-500/15" aria-hidden="true" />
      <div className="container-content relative grid min-h-[770px] gap-12 py-20 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:py-24">
        <div className="reveal">
          <span className="eyebrow text-primary-400">{content.eyebrow}</span>
          <h1 className="mt-6 max-w-4xl font-heading text-5xl font-semibold leading-[.96] tracking-[-.04em] sm:text-6xl lg:text-7xl">{content.title}</h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-background-200 md:text-xl">{content.description}</p>
          <p className="mt-5 max-w-2xl text-sm leading-[1.8] text-background-400 md:text-base">{content.body}</p>
          <div className="mt-7 max-w-2xl border-l-2 border-primary-500 bg-background-900/70 px-5 py-4 text-sm leading-relaxed text-background-300">
            <strong className="block text-background-50">{content.callout_title}</strong>{content.callout}
          </div>
          <div className="mt-9 flex flex-wrap gap-3">
            <SmartLink to={content.primary_cta_url} className="btn-primary">{content.primary_cta_label}<i className="ri-arrow-right-line" /></SmartLink>
            <SmartLink to={content.secondary_cta_url} className="btn-secondary">{content.secondary_cta_label}</SmartLink>
            <SmartLink to={content.tertiary_cta_url} className="btn-ghost border-background-50/25 text-background-50 hover:border-primary-400">{content.tertiary_cta_label}</SmartLink>
          </div>
        </div>

        <aside className="reveal relative mx-auto w-full max-w-xl lg:justify-self-end">
          <div className="absolute -inset-5 border border-primary-500/20" aria-hidden="true" />
          <div className="relative border border-background-50/15 bg-background-900/95 p-7 shadow-2xl md:p-9">
            <div className="flex items-center justify-between border-b border-background-50/15 pb-6">
              <div><span className="eyebrow text-primary-400">{content.panel_eyebrow}</span><h2 className="mt-4 max-w-md font-heading text-3xl font-semibold leading-tight">{content.panel_title}</h2></div>
              <i className="ri-radar-line text-4xl text-primary-400" aria-hidden="true" />
            </div>
            <div className="mt-7 grid grid-cols-2 gap-3">
              {panelItems.map((item, index) => (
                <article key={item.title} className="group min-h-44 border border-background-50/10 bg-background-950/70 p-5 transition-colors hover:border-primary-500/50">
                  <div className="flex items-center justify-between"><span className="font-mono text-[10px] font-bold text-primary-400">0{index + 1}</span><i className={`${item.icon ?? "ri-focus-3-line"} text-xl text-primary-400`} /></div>
                  <h3 className="mt-7 font-heading text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-background-400">{item.description}</p>
                </article>
              ))}
            </div>
            <p className="mt-5 border-t border-background-50/10 pt-5 text-xs leading-relaxed text-background-400">{content.panel_note}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

export function ServicesImpactStrip() {
  const content = useManagedSection("impact_strip", { items: [] as BasicItem[] });
  return (
    <section className="relative z-10 bg-background-50">
      <div className="container-content -translate-y-6">
        <div className="grid border-l border-t border-background-300 bg-background-50 shadow-xl sm:grid-cols-2 lg:grid-cols-4">
          {content.items.filter(isManagedItemActive).map((item, index) => (
            <article key={item.title} className="group relative min-h-44 border-b border-r border-background-300 p-6">
              <div className="flex items-center justify-between"><span className="font-mono text-[10px] font-bold text-primary-700">0{index + 1}</span><i className={`${item.icon ?? "ri-user-line"} text-xl text-primary-700`} /></div>
              <h2 className="mt-7 font-heading text-lg font-semibold text-background-950">{item.title}</h2>
              <p className="mt-2 text-xs leading-relaxed text-foreground-600">{item.description}</p>
              <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-primary-500 transition-transform group-hover:scale-x-100" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyServices() {
  const content = useManagedSection("why_services", {
    eyebrow: "", title: "", description: "", body: [] as string[],
    callout_eyebrow: "", callout: "", callout_description: "",
  });
  return (
    <section className="bg-background-100 section-padding">
      <div className="container-content">
        <div className="reveal mx-auto max-w-5xl"><SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} centered /></div>
        <div className="mt-12 grid gap-7 lg:grid-cols-[1.08fr_.92fr]">
          <div className="reveal grid gap-x-8 gap-y-5 border border-background-300 bg-background-50 p-7 md:grid-cols-2 md:p-9">
            {content.body.map((paragraph, index) => (
              <p key={paragraph} className="border-t border-background-300 pt-4 text-sm leading-[1.8] text-foreground-600">
                <span className="mb-2 block font-mono text-[10px] font-bold text-primary-700">0{index + 1}</span>{paragraph}
              </p>
            ))}
          </div>
          <aside className="reveal relative flex min-h-[480px] flex-col justify-between overflow-hidden bg-background-950 p-8 text-background-50 md:p-10 lg:sticky lg:top-28 lg:self-start">
            <i className="ri-double-quotes-l absolute right-6 top-4 text-8xl text-primary-500/10" />
            <div><span className="eyebrow text-primary-400">{content.callout_eyebrow}</span><blockquote className="mt-8 font-heading text-3xl font-semibold leading-tight md:text-4xl">{content.callout}</blockquote></div>
            <p className="mt-10 border-t border-background-50/15 pt-6 text-sm leading-[1.8] text-background-400">{content.callout_description}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}

export function ServiceAudienceMatrix() {
  const content = useManagedSection("audiences", {
    eyebrow: "", title: "", description: "", columns: [] as string[],
    items: [] as Array<{ audience: string; need: string; services: string; outcome: string; is_active?: boolean }>,
  });
  return (
    <section id="audiences" className="scroll-mt-28 bg-background-50 section-padding">
      <div className="container-content">
        <div className="reveal"><SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} centered /></div>
        <div className="reveal mt-12 overflow-x-auto border border-background-300">
          <table className="w-full min-w-[1050px] border-collapse text-left">
            <thead className="bg-background-950 text-background-50"><tr>{content.columns.map((column) => <th key={column} className="border-r border-background-50/15 px-5 py-5 text-[11px] uppercase tracking-[.14em] text-primary-300 last:border-r-0">{column}</th>)}</tr></thead>
            <tbody>{content.items.filter(isManagedItemActive).map((item, index) => (
              <tr key={item.audience} className="group border-t border-background-300 align-top transition-colors hover:bg-background-100">
                <th className="relative w-[18%] border-r border-background-300 px-5 py-5 font-heading text-base text-background-950"><span className="mb-3 block font-mono text-[10px] text-primary-700">0{index + 1}</span>{item.audience}<span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-primary-500 transition-transform group-hover:scale-x-100" /></th>
                <td className="w-[27%] border-r border-background-300 px-5 py-5 text-sm leading-[1.75] text-foreground-600">{item.need}</td>
                <td className="w-[29%] border-r border-background-300 px-5 py-5 text-sm leading-[1.75] text-foreground-600">{item.services}</td>
                <td className="w-[26%] px-5 py-5 text-sm font-medium leading-[1.75] text-background-950">{item.outcome}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <p className="mt-3 text-center text-xs text-foreground-500 md:hidden">Swipe horizontally to compare audiences.</p>
      </div>
    </section>
  );
}

export function ServiceArchitecture() {
  const content = useManagedSection("portfolio", {
    eyebrow: "", title: "", description: "", items: [] as Pillar[],
  });
  const pillars = content.items.filter(isManagedItemActive);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = pillars[activeIndex] ?? pillars[0];
  useEffect(() => { if (activeIndex >= pillars.length) setActiveIndex(0); }, [activeIndex, pillars.length]);
  if (!active) return null;

  return (
    <section id="service-catalogue" className="scroll-mt-28 overflow-hidden bg-background-950 text-background-50 section-padding">
      <div className="container-content">
        <div className="reveal"><SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} centered light /></div>
        <div className="reveal mt-14 border border-background-50/15">
          <div role="tablist" aria-label="Service pillars" className="grid min-w-0 grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar, index) => {
              const selected = index === activeIndex;
              return <button key={pillar.title} type="button" role="tab" aria-selected={selected} onClick={() => setActiveIndex(index)} onMouseEnter={() => setActiveIndex(index)} className={`min-h-36 border-b border-r border-background-50/15 p-5 text-left transition-colors ${selected ? "bg-primary-600 text-background-950" : "bg-background-900 hover:bg-background-800"}`}>
                <div className="flex items-center justify-between"><span className="font-mono text-[10px] font-bold">PILLAR {pillar.code}</span><i className={`${pillar.icon} text-2xl`} /></div>
                <strong className="mt-7 block font-heading text-base leading-tight md:text-lg">{pillar.short_title}</strong>
              </button>;
            })}
          </div>
          <div className="grid lg:grid-cols-[.72fr_1.28fr]">
            <aside className="relative overflow-hidden bg-primary-900 p-7 md:p-10">
              <span className="font-mono text-[10px] font-bold tracking-[.2em] text-primary-300">SERVICE ARCHITECTURE · {active.code}</span>
              <h3 className="mt-7 font-heading text-3xl font-semibold leading-tight md:text-4xl">{active.title}</h3>
              <p className="mt-5 text-sm leading-[1.8] text-background-200">{active.description}</p>
              <ul className="mt-8 divide-y divide-background-50/15 border-y border-background-50/15">
                {active.highlights.map((highlight) => <li key={highlight} className="flex items-start gap-3 py-4 text-sm text-background-200"><i className="ri-check-line text-primary-300" />{highlight}</li>)}
              </ul>
              <i className={`${active.icon} absolute -bottom-10 -right-8 text-[160px] text-primary-400/10`} />
            </aside>
            <div className="grid bg-background-50 text-background-950 md:grid-cols-2">
              {active.services.filter(isManagedItemActive).map((serviceItem) => (
                <article key={serviceItem.code} className="group relative flex min-h-[440px] flex-col border-b border-r border-background-300 p-7">
                  <div className="flex items-center justify-between"><span className="font-mono text-xs font-bold text-primary-700">{serviceItem.code}</span><span className="h-px w-12 bg-primary-500" /></div>
                  <h4 className="mt-8 font-heading text-xl font-semibold leading-tight">{serviceItem.title}</h4>
                  <p className="mt-4 text-sm leading-[1.75] text-foreground-600">{serviceItem.description}</p>
                  <ul className="mt-5 space-y-2">{serviceItem.bullets.map((bullet) => <li key={bullet} className="flex gap-2 text-xs leading-relaxed text-foreground-600"><i className="ri-check-line text-primary-700" />{bullet}</li>)}</ul>
                  <div className="mt-6 border-t border-background-300 pt-4 text-xs leading-relaxed text-foreground-600"><strong className="block text-background-950">{serviceItem.meta_label}</strong>{serviceItem.meta}</div>
                  <SmartLink to={serviceItem.url} className="mt-auto inline-flex items-center gap-2 pt-6 text-xs font-bold uppercase tracking-wide text-primary-800">{serviceItem.cta}<i className="ri-arrow-right-line" /></SmartLink>
                  <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-primary-500 transition-transform group-hover:scale-x-100" />
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CapabilityDiagnostic() {
  const content = useManagedSection("quality", {
    ...emptyBase, panel_eyebrow: "", panel_title: "", panel_description: "",
    panel_items: [] as string[], panel_note: "", notice_title: "", notice: "",
  });
  const domains = content.items.filter(isManagedItemActive);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = domains[activeIndex] ?? domains[0];
  if (!active) return null;
  return (
    <section id="capability-review" className="scroll-mt-28 bg-background-100 section-padding">
      <div className="container-content">
        <div className="reveal"><SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} centered /></div>
        <div className="reveal mt-14 grid overflow-hidden border border-background-300 bg-background-50 lg:grid-cols-[.8fr_1.2fr]">
          <aside className="bg-background-950 p-7 text-background-50 md:p-9">
            <span className="eyebrow text-primary-400">{content.panel_eyebrow}</span>
            <h3 className="mt-6 font-heading text-3xl font-semibold">{content.panel_title}</h3>
            <p className="mt-5 text-sm leading-[1.8] text-background-400">{content.panel_description}</p>
            <ul className="mt-8 space-y-3">{content.panel_items.map((item) => <li key={item} className="flex gap-3 border-b border-background-50/10 pb-3 text-sm text-background-300"><i className="ri-check-line text-primary-400" />{item}</li>)}</ul>
            <p className="mt-7 text-xs leading-relaxed text-background-500">{content.panel_note}</p>
          </aside>
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4">
              {domains.map((domain, index) => {
                const selected = index === activeIndex;
                return <button key={domain.title} type="button" onClick={() => setActiveIndex(index)} onMouseEnter={() => setActiveIndex(index)} className={`min-h-36 border-b border-r border-background-300 p-4 text-left transition-colors ${selected ? "bg-primary-500 text-background-950" : "hover:bg-background-100"}`}>
                  <div className="flex justify-between"><span className="font-mono text-[10px] font-bold">{domain.code}</span><i className={`${domain.icon} text-xl`} /></div><strong className="mt-7 block text-xs leading-snug">{domain.title}</strong>
                </button>;
              })}
            </div>
            <article className="relative min-h-72 p-8 md:p-10">
              <span className="eyebrow text-primary-700">Active review domain · {active.code}</span>
              <h3 className="mt-5 max-w-2xl font-heading text-3xl font-semibold leading-tight text-background-950">{active.title}</h3>
              <p className="mt-5 max-w-3xl text-base leading-[1.8] text-foreground-600">{active.description}</p>
              <i className={`${active.icon} absolute bottom-6 right-8 text-8xl text-primary-500/10`} />
            </article>
          </div>
        </div>
        <aside className="reveal mt-6 border-l-2 border-primary-500 bg-background-50 p-7"><h3 className="font-heading text-xl font-semibold text-background-950">{content.notice_title}</h3><p className="mt-3 text-sm leading-[1.8] text-foreground-600">{content.notice}</p></aside>
      </div>
    </section>
  );
}

function SolutionPanel({ sectionKey, dark }: { sectionKey: "employer_solutions" | "academic_solutions"; dark?: boolean }) {
  const content = useManagedSection(sectionKey, {
    ...emptyBase, body: "", primary_cta_label: "", primary_cta_url: "/information-session",
    secondary_cta_label: "", secondary_cta_url: "/membership",
  });
  return (
    <section id={sectionKey === "employer_solutions" ? "employers" : "academic"} className={`scroll-mt-28 section-padding ${dark ? "bg-primary-900 text-background-50" : "bg-background-50"}`}>
      <div className="container-content grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
        <div className="reveal">
          <SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} light={dark} />
          <p className={`mt-6 text-sm leading-[1.8] ${dark ? "text-background-300" : "text-foreground-600"}`}>{content.body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <SmartLink to={content.primary_cta_url} className="btn-primary">{content.primary_cta_label}<i className="ri-arrow-right-line" /></SmartLink>
            <SmartLink to={content.secondary_cta_url} className={dark ? "btn-secondary" : "btn-ghost"}>{content.secondary_cta_label}</SmartLink>
          </div>
        </div>
        <div className="reveal grid sm:grid-cols-2">
          {content.items.filter(isManagedItemActive).map((item, index) => (
            <article key={item.title} className={`group min-h-48 border p-6 ${dark ? "border-background-50/15 bg-background-950/50" : "border-background-300 bg-background-100"}`}>
              <div className="flex items-center justify-between"><span className={`font-mono text-[10px] font-bold ${dark ? "text-primary-300" : "text-primary-700"}`}>0{index + 1}</span><i className={`${item.icon} text-xl text-primary-500`} /></div>
              <h3 className="mt-8 font-heading text-lg font-semibold">{item.title}</h3>
              <p className={`mt-3 text-sm leading-relaxed ${dark ? "text-background-400" : "text-foreground-600"}`}>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EmployerSolutions() { return <SolutionPanel sectionKey="employer_solutions" />; }
export function AcademicSolutions() { return <SolutionPanel sectionKey="academic_solutions" dark />; }

export function ServiceOutcomes() {
  const content = useManagedSection("outcomes", emptyBase);
  return (
    <section id="outcomes" className="scroll-mt-28 bg-background-100 section-padding">
      <div className="container-content">
        <div className="reveal"><SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} centered /></div>
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {content.items.filter(isManagedItemActive).map((item, index) => (
            <article key={item.title} className={`reveal group relative flex min-h-64 flex-col border border-background-300 p-6 ${index % 3 === 0 ? "bg-background-950 text-background-50 lg:translate-y-6" : index % 3 === 1 ? "bg-background-50" : "bg-primary-100 lg:-translate-y-3"}`}>
              <div className="flex justify-between"><span className={`font-mono text-[10px] font-bold ${index % 3 === 0 ? "text-primary-400" : "text-primary-700"}`}>OUTPUT · 0{index + 1}</span><i className={`${item.icon} text-2xl text-primary-600`} /></div>
              <h3 className="mt-10 font-heading text-xl font-semibold">{item.title}</h3>
              <p className={`mt-4 text-sm leading-[1.8] ${index % 3 === 0 ? "text-background-400" : "text-foreground-600"}`}>{item.description}</p>
              <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-primary-500 transition-transform group-hover:scale-x-100" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ServiceEngagement() {
  const content = useManagedSection("engagement", {
    ...emptyBase, checklist_eyebrow: "", checklist_title: "", checklist: [] as string[],
    cta_label: "", cta_url: "/information-session",
  });
  return (
    <section id="engagement" className="scroll-mt-28 bg-background-50 section-padding">
      <div className="container-content">
        <div className="reveal"><SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} centered /></div>
        <div className="mt-14 grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
          <ol className="reveal grid md:grid-cols-2">
            {content.items.filter(isManagedItemActive).map((item, index) => (
              <li key={item.title} className="group relative min-h-64 border border-background-300 p-6">
                <div className="flex items-center justify-between"><span className="font-mono text-xs font-bold text-primary-700">{item.code ?? `0${index + 1}`}</span><span className="h-px w-12 bg-primary-500" /></div>
                <h3 className="mt-10 font-heading text-xl font-semibold text-background-950">{item.title}</h3><p className="mt-4 text-sm leading-[1.8] text-foreground-600">{item.description}</p>
                <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-primary-500 transition-transform group-hover:scale-x-100" />
              </li>
            ))}
          </ol>
          <aside className="reveal bg-background-950 p-7 text-background-50 md:p-9 lg:sticky lg:top-28 lg:self-start">
            <span className="eyebrow text-primary-400">{content.checklist_eyebrow}</span><h3 className="mt-5 font-heading text-3xl font-semibold">{content.checklist_title}</h3>
            <ul className="mt-8 space-y-3">{content.checklist.map((entry, index) => <li key={entry} className="flex gap-3 border-b border-background-50/10 pb-3 text-sm text-background-300"><span className="font-mono text-[10px] font-bold text-primary-400">0{index + 1}</span>{entry}</li>)}</ul>
            <SmartLink to={content.cta_url} className="btn-primary mt-8 w-full">{content.cta_label}<i className="ri-arrow-right-line" /></SmartLink>
          </aside>
        </div>
      </div>
    </section>
  );
}

export function ServicePrincipleLedger() {
  const content = useManagedSection("principles", emptyBase);
  return (
    <section id="principles" className="scroll-mt-28 overflow-hidden bg-background-950 text-background-50 section-padding">
      <div className="container-content">
        <div className="reveal"><SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} centered light /></div>
        <div className="mt-14 grid border-l border-t border-background-50/15 sm:grid-cols-2 lg:grid-cols-4">
          {content.items.filter(isManagedItemActive).map((item, index) => (
            <article key={item.title} className="reveal group relative min-h-72 border-b border-r border-background-50/15 bg-background-900/50 p-6">
              <div className="flex justify-between"><span className="font-mono text-[10px] font-bold text-primary-400">0{index + 1}</span><i className={`${item.icon} text-xl text-primary-400`} /></div>
              <h3 className="mt-11 font-heading text-xl font-semibold">{item.title}</h3><p className="mt-4 text-sm leading-[1.8] text-background-400">{item.description}</p>
              <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-primary-500 transition-transform group-hover:scale-x-100" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ServiceExperienceFaq() {
  const content = useManagedSection("faq", {
    eyebrow: "", title: "", description: "",
    items: [] as Array<{ question: string; answer: string; is_active?: boolean }>,
  });
  const [open, setOpen] = useState(0);
  return (
    <section className="bg-background-100 section-padding">
      <div className="container-content grid gap-12 lg:grid-cols-12">
        <div className="reveal lg:col-span-5 lg:sticky lg:top-28 lg:self-start"><SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} /></div>
        <div className="reveal space-y-3 lg:col-span-7">{content.items.filter(isManagedItemActive).map((item, index) => {
          const expanded = open === index;
          return <article key={item.question} className="border border-background-300 bg-background-50"><button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? -1 : index)} className="flex w-full items-center justify-between gap-5 p-5 text-left font-semibold text-background-950"><span>{item.question}</span><i className={`${expanded ? "ri-subtract-line" : "ri-add-line"} text-primary-700`} /></button>{expanded && <p className="px-5 pb-5 text-sm leading-[1.8] text-foreground-600">{item.answer}</p>}</article>;
        })}</div>
      </div>
    </section>
  );
}

export function ServicesExperienceCta() {
  const content = useManagedSection("final_cta", {
    eyebrow: "", title: "", description: "",
    primary_cta_label: "", primary_cta_url: "/information-session",
    secondary_cta_label: "", secondary_cta_url: "/membership",
    tertiary_cta_label: "", tertiary_cta_url: "/information-session",
    address: "", email: "",
  });
  return (
    <section className="relative overflow-hidden bg-primary-900 py-20 text-background-50 md:py-28">
      <div className="dot-grid absolute inset-0 opacity-[0.08]" />
      <div className="container-content relative">
        <div className="reveal mx-auto max-w-5xl text-center">
          <span className="eyebrow text-primary-300">{content.eyebrow}</span><h2 className="mt-6 font-heading text-4xl font-semibold leading-tight md:text-6xl">{content.title}</h2><p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-background-200">{content.description}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3"><SmartLink to={content.primary_cta_url} className="btn-primary">{content.primary_cta_label}<i className="ri-arrow-right-line" /></SmartLink><SmartLink to={content.secondary_cta_url} className="btn-secondary">{content.secondary_cta_label}</SmartLink><SmartLink to={content.tertiary_cta_url} className="btn-ghost border-background-50/25 text-background-50">{content.tertiary_cta_label}</SmartLink></div>
          <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs text-background-400"><span><i className="ri-map-pin-line mr-2 text-primary-300" />{content.address}</span><span><i className="ri-mail-line mr-2 text-primary-300" />{content.email}</span></div>
        </div>
      </div>
    </section>
  );
}
