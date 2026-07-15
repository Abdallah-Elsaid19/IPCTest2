import { z } from "zod";

import type { GradeApplicationConfig } from "@/pages/membership/apply/membershipApplicationConfig";
import { requiredDocumentSchema } from "./uploadSchema";

const namePattern = /^[A-Za-z\u00C0-\u024F\u0600-\u06FF' -]+$/;
const phonePattern = /^[+()\d\s.-]{7,30}$/;
const usernamePattern = /^[a-z0-9](?:[a-z0-9._-]{1,28}[a-z0-9])?$/;

const baseSchema = z.object({
  first_name: z.string().trim().min(2, "First name must be at least 2 characters.").regex(namePattern, "Enter a valid first name."),
  last_name: z.string().trim().min(2, "Last name must be at least 2 characters.").regex(namePattern, "Enter a valid last name."),
  username: z.string().trim().toLowerCase().regex(usernamePattern, "Use 3-30 letters, numbers, dots, underscores or hyphens."),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z.string().trim().min(1, "Phone number is required.").regex(phonePattern, "Please enter a valid phone number."),
  organisation: z.string().trim().max(180),
  country: z.string().trim().min(2, "Country is required."),
  contact_preference: z.enum(["Email", "Phone", "Either email or phone"], { error: "Select a contact preference." }),
  website_alt: z.string().max(0),
}).catchall(z.unknown());

export type GradeApplicationData = z.infer<typeof baseSchema>;

export function createGradeApplicationSchema(config: GradeApplicationConfig) {
  return baseSchema.superRefine((data, context) => {
    config.fields.forEach((field) => {
      const value = data[field.name];
      const empty = Array.isArray(value) ? value.length === 0 : field.type === "checkbox" ? value !== true : !String(value || "").trim();
      if (field.required && empty) {
        context.addIssue({
          code: "custom",
          path: [field.name],
          message: field.type === "checkbox" ? "Please confirm this statement." : "This field is required.",
        });
      }
      if (field.maxLength && typeof value === "string" && value.length > field.maxLength) {
        context.addIssue({ code: "custom", path: [field.name], message: `Enter no more than ${field.maxLength} characters.` });
      }
    });

    config.documents.forEach((document) => {
      const result = requiredDocumentSchema.safeParse(data[document.name]);
      if (!result.success) {
        context.addIssue({ code: "custom", path: [document.name], message: result.error.issues[0]?.message || "Please upload the required file." });
      }
    });
  });
}
