import AudienceCard from "@/components/base/AudienceCard";
import SectionHeader from "@/components/base/SectionHeader";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const scholarshipRoutes = [
  {
    icon: "ri-user-line",
    title: "Individual learner",
    description:
      "For students, apprentices and emerging professionals seeking access to IPC learning, events, mentoring or community activity.",
  },
  {
    icon: "ri-compass-3-line",
    title: "Career access",
    description:
      "For career changers and people from adjacent disciplines who want structured access to project-controls learning and professional community.",
  },
  {
    icon: "ri-graduation-cap-line",
    title: "Academic partner",
    description:
      "For universities, colleges and training providers supporting selected learners through an agreed scholarship or bursary pathway.",
  },
  {
    icon: "ri-building-line",
    title: "Sponsored cohort",
    description:
      "For employers, consultancies, foundations, recruitment organisations and sponsors supporting a defined learner or emerging-talent group.",
  },
];

export default function ScholarshipAudienceGrid() {
  const intro = useManagedSection("audiences_intro", { eyebrow: "Scholarship pathways", title: "Different routes for learners, education partners and sponsors.", subtitle: "Programme availability may vary by intake. Each route connects a defined audience with relevant learning, professional community and a credible next step." });
  const routes = useManagedSection("audiences", scholarshipRoutes).filter(isManagedItemActive);
  return (
    <section className="bg-background-50 section-padding">
      <div className="container-content">
        <div className="reveal">
          <SectionHeader
            eyebrow={intro.eyebrow}
            title={intro.title}
            subtitle={intro.subtitle}
            centered
          />
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-16 lg:grid-cols-4">
          {routes.map((route, index) => (
            <div key={route.title} className="reveal h-full" style={{ transitionDelay: `${index * 100}ms` }}>
              <AudienceCard icon={route.icon} title={route.title} description={route.description} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
