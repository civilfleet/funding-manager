import { z } from "zod";

const createFundingRequestSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  purpose: z.string().min(10, "Purpose must be at least 10 characters."),
  amountAgreed: z.coerce.number().optional(),
  amountRequested: z.coerce.number().positive("Amount must be a positive number."),
  refinancingConcept: z.string().min(10, "Refinancing concept must be at least 10 characters."),
  remainingAmount: z.coerce.number().optional(),
  sustainability: z.string().min(10, "Sustainability details must be at least 10 characters."),
  expectedCompletionDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format.",
  }),
  status: z.enum(["Pending", "UnderReview", "Approved", "Rejected"]),
  files: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
    })
  ),
});

const updateFundingRequestSchema = createFundingRequestSchema.partial();

export { createFundingRequestSchema, updateFundingRequestSchema };
