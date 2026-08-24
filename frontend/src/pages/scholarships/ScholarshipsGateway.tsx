import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  CircleCheck,
  Clock3,
  FileCheck2,
  GraduationCap,
  Handshake,
  HeartHandshake,
  Laptop2,
  Network,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import SEO from "@/components/seo/SEO";
import {
  isManagedItemActive,
  useManagedSection,
} from "@/components/content/ManagedContentProvider";
import { apiJson } from "@/lib/api";

const CONFIG = {
  KBC_OPERATIONAL_PATHWAY_URL: "https://kentbusinesscollege.com/project-control-professional-level-6/#pathways",
  KBC_STRATEGIC_PATHWAY_URL: "https://kentbusinesscollege.com/project-control-professional-level-6/#pathways",
  KBC_PMO_PATHWAY_URL: "https://kentbusinesscollege.com/project-control-professional-level-6/#pathways",
  KBC_CHARTERED_PATHWAY_URL: "https://kentbusinesscollege.com/project-control-professional-level-6/#pathways",
  KBC_APM_PATHWAY_URL: "https://kentbusinesscollege.com/college-of-project-management/associate-project-manager-level-4-with-pmp/",
  KBC_APPLICATION_URL: "https://kentbusinesscollege.com/",
  IPC_FUNDING_PAGE_URL: "#funding",
} as const;

const IPC_LOGO_URL =
  "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/e6e47869fdd1459f891ad4c5852798c5.png";
const KENT_LOGO_URL =
  "https://kentbusinesscollege.com/wp-content/uploads/2025/12/Kent-Business-College-e1768393206822.png";
const AI_SPOTLIGHT_BACKGROUND_URL =
  "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/2689471e91444b2a9db6670c172036e2.webp";
const ALL_INCLUSIVE_BACKGROUND_URL =
  "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/b4bc056cfa164feca8dc939778cc94c9.webp";
const IPC_HOME_OWL_IMAGE = `${__BASE_PATH__.replace(/\/$/, "")}/images/ipc-home-owl.webp`;
const SHOW_COUNTDOWN_WIDGET = true;

type GatewayAnnouncementContent = {
  announcement_at: string;
  is_active: boolean;
  fund_label: string;
  announcement_button_label: string;
};

const DEFAULT_GATEWAY_ANNOUNCEMENT: GatewayAnnouncementContent = {
  announcement_at: "2026-09-10T13:00:00Z",
  is_active: true,
  fund_label: "IPC Scholarship Fund · 2026",
  announcement_button_label: "Scholarship Announcement",
};

function formatLondonAnnouncement(iso: string) {
  const date = new Date(iso);
  return {
    date: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" }).format(date),
    time: new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Europe/London" }).format(date),
  };
}

function getAnnouncementCountdown(now: number, announcementTime: number) {
  const remaining = Math.max(0, announcementTime - now);
  return [
    { label: "Days", value: Math.floor(remaining / 86_400_000) },
    { label: "Hours", value: Math.floor((remaining / 3_600_000) % 24) },
    { label: "Minutes", value: Math.floor((remaining / 60_000) % 60) },
    { label: "Seconds", value: Math.floor((remaining / 1_000) % 60) },
  ];
}

const IPC_PARTNERSHIP_ICONS = [
  GraduationCap,
  Target,
  BrainCircuit,
  Users,
  Sparkles,
  BriefcaseBusiness,
] as const;

const KENT_PARTNERSHIP_ICONS = [
  FileCheck2,
  BookOpen,
  ShieldCheck,
  HeartHandshake,
  GraduationCap,
  Network,
] as const;

const AUDIENCE_ICONS = [
  GraduationCap,
  Target,
  Clock3,
  BriefcaseBusiness,
  Network,
  Users,
  BookOpen,
  HeartHandshake,
  Sparkles,
  Handshake,
  Laptop2,
  BrainCircuit,
] as const;

export type PathwayId = "operational" | "strategic" | "pmo" | "chartered" | "apm";

const PUBLIC_PATHWAY_IDS = new Set<PathwayId>(["chartered", "pmo", "apm"]);
const RETIRED_PATHWAY_PATTERN = /\b(?:Operational|Strategic)\b/i;

export type Pathway = {
  id: PathwayId;
  name: string;
  short: string;
  stage: string;
  audience: string;
  summary: string;
  credits: string;
  coreTotal: string;
  modules: Array<{ name: string; credits: string; note?: string }>;
  additional: string;
  funded: string;
  bursaryRoute: string;
  ipcSupport: string;
  payment: string;
  pathwayValue?: string;
  supportExample?: string;
  outcomes: string[];
  hours: string;
  hoursLabel: string;
  duration: string;
  url: string;
};

type ScholarshipSeoContent = {
  title: string;
  description: string;
  canonical_path: string;
  keywords: string[];
  is_active?: boolean;
};

const SCHOLARSHIP_SEO: ScholarshipSeoContent = {
  title: "Project Controls Scholarships & Funded Professional Pathways",
  description: "Explore Institute of Project Controls scholarships, funded professional pathways and IPC Bursary Routes delivered through Kent Business College.",
  canonical_path: "/scholarships",
  keywords: [
    "project controls scholarships UK",
    "funded project controls training",
    "project management scholarships",
    "AI in project controls certificate",
    "PMO professional development",
    "Kent Business College pathways",
  ],
};

// Shared pathway content also drives the five visual detail pages.
// eslint-disable-next-line react-refresh/only-export-components
export const PATHWAYS: Pathway[] = [
  {
    id: "operational",
    name: "Operational Pathway",
    short: "Operational",
    stage: "Early career to established practitioner",
    audience:
      "Project coordinators, planners, schedulers, cost and risk support professionals, and people moving into project controls.",
    summary:
      "Build practical confidence across planning, scheduling, risk, earned value and day-to-day project delivery.",
    credits: "6 credits",
    coreTotal: "6 total credits",
    modules: [
      { name: "PMP", credits: "2 credits", note: "Mandatory core" },
      { name: "AI in Project Controls Certificate", credits: "1 credit", note: "Mandatory core" },
      { name: "Risk Management", credits: "1 credit", note: "Mandatory specialist" },
      { name: "Project Planning & Control (PPC)", credits: "1 credit", note: "Mandatory specialist" },
      {
        name: "Choose 1 of 2 operational specialist electives",
        credits: "1 credit",
        note: "PMI-SP • Earned Value Management (EVM)",
      },
    ],
    additional:
      "PMP, AI in Project Controls, Risk Management and Project Planning & Control (PPC) are mandatory. Learners choose either PMI-SP or Earned Value Management (EVM) as the final one-credit elective.",
    funded:
      "Eligible funded-route participants may access a £6,000 Government Funding Band plus a separate IPC Fund contribution of up to £1,000, subject to assessment and written confirmation.",
    bursaryRoute:
      "Applicants who are not employed or cannot commit eight protected hours each week may explore the IPC Bursary Route, with up to 50% of the eligible pathway cost supported by the IPC Fund.",
    ipcSupport:
      "Up to £1,000 IPC Fund support alongside an eligible funded route, or up to 50% IPC Fund support through the separately assessed IPC Bursary Route.",
    payment: "An approved payment plan may extend for up to 36 months, subject to deposit and final payment terms.",
    outcomes: [
      "Practical planning and scheduling",
      "Applied risk and earned value insight",
      "Stronger project controls fundamentals",
      "Workplace-ready delivery confidence",
    ],
    hours: "840",
    hoursLabel: "total hours for the complete pathway",
    duration: "24 months",
    url: CONFIG.KBC_OPERATIONAL_PATHWAY_URL,
  },
  {
    id: "strategic",
    name: "Strategic Pathway",
    short: "Strategic",
    stage: "Senior practitioner to strategic leader",
    audience:
      "Senior project controls professionals, programme and portfolio managers, PMO leaders, heads of planning, project directors and senior consultants.",
    summary:
      "Advance programme leadership, portfolio governance, strategic risk, PMO maturity and data-led decision-making.",
    credits: "6 credits",
    coreTotal: "6 total credits",
    modules: [
      { name: "PMP", credits: "2 credits", note: "Mandatory core" },
      { name: "AI in Project Controls Certificate", credits: "1 credit", note: "Mandatory core" },
      { name: "Risk Management", credits: "1 credit", note: "Mandatory specialist" },
      { name: "PMO", credits: "1 credit", note: "Mandatory specialist" },
      {
        name: "Choose 1 of 2 strategic specialist electives",
        credits: "1 credit",
        note: "MSP • Managing Portfolios",
      },
    ],
    additional:
      "PMP, AI in Project Controls, Risk Management and PMO are mandatory. Learners choose either MSP or Managing Portfolios as the final one-credit elective.",
    funded:
      "Eligible funded-route participants may access a £6,000 Government Funding Band plus a separate IPC Fund contribution of up to £1,000, subject to assessment and written confirmation.",
    bursaryRoute:
      "Applicants who are not employed or cannot commit eight protected hours each week may explore the IPC Bursary Route, with up to 50% of the eligible pathway cost supported by the IPC Fund.",
    ipcSupport:
      "Up to £1,000 IPC Fund support alongside an eligible funded route, or up to 50% IPC Fund support through the separately assessed IPC Bursary Route.",
    payment: "An approved payment plan may extend for up to 36 months, subject to deposit and final payment terms.",
    outcomes: [
      "Programme and portfolio leadership",
      "Strategic risk and PMO maturity",
      "Portfolio intelligence and forecasting",
      "Data-led governance decisions",
    ],
    hours: "840",
    hoursLabel: "total hours for the complete pathway",
    duration: "24 months",
    url: CONFIG.KBC_STRATEGIC_PATHWAY_URL,
  },
  {
    id: "pmo",
    name: "Certified PMO Professional",
    short: "PMO Professional",
    stage: "Established PMO practitioner and leader",
    audience:
      "PMO professionals, managers, consultants and experienced practitioners seeking a focused advanced PMO route.",
    summary:
      "A standalone four-credit professional pathway focused on advanced PMO practice, governance, assurance and organisational value.",
    credits: "4 credits",
    coreTotal: "4 modules • 4 total credits",
    modules: [
      { name: "PMO", credits: "1 credit" },
      { name: "Risk", credits: "1 credit" },
      { name: "Planning", credits: "1 credit" },
      { name: "Stakeholder", credits: "1 credit" },
    ],
    additional:
      "The Certified PMO Professional pathway contains four required modules: PMO, Risk, Planning and Stakeholder. Together they form the complete four-credit pathway.",
    funded:
      "Eligible funded-route participants may access a £27,000 Government Funding Band plus a separate IPC Fund contribution of up to £7,000, subject to assessment and written confirmation.",
    bursaryRoute:
      "Where the funded route is not suitable, applicants may explore the PMO IPC Bursary Route with up to 75% of the eligible pathway cost supported by the IPC Fund.",
    ipcSupport:
      "Up to £7,000 IPC Fund support alongside an eligible funded route, or up to 75% IPC Fund support through the separately assessed IPC Bursary Route.",
    payment: "An approved payment plan may extend for up to 36 months, subject to deposit and final payment terms.",
    outcomes: [
      "Advanced PMO practice",
      "Governance and assurance",
      "Organisational decision support",
      "PMO leadership confidence",
    ],
    hours: "840",
    hoursLabel: "total hours where the complete 840-hour model applies",
    duration: "16 months",
    url: CONFIG.KBC_PMO_PATHWAY_URL,
  },
  {
    id: "chartered",
    name: "Chartered Pathway",
    short: "Chartered",
    stage: "Experienced professional and advanced leader",
    audience:
      "Experienced PMO professionals, project management leaders, senior consultants and managers developing advanced Level 6 capability.",
    summary:
      "A structured route designed to support advanced professional and chartered-level capability without guaranteeing a particular professional status.",
    credits: "6 credits",
    coreTotal: "4 + 1 + 1 structure",
    modules: [
      { name: "Certified PMO Professional Level 6", credits: "4 credits" },
      { name: "AI in Project Management", credits: "1 credit" },
      {
        name: "Choose 1 of 2 specialist electives",
        credits: "1 credit",
        note: "Portfolio Management • Earned Value Management",
      },
    ],
    additional:
      "The selected elective completes the six-credit structure. Both electives are displayed for choice; only one is required.",
    funded:
      "Eligible funded-route participants may access a £27,000 Government Funding Band plus a separate IPC Fund contribution of up to £7,000, subject to assessment and written confirmation.",
    bursaryRoute:
      "Where the funded route is not suitable, applicants may explore the Chartered IPC Bursary Route with up to 75% of the eligible pathway cost supported by the IPC Fund.",
    ipcSupport:
      "Up to £7,000 IPC Fund support alongside an eligible funded route, or up to 75% IPC Fund support through the separately assessed IPC Bursary Route.",
    payment: "An approved payment plan may extend for up to 36 months, subject to deposit and final payment terms.",
    pathwayValue: "£24,000 pathway value",
    supportExample:
      "Six credits at £4,000 per credit. An illustrative 75% IPC contribution would be £18,000, leaving £6,000. Spread across 36 months, that is approximately £166.67 per month before any deposit and final terms.",
    outcomes: [
      "Advanced PMO capability",
      "Strategic governance judgement",
      "Responsible AI application",
      "A foundation for further professional recognition",
    ],
    hours: "840",
    hoursLabel: "total hours for the complete pathway",
    duration: "24 months",
    url: CONFIG.KBC_CHARTERED_PATHWAY_URL,
  },
  {
    id: "apm",
    name: "APM Pathway",
    short: "APM",
    stage: "Developing project professional",
    audience:
      "Project coordinators, project team members, developing project managers and professionals seeking a focused, practical route with AI-enabled project controls capability.",
    summary:
      "A concise pathway combining practical project management development with specialist AI in project controls learning.",
    credits: "3 credits",
    coreTotal: "2 + 1 structure",
    modules: [
      { name: "PMP", credits: "2 credits" },
      { name: "AI in Project Controls Certificate", credits: "1 credit" },
    ],
    additional: "No additional modules or credits are included in this pathway structure.",
    funded:
      "Eligible funded-route participants may access a £6,000 Government Funding Band plus a separate IPC Fund contribution of up to £1,000, subject to assessment and written confirmation.",
    bursaryRoute:
      "The IPC Bursary Route is available subject to pathway confirmation. No fixed bursary percentage is stated for this pathway.",
    ipcSupport:
      "Up to £1,000 IPC Fund support may accompany an eligible funded route. Any additional bursary support is confirmed through a separate IPC assessment.",
    payment: "An IPC Bursary Route payment plan of up to 24 months may be available, subject to deposit, approval and final terms.",
    outcomes: [
      "Practical project management capability",
      "AI-enabled project controls awareness",
      "Applied workplace development",
      "Evidence of professional impact",
    ],
    hours: "350",
    hoursLabel: "total pathway hours across 12 months",
    duration: "12 months",
    url: CONFIG.KBC_APM_PATHWAY_URL,
  },
];

