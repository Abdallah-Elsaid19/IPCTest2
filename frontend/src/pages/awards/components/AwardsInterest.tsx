import AwardNominationEntryForm from "./AwardNominationEntryForm";
import { Link } from "react-router-dom";
import type { AwardSectionIntro } from "../types";

export default function AwardsInterest({ content }: { content: AwardSectionIntro }) {
  if (content.is_active === false) return null;
  return (
    <section id="awards-interest" className="bg-background-100 section-padding">
      <div className="container-content">
        <div className="reveal mx-auto mb-10 max-w-4xl text-center">
          <span className="eyebrow mb-4 block text-primary-600">{content.eyebrow}</span>
          <h2 className="mb-4 font-heading text-3xl font-semibold text-background-950 md:text-4xl">
            {content.title}
          </h2>
          <p className="mx-auto max-w-3xl leading-relaxed text-foreground-600">
            {content.description}
          </p>
        </div>
        <div className="border border-background-200/70 bg-background-50 p-6 reveal md:p-8"><AwardNominationEntryForm /></div>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 reveal sm:flex-row">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-foreground-500">or</span>
          <Link to={content.secondary_cta_url || "/information-session"} className="btn-secondary inline-flex items-center gap-2 border-background-950 text-background-950">
            <i className="ri-calendar-event-line" aria-hidden="true" />
            {content.secondary_cta_label || "Book an information session"}
          </Link>
        </div>
      </div>
    </section>
  );
}
