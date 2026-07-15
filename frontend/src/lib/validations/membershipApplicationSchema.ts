import { z } from "zod";
import { requiredDocumentSchema } from "./uploadSchema";

const namePattern = /^[A-Za-z\u00C0-\u024F\u0600-\u06FF' -]+$/;
const usernamePattern = /^[a-z0-9](?:[a-z0-9._-]{1,28}[a-z0-9])?$/;

export const membershipApplicationSchema = z.object({
  first_name: z.string().trim().min(2, "First name is required.").regex(namePattern, "First name can contain letters, spaces, apostrophes and hyphens only."),
  last_name: z.string().trim().min(2, "Last name is required.").regex(namePattern, "Last name can contain letters, spaces, apostrophes and hyphens only."),
  username: z.string().trim().toLowerCase().regex(usernamePattern, "Use 3-30 letters, numbers, dots, underscores or hyphens."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim(),
  country: z.string().trim(),
  organisation: z.string().trim(),
  job_title: z.string().trim(),
  years_experience: z.string().trim(),
  grade: z.string().trim().min(1, "Select a membership grade."),
  professional_background: z.string().trim().min(20, "Enter at least 20 characters."),
  professional_statement: z.string().trim().min(20, "Enter at least 20 characters."),
  cpd_evidence: z.string().trim(),
  work_evidence: z.string().trim(),
  references_text: z.string().trim(),
  cv: requiredDocumentSchema,
  cpd_file: requiredDocumentSchema,
  work_file: requiredDocumentSchema,
  references_file: requiredDocumentSchema,
  evidence: requiredDocumentSchema,
  code_of_conduct_consent: z.boolean().refine(Boolean, "Consent to the IPC code of conduct is required."),
});

export type MembershipApplicationData = z.infer<typeof membershipApplicationSchema>;
