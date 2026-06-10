import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { restaurantTables } from "@/lib/db/schema";
import type { RestaurantTableRow } from "@/lib/db/schema/restaurant";
import type {
  BatchCreateTablesInput,
  CreateTableInput,
  UpdateTableInput,
} from "@/lib/domain/tables";
import { hasDatabase } from "@/lib/env";
import { MOCK_TABLES, type RestaurantTable } from "@/lib/mockData";

// ── Type mapper ───────────────────────────────────────────────────────────────

function toTable(row: RestaurantTableRow): RestaurantTable {
  return {
    id: row.id,
    restaurantId: row.restaurantId,
    tableNumber: row.tableNumber,
    label: row.label,
    capacity: row.capacity,
    status: row.status as RestaurantTable["status"],
  };
}

// ── Reads ─────────────────────────────────────────────────────────────────────

/**
 * List all tables for a restaurant, ordered by table number.
 * Falls back to mock data when no database is configured.
 */
export async function listTables(
  restaurantId: string,
): Promise<RestaurantTable[]> {
  if (!hasDatabase()) return MOCK_TABLES;

  const rows = await db
    .select()
    .from(restaurantTables)
    .where(eq(restaurantTables.restaurantId, restaurantId))
    .orderBy(asc(restaurantTables.tableNumber));

  return rows.map(toTable);
}

/**
 * Resolve a single table by its number for a given restaurant.
 * Used by the diner QR flow to validate the scan target.
 */
export async function getTableByNumber(
  restaurantId: string,
  tableNumber: number,
): Promise<RestaurantTable | null> {
  if (!hasDatabase()) {
    return MOCK_TABLES.find((t) => t.tableNumber === tableNumber) ?? null;
  }

  const [row] = await db
    .select()
    .from(restaurantTables)
    .where(
      and(
        eq(restaurantTables.restaurantId, restaurantId),
        eq(restaurantTables.tableNumber, tableNumber),
      ),
    )
    .limit(1);

  return row ? toTable(row) : null;
}

// ── Writes ────────────────────────────────────────────────────────────────────

/**
 * Create a single table. Returns the new table's id.
 * Callers must already be authorized to the restaurantId.
 */
export async function createTable(
  restaurantId: string,
  input: CreateTableInput,
): Promise<string> {
  const [row] = await db
    .insert(restaurantTables)
    .values({
      restaurantId,
      tableNumber: input.tableNumber,
      label: input.label,
      capacity: input.capacity,
    })
    .returning({ id: restaurantTables.id });
  return row.id;
}

/**
 * Create multiple tables sequentially, numbered from `startFrom`.
 * Used by the onboarding wizard and batch-add flows.
 */
export async function batchCreateTables(
  restaurantId: string,
  input: BatchCreateTablesInput,
): Promise<string[]> {
  const rows = await db
    .insert(restaurantTables)
    .values(
      Array.from({ length: input.count }, (_, i) => ({
        restaurantId,
        tableNumber: input.startFrom + i,
        label: `Table ${input.startFrom + i}`,
        capacity: input.capacity,
      })),
    )
    .returning({ id: restaurantTables.id });

  return rows.map((r) => r.id);
}

/**
 * Update a table's label, capacity, or status.
 * Returns true if the table was found and updated.
 */
export async function updateTable(
  restaurantId: string,
  tableId: string,
  input: UpdateTableInput,
): Promise<boolean> {
  const result = await db
    .update(restaurantTables)
    .set({
      ...(input.label !== undefined ? { label: input.label } : {}),
      ...(input.capacity !== undefined ? { capacity: input.capacity } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    })
    .where(
      and(
        eq(restaurantTables.id, tableId),
        eq(restaurantTables.restaurantId, restaurantId),
      ),
    )
    .returning({ id: restaurantTables.id });

  return result.length > 0;
}

/**
 * Delete a table. Returns true if found and deleted.
 * Only allowed when the table has no active (unpaid) orders — enforced by the action.
 */
export async function deleteTable(
  restaurantId: string,
  tableId: string,
): Promise<boolean> {
  const result = await db
    .delete(restaurantTables)
    .where(
      and(
        eq(restaurantTables.id, tableId),
        eq(restaurantTables.restaurantId, restaurantId),
      ),
    )
    .returning({ id: restaurantTables.id });

  return result.length > 0;
}
