import SectionHeader from "@/components/base/SectionHeader";
import {
  isManagedItemActive,
  useManagedSection,
} from "@/components/content/ManagedContentProvider";

interface MemberBenefit {
  id: string;
  title: string;
  description: string;
  is_active?: boolean;
}

const memberBenefits: MemberBenefit[] = [
  {
    id: "01",
    title: "Recognition and affiliation",
    description:
      "Membership provides a clear professional link to a specialist institute focused on project controls, competence and professional development.",
  },
  {
    id: "02",
    title: "Post-nominals",
    description:
      "Approved members may use the post-nominal relevant to their recognised grade, strengthening professional profiles and external credibility.",
  },
  {
    id: "03",
    title: "Certificate and badge",
    description:
      "Members may receive confirmation of recognition, certificate and digital badge where available, supporting LinkedIn and CV presentation.",
  },
  {
    id: "04",
    title: "London Master Class Events",
    description:
      "Membership includes access to selected London Master Class Events, subject to membership category, registration and capacity.",
  },
  {
    id: "05",
    title: "Regional clubs",
    description:
      "Members can engage with the London, Nottingham, Manchester and Kent–Maidstone clubs for local networking and professional activities.",
  },
  {
    id: "06",
    title: "Professional magazine",
    description:
      "Members may receive opportunities to read, contribute to or be profiled in the Institute’s professional magazine and sector insight publications.",
  },
  {
    id: "07",
    title: "Academic journal papers",
    description:
      "Members and academic partners may engage with research, paper calls, academic journal activity and evidence-based project controls knowledge.",
  },
  {
    id: "08",
    title: "Awards and prizes",
    description:
      "Members may be eligible for academic, commercial, professional and special recognition awards, subject to award criteria.",
  },
  {
    id: "09",
    title: "Networking and profile",
    description:
      "Members can build relationships with professionals, employers, consultants, academics, training providers and sponsors across the project controls community.",
  },
  {
    id: "10",
    title: "Speaking and mentoring",
    description:
      "Senior members may be invited to speak, mentor, judge awards, support clubs or contribute to standards, guidance and thought leadership.",
  },
  {
    id: "11",
    title: "Scholarship awareness",
    description:
      "Members can learn about scholarship, bursary and learner support opportunities linked to project controls education and professional development.",
  },
  {
    id: "12",
    title: "Career differentiation",
    description:
      "Membership helps professionals stand out in a competitive market by showing commitment to a specialist discipline and structured progression.",
  },
];

export default function MembershipValuePathway() {
  const content = useManagedSection("member_value", {
    eyebrow: "Member Benefits",
    title:
      "A professional membership designed to create recognition, opportunity and community.",
    description:
      "The Institute’s value is not limited to one certificate. Membership should support a member’s professional identity, learning, visibility, network, career progression and contribution to the discipline.",
    items: memberBenefits,
  });
  const items = content.items.filter(isManagedItemActive);

  return (
    <section
      id="membership-benefits"
      aria-labelledby="membership-value-title"
      className="scroll-mt-16 border-b border-background-200 bg-background-50 section-padding"
    >
      <div className="container-content">
        <div className="reveal mx-auto max-w-4xl">
          <SectionHeader
            eyebrow={content.eyebrow}
            title={content.title}
            subtitle={content.description}
            centered
          />
        </div>

        <dl className="reveal mt-12 grid border-l border-t border-background-300 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:mt-16">
          {items.map((item, index) => (
            <div
              key={item.id || item.title}
              className="group relative min-h-64 overflow-hidden border-b border-r border-background-300 bg-background-50 p-6 transition-colors duration-300 hover:bg-background-100 md:p-8"
            >
              <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-primary-600">
                {item.id || String(index + 1).padStart(2, "0")}
              </span>
              <span
                className="absolute right-6 top-7 h-px w-10 bg-primary-500/60 transition-all duration-300 group-hover:w-16"
                aria-hidden="true"
              />
              <dt className="mt-12 font-heading text-xl font-semibold leading-tight text-background-950">
                {item.title}
              </dt>
              <dd className="mt-4 max-w-xs text-sm leading-[1.75] text-foreground-600">
                {item.description}
              </dd>
              <span
                className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-primary-500 transition-transform duration-300 group-hover:scale-x-100"
                aria-hidden="true"
              />
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
