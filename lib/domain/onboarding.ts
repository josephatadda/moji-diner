import { z } from "zod";

export const restaurantProfileSchema = z.object({
  name: z.string().min(2, "Restaurant name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  phone: z
    .string()
    .regex(/^\+234\d{10}$/, "Invalid Nigerian phone number format"),
  cuisines: z.array(z.string()).min(1, "Please select at least one cuisine"),
});

export const tablesSetupSchema = z.object({
  tableCount: z
    .number()
    .int()
    .min(1, "Must have at least 1 table")
    .max(50, "Maximum 50 tables supported initially"),
  templates: z
    .array(z.string())
    .min(1, "Please select at least one seating template"),
});

export const completeOnboardingSchema = z.object({
  profile: restaurantProfileSchema,
  tables: tablesSetupSchema,
});

export type RestaurantProfileInput = z.infer<typeof restaurantProfileSchema>;
export type TablesSetupInput = z.infer<typeof tablesSetupSchema>;
export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;
