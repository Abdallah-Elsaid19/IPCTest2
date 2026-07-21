import { Link } from "react-router-dom";
import SectionHeader from "@/components/base/SectionHeader";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";
import { informationSessionPath } from "./constants";

interface PartnerContent {
  type: string;
  benefits: string[] | string;
  items?: string[];
  cta: string;
  is_active?: boolean;
}

const fallbackIntro = {
  eyebrow: "Who can partner with IPC",
  title: "Partnership routes for organisations across the project-controls ecosystem.",
  subtitle: "Sponsorship can be designed for organisations that want to support access, professional learning, recognition, research or regional community.",
};

const partners = [
  {
    type: "Employers & consultancies",
    benefits: ["Support talent development", "Host events or site visits", "Provide speakers and mentors", "Sponsor scholarships or awards", "Strengthen social value"],
    cta: "Discuss employer sponsorship",
  },
  {
    type: "Technology & service providers",
    benefits: ["Support technical learning", "Provide approved demonstrations", "Contribute evidence-led case studies", "Sponsor event access", "Support research and publications"],
    cta: "Discuss technology partnership",
  },
  {
    type: "Academic partners & foundations",
    benefits: ["Support learners and researchers", "Enable scholarships and prizes", "Connect education with practice", "Support employability", "Develop public-value programmes"],
    cta: "Discuss academic support",
  },
];

export default function SponsorshipPartners() {
  const intro = useManagedSection("partners_intro", fallbackIntro);
  const managedPartners = useManagedSection<PartnerContent[]>("partner_types", partners).filter(isManagedItemActive);

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
        <div className="reveal mt-12 overflow-x-auto md:mt-16" tabIndex={0} aria-label="Sponsorship partner types table">
          <table className="w-full min-w-[760px] border-collapse">
            <caption className="sr-only">Organisations that can partner with IPC and their opportunities</caption>
            <thead>
              <tr className="border-b-2 border-background-950">
                <th scope="col" className="px-4 py-4 text-left font-heading text-sm font-semibold uppercase tracking-wide text-background-950">Partner type</th>
                <th scope="col" className="px-4 py-4 text-left font-heading text-sm font-semibold uppercase tracking-wide text-background-950">Benefits and opportunities</th>
                <th scope="col" className="px-4 py-4 text-left font-heading text-sm font-semibold uppercase tracking-wide text-background-950">Next step</th>
              </tr>
            </thead>
            <tbody>
              {managedPartners.map((partner, index) => (
                <tr key={partner.type} className={`border-b border-background-200 ${index % 2 === 0 ? "bg-background-50/50" : ""}`}>
                  <th scope="row" className="whitespace-nowrap px-4 py-5 text-left font-semibold text-background-950">{partner.type}</th>
                  <td className="px-4 py-5 text-sm leading-relaxed text-foreground-600">
                    {(partner.items ?? (Array.isArray(partner.benefits) ? partner.benefits : [partner.benefits])).join(" · ")}
                  </td>
                  <td className="whitespace-nowrap px-4 py-5"><Link to={informationSessionPath} className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700">{partner.cta}<i className="ri-arrow-right-line" aria-hidden="true" /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
