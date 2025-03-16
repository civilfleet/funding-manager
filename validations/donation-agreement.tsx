import { z } from "zod";

const createDonationAgreementSchema = z.object({
  fundingRequestId: z.string().uuid(),
  users: z.array(z.string()).optional(),
  user: z.string().optional(),
  file: z.string(),
  agreement: z.string(),
});

const updateDonationAgreementSchema = z.object({
  file: z.string().optional(),
});

export { createDonationAgreementSchema, updateDonationAgreementSchema };
