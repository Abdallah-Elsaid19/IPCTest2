import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

interface PartnerValue {
  id: string;
  audience: string;
  title: string;
  description: string;
  icon: string;
}

const partnerValues: PartnerValue[] = [
  {
    id: "corporate-partners",
    audience: "Corporate partners",
    title: "Build stronger professional pathways.",
    description: "Map development against recognition levels, support workforce capability and strengthen tender narratives.",
    icon: "ri-building-line",
  },
  {
    id: "consultancy-partners",
    audience: "Consultancy partners",
    title: "Make expertise more visible.",
    description: "Support consultant recognition, professional contribution, case studies and industry engagement.",
    icon: "ri-briefcase-4-line",
  },
  {
    id: "academic-partners",
    audience: "Academic partners",
    title: "Connect learning with practice.",
    description: "Link programmes, learners, research, employers and professional communities.",
    icon: "ri-graduation-cap-line",
  },
  {
    id: "public-social-impact",
    audience: "Public and social-impact organisations",
    title: "Connect capability with public value.",
    description: "Support access, responsible development, regional capability and knowledge exchange.",
    icon: "ri-government-line",
  },
];

export default function OrganisationalValue() {
  const content = useManagedSection("organisational_value", { eyebrow: "Organisational value", title: "Develop capability across people, projects and organisations.", description: "IPC supports employers, consultancies, academic partners and public or social-impact organisations through talent pathways, recognition, research and professional engagement.", primary_cta_label: "Employers", primary_cta_url: "/employers", secondary_cta_label: "Partnerships", secondary_cta_url: "/partnerships", items: partnerValues });
  const items = content.items.filter(isManagedItemActive);
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
      { threshold: 0.15 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden bg-background-950 section-padding">
      <div className="absolute inset-0 dot-grid opacity-[0.05]" />
      <div className="absolute inset-0 halftone-map opacity-15" />
      <div className="absolute -left-52 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full border border-primary-500/10" />
      <div className="absolute -left-36 top-1/2 h-[390px] w-[390px] -translate-y-1/2 rounded-full border border-dashed border-primary-500/10" />

      <div className="container-content relative z-10">
        <div className="mb-12 flex items-center gap-4 md:mb-16">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary-400">{content.eyebrow}</span>
          <span className="h-px flex-1 bg-gradient-to-r from-primary-500/40 to-transparent" />
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-0">
          <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
            <h2 className="max-w-[540px] font-heading text-[clamp(2rem,4.5vw,4rem)] font-extrabold leading-[1.04] tracking-[-0.04em] text-background-50">
              {content.title}
            </h2>
            <p className="mt-6 max-w-[440px] text-sm font-medium leading-[1.8] text-background-400 md:text-base">
              {content.description}
            </p>

            {/* <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to={content.primary_cta_url}
                className="group inline-flex items-center justify-center gap-2 bg-primary-500 px-5 py-3 text-xs font-bold text-background-950 transition-colors duration-300 hover:bg-primary-400"
              >
                <span>{content.primary_cta_label}</span>
                <i className="ri-arrow-right-line transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to={content.secondary_cta_url}
                className="group inline-flex items-center justify-center gap-2 border border-background-700/50 bg-background-900/60 px-5 py-3 text-xs font-bold text-background-100 transition-colors duration-300 hover:border-primary-500/50 hover:text-primary-400"
              >
                <span>{content.secondary_cta_label}</span>
                <i className="ri-arrow-right-line transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div> */}
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <div className="space-y-4">
              {items.map((item, index) => (
                <article
                  key={item.id}
                  className={`group relative overflow-hidden border border-background-800/70 bg-background-900/65 p-6 transition-all duration-700 hover:-translate-y-1 hover:border-primary-500/35 hover:bg-background-900 hover:shadow-2xl md:p-8 ${
                    visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms`, marginLeft: `${index * 20}px` }}
                >
                  <div className="flex items-start gap-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-primary-500/20 bg-primary-500/10 text-primary-400 transition-colors duration-300 group-hover:bg-primary-500 group-hover:text-background-950">
                      <i className={`${item.icon} text-lg`} aria-hidden="true" />
                    </div>
                    <div>
                      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-primary-400">
                        {item.audience}
                      </span>
                      <h3 className="mt-3 font-heading text-lg font-bold text-background-50">{item.title}</h3>
                      <p className="mt-3 max-w-[560px] text-sm leading-[1.7] text-background-400">{item.description}</p>
                    </div>
                  </div>
                  <span className="absolute bottom-0 left-0 h-px w-0 bg-primary-500 transition-all duration-500 group-hover:w-full" />
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 gold-rule opacity-25" />
    </section>
  );
}
