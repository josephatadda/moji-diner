"use server";

import { fail, ok, type Result } from "@/lib/result";
import {
  type DashboardAnalytics,
  getDashboardAnalytics,
  getPaymentMethodBreakdown,
  getRevenueTrend,
  getTopDishes,
} from "@/lib/services/analytics";
import { requireRestaurantContext } from "@/lib/services/restaurant-context";

/**
 * Dashboard analytics actions — all reads, no writes.
 * Fall back to MOCK_ANALYTICS when no database is configured.
 */

/** Full analytics snapshot for the dashboard overview page. */
export async function getDashboardAnalyticsAction(): Promise<
  Result<{ analytics: DashboardAnalytics }>
> {
  try {
    const ctx = await requireRestaurantContext();
    if (!ctx.ok) return ctx;

    const analytics = await getDashboardAnalytics(ctx.data.restaurantId);
    return ok({ analytics });
  } catch (error) {
    return fail(error, "getDashboardAnalyticsAction");
  }
}

/** Revenue trend for the last N days (chart data). */
export async function getRevenueTrendAction(
  days = 7,
): Promise<Result<{ trend: Awaited<ReturnType<typeof getRevenueTrend>> }>> {
  try {
    const ctx = await requireRestaurantContext();
    if (!ctx.ok) return ctx;

    const trend = await getRevenueTrend(ctx.data.restaurantId, days);
    return ok({ trend });
  } catch (error) {
    return fail(error, "getRevenueTrendAction");
  }
}

/** Top-selling dishes for the last N days. */
export async function getTopDishesAction(
  limit = 5,
  days = 30,
): Promise<Result<{ dishes: Awaited<ReturnType<typeof getTopDishes>> }>> {
  try {
    const ctx = await requireRestaurantContext();
    if (!ctx.ok) return ctx;

    const dishes = await getTopDishes(ctx.data.restaurantId, limit, days);
    return ok({ dishes });
  } catch (error) {
    return fail(error, "getTopDishesAction");
  }
}

/** Payment method breakdown for pie charts. */
export async function getPaymentMethodBreakdownAction(): Promise<
  Result<{
    breakdown: Awaited<ReturnType<typeof getPaymentMethodBreakdown>>;
  }>
> {
  try {
    const ctx = await requireRestaurantContext();
    if (!ctx.ok) return ctx;

    const breakdown = await getPaymentMethodBreakdown(ctx.data.restaurantId);
    return ok({ breakdown });
  } catch (error) {
    return fail(error, "getPaymentMethodBreakdownAction");
  }
}
