import { useCallback, useEffect, useState } from "react";
import SectionHeader from "@/components/base/SectionHeader";
import AudienceCard from "@/components/base/AudienceCard";
import FeatureCard from "@/components/base/FeatureCard";
import ClubEnquiryModal from "@/features/clubs/components/ClubEnquiryModal";
import SEO from "@/components/seo/SEO";
import { pageSeo } from "@/config/pageSeo";
import { apiJson } from "@/lib/api";
import { subscribeToContentUpdates } from "@/lib/contentSync";

interface ClubCardContent {
  icon: string;
  title: string;
  description: string;
  is_active?: boolean;
}

interface RegionalClubContent {
  icon: string;
  name: string;
  description: string;
  label: string;
  is_active?: boolean;
}

interface ClubPageContent {
  regional_clubs: RegionalClubContent[];
  activities: ClubCardContent[];
  audience_values: ClubCardContent[];
  updated_at: string;
}

export default function Clubs() {
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [content, setContent] = useState<ClubPageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadClubContent = useCallback(async () => {
      try {
        setLoadError("");
        const response = await apiJson<ClubPageContent>(
          "/api/clubs/content",
          undefined,
          { cache: "no-store" },
        );
        setContent(response);
      } catch (error) {
        setContent(null);
        setLoadError(error instanceof Error ? error.message : "Club content could not be loaded.");
      } finally {
        setIsLoading(false);
      }
  }, []);

  useEffect(() => {
    void loadClubContent();
    return subscribeToContentUpdates("clubs", () => void loadClubContent());
  }, [loadClubContent]);

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
  }, [content]);

  const clubs = content?.regional_clubs.filter((item) => item.is_active !== false) ?? [];
  const activities = content?.activities.filter((item) => item.is_active !== false) ?? [];
  const audiences = content?.audience_values.filter((item) => item.is_active !== false) ?? [];

  return (
    <div>
      <SEO {...pageSeo.clubs} />
      {/* Hero */}
      <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-center bg-background-100">
        <div className="absolute inset-0">
          <img
            loading="eager"
            fetchPriority="high"
            decoding="async"
            src="https://readdy.ai/api/search-image?query=Abstract%20network%20node%20map%20with%20connecting%20lines%20on%20warm%20ivory%20background%2C%20subtle%20geographic%20patterns%2C%20soft%20gold%20and%20teal%20accents%2C%20professional%20institutional%20texture%2C%20minimal%20clean%20aesthetic%2C%20premium%20editorial%20quality%2C%20no%20text&width=1600&height=900&seq=ipc-clubs-hero&orientation=landscape"
            alt="Clubs background"
            className="w-full h-full object-cover opacity-15"
          />
        </div>
        <div className="relative z-10 container-content w-full pt-24 md:pt-32">
          <div className="max-w-3xl reveal">
            <span className="eyebrow text-primary-600 mb-4 block">Regional Communities</span>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-background-950 leading-[1.1] mb-6">
              Clubs
            </h1>
            <p className="text-base md:text-lg text-foreground-600 leading-relaxed max-w-2xl mb-8">
              Regional clubs are local professional communities. They create spaces where people meet, learn and exchange practice. The Institute uses regional clubs as a major membership value driver alongside London Master Class Events.
            </p>
            <button
              type="button"
              onClick={() => setIsEnquiryModalOpen(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <i className="ri-mail-line" aria-hidden="true" />
              Enquire About Clubs
            </button>
          </div>
        </div>
      </section>

      {/* Regional Clubs */}
      <section className="bg-background-50 section-padding">
        <div className="container-content">
          <div className="reveal">
            <SectionHeader
              eyebrow="Locations"
              title="Regional clubs"
              subtitle="Local communities across the United Kingdom for talks, networking, site visits and student engagement."
              centered
            />
          </div>
          <div className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading && <ClubContentLoading label="regional clubs" />}
            {!isLoading && loadError && <ClubContentError message={loadError} />}
            {!isLoading && !loadError && clubs.map((club, index) => (
              <div key={club.name} className="reveal" style={{ transitionDelay: `${index * 100}ms` }}>
                <div className="bg-background-100 border border-background-200/70 p-6 md:p-7 h-full transition-all duration-300 hover:border-primary-200 hover:shadow-sm relative overflow-hidden">
                  <span className="inline-block px-3 py-1 bg-background-950 text-background-50 text-xs font-medium rounded-full mb-4">
                    {club.label}
                  </span>
                  <div className="w-12 h-12 bg-accent-100 flex items-center justify-center mb-4">
                    <i className={`${club.icon} text-xl text-accent-600`} />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-background-950 mb-3">{club.name}</h3>
                  <p className="text-sm text-foreground-600 leading-relaxed">{club.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Clubs Do */}
      <section className="bg-background-950 section-padding">
        <div className="container-content">
          <div className="reveal">
            <SectionHeader
              eyebrow="Activities"
              title="What clubs do"
              subtitle="Regional clubs deliver practical value through multiple activity types that serve different professional needs."
              light
              centered
            />
          </div>
          <div className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {isLoading && <ClubContentLoading label="club activities" />}
            {!isLoading && loadError && <ClubContentError message={loadError} />}
            {!isLoading && !loadError && activities.map((activity, index) => (
              <div key={activity.title} className="reveal" style={{ transitionDelay: `${index * 80}ms` }}>
                <FeatureCard icon={activity.icon} title={activity.title} description={activity.description} light />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value by Audience */}
      <section className="bg-background-100 section-padding">
        <div className="container-content">
          <div className="reveal">
            <SectionHeader
              eyebrow="Value"
              title="Value by audience"
              subtitle="Clubs serve the full spectrum of the project controls community with activities tailored to career stage and professional needs."
              centered
            />
          </div>
          <div className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading && <ClubContentLoading label="audience values" />}
            {!isLoading && loadError && <ClubContentError message={loadError} />}
            {!isLoading && !loadError && audiences.map((audience, index) => (
              <div key={audience.title} className="reveal" style={{ transitionDelay: `${index * 100}ms` }}>
                <AudienceCard icon={audience.icon} title={audience.title} description={audience.description} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background-50 py-20 md:py-28">
        <div className="container-content text-center">
          <div className="reveal max-w-2xl mx-auto">
            <h3 className="font-heading text-2xl md:text-3xl font-semibold text-background-950 mb-4">
              Find your local club
            </h3>
            <p className="text-foreground-600 mb-8">
              Join the London, Nottingham, Manchester or Kent – Maidstone professional club. Enquire about upcoming meetings and how to get involved.
            </p>
            <button
              type="button"
              onClick={() => setIsEnquiryModalOpen(true)}
              className="btn-primary inline-flex items-center gap-3"
            >
              <span className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                <i className="ri-mail-line text-background-50 text-sm" aria-hidden="true" />
              </span>
              Enquire About Clubs
            </button>
          </div>
        </div>
      </section>
      <ClubEnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
      />
    </div>
  );
}

function ClubContentLoading({ label }: { label: string }) {
  return (
    <div className="col-span-full flex items-center justify-center gap-3 py-16 text-foreground-600" role="status">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-background-300 border-t-primary-600" aria-hidden="true" />
      Loading {label}…
    </div>
  );
}

function ClubContentError({ message }: { message: string }) {
  return (
    <div className="col-span-full border border-red-200 bg-red-50 px-6 py-8 text-center text-red-800" role="alert">
      {message}
    </div>
  );
}
