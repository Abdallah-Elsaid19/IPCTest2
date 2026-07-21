import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

interface MembershipValueItem {
  id: string;
  title: string;
  description: string;
}

const membershipValues: MembershipValueItem[] = [
  {
    id: "01",
    title: "Professional identity",
    description: "Use your approved grade and post-nominal on professional profiles, CVs and biographies.",
  },
  {
    id: "02",
    title: "Career credibility",
    description: "Communicate project-controls involvement and capability where job titles vary across organisations.",
  },
  {
    id: "03",
    title: "CPD and development",
    description: "Build a record through learning, practice, mentoring, contribution and reflection.",
  },
  {
    id: "04",
    title: "Master classes and events",
    description: "Access specialist technical and leadership activity through IPC programmes and regional communities.",
  },
  {
    id: "05",
    title: "Mentoring and community",
    description: "Connect with practitioners, employers, consultants, academics and developing professionals.",
  },
  {
    id: "06",
    title: "Publication and contribution",
    description: "Share articles, case studies, research, talks, mentoring and professional lessons subject to review.",
  },
  {
    id: "07",
    title: "Awards and recognition",
    description: "Take part in academic, commercial and professional awards and contribution pathways.",
  },
];

export default function MembershipValuePathway() {
  const content = useManagedSection("member_value", {
    eyebrow: "Member Value",
    title: "Recognition is the foundation. Professional opportunity is the wider value.",
    description: "Membership connects visible professional standing with learning, community, events, mentoring and contribution.",
    cta_label: "Start your journey",
    cta_url: "#grades",
    items: membershipValues,
  });
  const items = content.items.filter(isManagedItemActive);
  return (
    <section
      aria-labelledby="membership-value-title"
      className="border-b border-background-200/70 bg-background-50 section-padding"
    >
      <div className="container-content">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
            <div className="mb-8 flex items-center gap-4">
              <span className="h-px w-10 bg-primary-500" aria-hidden="true" />
              <span className="eyebrow text-primary-600">{content.eyebrow}</span>
            </div>

            <h2
              id="membership-value-title"
              className="max-w-[570px] font-heading text-[clamp(2.5rem,5.2vw,5rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-background-950"
            >
              {content.title}
            </h2>

            <p className="mt-8 max-w-[500px] text-base font-medium leading-[1.8] text-foreground-600 md:text-lg">
              {content.description}
            </p>

            <a href={content.cta_url} className="btn-primary mt-8">
              {content.cta_label}
              <i className="ri-arrow-right-line" aria-hidden="true" />
            </a>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <ol className="border-t border-background-300">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="group grid grid-cols-[3rem_minmax(0,1fr)_auto] items-start gap-4 border-b border-background-300 py-6 md:grid-cols-[3.5rem_minmax(0,1fr)_auto] md:gap-5 md:py-7"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-background-950 font-mono text-[10px] font-bold text-primary-400 transition-colors duration-300 group-hover:bg-primary-500 group-hover:text-background-950">
                    {item.id}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <h3 className="font-heading text-lg font-semibold leading-tight text-background-950 md:text-xl">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-foreground-600 md:text-base">
                      {item.description}
                    </p>
                  </div>
                  <i
                    className="ri-arrow-right-line mt-2 text-primary-600 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
