import "server-only";

import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  menuItems,
  orderItems,
  orders,
  restaurants,
  restaurantTables,
} from "@/lib/db/schema";
import type { OrderItemRow, OrderRow } from "@/lib/db/schema/restaurant";
import { koboToNaira, nairaToKobo } from "@/lib/domain/money";
import type {
  OrderStatus,
  PlaceOrderInput,
  UpdateOrderStatusInput,
} from "@/lib/domain/orders";
import { hasDatabase } from "@/lib/env";
import { MOCK_ORDERS, type Order, type OrderItem } from "@/lib/mockData";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { err, fail, ok, type Result } from "@/lib/result";

// ── Internal types ────────────────────────────────────────────────────────────

/** Intermediate shape for resolved order items before DB insert. */
type ResolvedOrderItem = {
  menuItemId: string;
  itemName: string;
  itemPrice: number; // kobo
  quantity: number;
  selectedModifiers: PlaceOrderInput["items"][number]["selectedModifiers"];
  specialNote: string | null;
  lineTotal: number; // kobo
};

// ── Type mappers ──────────────────────────────────────────────────────────────

/** Map a DB order row + item rows → the public Order contract (naira). */
function buildOrder(row: OrderRow, itemRows: OrderItemRow[]): Order {
  return {
    id: row.id,
    restaurantId: row.restaurantId,
    tableId: row.tableId ?? "",
    tableNumber: row.tableNumber,
    status: row.status as Order["status"],
    source: row.source as Order["source"],
    subtotal: koboToNaira(row.subtotal),
    vatAmount: koboToNaira(row.vatAmount),
    grandTotal: koboToNaira(row.grandTotal),
    dinerPhone: row.dinerPhone ?? undefined,
    estimatedReadyMins: row.estimatedReadyMins,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    items: itemRows.map(
      (i): OrderItem => ({
        id: i.id,
        menuItemId: i.menuItemId ?? "",
        itemName: i.itemName,
        itemPrice: koboToNaira(i.itemPrice),
        quantity: i.quantity,
        selectedModifiers:
          i.selectedModifiers as OrderItem["selectedModifiers"],
        specialNote: i.specialNote ?? undefined,
        lineTotal: koboToNaira(i.lineTotal),
      }),
    ),
  };
}

/**
 * Fetch order items for a set of order IDs and group them by order id.
 * Used by both listActiveOrders and listOrders to avoid N+1 queries.
 */
async function fetchItemsByOrderIds(
  orderIds: string[],
): Promise<Map<string, OrderItemRow[]>> {
  const itemRows = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds));

  const map = new Map<string, OrderItemRow[]>();
  for (const item of itemRows) {
    const list = map.get(item.orderId) ?? [];
    list.push(item);
    map.set(item.orderId, list);
  }
  return map;
}

// ── Reads ─────────────────────────────────────────────────────────────────────

/**
 * List all active orders (pending/in_kitchen/ready) for the kitchen dashboard.
 * Returns mock data when no database is configured.
 */
export async function listActiveOrders(restaurantId: string): Promise<Order[]> {
  if (!hasDatabase()) return MOCK_ORDERS.filter((o) => o.status !== "paid");

  const activeStatuses: OrderStatus[] = ["pending", "in_kitchen", "ready"];

  const rows = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.restaurantId, restaurantId),
        inArray(orders.status, activeStatuses),
      ),
    )
    .orderBy(asc(orders.createdAt));

  if (rows.length === 0) return [];

  const itemsByOrder = await fetchItemsByOrderIds(rows.map((r) => r.id));
  return rows.map((r) => buildOrder(r, itemsByOrder.get(r.id) ?? []));
}

/**
 * List all orders for a restaurant (full history), newest first.
 * Used by the dashboard orders history view.
 */
export async function listOrders(
  restaurantId: string,
  limit = 50,
): Promise<Order[]> {
  if (!hasDatabase()) return MOCK_ORDERS;

  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.restaurantId, restaurantId))
    .orderBy(desc(orders.createdAt))
    .limit(limit);

  if (rows.length === 0) return [];

  const itemsByOrder = await fetchItemsByOrderIds(rows.map((r) => r.id));
  return rows.map((r) => buildOrder(r, itemsByOrder.get(r.id) ?? []));
}

// ── Writes ────────────────────────────────────────────────────────────────────

/**
 * Place a new order for a diner (called from the public diner API route).
 *
 * Security model:
 *  - Rate-limited per IP (10 orders / 10 minutes).
 *  - Prices are re-validated from the DB — client-supplied amounts are ignored.
 *  - restaurantId is resolved from slug, never accepted from the client.
 *  - VAT is computed server-side using the restaurant's configured rate.
 */
