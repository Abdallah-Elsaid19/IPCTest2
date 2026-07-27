import {
  isManagedItemActive,
  useManagedSection,
} from "@/components/content/ManagedContentProvider";

const fallbackContent = {
  eyebrow: "The IPC Funding Model",
  title:
    "IPC contributes 50%–70%. The remaining contribution completes the scholarship package.",
  description:
    "The exact percentage is determined after reviewing applicant need, circumstances, potential, programme route and available scholarship funds.",
  secondary_description:
    "A stronger need-based application may be considered for the higher end of the funding range. An applicant who has access to employer support, personal contribution or another sponsor may receive a lower percentage so that the Fund can support more people.",
  final_description:
    "IPC scholarship support is normally applied towards an eligible Kent Business College programme cost. It is not normally paid to the applicant as an unrestricted cash award.",
  ipc_percentage: "50%–70%",
  ipc_label: "IPC scholarship contribution",
  cofunding_percentage: "30%–50%",
  cofunding_label: "Learner, employer, sponsor or approved co-funding",
  notice_title: "Illustrative funding split only.",
  notice_description:
    "The final percentage, eligible cost, payment route and conditions are stated in the written IPC scholarship award.",
  is_active: true,
};

export default function ScholarshipFund() {
  const content = useManagedSection("fund", fallbackContent);

  if (!isManagedItemActive(content)) return null;

  return (
    <section id="fund" className="scroll-mt-20 bg-background-100 section-padding">
      <div className="container-content grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="reveal lg:col-span-7">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 shrink-0 bg-primary-600" aria-hidden="true" />
            <span className="eyebrow text-primary-700">{content.eyebrow}</span>
          </div>

          <h2 className="mt-6 max-w-4xl font-heading text-4xl font-semibold leading-[1.04] text-background-950 md:text-5xl lg:text-[3.5rem]">
            {content.title}
          </h2>

          <div className="mt-8 max-w-3xl space-y-5 text-base leading-[1.8] text-foreground-600 md:text-lg">
            <p>{content.description}</p>
            <p>{content.secondary_description}</p>
            <p>{content.final_description}</p>
          </div>
        </div>

        <div className="reveal lg:col-span-5">
          <article className="group relative overflow-hidden border border-background-300 bg-background-50 shadow-[0_20px_50px_rgba(25,20,14,0.10)]">
            <div className="grid sm:grid-cols-[3fr_2fr]">
              <div className="flex min-h-44 flex-col items-center justify-center bg-primary-400 px-6 py-8 text-center text-background-950">
                <strong className="font-heading text-4xl font-semibold leading-none">
                  {content.ipc_percentage}
                </strong>
                <span className="mt-3 max-w-56 text-sm font-bold leading-snug md:text-base">
                  {content.ipc_label}
                </span>
              </div>

              <div className="flex min-h-44 flex-col items-center justify-center bg-accent-800 px-6 py-8 text-center text-background-50">
                <strong className="font-heading text-4xl font-semibold leading-none">
                  {content.cofunding_percentage}
                </strong>
                <span className="mt-3 max-w-56 text-sm font-bold leading-snug md:text-base">
                  {content.cofunding_label}
                </span>
              </div>
            </div>

            <div className="p-7 md:p-8">
              <p className="text-base leading-[1.7] text-foreground-600 md:text-lg">
                <strong className="font-heading text-2xl font-semibold text-background-950 md:text-3xl">
                  {content.notice_title}
                </strong>{" "}
                {content.notice_description}
              </p>
            </div>

            <span
              className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-primary-500 transition-transform duration-300 group-hover:scale-x-100"
              aria-hidden="true"
            />
          </article>
        </div>
      </div>
    </section>
  );
}
