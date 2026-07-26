import { Link } from "react-router-dom";
import type { AwardPageContent } from "../types";

export default function AwardsHero({ content }: { content: AwardPageContent["hero"] }) {
  if (content.is_active === false) return null;

  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-background-950 md:min-h-[80vh]">
      <div className="absolute inset-0 opacity-25">
        <img loading="eager" fetchPriority="high" decoding="async" src={content.image_url} alt={content.image_alt} className="h-full w-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-background-950 via-background-950/90 to-background-950/60" />
      <div className="container-content relative z-10 w-full pt-24 md:pt-32">
        <div className="max-w-3xl reveal">
          <span className="eyebrow mb-4 block text-primary-400">{content.eyebrow}</span>
          <h1 className="mb-6 font-heading text-4xl font-bold leading-[1.1] text-background-50 sm:text-5xl md:text-6xl lg:text-7xl">{content.title}</h1>
          <p className="mb-10 max-w-2xl text-base leading-relaxed text-background-200 md:text-lg">{content.description}</p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <a href="#awards-interest" className="btn-primary inline-flex items-center gap-2"><i className="ri-mail-line" />Nominate by Email</a>
            <Link to="/information-session" state={{ enquiry: "Sponsor an Award" }} className="btn-secondary inline-flex items-center gap-2"><i className="ri-hand-coin-line" />Sponsor an Award</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
