import ResponsiveImage from "@/components/base/ResponsiveImage";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const heroPoints = [
  ["Specialist by design", "Focused on project-controls talent and applied competence."],
  ["One clear application", "Applicants can be guided towards the most suitable route."],
  ["Transparent by default", "Eligibility, selection, privacy and reporting remain visible."],
];

const fundAreas = [
  ["Future Talent", "Scholarships, bursaries and supported entry routes."],
  ["Professional Learning", "Master Classes, CPD and mentoring access."],
  ["Applied Research", "Evidence for AI, forecasting, data and sustainability."],
  ["Regional Skills", "Local capability, clubs and employer connection."],
  ["Awards & Recognition", "Visibility for excellence and emerging talent."],
];

export default function ContributeHero() {
  const section = useManagedSection("hero", {
    eyebrow: "IPC funded opportunities", title: "Fund the people behind", highlight: "better project decisions.",
    description: "Support future project-controls talent, professional learning, regional capability and applied research across planning, cost, risk, change, data and assurance.",
    primary_cta_label: "Apply for support", primary_cta_url: "#applicant-route", secondary_cta_label: "Fund an opportunity", secondary_cta_url: "#funder-route",
    image: "/images/membership/hero.svg", image_alt: "",
    proof_points: heroPoints.map(([title,description])=>({title,description})),
    areas: fundAreas.map(([title,description])=>({title,description})),
  });
  return (
    <>
      <section className="relative flex min-h-[72vh] items-center overflow-hidden bg-background-950 pb-20 pt-24 text-background-50">
        <div className="absolute inset-0"><ResponsiveImage src={section.image} alt={section.image_alt} width={1600} height={900} sizes="100vw" priority className="h-full w-full object-cover opacity-25" /></div>
        <div className="absolute inset-0 bg-gradient-to-r from-background-950 via-background-950/95 to-background-950/65" />
        <div className="container-content relative z-10 grid items-center gap-14 pt-12 lg:grid-cols-[1.05fr_.95fr]">
          <div className="reveal max-w-3xl">
            <span className="eyebrow text-primary-400">{section.eyebrow}</span>
            <h1 className="mt-5 font-heading text-4xl font-bold leading-[1.06] sm:text-6xl lg:text-7xl">{section.title} <span className="text-primary-400">{section.highlight}</span></h1>
            <p className="mt-7 max-w-2xl text-base leading-[1.8] text-background-200 md:text-lg">{section.description}</p>
            <div className="mt-9 flex flex-wrap gap-3"><a href={section.primary_cta_url} className="btn-primary">{section.primary_cta_label}</a><a href={section.secondary_cta_url} className="btn-secondary">{section.secondary_cta_label}</a></div>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-background-300"><a href="#applicant-route" className="hover:text-primary-300">I need professional support <i className="ri-arrow-right-line" /></a><a href="#funder-route" className="hover:text-primary-300">My organisation wants to fund impact <i className="ri-arrow-right-line" /></a></div>
            <dl className="mt-10 grid border-y border-background-50/15 sm:grid-cols-3">{section.proof_points.filter(isManagedItemActive).map(({title, description}, index) => <div key={title} className={`py-5 sm:px-5 ${index > 0 ? "border-t border-background-50/15 sm:border-l sm:border-t-0" : "sm:pl-0"}`}><dt className="text-sm font-semibold text-primary-300">{title}</dt><dd className="mt-1 text-xs leading-relaxed text-background-400">{description}</dd></div>)}</dl>
          </div>
          <div className="reveal border border-background-800 bg-background-900/70 p-6 backdrop-blur md:p-8">
            <span className="eyebrow text-primary-400">Skills &amp; Impact</span><p className="mt-2 font-mono text-xs text-background-400">Access · Capability · Evidence</p>
            <div className="mt-7 divide-y divide-background-800">{section.areas.filter(isManagedItemActive).map(({title, description}, index) => <div key={title} className="grid grid-cols-[2.5rem_1fr] gap-4 py-4"><span className="font-mono text-[10px] text-primary-400">0{index + 1}</span><div><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-xs leading-relaxed text-background-400">{description}</p></div></div>)}</div>
          </div>
        </div>
      </section>
      <section className="overflow-hidden border-y border-primary-600/30 bg-primary-500 px-4 py-4" aria-label="Funded opportunity themes"><p className="text-center font-mono text-[11px] font-bold uppercase leading-relaxed tracking-[.1em] text-background-950 sm:text-xs sm:tracking-[.16em]">Talent pipeline · Professional access · Social value · Ethical visibility · Applied research · Regional skills</p></section>
    </>
  );
}
