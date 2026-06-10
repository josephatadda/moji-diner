"use server";

import { revalidatePath } from "next/cache";
import { updateOrderStatusSchema } from "@/lib/domain/orders";
import { err, fail, ok, type Result } from "@/lib/result";
import {
  listActiveOrders,
  listOrders,
  updateOrderStatus,
} from "@/lib/services/orders";
import { requireRestaurantContext } from "@/lib/services/restaurant-context";

/**
 * Dashboard order actions — all secured with requireRestaurantContext().
 *
 * Pattern (same as menu actions):
 *  1. Resolve authenticated owner's restaurant
 *  2. Validate input with zod
 *  3. Scope the operation to that restaurantId (tenant isolation)
 *  4. Return a safe Result — no raw errors exposed to the client
 */

// ── Reads ─────────────────────────────────────────────────────────────────────

/**
 * Fetch all active orders (pending / in_kitchen / ready) for the kitchen queue.
 */
export async function listActiveOrdersAction(): Promise<
  Result<{ orders: Awaited<ReturnType<typeof listActiveOrders>> }>
> {
  try {
    const ctx = await requireRestaurantContext();
    if (!ctx.ok) return ctx;

    const orders = await listActiveOrders(ctx.data.restaurantId);
    return ok({ orders });
  } catch (error) {
    return fail(error, "listActiveOrdersAction");
  }
}

/**
 * Fetch the full order history for the dashboard orders view.
 */
export async function listOrdersAction(
  limit = 50,
): Promise<Result<{ orders: Awaited<ReturnType<typeof listOrders>> }>> {
  try {
    const ctx = await requireRestaurantContext();
    if (!ctx.ok) return ctx;

    const orders = await listOrders(ctx.data.restaurantId, limit);
    return ok({ orders });
  } catch (error) {
    return fail(error, "listOrdersAction");
  }
}

// ── Writes ────────────────────────────────────────────────────────────────────

/**
 * Advance or update an order's status (kitchen staff action).
 * Validates the status value and scopes the update to the caller's restaurant.
 */
export async function updateOrderStatusAction(
  orderId: string,
  status: string,
): Promise<Result<{ orderId: string }>> {
  try {
    const ctx = await requireRestaurantContext();
    if (!ctx.ok) return ctx;

    const parsed = updateOrderStatusSchema.safeParse({ orderId, status });
    if (!parsed.success) {
      return err("validation", "Invalid order status update.");
    }

    const updated = await updateOrderStatus(ctx.data.restaurantId, parsed.data);
    if (!updated) return err("not_found");

    revalidatePath("/dashboard/orders");
    return ok({ orderId });
  } catch (error) {
    return fail(error, "updateOrderStatusAction");
  }
}
