import { z } from "zod";

/**
 * Restaurant settings domain — Zod schemas for owner-managed configuration.
 * The `features` object is a JSON flag map controlling which modules are active.
 */

// ── Feature flags ─────────────────────────────────────────────────────────────

export const featuresSchema = z.object({
  menu: z.boolean().default(true),
  orders: z.boolean().default(true),
  tables: z.boolean().default(true),
  payments: z.boolean().default(true),
  loyalty: z.boolean().default(true),
  analytics: z.boolean().default(true),
  staff: z.boolean().default(true),
  notifications: z.boolean().default(true),
  integrations: z.boolean().default(false),
});

export type Features = z.infer<typeof featuresSchema>;

/** Default feature set for a newly-created restaurant. */
export const DEFAULT_FEATURES: Features = {
  menu: true,
  orders: true,
  tables: true,
  payments: true,
  loyalty: true,
  analytics: true,
  staff: true,
  notifications: true,
  integrations: false,
};

// ── Restaurant profile update ─────────────────────────────────────────────────

export const updateRestaurantProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(500).optional(),
  city: z.string().trim().max(100).optional(),
  phone: z
    .string()
    .regex(/^\+234\d{10}$/, "Must be a valid Nigerian phone number (+234…)")
    .optional(),
  bankName: z.string().trim().max(100).optional(),
  bankAccountName: z.string().trim().max(100).optional(),
  bankAccountNumber: z
    .string()
    .regex(/^\d{10}$/, "Account number must be 10 digits")
    .optional(),
  vatEnabled: z.boolean().optional(),
  vatRate: z.number().min(0).max(100).optional(),
  loyaltyEnabled: z.boolean().optional(),
  isAcceptingOrders: z.boolean().optional(),
});

// ── Service-charge update ─────────────────────────────────────────────────────

export const updateServiceChargeSchema = z.object({
  serviceChargeEnabled: z.boolean(),
  serviceChargeRate: z.number().min(0).max(100).optional(),
});

// ── Types ─────────────────────────────────────────────────────────────────────

export type UpdateRestaurantProfileInput = z.infer<
  typeof updateRestaurantProfileSchema
>;
export type UpdateServiceChargeInput = z.infer<
  typeof updateServiceChargeSchema
>;
