const proofPoints = [
  ["For professionals", "Recognition, CPD, mentoring, events and visible progression."],
  ["For organisations", "Capability mapping, development, retention and client confidence."],
  ["For partners", "Academic, scholarship, research, awards and community pathways."],
];

const capabilities = [
  ["Recognition", "Membership and evidence-led professional standing.", "ri-award-line"],
  ["Workforce Capability", "Skills review, progression and succession.", "ri-team-line"],
  ["Learning & CPD", "Master Classes, mentoring and development.", "ri-graduation-cap-line"],
  ["Academic Partnership", "Employability, research and student routes.", "ri-building-4-line"],
  ["Community & Impact", "Clubs, awards, scholarships and publications.", "ri-global-line"],
];

const servicesHeroImage =
  "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/64e5fe4de8a5414eb9307f7ebe36b446.jpg";

export default function ServicesHero() {
  return (
    <section className="relative overflow-hidden bg-background-950 pb-16 pt-28 text-background-50 md:pb-20 md:pt-36 lg:min-h-[760px] lg:pb-24">
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(214,161,68,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(214,161,68,.08)_1px,transparent_1px)] [background-size:48px_48px]" aria-hidden="true" />
      <div className="absolute -right-40 top-12 h-[520px] w-[520px] rounded-full bg-primary-500/10 blur-3xl" aria-hidden="true" />
      <div className="container-content relative grid items-center gap-14 lg:grid-cols-[1.04fr_0.96fr] lg:gap-20">
        <div className="reveal">
          <span className="eyebrow mb-5 block text-primary-400">Professional services & programmes</span>
          <h1 className="max-w-3xl font-heading text-4xl font-semibold leading-[1.05] text-background-50 sm:text-5xl md:text-6xl lg:text-7xl">
            Turn competence into <span className="text-primary-400">visible capability.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-background-300 md:text-lg">
            IPC connects professional recognition, workforce development, learning, academic partnership and community into one specialist project-controls ecosystem.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#services" className="btn-primary">Explore services <i className="ri-arrow-down-line" aria-hidden="true" /></a>
            <a href="#route-builder" className="btn-secondary">Find the right route</a>
          </div>
          <dl className="mt-10 grid border-y border-background-50/15 sm:grid-cols-3">
            {proofPoints.map(([title, description], index) => (
              <div key={title} className={`py-5 sm:px-5 ${index > 0 ? "border-t border-background-50/15 sm:border-l sm:border-t-0" : ""} ${index === 0 ? "sm:pl-0" : ""}`}>
                <dt className="text-sm font-semibold text-primary-300">{title}</dt>
                <dd className="mt-1 text-xs leading-relaxed text-background-400">{description}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="reveal relative min-h-[560px] overflow-hidden border border-background-50/10 bg-background-900" aria-label="IPC professional service capabilities">
          <img
            src={servicesHeroImage}
            alt="IPC professional services and learning environment"
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background-950/25 via-background-950/55 to-background-950/95" aria-hidden="true" />
          <div className="relative flex min-h-[560px] flex-col justify-end p-5 md:p-7">
            <div className="mb-6 max-w-md">
              <span className="eyebrow text-primary-300">Connected capability</span>
              <h2 className="mt-3 font-heading text-2xl font-semibold leading-tight text-background-50 md:text-3xl">One professional ecosystem, built around project controls.</h2>
            </div>
            <div className="divide-y divide-background-50/10 border-y border-background-50/10 bg-background-950/45 backdrop-blur-md">
              {capabilities.map(([title, description, icon]) => (
                <article key={title} className="grid grid-cols-[40px_1fr] gap-4 px-4 py-3.5">
                  <div className="flex h-10 w-10 items-center justify-center bg-primary-500/15 text-primary-300"><i className={`${icon} text-lg`} aria-hidden="true" /></div>
                  <div><h3 className="text-sm font-semibold text-background-50">{title}</h3><p className="mt-1 text-xs leading-relaxed text-background-400">{description}</p></div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
