import { useState } from "react";
import { Link } from "react-router-dom";
import FeatureCard from "@/components/base/FeatureCard";
import SectionHeader from "@/components/base/SectionHeader";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

type ProtectedAction = () => void;
type Item = Record<string, unknown> & { id?: string; is_active?: boolean };

const activeItems = <T extends Item>(items: T[] = []) => items.filter(isManagedItemActive);

function ProtectedButton({ onAction, children, secondary = false }: { onAction: ProtectedAction; children: React.ReactNode; secondary?: boolean }) {
  return <button type="button" onClick={onAction} className={secondary ? "btn-secondary inline-flex min-h-12" : "btn-primary inline-flex min-h-12"}>{children}</button>;
}

export function ClubsHero({ onAction }: { onAction: ProtectedAction }) {
  const content = useManagedSection("hero", { eyebrow: "IPC Regional Clubs", title: "Where professional knowledge becomes community.", description: "Join local project-controls professionals, employers, consultants, academics and learners for talks, networking, site visits, mentoring and practical exchange.", primary_cta_label: "Find your regional club", secondary_cta_label: "Sponsor a Club", secondary_cta_url: "/information-session" });
  return <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-background-950 pt-20 text-background-50">
    <div className="absolute inset-0 dot-grid opacity-10" /><div className="absolute -right-40 top-16 h-[540px] w-[540px] rounded-full border border-primary-500/20" />
    <div className="container-content relative z-10 py-20 sm:py-24"><div className="max-w-4xl reveal"><span className="eyebrow text-primary-400">{content.eyebrow}</span><h1 className="mt-5 max-w-4xl font-heading text-4xl font-bold leading-[1.04] sm:text-5xl md:text-7xl">{content.title}</h1><p className="mt-7 max-w-2xl text-base leading-loose text-background-300 md:text-lg">{content.description}</p><div className="mt-9 flex flex-wrap gap-3"><ProtectedButton onAction={onAction}>{content.primary_cta_label}</ProtectedButton><Link to={content.secondary_cta_url} state={{ enquiry: "Sponsor a Club" }} className="btn-secondary inline-flex min-h-12">{content.secondary_cta_label}</Link></div></div></div>
  </section>;
}