type ModuleOffer = {
  id: string;
  label: string;
  title: string;
  description?: string;
  modules: string[];
  courseCost: string;
  ipcSupport: string;
  amountPayable: string;
  details: string[];
  bonus: {
    label: string;
    title: string;
    description: string;
    image: string;
  } | null;
  is_active?: boolean;
};

const MODULE_OFFERS: ModuleOffer[] = [
  {
    id: "individual-module",
    label: "Individual module",
    title: "Choose a professional module",
    modules: ["AI", "PMI SP", "EVM", "Risk", "PPC", "MSP", "Managing Portfolios", "PMO"],
    courseCost: "£4,000",
    ipcSupport: "50%",
    amountPayable: "£2,000",
    details: [
      "Each module is selected and assessed individually.",
      "4-month learning duration for each module.",
      "The £2,000 remaining balance may be paid in 8 monthly installments of £250 by Direct Debit, subject to approval.",
    ],
    bonus: null,
  },
  {
    id: "pmp-modules",
    label: "PMP credits",
    title: "Project Management Professional",
    description: "The PMP is worth two credits and has an eight-month learning duration.",
    modules: [],
    courseCost: "£8,000",
    ipcSupport: "75%",
    amountPayable: "£2,000",
    details: [
      "The PMP is worth two credits.",
      "8-month learning duration.",
      "The £2,000 remaining balance may be paid in 16 monthly installments of £125 by Direct Debit, subject to approval.",
    ],
    bonus: null,
  },
  {
    id: "apm-modules",
    label: "APM modules",
    title: "APM modules",
    description: "A 12-month APM package combining PMP and AI in Project Controls.",
    modules: ["PMP", "AI"],
    courseCost: "£12,000",
    ipcSupport: "TBC",
    amountPayable: "TBC",
    details: [
      "APM combines the two-credit PMP with AI in Project Controls.",
      "12-month learning duration.",
      "IPC Fund support and the remaining balance are confirmed after individual assessment.",
    ],
    bonus: null,
  },
  {
    id: "pmo-chartered-modules",
    label: "PMO / Chartered modules",
    title: "Four-module professional package",
    modules: ["PMO", "Risk", "Plan", "Stakeholder"],
    courseCost: "£16,000",
    ipcSupport: "75%",
    amountPayable: "£4,000",
    details: [
      "16-month learning duration.",
      "£400 non-refundable deposit, leaving a £3,600 balance.",
      "24 monthly installments of £150 by Direct Debit.",
    ],
    bonus: {
      label: "Included by IPC",
      title: "ChPP certificate cost",
      description: "IPC will cover the cost of the ChPP certificate.",
      image: "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/c49b55b4496342219ee90b7b048c7dc7.png",
    },
  },
];

const FUNDING_OPTIONS = [
  {
    percentage: "50%",
    title: "Individual module support",
    profile: "For AI, PMI SP, EVM, Risk, PPC, MSP, Managing Portfolios and PMO modules, subject to assessment.",
    detail:
      "A £4,000 individual module may receive a 50% IPC contribution, leaving £2,000 to pay.",
    decision: "For a 4-month module, the £2,000 remaining balance may be paid in 8 monthly installments of £250 by Direct Debit, subject to approval.",
  },
  {
    percentage: "75%",
    title: "Enhanced module support",
    profile: "For the PMP and the PMO / Chartered module package, subject to assessment.",
    detail:
      "PMP: £8,000 cost, 75% IPC support and £2,000 to pay. PMO / Chartered modules: £16,000 cost, 75% IPC support and £4,000 to pay.",
    decision: "For PMO / Chartered modules: £400 non-refundable deposit, followed by 24 monthly installments of £150 by Direct Debit.",
  },
];

const FAQS = [
  ["What does IPC fund?", "IPC may provide scholarship or bursary support, specialist pathway funding, additional AI-module support and selected professional-development benefits. The exact contribution is confirmed individually."],
  ["What does Kent Business College provide?", "Kent Business College is responsible for pathway delivery, teaching, coaching, assessment, quality assurance, learner support, eligibility and funding assessment, certification and enrolment."],
  ["What is a learning credit?", "A credit is used on this page to show the relative value assigned to each module within a pathway. Kent Business College will confirm the formal pathway specification."],
  ["Can I apply if public funding is unavailable?", "Yes. The IPC Bursary Route, employer-sponsored and self-funded arrangements may be explored, subject to assessment and availability."],
  ["Can my employer pay the remaining balance?", "Potentially. Employer contributions and payment arrangements must be agreed before enrolment and remain subject to the applicable IPC Bursary Route terms."],
  ["How do payment plans work?", "Operational, Strategic, PMO Professional and Chartered IPC Bursary Route balances may have approved terms of up to 36 months. The APM bursary route may have terms of up to 24 months. Deposits, approval and final conditions apply."],
  ["Is the AI certificate included in every pathway?", "No. AI in Project Controls is a mandatory core component of the six-credit Operational and Strategic pathways and forms part of the three-credit APM Pathway. The Chartered Pathway includes AI in Project Management. The standalone PMO Professional pathway is four credits."],
  ["How do I select the Chartered Pathway elective?", "You select either Portfolio Management or Earned Value Management as the one-credit specialist elective. Kent Business College will confirm the selection process."],
  ["Does the Chartered Pathway automatically provide chartered status?", "No. It supports advanced professional and chartered-level capability, but completion does not automatically confer a professional status."],
  ["How much time should I plan each week?", "The structured study pattern is eight hours: two hours of live teaching, three hours of guided digital learning and three hours of portfolio development."],
  ["How long does each pathway take?", "Operational, Strategic and Chartered pathways have a 24-month study period. The standalone PMO Professional pathway has a 16-month study period, while the APM Pathway has a 12-month study period. Final onboarding and assessment arrangements are confirmed before enrolment."],
  ["What are the 840 learning hours?", "They describe the approximate total learning requirement for the complete applicable pathway—not 840 hours for each credit. The total combines teaching, guided study, practical application, reflection and portfolio work. Kent Business College confirms which pathway uses this model."],
  ["What are the 350 learning hours?", "They are the approximate learning allocation for the APM Pathway across 12 months, combining live teaching, guided study, workplace application and evidence-building."],
  ["Do I need to attend every live session?", "Consistent attendance and engagement are expected. Any attendance requirements or permitted exceptions will be confirmed during onboarding."],
  ["What do I submit each month?", "Participants normally submit learning-platform activities and portfolio-building activities to their coach. These are not automatically formal examinations."],
  ["What is included in portfolio evidence?", "Evidence may include anonymised workplace examples, project outputs, screenshots, documents, professional reflections and commentary demonstrating practical application."],
  ["Can I use confidential workplace documents?", "Only where your employer permits and after confidential client, project, financial, personal and commercial information has been removed or suitably anonymised."],
  ["What happens in monthly coaching?", "The one-hour session may review progress, evidence, learning needs, practical application and next actions, sometimes supported by a short participant presentation."],
  ["Who attends the ten-week progress review?", "The participant, coach and line manager normally attend. The review considers progress, evidence, employer feedback, support needs and next-stage objectives."],
  ["Does my employer need to provide protected learning time?", "Employer support and protected learning time are normally required for the publicly funded route. IPC Bursary Route arrangements may differ but do not remove learning or assessment requirements."],
  ["Can self-employed professionals apply?", "Yes, through the IPC Bursary Route. Self-employed professionals are not currently eligible for the standard publicly funded route under the supplied criteria, but may be considered for bursary support or payment arrangements."],
  ["Can unemployed applicants apply?", "Yes. An IPC Bursary Route may be considered. Bursary support is not automatic and depends on assessment, pathway selection and available funds."],
  ["What documents may be required?", "Identity, address, residency, right-to-work, employment, working-hours, work-location, employer approval and current-study evidence may be requested. Kent Business College confirms the exact list."],
  ["How long does the eligibility process take?", "No fixed timescale is stated. Kent Business College can confirm the current process and likely timing when your information and documents are reviewed."],
  ["Are examinations and memberships included?", "Relevant examinations and selected professional memberships may be included according to the pathway specification. Inclusion is not universal."],
  ["Is private healthcare included?", "An eligible private healthcare benefit may be included with selected packages, subject to provider terms, eligibility and pathway selection."],
  ["Is MBA progression guaranteed?", "No. Eligible completers may have access to a Level 7 progression opportunity and potential MBA top-up route only where all academic, admissions and partnership requirements are met."],
  ["Can international professionals use the IPC Bursary Route?", "This route may be possible. Residency and location conditions can differ from funded-route rules, so Kent Business College should confirm the applicable admissions and delivery requirements."],
  ["What is the difference between a Government Funding Band and IPC Professional Support?", "A Government Funding Band is the maximum eligible public contribution for the funded product. IPC Professional Support is a separate potential contribution towards additional professional value or an IPC Bursary Route. The two figures must not be treated as one guaranteed award or cash payment."],
  ["What do Levy, Non-Levy and Levy Transfer mean?", "Levy describes funding through an eligible employer’s government funding account. Non-Levy describes an eligible employer that does not pay the levy and may reserve government support. Levy Transfer is an agreed transfer from another eligible employer’s account. Rules, limits and employer contributions depend on the start date and funded product."],
];

