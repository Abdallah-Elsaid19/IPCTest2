import { Link } from "react-router-dom";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

interface OrganisationAudience {
  id: string;
  title: string;
  benefits: string[];
  cta: string;
  cta_url?: string;
  is_active?: boolean;
}

const organisationAudiences: OrganisationAudience[] = [
  {
    id: "corporate-employers",
    title: "Corporate employers",
    benefits: [
      "Capability mapping",
      "Recruitment clarity",
      "Staff recognition",
      "Succession planning",
      "Tender and client confidence",
    ],
    cta: "Discuss corporate membership",
  },
  {
    id: "consultancies",
    title: "Consultancies",
    benefits: [
      "Consultant development",
      "Professional profiles",
      "Thought leadership",
      "Fellow pathways",
      "Client credibility",
    ],
    cta: "Discuss consultancy membership",
  },
  {
    id: "academic-partners",
    title: "Academic partners",
    benefits: [
      "Student affiliation",
      "Professional progression",
      "Research and publication",
      "Employer engagement",
      "Scholarships and awards",
    ],
    cta: "Discuss academic partnership",
  },
];

export default function OrganisationalMembership() {
  const content = useManagedSection("organisational_membership", { eyebrow: "For Organisations", title: "A specialist capability language for project-controls teams.", description: "IPC membership can support workforce development, recruitment clarity, succession planning, professional culture and external confidence.", items: organisationAudiences });
  const audiences = content.items.filter(isManagedItemActive);
  return (
    <section
      aria-labelledby="organisational-membership-title"
      className="border-b border-background-800 bg-background-950 section-padding"
    >
      <div className="container-content">
        <div className="mb-8 flex items-center gap-4">
          <span className="h-px w-10 bg-primary-500" aria-hidden="true" />
          <span className="eyebrow text-primary-400">{content.eyebrow}</span>
        </div>

        <h2
          id="organisational-membership-title"
          className="max-w-5xl font-heading text-[clamp(2.5rem,5.5vw,5rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-background-50"
        >
          {content.title}
        </h2>

        <p className="mt-8 max-w-4xl text-base leading-[1.75] text-background-300 md:text-lg">
          {content.description}
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 md:mt-14 md:grid-cols-2 xl:grid-cols-3">
          {audiences.map((audience) => (
            <article
              key={audience.id}
              className="flex min-h-[360px] flex-col border border-background-800 border-t-2 border-t-primary-500 bg-background-900/70 p-7 md:p-8"
            >
              <h3 className="font-heading text-xl font-semibold text-background-50">
                {audience.title}
              </h3>

              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-background-300 md:text-base">
                {audience.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <span
                      className="mt-[0.65em] h-1 w-1 shrink-0 rounded-full bg-background-400"
                      aria-hidden="true"
                    />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={audience.cta_url ?? "/information-session"}
                className="group mt-auto inline-flex w-fit items-center gap-3 pt-8 font-heading text-sm font-semibold text-primary-300 transition-colors duration-300 hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-4 focus-visible:ring-offset-background-900 md:text-base motion-reduce:transition-none"
              >
                <span>{audience.cta}</span>
                <i
                  className="ri-arrow-right-line transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