export function ClubsPrinciples() {
  const content = useManagedSection<{ items: Array<{ id: string; title: string; description: string; is_active?: boolean }> }>("principles", { items: [] });
  return (
    <section aria-label="Regional club principles" className="border-b border-background-200 bg-background-50 py-12 md:py-16">
      <div className="container-content">
        <div className="grid border-l border-t border-background-300 sm:grid-cols-2 lg:grid-cols-4">
          {activeItems(content.items).map((item, index) => (
            <article
              key={`${item.id || item.title}-${index}`}
              className="group relative min-h-56 overflow-hidden border-b border-r border-background-300 bg-background-50 p-6 transition-colors duration-300 hover:bg-background-100 md:p-8"
            >
              <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-primary-600">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="absolute right-6 top-7 h-px w-10 bg-primary-500/60 transition-all duration-300 group-hover:w-16" aria-hidden="true" />
              <h2 className="mt-12 font-heading text-xl font-semibold text-background-950">
                {item.title}
              </h2>
              <p className="mt-4 max-w-xs text-sm leading-[1.75] text-foreground-600">
                {item.description}
              </p>
              <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-primary-500 transition-transform duration-300 group-hover:scale-x-100" aria-hidden="true" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ClubsPurpose() {
  const content = useManagedSection<{ eyebrow: string; title: string; description: string; items: Array<{ id: string; label: string; title: string; description: string; is_active?: boolean }> }>("purpose", { eyebrow: "Why regional clubs matter", title: "Networking should create professional value—not just exchange business cards.", description: "IPC clubs create useful regional professional connections.", items: [] });
  return <section className="bg-background-50 section-padding"><div className="container-content grid gap-14 lg:grid-cols-12"><div className="lg:col-span-5"><span className="eyebrow text-primary-600">{content.eyebrow}</span><h2 className="mt-5 font-heading text-4xl font-semibold leading-tight text-background-950 md:text-5xl">{content.title}</h2><p className="mt-6 leading-loose text-foreground-600">{content.description}</p></div><div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">{activeItems(content.items).map((item, index) => <article key={`${item.id || item.title}-${index}`} className="border border-background-200 bg-background-100 p-7"><span className="font-mono text-xs font-bold uppercase tracking-widest text-primary-600">{item.id} / {item.label}</span><h3 className="mt-7 font-heading text-xl font-semibold text-background-950">{item.title}</h3><p className="mt-3 text-sm leading-relaxed text-foreground-600">{item.description}</p></article>)}</div></div></section>;
}

interface ClubLocation extends Item { id: string; icon: string; name: string; label: string; description: string; detail: string; focus: string; audience: string; activity: string; cta_label: string }
export function ClubsLocations({ onAction }: { onAction: ProtectedAction }) {
  const intro = useManagedSection("locations_intro", { eyebrow: "Regional network", title: "Find the community closest to where you work or study.", description: "Select a region to see its professional purpose, likely audience and suitable activity.", notice: "Regional clubs are professional communities governed by IPC processes." });
  const locations = activeItems(useManagedSection<ClubLocation[]>("regional_clubs", []));
  const [activeId, setActiveId] = useState(""); const selected = locations.find((item) => item.id === activeId) ?? locations[0];
  return (
    <section id="locations" className="scroll-mt-20 bg-background-100 section-padding">
      <div className="container-content">
        <SectionHeader eyebrow={intro.eyebrow} title={intro.title} subtitle={intro.description} centered />
        {selected && (
          <div className="mt-14 grid border border-background-300 bg-background-50 lg:grid-cols-[minmax(15rem,.34fr)_1fr]">
            <div
              className="flex overflow-x-auto border-b border-background-300 lg:block lg:overflow-visible lg:border-b-0 lg:border-r"
              aria-label="Regional clubs"
              role="tablist"
            >
              {locations.map((item, index) => {
                const isActive = selected.id === item.id;
                return (
                  <button
                    key={`${item.id}-${index}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveId(item.id)}
                    className={`group min-w-56 border-r border-background-300 p-5 text-left transition-colors last:border-r-0 lg:min-w-0 lg:w-full lg:border-b lg:border-r-0 lg:p-6 ${isActive ? "bg-background-950 text-background-50" : "bg-background-50 text-background-950 hover:bg-background-100"}`}
                  >
                    <span className={`font-mono text-[10px] font-bold tracking-[0.18em] ${isActive ? "text-primary-400" : "text-primary-600"}`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <strong className="mt-5 block font-heading text-lg font-semibold">{item.name}</strong>
                    <span className={`mt-2 block text-xs leading-relaxed ${isActive ? "text-background-300" : "text-foreground-600"}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div role="tabpanel" className="min-w-0">
              <div className="p-7 md:p-10 lg:p-12">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="eyebrow text-primary-600">{selected.name} Regional Club</span>
                  <span className="hidden h-px w-24 bg-primary-500/60 sm:block" aria-hidden="true" />
                </div>
                <h3 className="mt-6 max-w-3xl font-heading text-3xl font-semibold leading-tight text-background-950 md:text-4xl">
                  {selected.description}
                </h3>
                <p className="mt-6 max-w-3xl leading-[1.8] text-foreground-600">{selected.detail}</p>

                <dl className="mt-10 grid border-l border-t border-background-300 md:grid-cols-3">
                  {[["Professional focus", selected.focus], ["Likely audience", selected.audience], ["Suitable activity", selected.activity]].map(([title, copy], index) => (
                    <div key={title} className="min-h-44 border-b border-r border-background-300 p-5 md:p-6">
                      <dt className="flex items-center gap-3 text-xs font-bold text-primary-700">
                        <span className="font-mono text-[10px] text-primary-500">0{index + 1}</span>
                        {title}
                      </dt>
                      <dd className="mt-5 text-sm leading-relaxed text-foreground-600">{copy}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <aside className="flex flex-col gap-7 border-t border-background-800 bg-background-950 p-7 text-background-50 sm:flex-row sm:items-center sm:justify-between md:px-10 md:py-8 lg:px-12">
                <div className="max-w-xl">
                  <h3 className="font-heading text-xl font-semibold">Receive {selected.name} club updates</h3>
                  <p className="mt-2 text-sm leading-relaxed text-background-400">
                    Share your role, professional interests and preferred activity so IPC can send relevant updates when confirmed.
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-3">
                  <Link to={`/clubs/${selected.id}`} className="btn-secondary inline-flex min-h-12">View club page</Link>
                  <ProtectedButton onAction={onAction}>{selected.cta_label}</ProtectedButton>
                </div>
              </aside>
            </div>
          </div>
        )}
        <p className="mt-6 border-l-2 border-primary-500 px-5 py-3 text-xs leading-relaxed text-foreground-600">{intro.notice}</p>
      </div>
    </section>
  );
}

export function ClubsProgramme({ onAction }: { onAction: ProtectedAction }) {
  const intro = useManagedSection("programme_intro", { eyebrow: "Club programme", title: "Learn, connect, contribute and progress.", description: "Regional activity should combine technical learning with professional connection and visible routes to contribution." });
  const items = activeItems(useManagedSection<Array<{ id: string; icon: string; title: string; description: string; is_active?: boolean }>>("activities", []));
  return <section className="bg-background-950 section-padding"><div className="container-content"><SectionHeader eyebrow={intro.eyebrow} title={intro.title} subtitle={intro.description} light centered /><div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((item, index) => <button type="button" onClick={onAction} key={`${item.id || item.title}-${index}`} className="text-left"><FeatureCard icon={item.icon} title={item.title} description={item.description} light /></button>)}</div></div></section>;
}

export function ClubsAudiences({ onAction }: { onAction: ProtectedAction }) {
  const intro = useManagedSection("audiences_intro", { eyebrow: "Value at every career stage", title: "Different professionals gain different value from the same community.", description: "A strong club programme supports confidence, practice, leadership and organisational capability." });
  const items = activeItems(useManagedSection<Array<{ id: string; icon: string; title: string; description: string; cta_label: string; is_active?: boolean }>>("audience_values", []));
  return <section className="bg-background-50 section-padding"><div className="container-content"><SectionHeader eyebrow={intro.eyebrow} title={intro.title} subtitle={intro.description} centered /><div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{items.map((item, index) => <article key={`${item.id || item.title}-${index}`} className="flex min-h-80 flex-col border border-background-200 border-t-2 border-t-primary-500 p-7"><i className={`${item.icon} text-2xl text-primary-600`} /><h3 className="mt-8 font-heading text-xl font-semibold text-background-950">{item.title}</h3><p className="mt-4 text-sm leading-relaxed text-foreground-600">{item.description}</p><button type="button" onClick={onAction} className="mt-auto pt-7 text-left text-sm font-semibold text-primary-700">{item.cta_label} →</button></article>)}</div></div></section>;
}

export function ClubsUpcoming({ onAction }: { onAction: ProtectedAction }) {
  const content = useManagedSection<any>("upcoming", { eyebrow: "Upcoming activity", title: "Keep club information current, credible and easy to manage.", description: "Confirmed activity is managed through the CMS.", featured: null, items: [] });
  const items = activeItems(content.items ?? []);
  return <section className="bg-background-100 section-padding"><div className="container-content"><SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} centered />{content.featured && <div className="mt-14 grid gap-5 lg:grid-cols-[1.15fr_.85fr]"><article className="flex min-h-96 flex-col border border-background-200 bg-background-50 p-8"><span className="eyebrow text-primary-600">{content.featured.type}</span><h3 className="mt-5 font-heading text-3xl font-semibold">{content.featured.title}</h3><p className="mt-4 text-foreground-600">{content.featured.description}</p><div className="mt-6 flex flex-wrap gap-2">{content.featured.meta?.map((meta: string, index: number) => <span key={`${meta}-${index}`} className="border border-background-300 px-3 py-2 text-xs text-foreground-600">{meta}</span>)}</div><button type="button" onClick={onAction} className="mt-auto pt-8 text-left font-semibold text-primary-700">{content.featured.cta_label} →</button></article><div className="grid gap-3">{items.map((item: any, index: number) => <button type="button" onClick={onAction} key={`${item.id || item.title}-${index}`} className="border border-background-200 bg-background-50 p-5 text-left"><span className="text-xs font-bold uppercase tracking-wider text-primary-600">{item.type}</span><h3 className="mt-2 font-semibold text-background-950">{item.title}</h3><p className="mt-2 text-xs text-foreground-600">{item.description}</p></button>)}</div></div>}</div></section>;
}

export function ClubsContribution({ onAction }: { onAction: ProtectedAction }) {
  const content = useManagedSection<any>("contribution", { eyebrow: "Volunteer and contribute", title: "Help build a respected regional professional community.", description: "Clubs depend on members and partners who share useful knowledge.", builder_title: "How would you like to support your regional club?", builder_description: "Select the closest route.", button_label: "Create enquiry route", items: [] });
  const items = activeItems(content.items ?? []); const [selected, setSelected] = useState("");
  return <section id="contribute" className="scroll-mt-20 bg-background-950 section-padding text-background-50"><div className="container-content grid gap-14 lg:grid-cols-2"><div><span className="eyebrow text-primary-400">{content.eyebrow}</span><h2 className="mt-5 font-heading text-4xl font-semibold md:text-5xl">{content.title}</h2><p className="mt-6 leading-loose text-background-300">{content.description}</p><div className="mt-9 grid gap-4 sm:grid-cols-2">{items.slice(0,4).map((item: any, index: number) => <article key={`${item.id || item.title}-${index}`} className="border border-background-800 bg-background-900 p-5"><strong className="text-primary-300">{item.title}</strong><p className="mt-2 text-xs leading-relaxed text-background-400">{item.description}</p></article>)}</div></div><div className="bg-background-50 p-7 text-background-950 md:p-9"><h3 className="font-heading text-2xl font-semibold">{content.builder_title}</h3><p className="mt-3 text-sm text-foreground-600">{content.builder_description}</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{items.map((item: any, index: number) => <button type="button" key={`${item.id || item.title}-${index}`} onClick={() => setSelected(item.id)} className={`border p-4 text-left ${selected === item.id ? "border-background-950 bg-background-950 text-background-50" : "border-background-300"}`}><strong className="text-sm">{item.title}</strong><span className="mt-1 block text-xs opacity-65">{item.description}</span></button>)}</div><button type="button" onClick={onAction} className="btn-primary mt-6">{content.button_label}</button></div></div></section>;
}

export function ClubsPartners({ onAction }: { onAction: ProtectedAction }) {
  const content = useManagedSection<any>("partners", { eyebrow: "Employers, hosts and partners", title: "Support local capability and connect with the profession.", description: "Organisations can support club activity.", notice: "Partnership remains transparent and consent-based.", items: [] });
  const items = activeItems(content.items ?? []);
  return <section className="bg-background-50 section-padding"><div className="container-content"><SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} centered /><div className="mt-14 grid gap-6 lg:grid-cols-3">{items.map((item: any, itemIndex: number) => <article key={`${item.id || item.title}-${itemIndex}`} className="flex min-h-96 flex-col border border-background-200 border-t-2 border-t-primary-500 p-7"><h3 className="font-heading text-xl font-semibold">{item.title}</h3><ul className="mt-6 space-y-3 text-sm text-foreground-600">{item.benefits?.map((benefit: string, benefitIndex: number) => <li key={`${benefit}-${benefitIndex}`} className="flex gap-3"><i className="ri-check-line text-primary-600" />{benefit}</li>)}</ul><button type="button" onClick={onAction} className="mt-auto pt-8 text-left font-semibold text-primary-700">{item.cta_label} →</button></article>)}</div><p className="mt-7 border-l-2 border-primary-500 px-5 py-3 text-xs text-foreground-600">{content.notice}</p></div></section>;
}

export function ClubsFaq() {
  const content = useManagedSection<any>("faq", { eyebrow: "Regional club questions", title: "Clear guidance before registering or contributing.", description: "Understand locations, access, activity, volunteering, hosting and privacy.", items: [] }); const [open, setOpen] = useState<string | null>(null); const items = activeItems(content.items ?? []);
  return <section className="bg-background-100 section-padding"><div className="container-content grid gap-12 lg:grid-cols-12"><div className="lg:col-span-5"><span className="eyebrow text-primary-600">{content.eyebrow}</span><h2 className="mt-5 font-heading text-4xl font-semibold text-background-950">{content.title}</h2><p className="mt-5 text-foreground-600">{content.description}</p></div><div className="space-y-3 lg:col-span-7">{items.map((item: any, index: number) => <article key={`${item.id || item.question}-${index}`} className="border border-background-300 bg-background-50"><button type="button" onClick={() => setOpen(open === item.id ? null : item.id)} aria-expanded={open === item.id} className="flex w-full items-center justify-between p-5 text-left font-semibold"><span>{item.question}</span><i className={open === item.id ? "ri-subtract-line" : "ri-add-line"} /></button>{open === item.id && <p className="px-5 pb-5 text-sm leading-relaxed text-foreground-600">{item.answer}</p>}</article>)}</div></div></section>;
}

export function ClubsFinalCta({ onAction }: { onAction: ProtectedAction }) {
  const content = useManagedSection("final_cta", { title: "Join your regional community", description: "Learn locally and contribute to a stronger project-controls profession.", primary_cta_label: "Register club interest", secondary_cta_label: "Volunteer or speak" });
  return <section className="bg-secondary-900 py-20 text-background-50 md:py-28"><div className="container-content text-center"><h2 className="font-heading text-4xl font-semibold md:text-5xl">{content.title}</h2><p className="mx-auto mt-5 max-w-2xl leading-relaxed text-background-300">{content.description}</p><div className="mt-8 flex flex-wrap justify-center gap-3"><ProtectedButton onAction={onAction}>{content.primary_cta_label}</ProtectedButton><ProtectedButton onAction={onAction} secondary>{content.secondary_cta_label}</ProtectedButton></div></div></section>;
}
