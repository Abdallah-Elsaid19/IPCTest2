import { useEffect } from "react";
import SectionHeader from "@/components/base/SectionHeader";
import AudienceCard from "@/components/base/AudienceCard";
import FeatureCard from "@/components/base/FeatureCard";

export default function Scholarships() {
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

  const audiences = [
    {
      icon: "ri-graduation-cap-line",
      title: "Full-time Students",
      description:
        "Students on project controls, construction, engineering, quantity surveying, PMO and related programmes who want professional affiliation while studying.",
    },
    {
      icon: "ri-exchange-line",
      title: "Career Changers",
      description:
        "Professionals from engineering, quantity surveying, estimating, finance, military service, PMO, procurement and business analysis seeking to enter project controls.",
    },
    {
      icon: "ri-heart-line",
      title: "Underrepresented Groups",
      description:
        "Values-based access routes for learners who may not otherwise have opportunity, supporting diversity and social mobility in the profession.",
    },
    {
      icon: "ri-user-star-line",
      title: "Emerging Professionals",
      description:
        "Early-career practitioners, apprentices and junior staff who need support to develop foundation competence and build evidence for recognition.",
    },
  ];

  const values = [
    {
      icon: "ri-wallet-3-line",
      title: "Access to Recognition",
      description:
        "Scholarships fund access to project controls education and professional recognition for those who need support.",
    },
    {
      icon: "ri-links-line",
      title: "Professional Community",
      description:
        "Scholarship recipients join the Institute community, attend events, access clubs and build their professional network from day one.",
    },
    {
      icon: "ri-book-open-line",
      title: "Learning Resources",
      description:
        "Access to professional magazine content, master classes, CPD activity and thought leadership materials.",
    },
    {
      icon: "ri-award-line",
      title: "Career Visibility",
      description:
        "Post-nominal use, LinkedIn value, CV strengthening and professional identity that signals commitment to the discipline.",
    },
    {
      icon: "ri-user-follow-line",
      title: "Mentoring Support",
      description:
        "Structured peer and senior mentoring opportunities through mentoring circles and regional clubs.",
    },
    {
      icon: "ri-building-2-line",
      title: "Employer Connections",
      description:
        "Events where employers, recruiters and consultants can meet talent and share industry needs.",
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
            src="https://readdy.ai/api/search-image?query=Warm%20abstract%20educational%20institutional%20environment%20with%20soft%20natural%20lighting%2C%20subtle%20geometric%20patterns%2C%20warm%20ivory%20and%20gold%20tones%2C%20professional%20academic%20atmosphere%2C%20minimal%20clean%20aesthetic%2C%20premium%20editorial%20quality%2C%20no%20people&width=1600&height=900&seq=ipc-scholarship-hero&orientation=landscape"
            alt="Scholarship background"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 container-content w-full pt-24 md:pt-32">
          <div className="max-w-3xl reveal">
            <span className="eyebrow text-primary-600 mb-4 block">Opportunity</span>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-background-950 leading-[1.1] mb-6">
              Scholarships
            </h1>
            <p className="text-base md:text-lg text-foreground-600 leading-relaxed max-w-2xl mb-8">
              The Institute connects membership to recognition beyond grades. Scholarships and bursaries open access to learners who may not otherwise have opportunity.
            </p>
            <a href="mailto:office@instituteofprojectcontrols.org" className="btn-primary inline-flex items-center gap-2">
              <i className="ri-mail-line" />
              Enquire About Scholarships
            </a>
          </div>
        </div>
      </section>

      {/* What Scholarships Support */}
      <section className="bg-accent-500 section-padding">
        <div className="container-content">
          <div className="reveal max-w-4xl mx-auto text-center">
            <span className="eyebrow text-background-50/70 mb-4 block">Institutional Commitment</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-background-50 mb-6">
              What scholarships support
            </h2>
            <p className="text-base md:text-lg text-background-100 leading-relaxed">
              Support up to 40 places per intake, subject to eligibility and funding, through values-based access routes.
              Scholarships help people enter project controls through non-linear routes and create a stronger talent pipeline for the profession.
            </p>
          </div>
        </div>
      </section>

      {/* Who Scholarships Are For */}
      <section className="bg-background-50 section-padding">
        <div className="container-content">
          <div className="reveal">
            <SectionHeader
              eyebrow="Eligibility"
              title="Who scholarships are for"
              subtitle="The Institute welcomes learners from diverse backgrounds who demonstrate genuine interest in project controls and commitment to professional conduct."
              centered
            />
          </div>
          <div className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {audiences.map((audience, index) => (
              <div key={audience.title} className="reveal" style={{ transitionDelay: `${index * 100}ms` }}>
                <AudienceCard
                  icon={audience.icon}
                  title={audience.title}
                  description={audience.description}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scholarship Value */}
      <section className="bg-background-100 section-padding">
        <div className="container-content">
          <div className="reveal">
            <SectionHeader
              eyebrow="Value"
              title="Scholarship value"
              subtitle="Scholarships provide more than financial support. They create professional identity, community access and a visible pathway into project controls."
              centered
            />
          </div>
          <div className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <div key={value.title} className="reveal" style={{ transitionDelay: `${index * 80}ms` }}>
                <FeatureCard
                  icon={value.icon}
                  title={value.title}
                  description={value.description}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Enquire */}
      <section className="bg-background-950 py-20 md:py-28">
        <div className="container-content">
          <div className="reveal max-w-2xl mx-auto text-center">
            <h3 className="font-heading text-2xl md:text-3xl font-semibold text-background-50 mb-4">
              How to enquire
            </h3>
            <p className="text-background-300 mb-8">
              Send the learner group, programme interest, sponsorship aim or scholarship category you wish to support.
              The Institute will respond with guidance on eligibility and next steps.
            </p>
            <a href="mailto:office@instituteofprojectcontrols.org" className="btn-primary inline-flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                <i className="ri-mail-line text-background-50 text-sm" />
              </span>
              Enquire About Scholarships
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}