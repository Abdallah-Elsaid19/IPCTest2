import { Handshake } from "lucide-react";
import SectionHeader from "@/components/base/SectionHeader";
import {
  isManagedItemActive,
  useManagedSection,
} from "@/components/content/ManagedContentProvider";

const ipcLogoUrl =
  "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/e6e47869fdd1459f891ad4c5852798c5.png";
const kentLogoUrl =
  "https://kentbusinesscollege.com/wp-content/uploads/2025/12/Kent-Business-College-e1768393206822.png";

const educationPartners = [
  {
    id: "ipc",
    label: "Professional Institution",
    title: "Institute of Project Controls",
    description:
      "Professional membership, recognition pathways, London Master Class Events, regional clubs, awards, scholarships, employer engagement and professional community.",
  },
  {
    id: "kbc",
    label: "Education partner",
    title: "Kent Business College",
    description:
      "Education delivery, programme support, learner development and access to selected project controls and project management pathways, subject to programme availability and eligibility.",
  },
];

export default function ScholarshipAcademicPartners() {
  const content = useManagedSection("academic_partners", {
    eyebrow: "Education Partnership",
    title: "Connecting professional opportunity with Kent Business College programmes.",
    description:
      "The scholarship and bursary programme is designed to support eligible learners into selected project controls and project management pathways delivered through Kent Business College. Together, the intention is to create a more connected journey from learning to workplace application, professional membership and career progression.",
    items: educationPartners,
    availability_title: "Important availability statement",
    availability:
      "Scholarship and bursary support is not automatic. Programme availability, eligibility requirements, funding rules, employer circumstances, learner suitability, capacity and final written approval may affect the support offered. Every successful award will be confirmed individually in writing.",
  });
  const items = content.items.filter(isManagedItemActive);

  return (
    <section className="bg-accent-700 section-padding text-background-50">
      <div className="container-content">
        <div className="reveal max-w-4xl">
          <SectionHeader
            eyebrow={content.eyebrow}
            title={content.title}
            subtitle={content.description}
            light
            eyebrowClassName="text-primary-300"
          />
        </div>

        <div className="reveal relative mt-12 grid gap-4 md:mt-16 md:grid-cols-2">
          {items.map((item, index) => {
            const isIpc = item.id === "ipc" || index === 0;
            const logoUrl = isIpc ? ipcLogoUrl : kentLogoUrl;
            const logoAlt = isIpc
              ? "Institute of Project Controls logo"
              : "Kent Business College logo";

            return (
              <article
                key={item.id}
                className={`group relative min-h-72 border p-6 text-left transition-all duration-300 hover:-translate-y-1 md:p-8 ${
                  isIpc
                    ? "border-background-800 bg-background-950 text-background-50 hover:border-primary-500/60"
                    : "border-background-300 bg-background-50 text-background-950 hover:border-primary-500"
                }`}
              >
                <div className="flex min-h-16 items-start justify-between gap-4">
                  <img
                    src={logoUrl}
                    alt={logoAlt}
                    width={210}
                    height={64}
                    loading="lazy"
                    className={`block max-h-16 w-auto max-w-[150px] object-contain object-left sm:max-w-[210px] ${
                      isIpc ? "brightness-0 invert" : ""
                    }`}
                  />
                  <span
                    className={`shrink-0 text-right font-mono text-[10px] font-bold uppercase tracking-[0.18em] ${
                      isIpc ? "text-primary-400" : "text-primary-700"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                <h3 className="mt-6 text-left font-heading text-2xl font-semibold">
                  {item.title}
                </h3>
                <p
                  className={`mt-4 text-left text-sm leading-[1.8] ${
                    isIpc ? "text-background-300" : "text-foreground-600"
                  }`}
                >
                  {item.description}
                </p>
                {!isIpc && (
                  <a
                    href="https://kentbusinesscollege.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-7 inline-flex min-h-12 items-center gap-2 bg-primary-500 px-6 font-label text-sm font-semibold uppercase tracking-[0.02em] text-background-950 transition-colors hover:bg-primary-400"
                  >
                    Visit Kent Business College
                    <i className="ri-external-link-line" aria-hidden="true" />
                  </a>
                )}
                <span
                  className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-primary-500 transition-transform duration-300 group-hover:scale-x-100"
                  aria-hidden="true"
                />
              </article>
            );
          })}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center border-4 border-accent-700 bg-primary-500 text-xl text-background-950 shadow-lg"
            aria-hidden="true"
          >
            <Handshake size={25} strokeWidth={2} />
          </div>
        </div>

        <aside className="reveal mt-8 border-l-2 border-primary-400 bg-white/5 p-6 md:p-8">
          <h3 className="font-heading text-lg font-semibold text-primary-200">
            {content.availability_title}
          </h3>
          <p className="mt-3 max-w-5xl text-sm leading-[1.8] text-background-200">
            {content.availability}
          </p>
        </aside>
      </div>
    </section>
  );
}
