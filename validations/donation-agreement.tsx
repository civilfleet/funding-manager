import { z } from "zod";

const createDonationAgreementSchema = z.object({
  fundingRequestId: z.string().uuid(),
  contactPersons: z.array(z.string()).optional(),
  contactPerson: z.string().optional(),
  file: z.string(),
  agreement: z.string(),
});

const updateDonationAgreementSchema = z.object({
  file: z.string().optional(),
});

export { createDonationAgreementSchema, updateDonationAgreementSchema };
