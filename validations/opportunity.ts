/**
 * validations/opportunity.ts
 * Zod schemas for Opportunity & Application forms.
 */

import { z } from "zod";

export const createOpportunitySchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be under 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be under 1000 characters"),
  startDate: z
    .string()
    .min(1, "Start date is required"),
  endDate: z
    .string()
    .min(1, "End date is required"),
  location: z
    .string()
    .min(2, "Location is required"),
  shootType: z
    .string()
    .min(2, "Shoot Type category is required"),
  reference: z
    .array(z.object({
      name: z.string(),
      url: z.string().url(),
      mediaType: z.enum(["photo", "video"]),
    }))
    .optional(),
}).superRefine((data, ctx) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start < today) {
    ctx.addIssue({
      code: "custom",
      path: ["startDate"],
      message: "Start date cannot be in the past.",
    });
  }

  if (end < start) {
    ctx.addIssue({
      code: "custom",
      path: ["endDate"],
      message: "End date must be after or equal to start date.",
    });
  }
});

export type CreateOpportunityFormValues = z.infer<typeof createOpportunitySchema>;

export const applyToOpportunitySchema = z.object({
  message: z
    .string()
    .min(10, "A message of at least 10 characters is required")
    .max(500, "Message must be under 500 characters"),
});

export type ApplyToOpportunityFormValues = z.infer<typeof applyToOpportunitySchema>;
