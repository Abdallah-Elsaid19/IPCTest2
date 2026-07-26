import { Link } from "react-router-dom";

import type { AwardPartnership, AwardSectionIntro } from "../types";

export default function AwardsPartnerships({
  content,
  partnerships,
}: {
  content: AwardSectionIntro;
  partnerships: AwardPartnership[];
}) {
  if (content.is_active === false) return null;
  const sponsorItems = (content.sponsorship_items || []).filter(
    (item) => item.is_active !== false,
  );

  return (
    <section id="awards-partnerships" className="scroll-mt-20 bg-accent-800 section-padding text-background-50">
      <div className="container-content">
        <div className="reveal mx-auto max-w-4xl text-center">
          <span className="eyebrow mb-4 block text-primary-300">{content.eyebrow}</span>
          <h2 className="font-heading text-4xl font-semibold leading-tight md:text-5xl">
            {content.title}
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-background-200 md:text-lg">
            {content.description}
          </p>
        </div>

        <div className="mt-12 grid border-l border-t border-white/20 lg:grid-cols-3">
          {partnerships.map((item, index) => (
            <article
              key={item.title}
              className={`reveal reveal-delay-${index + 1} flex min-h-[27rem] flex-col border-b border-r border-white/20 bg-white/5 p-7`}
            >
              <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-primary-300">
                0{index + 1}
              </span>
              <h3 className="mt-7 font-heading text-2xl font-semibold">{item.title}</h3>
              {item.description && (
                <p className="mt-3 text-sm font-semibold text-primary-200">
                  {item.description}
                </p>
              )}
              <ul className="mt-7 space-y-3 text-sm text-background-200">
                {item.items.map((benefit) => (
                  <li key={benefit} className="flex gap-3 leading-relaxed">
                    <i className="ri-check-line shrink-0 text-primary-300" aria-hidden="true" />
                    {benefit}
                  </li>
                ))}
              </ul>
              <Link
                to={item.cta_url}
                state={{ enquiry: item.cta_label }}
                className="mt-auto pt-8 text-sm font-bold text-primary-200"
              >
                {item.cta_label} →
              </Link>
            </article>
          ))}
        </div>

        {content.disclaimer && (
          <p className="mt-7 border-l-2 border-primary-400 px-5 py-3 text-xs leading-relaxed text-background-200">
            {content.disclaimer}
          </p>
        )}

        {content.sponsorship_title && (
          <div className="reveal mt-16 grid border border-white/20 bg-background-950 lg:grid-cols-[1.05fr_.95fr]">
            <div className="p-7 md:p-10">
              <span className="eyebrow text-primary-400">
                {content.sponsorship_eyebrow}
              </span>
              <h3 className="mt-4 font-heading text-3xl font-semibold leading-tight md:text-4xl">
                {content.sponsorship_title}
              </h3>
              <p className="mt-5 max-w-2xl text-sm leading-[1.8] text-background-300 md:text-base">
                {content.sponsorship_description}
              </p>
              <Link
                to={content.sponsorship_cta_url || "/information-session"}
                state={{ enquiry: content.sponsorship_cta_label || "Sponsor an Award" }}
                className="btn-primary mt-8"
              >
                {content.sponsorship_cta_label || "Sponsor an Award"}
              </Link>
            </div>
            <div className="grid border-t border-white/20 sm:grid-cols-2 lg:border-l lg:border-t-0">
              {sponsorItems.map((item) => (
                <div key={item.title} className="border-b border-r border-white/20 p-6">
                  <h4 className="font-heading text-base font-semibold text-primary-300">
                    {item.title}
                  </h4>
                  <p className="mt-3 text-xs leading-relaxed text-background-400">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
