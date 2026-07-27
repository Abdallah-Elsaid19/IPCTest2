import { useEffect, useState } from "react";
import SectionHeader from "@/components/base/SectionHeader";
import {
  isManagedItemActive,
  useManagedSection,
} from "@/components/content/ManagedContentProvider";

const programmePathways = [
  {
    id: "level-4",
    level: "Level 4",
    title: "Associate Project Manager",
    description:
      "An applied pathway for people coordinating projects, leading work packages, supporting governance, working with stakeholders or moving from technical and operational roles into structured project delivery.",
    suitable_for:
      "Project coordinators, supervisors, team leaders, PMO staff, consultants, self-employed professionals and emerging managers.",
    development_aim:
      "Build applied project leadership, planning, stakeholder, risk, governance and delivery capability.",
    ipc_pathway:
      "May support progression towards Professional Member or Associate Fellow Level 4 recognition.",
    cta_label: "Apply for IPC Scholarship",
    cta_url:
      "https://outlook.office.com/mail/deeplink/compose?to=office%40instituteofprojectcontrols.org&subject=IPC%20Scholarship%20Enquiry%20-%20Associate%20Project%20Manager%20Level%204",
    programme_cta_label: "View APM at Kent Business College",
    programme_url:
      "https://kentbusinesscollege.com/associate-project-manager-level-4/",
    popup_eyebrow: "IPC Scholarship Fund",
    popup_description:
      "Explore the official Kent Business College programme page first, then apply to IPC for scholarship consideration. Kent Business College confirms programme suitability and admission; IPC confirms the scholarship contribution.",
    popup_cta_label: "View Programme at Kent",
  },
  {
    id: "level-6",
    level: "Level 6",
    title: "Project Controls Professional",
    description:
      "An advanced pathway for experienced practitioners and managers working across planning, cost, risk, change, forecasting, reporting, assurance, data quality and project controls leadership.",
    suitable_for:
      "Planners, cost professionals, project controllers, risk professionals, managers, consultants and senior practitioners.",
    development_aim:
      "Develop integrated controls judgement, leadership, assurance, strategic reporting and decision support.",
    ipc_pathway:
      "May support progression towards Associate Fellow Level 4 or Fellow Level 6 recognition, subject to evidence.",
    cta_label: "Apply for IPC Scholarship",
    cta_url:
      "https://outlook.office.com/mail/deeplink/compose?to=office%40instituteofprojectcontrols.org&subject=IPC%20Scholarship%20Enquiry%20-%20Project%20Controls%20Professional%20Level%206",
    programme_cta_label: "View PCP at Kent Business College",
    programme_url:
      "https://kentbusinesscollege.com/project-control-professional-level-6/",
    popup_eyebrow: "IPC Scholarship Fund",
    popup_description:
      "Explore the official Kent Business College programme page first, then apply to IPC for scholarship consideration. Kent Business College confirms programme suitability and admission; IPC confirms the scholarship contribution.",
    popup_cta_label: "View Programme at Kent",
  },
];

