import { useEffect } from "react";
import { Link } from "react-router-dom";
import SectionHeader from "@/components/base/SectionHeader";
import FeatureCard from "@/components/base/FeatureCard";
import SEO from "@/components/seo/SEO";
import { pageSeo } from "@/config/pageSeo";

export default function Sponsorship() {
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

  const routes = [
    {
      icon: "ri-graduation-cap-line",
      title: "Sponsor Learners",
      description:
        "Fund access to project controls education and professional recognition. Support learners, career changers, apprentices and students entering the profession.",
    },
    {
      icon: "ri-calendar-event-line",
      title: "Sponsor Events",
      description:
        "Support master classes, venues, speakers, student places or regional clubs. Create spaces where professionals meet, learn and exchange practice.",
    },
    {
      icon: "ri-award-line",
      title: "Sponsor Awards",
      description:
        "Support academic, commercial, professional and special recognition prizes without influencing outcome. Celebrate excellence and contribution.",
    },
    {
      icon: "ri-team-line",
      title: "Sponsor Clubs",
      description:
        "Support London, Nottingham, Manchester or Kent – Maidstone professional clubs. Help build local communities for talks, networking and student engagement.",
    },
    {
      icon: "ri-book-2-line",
      title: "Sponsor Publications",
      description:
        "Support the professional magazine or research activity with transparent editorial independence. Help the Institute become a knowledge-producing body.",
    },
  ];

  const partners = [
    {
      type: "Training Providers",
      benefits:
        "Align courses to IPC competence domains, support learners into membership, sponsor events and contribute technical content.",
    },
    {
      type: "NGOs and Charities",
      benefits:
        "Sponsor learners, support second-chance career pathways, veterans, community leaders and people facing barriers to employment.",
    },
    {
      type: "Recruitment Companies",
      benefits:
        "Sponsor career workshops, regional clubs, magazine career pages, emerging talent awards and ethical networking events.",
    },
    {
      type: "Public Bodies",
      benefits:
        "Support professional capability, regional skills development, scholarships and public value through project controls education.",
    },
  ];

  const integrity = [
    {
      icon: "ri-shield-check-line",
      title: "Ethical Alignment",
      description:
        "Sponsorship must align with the Institute's values of integrity, competence, accountability and professional growth.",
    },
    {
      icon: "ri-hand-heart-line",
      title: "No Quid Pro Quuo",
      description:
        "Sponsors do not receive automatic influence over recognition decisions, award outcomes or editorial content.",
    },
    {
      icon: "ri-eye-line",
      title: "Transparency",
      description:
        "Sponsorship arrangements are transparent. The Institute publishes sponsor involvement and maintains clear boundaries.",
    },
    {
      icon: "ri-government-line",
      title: "Governance",
      description:
        "Sponsorship and partnership should not give organisations automatic access to private member data. Engagement is consent-based.",
    },
    {
      icon: "ri-file-list-3-line",
      title: "Reporting",
      description:
        "The Institute reports on how sponsorship funds are used and the impact on learners, events, awards and community activities.",
    },
  ];

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
            {routes.map((route, index) => (
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
                {partners.map((row, index) => (
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
            {integrity.map((item, index) => (
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
