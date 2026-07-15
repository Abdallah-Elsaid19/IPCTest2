import { z } from "zod";

export const clubEnquirySchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required.")
    .email("Enter a valid email address.")
    .max(254, "Email address is too long."),
  message: z
    .string()
    .trim()
    .min(10, "Please enter at least 10 characters.")
    .max(2000, "The enquiry must not exceed 2,000 characters."),
  clubName: z.string().trim().max(200).optional(),
  clubSlug: z.string().trim().max(200).optional(),
  website: z.string().trim().max(200).optional(),
});

export type ClubEnquiryFormValues = z.infer<typeof clubEnquirySchema>;

