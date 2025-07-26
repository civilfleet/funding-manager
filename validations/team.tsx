import { z } from "zod";

const createTeamSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  website: z.string().min(1, "Website is required"),
  strategicPriorities: z.string().optional(),
  user: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
});

const updateTeamSchema = createTeamSchema.partial();
// Generate TypeScript type
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export { createTeamSchema, updateTeamSchema };
