import { Building2, GraduationCap, SquareCheck, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import ResponsiveImage from "@/components/base/ResponsiveImage";
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

const organisationVisuals = [
  {
    image: "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/4aabb98d4c0c4e06bbc6b8c14027dc62.webp",
    icon: Building2,
  },
  {
    image: "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/8d1d3ef91b6f45d6926f6c9aa88f94c3.webp",
    icon: UsersRound,
  },
  {
    image: "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/30f64b2b3c774389bf8ead6c1637263b.webp",
    icon: GraduationCap,
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
          {audiences.map((audience, index) => {
            const visual = organisationVisuals[index];
            const AudienceIcon = visual?.icon ?? Building2;

            return (
              <article
                key={audience.id}
                className="group/card flex min-h-[560px] flex-col overflow-hidden border border-primary-500/35 bg-[#090b0c] transition-colors duration-300 hover:border-primary-500/70"
              >
                <div className="relative h-36 shrink-0 overflow-hidden">
                  {visual?.image && (
                    <ResponsiveImage
                      src={visual.image}
                      alt=""
                      width={720}
                      height={360}
                      sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
                      className="h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover/card:scale-[1.03]"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-background-950/10 via-transparent to-[#090b0c]" aria-hidden="true" />
                </div>

                <span className="relative z-10 -mt-7 ml-6 flex h-14 w-14 shrink-0 items-center justify-center border border-primary-500 bg-[#090b0c] text-primary-400 shadow-[0_0_0_5px_rgba(9,11,12,0.72)]">
                  <AudienceIcon size={25} strokeWidth={1.6} aria-hidden="true" />
                </span>

                <div className="flex flex-1 flex-col px-6 pb-5 pt-3">
                  <h3 className="font-heading text-lg font-semibold text-background-50">
                    {audience.title}
                  </h3>

                  <ul className="mt-4 divide-y divide-background-800/75 text-[13px] leading-[1.55] text-background-300 md:text-sm">
                    {audience.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-2.5 py-2.5 first:pt-0">
                        <SquareCheck className="mt-0.5 shrink-0 text-primary-500" size={17} strokeWidth={1.7} aria-hidden="true" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto border-t border-background-800 pt-5">
                    <Link
                      to={audience.cta_url ?? "/information-session"}
                      className="group inline-flex w-fit items-center gap-3 font-heading text-sm font-semibold text-primary-300 transition-colors duration-300 hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-4 focus-visible:ring-offset-background-900 motion-reduce:transition-none"
                    >
                      <span>{audience.cta}</span>
                      <i
                        className="ri-arrow-right-line transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
