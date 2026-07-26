import SectionHeader from "@/components/base/SectionHeader";
import {
  isManagedItemActive,
  useManagedSection,
} from "@/components/content/ManagedContentProvider";

const scholarshipSupport = [
  { id: "programme", icon: "ri-book-open-line", title: "Programme support", description: "Full or partial support towards an eligible programme, subject to the funding arrangement confirmed for the applicant." },
  { id: "membership", icon: "ri-user-star-line", title: "IPC membership", description: "Support towards an appropriate membership or professional recognition route, where included in the award." },
  { id: "masterclass", icon: "ri-presentation-line", title: "Master class access", description: "Attendance at selected London Master Class Events, subject to event availability, capacity and award conditions." },
  { id: "mentoring", icon: "ri-team-line", title: "Mentoring", description: "Access to professional guidance, career conversations, technical mentoring or progression support where suitable mentors are available." },
  { id: "clubs", icon: "ri-community-line", title: "Regional club participation", description: "Engagement with London, Nottingham, Manchester or Kent - Maidstone club activities and local professional networking." },
  { id: "career", icon: "ri-compass-3-line", title: "Career development", description: "CV development, LinkedIn positioning, interview preparation, professional profile guidance and career transition support." },
  { id: "recognition", icon: "ri-award-line", title: "Recognition opportunities", description: "Access to awards, prizes, member spotlights, professional magazine opportunities and recognition pathways where eligible." },
  { id: "additional", icon: "ri-add-circle-line", title: "Additional development support", description: "In limited cases, an award may include agreed travel, assessment, digital learning or related professional development support." },
];

export default function ScholarshipValueGrid() {
  const intro = useManagedSection("values_intro", {
    eyebrow: "What an Award May Support",
    title: "Scholarship support can extend beyond one programme fee.",
    description:
      "Each award should be designed around the applicant's need, the available funding and the purpose of the scholarship or bursary. Awards may be full, partial or focused on specific development activities.",
    disclaimer:
      "The exact support offered will be confirmed in the successful applicant's award letter. Applicants should not assume that every scholarship includes every benefit listed.",
  });
  const items = useManagedSection("values", scholarshipSupport).filter(
    isManagedItemActive,
  );

  return (
    <section id="benefits" className="scroll-mt-20 bg-background-50 section-padding">
      <div className="container-content grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="reveal lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
          <SectionHeader
            eyebrow={intro.eyebrow}
            title={intro.title}
            subtitle={intro.description}
          />
          <p className="mt-8 border-l-2 border-primary-500 bg-background-100 p-5 text-sm leading-[1.75] text-foreground-600">
            {intro.disclaimer}
          </p>
        </div>
        <div className="reveal grid border-l border-t border-background-300 sm:grid-cols-2 lg:col-span-7">
          {items.map((item) => (
            <article key={item.id} className="min-h-52 border-b border-r border-background-300 p-5 md:p-6">
              <i className={`${item.icon} text-xl text-primary-600`} aria-hidden="true" />
              <h3 className="mt-6 font-heading text-base font-semibold text-background-950">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground-600">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
