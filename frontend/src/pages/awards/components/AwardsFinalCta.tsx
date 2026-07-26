import { Link } from "react-router-dom";

import type { AwardPageContent } from "../types";

export default function AwardsFinalCta({
  content,
}: {
  content: AwardPageContent["final_cta"];
}) {
  if (content.is_active === false) return null;
  const items = content.items.filter((item) => item.is_active !== false);

  return (
    <section className="bg-background-950 py-20 text-background-50 md:py-28">
      <div className="container-content">
        <div className="reveal mx-auto max-w-4xl text-center">
          <span className="eyebrow text-primary-400">{content.eyebrow}</span>
          <h2 className="mt-4 font-heading text-3xl font-semibold leading-tight md:text-5xl">
            {content.title}
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-background-300 md:text-lg">
            {content.description}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <a href={content.cta_url} className="btn-primary">
              <i className="ri-mail-line" aria-hidden="true" />
              {content.cta_label}
            </a>
            {content.secondary_cta_label && content.secondary_cta_url && (
              <Link
                to={content.secondary_cta_url}
                state={{ enquiry: content.secondary_cta_label }}
                className="btn-secondary"
              >
                <i className="ri-hand-coin-line" aria-hidden="true" />
                {content.secondary_cta_label}
              </Link>
            )}
          </div>
        </div>

        <div className="mt-12 grid border-l border-t border-background-700 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <article
              key={item.title}
              className={`reveal reveal-delay-${index + 1} min-h-40 border-b border-r border-background-700 p-5`}
            >
              <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-primary-400">
                0{index + 1}
              </span>
              <h3 className="mt-5 font-heading text-base font-semibold">
                {item.title}
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-background-400">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
