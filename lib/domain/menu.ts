import { z } from "zod";

/**
 * Menu input validation (dashboard CRUD). All client input flows through these
 * schemas in the server actions before touching the database. Prices are in
 * whole naira here (the service converts to kobo at the DB boundary).
 */

const TAGS = [
  "Spicy",
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Bestseller",
  "New",
  "Chef's Special",
] as const;

const ALLERGENS = ["Nuts", "Dairy", "Gluten", "Eggs", "Fish"] as const;

export const uuid = z.string().uuid();

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  description: z.string().trim().max(200).optional(),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export const menuItemCreateSchema = z.object({
  categoryId: uuid,
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z.string().trim().max(300).default(""),
  price: z
    .number({ message: "Price is required" })
    .int("Price must be a whole number")
    .min(0, "Price cannot be negative")
    .max(10_000_000),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  preparationTimeMins: z.number().int().min(0).max(600).default(0),
  tags: z.array(z.enum(TAGS)).default([]),
  allergens: z.array(z.enum(ALLERGENS)).default([]),
});

export const menuItemUpdateSchema = menuItemCreateSchema
  .omit({ categoryId: true })
  .partial();

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
export type MenuItemCreateInput = z.infer<typeof menuItemCreateSchema>;
export type MenuItemUpdateInput = z.infer<typeof menuItemUpdateSchema>;

/** Flatten a ZodError into the Result FieldErrors shape. */
export function zodFieldErrors(error: z.ZodError): Record<string, string[]> {
  return error.flatten().fieldErrors as Record<string, string[]>;
}
