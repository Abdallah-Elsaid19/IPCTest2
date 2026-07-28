import { Link } from "react-router-dom";
import { useManagedSection } from "@/components/content/ManagedContentProvider";
import { scholarshipEmail } from "./constants";

function CtaLink({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className: string;
}) {
  if (
    href.startsWith("mailto:") ||
    href.startsWith("#") ||
    href.startsWith("http://") ||
    href.startsWith("https://")
  ) {
    return (
      <a
        href={href}
        className={className}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {label}
      </a>
    );
  }

  return (
    <Link to={href} className={className}>
      {label}
    </Link>
  );
}

export default function ScholarshipEnquiryCta() {
  const content = useManagedSection("final_cta", {
    eyebrow: "IPC × Kent Business College",
    title: "Apply for 50%–70% IPC scholarship funding.",
    description:
      "Choose the Associate Project Manager Level 4 or Project Controls Professional Level 6 pathway, then submit your funding application to the Institute of Project Controls.",
    primary_cta_label: "Apply for IPC Scholarship",
    primary_cta_url:
      "mailto:office@instituteofprojectcontrols.org?subject=IPC%20Scholarship%20Application",
    secondary_cta_label: "Explore APM Level 4",
    secondary_cta_url:
      "https://kentbusinesscollege.com/associate-project-manager-level-4/",
    tertiary_cta_label: "Explore PCP Level 6",
    tertiary_cta_url:
      "https://kentbusinesscollege.com/project-control-professional-level-6/",
    address_label: "IPC address",
    email_label: "IPC email",
    email: scholarshipEmail,
    address: "39 Maidstone Innovation Centre, Maidstone, Kent, ME14 5FY",
  });

  return (
    <section className="bg-background-950 py-20 text-background-50 md:py-28">
      <div className="container-content">
        <div className="reveal mx-auto max-w-4xl text-center">
          <span className="eyebrow text-primary-400">{content.eyebrow}</span>
          <h2 className="mt-5 font-heading text-3xl font-semibold leading-tight md:text-5xl">
            {content.title}
          </h2>
          <p className="mx-auto mt-6 max-w-3xl leading-[1.8] text-background-300">
            {content.description}
          </p>
          <address className="mx-auto mt-9 max-w-3xl border-t border-background-800 pt-7 text-sm not-italic leading-relaxed text-background-300">
            <p>
              <strong className="text-background-50">{content.address_label}:</strong>{" "}
              {content.address}
            </p>
            <p className="mt-2">
              <strong className="text-background-50">{content.email_label}:</strong>{" "}
              <a href={`mailto:${content.email}`} className="text-primary-300 underline underline-offset-4">
                {content.email}
              </a>
            </p>
          </address>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <CtaLink href={content.primary_cta_url} label={content.primary_cta_label} className="btn-primary" />
            <CtaLink href={content.secondary_cta_url} label={content.secondary_cta_label} className="btn-secondary" />
            <CtaLink href={content.tertiary_cta_url} label={content.tertiary_cta_label} className="btn-secondary" />
          </div>
        </div>
      </div>
    </section>
  );
}
