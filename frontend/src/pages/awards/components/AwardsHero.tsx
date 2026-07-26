import { Link } from "react-router-dom";
import type { AwardPageContent } from "../types";

export default function AwardsHero({ content }: { content: AwardPageContent["hero"] }) {
  if (content.is_active === false) return null;
  const highlights = (content.highlights || []).filter(
    (item) => item.is_active !== false,
  );

  return (
    <section className="relative flex min-h-[78vh] items-center overflow-hidden bg-background-950">
      <div className="absolute inset-0 opacity-25">
        <img loading="eager" fetchPriority="high" decoding="async" src={content.image_url} alt={content.image_alt} className="h-full w-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-background-950 via-background-950/90 to-background-950/60" />
      <div className="container-content relative z-10 w-full py-28 md:py-36">
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_.8fr] lg:gap-16">
          <div className="max-w-4xl reveal">
            <span className="eyebrow mb-4 block text-primary-400">{content.eyebrow}</span>
            <h1 className="font-heading text-4xl font-bold leading-[1.06] text-background-50 sm:text-5xl md:text-6xl lg:text-7xl">{content.title}</h1>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-background-200 md:text-lg">{content.description}</p>
            {content.secondary_description && (
              <p className="mt-4 max-w-3xl text-sm leading-[1.8] text-background-400 md:text-base">
                {content.secondary_description}
              </p>
            )}
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <a href={content.primary_cta_url} className="btn-primary inline-flex items-center gap-2">
                <i className="ri-mail-line" />
                {content.primary_cta_label}
              </a>
              <Link
                to={content.secondary_cta_url}
                state={{ enquiry: content.secondary_cta_label }}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <i className="ri-hand-coin-line" />
                {content.secondary_cta_label}
              </Link>
            </div>
          </div>

          {highlights.length > 0 && (
            <aside className="reveal border border-background-700 bg-background-900/80 p-7 backdrop-blur-sm md:p-9">
              <span className="eyebrow text-primary-400">Programme highlights</span>
              <h2 className="mt-4 font-heading text-2xl font-semibold leading-tight text-background-50">
                A professional platform for evidence-based recognition.
              </h2>
              <dl className="mt-7 divide-y divide-background-700">
                {highlights.map((item) => (
                  <div key={item.title} className="py-5 first:pt-0 last:pb-0">
                    <dt className="font-semibold text-primary-300">{item.title}</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-background-400">
                      {item.description}
                    </dd>
                  </div>
                ))}
              </dl>
            </aside>
          )}
        </div>
      </div>
      <span
        className="absolute bottom-0 left-0 h-1 w-1/3 bg-primary-500"
        aria-hidden="true"
      />
    </section>
  );
}
