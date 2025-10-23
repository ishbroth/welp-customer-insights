
import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().optional(),
  firstName: z.string().min(1, { message: "First name is required" }).optional(),
  lastName: z.string().min(1, { message: "Last name is required" }).optional(),
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
}).refine(
  (data) => {
    // Either name OR (firstName and lastName) must be provided
    return (data.name && data.name.length >= 2) || (data.firstName && data.lastName);
  },
  {
    message: "Please provide either a business name or first and last name",
    path: ["name"],
  }
);

export type ProfileFormValues = z.infer<typeof profileSchema>;
