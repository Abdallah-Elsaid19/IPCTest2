import { useManagedSection } from "@/components/content/ManagedContentProvider";

const fallbackContent = {
  announcement: "Sponsorship partnerships are open: support learners, scholarships, events, awards, clubs, publications and professional impact.",
  eyebrow: "Sponsorship & Strategic Partnerships",
  title: "Support the people, ideas and communities that strengthen project delivery.",
  description: "The Institute of Project Controls works with employers, consultancies, training providers, universities, recruitment companies, NGOs, charities and corporate partners to widen access to professional development and recognise excellence.",
  details: [
    "Sponsorship can support learners, scholarships, London Master Class Events, regional clubs, awards, professional publications, academic research, mentoring and social-impact activity.",
    "Partnerships are shaped around the sponsor’s objectives while protecting the independence of Institute decisions.",
  ],
  primary_cta_label: "Start a Sponsorship Conversation",
  primary_cta_url: "/information-session",
  secondary_cta_label: "Explore Sponsorship Routes",
  secondary_cta_url: "#sponsorship-routes",
};

export default function SponsorshipHero() {
  const content = useManagedSection("hero", fallbackContent);
  return (
    <section className="relative overflow-hidden bg-background-950">
      <div className="relative z-20 border-b border-background-50/10 bg-black px-4 py-2.5 text-center text-xs leading-relaxed text-background-100 sm:text-sm">
        <strong className="text-primary-400">Sponsorship partnerships are open:</strong>{" "}
        {content.announcement.replace(/^Sponsorship partnerships are open:\s*/i, "")}
      </div>
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
      <div className="container-content relative z-10 flex min-h-[70vh] w-full items-center py-24 md:min-h-[78vh] md:py-32">
        <div className="reveal max-w-3xl">
          <span className="eyebrow mb-4 block text-primary-400">{content.eyebrow}</span>
          <h1 className="mb-6 font-heading text-4xl font-bold leading-[1.1] text-background-50 sm:text-5xl md:text-6xl">
            {content.title}
          </h1>
          <p className="mb-8 max-w-2xl text-base leading-relaxed text-background-200 md:text-lg">
            {content.description}
          </p>
          <div className="mb-8 max-w-2xl space-y-3 text-sm leading-relaxed text-background-300 md:text-base">
            {content.details.map((detail) => <p key={detail}>{detail}</p>)}
          </div>
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
