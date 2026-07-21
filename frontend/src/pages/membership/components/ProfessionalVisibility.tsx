interface VisibilityBenefit {
  title: string;
  description: string;
}

const ipcLogoUrl =
  "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/e6e47869fdd1459f891ad4c5852798c5.png";

const visibilityBenefits: VisibilityBenefit[] = [
  {
    title: "Clear market signal",
    description:
      "Show a defined level of professional recognition supported by evidence and conduct.",
  },
  {
    title: "Employer confidence",
    description:
      "Help recruiters, clients and leaders understand capability where role titles differ.",
  },
  {
    title: "Visible progression",
    description:
      "Plan development from affiliation through foundation, applied and senior standing.",
  },
];

export default function ProfessionalVisibility() {
  return (
    <section
      aria-labelledby="professional-visibility-title"
      className="border-b border-background-800 bg-background-950 section-padding"
    >
      <div className="container-content">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <article
              aria-label="Example IPC professional profile"
              className="mx-auto max-w-xl overflow-hidden rounded-xl border border-background-300 bg-background-50 shadow-2xl shadow-black/20 lg:mx-0"
            >
              <div className="relative h-32 overflow-hidden bg-secondary-700 sm:h-36" aria-hidden="true">
                <span className="absolute -right-12 -top-20 h-52 w-52 rounded-full border border-background-50/20" />
                <span className="absolute -right-2 -top-10 h-36 w-36 rounded-full bg-primary-500/15" />
              </div>
              <div className="px-6 pb-7 sm:px-8 sm:pb-8">
                <div className="relative z-10 -mt-14 flex h-28 w-28 items-center justify-center rounded-full border-[5px] border-background-50 bg-primary-500 font-heading text-2xl font-bold text-background-950 shadow-sm">
                  AM
                </div>

                <div className="mt-4 grid gap-5 sm:grid-cols-[minmax(0,1fr)_190px] sm:items-start">
                  <div className="min-w-0">
                    <h3 className="font-heading text-2xl font-semibold leading-tight text-background-950">
                      Aisha Malik AFIPC L4
                    </h3>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-foreground-700">
                      Project Controls Engineer · Planning, Cost, Risk &amp; Performance
                    </p>
                    <p className="mt-4 text-sm font-semibold text-primary-700">
                      500+ connections
                    </p>
                  </div>

                  <div className="flex items-center gap-3 sm:justify-end">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-background-950 p-1.5">
                      <img
                        src={ipcLogoUrl}
                        alt=""
                        width={44}
                        height={44}
                        className="h-full w-full object-contain"
                      />
                    </span>
                    <span className="text-sm font-semibold leading-tight text-background-950">
                      Institute of Project Controls (IPC)
                    </span>
                  </div>
                </div>

                <div className="my-5 h-px bg-background-200" aria-hidden="true" />
                <span className="inline-flex items-center gap-2 rounded-full border border-primary-300 bg-primary-50 px-4 py-2 text-xs font-semibold text-primary-800">
                  <i className="ri-award-line text-sm" aria-hidden="true" />
                  Associate Fellow Level 4
                </span>
              </div>
            </article>
          </div>

          <div className="lg:col-span-7">
            <div className="mb-7 flex items-center gap-4">
              <span className="h-px w-10 bg-primary-500" aria-hidden="true" />
              <span className="eyebrow text-primary-400">Professional Visibility</span>
            </div>

            <h2
              id="professional-visibility-title"
              className="max-w-3xl font-heading text-[clamp(2.5rem,5vw,4.75rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-background-50"
            >
              A concise title can communicate a much larger professional story.
            </h2>

            <p className="mt-7 max-w-2xl text-base leading-[1.75] text-background-300 md:text-lg">
              IPC grades give varied project-controls roles a shared specialist identity across professional profiles, tender biographies and employer capability frameworks.
            </p>

            <ul className="mt-8 grid gap-3">
              {visibilityBenefits.map((benefit) => (
                <li
                  key={benefit.title}
                  className="border border-background-800 bg-background-900/60 px-5 py-5 sm:px-6"
                >
                  <h3 className="font-heading text-sm font-semibold text-primary-300 sm:text-base">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-background-300 sm:text-sm">
                    {benefit.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
