import SectionHeader from "@/components/base/SectionHeader";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

interface PartnerContent {
  type: string;
  benefits: string[] | string;
  items?: string[];
  cta: string;
  is_active?: boolean;
}

const fallbackIntro = {
  eyebrow: "Sponsor value proposition",
  title: "Different organisations engage for different reasons.",
  description: "IPC aligns sponsorship opportunities with the strategic and social value each partner is seeking to create.",
};

const partners: PartnerContent[] = [
  {
    type: "Employers and clients",
    benefits: "Talent development, capability visibility, employee engagement, social value and stronger controls culture.",
    items: ["Learners", "Memberships", "Master classes", "Awards", "Regional clubs", "Scholarship pathways"],
    cta: "Strengthen the capability that protects your projects, forecasts and decisions.",
  },
  {
    type: "Consultancies",
    benefits: "Thought leadership, professional positioning, client confidence and specialist community engagement.",
    items: ["Events", "Technical content", "Awards", "Publications", "Research", "Consultant development"],
    cta: "Demonstrate specialist value while contributing to a stronger profession.",
  },
  {
    type: "Universities and colleges",
    benefits: "Student opportunity, research links, employability, prizes and practitioner access.",
    items: ["Dissertation prizes", "Bursaries", "Guest lectures", "Research", "Academic-industry collaboration"],
    cta: "Make project controls education more visible, applied and connected to industry.",
  },
];

export default function SponsorshipPartners() {
  const intro = useManagedSection("partners_intro", fallbackIntro);
  const managedPartners = useManagedSection<PartnerContent[]>("partner_types", partners).filter(isManagedItemActive);

  return (
    <section className="bg-background-50 section-padding">
      <div className="container-content">
        <div className="reveal">
          <SectionHeader eyebrow={intro.eyebrow} title={intro.title} subtitle={intro.description} centered />
        </div>
        <div className="reveal mt-12 overflow-x-auto border border-background-200/70 md:mt-16" tabIndex={0} aria-label="Sponsor value proposition">
          <table className="w-full min-w-[1040px] border-collapse bg-background-50">
            <caption className="sr-only">Sponsor audiences, value, priorities and core message</caption>
            <thead className="bg-background-950 text-background-50">
              <tr>
                {["Sponsor audience", "Value from IPC", "Typical priorities", "Core message"].map((label) => (
                  <th key={label} scope="col" className="px-5 py-5 text-left font-heading text-xs font-semibold uppercase tracking-wider">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {managedPartners.map((partner, index) => (
                <tr key={partner.type} className={`border-b border-background-200/70 ${index % 2 ? "bg-background-100/60" : "bg-background-50"}`}>
                  <th scope="row" className="w-1/5 px-5 py-6 text-left align-top font-semibold text-background-950">{partner.type}</th>
                  <td className="w-[28%] px-5 py-6 align-top text-sm leading-relaxed text-foreground-600">
                    {Array.isArray(partner.benefits) ? partner.benefits.join(", ") : partner.benefits}
                  </td>
                  <td className="w-[27%] px-5 py-6 align-top text-sm leading-relaxed text-foreground-600">
                    {(partner.items ?? []).join(" · ")}
                  </td>
                  <td className="w-1/4 px-5 py-6 align-top text-sm font-medium leading-relaxed text-background-950">{partner.cta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
