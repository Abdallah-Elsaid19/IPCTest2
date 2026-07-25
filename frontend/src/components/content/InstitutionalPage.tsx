import { Link } from "react-router-dom";
import { isManagedItemActive, ManagedSectionGate, useManagedSection } from "./ManagedContentProvider";

export interface ContentLink {
  label: string;
  url: string;
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  eyebrow?: string;
  icon?: string;
  bullets?: string[];
  is_active?: boolean;
}

export interface ContentSection {
  eyebrow?: string;
  title: string;
  description?: string;
  items?: ContentItem[];
}

export interface HeroContent extends ContentSection {
  primary_cta_label: string;
  primary_cta_url: string;
  secondary_cta_label?: string;
  secondary_cta_url?: string;
}

function RouteLink({ link, className }: { link: ContentLink; className: string }) {
  return link.url.startsWith("#")
    ? <a href={link.url} className={className}>{link.label}<i className="ri-arrow-right-line" /></a>
    : <Link to={link.url} className={className}>{link.label}<i className="ri-arrow-right-line" /></Link>;
}

export function InstitutionalHero({ fallback }: { fallback: HeroContent }) {
  const content = useManagedSection("hero", fallback);
  return (
    <section className="relative overflow-hidden bg-background-950 pb-20 pt-36 md:pb-28 md:pt-44">
      <div className="absolute inset-0 dot-grid-gold opacity-20" />
      <div className="absolute -right-40 top-8 h-[540px] w-[540px] rounded-full border border-primary-500/15" />
      <div className="absolute -right-20 top-24 h-[410px] w-[410px] rounded-full border border-dashed border-primary-500/10" />
      <div className="container-content relative z-10">
        <nav aria-label="Breadcrumb" className="mb-10 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-background-500">
          <Link to="/home" className="hover:text-primary-400">Home</Link><i className="ri-arrow-right-s-line" /><span aria-current="page">{content.eyebrow}</span>
        </nav>
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary-400">{content.eyebrow}</span>
        <h1 className="mt-6 max-w-5xl font-heading text-[clamp(2.8rem,7vw,6.5rem)] font-extrabold leading-[0.96] tracking-[-0.045em] text-background-50">{content.title}</h1>
        {content.description && <p className="mt-8 max-w-3xl text-base leading-[1.8] text-background-300 md:text-lg">{content.description}</p>}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <RouteLink link={{ label: content.primary_cta_label, url: content.primary_cta_url }} className="inline-flex items-center justify-center gap-3 bg-primary-500 px-6 py-3.5 text-sm font-bold text-background-950 transition hover:bg-primary-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-400" />
          {content.secondary_cta_label && content.secondary_cta_url && <RouteLink link={{ label: content.secondary_cta_label, url: content.secondary_cta_url }} className="inline-flex items-center justify-center gap-3 border border-background-700 px-6 py-3.5 text-sm font-bold text-background-100 transition hover:border-primary-500 hover:text-primary-400" />}
        </div>
      </div>
    </section>
  );
}

export function InstitutionalCards({ name, fallback, dark = false, id }: { name: string; fallback: ContentSection; dark?: boolean; id?: string }) {
  const content = useManagedSection(name, fallback);
  const items = (content.items ?? []).filter(isManagedItemActive);
  return (
    <ManagedSectionGate name={name}>
      <section id={id} className={`relative scroll-mt-24 section-padding ${dark ? "bg-background-950 text-background-50" : "bg-background-50 text-foreground-950"}`}>
        <div className="container-content">
          <div className="mb-14 max-w-3xl">
            {content.eyebrow && <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary-500">{content.eyebrow}</span>}
            <h2 className="mt-5 font-heading text-[clamp(2rem,4vw,3.8rem)] font-extrabold leading-[1.05] tracking-[-0.035em]">{content.title}</h2>
            {content.description && <p className={`mt-6 max-w-2xl leading-[1.8] ${dark ? "text-background-400" : "text-foreground-600"}`}>{content.description}</p>}
          </div>
          {items.length > 0 && <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
                  <article key={item.id} className={`group border p-6 transition hover:-translate-y-1 md:p-8 ${dark ? "border-background-800 bg-background-900/70 hover:border-primary-500/40" : "border-background-200 bg-white hover:border-primary-500/50 hover:shadow-xl"}`}> 
                  <div className="mb-7 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-primary-500">{String(index + 1).padStart(2, "0")}</span>
                  {item.icon && <i className={`${item.icon} text-xl text-primary-500`} aria-hidden="true" />}
                </div>
                {item.eyebrow && <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-primary-500">{item.eyebrow}</p>}
                <h3 className="font-heading text-xl font-bold">{item.title}</h3>
                <p className={`mt-4 text-sm leading-[1.75] ${dark ? "text-background-400" : "text-foreground-600"}`}>{item.description}</p>
                {item.bullets && <ul className={`mt-5 space-y-2 text-sm ${dark ? "text-background-300" : "text-foreground-700"}`}>{item.bullets.map((bullet) => <li key={bullet} className="flex gap-2"><i className="ri-checkbox-blank-circle-fill mt-2 text-[5px] text-primary-500" /><span>{bullet}</span></li>)}</ul>}
              </article>
            ))}
          </div>}
        </div>
      </section>
    </ManagedSectionGate>
  );
}

