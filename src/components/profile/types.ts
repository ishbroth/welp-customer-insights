
import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  bio: z.string().optional(),
  businessId: z.string().optional(),
  licenseType: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  suite: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
