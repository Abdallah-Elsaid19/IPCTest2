import { z } from "zod";

export type SimpleInterestType = "contact" | "event" | "awards" | "newsletter";

const phonePattern = /^[+()\d\s.-]{7,30}$/;

export const simpleInterestSchema = z.object({
  name: z.string().trim().max(160),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z.string().trim().refine((value) => !value || phonePattern.test(value), "Please enter a valid phone number."),
  category: z.string().trim().max(120),
  event_name: z.string().trim().max(220),
  event_type: z.enum(["London Master Class", "Regional Club", "Other"]),
  organisation: z.string().trim().max(180),
  interest_type: z.enum(["Nominate", "Sponsor", "Judge", "General"]),
  message: z.string().trim().max(5000),
  dietary_access_needs: z.string().trim().max(2000),
  consent: z.boolean(),
});

export type SimpleInterestFormData = z.infer<typeof simpleInterestSchema>;

export function createSimpleInterestSchema(type: SimpleInterestType) {
  return simpleInterestSchema.superRefine((data, context) => {
    if (type !== "newsletter" && data.name.length < 2) {
      context.addIssue({ code: "custom", path: ["name"], message: "Name must be at least 2 characters." });
    }
    if (type === "contact") {
      if (!data.category) context.addIssue({ code: "custom", path: ["category"], message: "Enquiry category is required." });
      if (data.message.length < 10) context.addIssue({ code: "custom", path: ["message"], message: "Message must be at least 10 characters." });
    }
    if (type === "event" && !data.event_name) {
      context.addIssue({ code: "custom", path: ["event_name"], message: "Event name is required." });
    }
    if (type === "awards" && data.message.length < 10) {
      context.addIssue({ code: "custom", path: ["message"], message: "Message must be at least 10 characters." });
    }
  });
}
