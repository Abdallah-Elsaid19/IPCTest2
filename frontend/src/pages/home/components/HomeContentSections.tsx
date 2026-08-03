import { useState } from "react";
import { Link } from "react-router-dom";
import SectionHeader from "@/components/base/SectionHeader";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

interface HomeItem {
  icon?: string;
  label?: string;
  title: string;
  description?: string;
  value?: string;
  message?: string;
  bullets?: string[];
  cta?: string;
  url?: string;
  is_active?: boolean;
}

interface HomeSection {
  eyebrow: string;
  title: string;
  description: string;
  body?: string | string[];
  items: HomeItem[];
  primary_cta_label?: string;
  primary_cta_url?: string;
  secondary_cta_label?: string;
  secondary_cta_url?: string;
}

const emptySection: HomeSection = { eyebrow: "", title: "", description: "", items: [] };
const audienceBackgroundImage = "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/039fc75f7728429f8a294535a1709411.png";
const ecosystemFeaturedImage = "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/d0f6d70df5284b2f9ed7cf6719c378c5.png";
const eventsBackgroundImage = "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/6021c9e5d78345d08a725310665764a5.png";
const scholarshipsBackgroundImage = "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/843058ed72c640f7883802573e14de22.png";
const awardsBackgroundImage = "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/9218ac450fae4f9a83ea3e4946430ff9.png";
const clubsMapImage = "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/b53e42f5674147bcad53ecaa0e2d041b.png";

function SectionActions({ content, dark = false, align = "center" }: { content: HomeSection; dark?: boolean; align?: "center" | "start" }) {
  if (!content.primary_cta_label && !content.secondary_cta_label) return null;
  return (
    <div className={`mt-9 flex flex-wrap gap-3 ${align === "start" ? "justify-start" : "justify-center"}`}>
      {content.primary_cta_label && content.primary_cta_url && (
        <Link to={content.primary_cta_url} className="btn-primary">{content.primary_cta_label}<i className="ri-arrow-right-line" aria-hidden="true" /></Link>
      )}
      {content.secondary_cta_label && content.secondary_cta_url && (
        <Link to={content.secondary_cta_url} className={dark ? "btn-secondary" : "inline-flex min-h-[50px] items-center justify-center border border-background-300 px-7 font-label text-sm font-semibold uppercase tracking-[0.02em] text-background-950 transition-colors hover:border-background-950"}>
          {content.secondary_cta_label}
        </Link>
      )}
    </div>
  );
}

