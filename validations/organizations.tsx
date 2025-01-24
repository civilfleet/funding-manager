import { z } from "zod";
const createOrganizationSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Invalid email address format.",
  }),

  address: z.string().min(2, {
    message: "Address must be at least 2 characters.",
  }),
  postalCode: z.string().min(2, {
    message: "Postal code must be at least 2 characters.",
  }),
  city: z.string().min(2, {
    message: "City must be at least 2 characters.",
  }),
  country: z.string().min(2, {
    message: "Country must be at least 2 characters.",
  }),
  phone: z.string().min(2, {
    message: "Phone must be at least 2 characters.",
  }),
  website: z.string().min(2, {
    message: "Website must be at least 2 characters.",
  }),
  taxEemptionCertificate: z.string().min(2, {
    message: "Tax exemption certificate must be at least 2 characters.",
  }),
  taxID: z.string().min(2, {
    message: "Tax ID must be at least 2 characters.",
  }),
  bankDetails: z.object({
    bankName: z.string().min(2, {
      message: "Bank name must be at least 2 characters.",
    }),
    account_holder: z.string().min(2, {
      message: "Account number must be at least 2 characters.",
    }),
    iban: z.string().min(2, {
      message: "IBAN must be at least 2 characters.",
    }),
    bic: z.string().min(2, {
      message: "SWIFT must be at least 2 characters.",
    }),
  }),
  contactPerson: z.object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Invalid email address format.",
    }),
    phone: z.string().min(2, {
      message: "Phone must be at least 2 characters.",
    }),
    address: z.string().min(2, {
      message: "Address must be at least 2 characters.",
    }),
    postalCode: z.string().min(2, {
      message: "Postal code must be at least 2 characters.",
    }),
    city: z.string().min(2, {
      message: "City must be at least 2 characters.",
    }),
    country: z.string().min(2, {
      message: "Country must be at least 2 characters.",
    }),
  }),
});
export { createOrganizationSchema };
