import "server-only";

import { and, count, desc, eq, gte, sql, sum } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { orderItems, orders, payments } from "@/lib/db/schema";
import { koboToNaira } from "@/lib/domain/money";
import { hasDatabase } from "@/lib/env";
import { MOCK_ANALYTICS } from "@/lib/mockData";

// ── Public types ──────────────────────────────────────────────────────────────

export type RevenueSummary = {
  date: string; // e.g. "Mon", "2024-06-01"
  revenue: number; // naira
  orders: number;
};

export type TopDish = {
  name: string;
  sales: number;
  revenue: number; // naira
};

export type PaymentMethodBreakdown = {
  name: string;
  value: number; // percent
};

export type DashboardAnalytics = {
  revenueTrend: RevenueSummary[];
  topDishes: TopDish[];
  paymentMethods: PaymentMethodBreakdown[];
};

// ── Reads ─────────────────────────────────────────────────────────────────────

/**
 * Compute revenue and order count per day for the last N days.
 * Returns mock data when no database is configured.
 */
export async function getRevenueTrend(
  restaurantId: string,
  days = 7,
): Promise<RevenueSummary[]> {
  if (!hasDatabase()) return MOCK_ANALYTICS.revenueTrend;

  const since = new Date();
  since.setDate(since.getDate() - days);

  const rows = await db
    .select({
      date: sql<string>`DATE(${orders.createdAt})`.as("date"),
      revenue: sum(orders.grandTotal).as("revenue"),
      orderCount: count(orders.id).as("order_count"),
    })
    .from(orders)
    .where(
      and(eq(orders.restaurantId, restaurantId), gte(orders.createdAt, since)),
    )
    .groupBy(sql`DATE(${orders.createdAt})`)
    .orderBy(sql`DATE(${orders.createdAt})`);

  return rows.map((r) => ({
    date: r.date,
    revenue: koboToNaira(Number(r.revenue ?? 0)),
    orders: Number(r.orderCount ?? 0),
  }));
}

/**
 * Compute top-selling menu items by quantity ordered, for the last N days.
 */
export async function getTopDishes(
  restaurantId: string,
  limit = 5,
  days = 30,
): Promise<TopDish[]> {
  if (!hasDatabase()) return MOCK_ANALYTICS.topDishes;

  const since = new Date();
  since.setDate(since.getDate() - days);

  const rows = await db
    .select({
      name: orderItems.itemName,
      sales: sum(orderItems.quantity).as("sales"),
      revenue: sum(orderItems.lineTotal).as("revenue"),
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(
      and(eq(orders.restaurantId, restaurantId), gte(orders.createdAt, since)),
    )
    .groupBy(orderItems.itemName)
    .orderBy(desc(sql`sales`))
    .limit(limit);

  return rows.map((r) => ({
    name: r.name,
    sales: Number(r.sales ?? 0),
    revenue: koboToNaira(Number(r.revenue ?? 0)),
  }));
}

/**
 * Compute payment method breakdown as percentages for a pie chart.
 */
export async function getPaymentMethodBreakdown(
  restaurantId: string,
): Promise<PaymentMethodBreakdown[]> {
  if (!hasDatabase()) return MOCK_ANALYTICS.paymentMethods;

  const rows = await db
    .select({
      method: payments.method,
      count: count(payments.id).as("count"),
    })
    .from(payments)
    .where(
      and(
        eq(payments.restaurantId, restaurantId),
        eq(payments.status, "confirmed"),
      ),
    )
    .groupBy(payments.method);

  const total = rows.reduce((s, r) => s + Number(r.count), 0);
  if (total === 0) return [];

  const labels: Record<string, string> = {
    bank_transfer: "Bank Transfer",
    card: "Card",
    ussd: "USSD",
    cash: "Cash",
  };

  return rows.map((r) => ({
    name: labels[r.method] ?? r.method,
    value: Math.round((Number(r.count) / total) * 100),
  }));
}

/**
 * Aggregate all analytics in a single call (for the dashboard overview page).
 */
export async function getDashboardAnalytics(
  restaurantId: string,
): Promise<DashboardAnalytics> {
  if (!hasDatabase()) return MOCK_ANALYTICS;

  const [revenueTrend, topDishes, paymentMethods] = await Promise.all([
    getRevenueTrend(restaurantId),
    getTopDishes(restaurantId),
    getPaymentMethodBreakdown(restaurantId),
  ]);

  return { revenueTrend, topDishes, paymentMethods };
}
