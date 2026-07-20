import { useEffect, useRef, useState } from "react";

interface MemberValueItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const memberValues: MemberValueItem[] = [
  {
    id: "recognition",
    title: "Recognition",
    description: "Membership grade, certificate, post-nominal and visible professional identity.",
    icon: "ri-award-line",
  },
  {
    id: "cpd-development",
    title: "CPD & development",
    description: "Technical content, structured reflection and continuing professional development.",
    icon: "ri-book-open-line",
  },
  {
    id: "master-classes",
    title: "Master classes",
    description: "Planning, cost, risk, delay, leadership, AI, sustainability and commercial practice.",
    icon: "ri-presentation-line",
  },
  {
    id: "regional-clubs",
    title: "Regional clubs",
    description: "Professional talks, networking, site visits and local community engagement.",
    icon: "ri-community-line",
  },
  {
    id: "mentoring",
    title: "Mentoring",
    description: "Peer and senior mentoring for new entrants, practitioners and future leaders.",
    icon: "ri-user-heart-line",
  },
  {
    id: "awards-prizes",
    title: "Awards & prizes",
    description: "Academic, commercial, professional and special recognition opportunities.",
    icon: "ri-trophy-line",
  },
  {
    id: "publications",
    title: "Publications",
    description: "Professional magazine content, case studies, lessons learned and thought leadership.",
    icon: "ri-article-line",
  },
  {
    id: "research",
    title: "Research",
    description: "Applied research and collaboration between education, employers and practice.",
    icon: "ri-flask-line",
  },
];

export default function MemberValue() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden bg-background-50 section-padding">
      <div className="absolute inset-0 dot-grid opacity-15" />
      <div className="absolute -right-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full border border-primary-500/10" />
      <div className="absolute -right-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full border border-dashed border-primary-500/10" />

      <div className="container-content relative z-10">
        <div className="mb-12 flex items-center gap-4 md:mb-16">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary-600">Member value</span>
          <span className="h-px flex-1 bg-gradient-to-r from-primary-500/40 to-transparent" />
        </div>

        <div className="mb-12 max-w-[820px] md:mb-16">
          <h2 className="font-heading text-[clamp(2rem,4.5vw,4rem)] font-extrabold leading-[1.04] tracking-[-0.04em] text-foreground-950">
            Recognition, opportunity and a community in which to progress.
          </h2>
          <p className="mt-6 max-w-[700px] text-sm font-medium leading-[1.8] text-foreground-600 md:text-base">
            Membership creates professional identity while opening routes into development, events, mentoring, awards, publications and contribution.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
          {memberValues.map((item, index) => (
            <article
              key={item.id}
              className={`group border-t border-primary-500/45 px-1 py-7 transition-all duration-700 hover:border-primary-500 ${
                visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
              style={{ transitionDelay: `${index * 70}ms` }}
            >
              <div className="mb-7 flex h-10 w-10 items-center justify-center border border-primary-500/15 bg-primary-500/10 text-primary-700 transition-colors duration-300 group-hover:bg-primary-500 group-hover:text-background-950">
                <i className={`${item.icon} text-base`} aria-hidden="true" />
              </div>
              <h3 className="font-heading text-base font-bold text-foreground-950 transition-colors duration-300 group-hover:text-primary-700">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-[1.7] text-foreground-600">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 gold-rule opacity-25" />
    </section>
  );
}