const CURRENT_FAQS = [
  ["What does IPC fund?", "IPC may contribute towards approved modules, professional packages, examinations, membership, events and selected development benefits. All support is discretionary and subject to written approval."],
  ["What does Kent Business College provide?", "Where appointed, Kent Business College manages admission, delivery, learner support, assessment, examinations and certification. IPC manages its own bursary and professional-support decisions."],
  ["What is an IPC bursary?", "An IPC bursary is a contribution designed to reduce financial barriers to professional development. It is normally applied directly to approved costs rather than paid as unrestricted cash."],
  ["What IPC support options are available?", "Applicants may be considered for support of up to 50% or 75%, depending on their circumstances, selected package and available IPC funds."],
  ["Is IPC support guaranteed?", "No. An award is confirmed only when IPC issues a written offer stating the approved contribution and conditions."],
  ["Who can apply for IPC support?", "Employed, self-employed, unemployed, career-changing and returning professionals may apply. Veterans, charity leaders, social-impact applicants and people facing genuine access barriers may also be considered."],
  ["Do I need extensive project controls experience to apply?", "No. IPC also considers potential, motivation, career direction, character, professional impact and suitability for the selected route."],
  ["How are IPC applications assessed?", "IPC considers need, commitment, professional potential, pathway suitability, intended impact, supporting evidence and available funds."],
  ["Can employed professionals apply?", "Yes. You should declare any employer contribution or development budget available to you."],
  ["Can self-employed, unemployed and career-returning professionals apply?", "Yes. Explain your circumstances, current barriers, career objective and how the support would improve your professional opportunities."],
  ["Can international professionals apply?", "Yes, where the selected option is available internationally. Delivery, payment, identification and examination arrangements must be confirmed separately."],
  ["Do I need employer support to apply?", "Not for every route. However, employed applicants may need permission before using workplace documents, photographs or confidential project information."],
  ["Can my employer or another sponsor pay the remaining balance?", "Yes. An employer, charity, sponsor, family member or other approved organisation may contribute. All contributions must be declared."],
  ["Is the bursary paid directly to me, and can I pay the balance in instalments?", "The bursary is normally applied directly to approved costs. Instalment plans may be available for the remaining balance, subject to written terms."],
  ["What professional module options can I choose?", "You may choose one professional module, the two-credit PMP or a wider four-module professional package."],
  ["Can I choose my own professional modules?", "Yes, you may state your preferences. The final combination is confirmed after reviewing suitability, experience, availability and career goals."],
  ["How many credits is the PMP worth?", "The PMP is worth two credits and has an eight-month learning duration."],
  ["What is the four-module professional package?", "It combines four connected modules to provide broader development across project management, project controls, AI, planning, risk, PMO or related areas."],
  ["What is the AI in Project Controls Certificate?", "It covers responsible AI use in planning, forecasting, risk, reporting, performance analysis, scenario modelling and project decision-making."],
  ["What is a professional pathway credit?", "A credit shows how a module contributes to the overall IPC pathway structure. It is not automatically equivalent to a university academic credit."],
  ["How do I choose the right module or professional route?", "Choose according to your current role, experience, career objective, capability gaps and intended professional impact. IPC may recommend a more suitable option."],
  ["Does an IPC route automatically provide chartered status?", "No. External chartered status requires a separate application and independent assessment by the relevant professional organisation."],
  ["What is included in the all-inclusive professional package?", "It may include selected modules, examinations, membership, learning materials, masterclasses, clubs, recognition activities and progression support."],
  ["Are examinations, memberships, healthcare and progression included?", "Only where they are specifically listed in your written offer. Benefits vary between packages."],
  ["Is private healthcare included?", "Only in selected packages and subject to the healthcare provider's eligibility and policy conditions."],
  ["Is Level 7 or MBA progression guaranteed?", "No. Any academic progression is subject to the institution's entry requirements, availability, fees and admissions decision."],
  ["What evidence may be required?", "IPC may request identification, a CV, LinkedIn profile, employment information, references, financial-need evidence or documents supporting your bursary category."],
  ["Can I use confidential workplace documents?", "Only with permission. Remove or anonymise client, financial, personal, commercial and confidential project information."],
  ["How long does the IPC review process take?", "The review begins when your application and evidence are complete. Timing depends on application volume, checks, package availability and whether further information is needed."],
  ["When will successful IPC bursary applicants be announced?", "Approved Round Two applicants will be announced on 10 September 2026 at 2:00 PM London time and contacted directly using the details in their application. Being shortlisted or asked for more information does not confirm an award. The award is official only after a written offer is issued."],
  ["What happens after my application is approved?", "You will receive a written offer confirming the selected package, IPC contribution, remaining balance, benefits, payment arrangements, award conditions and next steps."],
] as const;

const commitmentItems = [
  "2 hours for live online teaching each week",
  "3 hours for reading and digital learning each week",
  "3 hours for portfolio development each week",
  "One hour for a monthly coaching meeting",
  "One hour for a progress review every ten weeks",
  "Workplace time for practical application",
];

const COMPARISON_ROWS = [
  ["Up to 100% funded", "Eligible employed applicant", "Support, protected time and reviews", "Residency, status, England work and current rules", "Kent Business College"],
  ["95% / 5% before 1 August 2026", "Eligible start with insufficient Levy account funds", "Approval, registration and 5% contribution", "Start date, funded product and employer account position", "Kent Business College"],
  ["75% / 25% from 1 August 2026", "Eligible new start with insufficient Levy account funds", "Approval, registration and 25% contribution", "Start date, funded product and employer account position", "Kent Business College"],
  ["Up to 75% IPC bursary", "Selected unemployed or bursary-route applicant", "May vary by circumstances", "Pathway fit, need, approval and available funds", "IPC and Kent as applicable"],
  ["Up to 50% IPC bursary", "Selected employed bursary-route applicant", "Optional sponsorship", "Pathway fit, approval and available funds", "IPC and Kent as applicable"],
  ["IPC Bursary Route", "Employer-sponsored, self-funded or self-employed", "Optional unless agreed", "Admissions, payment and pathway terms", "IPC and Kent Business College"],
] as const;

