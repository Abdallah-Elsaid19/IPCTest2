export type ServiceRoute = {
  id: "recognition" | "workforce" | "learning" | "academic" | "community" | "impact";
  tab: string;
  tabDescription: string;
  eyebrow: string;
  title: string;
  description: string;
  audience: string;
  value: string;
  nextStep: string;
  enquiryTitle: string;
  enquiryDescription: string;
  note: string;
  cta: string;
  subject: string;
};

export const serviceRoutes: ServiceRoute[] = [
  {
    id: "recognition",
    tab: "Professional Recognition",
    tabDescription: "Grades and progression",
    eyebrow: "Professional recognition",
    title: "Convert experience into a visible professional signal.",
    description: "Structured routes help professionals explain their standing, prepare evidence and progress from AffIPC through MIPC, AFIPC L3, AFIPC L4 and FIPC.",
    audience: "Learners, practitioners, applied professionals and senior leaders.",
    value: "Professional identity, evidence-led standing and progression.",
    nextStep: "Identify a likely grade and prepare proportionate evidence.",
    enquiryTitle: "Discuss a recognition route",
    enquiryDescription: "Send your role, experience, preferred grade and a short professional statement.",
    note: "Recognition organises competence, evidence and ethical conduct; it does not replace them.",
    cta: "Start recognition enquiry",
    subject: "Professional Recognition Enquiry",
  },
  {
    id: "workforce",
    tab: "Workforce Capability",
    tabDescription: "Skills and succession",
    eyebrow: "Workforce capability",
    title: "Build a visible pathway from entry-level talent to senior controls leadership.",
    description: "Employers can use IPC grades and competence domains for skills review, recruitment, development, succession planning and staff recognition.",
    audience: "Corporate employers, HR, learning leaders and project-controls functions.",
    value: "Capability mapping, retention, recruitment clarity and client confidence.",
    nextStep: "Define the workforce group, capability challenge and intended outcome.",
    enquiryTitle: "Discuss workforce development",
    enquiryDescription: "Share your organisation, target group and capability priorities.",
    note: "The catalogue does not publish fixed corporate packages or prices.",
    cta: "Start workforce enquiry",
    subject: "Workforce Capability Partnership Enquiry",
  },
  {
    id: "learning",
    tab: "Learning & CPD",
    tabDescription: "Events and mentoring",
    eyebrow: "Learning and CPD",
    title: "Turn professional learning into applied development evidence.",
    description: "Master Classes, events, mentoring, practice, contribution and reflection support an active CPD journey.",
    audience: "Members, practitioners, teams and emerging professionals.",
    value: "Technical learning, career support and professional contribution.",
    nextStep: "Select the capability area, audience and learning format.",
    enquiryTitle: "Discuss learning and CPD",
    enquiryDescription: "Share the topic, audience, format and intended development outcome.",
    note: "Learning activity should remain relevant, evidence-led and proportionate.",
    cta: "Start learning enquiry",
    subject: "Learning and CPD Enquiry",
  },
  {
    id: "academic",
    tab: "Academic Partnership",
    tabDescription: "Students and research",
    eyebrow: "Academic partnership",
    title: "Connect education with professional identity and employability.",
    description: "Partners can link students to affiliation, scholarships, curriculum relevance, awards, guest lectures, research and employer engagement.",
    audience: "Universities, colleges, training providers, students and researchers.",
    value: "Employability, research impact and industry engagement.",
    nextStep: "Define the learner group, course and intended professional outcome.",
    enquiryTitle: "Discuss academic partnership",
    enquiryDescription: "Share the institution, programme, learner group and collaboration interests.",
    note: "Academic partnership does not automatically confer professional recognition.",
    cta: "Start academic enquiry",
    subject: "Academic Partnership Enquiry",
  },
  {
    id: "community",
    tab: "Community & Events",
    tabDescription: "Clubs and networks",
    eyebrow: "Community and events",
    title: "Create spaces where professionals learn, connect and contribute.",
    description: "Master Classes, regional clubs, roundtables, mentoring circles and employer activity support practical exchange.",
    audience: "Professionals, employers, academics, learners, speakers and mentors.",
    value: "Networking, technical exchange, mentoring and employer connection.",
    nextStep: "Choose the region, format, audience and professional purpose.",
    enquiryTitle: "Discuss an event or club route",
    enquiryDescription: "Share the proposed region, event type, audience and outcome.",
    note: "Confirmed dates, venues and speakers should be managed through the CMS.",
    cta: "Start community enquiry",
    subject: "Events and Community Enquiry",
  },
  {
    id: "impact",
    tab: "Awards & Impact",
    tabDescription: "Scholarships and sponsorship",
    eyebrow: "Awards and impact",
    title: "Recognise excellence and widen access to the profession.",
    description: "Awards, scholarships, bursaries, sponsorship and publications support talent, research, contribution and social impact.",
    audience: "Learners, professionals, teams, employers, academics and sponsors.",
    value: "Access, recognition, visibility, research and social value.",
    nextStep: "Define the beneficiary group, route, support and intended impact.",
    enquiryTitle: "Discuss an impact pathway",
    enquiryDescription: "Share whether the priority is scholarships, awards, sponsorship or publication.",
    note: "Sponsors must not influence recognition, judging or editorial decisions.",
    cta: "Start impact enquiry",
    subject: "Awards Scholarships and Impact Enquiry",
  },
];

export const enquiryHref = (subject: string) =>
  `mailto:office@instituteofprojectcontrols.org?subject=${encodeURIComponent(subject)}`;
