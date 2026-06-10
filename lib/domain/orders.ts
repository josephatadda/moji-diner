import { z } from "zod";

/**
 * Orders domain — Zod schemas and types for the ordering system.
 *
 * Conventions:
 *  - Prices flowing IN from clients are in naira (whole numbers).
 *  - The service layer converts to kobo before persisting.
 *  - `selectedModifiers` is a snapshot: modifier group id → chosen options.
 */

// ── Enums (mirrors DB enum values) ───────────────────────────────────────────

export const ORDER_STATUSES = [
  "pending",
  "in_kitchen",
  "ready",
  "served",
  "paid",
] as const;

export const ORDER_SOURCES = ["qr", "staff"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type OrderSource = (typeof ORDER_SOURCES)[number];

// ── Nested schemas ────────────────────────────────────────────────────────────

/** A single modifier option chosen by the diner (stored as a snapshot). */
const selectedModifierOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  priceDelta: z.number().int(), // naira
});

/** One item in a diner's order submission. */
export const orderItemInputSchema = z.object({
  menuItemId: z.string().uuid("Invalid menu item id"),
  quantity: z
    .number()
    .int()
    .min(1, "Quantity must be at least 1")
    .max(99, "Quantity cannot exceed 99"),
  /** Key: modifier group id. Value: array of chosen options. */
  selectedModifiers: z
    .record(z.string(), z.array(selectedModifierOptionSchema))
    .default({}),
  specialNote: z.string().max(200).optional(),
});

// ── Public schemas ────────────────────────────────────────────────────────────

/**
 * Schema for a diner placing a new order (QR or staff-entered).
 * The service will re-validate prices server-side — never trust client totals.
 */
export const placeOrderSchema = z.object({
  restaurantSlug: z.string().min(1),
  tableNumber: z.number().int().min(1, "Table number must be at least 1"),
  items: z
    .array(orderItemInputSchema)
    .min(1, "Order must have at least one item"),
  dinerPhone: z
    .string()
    .regex(/^\+234\d{10}$/)
    .optional(),
  source: z.enum(ORDER_SOURCES).default("qr"),
});

/**
 * Schema for dashboard staff/owner updating an order's status.
 * Only allows valid forward progressions — enforced in the service.
 */
export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid("Invalid order id"),
  status: z.enum(ORDER_STATUSES),
});

// ── Types ─────────────────────────────────────────────────────────────────────

export type OrderItemInput = z.infer<typeof orderItemInputSchema>;
export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