export async function placeOrder(
  input: PlaceOrderInput,
  requestHeaders: Headers,
): Promise<Result<{ orderId: string }>> {
  // Rate limiting — protect against automated abuse
  const ip = clientIpFromHeaders(requestHeaders);
  if (!rateLimit(`place-order:${ip}`, 10, 10 * 60 * 1000)) {
    return err("rate_limited");
  }

  if (!hasDatabase()) {
    // Mock mode: simulate a successful order placement
    return ok({ orderId: `mock-ord-${Date.now()}` });
  }

  try {
    // 1. Resolve restaurant from slug (never trust a client-provided restaurantId)
    const [restaurant] = await db
      .select({
        id: restaurants.id,
        vatEnabled: restaurants.vatEnabled,
        vatRate: restaurants.vatRate,
      })
      .from(restaurants)
      .where(eq(restaurants.slug, input.restaurantSlug))
      .limit(1);

    if (!restaurant) return err("not_found", "Restaurant not found.");

    // 2. Resolve table by number for this restaurant
    const [table] = await db
      .select({ id: restaurantTables.id })
      .from(restaurantTables)
      .where(
        and(
          eq(restaurantTables.restaurantId, restaurant.id),
          eq(restaurantTables.tableNumber, input.tableNumber),
        ),
      )
      .limit(1);

    if (!table) return err("not_found", "Table not found.");

    // 3. Fetch authoritative prices and availability from DB in one query
    const menuItemIds = input.items.map((i) => i.menuItemId);
    const dbItems = await db
      .select({
        id: menuItems.id,
        name: menuItems.name,
        price: menuItems.price,
        isAvailable: menuItems.isAvailable,
      })
      .from(menuItems)
      .where(
        and(
          inArray(menuItems.id, menuItemIds),
          eq(menuItems.restaurantId, restaurant.id),
        ),
      );

    const itemIndex = new Map(dbItems.map((i) => [i.id, i]));

    // 4. Validate each item and compute server-authoritative totals
    let subtotalKobo = 0;
    const resolvedItems: ResolvedOrderItem[] = [];

    for (const item of input.items) {
      const dbItem = itemIndex.get(item.menuItemId);
      if (!dbItem)
        return err("not_found", "A selected menu item was not found.");
      if (!dbItem.isAvailable) {
        return err("unavailable", `"${dbItem.name}" is currently unavailable.`);
      }

      const modifierDeltaKobo = Object.values(item.selectedModifiers)
        .flat()
        .reduce((sum, m) => sum + nairaToKobo(m.priceDelta), 0);

      const lineTotalKobo = (dbItem.price + modifierDeltaKobo) * item.quantity;
      subtotalKobo += lineTotalKobo;

      resolvedItems.push({
        menuItemId: item.menuItemId,
        itemName: dbItem.name,
        itemPrice: dbItem.price,
        quantity: item.quantity,
        selectedModifiers: item.selectedModifiers,
        specialNote: item.specialNote ?? null,
        lineTotal: lineTotalKobo,
      });
    }

    // 5. Compute VAT server-side
    const vatAmountKobo = restaurant.vatEnabled
      ? Math.round(subtotalKobo * (restaurant.vatRate / 100))
      : 0;
    const grandTotalKobo = subtotalKobo + vatAmountKobo;

    // 6. Persist order + items atomically
    const result = await db.transaction(async (tx) => {
      const [order] = await tx
        .insert(orders)
        .values({
          restaurantId: restaurant.id,
          tableId: table.id,
          tableNumber: input.tableNumber,
          status: "pending",
          subtotal: subtotalKobo,
          vatAmount: vatAmountKobo,
          grandTotal: grandTotalKobo,
          source: input.source,
          dinerPhone: input.dinerPhone ?? null,
          estimatedReadyMins: 25, // default; kitchen can adjust
        })
        .returning({ id: orders.id });

      await tx.insert(orderItems).values(
        resolvedItems.map((i) => ({
          orderId: order.id,
          menuItemId: i.menuItemId,
          itemName: i.itemName,
          itemPrice: i.itemPrice,
          quantity: i.quantity,
          selectedModifiers: i.selectedModifiers,
          specialNote: i.specialNote,
          lineTotal: i.lineTotal,
        })),
      );

      return { orderId: order.id };
    });

    return ok(result);
  } catch (error) {
    return fail(error, "placeOrder");
  }
}

/**
 * Update an order's status (kitchen/staff dashboard action).
 * Always scoped to the caller's restaurantId — cross-tenant mutation is impossible.
 * Returns true if the order was found and updated, false if not found.
 */
export async function updateOrderStatus(
  restaurantId: string,
  input: UpdateOrderStatusInput,
): Promise<boolean> {
  const result = await db
    .update(orders)
    .set({ status: input.status, updatedAt: sql`now()` })
    .where(
      and(eq(orders.id, input.orderId), eq(orders.restaurantId, restaurantId)),
    )
    .returning({ id: orders.id });

  return result.length > 0;
}
