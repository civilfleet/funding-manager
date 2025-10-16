import { z } from "zod";
import { ContactAttributeType } from "@/types";

const preprocessEmptyString = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalText = (schema: z.ZodString) => z.preprocess(preprocessEmptyString, schema.optional());

const requiredEmail = z.string().trim().min(1, "Email is required").email("Invalid email address");

const optionalEmail = z.preprocess(
  preprocessEmptyString,
  z.string().trim().email("Invalid email address").optional()
);

const numberValue = z.preprocess((value) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") {
      return undefined;
    }

    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? value : parsed;
  }
  return value;
}, z.number().finite());

const contactLocationSchema = z
  .object({
    label: optionalText(z.string().min(1)),
    latitude: numberValue.optional(),
    longitude: numberValue.optional(),
  })
  .partial()
  .transform((value) => {
    const result: Record<string, unknown> = {};
    if (typeof value.label === "string" && value.label.trim() !== "") {
      result.label = value.label.trim();
    }
    if (typeof value.latitude === "number" && !Number.isNaN(value.latitude)) {
      result.latitude = value.latitude;
    }
    if (typeof value.longitude === "number" && !Number.isNaN(value.longitude)) {
      result.longitude = value.longitude;
    }
    return result;
  });

const contactAttributeSchema = z.discriminatedUnion("type", [
  z.object({
    key: z.string().min(1, "Attribute label is required"),
    type: z.literal(ContactAttributeType.STRING),
    value: z.string().min(1, "Value is required"),
  }),
  z.object({
    key: z.string().min(1, "Attribute label is required"),
    type: z.literal(ContactAttributeType.DATE),
    value: z
      .string()
      .min(1, "Value is required")
      .refine((value) => !Number.isNaN(Date.parse(value)), { message: "Invalid date" }),
  }),
  z.object({
    key: z.string().min(1, "Attribute label is required"),
    type: z.literal(ContactAttributeType.NUMBER),
    value: numberValue,
  }),
  z.object({
    key: z.string().min(1, "Attribute label is required"),
    type: z.literal(ContactAttributeType.LOCATION),
    value: contactLocationSchema,
  }),
]);

export const createContactSchema = z.object({
  teamId: z.string().uuid("Team id must be a valid UUID"),
  name: z.string().min(1, "Name is required"),
  email: requiredEmail,
  phone: optionalText(z.string()),
  profileAttributes: z.array(contactAttributeSchema).default([]),
  groupId: z.preprocess(preprocessEmptyString, z.string().uuid("Group id must be a valid UUID").optional()),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;

export const updateContactSchema = z.object({
  contactId: z.string().uuid("Contact id must be a valid UUID"),
  teamId: z.string().uuid("Team id must be a valid UUID"),
  name: z.string().min(1, "Name is required").optional(),
  email: optionalEmail,
  phone: optionalText(z.string()),
  profileAttributes: z.array(contactAttributeSchema).optional(),
  groupId: z.preprocess(preprocessEmptyString, z.string().uuid("Group id must be a valid UUID").optional()),
});

export type UpdateContactInput = z.infer<typeof updateContactSchema>;

export const deleteContactsSchema = z.object({
  teamId: z.string().uuid("Team id must be a valid UUID"),
  ids: z
    .array(z.string().uuid("Contact id must be a valid UUID"))
    .min(1, "Select at least one contact"),
});

export type DeleteContactsInput = z.infer<typeof deleteContactsSchema>;
