"use server";

import { revalidatePath } from "next/cache";
import {
  confirmPaymentSchema,
  rejectPaymentSchema,
} from "@/lib/domain/payments";
import { hasDatabase } from "@/lib/env";
import { err, fail, ok, type Result } from "@/lib/result";
import {
  confirmPayment,
  listPayments,
  rejectPayment,
} from "@/lib/services/payments";
import { requireRestaurantContext } from "@/lib/services/restaurant-context";

/**
 * Dashboard payment actions — secured with requireRestaurantContext().
 * Read falls back to mock data; confirm/reject require a real database.
 */

function dbRequired(): Result<never> | null {
  return hasDatabase()
    ? null
    : err("unavailable", "Connect a database to manage payments.");
}

// ── Reads ─────────────────────────────────────────────────────────────────────

export async function listPaymentsAction(
  limit = 50,
): Promise<Result<{ payments: Awaited<ReturnType<typeof listPayments>> }>> {
  try {
    const ctx = await requireRestaurantContext();
    if (!ctx.ok) return ctx;

    const paymentList = await listPayments(ctx.data.restaurantId, limit);
    return ok({ payments: paymentList });
  } catch (error) {
    return fail(error, "listPaymentsAction");
  }
}

// ── Writes ────────────────────────────────────────────────────────────────────

export async function confirmPaymentAction(
  paymentId: string,
): Promise<Result<{ paymentId: string }>> {
  try {
    const ctx = await requireRestaurantContext();
    if (!ctx.ok) return ctx;
    const gate = dbRequired();
    if (gate) return gate;

    const parsed = confirmPaymentSchema.safeParse({ paymentId });
    if (!parsed.success) return err("validation", "Invalid payment id.");

    const confirmed = await confirmPayment(
      ctx.data.restaurantId,
      parsed.data,
      ctx.data.userId,
    );
    if (!confirmed) return err("not_found");

    revalidatePath("/dashboard/payments");
    return ok({ paymentId });
  } catch (error) {
    return fail(error, "confirmPaymentAction");
  }
}

export async function rejectPaymentAction(
  paymentId: string,
): Promise<Result<{ paymentId: string }>> {
  try {
    const ctx = await requireRestaurantContext();
    if (!ctx.ok) return ctx;
    const gate = dbRequired();
    if (gate) return gate;

    const parsed = rejectPaymentSchema.safeParse({ paymentId });
    if (!parsed.success) return err("validation", "Invalid payment id.");

    const rejected = await rejectPayment(ctx.data.restaurantId, parsed.data);
    if (!rejected) return err("not_found");

    revalidatePath("/dashboard/payments");
    return ok({ paymentId });
  } catch (error) {
    return fail(error, "rejectPaymentAction");
  }
}
