import { Link } from "react-router-dom";
import { useManagedSection } from "@/components/content/ManagedContentProvider";

export default function ScholarshipHero() {
  const content = useManagedSection("hero", {
    eyebrow: "Scholarships & Bursaries",
    title: "Opportunity should not depend on already knowing the profession.",
    description:
      "The Institute of Project Controls Scholarship & Bursary Fund is designed to widen access to project controls education, professional development, membership and career opportunity.",
    supporting_copy:
      "Selected applicants may receive support towards eligible project controls and project management pathways delivered through Kent Business College. The Institute is looking for people with integrity, service, need, resilience, leadership, social impact, motivation or professional potential - not people who already know every project controls technique.",
    primary_cta_label: "Enquire About Scholarships",
    primary_cta_url: "/information-session",
    secondary_cta_label: "Sponsor a Learner",
    secondary_cta_url: "/sponsorship",
    tertiary_cta_label: "View Eligibility",
    tertiary_cta_url: "#eligibility",
  });

  return (
    <section className="relative flex min-h-[720px] items-center overflow-hidden bg-background-950 pt-20 text-background-50">
      <div className="absolute inset-0 dot-grid-gold opacity-20" aria-hidden="true" />
      <div className="absolute -right-44 top-24 h-[36rem] w-[36rem] rounded-full border border-primary-500/20 motion-safe:animate-radial-slow" aria-hidden="true">
        <span className="absolute inset-16 rounded-full border border-primary-500/15" />
        <span className="absolute inset-32 rounded-full border border-primary-500/10" />
      </div>
      <div className="absolute right-[12%] top-[30%] hidden h-72 w-72 rotate-45 border border-primary-500/20 lg:block" aria-hidden="true">
        <span className="absolute left-1/2 top-0 h-full w-px bg-primary-500/15" />
        <span className="absolute left-0 top-1/2 h-px w-full bg-primary-500/15" />
      </div>

      <div className="container-content relative z-10 w-full py-24 md:py-32">
        <div className="max-w-4xl reveal">
          <span className="eyebrow text-primary-400">{content.eyebrow}</span>
          <h1 className="mt-5 max-w-4xl font-heading text-5xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            {content.title}
          </h1>
          <div className="mt-8 max-w-2xl space-y-4 text-base leading-[1.8] text-background-300 md:text-lg">
            <p>{content.description}</p>
            <p>{content.supporting_copy}</p>
          </div>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href={content.primary_cta_url} className="btn-primary">
              {content.primary_cta_label}
              <i className="ri-arrow-right-line" aria-hidden="true" />
            </a>
            <Link to={content.secondary_cta_url} className="btn-secondary">
              {content.secondary_cta_label}
            </Link>
            <a href={content.tertiary_cta_url} className="inline-flex min-h-12 items-center gap-2 px-3 text-sm font-semibold text-primary-300 underline decoration-primary-500/60 underline-offset-8 transition-colors hover:text-primary-200">
              {content.tertiary_cta_label}
              <i className="ri-arrow-down-line" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
