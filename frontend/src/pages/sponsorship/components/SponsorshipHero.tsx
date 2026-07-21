import { useManagedSection } from "@/components/content/ManagedContentProvider";

const fallbackContent = { eyebrow: "Sponsorship & partnerships", title: "Support opportunity. Strengthen the profession.", description: "Partner with IPC to support scholarships, events, awards, regional clubs, publications and professional-development activity through transparent, ethical and outcome-focused sponsorship.", primary_cta_label: "Build a sponsorship route", primary_cta_url: "#route-builder", secondary_cta_label: "Explore opportunities", secondary_cta_url: "#opportunities" };

export default function SponsorshipHero() {
  const content = useManagedSection("hero", fallbackContent);
  return (
    <section className="relative flex min-h-[60vh] items-center overflow-hidden bg-background-950 md:min-h-[70vh]">
      <div className="absolute inset-0 opacity-20">
        <img
          loading="eager"
          fetchPriority="high"
          decoding="async"
          src="https://readdy.ai/api/search-image?query=Abstract%20geometric%20gold%20grid%20lines%20on%20deep%20charcoal%20background%2C%20subtle%20network%20connections%2C%20professional%20institutional%20texture%2C%20warm%20neutral%20tones%2C%20premium%20editorial%20quality%2C%20no%20text&width=1600&height=900&seq=ipc-sponsorship-hero&orientation=landscape"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-background-950 via-background-950/90 to-background-950/70" />
      <div className="container-content relative z-10 w-full pt-24 md:pt-32">
        <div className="reveal max-w-3xl">
          <span className="eyebrow mb-4 block text-primary-400">{content.eyebrow}</span>
          <h1 className="mb-6 font-heading text-4xl font-bold leading-[1.1] text-background-50 sm:text-5xl md:text-6xl">
            {content.title}
          </h1>
          <p className="mb-8 max-w-2xl text-base leading-relaxed text-background-200 md:text-lg">
            {content.description}
          </p>
          <div className="flex flex-wrap gap-3">
            <a href={content.primary_cta_url} className="btn-primary inline-flex items-center gap-2">
              <i className="ri-route-line" aria-hidden="true" />
              {content.primary_cta_label}
            </a>
            <a href={content.secondary_cta_url} className="btn-secondary inline-flex items-center gap-2">
              {content.secondary_cta_label}
              <i className="ri-arrow-down-line" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