export default function ScholarshipProgrammePathways() {
  const [selectedPathwayId, setSelectedPathwayId] = useState<string | null>(
    null,
  );
  const content = useManagedSection("impact", {
    eyebrow: "Kent Business College Partner Programmes",
    title: "Choose the programme that matches your professional direction.",
    description:
      "IPC scholarship funding focuses on two flagship Kent Business College pathways: Associate Project Manager Level 4 and Project Controls Professional Level 6.",
    secondary_description:
      "Explore the official Kent Business College programme page first, then apply to IPC for scholarship consideration. Kent Business College confirms programme suitability and admission; IPC confirms the scholarship contribution.",
    items: programmePathways,
  });
  const items = content.items.filter(isManagedItemActive);
  const selectedPathway =
    items.find((pathway) => pathway.id === selectedPathwayId) ?? null;

  useEffect(() => {
    if (!selectedPathway) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedPathwayId(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedPathway]);

  return (
    <section className="bg-background-950 section-padding text-background-50">
      <div className="container-content">
        <div className="reveal max-w-4xl">
          <SectionHeader
            eyebrow={content.eyebrow}
            title={content.title}
            subtitle={content.description}
            light
            eyebrowClassName="text-primary-400"
          />
          <p className="mt-5 max-w-reading text-base leading-relaxed text-background-300 md:text-lg">
            {content.secondary_description}
          </p>
        </div>

        <div className="reveal mt-12 grid border-l border-t border-background-800 md:mt-16 md:grid-cols-2">
          {items.map((pathway, index) => (
              <article
                key={pathway.id}
                className="group relative flex min-h-[34rem] flex-col border-b border-r border-background-800 bg-background-900/70 p-6 transition-all duration-300 hover:bg-background-900 md:p-8"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary-400">
                    {pathway.level}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-background-600">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="mt-8 max-w-md font-heading text-2xl font-semibold leading-tight text-background-50 md:text-3xl">
                  {pathway.title}
                </h3>
                <p className="mt-5 max-w-xl text-sm leading-[1.8] text-background-400">
                  {pathway.description}
                </p>

                <dl className="mt-8 divide-y divide-background-800 border-t border-background-800">
                  <div className="grid gap-2 py-5 sm:grid-cols-[8rem_1fr]">
                    <dt className="text-xs font-bold text-primary-300">Suitable for</dt>
                    <dd className="text-xs leading-[1.7] text-background-400">
                      {pathway.suitable_for}
                    </dd>
                  </div>
                  <div className="grid gap-2 py-5 sm:grid-cols-[8rem_1fr]">
                    <dt className="text-xs font-bold text-primary-300">Development aim</dt>
                    <dd className="text-xs leading-[1.7] text-background-400">
                      {pathway.development_aim}
                    </dd>
                  </div>
                  <div className="grid gap-2 py-5 sm:grid-cols-[8rem_1fr]">
                    <dt className="text-xs font-bold text-primary-300">IPC pathway</dt>
                    <dd className="text-xs leading-[1.7] text-background-400">
                      {pathway.ipc_pathway}
                    </dd>
                  </div>
                </dl>

                <div className="mt-auto flex flex-col gap-3 pt-7 sm:flex-row sm:flex-wrap">
                  <a
                    href={pathway.cta_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-12 items-center justify-center gap-3 bg-primary-500 px-6 py-3 text-center font-label text-xs font-semibold uppercase tracking-[0.03em] text-background-950 transition-colors hover:bg-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background-950"
                  >
                    {pathway.cta_label}
                    <i
                      className="ri-mail-send-line text-base"
                      aria-hidden="true"
                    />
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedPathwayId(pathway.id)}
                    className="inline-flex min-h-12 items-center justify-center gap-3 border border-background-600 px-6 py-3 text-center font-label text-xs font-semibold uppercase tracking-[0.03em] text-background-50 transition-colors hover:border-primary-400 hover:text-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-background-950"
                  >
                    {pathway.programme_cta_label}
                    <i
                      className="ri-arrow-right-line text-base"
                      aria-hidden="true"
                    />
                  </button>
                </div>

                <span
                  className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-primary-500 transition-transform duration-300 group-hover:scale-x-100"
                  aria-hidden="true"
                />
              </article>
          ))}
        </div>
      </div>

      {selectedPathway && (
        <div
          className="fixed inset-0 z-[120] grid place-items-center bg-background-950/80 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setSelectedPathwayId(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="scholarship-programme-dialog-title"
            className="relative w-full max-w-lg border border-background-300 bg-background-50 p-7 text-background-950 shadow-2xl md:p-9"
          >
            <button
              type="button"
              onClick={() => setSelectedPathwayId(null)}
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center border border-background-300 text-background-800 transition-colors hover:border-primary-500 hover:bg-background-100"
              aria-label="Close programme information"
            >
              <i className="ri-close-line text-xl" aria-hidden="true" />
            </button>

            <span className="eyebrow text-primary-700">
              {selectedPathway.popup_eyebrow}
            </span>
            <p className="mt-5 text-sm leading-[1.8] text-foreground-600 md:text-base">
              {selectedPathway.popup_description}
            </p>

            <div className="mt-7 border-t border-background-300 pt-6">
              <p
                id="scholarship-programme-dialog-title"
                className="mb-4 font-heading text-lg font-semibold"
              >
                {selectedPathway.title}
              </p>
              <a
                href={selectedPathway.programme_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 w-full items-center justify-center gap-3 bg-primary-500 px-6 py-3 text-center font-label text-xs font-semibold uppercase tracking-[0.03em] text-background-950 transition-colors hover:bg-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
              >
                {selectedPathway.popup_cta_label}
                <i
                  className="ri-arrow-right-up-line text-base"
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
