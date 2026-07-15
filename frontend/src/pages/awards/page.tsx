import { useEffect } from "react";
import SectionHeader from "@/components/base/SectionHeader";
import AudienceCard from "@/components/base/AudienceCard";
import { SimpleInterestForm } from "@/components/forms/SimpleInterestForm";

export default function Awards() {
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

  const featuredAwards = [
    {
      name: "IPC Project Controls Team of the Year",
      category: "Commercial",
      description:
        "Recognises a project controls team that has made an exceptional contribution to project delivery through integrated planning, cost control, risk management and performance reporting. Open to teams from any sector, project size or geography.",
      criteria: ["Demonstrated integration of multiple controls disciplines", "Measurable improvement in project outcomes", "Evidence of innovation or practice development", "Professional conduct and collaboration"],
    },
    {
      name: "IPC Young Professional Award",
      category: "Professional",
      description:
        "Celebrates an emerging project controls professional under 30 who has made a notable contribution to their project, organisation or the wider profession. Candidates may self-nominate or be nominated by employers or mentors.",
      criteria: ["Evidence of professional growth and learning", "Contribution to project or team outcomes", "Commitment to CPD and development", "Potential for future leadership"],
    },
    {
      name: "IPC Dissertation Prize",
      category: "Academic",
      description:
        "Awarded for outstanding undergraduate or postgraduate dissertation research in project controls, planning, cost engineering, risk management or related fields. Open to students from any recognised university programme worldwide.",
      criteria: ["Originality and relevance of research", "Methodological rigour", "Practical applicability to project controls", "Quality of written presentation"],
    },
    {
      name: "IPC Lifetime Contribution Award",
      category: "Professional",
      description:
        "The Institute's highest honour, recognising a career of distinguished contribution to project controls practice, education, standards development or professional leadership. Awarded at the discretion of the Fellowship panel.",
      criteria: ["Sustained contribution over 20+ years", "Influence on the profession or discipline", "Mentoring and development of others", "Demonstrated integrity and professional conduct"],
    },
  ];

  const categories = [
    {
      icon: "ri-graduation-cap-line",
      title: "Academic Awards",
      description:
        "Recognise dissertations, student research, emerging researchers, academic contribution and university project controls excellence.",
      subItems: ["IPC Dissertation Prize", "Student Research Award", "Academic Contribution Award", "University Partnership Prize"],
      image: "https://readdy.ai/api/search-image?query=University%20graduation%20ceremony%20with%20academic%20regalia%20in%20a%20grand%20historic%20hall%2C%20warm%20golden%20lighting%2C%20scroll%20and%20certificate%20details%2C%20proud%20academic%20atmosphere%2C%20traditional%20yet%20modern%20setting%2C%20shallow%20depth%20of%20field%2C%20editorial%20quality&width=500&height=350&seq=awards-cat-academic-02&orientation=landscape",
    },
    {
      icon: "ri-building-2-line",
      title: "Commercial Awards",
      description:
        "Recognise project controls teams, innovation, digital transformation, risk and change management, and major project achievement.",
      subItems: ["Project Controls Team of the Year", "Digital Innovation Award", "Risk Management Excellence", "Major Project Achievement"],
      image: "https://readdy.ai/api/search-image?query=Professional%20team%20receiving%20an%20award%20on%20stage%20at%20a%20modern%20corporate%20ceremony%2C%20warm%20stage%20lighting%2C%20elegant%20glass%20trophy%2C%20confident%20professional%20expressions%2C%20large%20LED%20screen%20backdrop%2C%20premium%20event%20atmosphere%2C%20editorial%20photography%20style&width=500&height=350&seq=awards-cat-commercial-02&orientation=landscape",
    },
    {
      icon: "ri-user-star-line",
      title: "Professional Awards",
      description:
        "Recognise individuals, young professionals, leaders, mentors, Fellows, women in project controls and lifetime contribution.",
      subItems: ["Young Professional Award", "Mentor of the Year", "Women in Project Controls", "Lifetime Contribution Award"],
      image: "https://readdy.ai/api/search-image?query=Individual%20professional%20receiving%20a%20prestigious%20recognition%20award%20certificate%20in%20an%20elegant%20ceremony%20setting%2C%20warm%20spotlight%20effect%2C%20gold%20trophy%20on%20pedestal%2C%20professional%20handshake%2C%20refined%20corporate%20atmosphere%2C%20shallow%20depth%20of%20field%2C%20editorial%20quality&width=500&height=350&seq=awards-cat-professional-02&orientation=landscape",
    },
  ];

  const benefits = [
    {
      icon: "ri-trophy-line",
      title: "For Members",
      description:
        "Awards and publications create a public platform for achievement, contribution and professional visibility.",
    },
    {
      icon: "ri-school-line",
      title: "For Academic Partners",
      description:
        "Student prizes and papers help connect education to industry needs and professional identity.",
    },
    {
      icon: "ri-building-line",
      title: "For Employers",
      description:
        "Awards help recognise team excellence, strengthen employer brand and celebrate staff achievement.",
    },
    {
      icon: "ri-hand-heart-line",
      title: "For Sponsors",
      description:
        "Sponsorship creates ethical visibility and supports social impact, access and professional development.",
    },
  ];

  const timeline = [
    { phase: "Call for Nominations", period: "January – March", description: "Submission window opens. Nominations accepted from members, employers, academic partners and sponsors. Self-nomination permitted for professional categories." },
    { phase: "Evidence Submission", period: "April – May", description: "Nominees submit supporting portfolios, case studies, references and documented evidence against published award criteria." },
    { phase: "Independent Review", period: "June – August", description: "Fellows and senior professionals review submissions against criteria. Shortlisting panels convene. Additional evidence may be requested." },
    { phase: "Award Decisions", period: "September", description: "Final panels make award determinations. All nominees receive feedback. Winners and commendations confirmed." },
    { phase: "Recognition Event", period: "October – November", description: "Awards presented at the annual London ceremony. Winners profiled in the professional magazine, website and LinkedIn." },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center overflow-hidden bg-background-950">
        <div className="absolute inset-0 opacity-25">
          <img
            loading="eager"
            fetchPriority="high"
            decoding="async"
            src="https://readdy.ai/api/search-image?query=Close%20up%20of%20an%20elegant%20golden%20trophy%20and%20framed%20certificate%20on%20a%20dark%20polished%20wooden%20podium%2C%20soft%20dramatic%20spotlight%20from%20above%2C%20subtle%20laurel%20wreath%20motifs%20in%20background%20bokeh%2C%20deep%20charcoal%20backdrop%2C%20premium%20awards%20ceremony%20atmosphere%2C%20cinematic%20lighting%2C%20editorial%20photography%20quality&width=1600&height=900&seq=awards-hero-professional-03&orientation=landscape"
            alt="Prestigious awards trophy"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-background-950 via-background-950/90 to-background-950/60" />
        <div className="relative z-10 container-content w-full pt-24 md:pt-32">
          <div className="max-w-3xl reveal">
            <span className="eyebrow text-primary-400 mb-4 block">Excellence</span>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-background-50 leading-[1.1] mb-6">
              Awards &amp; Prizes
            </h1>
            <p className="text-base md:text-lg text-background-200 leading-relaxed max-w-2xl mb-10">
              The Institute connects membership to recognition beyond grades. Awards and prizes celebrate 
              excellence, contribution and achievement across academic, commercial and professional dimensions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#featured" className="btn-primary inline-flex items-center gap-2">
                <i className="ri-award-line" />
                Explore Awards
              </a>
              <a href="#awards-interest" className="btn-secondary inline-flex items-center gap-2">
                <i className="ri-mail-line" />
                Enquire About Nominations
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Award Categories — with images */}
      <section className="bg-background-50 section-padding">
        <div className="container-content">
          <div className="reveal">
            <SectionHeader
              eyebrow="Categories"
              title="Award categories"
              subtitle="Recognising excellence across the academic, commercial and professional dimensions of project controls."
              centered
            />
          </div>
          <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat, index) => (
              <div key={cat.title} className={`reveal reveal-delay-${index + 1}`}>
                <div className="bg-background-100 border border-background-200/70 overflow-hidden h-full transition-all duration-300 hover:border-primary-200 group">
                  <div className="relative overflow-hidden h-44">
                    <img
            loading="lazy"
            decoding="async"
                      src={cat.image}
                      alt={cat.title}
                      className="w-full h-full object-cover image-zoom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-950/70 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <div className="w-10 h-10 bg-background-50/20 backdrop-blur-sm flex items-center justify-center">
                        <i className={`${cat.icon} text-lg text-background-50`} />
                      </div>
                    </div>
                  </div>
                  <div className="p-6 md:p-7">
                    <h3 className="font-heading text-xl font-semibold text-background-950 mb-3">{cat.title}</h3>
                    <p className="text-sm text-foreground-600 leading-relaxed mb-5">{cat.description}</p>
                    <div className="space-y-2">
                      {cat.subItems.map((item) => (
                        <div key={item} className="flex items-center gap-2 text-sm text-background-950">
                          <i className="ri-checkbox-circle-line text-accent-600 text-base shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Awards — with image */}
      <section id="featured" className="bg-background-100 section-padding">
        <div className="container-content">
          <div className="reveal">
            <SectionHeader
              eyebrow="Featured"
              title="Featured awards"
              subtitle="The Institute's flagship awards represent the highest standards of recognition across the profession."
              centered
            />
          </div>
          <div className="mt-12 md:mt-16">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="lg:w-[35%] shrink-0 reveal reveal-delay-1">
                <div className="overflow-hidden sticky top-24">
                  <img
            loading="lazy"
            decoding="async"
                    src="https://readdy.ai/api/search-image?query=Elegant%20awards%20ceremony%20stage%20with%20golden%20spotlights%2C%20row%20of%20polished%20glass%20trophies%20lined%20up%20on%20a%20dark%20podium%2C%20floral%20arrangements%2C%20large%20projection%20screen%20with%20abstract%20geometric%20patterns%2C%20warm%20dramatic%20lighting%2C%20premium%20event%20production%2C%20editorial%20photography&width=700&height=900&seq=awards-featured-showcase-02&orientation=portrait"
                    alt="Awards ceremony stage"
                    className="w-full h-auto image-zoom"
                  />
                </div>
              </div>
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-5">
                {featuredAwards.map((award, index) => (
                  <div key={award.name} className={`reveal reveal-delay-${index + 2} bg-background-50 border border-background-200/70 p-6 md:p-7 transition-all duration-300 hover:border-primary-200`}>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-11 h-11 bg-primary-500 flex items-center justify-center shrink-0">
                        <i className="ri-award-line text-lg text-background-950" />
                      </div>
                      <div>
                        <span className="inline-block text-[10px] font-semibold uppercase tracking-widest text-primary-600 bg-primary-100 px-2.5 py-1 rounded-full mb-2">
                          {award.category}
                        </span>
                        <h3 className="font-heading text-lg font-semibold text-background-950 leading-tight">{award.name}</h3>
                      </div>
                    </div>
                    <p className="text-sm text-foreground-600 leading-relaxed mb-4">{award.description}</p>
                    <div className="border-t border-background-200 pt-4">
                      <span className="text-xs font-semibold text-foreground-500 uppercase tracking-wide block mb-2">Criteria</span>
                      <ul className="space-y-1.5">
                        {award.criteria.map((criterion) => (
                          <li key={criterion} className="flex items-start gap-2 text-xs text-foreground-600 leading-relaxed">
                            <i className="ri-check-line text-accent-600 mt-0.5 shrink-0" />
                            {criterion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nomination Timeline — with background image */}
      <section className="relative bg-background-950 section-padding overflow-hidden">
        <div className="absolute inset-0 opacity-12">
          <img
            loading="lazy"
            decoding="async"
            src="https://readdy.ai/api/search-image?query=Abstract%20timeline%20visualization%20with%20connected%20golden%20nodes%20and%20subtle%20pathway%20lines%20on%20deep%20charcoal%20background%2C%20geometric%20progress%20indicators%2C%20soft%20glowing%20orbs%20at%20each%20milestone%2C%20minimal%20abstract%20design%2C%20professional%20data%20visualization%20aesthetic%2C%20no%20text&width=1600&height=800&seq=awards-timeline-bg-02&orientation=landscape"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 container-content">
          <div className="reveal">
            <SectionHeader
              eyebrow="Process"
              title="Nomination timeline"
              subtitle="The annual awards cycle runs from January to November. Nominations are evidence-based and independently reviewed."
              light
              centered
            />
          </div>
          <div className="mt-12 md:mt-16 max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-background-700" />
              {timeline.map((step, index) => (
                <div key={step.phase} className={`reveal reveal-delay-${index + 1} relative pl-16 md:pl-20 pb-10 last:pb-0`}>
                  <div className="absolute left-2 md:left-4 top-1 w-8 h-8 rounded-full border-2 border-primary-500 bg-background-950 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 mb-2">
                    <h4 className="font-heading text-lg md:text-xl font-semibold text-background-50">{step.phase}</h4>
                    <span className="text-xs font-medium text-primary-400 bg-primary-500/10 px-2.5 py-0.5 rounded-full whitespace-nowrap">{step.period}</span>
                  </div>
                  <p className="text-sm text-background-400 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Awards Matter */}
      <section className="bg-background-50 section-padding">
        <div className="container-content">
          <div className="reveal">
            <SectionHeader
              eyebrow="Impact"
              title="Why awards matter"
              subtitle="Awards create public recognition, strengthen professional identity and help the project controls community celebrate what excellence looks like."
              centered
            />
          </div>
          <div className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={benefit.title} className={`reveal reveal-delay-${index + 1}`}>
                <AudienceCard icon={benefit.icon} title={benefit.title} description={benefit.description} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility and Integrity — with background image */}
      <section className="relative bg-background-100 section-padding overflow-hidden">
        <div className="absolute inset-0 opacity-8">
          <img
            loading="lazy"
            decoding="async"
            src="https://readdy.ai/api/search-image?query=Subtle%20geometric%20shield%20and%20scale%20motifs%20in%20warm%20gold%20lines%20on%20clean%20light%20ivory%20background%2C%20minimal%20abstract%20governance%20pattern%2C%20professional%20institutional%20texture%2C%20very%20faint%20repeating%20design%2C%20no%20text%2C%20soft%20elegant%20aesthetic&width=1600&height=800&seq=awards-governance-bg-02&orientation=landscape"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 container-content">
          <div className="reveal max-w-4xl mx-auto">
            <div className="bg-background-950 border border-background-800 p-8 md:p-12 text-center">
              <span className="eyebrow text-primary-400 mb-4 block">Governance</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-background-50 mb-6">
                Eligibility and integrity
              </h2>
              <p className="text-base md:text-lg text-background-300 leading-relaxed mb-10 max-w-2xl mx-auto">
                Award decisions are evidence-based and independent. Sponsors support prizes without influencing 
                outcomes. Reviewers assess submissions against published criteria. The Institute protects 
                confidentiality and avoids unsupported claims.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <div className="bg-background-900 p-5 reveal reveal-delay-1">
                  <i className="ri-shield-check-line text-primary-500 text-xl mb-3 block" />
                  <h4 className="font-heading text-base font-semibold text-background-50 mb-2">Independent Judging</h4>
                  <p className="text-sm text-background-400 leading-relaxed">Awards are judged by Fellows and senior professionals with no conflict of interest.</p>
                </div>
                <div className="bg-background-900 p-5 reveal reveal-delay-2">
                  <i className="ri-file-shield-line text-primary-500 text-xl mb-3 block" />
                  <h4 className="font-heading text-base font-semibold text-background-50 mb-2">Evidence Required</h4>
                  <p className="text-sm text-background-400 leading-relaxed">Submissions must include supporting evidence, case studies or documented contribution.</p>
                </div>
                <div className="bg-background-900 p-5 reveal reveal-delay-3">
                  <i className="ri-eye-off-line text-primary-500 text-xl mb-3 block" />
                  <h4 className="font-heading text-base font-semibold text-background-50 mb-2">Confidentiality</h4>
                  <p className="text-sm text-background-400 leading-relaxed">Sensitive project information should be anonymised. Commercial details remain protected.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="awards-interest" className="bg-background-100 section-padding">
        <div className="container-content">
          <div className="reveal max-w-3xl mb-10">
            <span className="eyebrow text-primary-600 mb-4 block">Interest</span>
            <h2 className="font-heading text-3xl md:text-4xl font-semibold text-background-950 mb-4">Awards and prizes interest</h2>
            <p className="text-foreground-600 leading-relaxed">Register interest in nominating, sponsoring, judging or discussing IPC awards and prizes.</p>
          </div>
          <div className="bg-background-50 border border-background-200/70 p-6 md:p-8 reveal">
            <SimpleInterestForm type="awards" />
          </div>
        </div>
      </section>
      {/* CTA */}
      <section className="bg-background-50 py-20 md:py-28">
        <div className="container-content text-center">
          <div className="reveal max-w-2xl mx-auto">
            <span className="eyebrow text-primary-600 mb-4 block">Get Involved</span>
            <h3 className="font-heading text-2xl md:text-3xl lg:text-4xl font-semibold text-background-950 mb-4">
              Celebrate excellence
            </h3>
            <p className="text-foreground-600 mb-8 text-base md:text-lg leading-relaxed">
              Nominate a project, team, individual or academic contribution. Enquire about award categories, 
              criteria, timelines and sponsorship opportunities.
            </p>
            <a href="#awards-interest" className="btn-primary inline-flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                <i className="ri-mail-line text-background-50 text-sm" />
              </span>
              Enquire About Awards and Prizes
            </a>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
              <div className="bg-background-100 p-4 reveal reveal-delay-1">
                <span className="text-xs font-semibold text-accent-700 uppercase tracking-wide block mb-1">Nominate</span>
                <p className="text-xs text-foreground-500">Submit a nomination for any award category</p>
              </div>
              <div className="bg-background-100 p-4 reveal reveal-delay-2">
                <span className="text-xs font-semibold text-accent-700 uppercase tracking-wide block mb-1">Sponsor</span>
                <p className="text-xs text-foreground-500">Support awards through ethical, transparent sponsorship</p>
              </div>
              <div className="bg-background-100 p-4 reveal reveal-delay-3">
                <span className="text-xs font-semibold text-accent-700 uppercase tracking-wide block mb-1">Judge</span>
                <p className="text-xs text-foreground-500">Fellows and senior professionals may serve on review panels</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

