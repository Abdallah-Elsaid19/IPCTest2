import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import SectionHeader from "@/components/base/SectionHeader";
import {
  isManagedItemActive,
  useManagedSection,
} from "@/components/content/ManagedContentProvider";

type ManagedItem = {
  id?: string;
  code?: string;
  title: string;
  description?: string;
  icon?: string;
  topics?: string[];
  bullets?: string[];
  value?: string;
  message?: string;
  audience?: string;
  cta?: string;
  url?: string;
  is_active?: boolean;
};

type BaseSection = {
  eyebrow: string;
  title: string;
  description: string;
  items: ManagedItem[];
};

const emptySection: BaseSection = {
  eyebrow: "",
  title: "",
  description: "",
  items: [],
};

function ActionLink({
  to,
  children,
  className,
}: {
  to: string;
  children: React.ReactNode;
  className: string;
}) {
  if (to.startsWith("#")) {
    return <a href={to} className={className}>{children}</a>;
  }
  return <Link to={to} className={className}>{children}</Link>;
}

export function PublicationHero() {
  const content = useManagedSection("hero", {
    announcement: "Publication proposals are open: submit professional articles, technical case studies, research papers and editorial ideas.",
    eyebrow: "Publications, Research & Professional Knowledge",
    title: "Publish evidence. Advance project controls.",
    description: "The Institute of Project Controls publication programme connects professional practice, academic research, employer insight and the people developing the future of the discipline.",
    body: "Contribute professional magazine articles, technical case studies, academic papers, research notes, interviews and practice guidance on planning, cost, risk, change, forecasting, claims, data assurance, responsible AI, sustainability and leadership.",
    callout: "Publication is not about sounding certain. It is about making evidence, assumptions, methods, limitations, judgement and learning visible enough for others to examine and use.",
    primary_cta_label: "Propose an Article or Paper",
    primary_cta_url: "/information-session",
    secondary_cta_label: "Explore Publication Routes",
    secondary_cta_url: "#publication-routes",
    tertiary_cta_label: "Discuss Academic Partnership",
    tertiary_cta_url: "/information-session",
    panel_title: "IPC Professional Knowledge",
    panel_description: "Evidence, insight and research for project controls.",
    panel_summary: "Professional magazine, academic papers, technical case studies and applied research.",
    panel_items: [
      "Translate credible practice into useful professional knowledge.",
      "Connect academic research with live project-controls challenges.",
      "Share methods, limitations, lessons and measurable outcomes.",
      "Support responsible innovation across the discipline.",
    ] as string[],
    panel_note_title: "Staged publication programme",
    panel_note: "Proposals are received through the information-session route. Formal issue dates and journal arrangements are announced only after approval.",
  });

  return (
    <section className="relative overflow-hidden bg-background-950 text-background-50">
      <div className="border-b border-background-50/10 bg-black px-4 py-3 text-center text-xs font-semibold tracking-wide text-background-100">
        <i className="ri-quill-pen-line mr-2 text-primary-400" aria-hidden="true" />
        {content.announcement}
      </div>
      <div className="dot-grid absolute inset-0 opacity-[0.08]" aria-hidden="true" />
      <div className="container-content relative grid min-h-[760px] gap-12 py-20 lg:grid-cols-[1.06fr_.94fr] lg:items-center lg:py-24">
        <div className="reveal">
          <span className="eyebrow text-primary-400">{content.eyebrow}</span>
          <h1 className="mt-6 max-w-4xl font-heading text-4xl font-semibold leading-[0.98] tracking-[-0.04em] text-background-50 sm:text-6xl lg:text-7xl">
            {content.title}
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-background-200 md:text-xl">
            {content.description}
          </p>
          {content.body && (
            <p className="mt-5 max-w-2xl text-sm leading-[1.8] text-background-400 md:text-base">
              {content.body}
            </p>
          )}
          {content.callout && (
            <blockquote className="mt-8 max-w-2xl border-l-2 border-primary-500 bg-background-900/70 px-5 py-4 text-sm font-medium leading-relaxed text-background-100">
              {content.callout}
            </blockquote>
          )}
          <div className="mt-9 flex flex-wrap gap-3">
            <ActionLink to={content.primary_cta_url} className="btn-primary">
              {content.primary_cta_label}<i className="ri-arrow-right-line" aria-hidden="true" />
            </ActionLink>
            <ActionLink to={content.secondary_cta_url} className="btn-secondary">
              {content.secondary_cta_label}
            </ActionLink>
            <ActionLink to={content.tertiary_cta_url} className="btn-ghost border-background-50/25 text-background-50 hover:border-primary-400 hover:text-primary-300">
              {content.tertiary_cta_label}
            </ActionLink>
          </div>
        </div>

        <div className="reveal relative mx-auto w-full max-w-xl lg:justify-self-end">
          <div className="absolute -left-5 top-8 h-full w-full border border-primary-500/25 bg-primary-900/10" aria-hidden="true" />
          <article className="relative border border-background-50/20 bg-background-900/95 p-7 shadow-2xl md:p-9">
            <div className="flex items-start justify-between gap-4 border-b border-background-50/15 pb-7">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-primary-400">Knowledge dossier · 01</span>
                <h2 className="mt-4 font-heading text-3xl font-semibold">{content.panel_title}</h2>
                <p className="mt-2 text-sm text-background-400">{content.panel_description}</p>
              </div>
              <i className="ri-book-open-line text-3xl text-primary-400" aria-hidden="true" />
            </div>
            <p className="mt-7 text-base leading-relaxed text-background-200">{content.panel_summary}</p>
            <ul className="mt-7 divide-y divide-background-50/10 border-y border-background-50/10">
              {content.panel_items.map((item, index) => (
                <li key={item} className="flex items-start gap-4 py-4 text-sm leading-relaxed text-background-200">
                  <span className="font-mono text-[10px] font-bold text-primary-400">0{index + 1}</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-7 bg-background-950 p-5">
              <strong className="text-sm text-primary-300">{content.panel_note_title}</strong>
              <p className="mt-2 text-xs leading-relaxed text-background-400">{content.panel_note}</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export function WhyPublish() {
  const content = useManagedSection("why_publish", {
    eyebrow: "",
    title: "",
    description: "",
    body: [] as string[],
    callout_title: "",
    callout: "",
    callout_description: "",
  });

  return (
    <section className="bg-background-50 section-padding">
      <div className="container-content">
        <div className="reveal mx-auto max-w-5xl">
          <SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} centered />
        </div>
        <div className="mt-12 grid gap-x-14 gap-y-7 lg:grid-cols-2">
          {content.body.map((paragraph, index) => (
            <p key={paragraph} className="reveal border-t border-background-300 pt-5 text-base leading-[1.85] text-foreground-600">
              <span className="mb-3 block font-mono text-[10px] font-bold tracking-[0.2em] text-primary-700">0{index + 1}</span>
              {paragraph}
            </p>
          ))}
        </div>
        <aside className="reveal mx-auto mt-12 max-w-5xl border-l-2 border-primary-500 bg-background-100 p-7 md:p-9">
          <span className="eyebrow text-primary-700">{content.callout_title}</span>
          <p className="mt-4 font-heading text-2xl font-semibold leading-snug text-background-950 md:text-3xl">{content.callout}</p>
          <p className="mt-4 text-sm leading-relaxed text-foreground-600">{content.callout_description}</p>
        </aside>
      </div>
    </section>
  );
}

export function PublicationRoutes() {
  const content = useManagedSection<BaseSection>("routes", emptySection);
  const items = content.items.filter(isManagedItemActive);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = items[activeIndex] ?? items[0];

  useEffect(() => {
    if (activeIndex >= items.length) setActiveIndex(0);
  }, [activeIndex, items.length]);

  if (!active) return null;
  return (
    <section id="publication-routes" className="scroll-mt-28 bg-background-100 section-padding">
      <div className="container-content">
        <div className="reveal">
          <SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} centered />
        </div>
        <div className="reveal mt-12 grid overflow-hidden border border-background-300 bg-background-50 lg:grid-cols-[.82fr_1.18fr]">
          <div role="tablist" aria-label={content.title} className="border-b border-background-300 lg:border-b-0 lg:border-r">
            {items.map((item, index) => {
              const selected = index === activeIndex;
              return (
                <button
                  key={item.title}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveIndex(index)}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "mouse") setActiveIndex(index);
                  }}
                  className={`group flex w-full touch-manipulation items-center gap-4 border-b border-background-300 p-5 text-left transition-colors last:border-b-0 ${selected ? "bg-background-950 text-background-50" : "hover:bg-background-100"}`}
                >
                  <span className={`font-mono text-[10px] font-bold tracking-widest ${selected ? "text-primary-400" : "text-primary-700"}`}>{item.code ?? `0${index + 1}`}</span>
                  <i className={`${item.icon ?? "ri-article-line"} text-xl ${selected ? "text-primary-400" : "text-primary-700"}`} aria-hidden="true" />
                  <strong className="flex-1 font-heading text-base">{item.title}</strong>
                  <i className="ri-arrow-right-line" aria-hidden="true" />
                </button>
              );
            })}
          </div>
          <article role="tabpanel" className="relative flex min-h-[520px] flex-col justify-between overflow-hidden bg-background-950 p-8 text-background-50 md:p-12">
            <span className="absolute -right-16 -top-20 font-heading text-[260px] font-bold leading-none text-background-50/[0.025]" aria-hidden="true">{active.code}</span>
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="eyebrow text-primary-400">Selected publication route</span>
                <i className={`${active.icon ?? "ri-article-line"} text-4xl text-primary-400`} aria-hidden="true" />
              </div>
              <h3 className="mt-12 max-w-2xl font-heading text-4xl font-semibold leading-tight md:text-5xl">{active.title}</h3>
              <p className="mt-7 max-w-2xl text-lg leading-[1.8] text-background-300">{active.description}</p>
            </div>
            <div className="relative mt-12 flex flex-wrap items-center justify-between gap-5 border-t border-background-50/15 pt-7">
              <span className="text-xs uppercase tracking-[0.18em] text-background-500">Practice · research · contribution</span>
              {active.cta && active.url && (
                <ActionLink to={active.url} className="btn-primary">{active.cta}<i className="ri-arrow-right-line" aria-hidden="true" /></ActionLink>
              )}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export function EditorialThemes() {
  const content = useManagedSection<BaseSection>("themes", emptySection);
  const items = content.items.filter(isManagedItemActive);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = items[activeIndex] ?? items[0];
  if (!active) return null;

  return (
    <section className="overflow-hidden bg-background-950 text-background-50 section-padding">
      <div className="container-content">
        <div className="reveal">
          <SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} centered light />
        </div>
        <div className="reveal mt-14 border border-background-50/15">
          <div className="grid lg:grid-cols-[1.1fr_.9fr]">
            <div className="grid grid-cols-2 md:grid-cols-3">
              {items.map((item, index) => {
                const selected = index === activeIndex;
                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    onPointerEnter={(event) => {
                      if (event.pointerType === "mouse") setActiveIndex(index);
                    }}
                    className={`min-h-48 touch-manipulation border-b border-r border-background-50/15 p-5 text-left transition-colors md:min-h-56 ${selected ? "bg-primary-600 text-background-950" : "bg-background-900 hover:bg-background-800"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-mono text-[10px] font-bold ${selected ? "text-background-950" : "text-primary-400"}`}>0{index + 1}</span>
                      <i className={`${item.icon ?? "ri-focus-3-line"} text-2xl`} aria-hidden="true" />
                    </div>
                    <span className="mt-16 block text-xs font-bold uppercase tracking-[0.14em] opacity-75">{item.description}</span>
                    <strong className="mt-2 block font-heading text-lg leading-tight">{item.title}</strong>
                  </button>
                );
              })}
            </div>
            <article className="relative min-h-[520px] bg-background-50 p-8 text-background-950 md:p-11">
              <span className="eyebrow text-primary-700">Research spectrum · 0{activeIndex + 1}</span>
              <h3 className="mt-6 font-heading text-3xl font-semibold leading-tight">{active.title}</h3>
              <p className="mt-4 text-base text-foreground-600">{active.description}</p>
              <ul className="mt-10 divide-y divide-background-300 border-y border-background-300">
                {(active.topics ?? []).map((topic, index) => (
                  <li key={topic} className="flex items-center gap-4 py-5">
                    <span className="font-mono text-[10px] font-bold text-primary-700">0{index + 1}</span>
                    <span className="font-medium">{topic}</span>
                  </li>
                ))}
              </ul>
              <i className={`${active.icon ?? "ri-focus-3-line"} absolute bottom-8 right-8 text-7xl text-primary-500/15`} aria-hidden="true" />
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SubmissionFormats() {
  const content = useManagedSection("formats", {
    eyebrow: "",
    title: "",
    description: "",
    columns: [] as string[],
    items: [] as Array<{ format: string; purpose: string; length: string; evidence: string; audience: string; is_active?: boolean }>,
  });
  const items = content.items.filter(isManagedItemActive);
  return (
    <section className="bg-background-50 section-padding">
      <div className="container-content">
        <div className="reveal">
          <SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} centered />
        </div>
        <div className="reveal mt-12 overflow-x-auto border border-background-300">
          <table className="w-full min-w-[1100px] border-collapse text-left">
            <thead className="bg-background-950 text-background-50">
              <tr>{content.columns.map((column) => <th key={column} className="border-r border-background-50/15 px-5 py-5 text-[11px] uppercase tracking-[0.13em] text-primary-300 last:border-r-0">{column}</th>)}</tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.format} className="group border-t border-background-300 align-top transition-colors hover:bg-background-100">
                  <th className="relative w-[18%] border-r border-background-300 px-5 py-5 font-heading text-base text-background-950">
                    <span className="mb-3 block font-mono text-[10px] text-primary-700">0{index + 1}</span>{item.format}
                    <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-primary-500 transition-transform group-hover:scale-x-100" />
                  </th>
                  <td className="w-[27%] border-r border-background-300 px-5 py-5 text-sm leading-relaxed text-foreground-600">{item.purpose}</td>
                  <td className="w-[15%] border-r border-background-300 px-5 py-5 text-sm font-medium text-background-950">{item.length}</td>
                  <td className="w-[25%] border-r border-background-300 px-5 py-5 text-sm leading-relaxed text-foreground-600">{item.evidence}</td>
                  <td className="w-[15%] px-5 py-5 text-sm leading-relaxed text-foreground-600">{item.audience}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-center text-xs text-foreground-500 md:hidden">Swipe horizontally to compare formats.</p>
      </div>
    </section>
  );
}

