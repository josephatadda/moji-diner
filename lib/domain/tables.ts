import { z } from "zod";

/**
 * Tables domain — Zod schemas for restaurant table management.
 * Tables track dine-in seating; their status is derived from order state.
 */

export const TABLE_STATUSES = [
  "available",
  "occupied",
  "awaiting_payment",
] as const;
export type TableStatus = (typeof TABLE_STATUSES)[number];

// ── Mutation schemas ──────────────────────────────────────────────────────────

export const createTableSchema = z.object({
  tableNumber: z.number().int().min(1).max(999),
  label: z.string().trim().min(1).max(60),
  capacity: z.number().int().min(1).max(50).default(4),
});

export const updateTableSchema = z.object({
  label: z.string().trim().min(1).max(60).optional(),
  capacity: z.number().int().min(1).max(50).optional(),
  status: z.enum(TABLE_STATUSES).optional(),
});

export const batchCreateTablesSchema = z.object({
  count: z
    .number()
    .int()
    .min(1, "Must create at least 1 table")
    .max(50, "Maximum 50 tables per batch"),
  startFrom: z.number().int().min(1).default(1),
  capacity: z.number().int().min(1).max(50).default(4),
});

// ── Types ─────────────────────────────────────────────────────────────────────

export type CreateTableInput = z.infer<typeof createTableSchema>;
export type UpdateTableInput = z.infer<typeof updateTableSchema>;
export type BatchCreateTablesInput = z.infer<typeof batchCreateTablesSchema>;
