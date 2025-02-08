import { z } from "zod";

const createFundingRequestSchema = z.object({
  description: z
    .string()
    .min(10, "Description must be at least 10 characters."),
  purpose: z.string().min(10, "Purpose must be at least 10 characters."),
  amountRequested: z.coerce
    .number()
    .positive("Amount must be a positive number."),
  refinancingConcept: z
    .string()
    .min(10, "Refinancing concept must be at least 10 characters."),
  sustainability: z
    .string()
    .min(10, "Sustainability details must be at least 10 characters."),
  expectedCompletionDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format.",
    }),
  status: z
    .string()
    .min(5, "Status must be at least 5 characters.")
    .optional()
    .or(z.literal("")),
  files: z.string().optional().or(z.literal("")),
});
export { createFundingRequestSchema };
