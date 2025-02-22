import { z } from "zod";

const createDonationAgreement = z.object({
  fundingRequestId: z.string().uuid(),
  contactPersons: z.array(z.string().optional()).optional(),
  contactPerson: z.string().optional(),
  file: z.string(),
});

const updateDonationAgreement = createDonationAgreement.partial();

export { createDonationAgreement, updateDonationAgreement };
