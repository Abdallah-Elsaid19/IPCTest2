import { Link } from "react-router-dom";
import SectionHeader from "@/components/base/SectionHeader";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const audiences = [
  ["Professionals", "Recognition, career credibility, CPD, events, mentoring and progression.", "/membership", "Explore recognition", "ri-user-star-line"],
  ["Employers", "Capability mapping, recruitment clarity, retention, succession planning and staff recognition.", "/employers", "Explore employer capability", "ri-building-line"],
  ["Consultancies", "Visible expertise, professional contribution, thought leadership and senior profiles.", "/partnerships", "Explore partnerships", "ri-briefcase-4-line"],
  ["Academic & training partners", "Student affiliation, curriculum relevance, scholarships, research, awards and employer links.", "/partnerships", "Explore academic partnership", "ri-school-line"],
  ["Sponsors & supporters", "Ethical routes to support learners, events, awards, clubs, publications and social impact.", "/sponsorship", "Explore impact routes", "ri-hand-heart-line"],
  ["Authors & researchers", "Magazine articles, technical cases, papers and research notes subject to editorial review.", "/publications", "Explore publication routes", "ri-article-line"],
];

export default function ServicesAudiences() {
  const section = useManagedSection("audiences", {
    eyebrow: "Who IPC serves",
    title: "Professional value across the project-controls ecosystem.",
    description: "The service model supports individuals and organisations seeking capability, credibility, employability and contribution.",
    items: audiences.map(([title, description, cta_url, cta_label, icon]) => ({ title, description, cta_url, cta_label, icon })),
  });
  return (
    <section className="bg-background-950 section-padding text-background-50">
      <div className="container-content">
        <div className="reveal max-w-4xl"><SectionHeader eyebrow={section.eyebrow} title={section.title} subtitle={section.description} light eyebrowClassName="text-primary-300" /></div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-6 md:mt-16">
          {section.items.filter(isManagedItemActive).map(({title, description, cta_url, cta_label, icon}, index) => (
            <article key={title} className={`reveal flex min-h-64 flex-col justify-between border border-background-50/10 bg-background-50/[0.045] p-6 ${index < 3 ? "lg:col-span-2" : "lg:col-span-3"}`}>
              <div><div className="mb-6 flex h-10 w-10 items-center justify-center bg-primary-500/15 text-primary-300"><i className={`${icon} text-lg`} aria-hidden="true" /></div><h3 className="text-lg font-semibold">{title}</h3><p className="mt-3 text-sm leading-relaxed text-background-400">{description}</p></div>
              <Link to={cta_url} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary-300 hover:text-primary-200">{cta_label}<i className="ri-arrow-right-line" aria-hidden="true" /></Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
