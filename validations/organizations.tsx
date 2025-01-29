import { z } from "zod";

const bankDetailsSchema = z
  .object({
    bankName: z
      .string()
      .min(2, { message: "Bank name must be at least 2 characters." })
      .optional()
      .or(z.literal("")),
    account_holder: z
      .string()
      .min(2, { message: "Account holder name must be at least 2 characters." })
      .optional()
      .or(z.literal("")),
    iban: z
      .string()
      .min(2, { message: "IBAN must be at least 2 characters." })
      .optional()
      .or(z.literal("")),
    bic: z
      .string()
      .min(2, { message: "SWIFT must be at least 2 characters." })
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      const fields = [data.bankName, data.account_holder, data.iban, data.bic];
      const atLeastOneFilled = fields.some((field) => field?.trim() !== "");

      if (atLeastOneFilled) {
        return fields.every((field) => field && field.trim().length >= 2);
      }
      return true; // If all are empty, it's valid
    },
    {
      message:
        "If one field is filled, all fields are required with at least 2 characters.",
    }
  );

export default bankDetailsSchema;

const createContactSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email({
      message: "Invalid email address format.",
    })
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .min(2, {
      message: "Phone must be at least 2 characters.",
    })
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .min(2, {
      message: "Address must be at least 2 characters.",
    })
    .optional()
    .or(z.literal("")),
  postalCode: z
    .string()
    .min(2, {
      message: "Postal code must be at least 2 characters.",
    })
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .min(2, {
      message: "City must be at least 2 characters.",
    })
    .optional()
    .or(z.literal("")),
  country: z
    .string()
    .min(2, {
      message: "Country must be at least 2 characters.",
    })
    .optional()
    .or(z.literal("")),
});

const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })

    .optional()
    .or(z.literal("")),
  email: z.string().email({
    message: "Invalid email address format.",
  }),

  address: z
    .string()
    .min(2, {
      message: "Address must be at least 2 characters.",
    })
    .optional()
    .or(z.literal("")),
  postalCode: z
    .string()
    .min(2, {
      message: "Postal code must be at least 2 characters.",
    })
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .min(2, {
      message: "City must be at least 2 characters.",
    })
    .optional()
    .or(z.literal("")),
  country: z
    .string()
    .min(2, {
      message: "Country must be at least 2 characters.",
    })
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .min(2, {
      message: "Phone must be at least 2 characters.",
    })
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .min(2, {
      message: "Website must be at least 2 characters.",
    })
    .optional()
    .or(z.literal("")),
  taxExemptionCertificate: z
    .string()
    .min(2, {
      message: "Tax exemption certificate must be at least 2 characters.",
    })
    .optional()
    .or(z.literal("")),
  taxID: z
    .string()
    .min(2, {
      message: "Tax ID must be at least 2 characters.",
    })
    .optional()
    .or(z.literal("")),
  bankDetails: bankDetailsSchema,
  contactPerson: createContactSchema,
});

export { createOrganizationSchema, createContactSchema, bankDetailsSchema };
