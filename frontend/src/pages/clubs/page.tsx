import { useEffect, useState } from "react";
import SectionHeader from "@/components/base/SectionHeader";
import AudienceCard from "@/components/base/AudienceCard";
import FeatureCard from "@/components/base/FeatureCard";
import ClubEnquiryModal from "@/features/clubs/components/ClubEnquiryModal";

export default function Clubs() {
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);

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
  }, []);

  const clubs = [
    {
      icon: "ri-map-pin-2-line",
      name: "London",
      description:
        "The capital's professional club hosts master classes, technical talks, employer engagement events and mentoring circles. A hub for senior professionals and emerging talent.",
      label: "Capital",
    },
    {
      icon: "ri-map-pin-2-line",
      name: "Nottingham",
      description:
        "A regional community connecting East Midlands professionals through talks, networking and student engagement with local universities and employers.",
      label: "Regional",
    },
    {
      icon: "ri-map-pin-2-line",
      name: "Manchester",
      description:
        "Serving the North West with regular meetings, site visits, technical sessions and career support for project controls professionals across sectors.",
      label: "Regional",
    },
    {
      icon: "ri-map-pin-2-line",
      name: "Kent – Maidstone",
      description:
        "Based at the Maidstone Innovation Centre, this club supports local practitioners, connects with the Institute office and hosts regular professional development events.",
      label: "Headquarters",
    },
  ];

  const activities = [
    {
      icon: "ri-slideshow-line",
      title: "Technical Talks",
      description:
        "Practical sessions on planning, cost, risk, AI, sustainability, delay analysis and emerging controls methods.",
    },
    {
      icon: "ri-team-line",
      title: "Networking",
      description:
        "Meet professionals from different sectors, compare methods, hear lessons learned and build your professional network.",
    },
    {
      icon: "ri-user-follow-line",
      title: "Mentoring",
      description:
        "Structured peer and senior mentoring for early-career members, Associate Fellows and those preparing for higher grades.",
    },
    {
      icon: "ri-building-line",
      title: "Site Visits",
      description:
        "Visit live projects to understand how controls are applied in practice across construction, infrastructure and engineering.",
    },
    {
      icon: "ri-briefcase-line",
      title: "Career Support",
      description:
        "Guidance on progression, evidence preparation, CPD planning and professional identity building.",
    },
  ];

  const audiences = [
    {
      icon: "ri-seedling-line",
      title: "Early-Career Members",
      description:
        "Clubs reduce isolation and help new entrants understand the profession, meet employers and identify mentors.",
    },
    {
      icon: "ri-user-star-line",
      title: "Senior Professionals",
      description:
        "Create opportunities to speak, mentor, judge awards and influence the future direction of the profession.",
    },
    {
      icon: "ri-tools-line",
      title: "Practitioners",
      description:
        "Practical knowledge exchange across sectors and specialist disciplines that improves day-to-day practice.",
    },
    {
      icon: "ri-building-2-line",
      title: "Employers",
      description:
        "Build brand presence, support CPD for staff and connect with project controls talent in your region.",
    },
  ];

  return (
    <div>
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
            {clubs.map((club, index) => (
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
            {activities.map((activity, index) => (
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
            {audiences.map((audience, index) => (
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
