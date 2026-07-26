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
  if (href.startsWith("mailto:") || href.startsWith("#")) {
    return (
      <a href={href} className={className}>
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
    eyebrow: "Apply for Opportunity",
    title: "Take the next step towards a project controls career.",
    description:
      "You do not need to already be an expert. Explain who you are, the barrier you face, the contribution you have made and the professional future you want to build.",
    primary_cta_label: "Enquire About Scholarships",
    primary_cta_url: "/information-session",
    tertiary_cta_label: "Sponsor a Learner",
    tertiary_cta_url: "/sponsorship",
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
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <CtaLink href={content.primary_cta_url} label={content.primary_cta_label} className="btn-primary" />
            <CtaLink href={content.tertiary_cta_url} label={content.tertiary_cta_label} className="btn-secondary" />
          </div>
          <address className="mt-10 border-t border-background-800 pt-7 text-sm not-italic leading-relaxed text-background-400">
            <a href={`mailto:${content.email}`} className="text-primary-300 underline underline-offset-4">
              {content.email}
            </a>
            <span className="mx-3 hidden text-background-700 sm:inline">|</span>
            <span className="mt-2 block sm:mt-0 sm:inline">{content.address}</span>
          </address>
        </div>
      </div>
    </section>
  );
}
