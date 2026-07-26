import type { AwardPageContent } from "../types";

const featuredImage = "https://readdy.ai/api/search-image?query=Elegant%20awards%20ceremony%20stage%20with%20golden%20spotlights%2C%20row%20of%20polished%20glass%20trophies%20lined%20up%20on%20a%20dark%20podium%2C%20floral%20arrangements%2C%20large%20projection%20screen%20with%20abstract%20geometric%20patterns%2C%20warm%20dramatic%20lighting%2C%20premium%20event%20production%2C%20editorial%20photography&width=700&height=900&seq=awards-featured-showcase-02&orientation=portrait";

export const defaultAwardsContent: AwardPageContent = {
  hero: {
    eyebrow: "Awards, prizes and recognition",
    title: "Where achievement becomes professional distinction.",
    description: "IPC awards and prizes recognise academic excellence, commercial innovation, professional contribution and emerging talent across the project-controls community.",
    primary_cta_label: "Nominate by Email",
    primary_cta_url: "#awards-interest",
    secondary_cta_label: "Sponsor an Award",
    secondary_cta_url: "/information-session",
    image_url: "https://readdy.ai/api/search-image?query=Close%20up%20of%20an%20elegant%20golden%20trophy%20and%20framed%20certificate%20on%20a%20dark%20polished%20wooden%20podium%2C%20soft%20dramatic%20spotlight%20from%20above%2C%20subtle%20laurel%20wreath%20motifs%20in%20background%20bokeh%2C%20deep%20charcoal%20backdrop%2C%20premium%20awards%20ceremony%20atmosphere%2C%20cinematic%20lighting%2C%20editorial%20photography%20quality&width=1600&height=900&seq=awards-hero-professional-03&orientation=landscape",
    image_alt: "Prestigious awards trophy",
  },
  framework_intro: {
    eyebrow: "Awards framework",
    title: "Explore the main recognition routes within the awards programme.",
    description: "Select a category to understand its purpose, likely nominations and professional value.",
  },
  featured_intro: {
    eyebrow: "Featured award routes",
    title: "Recognition routes for achievement, contribution and emerging talent.",
    description: "Explore confirmed awards and prize routes across academic excellence, commercial innovation, professional contribution and special recognition. Availability and nomination windows are published for each programme.",
    image_url: featuredImage,
    image_alt: "Awards ceremony stage",
  },
  timeline_intro: {
    eyebrow: "Nomination approach",
    title: "Keep the submission journey clear, rigorous and elegant.",
    description: "A prestige awards experience depends on clarity: who can apply, what evidence is required, how judgement works and what happens next.",
    image_url: "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/c6a7749b12aa41e28a14c438df0a7af0.png",
    image_alt: "",
  },
  nomination_timeline: [
    { phase: "Select a category", period: "01", description: "Choose the route that best matches the person, team, project, research or contribution being recognised." },
    { phase: "Prepare evidence", period: "02", description: "Gather a concise narrative, supporting evidence, outcomes, endorsements and relevant links or attachments." },
    { phase: "Confirm eligibility", period: "03", description: "Clarify whether the route is open to members, partners, students, teams or external nominations where applicable." },
    { phase: "Independent review", period: "04", description: "Assess submissions against the published criteria, evidence quality and professional value." },
    { phase: "Recognition and profile", period: "05", description: "Use finalist and winner status to celebrate excellence across events, publications and professional communication." },
  ],
  benefits_intro: {
    eyebrow: "Why awards matter",
    title: "Why awards matter",
    description: "Recognition should reflect evidence, contribution and value—not just visibility.",
  },
  impact_benefits: [
    { icon: "ri-eye-line", title: "Create a public platform", description: "Winners, finalists and nominees gain a stronger professional story across CVs, LinkedIn, tenders and speaker profiles." },
    { icon: "ri-award-line", title: "Recognise applied quality", description: "Celebrate strong evidence, thoughtful practice, meaningful outcomes and useful contribution to the profession." },
    { icon: "ri-team-line", title: "Connect people and institutions", description: "Bring together members, employers, consultants, universities, sponsors and learners through a shared recognition platform." },
    { icon: "ri-arrow-up-circle-line", title: "Inspire progression", description: "Help students, emerging professionals, teams and leaders understand what high-quality project-controls achievement looks like." },
  ],
  beneficiaries_intro: {
    eyebrow: "Who benefits",
    title: "Recognition creates value for people, teams, institutions and the profession itself.",
    description: "A strong awards system should elevate achievement while encouraging fairness, access and contribution.",
    image_url: featuredImage,
    image_alt: "Professional awards ceremony",
  },
  beneficiaries: [
    { title: "Members & professionals", description: "Build visibility, confidence and a stronger public profile through credible recognition.", cta_label: "Explore professional routes", cta_url: "#featured" },
    { title: "Employers & consultancies", description: "Celebrate teams, innovation and staff achievement while strengthening employer brand.", cta_label: "Explore sponsor value", cta_url: "#awards-partnerships" },
    { title: "Academic partners", description: "Connect education to employability through student prizes, papers and research visibility.", cta_label: "View academic awards", cta_url: "#featured" },
    { title: "Sponsors & supporters", description: "Support access, recognition and community impact with ethical visibility and clear safeguards.", cta_label: "See governance safeguards", cta_url: "#awards-partnerships" },
  ],
  integrity_intro: {
    eyebrow: "Judging and integrity",
    title: "Prestige only matters when the process is trusted.",
    description: "IPC should protect the awards programme through transparent criteria, independent judgement, evidence-based review and clear boundaries between sponsorship and decision-making.",
    image_url: "https://readdy.ai/api/search-image?query=Subtle%20geometric%20shield%20and%20scale%20motifs%20in%20warm%20gold%20lines%20on%20clean%20light%20ivory%20background%2C%20minimal%20abstract%20governance%20pattern%2C%20professional%20institutional%20texture%2C%20very%20faint%20repeating%20design%2C%20no%20text%2C%20soft%20elegant%20aesthetic&width=1600&height=800&seq=awards-governance-bg-02&orientation=landscape",
    image_alt: "",
  },
  integrity_principles: [
    { icon: "ri-file-list-3-line", title: "Clear criteria", description: "Each award route should define purpose, eligibility, expected evidence and what excellence looks like." },
    { icon: "ri-shield-check-line", title: "Independent review", description: "Judging should be fair, balanced and based on evidence rather than profile or commercial influence." },
    { icon: "ri-scales-3-line", title: "Conflict management", description: "Potential conflicts should be declared and handled appropriately by organisers and judges." },
  ],
  partnerships_intro: {
    eyebrow: "Sponsorship and partnership",
    title: "Support recognition while protecting independence.",
    description: "Sponsorship can fund awards, access, visibility, ceremonies and community value, but it should not influence judging decisions.",
    disclaimer: "Sponsors should not gain automatic access to private member data, unpublished submissions or judging outcomes before formal release.",
  },
  partnerships: [
    { title: "Corporate & employer sponsors", items: ["Support categories or ceremonies", "Recognise capability and innovation", "Strengthen employer brand", "Support learner or student access", "Maintain judging independence"], cta_label: "Discuss corporate sponsorship", cta_url: "#awards-interest" },
    { title: "Academic & training partners", items: ["Support student prizes", "Promote research visibility", "Connect employability and industry", "Encourage papers and applied studies", "Strengthen academic-professional links"], cta_label: "Discuss academic partnership", cta_url: "#awards-interest" },
    { title: "Ethical sponsors & service providers", items: ["Enable visibility and access", "Support category operations", "Back social-impact routes", "Protect confidentiality and fairness", "Respect editorial and judging safeguards"], cta_label: "Discuss award support", cta_url: "#awards-interest" },
  ],
  faq: {
    eyebrow: "Awards questions",
    title: "Clear guidance before nominating, judging or sponsoring.",
    description: "Understand categories, evidence, judging, sponsors and announcement safeguards.",
    items: [
      { question: "Where are confirmed categories and nomination windows published?", answer: "Each active programme publishes its confirmed category, eligibility, evidence requirements and nomination window. If none are active, the programme will show as currently unavailable." },
      { question: "Who can be nominated for IPC awards?", answer: "Eligibility should be defined for each award route and may include members, non-members, students, teams, universities, employers, partners or specific groups depending on the category." },
      { question: "What evidence should a nomination include?", answer: "Strong nominations usually combine a concise narrative, supporting evidence, measurable outcomes, endorsements and clear explanation of relevance to project controls." },
      { question: "Can sponsors influence the judging process?", answer: "No. Sponsorship should be transparent and supportive, but judging should remain independent, evidence-led and safeguarded from commercial influence." },
      { question: "Can awards support students and emerging professionals?", answer: "Yes. Student prizes, academic recognition and emerging-talent routes can help connect education, confidence and professional identity." },
      { question: "How should winners and finalists be announced?", answer: "Announcements should follow a clear approval and communications process so that finalists and winners are informed appropriately and public claims remain accurate." },
    ],
  },
  interest_intro: {
    eyebrow: "Nomination route builder",
    title: "What kind of recognition are you exploring?",
    description: "Select the route that best matches your interest to create an indicative enquiry.",
    secondary_cta_label: "Book an information session",
    secondary_cta_url: "/information-session",
  },
  final_cta: {
    eyebrow: "Celebrate excellence",
    title: "Celebrate excellence",
    description: "Register your interest in awards, nominations, judging or sponsorship. Share your role, organisation, category interest and the type of recognition route you want to explore.",
    cta_label: "Register awards interest",
    cta_url: "#awards-interest",
    items: [
      { title: "Academic nomination", description: "Research, dissertation or student route" },
      { title: "Award sponsorship", description: "Category support or ceremony backing" },
      { title: "Judging interest", description: "Reviewer, panellist or assessor support" },
    ],
  },
  seo: {
    title: "Awards & Prizes",
    description: "IPC awards and prizes recognise academic excellence, commercial innovation, professional contribution and emerging talent across project controls.",
    canonical_path: "/awards",
  },
  updated_at: "fallback",
};
