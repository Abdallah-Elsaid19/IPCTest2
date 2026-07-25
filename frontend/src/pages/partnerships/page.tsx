import { ManagedContentProvider, ManagedSectionGate } from "@/components/content/ManagedContentProvider";
import ManagedPageSeo from "@/components/content/ManagedPageSeo";
import { InstitutionalCards, InstitutionalCta, InstitutionalFaq, InstitutionalHero } from "@/components/content/InstitutionalPage";
import { pageSeo } from "@/config/pageSeo";
import { buildBreadcrumbSchema } from "@/lib/seo/structuredData";

const partnerTypes = [
  { id: "employers", title: "Corporate employers", description: "Connect workforce development, recognition, learning and contribution." },
  { id: "consultancies", title: "Consultancies and professional services", description: "Support visible expertise, knowledge exchange and professional engagement." },
  { id: "academic", title: "Universities and colleges", description: "Connect learners, research, employers and professional practice." },
  { id: "learning", title: "Training and learning providers", description: "Explore responsible connections between learning routes and professional progression." },
  { id: "recruitment", title: "Recruitment and talent organisations", description: "Strengthen discipline awareness, emerging-talent routes and capability language." },
  { id: "public-good", title: "Public-sector, charity and NGO partners", description: "Apply project-controls capability to public value and social-impact priorities." },
];

export default function PartnershipsPage() {
  return (
    <ManagedContentProvider endpoint="/api/partnerships/content" slug="partnerships">
      <ManagedSectionGate name="seo"><ManagedPageSeo fallback={{ ...pageSeo.partnerships, canonical_path: pageSeo.partnerships.canonicalPath }} structuredData={buildBreadcrumbSchema([{ name: "Home", path: "/home" }, { name: "Partnerships", path: "/partnerships" }])} /></ManagedSectionGate>
      <ManagedSectionGate name="hero"><InstitutionalHero fallback={{ eyebrow: "Corporate and academic partnerships", title: "Long-term collaboration for capability, access and professional impact.", description: "IPC works with employers, universities, colleges, training providers, consultancies, recruitment organisations, public bodies and social-impact organisations to connect learning, practice, recognition and professional community.", primary_cta_label: "Discuss a partnership", primary_cta_url: "/information-session" }} /></ManagedSectionGate>
      <InstitutionalCards name="partner_types" fallback={{ eyebrow: "Who we work with", title: "Partnership shaped around a credible shared purpose.", description: "The right structure depends on the organisations involved, the intended beneficiaries and the outcomes being pursued.", items: partnerTypes }} />
      <InstitutionalCards name="value" dark fallback={{ eyebrow: "Potential partner value", title: "Practical routes for sustained collaboration.", description: "Activities are selected and confirmed by agreement; no single partnership includes every route.", items: [
        { id: "profile", title: "Partner profile", description: "A recognised partner profile and approved website listing where appropriate." },
        { id: "events", title: "Events and Master Classes", description: "Contribute speakers, practitioner insight and relevant learning activity." },
        { id: "talent", title: "Learners and emerging talent", description: "Support access, mentoring and professional-community engagement." },
        { id: "workforce", title: "Workforce discussions", description: "Explore group membership, capability and development priorities." },
        { id: "recognition", title: "Awards and regional activity", description: "Support prizes, regional clubs and professional recognition with safeguards." },
        { id: "knowledge", title: "Research and publications", description: "Develop case studies, research or magazine visibility subject to editorial policy." },
      ] }} />
      <InstitutionalCards name="comparison" fallback={{ eyebrow: "Choose the right relationship", title: "Partnership, sponsorship and funding are not interchangeable.", items: [
        { id: "organisational", title: "Organisational membership", description: "Workforce recognition and development." },
        { id: "partnership", title: "Partnership", description: "Ongoing collaboration built around shared objectives." },
        { id: "sponsorship", title: "Sponsorship", description: "Support for a defined activity with agreed ethical visibility." },
        { id: "funded", title: "Funded opportunity", description: "Support for a defined social or professional outcome." },
        { id: "academic", title: "Academic partnership", description: "Connection between education, learners, research and practice." },
      ] }} />
      <InstitutionalCards name="integrity" dark fallback={{ eyebrow: "Integrity and independence", title: "Collaboration must protect professional decisions.", description: "Partnership does not guarantee endorsement, award outcomes, publication, preferential assessment, access to private member data or influence over IPC professional decisions. All activity must be transparent, proportionate and aligned with IPC independence.", items: [
        { id: "transparent", title: "Transparent", description: "Purpose, roles, visibility and any conflicts are made clear." },
        { id: "proportionate", title: "Proportionate", description: "Benefits reflect the activity and never purchase professional influence." },
        { id: "independent", title: "Independent", description: "Assessment, awards, editorial and member decisions remain protected." },
      ] }} />
      <InstitutionalFaq fallback={{ eyebrow: "Partnership questions", title: "Before a partnership begins.", items: [
        { id: "difference", title: "How is partnership different from sponsorship?", description: "Partnership is an ongoing relationship with shared objectives. Sponsorship supports a defined activity with agreed ethical visibility." },
        { id: "publication", title: "Does partnership guarantee publication or endorsement?", description: "No. Editorial suitability, consent, evidence and independent professional decisions still apply." },
        { id: "start", title: "How do we start?", description: "Book an information session and outline the audience, intended outcome, available contribution and proposed timescale." },
      ] }} />
      <InstitutionalCta fallback={{ title: "Build a partnership around a clear, useful outcome.", description: "Tell us what you want to strengthen and who should benefit.", primary_cta_label: "Discuss a partnership", primary_cta_url: "/information-session" }} />
    </ManagedContentProvider>
  );
}
