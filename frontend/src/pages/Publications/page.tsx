import { ManagedContentProvider, ManagedSectionGate } from "@/components/content/ManagedContentProvider";
import ManagedPageSeo from "@/components/content/ManagedPageSeo";
import { InstitutionalCards, InstitutionalCta, InstitutionalFaq, InstitutionalHero, InstitutionalProcess } from "@/components/content/InstitutionalPage";
import { pageSeo } from "@/config/pageSeo";
import { buildBreadcrumbSchema } from "@/lib/seo/structuredData";

const routes = [
  { id: "magazine", title: "Professional Magazine", description: "Practical articles, interviews, event reflections, project-controls lessons, regional updates, member profiles and employer case studies.", icon: "ri-newspaper-line" },
  { id: "case-studies", title: "Technical Case Studies", description: "Anonymised applied cases on baselines, recovery, forecasting, risk, change, delay, data assurance and performance improvement.", icon: "ri-file-chart-line" },
  { id: "journal", title: "Academic Journal and Papers", description: "Research connecting theory, data, project delivery and professional practice.", icon: "ri-graduation-cap-line" },
  { id: "notes", title: "Research Notes", description: "Shorter research notes, literature reviews, practitioner reflections and evidence summaries.", icon: "ri-flask-line" },
  { id: "awards", title: "Awards Supplements", description: "Approved features on award recipients, shortlisted projects, student prize papers and programmes.", icon: "ri-award-line" },
  { id: "employer", title: "Employer Features", description: "Clearly labelled thought leadership and workforce-development activity, subject to editorial standards.", icon: "ri-building-line" },
];

export default function PublicationsPage() {
  return (
    <ManagedContentProvider endpoint="/api/publications/content" slug="publications">
      <ManagedSectionGate name="seo"><ManagedPageSeo fallback={{ ...pageSeo.publications, canonical_path: pageSeo.publications.canonicalPath }} structuredData={buildBreadcrumbSchema([{ name: "Home", path: "/home" }, { name: "Publications, Journal and Research", path: "/publications" }])} /></ManagedSectionGate>
      <ManagedSectionGate name="hero"><InstitutionalHero fallback={{ eyebrow: "Publications, journal and research", title: "Where project-controls knowledge becomes useful professional practice.", description: "IPC creates routes for practitioners, members, employers, academics and learners to share evidence-led insight, applied lessons and professional contribution.", primary_cta_label: "Explore publication routes", primary_cta_url: "#routes", secondary_cta_label: "Propose an article or paper", secondary_cta_url: "/information-session" }} /></ManagedSectionGate>
      <InstitutionalCards name="routes" id="routes" fallback={{ eyebrow: "Publication routes", title: "A route for practical insight, applied evidence and research.", description: "The page launches as a publication framework and proposal route; it does not imply that an article library or publication decision already exists.", items: routes }} />
      <InstitutionalCards name="value" dark fallback={{ eyebrow: "Why publication matters", title: "Turn reflection and evidence into professional contribution.", items: [
        { id: "authority", title: "Professional authority", description: "Build authority through clear evidence, responsible analysis and reflection." },
        { id: "visibility", title: "Visible evidence", description: "Create useful LinkedIn and CV evidence without overstating editorial acceptance." },
        { id: "fellowship", title: "Contribution evidence", description: "Publication may support evidence of professional contribution for relevant recognition routes." },
        { id: "learning", title: "Learning culture", description: "Help employers demonstrate learning, innovation and responsible knowledge exchange." },
        { id: "emerging", title: "Emerging voices", description: "Give students and researchers a visible route into the discipline." },
        { id: "transfer", title: "Lessons across sectors", description: "Transfer useful learning while protecting clients, projects and confidential information." },
      ] }} />
      <InstitutionalCards name="principles" fallback={{ eyebrow: "Editorial principles", title: "Credible publication depends on independence and care.", items: [
        { id: "evidence", title: "Evidence before promotion", description: "Claims should be supported and useful to a professional audience." },
        { id: "consent", title: "Consent and confidentiality", description: "Sensitive project and client information must be authorised or anonymised." },
        { id: "conflicts", title: "Disclose conflicts and sponsorship", description: "Commercial relationships and relevant interests must be transparent." },
        { id: "independence", title: "Editorial independence", description: "No route guarantees publication, and reviewers remain independent." },
        { id: "labels", title: "Clear article types", description: "Opinion, case study, employer feature and research are distinguished." },
        { id: "accessible", title: "Accessible professional writing", description: "Content should be clear, responsible and useful in practice." },
      ] }} />
      <InstitutionalProcess fallback={{ eyebrow: "Submission process", title: "From proposal to responsible publication.", description: "Every stage remains subject to suitability, evidence, consent and editorial approval.", items: [
        { id: "route", title: "Choose a route", description: "Identify the format that best fits the proposed contribution." },
        { id: "proposal", title: "Submit a short proposal or abstract", description: "Explain the audience, purpose, evidence and intended practical value." },
        { id: "check", title: "Editorial suitability and conflict check", description: "IPC considers fit, originality, conflicts, permissions and risk." },
        { id: "draft", title: "Draft and evidence review", description: "Develop the article with appropriate evidence and professional care." },
        { id: "revision", title: "Revision, consent and approval", description: "Resolve feedback and confirm necessary permissions before publication." },
        { id: "publish", title: "Publication and responsible promotion", description: "Approved work can then be shared with accurate context and attribution." },
      ] }} />
      <InstitutionalFaq fallback={{ eyebrow: "Publication questions", title: "What contributors should know.", items: [
        { id: "guarantee", title: "Does submitting guarantee publication?", description: "No. All proposals and drafts remain subject to editorial suitability, evidence, consent and independent review." },
        { id: "confidential", title: "Can I discuss a sensitive project?", description: "Only with appropriate permission and safeguards. Sensitive client, personal or project data should be anonymised or excluded." },
        { id: "first", title: "Can a first-time author propose an article?", description: "Yes. A concise proposal should explain the intended audience, practical value and evidence available." },
      ] }} />
      <InstitutionalCta fallback={{ title: "Have a useful lesson, case or research idea to share?", description: "Start with a short proposal. IPC will advise whether the route appears suitable; an enquiry is not a publication commitment.", primary_cta_label: "Propose an article or paper", primary_cta_url: "/information-session" }} />
    </ManagedContentProvider>
  );
}
