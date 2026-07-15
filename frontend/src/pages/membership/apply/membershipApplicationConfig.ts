export type FieldType = "text" | "email" | "tel" | "select" | "textarea" | "checkboxes" | "checkbox";

export type ApplicationField = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  help?: string;
  maxLength?: number;
  rows?: number;
};

export type DocumentRequest = {
  name: string;
  apiField: "cv" | "cpd_file" | "work_file" | "references_file" | "evidence";
  label: string;
  required: true;
  help: string;
};

export type GradeApplicationConfig = {
  slug: string;
  title: string;
  postNominal: string;
  gradeCode: "AffIPC" | "MIPC" | "AFIPC_L3" | "AFIPC_L4" | "FIPC";
  endpoint?: string;
  fields: ApplicationField[];
  documents: DocumentRequest[];
  discussionRequired?: boolean;
};

const disciplines = [
  "Planning / Scheduling",
  "Cost Engineering / Estimating",
  "Risk Management",
  "PMO / Governance",
  "Commercial / Contracts",
  "Data Analytics / Reporting",
  "Delay Analysis / Forensics",
  "Sustainability / Net Zero",
  "AI / Digital Tools",
  "Change Control",
];

const competenceDomains = [
  "Planning and scheduling",
  "Cost management",
  "Risk and opportunity",
  "Change control",
  "Performance reporting",
  "Governance and assurance",
  "Commercial management",
  "Leadership and communication",
];

const commonConduct: ApplicationField = {
  name: "code_of_conduct",
  label: "I agree to abide by the Institute Code of Conduct, including commitments to honesty, professionalism and continuous learning.",
  type: "checkbox",
  required: true,
};