export function InstitutionalProcess({ fallback }: { fallback: ContentSection }) {
  const content = useManagedSection("process", fallback);
  const items = (content.items ?? []).filter(isManagedItemActive);
  return (
    <ManagedSectionGate name="process">
      <section className="bg-background-100 section-padding">
        <div className="container-content">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4"><span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary-600">{content.eyebrow}</span><h2 className="mt-5 font-heading text-4xl font-extrabold text-foreground-950">{content.title}</h2><p className="mt-5 leading-[1.8] text-foreground-600">{content.description}</p></div>
            <ol className="lg:col-span-7 lg:col-start-6">
              {items.map((item, index) => <li key={item.id} className="grid grid-cols-[3rem_1fr] gap-5 border-t border-background-300 py-6"><span className="font-mono text-sm text-primary-600">{String(index + 1).padStart(2, "0")}</span><div><h3 className="font-heading text-lg font-bold text-foreground-950">{item.title}</h3><p className="mt-2 text-sm leading-[1.7] text-foreground-600">{item.description}</p></div></li>)}
            </ol>
          </div>
        </div>
      </section>
    </ManagedSectionGate>
  );
}

export function InstitutionalFaq({ fallback }: { fallback: ContentSection }) {
  const content = useManagedSection("faq", fallback);
  const items = (content.items ?? []).filter(isManagedItemActive);
  return (
    <ManagedSectionGate name="faq">
      <section className="bg-background-50 section-padding">
        <div className="container-content max-w-4xl">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary-600">{content.eyebrow}</span>
          <h2 className="mb-10 mt-5 font-heading text-4xl font-extrabold text-foreground-950">{content.title}</h2>
          <div className="divide-y divide-background-300">{items.map((item) => <details key={item.id} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-heading text-lg font-bold text-foreground-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500">{item.title}<i className="ri-add-line text-primary-600 transition group-open:rotate-45" /></summary><p className="max-w-3xl pb-2 pt-4 text-sm leading-[1.8] text-foreground-600">{item.description}</p></details>)}</div>
        </div>
      </section>
    </ManagedSectionGate>
  );
}

export function InstitutionalCta({ fallback, disclaimer }: { fallback: HeroContent; disclaimer?: string }) {
  const content = useManagedSection("final_cta", fallback);
  return (
    <ManagedSectionGate name="final_cta">
      <section className="relative overflow-hidden bg-primary-500 py-16 md:py-24">
        <div className="container-content relative z-10">
          <h2 className="max-w-4xl font-heading text-[clamp(2rem,4.5vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-background-950">{content.title}</h2>
          {content.description && <p className="mt-5 max-w-3xl leading-[1.8] text-background-900">{content.description}</p>}
          <div className="mt-8"><RouteLink link={{ label: content.primary_cta_label, url: content.primary_cta_url }} className="inline-flex items-center gap-3 bg-background-950 px-6 py-3.5 text-sm font-bold text-background-50 hover:bg-background-900" /></div>
          {disclaimer && <p className="mt-10 max-w-4xl border-t border-background-950/20 pt-6 text-xs leading-[1.8] text-background-900">{disclaimer}</p>}
        </div>
      </section>
    </ManagedSectionGate>
  );
}
