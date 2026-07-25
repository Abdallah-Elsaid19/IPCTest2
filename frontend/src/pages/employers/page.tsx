import { ManagedContentProvider, ManagedSectionGate } from "@/components/content/ManagedContentProvider";
import ManagedPageSeo from "@/components/content/ManagedPageSeo";
import { InstitutionalCards, InstitutionalCta, InstitutionalFaq, InstitutionalHero } from "@/components/content/InstitutionalPage";
import { pageSeo } from "@/config/pageSeo";
import { buildBreadcrumbSchema } from "@/lib/seo/structuredData";

const values = [
  { id: "capability", title: "Capability mapping", description: "Map roles and development against transparent recognition levels and evidence expectations.", icon: "ri-route-line" },
  { id: "recruitment", title: "Recruitment confidence", description: "Use clearer language for project-controls responsibility, experience and professional evidence.", icon: "ri-user-search-line" },
  { id: "retention", title: "Retention and progression", description: "Give employees visible development routes and meaningful recognition milestones.", icon: "ri-line-chart-line" },
  { id: "assurance", title: "Project assurance", description: "Encourage stronger evidence, constructive challenge, professional judgement and accountability.", icon: "ri-shield-check-line" },
  { id: "bids", title: "Bids and client confidence", description: "Strengthen professional narratives and visible team capability without promising procurement outcomes.", icon: "ri-file-list-3-line" },
  { id: "learning", title: "Learning culture", description: "Connect CPD, mentoring, events, reflection and applied practice across the workforce.", icon: "ri-book-open-line" },
  { id: "social-value", title: "Social value", description: "Support access, emerging talent, regional activity and responsible professional development.", icon: "ri-seedling-line" },
  { id: "thought-leadership", title: "Thought leadership", description: "Contribute case studies, speakers, research and publications, subject to editorial review.", icon: "ri-quill-pen-line" },
];

const pathways = [
  { id: "membership", title: "Organisational membership discussions", description: "Explore an appropriate recognition and engagement route for your workforce." },
  { id: "mapping", title: "Workforce capability mapping", description: "Connect roles, evidence and development priorities to a coherent progression framework." },
  { id: "group-support", title: "Group recognition and application support", description: "Help eligible people understand grades, evidence and application expectations." },
  { id: "learning", title: "Master Classes and professional learning", description: "Use selected technical and practitioner learning to deepen applied capability." },
  { id: "recognition", title: "Awards and employee recognition", description: "Explore relevant recognition opportunities where programme eligibility applies." },
  { id: "clubs", title: "Regional club engagement", description: "Connect teams with local talks, networking, mentoring and contribution." },
  { id: "access", title: "Scholarships and emerging-talent support", description: "Help widen access and create responsible routes for people entering the discipline." },
  { id: "knowledge", title: "Research, case studies and publications", description: "Share useful professional learning subject to consent, confidentiality and editorial standards." },
];

export default function EmployersPage() {
  return (
    <ManagedContentProvider endpoint="/api/employers/content" slug="employers">
      <ManagedSectionGate name="seo"><ManagedPageSeo fallback={{ ...pageSeo.employers, canonical_path: pageSeo.employers.canonicalPath }} structuredData={buildBreadcrumbSchema([{ name: "Home", path: "/home" }, { name: "Employers", path: "/employers" }])} /></ManagedSectionGate>
      <ManagedSectionGate name="hero"><InstitutionalHero fallback={{ eyebrow: "For employers", title: "Build project-controls capability that is visible, structured and credible.", description: "IPC helps employers connect workforce development, professional recognition, learning and contribution so people can progress and organisations can strengthen project delivery confidence.", primary_cta_label: "Discuss an organisational pathway", primary_cta_url: "/information-session", secondary_cta_label: "Explore membership grades", secondary_cta_url: "/membership" }} /></ManagedSectionGate>
      <InstitutionalCards name="values" fallback={{ eyebrow: "Employer value", title: "A connected approach to people and project capability.", description: "Recognition is most useful when it sits alongside employer assessment, applied learning and accountable practice.", items: values }} />
      <InstitutionalCards name="pathways" id="pathways" dark fallback={{ eyebrow: "Employer pathways", title: "Choose the routes that support your priorities.", description: "An organisational pathway can combine relevant services without assuming a single model fits every employer.", items: pathways }} />
      <InstitutionalCards name="evidence" fallback={{ eyebrow: "Evidence and impact", title: "Make development visible without overstating what recognition means.", description: "Use role expectations, CPD, reflective evidence, mentoring, professional contribution and recognition milestones to support a stronger development conversation.", items: [
        { id: "people", title: "For people", description: "A clearer professional identity, evidence base and route for continued development." },
        { id: "teams", title: "For teams", description: "A shared language for responsibility, challenge, judgement and professional growth." },
        { id: "organisation", title: "For organisations", description: "More visible capability narratives and a practical connection between learning and delivery." },
      ] }} />
      <InstitutionalFaq fallback={{ eyebrow: "Employer questions", title: "What organisations usually ask.", items: [
        { id: "qualification", title: "Does IPC recognition replace our competence framework?", description: "No. It complements employer assessment and development; it does not replace role-specific competence decisions, regulated qualifications or assurance." },
        { id: "starting", title: "Do we need a large cohort to begin?", description: "No. Start with the workforce need and intended outcome. IPC can discuss an appropriate route and realistic scope." },
        { id: "bids", title: "Does recognition guarantee tender success?", description: "No. Visible professional evidence may strengthen a team narrative, but it cannot guarantee procurement or client decisions." },
      ] }} />
      <InstitutionalCta fallback={{ title: "Start with the capability outcome you want to strengthen.", description: "Discuss your workforce, development priorities and the IPC routes that may be relevant.", primary_cta_label: "Book an information session", primary_cta_url: "/information-session" }} disclaimer="IPC membership and recognition support professional development and visible evidence. They do not replace employer competence assessment, statutory requirements, regulated qualifications, licences or project-specific assurance." />
    </ManagedContentProvider>
  );
}