function HomeFeatureSection({
  sectionKey,
  dark = false,
  muted = false,
  columns = 4,
  backgroundImage,
}: {
  sectionKey: string;
  dark?: boolean;
  muted?: boolean;
  columns?: 3 | 4;
  backgroundImage?: string;
}) {
  const content = useManagedSection<HomeSection>(sectionKey, emptySection);
  const background = dark ? "bg-background-950" : muted ? "bg-background-100" : "bg-background-50";
  const grid = columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4";
  const body = Array.isArray(content.body) ? content.body : content.body ? [content.body] : [];

  return (
    <section className={`relative overflow-hidden ${background} section-padding`}>
      {backgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
            aria-hidden="true"
          />
          <div className={`absolute inset-0 ${dark ? "bg-background-950/55" : "bg-background-100/55"}`} aria-hidden="true" />
        </>
      )}
      <div className="container-content relative z-10">
        <div className="reveal">
          <SectionHeader
            eyebrow={content.eyebrow}
            title={content.title}
            subtitle={content.description}
            centered
            light={dark}
            eyebrowClassName={dark ? "text-primary-300" : "text-primary-700"}
          />
        </div>
        {body.length > 0 && (
          <div className={`reveal mx-auto mt-8 max-w-4xl space-y-4 text-center text-sm leading-relaxed md:text-base ${dark ? "text-background-300" : "text-foreground-600"}`}>
            {body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        )}
        <div className={`mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 md:mt-16 ${grid}`}>
          {content.items.filter(isManagedItemActive).map((item, index) => (
            <article
              key={`${item.title}-${index}`}
              className={`reveal group relative flex h-full min-h-64 flex-col border p-6 transition-all duration-300 ${
                dark
                  ? "border-background-50/15 bg-background-900/50 hover:border-primary-500/50"
                  : "border-background-200/70 bg-background-50 hover:-translate-y-1 hover:border-primary-400"
              }`}
              style={{ transitionDelay: `${index * 45}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  {item.label && <span className={`eyebrow ${dark ? "text-primary-300" : "text-primary-700"}`}>{item.label}</span>}
                  <h3 className={`font-heading text-xl font-semibold leading-tight ${item.label ? "mt-4" : ""} ${dark ? "text-background-50" : "text-background-950"}`}>{item.title}</h3>
                </div>
                {item.icon && <i className={`${item.icon} shrink-0 text-2xl ${dark ? "text-primary-300" : "text-primary-700"}`} aria-hidden="true" />}
              </div>
              {item.description && <p className={`mt-4 text-sm leading-relaxed ${dark ? "text-background-300" : "text-foreground-600"}`}>{item.description}</p>}
              {item.bullets && (
                <ul className={`mt-5 space-y-2 border-t pt-4 text-xs leading-relaxed ${dark ? "border-background-50/10 text-background-300" : "border-background-200 text-foreground-600"}`}>
                  {item.bullets.map((bullet) => <li key={bullet} className="flex items-start gap-2"><i className="ri-check-line mt-0.5 text-primary-500" aria-hidden="true" />{bullet}</li>)}
                </ul>
              )}
              {item.cta && item.url && <Link to={item.url} className={`mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold ${dark ? "text-primary-300" : "text-primary-700"}`}>{item.cta}<i className="ri-arrow-right-line" aria-hidden="true" /></Link>}
              <span className="absolute inset-x-0 bottom-0 h-[1px] origin-left scale-x-0 bg-primary-500 transition-transform duration-300 group-hover:scale-x-100" />
            </article>
          ))}
        </div>
        <SectionActions content={content} dark={dark} />
      </div>
    </section>
  );
}

function HomeRadialFeatureSection({ sectionKey }: { sectionKey: string }) {
  const content = useManagedSection<HomeSection>(sectionKey, emptySection);
  const items = content.items.filter(isManagedItemActive);
  const [activeIndex, setActiveIndex] = useState(0);
  const safeIndex = Math.min(activeIndex, Math.max(items.length - 1, 0));
  const activeItem = items[safeIndex];

  return (
    <section className="relative overflow-hidden bg-background-50 section-padding">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${eventsBackgroundImage})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-background-50/25" aria-hidden="true" />
      <div className="absolute inset-0 dot-grid opacity-[0.05]" />
      <div className="container-content relative z-10">
        <div className="grid items-center gap-14 lg:grid-cols-[1.08fr_.92fr] lg:gap-12">
          <div className="reveal">
            <span className="eyebrow text-primary-700">{content.eyebrow}</span>
            <h2 className="mt-7 max-w-3xl font-heading text-[clamp(2.5rem,3.6vw,4.25rem)] font-extrabold leading-[0.98] tracking-[-0.035em] text-background-950 [overflow-wrap:normal] [word-break:normal]">{content.title}</h2>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-foreground-600 md:text-lg">{content.description}</p>
            <SectionActions content={content} align="start" />
          </div>

          {activeItem && (
            <div className="reveal">
              <div className="relative mx-auto hidden aspect-square w-full max-w-[580px] lg:block">
                <svg viewBox="0 0 620 620" className="absolute inset-0 h-full w-full" aria-hidden="true">
                  <circle cx="310" cy="310" r="245" fill="none" stroke="oklch(0.685 0.132 72 / 0.18)" />
                  <circle cx="310" cy="310" r="195" fill="none" stroke="oklch(0.685 0.132 72 / 0.1)" strokeDasharray="5 10" />
                  <circle cx="310" cy="310" r="135" fill="none" stroke="oklch(0.685 0.132 72 / 0.07)" />
                </svg>
                {items.map((item, index) => {
                  const angle = (-90 + index * (360 / items.length)) * (Math.PI / 180);
                  const position = {
                    left: `${50 + Math.cos(angle) * 40}%`,
                    top: `${50 + Math.sin(angle) * 40}%`,
                  };
                  const active = index === safeIndex;
                  return (
                    <button
                      key={item.title}
                      type="button"
                      aria-label={`Show ${item.title}`}
                      aria-pressed={active}
                      onMouseEnter={() => setActiveIndex(index)}
                      onFocus={() => setActiveIndex(index)}
                      onClick={() => setActiveIndex(index)}
                      style={position}
                      className={`absolute z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border font-mono text-xs font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                        active
                          ? "scale-110 border-primary-500 bg-primary-500 text-background-950 shadow-[0_12px_35px_oklch(var(--primary-500)/0.25)]"
                          : "border-primary-500/35 bg-background-50 text-primary-800 hover:border-primary-500"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </button>
                  );
                })}
                <article className="absolute left-1/2 top-1/2 z-10 flex min-h-64 w-[58%] -translate-x-1/2 -translate-y-1/2 flex-col justify-center rounded-2xl border border-background-200/80 bg-background-100/95 p-8 shadow-[0_24px_70px_rgba(35,28,19,0.08)] backdrop-blur-sm">
                  <span className="eyebrow text-primary-700">{activeItem.label ?? `Topic ${safeIndex + 1}`}</span>
                  <h3 className="mt-5 font-heading text-2xl font-semibold leading-tight text-background-950">{activeItem.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-foreground-600">{activeItem.description}</p>
                  <span className="mt-7 h-[3px] w-full bg-primary-500" />
                </article>
              </div>

              <div className="grid gap-3 lg:hidden">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {items.map((item, index) => (
                    <button
                      key={item.title}
                      type="button"
                      aria-pressed={index === safeIndex}
                      onClick={() => setActiveIndex(index)}
                      className={`h-12 min-w-12 rounded-full border font-mono text-xs font-bold ${
                        index === safeIndex ? "border-primary-500 bg-primary-500 text-background-950" : "border-background-300 bg-background-50 text-primary-800"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </button>
                  ))}
                </div>
                <article className="border border-background-200 bg-background-100 p-6">
                  <span className="eyebrow text-primary-700">{activeItem.label}</span>
                  <h3 className="mt-4 font-heading text-2xl font-semibold text-background-950">{activeItem.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-foreground-600">{activeItem.description}</p>
                </article>
              </div>
              <p className="mt-3 hidden text-center font-mono text-[10px] uppercase tracking-[0.3em] text-foreground-400 lg:block">Hover or select to explore</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function HomeDecisionConfidence() {
  const content = useManagedSection<HomeSection>("decision_confidence", emptySection);
  return (
    <section className="border-b border-background-800 bg-background-950 py-14 text-background-50">
      <div className="container-content">
        <div className="reveal text-center">
          <span className="eyebrow text-primary-300">{content.eyebrow}</span>
          <h2 className="mt-4 font-heading text-2xl font-semibold md:text-3xl">{content.title}</h2>
        </div>
        <div className="mt-10 grid gap-px overflow-hidden border border-background-50/10 bg-background-50/10 sm:grid-cols-2 lg:grid-cols-6">
          {content.items.filter(isManagedItemActive).map((item) => (
            <article key={item.title} className="bg-background-950 p-5">
              <i className={`${item.icon ?? "ri-focus-3-line"} text-xl text-primary-300`} aria-hidden="true" />
              <h3 className="mt-4 font-heading text-base font-semibold">{item.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-background-300">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeWhyIpc() {
  const content = useManagedSection("why_ipc", {
    eyebrow: "Why IPC exists",
    title: "Project controls deserves its own visible professional identity.",
    description: "",
    body: [] as string[],
    callout_title: "The IPC proposition",
    callout: "",
  });
  return (
    <section className="bg-background-50 section-padding">
      <div className="container-content">
        <div className="reveal">
          <SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} centered />
        </div>
        <div className="reveal mx-auto mt-12 flex max-w-5xl flex-col gap-6 text-left text-[15px] leading-[1.75] text-foreground-600 md:text-base">
          {content.body.map((paragraph) => (
            <p key={paragraph} className="m-0 max-w-none">{paragraph}</p>
          ))}
        </div>
        <div className="reveal mx-auto mt-12 max-w-5xl border-l-[3px] border-primary-500 bg-background-100 p-6 md:p-8">
          <span className="eyebrow text-primary-700">{content.callout_title}</span>
          <p className="mt-3 font-heading text-lg font-semibold leading-relaxed text-background-950 md:text-xl">{content.callout}</p>
        </div>
      </div>
    </section>
  );
}

export function HomeValues() { return <HomeFeatureSection sectionKey="values" muted columns={3} />; }

export function HomeAudiences() {
  const content = useManagedSection<HomeSection>("audiences", emptySection);
  return (
    <section className="relative overflow-hidden bg-background-50 section-padding">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${audienceBackgroundImage})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-background-50/35" aria-hidden="true" />
      <div className="container-content relative z-10">
        <div className="reveal"><SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} centered /></div>
        <div className="reveal mt-12 overflow-x-auto border border-background-200/70 bg-background-50/90 shadow-lg backdrop-blur-sm md:mt-16" tabIndex={0} aria-label="Audience value proposition">
          <table className="w-full min-w-[900px] border-collapse">
            <thead className="bg-background-950 text-background-50">
              <tr>{["Audience", "Value from IPC", "Core message"].map((label) => <th key={label} className="px-6 py-5 text-left text-xs uppercase tracking-wider">{label}</th>)}</tr>
            </thead>
            <tbody>
              {content.items.filter(isManagedItemActive).map((item, index) => (
                <tr key={item.title} className={`border-b border-background-200/70 ${index % 2 ? "bg-background-100/90" : "bg-background-50/90"}`}>
                  <th scope="row" className="w-1/5 px-6 py-6 text-left align-top font-semibold text-background-950">{item.title}</th>
                  <td className="w-2/5 px-6 py-6 align-top text-sm leading-relaxed text-foreground-600">{item.value}</td>
                  <td className="w-2/5 px-6 py-6 align-top text-sm font-medium leading-relaxed text-background-950">{item.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function HomeEcosystem() {
  const content = useManagedSection<HomeSection>("ecosystem", emptySection);
  const items = content.items
    .filter(isManagedItemActive)
    .filter((item) => item.title !== "Corporate & Academic Partners" && item.label !== "Partnership")
    .map((item) => item.title === "Magazine & Research" || item.label === "Knowledge"
      ? { ...item, url: "/publications" }
      : item);
  const cardSpans = [
    "lg:col-span-2 lg:row-span-2",
    "lg:col-span-1",
    "lg:col-span-1",
    "lg:col-span-1",
    "lg:col-span-1",
    "lg:col-span-2",
    "lg:col-span-1",
    "lg:col-span-1",
  ];

  return (
    <section className="relative overflow-hidden bg-background-950 section-padding">
      <div className="absolute inset-0 dot-grid opacity-[0.06]" />
      <div className="pointer-events-none absolute -right-48 -top-48 h-[700px] w-[700px] rounded-full border border-primary-500/10" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-[450px] w-[450px] rounded-full border border-dashed border-primary-500/10" />
      <div className="container-content relative z-10">
        <div className="reveal grid items-end gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="eyebrow text-primary-300">{content.eyebrow}</span>
            <h2 className="mt-6 max-w-3xl font-heading text-[clamp(2.6rem,5vw,5.3rem)] font-extrabold leading-[0.96] tracking-[-0.04em] text-background-50">{content.title}</h2>
          </div>
          <p className="max-w-xl text-base leading-relaxed text-background-300 md:text-lg">{content.description}</p>
        </div>

        <div className="mt-12 grid auto-rows-[minmax(230px,auto)] grid-cols-1 gap-4 sm:grid-cols-2 md:mt-16 lg:grid-cols-4">
          {items.map((item, index) => {
            const featured = index === 0;
            return (
              <article
                key={item.title}
                className={`reveal group relative flex h-full min-h-64 flex-col overflow-hidden border border-background-50/15 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary-500/60 md:p-7 ${cardSpans[index] ?? "lg:col-span-1"} ${
                  featured ? "bg-accent-800/35 lg:p-10" : index === 5 ? "bg-primary-500/10" : "bg-background-900/65"
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {featured && (
                  <>
                    <img
                      src={ecosystemFeaturedImage}
                      alt=""
                      className="pointer-events-none absolute inset-x-0 top-0 h-[54%] w-full object-cover object-center"
                      aria-hidden="true"
                    />
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-[54%] bg-gradient-to-b from-background-950/15 via-transparent to-accent-950/95" />
                  </>
                )}
                <div className="relative z-10 flex items-start justify-between gap-5">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-primary-300">
                    {item.label ?? `Route ${String(index + 1).padStart(2, "0")}`}
                  </span>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-primary-500/25 bg-primary-500/10 text-xl text-primary-300 transition-colors group-hover:bg-primary-500 group-hover:text-background-950">
                    <i className={item.icon ?? "ri-links-line"} aria-hidden="true" />
                  </span>
                </div>
                <div className="relative z-10 mt-auto pt-12">
                  <h3 className={`font-heading font-semibold leading-tight text-background-50 ${featured ? "max-w-xl text-3xl md:text-4xl" : "text-xl"}`}>{item.title}</h3>
                  <p className={`mt-4 leading-relaxed text-background-300 ${featured ? "max-w-2xl text-base" : "text-sm"}`}>{item.description}</p>
                  {item.cta && item.url && (
                    <Link to={item.url} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-300 transition-colors hover:text-primary-200">
                      {item.cta}<i className="ri-arrow-right-line transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </Link>
                  )}
                </div>
                <span className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-primary-500 transition-transform duration-300 group-hover:scale-x-100" />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function HomeEvents() { return <HomeRadialFeatureSection sectionKey="events" />; }

export function HomeScholarships() {
  const content = useManagedSection<HomeSection>("scholarships", emptySection);
  const items = content.items.filter(isManagedItemActive);
  const [activeIndex, setActiveIndex] = useState(0);
  const safeIndex = Math.min(activeIndex, Math.max(items.length - 1, 0));
  const places = content.description.match(/\b\d+\b/)?.[0] ?? "40";

  return (
    <section className="relative overflow-hidden bg-background-950 section-padding">
      <div
        className="absolute inset-0 hidden bg-contain bg-center bg-no-repeat md:block"
        style={{ backgroundImage: `url(${scholarshipsBackgroundImage})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-background-950/45" aria-hidden="true" />
      <div className="absolute inset-0 dot-grid opacity-[0.04]" />
      <div className="container-content relative z-10">
        <div className="grid items-start gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div className="reveal lg:sticky lg:top-28">
            <span className="eyebrow text-primary-300">{content.eyebrow}</span>
            <h2 className="mt-7 max-w-2xl font-heading text-[clamp(2.6rem,4.7vw,5rem)] font-extrabold leading-[0.96] tracking-[-0.04em] text-background-50">{content.title}</h2>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-background-300 md:text-lg">{content.description}</p>
            {content.body && (
              <p className="mt-6 max-w-xl border-l-[3px] border-primary-500 pl-5 text-sm leading-relaxed text-background-400">
                {Array.isArray(content.body) ? content.body.join(" ") : content.body}
              </p>
            )}

            <div className="relative mt-10 flex min-h-56 max-w-xl items-center overflow-hidden border border-background-50/15 bg-background-900/60 px-8 py-7">
              <div className="pointer-events-none absolute -right-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full border border-primary-500/15" />
              <div className="pointer-events-none absolute -right-8 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full border border-dashed border-primary-500/20" />
              <div className="relative z-10">
                <span className="block font-heading text-[7rem] font-extrabold leading-none tracking-[-0.08em] text-primary-400 md:text-[9rem]">{places}</span>
                <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.28em] text-background-300">Potential places per intake</span>
                <span className="mt-3 block max-w-xs text-xs leading-relaxed text-background-500">Subject to funding, eligibility, capacity and written approval.</span>
              </div>
            </div>
            <SectionActions content={content} dark align="start" />
          </div>

          <div className="reveal">
            <div className="mb-6 flex items-end justify-between gap-5 border-b border-background-50/10 pb-5">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary-300">Opportunity index</span>
                <p className="mt-2 text-sm text-background-400">Explore the routes that can widen professional access.</p>
              </div>
              <span className="font-mono text-xs text-background-500">{String(safeIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
            </div>

            <div className="divide-y divide-background-50/10 border-y border-background-50/10">
              {items.map((item, index) => {
                const active = index === safeIndex;
                return (
                  <article key={item.title} className={`group relative transition-colors duration-300 ${active ? "bg-background-900/80" : "hover:bg-background-900/40"}`}>
                    <button
                      type="button"
                      aria-expanded={active}
                      onMouseEnter={() => setActiveIndex(index)}
                      onFocus={() => setActiveIndex(index)}
                      onClick={() => setActiveIndex(index)}
                      className="flex w-full items-center gap-5 px-4 py-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 sm:px-6"
                    >
                      <span className={`font-mono text-xs font-bold transition-colors ${active ? "text-primary-300" : "text-background-500"}`}>{String(index + 1).padStart(2, "0")}</span>
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center border transition-all duration-300 ${
                        active ? "border-primary-500 bg-primary-500 text-background-950" : "border-background-50/15 text-primary-300"
                      }`}>
                        <i className={item.icon ?? "ri-door-open-line"} aria-hidden="true" />
                      </span>
                      <h3 className={`flex-1 font-heading text-lg font-semibold transition-colors md:text-xl ${active ? "text-background-50" : "text-background-300"}`}>{item.title}</h3>
                      <i className={`ri-arrow-down-s-line text-xl text-primary-300 transition-transform duration-300 ${active ? "rotate-180" : ""}`} aria-hidden="true" />
                    </button>
                    <div className={`grid transition-all duration-500 ${active ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                      <div className="overflow-hidden">
                        <div className="grid gap-5 px-4 pb-7 pl-[6.5rem] sm:grid-cols-[1fr_auto] sm:items-end sm:px-6 sm:pl-[8rem]">
                          <p className="max-w-xl text-sm leading-relaxed text-background-300">{item.description}</p>
                          <span className="h-[3px] w-20 bg-primary-500" />
                        </div>
                      </div>
                    </div>
                    <span className={`absolute inset-y-0 left-0 w-[3px] bg-primary-500 transition-transform duration-300 ${active ? "scale-y-100" : "scale-y-0"}`} />
                  </article>
                );
              })}
            </div>
            <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.25em] text-background-600">Hover or select a route to explore</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeAwards() { return <HomeFeatureSection sectionKey="awards" muted backgroundImage={awardsBackgroundImage} />; }

export function HomeClubs() {
  const content = useManagedSection<HomeSection>("clubs", emptySection);
  const items = content.items.filter(isManagedItemActive);

  return (
    <section className="relative overflow-hidden bg-background-50 section-padding">
      <img
        src={clubsMapImage}
        alt=""
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-[72%] object-contain object-right opacity-25 md:opacity-55 lg:w-[58%] lg:opacity-90"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background-50 via-background-50/75 to-transparent" aria-hidden="true" />
      <div className="container-content relative z-10">
        <div className="grid items-start gap-x-10 gap-y-10 lg:grid-cols-12">
          <div className="reveal lg:col-span-8">
            <span className="eyebrow text-primary-700">{content.eyebrow}</span>
            <span className="mt-4 block h-px w-36 bg-primary-500" />
            <h2 className="mt-6 max-w-4xl font-heading text-[clamp(2.3rem,4vw,4.25rem)] font-extrabold leading-[1.02] text-background-950">
              {content.title}
            </h2>
            <p className="mt-7 max-w-4xl text-base leading-relaxed text-foreground-600 md:text-lg">
              {content.description}
            </p>
          </div>

          <div className="reveal grid gap-4 sm:grid-cols-2 lg:col-span-10 xl:grid-cols-4">
            {items.map((item) => (
              <article key={item.title} className="relative flex min-h-72 flex-col border border-background-200/80 bg-background-50 p-6">
                <h3 className="pr-8 font-heading text-base font-semibold text-background-950 2xl:text-lg">{item.title}</h3>
                <i className={`${item.icon ?? "ri-map-pin-line"} absolute right-6 top-6 text-xl text-primary-700`} aria-hidden="true" />
                <span className="mt-5 h-px w-10 bg-primary-500" />
                <p className="mt-5 text-sm leading-relaxed text-foreground-600">{item.description}</p>
              </article>
            ))}
          </div>

          <div className="reveal lg:col-span-8">
            <SectionActions content={{ ...content, secondary_cta_label: "Support a Club" }} align="start" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomePublications() { return <HomeFeatureSection sectionKey="publications" muted />; }
export function HomePartners() { return <HomeFeatureSection sectionKey="partners" dark />; }

export function HomeSponsorship() {
  const content = useManagedSection<HomeSection>("sponsorship", emptySection);
  const items = content.items.filter(isManagedItemActive);
  const routeItems = items.slice(0, -1);
  const strategicItem = items.at(-1);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = items[Math.min(activeIndex, Math.max(items.length - 1, 0))];
  const routeY = [54, 126, 198, 270, 342];
  const routePaths = [
    "M 218 54 H 472 Q 520 54 520 96",
    "M 218 126 H 292 Q 312 126 326 142 L 430 178",
    "M 218 198 H 416",
    "M 218 270 H 292 Q 312 270 326 254 L 430 222",
    "M 218 342 H 356 Q 378 342 378 320 V 296 Q 378 276 398 276 H 440",
  ];
  const routeNodes = [
    [[320, 54], [472, 54], [520, 96]],
    [[292, 126], [326, 142], [430, 178]],
    [[288, 198], [416, 198]],
    [[292, 270], [326, 254], [430, 222]],
    [[356, 342], [378, 320], [440, 276]],
  ];

  return (
    <section className="overflow-hidden bg-background-50 section-padding">
      <div className="container-content">
        <div className="grid items-start gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
          <div className="reveal lg:sticky lg:top-28">
            <span className="eyebrow text-primary-700">{content.eyebrow}</span>
            <h2 className="mt-7 max-w-3xl font-heading text-4xl font-extrabold leading-[0.98] tracking-[-0.04em] text-background-950 sm:text-5xl lg:text-6xl">{content.title}</h2>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-foreground-600 md:text-lg">{content.description}</p>
            {content.body && (
              <p className="mt-6 max-w-xl border-l-[3px] border-primary-500 pl-5 text-sm leading-relaxed text-foreground-600">
                {Array.isArray(content.body) ? content.body.join(" ") : content.body}
              </p>
            )}
            <SectionActions content={content} align="start" />
          </div>

          {activeItem && (
            <div className="reveal relative overflow-hidden bg-background-950 p-5 text-background-50 sm:p-7 md:p-9">
              <div className="absolute inset-0 dot-grid opacity-[0.08]" />
              <div className="pointer-events-none absolute -right-40 -top-40 h-[540px] w-[540px] rounded-full border border-primary-500/10" />
              <div className="relative z-10 flex items-center justify-between gap-5 border-b border-background-50/10 pb-5">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary-300">Partnership route map</span>
                  <p className="mt-2 text-xs text-background-400">Select a route to explore its role in the partnership.</p>
                </div>
                <span className="hidden items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-background-500 sm:flex">
                  <span className="h-2 w-2 rounded-full bg-primary-500 shadow-[0_0_12px_oklch(var(--primary-500))]" />
                  Interactive
                </span>
              </div>

              <div className="relative z-10 mt-6 hidden h-[400px] lg:block">
                <svg viewBox="0 0 700 400" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
                  <defs>
                    <filter id="sponsorship-route-glow" x="-40%" y="-40%" width="180%" height="180%">
                      <feGaussianBlur stdDeviation="3.5" result="blur" />
                      <feFlood floodColor="#d99121" floodOpacity="0.75" />
                      <feComposite in2="blur" operator="in" />
                      <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  {routeItems.map((item, index) => {
                    const active = activeIndex === index || activeIndex === items.length - 1;
                    return (
                      <g key={item.title} className="transition-all duration-500">
                        <path
                          d={routePaths[index]}
                          fill="none"
                          stroke={active ? "#d99121" : "#77736a"}
                          strokeWidth={active ? "3.5" : "2.5"}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity={active ? "1" : "0.56"}
                          filter={active ? "url(#sponsorship-route-glow)" : undefined}
                          className="transition-all duration-500"
                        />
                        {routeNodes[index]?.map(([cx, cy], nodeIndex) => (
                          <circle
                            key={`${item.title}-${nodeIndex}`}
                            cx={cx}
                            cy={cy}
                            r={active ? "5" : "4"}
                            fill={active ? "#d99121" : "#77736a"}
                            opacity={active ? "1" : "0.72"}
                            filter={active ? "url(#sponsorship-route-glow)" : undefined}
                            className="transition-all duration-500"
                          />
                        ))}
                      </g>
                    );
                  })}
                  <circle cx="520" cy="200" r="104" fill="none" stroke="#d99121" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.48" />
                  <circle cx="520" cy="200" r="82" fill="none" stroke="#d99121" strokeWidth="2.5" opacity="0.9" filter="url(#sponsorship-route-glow)" />
                </svg>

                {routeItems.map((item, index) => {
                  const active = activeIndex === index;
                  return (
                    <button
                      key={item.title}
                      type="button"
                      aria-pressed={active}
                      onMouseEnter={() => setActiveIndex(index)}
                      onFocus={() => setActiveIndex(index)}
                      onClick={() => setActiveIndex(index)}
                      className={`absolute left-0 flex h-14 w-[218px] -translate-y-1/2 items-center gap-4 border px-4 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                        active
                          ? "translate-x-2 border-primary-500 bg-primary-500 text-background-950 shadow-[0_12px_30px_oklch(var(--primary-500)/0.2)]"
                          : "border-background-50/15 bg-background-900/80 text-background-100 hover:border-primary-500/50"
                      }`}
                      style={{ top: `${(routeY[index] / 400) * 100}%` }}
                    >
                      <span className={`font-mono text-[10px] font-bold ${active ? "text-background-950" : "text-primary-300"}`}>{String(index + 1).padStart(2, "0")}</span>
                      <span className="text-xs font-semibold leading-tight">{item.title}</span>
                    </button>
                  );
                })}

                {strategicItem && (
                  <button
                    type="button"
                    aria-pressed={activeIndex === items.length - 1}
                    onMouseEnter={() => setActiveIndex(items.length - 1)}
                    onFocus={() => setActiveIndex(items.length - 1)}
                    onClick={() => setActiveIndex(items.length - 1)}
                    className={`absolute left-[74.3%] top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-2 p-5 text-center shadow-[0_0_22px_rgba(217,145,33,0.3),inset_0_0_28px_rgba(217,145,33,0.08)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                      activeIndex === items.length - 1
                        ? "scale-105 border-primary-400 bg-primary-500 text-background-950 shadow-[0_0_34px_rgba(217,145,33,0.55)]"
                        : "border-primary-500/90 bg-background-950 text-background-50 hover:border-primary-400 hover:shadow-[0_0_30px_rgba(217,145,33,0.48),inset_0_0_28px_rgba(217,145,33,0.1)]"
                    }`}
                  >
                    <i className={`${strategicItem.icon ?? "ri-links-line"} text-2xl`} aria-hidden="true" />
                    <span className="mt-3 text-xs font-bold leading-tight">{strategicItem.title}</span>
                  </button>
                )}
              </div>

              <div className="relative z-10 mt-6 grid grid-cols-2 gap-2 lg:hidden">
                {items.map((item, index) => (
                  <button
                    key={item.title}
                    type="button"
                    aria-pressed={activeIndex === index}
                    onClick={() => setActiveIndex(index)}
                    className={`min-h-16 border p-3 text-left text-xs font-semibold transition-colors ${
                      activeIndex === index ? "border-primary-500 bg-primary-500 text-background-950" : "border-background-50/15 bg-background-900 text-background-100"
                    }`}
                  >
                    <span className="mr-2 font-mono text-[9px]">{String(index + 1).padStart(2, "0")}</span>
                    {item.title}
                  </button>
                ))}
              </div>

              <article aria-live="polite" className="relative z-10 mt-7 grid gap-5 border border-background-50/15 bg-background-900/90 p-6 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                <span className="flex h-12 w-12 items-center justify-center border border-primary-500/30 bg-primary-500/10 text-2xl text-primary-300">
                  <i className={activeItem.icon ?? "ri-links-line"} aria-hidden="true" />
                </span>
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-primary-300">Selected route</span>
                  <h3 className="mt-2 font-heading text-xl font-semibold text-background-50">{activeItem.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-background-300">{activeItem.description}</p>
                </div>
                <span className="h-[3px] w-full bg-primary-500 sm:h-16 sm:w-[3px]" />
              </article>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function HomeGovernance() { return <HomeFeatureSection sectionKey="governance" dark />; }

export function HomeFaq() {
  const content = useManagedSection("faq", { eyebrow: "", title: "", description: "", items: [] as { question: string; answer: string; is_active?: boolean }[] });
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-background-100 section-padding">
      <div className="container-content">
        <div className="reveal"><SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} centered /></div>
        <div className="reveal mx-auto mt-12 max-w-4xl space-y-3 md:mt-16">
          {content.items.filter(isManagedItemActive).map((item, index) => {
            const expanded = open === index;
            return (
              <article key={item.question} className="border border-background-200/70 bg-background-50">
                <h3>
                  <button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : index)} className="flex w-full items-center justify-between gap-5 px-6 py-5 text-left font-heading font-semibold text-background-950">
                    {item.question}<i className={`${expanded ? "ri-subtract-line" : "ri-add-line"} text-primary-700`} aria-hidden="true" />
                  </button>
                </h3>
                {expanded && <p className="px-6 pb-6 text-sm leading-relaxed text-foreground-600">{item.answer}</p>}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function HomeFinalCta() {
  const content = useManagedSection("final_cta", {
    eyebrow: "", title: "", description: "",
    primary_cta_label: "", primary_cta_url: "",
    secondary_cta_label: "", secondary_cta_url: "",
    tertiary_cta_label: "", tertiary_cta_url: "",
    address: "", email: "",
  });
  return (
    <section className="relative overflow-hidden bg-background-950 py-20 text-background-50 md:py-28">
      <div className="absolute inset-0 dot-grid opacity-[0.08]" />
      <div className="container-content relative z-10 text-center">
        <div className="reveal mx-auto max-w-4xl">
          <span className="eyebrow text-primary-300">{content.eyebrow}</span>
          <h2 className="mt-5 font-heading text-3xl font-bold leading-tight md:text-5xl">{content.title}</h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-background-300 md:text-lg">{content.description}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link to={content.primary_cta_url} className="btn-primary">{content.primary_cta_label}</Link>
            <Link to={content.tertiary_cta_url} className="btn-secondary">{content.tertiary_cta_label}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
