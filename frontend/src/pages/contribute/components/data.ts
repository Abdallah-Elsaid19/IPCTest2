export type FundRoute = {
  id: "learners" | "learning" | "community" | "awards" | "knowledge";
  tab: string;
  tabDescription: string;
  eyebrow: string;
  title: string;
  description: string;
  audience: string;
  support: string;
  outcome: string;
  designTitle: string;
  designDescription: string;
  note: string;
  button: string;
};

export const fundRoutes: FundRoute[] = [
  {
    id: "learners", tab: "Learner Access", tabDescription: "Scholarships and bursaries", eyebrow: "Learner Access Fund",
    title: "Open the profession to talent that might otherwise be missed.",
    description: "Support selected learners, career changers and emerging professionals through scholarships, bursaries, event access, mentoring and professional-community pathways.",
    audience: "Students, apprentices, graduates, career changers and people facing barriers to employment.",
    support: "Scholarship places, bursaries, learning access, mentoring, events and professional affiliation.",
    outcome: "Employability, confidence, professional identity and a visible progression route.",
    designTitle: "Define the learner group and the opportunity",
    designDescription: "A strong funding proposal identifies who should benefit, the barrier being reduced, the development activity and the intended professional next step.",
    note: "Scholarship routes may support up to 40 places per intake, subject to eligibility, programme design and available funding.", button: "Fund learner access",
  },
  {
    id: "learning", tab: "Professional Learning", tabDescription: "Events, mentoring and CPD", eyebrow: "Professional Learning Fund",
    title: "Turn specialist knowledge into stronger professional judgement.",
    description: "Support Master Classes, technical sessions, mentoring circles, CPD access and professional-learning activity across modern project controls.",
    audience: "Practitioners, early-career professionals, Associate Fellows, employers and professional teams.",
    support: "Speakers, venues, learner places, production, accessibility, mentoring and technical-content delivery.",
    outcome: "Improved capability, CPD evidence, cross-sector learning and more reliable project decision support.",
    designTitle: "Define the learning outcome",
    designDescription: "The funding route should identify the professional capability being developed, the intended audience and how participants can apply the learning.",
    note: "Technical content remains subject to relevance, evidence, professional quality and appropriate review.", button: "Fund professional learning",
  },
  {
    id: "community", tab: "Regional Skills", tabDescription: "Clubs and local capability", eyebrow: "Regional Skills Fund",
    title: "Build project-controls capability where people work and study.",
    description: "Support regional clubs, local talks, mentoring, site visits, employer engagement and learner activity in London, Nottingham, Manchester and Kent–Maidstone.",
    audience: "Regional professionals, employers, learners, academics, career changers and local communities.",
    support: "Venues, speakers, travel, learner access, mentoring, site visits and local programme delivery.",
    outcome: "Stronger local networks, employability, confidence, mentoring and regional capability.",
    designTitle: "Define the region and skills need",
    designDescription: "A strong route identifies the location, beneficiary group, capability gap and the local activity that funding will enable.",
    note: "Regional funding does not provide automatic access to private member or attendee information.", button: "Fund regional skills",
  },
  {
    id: "awards", tab: "Awards & Recognition", tabDescription: "Excellence and visibility", eyebrow: "Awards & Recognition Fund",
    title: "Celebrate excellence and make contribution visible.",
    description: "Support academic, commercial, professional and special-recognition awards, prizes, finalist profiles and emerging-talent opportunities.",
    audience: "Students, researchers, professionals, teams, employers, academic partners and community contributors.",
    support: "Prizes, event access, publication, finalist profiles, ceremony support and social-impact categories.",
    outcome: "Professional visibility, employer recognition, aspiration, contribution and stronger professional stories.",
    designTitle: "Protect judging independence",
    designDescription: "The funder can support the route and receive ethical visibility, while eligibility, assessment and final decisions remain independent.",
    note: "Funding does not provide automatic judging rights or influence award outcomes.", button: "Fund awards and recognition",
  },
  {
    id: "knowledge", tab: "Research & Knowledge", tabDescription: "Publications and applied insight", eyebrow: "Research & Knowledge Fund",
    title: "Help evidence-led knowledge reach the profession.",
    description: "Support applied research, professional publications, articles, case studies, journal activity and knowledge-sharing on AI, data, sustainability, productivity, risk and controls maturity.",
    audience: "Practitioners, researchers, academics, employers, consultants and learners.",
    support: "Research access, editorial production, accessibility, design, distribution and publication activity.",
    outcome: "Applied insight, research visibility, transferable lessons and stronger professional practice.",
    designTitle: "Protect editorial credibility",
    designDescription: "The supported activity should be clearly defined while preserving author, reviewer and editorial independence.",
    note: "Funding does not guarantee publication, endorsement or favourable editorial treatment.", button: "Fund research and knowledge",
  },
];

export const informationSessionPath = "/information-session";
