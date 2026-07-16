import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SectionHeader from "@/components/base/SectionHeader";
import FeatureCard from "@/components/base/FeatureCard";
import SEO from "@/components/seo/SEO";
import { pageSeo } from "@/config/pageSeo";
import { apiJson } from "@/lib/api";
import { subscribeToContentUpdates } from "@/lib/contentSync";

interface SponsorshipCardContent {
  icon: string;
  title: string;
  description: string;
  is_active?: boolean;
}

interface SponsorshipPartnerType {
  type: string;
  benefits: string;
  is_active?: boolean;
}

interface SponsorshipContent {
  routes: SponsorshipCardContent[];
  partner_types: SponsorshipPartnerType[];
  integrity_principles: SponsorshipCardContent[];
  updated_at: string;
}

export default function Sponsorship() {
  const [content, setContent] = useState<SponsorshipContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const routes = content?.routes.filter((item) => item.is_active !== false) ?? [];
  const partners = content?.partner_types.filter((item) => item.is_active !== false) ?? [];
  const integrity = content?.integrity_principles.filter((item) => item.is_active !== false) ?? [];

  const loadSponsorshipContent = useCallback(async () => {
      try {
        setLoadError("");
        const response = await apiJson<SponsorshipContent>(
          "/api/sponsorship",
          undefined,
          { cache: "no-store" },
        );
        setContent(response);
      } catch (error) {
        setContent(null);
        setLoadError(error instanceof Error ? error.message : "Sponsorship content could not be loaded.");
      } finally {
        setIsLoading(false);
      }
  }, []);

  useEffect(() => {
    void loadSponsorshipContent();
    return subscribeToContentUpdates("sponsorship", () => void loadSponsorshipContent());
  }, [loadSponsorshipContent]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [routes.length, partners.length, integrity.length]);

  return (
    <div>
      <SEO {...pageSeo.sponsorship} />
      {/* Hero */}
      <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-center overflow-hidden bg-background-950">
        <div className="absolute inset-0 opacity-20">
          <img
            loading="eager"
            fetchPriority="high"
            decoding="async"
            src="https://readdy.ai/api/search-image?query=Abstract%20geometric%20gold%20grid%20lines%20on%20deep%20charcoal%20background%2C%20subtle%20network%20connections%2C%20professional%20institutional%20texture%2C%20warm%20neutral%20tones%2C%20premium%20editorial%20quality%2C%20no%20text&width=1600&height=900&seq=ipc-sponsorship-hero&orientation=landscape"
            alt="Sponsorship background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-background-950 via-background-950/90 to-background-950/70" />
        <div className="relative z-10 container-content w-full pt-24 md:pt-32">
          <div className="max-w-3xl reveal">
            <span className="eyebrow text-primary-400 mb-4 block">Partnership</span>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-background-50 leading-[1.1] mb-6">
              Sponsorship
            </h1>
            <p className="text-base md:text-lg text-background-200 leading-relaxed max-w-2xl mb-8">
              Enable organisations to sponsor learners, events, awards, clubs, professional magazine and community activities. Sponsorship creates ethical visibility and supports social impact, access and professional development.
            </p>
            <Link to="/booking" className="btn-primary inline-flex items-center gap-2">
              <i className="ri-calendar-line" aria-hidden="true" />
              Discuss Sponsorship
            </Link>
          </div>
        </div>
      </section>

      {/* Sponsorship Routes */}
      <section className="bg-background-50 section-padding">
        <div className="container-content">
          <div className="reveal">
            <SectionHeader
              eyebrow="Routes"
              title="Sponsorship routes"
              subtitle="Sponsors can support the profession in multiple ways. Each route creates ethical visibility while delivering genuine value to the project controls community."
              centered
            />
          </div>
          <div className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading && (
              <div className="col-span-full flex items-center justify-center gap-3 py-16 text-foreground-600" role="status">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-background-300 border-t-primary-600" aria-hidden="true" />
                Loading sponsorship routes…
              </div>
            )}
            {!isLoading && loadError && (
              <div className="col-span-full border border-red-200 bg-red-50 px-6 py-8 text-center text-red-800" role="alert">
                {loadError}
              </div>
            )}
            {!isLoading && !loadError && routes.map((route, index) => (
              <div key={route.title} className="reveal" style={{ transitionDelay: `${index * 80}ms` }}>
                <FeatureCard icon={route.icon} title={route.title} description={route.description} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Types */}
      <section className="bg-background-100 section-padding">
        <div className="container-content">
          <div className="reveal">
            <SectionHeader
              eyebrow="Partners"
              title="Partner types"
              subtitle="The Institute welcomes partners whose work supports learners, career transition, social mobility and talent supply."
              centered
            />
          </div>
          <div className="mt-12 md:mt-16 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr className="border-b-2 border-background-950">
                  <th className="text-left py-4 px-4 font-heading text-sm font-semibold text-background-950 uppercase tracking-wide">
                    Partner Type
                  </th>
                  <th className="text-left py-4 px-4 font-heading text-sm font-semibold text-background-950 uppercase tracking-wide">
                    Benefits and Opportunities
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={2} className="py-16 text-center text-foreground-600">
                      Loading partner types…
                    </td>
                  </tr>
                )}
                {!isLoading && loadError && (
                  <tr>
                    <td colSpan={2} className="border border-red-200 bg-red-50 px-6 py-8 text-center text-red-800" role="alert">
                      {loadError}
                    </td>
                  </tr>
                )}
                {!isLoading && !loadError && partners.map((row, index) => (
                  <tr
                    key={row.type}
                    className={`border-b border-background-200 ${index % 2 === 0 ? "bg-background-50/50" : ""}`}
                  >
                    <td className="py-4 px-4 font-medium text-background-950 whitespace-nowrap">{row.type}</td>
                    <td className="py-4 px-4 text-sm text-foreground-600 leading-relaxed">{row.benefits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Sponsorship Integrity */}
      <section className="bg-background-950 section-padding">
        <div className="container-content">
          <div className="reveal">
            <SectionHeader
              eyebrow="Governance"
              title="Sponsorship integrity"
              subtitle="Sponsorship must be values-led, transparent and aligned to the Institute's professional standards. It should never compromise the independence of recognition decisions."
              light
              centered
            />
          </div>
          <div className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {isLoading && (
              <div className="col-span-full flex items-center justify-center gap-3 py-16 text-background-300" role="status">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-background-700 border-t-primary-500" aria-hidden="true" />
                Loading integrity principles…
              </div>
            )}
            {!isLoading && loadError && (
              <div className="col-span-full border border-red-900 bg-red-950/50 px-6 py-8 text-center text-red-200" role="alert">
                {loadError}
              </div>
            )}
            {!isLoading && !loadError && integrity.map((item, index) => (
              <div key={item.title} className="reveal" style={{ transitionDelay: `${index * 80}ms` }}>
                <FeatureCard icon={item.icon} title={item.title} description={item.description} light />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background-100 py-20 md:py-28">
        <div className="container-content text-center">
          <div className="reveal max-w-2xl mx-auto">
            <h3 className="font-heading text-2xl md:text-3xl font-semibold text-background-950 mb-4">
              Partner with purpose
            </h3>
            <p className="text-foreground-600 mb-8">
              Send your organisation name, main contact, partnership interest and proposed areas of engagement.
            </p>
            <Link to="/booking" className="btn-primary inline-flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                <i className="ri-calendar-line text-background-50 text-sm" aria-hidden="true" />
              </span>
              Discuss Sponsorship
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