export function AudienceValue() {
  const content = useManagedSection<BaseSection>("audiences", emptySection);
  const items = content.items.filter(isManagedItemActive);
  return (
    <section className="bg-background-100 section-padding">
      <div className="container-content">
        <div className="reveal"><SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} centered /></div>
        <div className="reveal mt-12 overflow-hidden border border-background-300 bg-background-50">
          <div className="hidden grid-cols-[.55fr_1.2fr_1.25fr] bg-background-950 px-6 py-4 text-[10px] font-bold uppercase tracking-[0.17em] text-primary-300 md:grid">
            <span>Audience</span><span>Value created</span><span>Professional message</span>
          </div>
          {items.map((item, index) => (
            <article key={item.audience ?? item.title} className="group grid border-t border-background-300 first:border-t-0 md:grid-cols-[.55fr_1.2fr_1.25fr]">
              <div className="relative bg-background-100 p-6 font-heading text-xl font-semibold text-background-950">
                <span className="mb-3 block font-mono text-[10px] text-primary-700">0{index + 1}</span>{item.audience ?? item.title}
                <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-primary-500 transition-transform group-hover:scale-x-100" />
              </div>
              <p className="border-t border-background-300 p-6 text-sm leading-[1.75] text-foreground-600 md:border-l md:border-t-0">{item.value}</p>
              <p className="border-t border-background-300 p-6 text-sm font-medium leading-[1.75] text-background-950 md:border-l md:border-t-0">{item.message}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EditorialValues() {
  const content = useManagedSection<BaseSection>("principles", emptySection);
  return (
    <section className="bg-background-50 section-padding">
      <div className="container-content">
        <div className="reveal"><SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} centered /></div>
        <div className="mt-12 grid border-l border-t border-background-300 sm:grid-cols-2 lg:grid-cols-3">
          {content.items.filter(isManagedItemActive).map((item, index) => (
            <article key={item.title} className="reveal group relative min-h-72 border-b border-r border-background-300 p-7 transition-colors hover:bg-background-100">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold tracking-widest text-primary-700">0{index + 1}</span>
                <i className={`${item.icon ?? "ri-check-double-line"} text-2xl text-primary-700`} aria-hidden="true" />
              </div>
              <h3 className="mt-12 font-heading text-xl font-semibold text-background-950">{item.title}</h3>
              <p className="mt-4 text-sm leading-[1.8] text-foreground-600">{item.description}</p>
              <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-primary-500 transition-transform duration-300 group-hover:scale-x-100" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ResearchIntegrity() {
  const content = useManagedSection("integrity", {
    ...emptySection,
    protocol_title: "",
    protocol_items: [] as string[],
    protocol_note: "",
  });
  return (
    <section className="overflow-hidden bg-background-950 text-background-50 section-padding">
      <div className="container-content">
        <div className="reveal"><SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} centered light /></div>
        <div className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <div className="grid sm:grid-cols-2">
            {content.items.filter(isManagedItemActive).map((item, index) => (
              <article key={item.title} className="reveal min-h-64 border border-background-50/15 bg-background-900/60 p-6">
                <div className="flex items-center justify-between text-primary-400"><span className="font-mono text-[10px] font-bold">{item.code ?? `0${index + 1}`}</span><i className={`${item.icon ?? "ri-shield-check-line"} text-xl`} /></div>
                <h3 className="mt-9 font-heading text-xl font-semibold">{item.title}</h3>
                <p className="mt-4 text-sm leading-[1.8] text-background-400">{item.description}</p>
              </article>
            ))}
          </div>
          <aside className="reveal border border-primary-500/35 bg-primary-950/20 p-7 md:p-9">
            <span className="eyebrow text-primary-400">Author accountability protocol</span>
            <h3 className="mt-5 font-heading text-3xl font-semibold leading-tight">{content.protocol_title}</h3>
            <ol className="mt-8 space-y-3">
              {content.protocol_items.map((rule, index) => (
                <li key={rule} className="flex gap-4 border-b border-background-50/10 pb-3 text-sm leading-relaxed text-background-200">
                  <span className="font-mono text-[10px] font-bold text-primary-400">0{index + 1}</span>{rule}
                </li>
              ))}
            </ol>
            <p className="mt-7 border-l-2 border-primary-500 pl-4 text-xs leading-relaxed text-background-400">{content.protocol_note}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}

export function EditorialProcess() {
  const content = useManagedSection("process", {
    ...emptySection,
    checklist_title: "",
    checklist: [] as string[],
  });
  return (
    <section className="bg-background-100 section-padding">
      <div className="container-content">
        <div className="reveal"><SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} centered /></div>
        <ol className="relative mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {content.items.filter(isManagedItemActive).map((item, index) => (
            <li key={item.title} className="reveal group relative min-h-72 border border-background-300 bg-background-50 p-6">
              <div className="flex items-center justify-between"><span className="font-mono text-xs font-bold text-primary-700">{item.code ?? `0${index + 1}`}</span><span className="h-px w-12 bg-primary-500" /></div>
              <h3 className="mt-12 font-heading text-xl font-semibold leading-tight text-background-950">{item.title}</h3>
              <p className="mt-4 text-sm leading-[1.8] text-foreground-600">{item.description}</p>
              <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-primary-500 transition-transform group-hover:scale-x-100" />
            </li>
          ))}
        </ol>
        <aside className="reveal mt-10 border border-background-300 bg-background-50 p-7 md:p-9">
          <h3 className="font-heading text-2xl font-semibold text-background-950">{content.checklist_title}</h3>
          <ul className="mt-7 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {content.checklist.map((item) => <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-foreground-600"><i className="ri-check-line mt-0.5 text-primary-700" />{item}</li>)}
          </ul>
        </aside>
      </div>
    </section>
  );
}

export function ContributorValue() {
  const content = useManagedSection<BaseSection>("contributor_value", emptySection);
  const items = content.items.filter(isManagedItemActive);
  return (
    <section className="bg-background-50 section-padding">
      <div className="container-content">
        <div className="reveal"><SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} centered /></div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <article key={item.title} className={`reveal group relative border border-background-300 p-7 transition-all hover:-translate-y-1 hover:shadow-xl ${index === 0 || index === 5 ? "bg-background-950 text-background-50 md:row-span-2" : "bg-background-100 text-background-950"}`}>
              <div className="flex items-center justify-between"><span className={`font-mono text-[10px] font-bold ${index === 0 || index === 5 ? "text-primary-400" : "text-primary-700"}`}>0{index + 1}</span><i className={`${item.icon ?? "ri-quill-pen-line"} text-2xl text-primary-600`} /></div>
              <h3 className="mt-12 font-heading text-xl font-semibold">{item.title}</h3>
              <p className={`mt-4 text-sm leading-[1.8] ${index === 0 || index === 5 ? "text-background-400" : "text-foreground-600"}`}>{item.description}</p>
              <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-primary-500 transition-transform group-hover:scale-x-100" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PartnerValue() {
  const content = useManagedSection<BaseSection>("partner_value", emptySection);
  return (
    <section className="bg-background-100 section-padding">
      <div className="container-content">
        <div className="reveal"><SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} centered /></div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {content.items.filter(isManagedItemActive).map((item, index) => (
            <article key={item.title} className="reveal flex min-h-[420px] flex-col border border-background-300 bg-background-50 p-7">
              <div className="flex items-center justify-between"><span className="font-mono text-[10px] font-bold text-primary-700">0{index + 1}</span><i className={`${item.icon ?? "ri-building-line"} text-2xl text-primary-700`} /></div>
              <h3 className="mt-10 font-heading text-2xl font-semibold text-background-950">{item.title}</h3>
              <p className="mt-4 text-sm leading-[1.8] text-foreground-600">{item.description}</p>
              <ul className="mt-auto space-y-3 border-t border-background-300 pt-6">
                {(item.bullets ?? []).map((bullet) => <li key={bullet} className="flex items-start gap-3 text-sm text-foreground-600"><i className="ri-check-line text-primary-700" />{bullet}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PublicationSponsorship() {
  const content = useManagedSection("sponsorship", {
    ...emptySection,
    cta_label: "",
    cta_url: "/information-session",
  });
  const items = content.items.filter(isManagedItemActive);
  return (
    <section className="overflow-hidden bg-primary-900 text-background-50 section-padding">
      <div className="container-content">
        <div className="reveal"><SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} centered light /></div>
        <div className="relative mt-14 grid gap-5 lg:grid-cols-4">
          <div className="absolute left-[12%] right-[12%] top-10 hidden h-px bg-primary-400/50 lg:block" aria-hidden="true" />
          {items.map((item, index) => (
            <article key={item.title} className="reveal relative border border-background-50/20 bg-background-950/80 p-7">
              <span className="relative z-10 grid h-12 w-12 place-items-center rounded-full border border-primary-400 bg-primary-900 font-mono text-xs font-bold text-primary-300">0{index + 1}</span>
              <i className={`${item.icon ?? "ri-book-open-line"} mt-10 block text-3xl text-primary-400`} />
              <h3 className="mt-5 font-heading text-xl font-semibold">{item.title}</h3>
              <p className="mt-4 text-sm leading-[1.8] text-background-300">{item.description}</p>
            </article>
          ))}
        </div>
        {content.cta_label && <div className="mt-10 flex justify-center"><ActionLink to={content.cta_url} className="btn-primary">{content.cta_label}<i className="ri-arrow-right-line" /></ActionLink></div>}
      </div>
    </section>
  );
}

export function PublicationFaq() {
  const content = useManagedSection("faq", {
    eyebrow: "",
    title: "",
    description: "",
    items: [] as Array<{ question: string; answer: string; is_active?: boolean }>,
  });
  const [open, setOpen] = useState(0);
  return (
    <section className="bg-background-50 section-padding">
      <div className="container-content grid gap-12 lg:grid-cols-12">
        <div className="reveal lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
          <SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} />
        </div>
        <div className="reveal space-y-3 lg:col-span-7">
          {content.items.filter(isManagedItemActive).map((item, index) => {
            const expanded = open === index;
            return (
              <article key={item.question} className="border border-background-300 bg-background-50">
                <button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? -1 : index)} className="flex w-full items-center justify-between gap-5 p-5 text-left font-semibold text-background-950">
                  <span>{item.question}</span><i className={`${expanded ? "ri-subtract-line" : "ri-add-line"} text-primary-700`} />
                </button>
                {expanded && <p className="px-5 pb-5 text-sm leading-[1.8] text-foreground-600">{item.answer}</p>}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function PublicationFinalCta() {
  const content = useManagedSection("final_cta", {
    eyebrow: "",
    title: "",
    description: "",
    primary_cta_label: "",
    primary_cta_url: "/information-session",
    secondary_cta_label: "",
    secondary_cta_url: "/information-session",
    tertiary_cta_label: "",
    tertiary_cta_url: "/sponsorship",
    address: "",
    email: "",
  });
  return (
    <section className="relative overflow-hidden bg-background-950 py-20 text-background-50 md:py-28">
      <div className="dot-grid absolute inset-0 opacity-[0.08]" aria-hidden="true" />
      <div className="container-content relative">
        <div className="reveal mx-auto max-w-5xl text-center">
          <span className="eyebrow text-primary-400">{content.eyebrow}</span>
          <h2 className="mt-6 font-heading text-4xl font-semibold leading-tight md:text-6xl">{content.title}</h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-background-300">{content.description}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <ActionLink to={content.primary_cta_url} className="btn-primary">{content.primary_cta_label}<i className="ri-arrow-right-line" /></ActionLink>
            <ActionLink to={content.secondary_cta_url} className="btn-secondary">{content.secondary_cta_label}</ActionLink>
            <ActionLink to={content.tertiary_cta_url} className="btn-ghost border-background-50/25 text-background-50 hover:border-primary-400">{content.tertiary_cta_label}</ActionLink>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs text-background-500">
            <span><i className="ri-map-pin-line mr-2 text-primary-400" />{content.address}</span>
            <span><i className="ri-mail-line mr-2 text-primary-400" />{content.email}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
