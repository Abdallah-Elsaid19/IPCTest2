import { Link } from "react-router-dom";
import SectionHeader from "@/components/base/SectionHeader";

const audiences = [
  ["Professionals", "Recognition, career credibility, CPD, events, mentoring and progression.", "/membership", "Explore recognition", "ri-user-star-line"],
  ["Employers", "Capability mapping, recruitment clarity, retention, succession planning and staff recognition.", "/information-session", "Explore workforce services", "ri-building-line"],
  ["Consultancies", "Market credibility, tender strength, thought leadership and senior profiles.", "/information-session", "Find a route", "ri-briefcase-4-line"],
  ["Academic & training partners", "Student affiliation, curriculum relevance, scholarships, research, awards and employer links.", "/scholarships", "Explore partnership", "ri-school-line"],
  ["Sponsors & supporters", "Ethical routes to support learners, events, awards, clubs, publications and social impact.", "/sponsorship", "Explore impact routes", "ri-hand-heart-line"],
];

export default function ServicesAudiences() {
  return (
    <section className="bg-background-950 section-padding text-background-50">
      <div className="container-content">
        <div className="reveal max-w-4xl"><SectionHeader eyebrow="Who IPC serves" title="Professional value across the project-controls ecosystem." subtitle="The service model supports individuals and organisations seeking capability, credibility, employability and contribution." light eyebrowClassName="text-primary-300" /></div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-6 md:mt-16">
          {audiences.map(([title, description, href, cta, icon], index) => (
            <article key={title} className={`reveal flex min-h-64 flex-col justify-between border border-background-50/10 bg-background-50/[0.045] p-6 ${index < 3 ? "lg:col-span-2" : "lg:col-span-3"}`}>
              <div><div className="mb-6 flex h-10 w-10 items-center justify-center bg-primary-500/15 text-primary-300"><i className={`${icon} text-lg`} aria-hidden="true" /></div><h3 className="text-lg font-semibold">{title}</h3><p className="mt-3 text-sm leading-relaxed text-background-400">{description}</p></div>
              <Link to={href} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary-300 hover:text-primary-200">{cta}<i className="ri-arrow-right-line" aria-hidden="true" /></Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