const GATEWAY_CONTENT = {
  hero: {
    eyebrow: "Scholarships · bursaries · funded pathways",
    title: "Professional pathways made more accessible.",
    description: "IPC helps eligible professionals access structured project controls and project management pathways delivered through Kent Business College.",
    supporting_text: "Explore publicly funded, employer-supported and IPC Bursary Route options—each subject to assessment, availability and the applicable terms.",
    primary_cta_label: "Check your eligibility",
    secondary_cta_label: "Explore the pathways",
    notice: "No admission or funding decision is made on this page. Final confirmation follows a formal assessment.",
  },
  partnership: {
    eyebrow: "Partnership model",
    title: "One professional journey. Two clearly defined roles.",
    description: "IPC supports access and long-term professional development. Kent Business College confirms eligibility and delivers the learning experience.",
    ipc_title: "Access, support and professional direction",
    ipc_items: ["Scholarships and bursaries", "Specialist pathway funding", "Additional AI-module support", "Professional community access", "Masterclasses and development", "Recognition and career guidance"],
    kent_title: "Formal assessment and learning delivery",
    kent_items: ["Pathway and funding assessment", "Teaching and coaching", "Assessment and quality assurance", "Learner support", "Certification", "Enrolment and onboarding"],
    kent_cta_label: "Visit Kent Business College",
  },
  process: {
    eyebrow: "How it works",
    title: "From exploration to enrolment.",
    items: [
      { number: "01", title: "Explore the pathways", description: "Compare structure, audience, funding and weekly commitment." },
      { number: "02", title: "Complete an initial assessment", description: "Review the criteria, then submit details for formal assessment." },
      { number: "03", title: "Confirm the right route", description: "Kent assesses public funding; IPC assesses bursary support." },
      { number: "04", title: "Begin through Kent", description: "Complete enrolment and receive the confirmed learning timetable." },
    ],
  },
  funding: {
    eyebrow: "Funding options",
    title: "Two module-support options. One careful assessment.",
    description: "Compare the potential IPC contribution and the remaining module cost before requesting a formal assessment.",
    options: FUNDING_OPTIONS,
    notice: "Module costs, IPC support and installment arrangements are subject to assessment, approval, available funds and written confirmation.",
  },
  government_funding: {
    eyebrow: "Government funding routes",
    title: "Levy, Non-Levy and Levy Transfer explained.",
    description: "Government funding follows the employer account, funded product, start date and current rules. It is assessed independently from IPC Professional Support.",
    routes: [
      { title: "Levy", description: "An eligible employer uses available funds in its government funding account towards eligible learning and assessment costs, up to the applicable funding band." },
      { title: "Non-Levy", description: "An eligible employer that does not pay the levy may reserve government funding. The contribution and any employer balance depend on the rules applying at the start date." },
      { title: "Levy Transfer", description: "Another eligible employer may agree to transfer available account funds, subject to agreement, approval and available funds." },
    ],
    before: {
      eyebrow: "Starts before 1 August 2026",
      title: "Current pre-change position",
      items: ["Available Levy funds may cover eligible costs up to the funding rate.", "Eligible Non-Levy unit routes may receive the applicable government contribution up to the funding rate.", "Where a Levy-paying employer has insufficient funds, the stated unit rule is 95% Government / 5% Employer."],
    },
    after: {
      eyebrow: "Starts on or after 1 August 2026",
      title: "New start-date rules",
      items: ["Available Levy funds may continue to cover eligible costs up to the funding rate.", "Eligible Non-Levy unit routes are funded according to the rate and rules applying to that product.", "Where a Levy-paying employer has insufficient funds, the stated unit rule changes to 75% Government / 25% Employer."],
    },
    notice: "Rules may change. Kent Business College confirms the correct employer contribution and start-date treatment before enrolment.",
  },
  funding_figures: {
    eyebrow: "IPC Fund",
    title: "IPC Fund support by pathway.",
    description: "Potential IPC Fund contributions vary by pathway and are confirmed following assessment.",
    items: [
      {
        fund: "IPC Fund",
        percentage: "75%",
        pathways: ["Chartered Pathway"],
        is_active: true,
      },
      {
        fund: "IPC Fund",
        percentage: "50%",
        pathways: ["Operational Pathway", "Strategic Pathway"],
        is_active: true,
      },
    ],
    notice: "Percentages are potential maximum contributions, subject to assessment, eligibility, pathway selection and written confirmation.",
  },
  pathways_intro: {
    eyebrow: "Pathway explorer",
    title: "Compare the route that fits your career stage.",
    description: "Each pathway combines a defined credit structure with professional support and a formal Kent Business College assessment.",
  },
  learning: {
    eyebrow: "Weekly learning model",
    title: "Eight structured hours each week.",
    description: "A consistent pattern combines live teaching, guided digital learning and portfolio application.",
    rhythm_items: [
      { icon: "laptop", badge: "2h", title: "Live online session", description: "Tutor-led teaching, discussion, worked examples and applied professional practice." },
      { icon: "book", badge: "3h", title: "Reading, quizzes and podcasts", description: "Guided digital learning, knowledge checks, reflection and supporting resources." },
      { icon: "portfolio", badge: "3h", title: "Portfolio-building activities", description: "Applied evidence, workplace examples, commentary, reflection and project outputs." },
    ],
    commitment_title: "Time must be planned and protected.",
    commitment_description: "Applicants should normally protect eight hours each week: two hours for live teaching, three hours for guided learning and three hours for portfolio development.",
  },
  ai_spotlight: {
    eyebrow: "IPC specialist spotlight",
    title: "AI in Project Controls Certificate",
    description: "A specialist module strongly supported by IPC and delivered and certified through Kent Business College.",
    items: ["AI-supported planning and scheduling", "Forecasting and performance analysis", "Risk identification and earned value insight", "Automated reporting and scenario modelling", "Predictive and portfolio intelligence", "Ethical AI, data responsibility and human oversight"],
  },
  comparison: {
    eyebrow: "IPC Bursary",
    title: "IPC Bursary",
    description: "IPC bursary support is assessed individually and is subject to pathway fit, need, approval and available funds.",
    rows: COMPARISON_ROWS.map(([route, applicant, employer, conditions, assessment]) => ({ route, applicant, employer, conditions, assessment })),
  },
  all_inclusive: {
    eyebrow: "All-inclusive value",
    title: "An all-inclusive professional package.",
    statement: "All-inclusive package designed to support professional progression and career advancement.",
    items: [
      { icon: "handshake", title: "London Masterclass events" },
      { icon: "graduation", title: "Graduation Ceremony" },
      { icon: "health", title: "Private Health Care Insurance" },
      { icon: "check", title: "Exams and Memberships" },
      { icon: "book", title: "Learning Materials" },
      { icon: "target", title: "Diploma Level 7 in Strategy and Leadership (MBA) – free top-up to the programme" },
    ],
  },
  audiences: {
    eyebrow: "Who may benefit",
    title: "Professional development for different career moments.",
    description: "Suitability depends on the pathway, not on fitting a single professional profile.",
    items: ["Early-career professionals", "Project planners", "Schedulers", "Project controls specialists", "PMO professionals", "Programme leaders", "Portfolio leaders", "Consultants", "Career changers", "Employers", "Self-employed bursary-route applicants", "Professionals interested in AI"],
  },
  eligibility: {
    eyebrow: "IPC Bursary Fund eligibility",
    title: "Could the IPC Bursary Fund support your pathway?",
    description: "IPC assesses every bursary application individually. Support depends on pathway fit, demonstrated financial need, expected professional benefit, applicant commitment and available IPC Bursary Fund resources.",
    criteria: ["A valid IPC membership reference linked to your account", "A selected IPC pathway that fits your experience and professional goals", "Evidence that you cannot reasonably meet the full pathway cost without support", "A clear explanation of the career or professional outcome the bursary would enable", "A measurable benefit for your role, organisation, sector or professional community", "The ability to commit the time required to complete the selected pathway", "Disclosure of any employer sponsorship, personal contribution or other available funding", "Relevant qualifications, memberships, certifications or professional experience", "Acceptance of the bursary participation, progress and publicity terms", "Final IPC assessment, approval and availability of bursary funds"],
    documents_title: "Information IPC may request",
    documents: ["Your valid IPC membership reference", "The quoted cost for your selected pathway", "Information supporting your financial circumstances", "Employer sponsorship or contribution details, where applicable", "Relevant qualifications, memberships or certifications", "Additional evidence needed to assess pathway fit or financial need"],
    documents_notice: "IPC will confirm any supporting evidence required during review. Do not send sensitive documents by unsecured email.",
    notes: [
      { title: "Individual assessment", description: "Submitting an application does not guarantee an award or a particular contribution. IPC confirms any approved amount in writing." },
      { title: "Different employment circumstances", description: "Employed, self-employed and unemployed IPC members may be considered where the pathway, need and intended outcome meet the bursary criteria." },
    ],
  },
  commitment: {
    eyebrow: "Learning-commitment checker",
    title: "Can you commit to the pathway?",
    description: "Select each commitment you can normally accommodate. The check stores no data and is indicative only.",
    items: commitmentItems,
    button_label: "Check my commitment",
  },
  faq: {
    eyebrow: "Frequently asked questions",
    title: "The practical details, answered clearly.",
    description: "Every application is reviewed individually. Final support, module selection, benefits, payment arrangements and award conditions are confirmed in writing.",
    items: CURRENT_FAQS.map(([question, answer]) => ({ question, answer })),
  },
  final_cta: {
    eyebrow: "Your next step",
    title: "Find the right pathway and funding route.",
    description: "Begin with Kent Business College for a formal pathway and eligibility assessment, or speak with IPC about bursary and professional-support options.",
    primary_cta_label: "Apply through Kent Business College",
    secondary_cta_label: "Speak to an IPC pathway adviser",
  },
};

type ScholarshipGatewayContent = typeof GATEWAY_CONTENT;

const VALUE_ICONS = {
  handshake: Handshake,
  graduation: GraduationCap,
  health: HeartHandshake,
  check: CircleCheck,
  book: BookOpen,
  target: Target,
} as const;

const LEARNING_ICONS = {
  laptop: Laptop2,
  book: BookOpen,
  portfolio: BriefcaseBusiness,
} as const;

function SectionIntro({
  eyebrow,
  title,
  copy,
  light = false,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  light?: boolean;
}) {
  return (
    <div className="max-w-4xl">
      <p className={`eyebrow ${light ? "text-primary-300" : "text-primary-700"}`}>{eyebrow}</p>
      <h2 className={`mt-5 text-3xl leading-[1.08] sm:text-4xl lg:text-5xl ${light ? "text-background-50" : "text-background-950"}`}>
        {title}
      </h2>
      {copy && (
        <p className={`mt-6 max-w-3xl text-base leading-8 md:text-lg ${light ? "text-background-300" : "text-foreground-600"}`}>
          {copy}
        </p>
      )}
    </div>
  );
}