const configs: Record<string, GradeApplicationConfig> = {
  affiliate: {
    slug: "affiliate",
    title: "Affiliate Member",
    postNominal: "AffIPC",
    gradeCode: "AffIPC",
    endpoint: import.meta.env.VITE_READDY_FORM_AFFILIATE_ENDPOINT,
    fields: [
      { name: "professional_status", label: "Current professional status", type: "select", required: true, options: ["Student", "Graduate / apprentice", "Early-career professional", "Career changer", "Other"] },
      { name: "statement_of_interest", label: "Statement of interest", type: "textarea", required: true, maxLength: 500, rows: 5, placeholder: "Why are you interested in project controls? What do you hope to gain from IPC affiliation?" },
      { name: "background_summary", label: "Background summary", type: "textarea", maxLength: 500, rows: 4, placeholder: "Briefly describe your education, current work or relevant experience." },
      { name: "areas_of_interest", label: "Areas of project controls interest", type: "checkboxes", options: disciplines, help: "Select all disciplines you are interested in learning about." },
      { name: "referral_source", label: "How did you hear about the Institute of Project Controls?", type: "select", options: ["Search engine", "Employer", "Colleague or member", "University or training provider", "Event", "Social media", "Other"] },
      commonConduct,
    ],
    documents: [
      { name: "cv", apiField: "cv", label: "CV or professional profile", required: true, help: "Upload your current CV or professional profile." },
      { name: "verification", apiField: "evidence", label: "Student or employment verification", required: true, help: "Student ID, employment letter or other verification document." },
    ],
  },
  professional: {
    slug: "professional",
    title: "Professional Member",
    postNominal: "MIPC",
    gradeCode: "MIPC",
    endpoint: import.meta.env.VITE_READDY_FORM_PROFESSIONAL_ENDPOINT,
    fields: [
      { name: "role_summary", label: "Current role and responsibilities", type: "textarea", required: true, rows: 4, maxLength: 1000 },
      { name: "years_in_controls", label: "Years working in project controls or project delivery", type: "select", required: true, options: ["Less than 1 year", "1–3 years", "4–7 years", "8–12 years", "13+ years"] },
      { name: "professional_statement", label: "Professional statement", type: "textarea", required: true, rows: 7, maxLength: 1000, help: "Summarise your experience, responsibilities and contribution to project delivery." },
      { name: "disciplines", label: "Project controls disciplines", type: "checkboxes", required: true, options: disciplines },
      { name: "cpd_record", label: "Recent CPD and training", type: "textarea", required: true, rows: 5, maxLength: 1500 },
      commonConduct,
    ],
    documents: [
      { name: "cv", apiField: "cv", label: "Current CV", required: true, help: "Upload your current CV." },
      { name: "cpd_evidence", apiField: "cpd_file", label: "CPD or training evidence", required: true, help: "Certificates, course records or your current CPD log." },
    ],
  },
  "associate-fellow-l3": {
    slug: "associate-fellow-l3",
    title: "Associate Fellow Level 3",
    postNominal: "AFIPC L3",
    gradeCode: "AFIPC_L3",
    endpoint: import.meta.env.VITE_READDY_FORM_AFIPC_L3_ENDPOINT,
    fields: [
      { name: "professional_statement", label: "Professional competence statement", type: "textarea", required: true, rows: 10, maxLength: 7000, help: "Approximately 500–1,000 words describing your technician-level practice and responsibilities." },
      { name: "training_summary", label: "Training and qualifications", type: "textarea", required: true, rows: 5, maxLength: 2000 },
      { name: "competence_areas", label: "Competence areas evidenced", type: "checkboxes", required: true, options: competenceDomains },
      { name: "work_examples", label: "Examples of work and professional behaviours", type: "textarea", required: true, rows: 7, maxLength: 3500 },
      { name: "reference_contact", label: "Reference name, role and email", type: "textarea", required: true, rows: 3, maxLength: 750 },
      commonConduct,
    ],
    documents: [
      { name: "cv", apiField: "cv", label: "Current CV", required: true, help: "Upload your current CV." },
      { name: "training_evidence", apiField: "cpd_file", label: "Training evidence", required: true, help: "Certificates, apprenticeship evidence or relevant qualifications." },
      { name: "work_evidence", apiField: "work_file", label: "Work examples", required: true, help: "Supporting schedules, reports or other redacted evidence." },
    ],
  },
  "associate-fellow-l4": {
    slug: "associate-fellow-l4",
    title: "Associate Fellow Level 4",
    postNominal: "AFIPC L4",
    gradeCode: "AFIPC_L4",
    endpoint: import.meta.env.VITE_READDY_FORM_AFIPC_L4_ENDPOINT,
    fields: [
      { name: "professional_statement", label: "Applied professional statement", type: "textarea", required: true, rows: 12, maxLength: 11000, help: "Approximately 1,000–1,500 words showing independent application on live projects or programmes." },
      { name: "case_study", label: "Applied case study", type: "textarea", required: true, rows: 10, maxLength: 8000, help: "Describe the context, your actions, decisions and measurable outcomes." },
      { name: "competence_areas", label: "Competence areas evidenced", type: "checkboxes", required: true, options: competenceDomains },
      { name: "cpd_record", label: "Recent CPD record", type: "textarea", required: true, rows: 5, maxLength: 2500 },
      { name: "reference_contact", label: "Professional reference name, role and email", type: "textarea", required: true, rows: 3, maxLength: 750 },
      { name: "discussion_availability", label: "Availability for a professional discussion", type: "textarea", required: true, rows: 3, maxLength: 500 },
      commonConduct,
    ],
    documents: [
      { name: "cv", apiField: "cv", label: "Current CV", required: true, help: "Upload your current CV." },
      { name: "portfolio", apiField: "work_file", label: "Applied portfolio", required: true, help: "Redacted work products demonstrating independent practice." },
      { name: "case_study_evidence", apiField: "evidence", label: "Case study evidence", required: true, help: "Supporting evidence for the case study entered above." },
      { name: "cpd_evidence", apiField: "cpd_file", label: "CPD evidence", required: true, help: "Your CPD log and relevant certificates." },
    ],
    discussionRequired: true,
  },
  fellow: {
    slug: "fellow",
    title: "Fellow",
    postNominal: "FIPC",
    gradeCode: "FIPC",
    endpoint: import.meta.env.VITE_READDY_FORM_FELLOW_ENDPOINT,
    fields: [
      { name: "professional_statement", label: "Senior professional statement", type: "textarea", required: true, rows: 14, maxLength: 18000, help: "Approximately 1,500–2,500 words demonstrating strategic leadership and contribution to the profession." },
      { name: "leadership_summary", label: "Leadership and strategic influence", type: "textarea", required: true, rows: 8, maxLength: 5000 },
      { name: "case_studies", label: "Summary of two or three case studies", type: "textarea", required: true, rows: 12, maxLength: 12000, help: "For each case, describe complexity, your decisions, organisational impact and outcomes." },
      { name: "competence_domains", label: "Strategic competence domains", type: "checkboxes", required: true, options: competenceDomains },
      { name: "cpd_contribution", label: "CPD and contribution to the profession", type: "textarea", required: true, rows: 7, maxLength: 4000 },
      { name: "references", label: "Two professional references: names, roles and emails", type: "textarea", required: true, rows: 5, maxLength: 1500 },
      { name: "discussion_confirmation", label: "I confirm that I am available for a professional discussion as part of the assessment.", type: "checkbox", required: true },
      commonConduct,
    ],
    documents: [
      { name: "cv", apiField: "cv", label: "Senior CV", required: true, help: "Upload your current senior CV." },
      { name: "portfolio", apiField: "work_file", label: "Professional portfolio", required: true, help: "Supporting strategic work products, publications or recognition evidence." },
      { name: "case_study_evidence", apiField: "evidence", label: "Case study evidence", required: true, help: "Evidence supporting the two or three case studies summarised above." },
      { name: "cpd_evidence", apiField: "cpd_file", label: "CPD evidence", required: true, help: "Recent CPD record and evidence of contribution to the profession." },
    ],
    discussionRequired: true,
  },
};

export const membershipApplicationConfigs = configs;

export function getMembershipApplicationConfig(slug?: string) {
  return slug ? configs[slug] : undefined;
}
