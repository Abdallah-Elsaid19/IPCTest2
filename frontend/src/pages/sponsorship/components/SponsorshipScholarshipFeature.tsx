import { Link } from "react-router-dom";
import FeatureCard from "@/components/base/FeatureCard";
import SectionHeader from "@/components/base/SectionHeader";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const fallbackContent = {
  eyebrow: "Scholarship and bursary fund",
  title: "Help support up to 40 places per intake.",
  description: "The Institute aims to make selected project controls and project management pathways more accessible through scholarships, bursaries, membership support and professional development.",
  body: "Sponsors can support access and hardship, emerging talent, veterans, charity leaders, social impact, self-employed professionals, career returners and second-chance applicants.",
  note: "The final number of places depends on available funding, eligibility, programme capacity and written approval.",
  primary_cta_label: "Explore Scholarships",
  primary_cta_url: "/scholarships",
  secondary_cta_label: "Sponsor the Fund",
  secondary_cta_url: "/information-session",
  items: [
    { icon: "ri-door-open-line", title: "Access and hardship", description: "Remove financial and professional barriers." },
    { icon: "ri-medal-line", title: "Veterans and transition", description: "Support transferable talent into civilian careers." },
    { icon: "ri-briefcase-4-line", title: "Consultants and freelancers", description: "Support professionals without employer funding." },
    { icon: "ri-hand-heart-line", title: "Charity and social impact", description: "Build professional capability for public benefit." },
  ],
};

export default function SponsorshipScholarshipFeature() {
  const content = useManagedSection("scholarship_feature", fallbackContent);
  return (
    <section className="bg-background-950 section-padding">
      <div className="container-content">
        <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="reveal">
            <SectionHeader eyebrow={content.eyebrow} title={content.title} subtitle={content.description} light />
            <p className="mt-6 text-sm leading-relaxed text-background-200 md:text-base">{content.body}</p>
            <p className="mt-5 border-l-[3px] border-primary-500 pl-4 text-xs leading-relaxed text-background-300">{content.note}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={content.primary_cta_url} className="btn-primary">{content.primary_cta_label}</Link>
              <Link to={content.secondary_cta_url} className="btn-secondary">{content.secondary_cta_label}</Link>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {content.items.filter(isManagedItemActive).map((item, index) => (
              <div key={item.title} className="reveal h-full" style={{ transitionDelay: `${index * 70}ms` }}>
                <FeatureCard {...item} light />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