function IconBullet({
  children,
  iconClassName = "text-primary-700",
}: {
  children: React.ReactNode;
  iconClassName?: string;
}) {
  return (
    <li className="grid grid-cols-[1.1rem_1fr] gap-3 text-sm leading-6 text-foreground-700">
      <Check className={`mt-1 ${iconClassName}`} size={16} aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}

export default function ScholarshipsGateway() {
  const content = useManagedSection<ScholarshipGatewayContent>("gateway", GATEWAY_CONTENT);
  const seo = useManagedSection<ScholarshipSeoContent>("seo", SCHOLARSHIP_SEO);
  const pathwaysActive = useManagedSection<boolean>("pathways_active", true);
  const rawModuleOffers = useManagedSection<ModuleOffer[]>("modules", MODULE_OFFERS);
  const showPathways = false;
  const rawPathways = useManagedSection<Pathway[]>("pathways", PATHWAYS);
  const pathways = useMemo(() => {
    if (!pathwaysActive) return [];
    const order: PathwayId[] = ["chartered", "pmo", "apm"];
    return [...rawPathways.filter((item) => isManagedItemActive(item) && PUBLIC_PATHWAY_IDS.has(item.id))]
      .sort((left, right) => order.indexOf(left.id) - order.indexOf(right.id));
  }, [pathwaysActive, rawPathways]);
  const moduleOffers = rawModuleOffers.filter(isManagedItemActive);
  const fundingOptions = content.funding.options.filter(isManagedItemActive);
  const faqItems = CURRENT_FAQS.map(([question, answer]) => ({ question, answer }));
  const managedComparisonRows = content.comparison.rows.filter(isManagedItemActive);
  const comparisonRows = managedComparisonRows;
  const [pathwayId, setPathwayId] = useState<PathwayId>("chartered");
  const [fundingIndex, setFundingIndex] = useState(0);
  const [commitments, setCommitments] = useState<boolean[]>(content.commitment.items.map(() => false));
  const [commitmentResult, setCommitmentResult] = useState("");
  const [countdownNow, setCountdownNow] = useState(() => Date.now());
  const [announcementContent, setAnnouncementContent] = useState<GatewayAnnouncementContent>(DEFAULT_GATEWAY_ANNOUNCEMENT);
  const announcementTime = Date.parse(announcementContent.announcement_at);
  const announcementCountdown = useMemo(() => getAnnouncementCountdown(countdownNow, announcementTime), [announcementTime, countdownNow]);
  const formattedAnnouncement = useMemo(() => formatLondonAnnouncement(announcementContent.announcement_at), [announcementContent.announcement_at]);

  const pathway = pathways.find((item) => item.id === pathwayId) ?? pathways[0];
  const selectedFunding = fundingOptions[Math.min(fundingIndex, Math.max(fundingOptions.length - 1, 0))];

  useEffect(() => {
    if (pathways.length > 0 && !pathways.some((item) => item.id === pathwayId)) {
      setPathwayId(pathways[0].id);
    }
  }, [pathwayId, pathways]);

  useEffect(() => {
    const timer = window.setInterval(() => setCountdownNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void apiJson<GatewayAnnouncementContent>(
      "/api/scholarship-announcement",
      undefined,
      { signal: controller.signal, cache: "no-store", requestSource: "ScholarshipGatewayAnnouncement" },
    ).then(setAnnouncementContent).catch(() => undefined);
    return () => controller.abort();
  }, []);

  const structuredData = useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "/" },
          { "@type": "ListItem", position: 2, name: "Scholarships and Funded Professional Pathways", item: "/scholarships" },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        name: "Institute of Project Controls",
        url: "/",
        description:
          "Professional institute supporting access to project controls and project management development pathways delivered through Kent Business College.",
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
    [faqItems],
  );

  const evaluateCommitment = () => {
    setCommitmentResult(
      content.commitment.items.every((_, index) => commitments[index])
        ? "You appear able to meet the typical learning commitment. Your timetable and employer support will still need to be confirmed during the formal assessment."
        : "You may need to discuss protected learning time and workplace support with your employer before selecting the funded route. The IPC Bursary Route may also be considered.",
    );
  };

  return (
    <div className="overflow-hidden bg-background-50">
      {isManagedItemActive(seo) && (
      <SEO
        title={seo.title}
        description={seo.description}
        canonicalPath={seo.canonical_path}
        keywords={seo.keywords}
        structuredData={structuredData}
      />
      )}

      {isManagedItemActive(content.hero) && (
      <section className="relative isolate min-h-[720px] overflow-hidden bg-[#000000] pt-20 text-background-50">
        <div className="absolute inset-0 dot-grid-gold opacity-20" aria-hidden="true" />
        <div className="absolute -right-48 top-16 h-[42rem] w-[42rem] rounded-full border border-primary-400/20" aria-hidden="true" />
        <div className="absolute -right-24 top-40 h-[28rem] w-[28rem] rounded-full border border-[#71599b]/35" aria-hidden="true" />
        <div className="absolute bottom-0 left-[58%] top-0 hidden w-px bg-gradient-to-b from-transparent via-primary-400/30 to-transparent lg:block" aria-hidden="true" />

        <div className="container-content relative grid min-h-[680px] items-center gap-14 py-20 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="reveal">
            <p className="eyebrow text-primary-300">{content.hero.eyebrow}</p>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.03] tracking-[-0.04em] sm:text-6xl sm:tracking-[-0.05em] lg:text-7xl">
              {content.hero.title}
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-background-200">
              {content.hero.description}
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-background-400">
              {content.hero.supporting_text}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link to="/bursary-scholarship-application" className="btn-primary">
                Apply now <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <a href="#modules" className="btn-secondary">
                Explore the modules
              </a>
              <Link
                to="/scholarships/announcement"
                className="inline-flex min-h-12 items-center justify-center gap-2 border border-primary-400/50 bg-primary-400/[0.08] px-5 py-3 text-center text-sm font-semibold text-primary-200 transition-colors hover:border-primary-300 hover:bg-primary-400/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
              >
                <Clock3 size={17} aria-hidden="true" />
                {announcementContent.announcement_button_label}
              </Link>
            </div>
            <div className="mt-8 flex items-start gap-3 border-l-2 border-primary-400 pl-4 text-sm leading-6 text-background-300">
              <ShieldCheck className="mt-0.5 shrink-0 text-primary-300" size={18} aria-hidden="true" />
              <p>{content.hero.notice}</p>
            </div>
          </div>

          <aside className="reveal relative overflow-hidden bg-[#000000] shadow-[0_28px_80px_rgba(0,0,0,.28)]" aria-label="IPC scholarship announcement countdown">
            <div className="relative h-52 overflow-hidden sm:h-64 lg:h-72">
              <img
                src={IPC_HOME_OWL_IMAGE}
                alt="IPC owl representing wisdom and foresight"
                width={1920}
                height={1280}
                loading="eager"
                className="h-full w-full object-cover object-[56%_43%]"
              />
              <div
                className="absolute inset-0 bg-[linear-gradient(to_bottom,#000_0%,rgba(0,0,0,0)_18%,rgba(0,0,0,0)_72%,#000_100%)]"
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 bg-[linear-gradient(to_right,#000_0%,rgba(0,0,0,0)_12%,rgba(0,0,0,0)_88%,#000_100%)]"
                aria-hidden="true"
              />
            </div>

            {SHOW_COUNTDOWN_WIDGET && announcementContent.is_active && (
            <div className="relative -mt-2 p-5 pt-0 sm:p-6 sm:pt-0 md:p-7 md:pt-0">
              <div className="flex items-start justify-between gap-1.5 sm:gap-2" aria-label="Time remaining until the scholarship announcement">
                {announcementCountdown.map((unit) => (
                  <div key={unit.label} className="min-w-0 flex-1 text-center">
                    <div className="flex justify-center gap-0.5 sm:gap-1" aria-label={`${String(unit.value).padStart(2, "0")} ${unit.label}`}>
                      {String(unit.value).padStart(2, "0").split("").map((digit, index) => (
                        <span
                          key={`${unit.label}-${index}-${digit}`}
                          className="countdown-flap relative grid h-16 w-7 shrink-0 place-items-center overflow-hidden rounded-[0.45rem] border border-primary-300/35 bg-[linear-gradient(180deg,#e9a737_0%,#db9325_49.4%,#ae620c_50.6%,#c57b18_100%)] shadow-[0_10px_24px_rgba(0,0,0,.3),inset_0_1px_0_rgba(255,255,255,.18)] sm:h-20 sm:w-9 lg:h-16 lg:w-7 xl:h-20 xl:w-10"
                          aria-hidden="true"
                        >
                          <span className="countdown-digit countdown-digit-in !text-[2.1rem] sm:!text-[2.6rem] lg:!text-[2.1rem] xl:!text-[2.8rem]">{digit}</span>
                          <span className="pointer-events-none absolute inset-x-0 top-1/2 z-20 h-px -translate-y-1/2 bg-black/40" />
                          <span className="pointer-events-none absolute -left-px top-1/2 z-30 h-2 w-1 -translate-y-1/2 rounded-r-full border-y border-r border-white/40 bg-black" />
                          <span className="pointer-events-none absolute -right-px top-1/2 z-30 h-2 w-1 -translate-y-1/2 rounded-l-full border-y border-l border-white/40 bg-black" />
                        </span>
                      ))}
                    </div>
                    <span className="mt-3 block truncate font-mono text-[7px] font-semibold uppercase tracking-[0.12em] text-primary-300 sm:text-[8px] sm:tracking-[0.18em]">
                      {unit.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 border border-primary-400/35 bg-primary-400/[0.07] p-4 text-center sm:p-5">
                <CalendarDays className="mx-auto text-primary-300" size={21} aria-hidden="true" />
                <p className="mt-2.5 font-heading text-xl font-semibold text-white sm:text-2xl">{formattedAnnouncement.date}</p>
                <p className="mt-1.5 font-mono text-[8px] font-semibold uppercase tracking-[0.22em] text-background-400">{formattedAnnouncement.time} London time</p>
              </div>
            </div>
            )}
          </aside>
        </div>
      </section>
      )}

      {isManagedItemActive(content.partnership) && (
      <section className="relative overflow-hidden bg-background-50 section-padding">
        <div className="pointer-events-none absolute -right-40 -top-44 h-[34rem] w-[34rem] rounded-full border border-[#71599b]/10" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-[24rem] w-[24rem] rounded-full border border-primary-500/10" aria-hidden="true" />
        <div className="pointer-events-none absolute right-16 top-16 h-3 w-3 rounded-full bg-[#71599b]/30" aria-hidden="true" />

        <div className="container-content relative">
          <div className="reveal max-w-5xl">
            <p className="eyebrow text-primary-700">{content.partnership.eyebrow}</p>
            <span className="mt-5 block h-0.5 w-20 bg-primary-500" aria-hidden="true" />
            <h2 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.04] tracking-[-0.04em] text-background-950 sm:text-5xl lg:text-6xl">
              {content.partnership.title}
            </h2>
            <p className="mt-6 max-w-4xl text-base leading-8 text-foreground-600 md:text-lg">
              {content.partnership.description}
            </p>
          </div>

          <div className="reveal relative mt-12 grid gap-5 lg:grid-cols-2 lg:gap-12">
            <article className="relative overflow-hidden border border-primary-500/20 bg-[#fffaf3] p-7 shadow-[0_16px_45px_rgba(40,32,20,0.06)] sm:p-9 lg:p-10">
              <div className="pointer-events-none absolute -bottom-36 -right-28 h-80 w-80 rounded-full border border-primary-500/10" aria-hidden="true" />
              <div className="relative">
                <div className="flex h-20 items-center justify-between gap-5">
                  <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                    <img
                      src={IPC_LOGO_URL}
                      alt=""
                      width={88}
                      height={80}
                      loading="lazy"
                      className="block max-h-20 w-auto max-w-[88px] shrink-0 object-contain"
                    />
                    <p className="max-w-[14rem] bg-gradient-to-r from-primary-700 via-primary-500 to-primary-300 bg-clip-text font-label text-sm font-semibold uppercase leading-relaxed tracking-[0.15em] text-transparent sm:text-base">
                      Institute of Project Controls
                    </p>
                  </div>
                  <span className="eyebrow shrink-0 text-right text-primary-700">IPC</span>
                </div>
                <span className="mt-6 block h-0.5 w-12 bg-primary-500" aria-hidden="true" />
                <h3 className="mt-5 max-w-xl text-2xl font-semibold leading-tight text-background-950 sm:text-3xl">
                  {content.partnership.ipc_title}
                </h3>
                <ul className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                  {content.partnership.ipc_items.map((item, index) => {
                    const ItemIcon = IPC_PARTNERSHIP_ICONS[index % IPC_PARTNERSHIP_ICONS.length];
                    return (
                      <li key={item} className="flex items-start gap-4 text-sm font-medium leading-6 text-foreground-700">
                        <span className="grid h-11 w-11 shrink-0 place-items-center border border-primary-500/25 bg-white/70 text-primary-700">
                          <ItemIcon size={20} strokeWidth={1.8} aria-hidden="true" />
                        </span>
                        <span className="pt-2">{item}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </article>

            <article className="relative overflow-hidden border border-[#71599b]/20 bg-[#f8f5fc] p-7 shadow-[0_16px_45px_rgba(45,31,70,0.07)] sm:p-9 lg:p-10">
              <div className="pointer-events-none absolute -bottom-36 -left-28 h-80 w-80 rounded-full border border-[#71599b]/10" aria-hidden="true" />
              <div className="relative">
                <div className="flex h-20 items-center justify-between gap-5">
                  <img
                    src={KENT_LOGO_URL}
                    alt="Kent Business College"
                    width={250}
                    height={72}
                    loading="lazy"
                    className="block max-h-[4.5rem] w-auto max-w-[220px] object-contain object-left"
                  />
                  <span className="eyebrow shrink-0 text-right text-[#655080]">Education partner</span>
                </div>
                <span className="mt-6 block h-0.5 w-12 bg-[#71599b]" aria-hidden="true" />
                <h3 className="mt-5 max-w-xl text-2xl font-semibold leading-tight text-background-950 sm:text-3xl">
                  {content.partnership.kent_title}
                </h3>
                <ul className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                  {content.partnership.kent_items.map((item, index) => {
                    const ItemIcon = KENT_PARTNERSHIP_ICONS[index % KENT_PARTNERSHIP_ICONS.length];
                    return (
                      <li key={item} className="flex items-start gap-4 text-sm font-medium leading-6 text-foreground-700">
                        <span className="grid h-11 w-11 shrink-0 place-items-center border border-[#71599b]/25 bg-white/70 text-[#71599b]">
                          <ItemIcon size={20} strokeWidth={1.8} aria-hidden="true" />
                        </span>
                        <span className="pt-2">{item}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </article>

            <div
              className="absolute left-1/2 top-1/2 z-10 hidden h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center border-[6px] border-background-50 bg-[linear-gradient(135deg,#d89524_0%,#d89524_49%,#71599b_51%,#71599b_100%)] text-white shadow-[0_14px_38px_rgba(30,24,42,0.2)] lg:grid"
              aria-label="IPC and Kent Business College collaboration"
            >
              <span className="grid h-[4.35rem] w-[4.35rem] place-items-center bg-white text-background-950">
                <Handshake size={32} strokeWidth={2} aria-hidden="true" />
              </span>
            </div>
          </div>

          <div className="reveal mt-6 flex items-center gap-5 border border-background-300 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(19,21,26,0.05)] sm:px-8">
            <span className="grid h-12 w-12 shrink-0 place-items-center border border-[#71599b]/20 bg-[#f8f5fc] text-[#71599b]" aria-hidden="true">
              <ShieldCheck size={24} strokeWidth={1.8} />
            </span>
            <span className="hidden h-px flex-1 bg-background-200 sm:block" aria-hidden="true" />
            <a
              href={CONFIG.KBC_APPLICATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex min-h-12 items-center justify-center gap-3 px-2 font-label text-xs font-semibold uppercase tracking-[0.03em] text-[#655080] transition-colors hover:text-[#4f396c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#71599b] focus-visible:ring-offset-2"
            >
              {content.partnership.kent_cta_label} <ArrowRight size={17} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
      )}

      {isManagedItemActive(content.process) && (
      <section className="bg-[#eef0f3] py-16 md:py-20">
        <div className="container-content">
          <div className="reveal">
            <div className="max-w-3xl">
              <p className="eyebrow text-primary-700">{content.process.eyebrow}</p>
              <h2 className="mt-4 text-3xl text-background-950 md:text-4xl">{content.process.title}</h2>
            </div>
            <div className="relative mt-12">
              <span className="absolute left-[12.5%] right-[12.5%] top-6 hidden h-px bg-primary-500/60 xl:block" aria-hidden="true" />
              <ol className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {content.process.items.filter(isManagedItemActive).map(({ number, title, description }) => (
                  <li key={number} className="relative flex flex-col pt-16">
                    <span className="absolute left-1/2 top-0 z-10 grid h-12 w-12 -translate-x-1/2 place-items-center border border-primary-500 bg-[#eef0f3] font-mono text-sm font-semibold text-primary-700">
                      {number}
                    </span>
                    <article className="group h-full border border-background-300 bg-background-50 p-6 transition duration-300 ease-out hover:-translate-y-2 hover:border-primary-500 hover:shadow-[0_18px_40px_rgba(56,42,20,0.12)] md:p-7">
                      <h3 className="min-h-14 text-lg font-semibold leading-7 text-background-950">{title}</h3>
                      <span className="mt-5 block h-0.5 w-10 bg-primary-600 transition-[width] duration-300 ease-out group-hover:w-full" aria-hidden="true" />
                      <p className="mt-5 text-sm leading-6 text-foreground-600">{description}</p>
                    </article>
                  </li>
                ))}
              </ol>
            </div>
            <div className="mt-10 h-px bg-background-300" aria-hidden="true" />
          </div>
        </div>
      </section>
      )}

      {isManagedItemActive(content.funding) && (
      <section id="funding" className="scroll-mt-24 bg-background-50 section-padding">
        <div className="container-content">
          <div className="reveal">
            <SectionIntro
              eyebrow={content.funding.eyebrow}
              title={content.funding.title}
              copy={content.funding.description}
            />
          </div>
          <div className="reveal mt-12 grid max-w-4xl gap-4 md:grid-cols-2">
            {fundingOptions.map((option, index) => (
              <button
                key={`${option.percentage}-${index}`}
                type="button"
                onClick={() => setFundingIndex(index)}
                aria-pressed={fundingIndex === index}
                className={`group min-h-[21rem] border p-6 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${
                  fundingIndex === index
                    ? "border-primary-600 bg-background-950 text-background-50 shadow-[0_18px_45px_rgba(18,21,27,0.16)]"
                    : "border-background-300 bg-background-50 text-background-950 hover:-translate-y-1 hover:border-primary-500"
                }`}
              >
                <span className={`block font-heading text-5xl font-semibold ${fundingIndex === index ? "text-primary-300" : "text-primary-700"}`}>{option.percentage}</span>
                <span className="mt-4 block text-lg font-semibold">{option.title}</span>
                <span className={`mt-5 block text-sm leading-6 ${fundingIndex === index ? "text-background-300" : "text-foreground-600"}`}>{option.profile}</span>
              </button>
            ))}
          </div>
          {selectedFunding && (
          <div className="reveal mt-4 grid gap-6 border border-primary-500/40 bg-primary-50 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
            <div>
              <p className="font-semibold text-background-950">{selectedFunding.detail}</p>
              <p className="mt-2 text-sm leading-6 text-foreground-600">{selectedFunding.decision}</p>
            </div>
            <Link to="/bursary-scholarship-application" className="btn-primary">
              Apply now
            </Link>
          </div>
          )}
          <p className="mt-6 text-xs leading-6 text-foreground-500">
            {content.funding.notice}
          </p>
        </div>
      </section>
      )}

      {isManagedItemActive(content.pathways_intro) && moduleOffers.length > 0 && (
      <section id="modules" className="scroll-mt-24 bg-[#10151f] section-padding text-background-50">
        <div className="container-content">
          <div className="reveal">
            <SectionIntro
              eyebrow="Module explorer"
              title="Choose the modules that fit your professional goals."
              copy="Compare module costs, potential IPC support and the remaining payment before requesting a formal assessment."
              light
            />
          </div>

          <div className="reveal mt-12 grid items-stretch gap-5 xl:grid-cols-2">
            {moduleOffers.map((offer, index) => (
              <article key={offer.id} className="flex h-full flex-col border border-white/15 bg-white/[0.035] p-6 md:p-8">
                <div className="flex items-start justify-between gap-5 border-b border-white/15 pb-6 xl:min-h-36">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary-300">
                      {String(index + 1).padStart(2, "0")} / {offer.label}
                    </p>
                    <h3 className="mt-4 text-2xl font-semibold leading-tight md:text-3xl">{offer.title}</h3>
                  </div>
                  <BookOpen className="shrink-0 text-primary-300" size={28} strokeWidth={1.6} aria-hidden="true" />
                </div>

                <div className="border-b border-white/15 py-6 xl:min-h-40">
                  {offer.modules.length > 0 && (
                    <>
                    <p className="text-xs font-semibold uppercase tracking-wider text-background-400">Included modules</p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {offer.modules.map((module) => (
                        <li key={module} className="border border-white/15 bg-white/[0.04] px-3 py-2 text-xs text-background-200">
                          {module}
                        </li>
                      ))}
                    </ul>
                    </>
                  )}
                </div>

                <dl className="mt-6 grid border border-white/15 sm:grid-cols-3">
                  <div className="flex min-h-16 flex-col items-start justify-center gap-1 border-b border-white/15 p-4 sm:flex-row sm:items-center sm:justify-between sm:border-b-0 sm:border-r">
                    <dt className="whitespace-nowrap text-[10px] uppercase tracking-wider text-background-500">Cost</dt>
                    <dd className="whitespace-nowrap text-lg font-semibold text-background-50">{offer.courseCost}</dd>
                  </div>
                  <div className="flex min-h-16 flex-col items-start justify-center gap-1 border-b border-white/15 p-4 sm:flex-row sm:items-center sm:justify-between sm:border-b-0 sm:border-r">
                    <dt className="whitespace-nowrap text-[10px] uppercase tracking-wider text-background-500">IPC support</dt>
                    <dd className="whitespace-nowrap text-sm font-semibold text-primary-300">{offer.ipcSupport}</dd>
                  </div>
                  <div className="flex min-h-16 flex-col items-start justify-center gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <dt className="whitespace-nowrap text-[10px] uppercase tracking-wider text-background-500">You pay</dt>
                    <dd className="whitespace-nowrap text-lg font-semibold text-background-50">{offer.amountPayable}</dd>
                  </div>
                </dl>

                <ul className="mt-6 space-y-3 text-sm leading-6 text-background-300">
                  {offer.details.map((detail) => (
                    <li key={detail} className="flex items-start gap-3">
                      <Check className="mt-1 shrink-0 text-primary-300" size={16} aria-hidden="true" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                {offer.bonus && (
                  <div className="mb-7">
                    <div className="border border-primary-400/45 bg-primary-400/[0.07] p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary-300">{offer.bonus.label}</p>
                      <h4 className="mt-2 text-base font-semibold text-background-50">{offer.bonus.title}</h4>
                      <p className="mt-2 text-xs leading-5 text-background-300">{offer.bonus.description}</p>
                    </div>
                    <div className="mt-4 flex justify-center">
                      <img
                        src={offer.bonus.image}
                        alt="ChPP certification"
                        width={1200}
                        height={800}
                        loading="lazy"
                        className="block max-h-48 w-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>

          <div className="reveal mt-8">
            <Link to="/bursary-scholarship-application" className="btn-primary">
              Apply now <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <p className="mt-6 max-w-4xl text-xs leading-6 text-background-400">
            All costs, contributions, deposits and installment arrangements are indicative until eligibility, module selection and funding are formally assessed and confirmed in writing.
          </p>
        </div>
      </section>
      )}

      {showPathways && pathwaysActive && pathway && isManagedItemActive(content.pathways_intro) && (
      <section id="pathways" className="scroll-mt-24 bg-[#10151f] section-padding text-background-50">
        <div className="container-content">
          <div className="reveal">
            <SectionIntro
              eyebrow={content.pathways_intro.eyebrow}
              title={content.pathways_intro.title}
              copy={content.pathways_intro.description}
              light
            />
          </div>
          <div className="reveal mt-12 grid gap-8 lg:grid-cols-[18rem_1fr]">
            <div role="tablist" aria-label="Professional pathways" className="grid content-start gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {pathways.map((item, index) => (
                <button
                  key={item.id}
                  id={`tab-${item.id}`}
                  type="button"
                  role="tab"
                  aria-selected={pathwayId === item.id}
                  aria-controls={`panel-${item.id}`}
                  tabIndex={pathwayId === item.id ? 0 : -1}
                  onClick={() => setPathwayId(item.id)}
                  onKeyDown={(event) => {
                    if (event.key !== "ArrowDown" && event.key !== "ArrowRight" && event.key !== "ArrowUp" && event.key !== "ArrowLeft") return;
                    event.preventDefault();
                    const delta = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
                    const next = (index + delta + pathways.length) % pathways.length;
                    setPathwayId(pathways[next].id);
                    document.getElementById(`tab-${pathways[next].id}`)?.focus();
                  }}
                  className={`border p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 ${
                    pathwayId === item.id ? "border-primary-400 bg-primary-500 text-background-950" : "border-white/15 bg-white/[0.03] text-background-200 hover:border-primary-400/60"
                  }`}
                >
                  <span className="font-mono text-[10px] uppercase tracking-widest">{String(index + 1).padStart(2, "0")}</span>
                  <span className="mt-2 block font-semibold">{item.name}</span>
                  <span className="mt-1 block text-xs opacity-75">{item.credits}</span>
                </button>
              ))}
            </div>

            <article
              id={`panel-${pathway.id}`}
              role="tabpanel"
              aria-labelledby={`tab-${pathway.id}`}
              className="border border-white/15 bg-white/[0.035] p-6 md:p-9"
            >
              <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
                <div>
                  <p className="eyebrow text-primary-300">{pathway.stage}</p>
                  <h3 className="mt-4 text-3xl md:text-4xl">{pathway.name}</h3>
                  <p className="mt-5 max-w-2xl text-base leading-7 text-background-300">{pathway.summary}</p>
                  <Link
                    to={`/scholarships/pathways/${pathway.id}`}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#c8b8dc] underline decoration-[#8f78b1] underline-offset-4 transition-colors hover:text-background-50"
                  >
                    View the full IPC pathway guide <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                  <div className="mt-7 border-l-2 border-[#8f78b1] pl-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#c8b8dc]">Intended audience</p>
                    <p className="mt-2 text-sm leading-6 text-background-300">{pathway.audience}</p>
                  </div>
                </div>
                <div className="bg-white/15">
                  <div className="bg-[#171d28] p-5">
                    <p className="text-3xl font-semibold text-primary-300">{pathway.credits}</p>
                    <p className="mt-2 text-xs text-background-400">Potential structure</p>
                  </div>
                </div>
              </div>

              <div className="mt-9 grid gap-8 xl:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between border-b border-white/15 pb-3">
                    <h4 className="text-lg">Credit structure</h4>
                    <span className="font-mono text-xs text-primary-300">{pathway.coreTotal}</span>
                  </div>
                  <ul className="mt-2 divide-y divide-white/10">
                    {pathway.modules.filter(isManagedItemActive).map((module) => (
                      <li key={module.name} className="flex items-start justify-between gap-4 py-4 text-sm">
                        <div className="text-background-200">
                          {module.name}
                          {module.note && (
                            module.note.includes(" • ") ? (
                              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-[#bca9d7]">
                                {module.note.split(" • ").map((option) => <li key={option}>{option}</li>)}
                              </ul>
                            ) : (
                              <small className="mt-1 block text-[#bca9d7]">{module.note}</small>
                            )
                          )}
                        </div>
                        <span className="shrink-0 font-mono text-xs text-primary-300">{module.credits}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 border border-primary-400/25 bg-primary-400/[0.06] p-4 text-xs leading-6 text-background-300">{pathway.additional}</p>
                </div>
                <div className="space-y-5">
                  {[
                    ["IPC Bursary Route", pathway.bursaryRoute],
                    ["Payment plan", pathway.payment],
                    ["Monthly support", "One-hour coaching each month and a one-hour progress review every ten weeks, subject to the confirmed delivery plan."],
                  ].map(([label, value]) => (
                    <div key={label} className="grid gap-1 sm:grid-cols-[8rem_1fr]">
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary-300">{label}</p>
                      <p className="text-sm leading-6 text-background-300">{value}</p>
                    </div>
                  ))}
                  {pathway.pathwayValue && (
                    <div className="border border-primary-400/35 bg-primary-400/[0.07] p-5">
                      <p className="text-xl font-semibold text-primary-300">{pathway.pathwayValue}</p>
                      <p className="mt-3 text-sm leading-6 text-background-300">{pathway.supportExample}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-9 grid gap-7 border-t border-white/15 pt-7 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-300">Professional outcomes</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {pathway.outcomes.map((outcome) => <span key={outcome} className="border border-white/15 px-3 py-2 text-xs text-background-300">{outcome}</span>)}
                  </div>
                </div>
                <a href={pathway.url} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  Assess this pathway <ArrowRight size={16} aria-hidden="true" />
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>
      )}

      {isManagedItemActive(content.learning) && (
      <section className="bg-background-50 section-padding">
        <div className="container-content">
          <div className="reveal">
            <SectionIntro
              eyebrow={content.learning.eyebrow}
              title={content.learning.title}
              copy={content.learning.description}
            />
          </div>
          <div className="reveal mt-12 grid gap-px bg-background-300 md:grid-cols-2">
            {[
              ["2 hours", "weekly live teaching", "Interactive online session"],
              ["8 hours", "typical weekly study", "2 + 3 + 3 hours"],
            ].map(([value, label, detail]) => (
              <div key={label} className="bg-background-50 p-7 md:p-9">
                <p className="font-heading text-4xl font-semibold text-primary-700">{value}</p>
                <h3 className="mt-3 text-lg text-background-950">{label}</h3>
                <p className="mt-2 text-sm text-foreground-500">{detail}</p>
              </div>
            ))}
          </div>

          <div className="reveal mt-12 grid gap-5 lg:grid-cols-3">
            {content.learning.rhythm_items.filter(isManagedItemActive).map((item) => {
              const RhythmIcon = LEARNING_ICONS[item.icon as keyof typeof LEARNING_ICONS] ?? BookOpen;
              return (
                <article key={item.title} className="group border border-background-300 p-6 transition-colors hover:border-primary-500 md:p-8">
                  <div className="flex items-center justify-between">
                    <RhythmIcon className="text-primary-700" size={27} aria-hidden="true" />
                    <span className="inline-flex min-h-14 min-w-16 items-center justify-center bg-[#F8E6D3] px-4 font-heading text-xl font-bold text-black">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="mt-7 text-xl text-background-950">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-foreground-600">{item.description}</p>
                </article>
              );
            })}
          </div>

          <aside className="reveal mt-5 border-l-4 border-primary-600 bg-primary-50 p-6 md:p-8">
            <p className="font-semibold text-background-950">Protect confidential information.</p>
            <p className="mt-2 text-sm leading-6 text-foreground-600">
              Portfolio evidence should be authentic, relevant and professionally presented. Confidential employer, client, project, financial, personal and commercial information must be anonymised or removed where required. Do not upload sensitive material to an unapproved location.
            </p>
          </aside>

          <div className="reveal mt-16 grid gap-8 lg:grid-cols-2">
            <article className="bg-[#10151f] p-7 text-background-50 md:p-10">
              <p className="eyebrow text-primary-300">Monthly submissions</p>
              <h3 className="mt-4 text-3xl">What you normally submit.</h3>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="border border-white/15 p-5">
                  <p className="font-mono text-xs text-primary-300">SUBMISSION 01</p>
                  <h4 className="mt-3 text-lg">Learning-platform activities</h4>
                  <p className="mt-3 text-sm leading-6 text-background-400">Reading, quizzes, podcasts, digital tasks, knowledge checks and reflection.</p>
                </div>
                <div className="border border-white/15 p-5">
                  <p className="font-mono text-xs text-primary-300">SUBMISSION 02</p>
                  <h4 className="mt-3 text-lg">Portfolio-building activities</h4>
                  <p className="mt-3 text-sm leading-6 text-background-400">Applied evidence, workplace examples, commentary, reflection and relevant project outputs.</p>
                </div>
              </div>
              <p className="mt-6 text-xs leading-5 text-background-500">Regular submissions support progress; they are not automatically formal examinations.</p>
            </article>
            <article className="border border-background-300 p-7 md:p-10">
              <p className="eyebrow text-primary-700">Funded-route commitment</p>
              <h3 className="mt-4 text-3xl text-background-950">{content.learning.commitment_title}</h3>
              <p className="mt-5 text-base leading-7 text-foreground-600">{content.learning.commitment_description}</p>
              <p className="mt-4 text-sm leading-6 text-foreground-500">Applicants who are not employed or cannot make this protected commitment may explore an IPC Bursary Route. Bursary-route delivery remains subject to its own learning and assessment requirements.</p>
            </article>
          </div>

          <div className="reveal mt-12 grid gap-5 md:grid-cols-3">
            {[
              [Users, "One hour every month", "Monthly coaching", "Review progress, current evidence, learning needs, application and next actions with your coach."],
              [Clock3, "One hour every 10 weeks", "Progress review", "Participant, coach and line manager normally review progress, evidence, feedback and objectives."],
              [BriefcaseBusiness, "Ongoing", "Workplace support", "Your employer supports protected time, suitable activity, evidence, feedback and information protection."],
            ].map(([Icon, badge, title, copy]) => {
              const CardIcon = Icon as typeof Users;
              return (
                <article key={String(title)} className="border-t-2 border-primary-600 bg-[#eef0f3] p-6 md:p-8">
                  <CardIcon className="text-primary-700" size={25} aria-hidden="true" />
                  <p className="mt-5 font-mono text-xs text-primary-700">{String(badge)}</p>
                  <h3 className="mt-2 text-xl text-background-950">{String(title)}</h3>
                  <p className="mt-3 text-sm leading-6 text-foreground-600">{String(copy)}</p>
                </article>
              );
            })}
          </div>
          <p className="mt-8 text-xs leading-6 text-foreground-500">Learning hours and weekly estimates are for planning. Actual timetables, delivery, duration and assessment requirements will be confirmed during onboarding.</p>
        </div>
      </section>
      )}

      {isManagedItemActive(content.ai_spotlight) && (
      <section
        className="relative overflow-hidden bg-[#211a2d] bg-cover bg-center section-padding text-background-50"
        style={{ backgroundImage: `url(${AI_SPOTLIGHT_BACKGROUND_URL})` }}
      >
        <div className="absolute inset-0 bg-[#171020]/55" aria-hidden="true" />
        <div className="absolute inset-0 dot-grid opacity-10" aria-hidden="true" />
        <div className="container-content relative grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="reveal">
            <div className="grid h-16 w-16 place-items-center border border-[#bca9d7]/40 bg-[#71599b]/20">
              <BrainCircuit className="text-[#d2c4e3]" size={32} aria-hidden="true" />
            </div>
            <p className="mt-8 eyebrow text-[#c8b8dc]">{content.ai_spotlight.eyebrow}</p>
            <h2 className="mt-5 text-4xl leading-tight md:text-5xl">{content.ai_spotlight.title}</h2>
            <p className="mt-6 text-base leading-8 text-background-300">{content.ai_spotlight.description}</p>
          </div>
          <div className="reveal grid gap-px bg-white/15 sm:grid-cols-2">
            {content.ai_spotlight.items.map((item, index) => (
              <div key={item} className="bg-[#211a2d]/80 p-6">
                <span className="font-mono text-xs text-[#bca9d7]">{String(index + 1).padStart(2, "0")}</span>
                <p className="mt-3 text-sm leading-6 text-background-200">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {isManagedItemActive(content.comparison) && (
      <section className="bg-background-50 section-padding">
        <div className="container-content">
          <div className="reveal">
            <SectionIntro
              eyebrow={content.comparison.eyebrow}
              title={content.comparison.title}
              copy={content.comparison.description}
            />
          </div>
          <div className="reveal mt-12 grid gap-4 md:hidden">
            {comparisonRows.map(({ route, applicant, employer, conditions, assessment }) => (
              <article key={route} className="border border-background-300 bg-background-50 p-5">
                <h3 className="text-lg text-primary-800">{route}</h3>
                <dl className="mt-5 divide-y divide-background-300 border-t border-background-300">
                  {[
                    ["Typical applicant", applicant],
                    ["Employer role", employer],
                    ["Key conditions", conditions],
                    ["Assessment", assessment],
                  ].map(([label, value]) => (
                    <div key={label} className="grid gap-1 py-3">
                      <dt className="text-[10px] font-bold uppercase tracking-wider text-foreground-500">{label}</dt>
                      <dd className="text-sm leading-6 text-foreground-700">{value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
          <div className="reveal mt-12 hidden overflow-x-auto border border-background-300 md:block">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <caption className="sr-only">Comparison of funded and IPC Bursary Routes</caption>
              <thead className="bg-background-950 text-background-50">
                <tr>
                  <th className="p-5 font-semibold">Route</th>
                  <th className="p-5 font-semibold">Typical applicant</th>
                  <th className="p-5 font-semibold">Employer role</th>
                  <th className="p-5 font-semibold">Key conditions</th>
                  <th className="p-5 font-semibold">Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-background-300">
                {comparisonRows.map((row) => (
                  <tr key={row.route} className="align-top">
                    {[row.route, row.applicant, row.employer, row.conditions, row.assessment].map((cell, index) => <td key={cell} className={`p-5 leading-6 ${index === 0 ? "font-semibold text-primary-800" : "text-foreground-600"}`}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      )}

      {isManagedItemActive(content.all_inclusive) && (
      <section
        className="relative overflow-hidden bg-[#eef0f3] bg-cover bg-center section-padding"
        style={{ backgroundImage: `url(${ALL_INCLUSIVE_BACKGROUND_URL})` }}
      >
        <div className="absolute inset-0 bg-[#eef0f3]/35" aria-hidden="true" />
        <div className="container-content relative grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="reveal">
            <SectionIntro
              eyebrow={content.all_inclusive.eyebrow}
              title={content.all_inclusive.title}
            />
            <div className="mt-8 border-l-2 border-primary-600 pl-5">
              <p className="text-lg font-semibold leading-7 text-background-950">{content.all_inclusive.statement}</p>
            </div>
          </div>
          <div className="reveal grid gap-px bg-background-300 sm:grid-cols-2">
            {content.all_inclusive.items.filter(isManagedItemActive).map((item) => {
              const ValueIcon = VALUE_ICONS[item.icon as keyof typeof VALUE_ICONS] ?? CircleCheck;
              return (
                <article key={item.title} className="flex min-h-44 flex-col justify-center bg-background-50/95 p-6 md:p-8">
                  <ValueIcon className="text-primary-700" size={24} aria-hidden="true" />
                  <h3 className="mt-5 text-lg text-background-950">{item.title}</h3>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {isManagedItemActive(content.audiences) && (
      <section className="bg-[#fffaf3] py-16 md:py-20">
        <div className="container-content">
          <div className="reveal max-w-5xl">
            <SectionIntro
              eyebrow={content.audiences.eyebrow}
              title={content.audiences.title}
              copy={content.audiences.description}
            />
          </div>
          <div className="reveal mt-8 flex flex-wrap gap-3">
            {content.audiences.items.map((item, index) => {
              const AudienceIcon = AUDIENCE_ICONS[index % AUDIENCE_ICONS.length];
              return (
                <span key={item} className="inline-flex min-h-11 items-center gap-3 border border-primary-500/30 bg-background-50 px-4 py-3 text-sm font-medium text-foreground-700">
                  <AudienceIcon className="shrink-0 text-primary-700" size={18} strokeWidth={1.8} aria-hidden="true" />
                  {item}
                </span>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {isManagedItemActive(content.eligibility) && (
      <section id="eligibility" className="scroll-mt-24 bg-[#10151f] section-padding text-background-50">
        <div className="container-content">
          <div className="reveal">
            <SectionIntro
              eyebrow={content.eligibility.eyebrow}
              title={content.eligibility.title}
              copy={content.eligibility.description}
              light
            />
          </div>
          <div className="reveal mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-px bg-white/15 sm:grid-cols-2">
              {content.eligibility.criteria.map((item) => (
                <div key={item} className="flex gap-3 bg-[#171d28] p-5">
                  <Check className="mt-0.5 shrink-0 text-primary-300" size={17} aria-hidden="true" />
                  <p className="text-sm leading-6 text-background-300">{item}</p>
                </div>
              ))}
            </div>
            <aside className="border border-primary-400/30 bg-primary-400/[0.06] p-6 md:p-8">
              <FileCheck2 className="text-primary-300" size={28} aria-hidden="true" />
              <h3 className="mt-6 text-2xl">{content.eligibility.documents_title}</h3>
              <ul className="mt-5 grid gap-3 text-sm leading-6 text-background-300 sm:grid-cols-2 lg:grid-cols-1">
                {content.eligibility.documents.map((item) => <li key={item} className="flex gap-2"><span className="text-primary-300">—</span>{item}</li>)}
              </ul>
              <p className="mt-6 text-xs leading-5 text-background-500">{content.eligibility.documents_notice}</p>
            </aside>
          </div>
          <div className="reveal mt-8 grid gap-4 md:grid-cols-2">
            {content.eligibility.notes.filter(isManagedItemActive).map((item, index) => (
              <div key={item.title} className={`border-l-2 ${index === 0 ? "border-[#9d87bd]" : "border-primary-400"} bg-white/[0.04] p-5`}>
                <p className="font-semibold">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-background-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {isManagedItemActive(content.commitment) && (
      <section className="bg-[#eef0f3] section-padding">
        <div className="container-content grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="reveal">
            <p className="eyebrow text-primary-700">{content.commitment.eyebrow}</p>
            <h2 className="mt-5 text-4xl leading-tight text-background-950">{content.commitment.title}</h2>
            <p className="mt-5 text-base leading-7 text-foreground-600">{content.commitment.description}</p>
          </div>
          <div className="reveal border border-background-300 bg-background-50 p-6 md:p-8">
            <div className="grid gap-3">
              {content.commitment.items.map((item, index) => (
                <label key={item} className="flex cursor-pointer items-start gap-4 border border-background-300 p-4 transition-colors hover:border-primary-500">
                  <input
                    type="checkbox"
                    checked={commitments[index] ?? false}
                    onChange={(event) => setCommitments((current) => content.commitment.items.map((_, itemIndex) => itemIndex === index ? event.target.checked : (current[itemIndex] ?? false)))}
                    className="mt-0.5 h-5 w-5 accent-[#b47a1f]"
                  />
                  <span className="text-sm leading-6 text-foreground-700">{item}</span>
                </label>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-center">
              <button type="button" onClick={evaluateCommitment} className="btn-primary">{content.commitment.button_label}</button>
              {commitmentResult && <p role="status" aria-live="polite" className="text-sm leading-6 text-foreground-700">{commitmentResult}</p>}
            </div>
          </div>
        </div>
      </section>
      )}

      {isManagedItemActive(content.faq) && (
      <section className="bg-[#fffaf3] py-16 md:py-20">
        <div className="container-content grid gap-10 lg:grid-cols-[0.62fr_1.38fr] lg:gap-14">
          <div className="reveal lg:pt-10">
            <SectionIntro
              eyebrow="Frequently asked questions"
              title="The practical details, answered clearly."
              copy="Every application is reviewed individually. Final support, module selection, benefits, payment arrangements and award conditions are confirmed in writing."
            />
            <span className="mt-7 block h-0.5 w-12 bg-primary-600" aria-hidden="true" />
          </div>
          <div className="reveal">
            <div className="border-l-4 border-primary-500 bg-primary-50 px-5 py-4 text-sm leading-6 text-foreground-700">
              <strong className="text-background-950">Bursary Selection Announcement:</strong>{" "}
              Approved Round Two applicants will be announced on 10 September 2026 at 2:00 PM London time.
            </div>
            <div className="mt-5 border border-background-300 bg-background-50">
              {faqItems.map(({ question, answer }) => (
                <details key={question} className="group border-b border-background-300 bg-background-50 last:border-b-0 open:bg-white">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-5 px-5 py-4 font-semibold text-background-950 transition-colors hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600">
                    <span>{question}</span>
                    <ChevronDown className="shrink-0 text-primary-700 transition-transform group-open:rotate-180" size={19} aria-hidden="true" />
                  </summary>
                  <p className="border-t border-background-300 px-5 py-5 text-sm leading-7 text-foreground-600">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
      )}

      {isManagedItemActive(content.final_cta) && (
      <section className="relative overflow-hidden bg-[#10151f] py-20 text-background-50 md:py-28">
        <div className="absolute inset-0 dot-grid-gold opacity-15" aria-hidden="true" />
        <div className="container-content relative">
          <div className="reveal max-w-4xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary-300">{content.final_cta.eyebrow}</p>
            <h2 className="mt-5 text-4xl leading-tight md:text-6xl">{content.final_cta.title}</h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-background-300">{content.final_cta.description}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link to="/bursary-scholarship-application" className="btn-primary">Apply now <ArrowRight size={16} aria-hidden="true" /></Link>
              <Link to="/information-session" className="btn-secondary">Speak to an IPC module adviser</Link>
              <a href="#modules" className="inline-flex min-h-12 items-center px-4 text-sm font-semibold text-primary-300 underline decoration-primary-500 underline-offset-8">Explore the modules</a>
              <a href={CONFIG.IPC_FUNDING_PAGE_URL} className="inline-flex min-h-12 items-center px-4 text-sm font-semibold text-primary-300 underline decoration-primary-500 underline-offset-8">Check funding options</a>
            </div>
          </div>
        </div>
      </section>
      )}
    </div>
  );
}
