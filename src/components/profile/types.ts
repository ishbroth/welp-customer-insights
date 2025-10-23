
import { z } from "zod";

// Base schema without validation rules
const baseProfileSchema = z.object({
  name: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
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

// Dynamic schema that validates based on account type
export const getProfileSchema = (isBusinessAccount: boolean) => {
  if (isBusinessAccount) {
    // Business accounts only require business name
    return baseProfileSchema.refine(
      (data) => data.name && data.name.length >= 2,
      {
        message: "Business name is required (at least 2 characters)",
        path: ["name"],
      }
    );
  } else {
    // Customer accounts only require first and last name
    return baseProfileSchema.refine(
      (data) => data.firstName && data.firstName.length >= 1 && data.lastName && data.lastName.length >= 1,
      {
        message: "First name and last name are required",
        path: ["firstName"],
      }
    );
  }
};

// For backward compatibility - defaults to customer schema
export const profileSchema = getProfileSchema(false);

export type ProfileFormValues = z.infer<typeof baseProfileSchema>;
