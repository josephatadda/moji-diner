"use server";

import { revalidatePath } from "next/cache";
import {
  batchCreateTablesSchema,
  createTableSchema,
  updateTableSchema,
} from "@/lib/domain/tables";
import { hasDatabase } from "@/lib/env";
import { err, fail, ok, type Result } from "@/lib/result";
import { requireRestaurantContext } from "@/lib/services/restaurant-context";
import {
  batchCreateTables,
  createTable,
  deleteTable,
  listTables,
  updateTable,
} from "@/lib/services/tables";

/**
 * Dashboard table actions — secured with requireRestaurantContext().
 * Write operations require a database; reads fall back to mock data.
 */

function dbRequired(): Result<never> | null {
  return hasDatabase()
    ? null
    : err("unavailable", "Connect a database to manage tables.");
}

// ── Reads ─────────────────────────────────────────────────────────────────────

export async function listTablesAction(): Promise<
  Result<{ tables: Awaited<ReturnType<typeof listTables>> }>
> {
  try {
    const ctx = await requireRestaurantContext();
    if (!ctx.ok) return ctx;

    const tables = await listTables(ctx.data.restaurantId);
    return ok({ tables });
  } catch (error) {
    return fail(error, "listTablesAction");
  }
}

// ── Writes ────────────────────────────────────────────────────────────────────

export async function createTableAction(input: {
  tableNumber: number;
  label: string;
  capacity?: number;
}): Promise<Result<{ id: string }>> {
  try {
    const ctx = await requireRestaurantContext();
    if (!ctx.ok) return ctx;
    const gate = dbRequired();
    if (gate) return gate;

    const parsed = createTableSchema.safeParse(input);
    if (!parsed.success) {
      return err("validation", "Invalid table data.");
    }

    const id = await createTable(ctx.data.restaurantId, parsed.data);
    revalidatePath("/dashboard/tables");
    return ok({ id });
  } catch (error) {
    return fail(error, "createTableAction");
  }
}

export async function batchCreateTablesAction(input: {
  count: number;
  startFrom?: number;
  capacity?: number;
}): Promise<Result<{ ids: string[] }>> {
  try {
    const ctx = await requireRestaurantContext();
    if (!ctx.ok) return ctx;
    const gate = dbRequired();
    if (gate) return gate;

    const parsed = batchCreateTablesSchema.safeParse(input);
    if (!parsed.success) {
      return err("validation", "Invalid batch table data.");
    }

    const ids = await batchCreateTables(ctx.data.restaurantId, parsed.data);
    revalidatePath("/dashboard/tables");
    return ok({ ids });
  } catch (error) {
    return fail(error, "batchCreateTablesAction");
  }
}

export async function updateTableAction(
  tableId: string,
  input: { label?: string; capacity?: number; status?: string },
): Promise<Result<{ id: string }>> {
  try {
    const ctx = await requireRestaurantContext();
    if (!ctx.ok) return ctx;
    const gate = dbRequired();
    if (gate) return gate;

    const parsed = updateTableSchema.safeParse(input);
    if (!parsed.success) {
      return err("validation", "Invalid table update.");
    }

    const updated = await updateTable(
      ctx.data.restaurantId,
      tableId,
      parsed.data,
    );
    if (!updated) return err("not_found");

    revalidatePath("/dashboard/tables");
    return ok({ id: tableId });
  } catch (error) {
    return fail(error, "updateTableAction");
  }
}

export async function deleteTableAction(
  tableId: string,
): Promise<Result<{ id: string }>> {
  try {
    const ctx = await requireRestaurantContext();
    if (!ctx.ok) return ctx;
    const gate = dbRequired();
    if (gate) return gate;

    const deleted = await deleteTable(ctx.data.restaurantId, tableId);
    if (!deleted) return err("not_found");

    revalidatePath("/dashboard/tables");
    return ok({ id: tableId });
  } catch (error) {
    return fail(error, "deleteTableAction");
  }
}
