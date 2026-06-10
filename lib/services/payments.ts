import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { orders, payments } from "@/lib/db/schema";
import type { PaymentRow } from "@/lib/db/schema/restaurant";
import { koboToNaira } from "@/lib/domain/money";
import type {
  ConfirmPaymentInput,
  RejectPaymentInput,
  ReportPaymentInput,
} from "@/lib/domain/payments";
import { hasDatabase } from "@/lib/env";
import { MOCK_TRANSACTIONS, type Transaction } from "@/lib/mockData";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { err, fail, ok, type Result } from "@/lib/result";

// ── Type mapper ───────────────────────────────────────────────────────────────

function toTransaction(row: PaymentRow): Transaction {
  return {
    id: row.id,
    orderId: row.orderId,
    tableNumber: row.tableNumber,
    dinerName: row.dinerName ?? "",
    amount: koboToNaira(row.amount),
    method: row.method as Transaction["method"],
    status:
      row.status === "confirmed"
        ? "success"
        : row.status === "rejected"
          ? "failed"
          : "pending",
    reference: row.reference,
    createdAt: row.notifiedAt,
  };
}

// ── Reads ─────────────────────────────────────────────────────────────────────

/**
 * List all payments for a restaurant, newest first.
 * Returns mock data when no database is configured.
 */
export async function listPayments(
  restaurantId: string,
  limit = 50,
): Promise<Transaction[]> {
  if (!hasDatabase()) return MOCK_TRANSACTIONS;

  const rows = await db
    .select()
    .from(payments)
    .where(eq(payments.restaurantId, restaurantId))
    .orderBy(desc(payments.notifiedAt))
    .limit(limit);

  return rows.map(toTransaction);
}

// ── Writes ────────────────────────────────────────────────────────────────────

/**
 * Record a diner's self-reported payment for an order.
 *
 * Security:
 *  - Rate-limited per IP (5 reports / 10 minutes).
 *  - The payment amount is read from the order's grandTotal — never from the client.
 *  - A unique reference is generated server-side.
 */
export async function reportPayment(
  input: ReportPaymentInput,
  requestHeaders: Headers,
): Promise<Result<{ paymentId: string; reference: string }>> {
  const ip = clientIpFromHeaders(requestHeaders);
  if (!rateLimit(`report-payment:${ip}`, 5, 10 * 60 * 1000)) {
    return err("rate_limited");
  }

  if (!hasDatabase()) {
    const ref = `MJI-MOCK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    return ok({ paymentId: `mock-pay-${Date.now()}`, reference: ref });
  }

  try {
    // Fetch the order to get the authoritative amount and restaurantId
    const [order] = await db
      .select({
        id: orders.id,
        restaurantId: orders.restaurantId,
        grandTotal: orders.grandTotal,
        tableNumber: orders.tableNumber,
      })
      .from(orders)
      .where(eq(orders.id, input.orderId))
      .limit(1);

    if (!order) return err("not_found", "Order not found.");

    const reference = `MJI-${crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;

    const [payment] = await db
      .insert(payments)
      .values({
        restaurantId: order.restaurantId,
        orderId: order.id,
        amount: order.grandTotal, // server-authoritative
        method: input.method,
        status: "pending",
        reference,
        tableNumber: order.tableNumber,
        dinerName: input.dinerName ?? null,
      })
      .returning({ id: payments.id });

    return ok({ paymentId: payment.id, reference });
  } catch (error) {
    return fail(error, "reportPayment");
  }
}

/**
 * Confirm a pending payment (owner/staff dashboard action).
 * Sets status to "confirmed" and stamps confirmedAt + confirmedBy.
 */
export async function confirmPayment(
  restaurantId: string,
  input: ConfirmPaymentInput,
  confirmedByUserId: string,
): Promise<boolean> {
  const result = await db
    .update(payments)
    .set({
      status: "confirmed",
      confirmedAt: sql`now()`,
      confirmedBy: confirmedByUserId,
    })
    .where(
      and(
        eq(payments.id, input.paymentId),
        eq(payments.restaurantId, restaurantId),
        eq(payments.status, "pending"),
      ),
    )
    .returning({ id: payments.id });

  return result.length > 0;
}

/**
 * Reject a pending payment (owner/staff dashboard action).
 */
export async function rejectPayment(
  restaurantId: string,
  input: RejectPaymentInput,
): Promise<boolean> {
  const result = await db
    .update(payments)
    .set({ status: "rejected" })
    .where(
      and(
        eq(payments.id, input.paymentId),
        eq(payments.restaurantId, restaurantId),
        eq(payments.status, "pending"),
      ),
    )
    .returning({ id: payments.id });

  return result.length > 0;
}
