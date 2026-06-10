import { z } from "zod";

/**
 * Payments domain — Zod schemas for the self-reported payment system.
 *
 * Moji uses a "self-reported" model: the diner reports they have paid
 * (bank transfer, USSD, etc.), and the owner/staff confirms or rejects.
 * No payment gateway is involved.
 */

export const PAYMENT_METHODS = [
  "card",
  "bank_transfer",
  "ussd",
  "cash",
] as const;

export const PAYMENT_STATUSES = ["pending", "confirmed", "rejected"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

// ── Diner-side schema (public API) ────────────────────────────────────────────

/**
 * Schema for a diner self-reporting a payment.
 * The amount is re-computed from the linked order — the client value is ignored.
 */
export const reportPaymentSchema = z.object({
  orderId: z.string().uuid("Invalid order id"),
  method: z.enum(PAYMENT_METHODS),
  dinerName: z.string().trim().min(1).max(100).optional(),
});

// ── Dashboard schemas ─────────────────────────────────────────────────────────

export const confirmPaymentSchema = z.object({
  paymentId: z.string().uuid("Invalid payment id"),
});

export const rejectPaymentSchema = z.object({
  paymentId: z.string().uuid("Invalid payment id"),
  reason: z.string().max(200).optional(),
});

// ── Types ─────────────────────────────────────────────────────────────────────

export type ReportPaymentInput = z.infer<typeof reportPaymentSchema>;
export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;
export type RejectPaymentInput = z.infer<typeof rejectPaymentSchema>;
