import { Link } from "react-router-dom";
import { informationSessionPath } from "./constants";
import { useManagedSection } from "@/components/content/ManagedContentProvider";

const fallbackContent = {
  eyebrow: "Build professional impact",
  title: "Sponsor opportunity, recognition and stronger project controls capability.",
  description: "Support a learner, fund a scholarship, sponsor a master class, recognise excellence, strengthen a regional club, publish useful knowledge or build a strategic partnership.",
  primary_cta_label: "Discuss Sponsorship",
  primary_cta_url: informationSessionPath,
  secondary_cta_label: "Sponsor a Learner",
  secondary_cta_url: informationSessionPath,
  tertiary_cta_label: "Sponsor an Award",
  tertiary_cta_url: informationSessionPath,
  address: "39 Maidstone Innovation Centre, Maidstone, Kent, ME14 5FY",
  email: "office@instituteofprojectcontrols.org",
};

export default function SponsorshipFinalCta() {
  const content = useManagedSection("final_cta", fallbackContent);
  return (
    <section className="bg-background-50 py-20 md:py-28">
      <div className="container-content text-center">
        <div className="reveal mx-auto max-w-3xl">
          <span className="eyebrow mb-4 block text-primary-600">{content.eyebrow}</span>
          <h2 className="mb-4 font-heading text-2xl font-semibold text-background-950 md:text-3xl">{content.title}</h2>
          <p className="mx-auto mb-8 max-w-2xl text-foreground-600">{content.description}</p>
          <div className="mx-auto flex w-full flex-col items-stretch justify-center gap-3 sm:w-fit sm:flex-row sm:items-center">
            <Link to={content.primary_cta_url} className="btn-primary inline-flex items-center justify-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600">
                <i className="ri-calendar-line text-sm text-background-50" aria-hidden="true" />
              </span>
              {content.primary_cta_label}
            </Link>
            <Link to={content.secondary_cta_url} className="inline-flex min-h-[50px] items-center justify-center gap-2 border border-background-300 px-8 font-label text-sm font-semibold uppercase tracking-[0.02em] text-background-950 transition-colors hover:border-background-950">{content.secondary_cta_label}<i className="ri-arrow-right-line" aria-hidden="true" /></Link>
            <Link to={content.tertiary_cta_url} className="inline-flex min-h-[50px] items-center justify-center gap-2 border border-background-300 px-8 font-label text-sm font-semibold uppercase tracking-[0.02em] text-background-950 transition-colors hover:border-background-950">{content.tertiary_cta_label}<i className="ri-arrow-right-line" aria-hidden="true" /></Link>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-foreground-600">
            <span><strong className="text-background-950">Address:</strong> {content.address}</span>
            <a href={`mailto:${content.email}`} className="font-semibold text-primary-700 hover:text-primary-800">{content.email}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
