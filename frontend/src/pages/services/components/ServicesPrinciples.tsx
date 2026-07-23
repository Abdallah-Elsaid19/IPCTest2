import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const principles = [
  ["Project-controls specific", "Built around integrated controls rather than generic language."],
  ["Evidence-led", "Professional claims should be credible and explainable."],
  ["Progressive", "Clear routes from affiliation to senior standing."],
  ["Connected", "Professionals, employers, academics and partners."],
];

const model = [
  ["01 / RECOGNISE", "Make competence visible", "Use structured grades, evidence expectations and post-nominals to communicate professional standing."],
  ["02 / DEVELOP", "Build workforce capability", "Create progression routes from entry-level staff to applied practitioners and senior controls leaders."],
  ["03 / CONNECT", "Strengthen professional community", "Bring together practitioners, employers, consultants, academics, sponsors and learners."],
  ["04 / CONTRIBUTE", "Share knowledge and impact", "Support speaking, mentoring, research, publications, awards and regional professional activity."],
];

export default function ServicesPrinciples() {
  const section = useManagedSection("principles", {
    eyebrow: "A specialist service model",
    title: "More than membership. A complete professional ecosystem.",
    description: "Recognition is the anchor, but lasting value comes from connecting identity with learning, workforce capability, research and opportunity.",
    items: principles.map(([title, description]) => ({title, description})),
    model: model.map(([label, title, description]) => ({label, title, description})),
  });
  return (
    <>
      <section className="border-b border-background-200 bg-background-50 py-12 md:py-16" aria-label="Service principles">
        <div className="container-content">
          <dl className="grid border-l border-t border-background-300 sm:grid-cols-2 lg:grid-cols-4">
            {section.items.filter(isManagedItemActive).map(({title, description}, index) => (
              <div
                key={title}
                className="group relative min-h-56 overflow-hidden border-b border-r border-background-300 bg-background-50 p-6 transition-colors duration-300 hover:bg-background-100 md:p-8"
              >
                <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-primary-600">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className="absolute right-6 top-7 h-px w-10 bg-primary-500/60 transition-all duration-300 group-hover:w-16"
                  aria-hidden="true"
                />
                <dt className="mt-12 font-heading text-xl font-semibold text-background-950">
                  {title}
                </dt>
                <dd className="mt-4 max-w-xs text-sm leading-[1.75] text-foreground-600">
                  {description}
                </dd>
                <span
                  className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-primary-500 transition-transform duration-300 group-hover:scale-x-100"
                  aria-hidden="true"
                />
              </div>
            ))}
          </dl>
        </div>
      </section>
      <section className="bg-background-50 section-padding">
        <div className="container-content grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div className="reveal lg:sticky lg:top-28 lg:self-start">
            <span className="eyebrow mb-4 block text-primary-700">{section.eyebrow}</span>
            <h2 className="font-heading text-3xl font-semibold leading-tight text-background-950 md:text-5xl">{section.title}</h2>
            <p className="mt-5 text-base leading-relaxed text-foreground-600 md:text-lg">{section.description}</p>
            <a href="#services" className="btn-ghost mt-7">View service routes <i className="ri-arrow-down-line" aria-hidden="true" /></a>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {section.model.filter(isManagedItemActive).map(({label, title, description}, index) => {
              const dark = index === 0 || index === 2;
              return (
                <article key={label} className={`reveal flex min-h-64 flex-col justify-between border p-6 transition-transform duration-300 hover:-translate-y-1 md:p-7 ${index === 2 ? "border-accent-700 bg-accent-700" : dark ? "border-background-950 bg-background-950" : "border-background-200/70 bg-background-50 hover:border-primary-300"}`}>
                  <span className={`font-mono text-xs font-bold tracking-wider ${dark ? "text-primary-300" : "text-primary-700"}`}>{label}</span>
                  <div className="mt-10"><h3 className={`text-xl font-semibold ${dark ? "text-background-50" : "text-background-950"}`}>{title}</h3><p className={`mt-3 text-sm leading-relaxed ${dark ? "text-background-300" : "text-foreground-600"}`}>{description}</p></div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
