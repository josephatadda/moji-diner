"use server";

import { revalidatePath } from "next/cache";
import {
  categoryCreateSchema,
  categoryUpdateSchema,
  menuItemCreateSchema,
  menuItemUpdateSchema,
  uuid,
  zodFieldErrors,
} from "@/lib/domain/menu";
import { hasDatabase } from "@/lib/env";
import { err, fail, ok, type Result } from "@/lib/result";
import {
  createCategory,
  createMenuItem,
  deleteCategory,
  deleteMenuItem,
  setMenuItemAvailability,
  updateCategory,
  updateMenuItem,
} from "@/lib/services/menu";
import { requireRestaurantContext } from "@/lib/services/restaurant-context";

/**
 * Dashboard menu mutations. Every action:
 *   1. requires an authenticated owner/member (requireRestaurantContext),
 *   2. validates input with zod (safe field errors only),
 *   3. scopes the write to the caller's restaurantId (tenant isolation),
 *   4. returns a safe Result — internal errors are logged, never leaked.
 *
 * Persistence requires a database; in mock-fallback mode they return
 * `unavailable` (the dashboard keeps its local demo state until a DB is set).
 */

function dbRequired(): Result<never> | null {
  return hasDatabase()
    ? null
    : err("unavailable", "Connect a database to manage the menu.");
}

export async function createCategoryAction(input: {
  name: string;
  description?: string;
}): Promise<Result<{ id: string }>> {
  try {
    const ctx = await requireRestaurantContext();
    if (!ctx.ok) return ctx;
    const gate = dbRequired();
    if (gate) return gate;

    const parsed = categoryCreateSchema.safeParse(input);
    if (!parsed.success) {
      return err("validation", undefined, zodFieldErrors(parsed.error));
    }

    const id = await createCategory(ctx.data.restaurantId, parsed.data);
    revalidatePath("/dashboard/menu");
    return ok({ id });
  } catch (error) {
    return fail(error, "createCategoryAction");
  }
}

export async function updateCategoryAction(
  categoryId: string,
  input: { name?: string; description?: string },
): Promise<Result<{ id: string }>> {
  try {
    const ctx = await requireRestaurantContext();
    if (!ctx.ok) return ctx;
    const gate = dbRequired();
    if (gate) return gate;

    if (!uuid.safeParse(categoryId).success) return err("not_found");
    const parsed = categoryUpdateSchema.safeParse(input);
    if (!parsed.success) {
      return err("validation", undefined, zodFieldErrors(parsed.error));
    }

    const updated = await updateCategory(
      ctx.data.restaurantId,
      categoryId,
      parsed.data,
    );
    if (!updated) return err("not_found");
    revalidatePath("/dashboard/menu");
    return ok({ id: categoryId });
  } catch (error) {
    return fail(error, "updateCategoryAction");
  }
}

export async function deleteCategoryAction(
  categoryId: string,
): Promise<Result<{ id: string }>> {
  try {
    const ctx = await requireRestaurantContext();
    if (!ctx.ok) return ctx;
    const gate = dbRequired();
    if (gate) return gate;

    if (!uuid.safeParse(categoryId).success) return err("not_found");
    const deleted = await deleteCategory(ctx.data.restaurantId, categoryId);
    if (!deleted) return err("not_found");
    revalidatePath("/dashboard/menu");
    return ok({ id: categoryId });
  } catch (error) {
    return fail(error, "deleteCategoryAction");
  }
}

export async function createMenuItemAction(input: {
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  isAvailable?: boolean;
  isFeatured?: boolean;
  preparationTimeMins?: number;
  tags?: string[];
  allergens?: string[];
}): Promise<Result<{ id: string }>> {
  try {
    const ctx = await requireRestaurantContext();
    if (!ctx.ok) return ctx;
    const gate = dbRequired();
    if (gate) return gate;

    const parsed = menuItemCreateSchema.safeParse(input);
    if (!parsed.success) {
      return err("validation", undefined, zodFieldErrors(parsed.error));
    }

    const id = await createMenuItem(ctx.data.restaurantId, parsed.data);
    if (!id) return err("not_found", "That category was not found.");
    revalidatePath("/dashboard/menu");
    return ok({ id });
  } catch (error) {
    return fail(error, "createMenuItemAction");
  }
}

export async function updateMenuItemAction(
  itemId: string,
  input: Record<string, unknown>,
): Promise<Result<{ id: string }>> {
  try {
    const ctx = await requireRestaurantContext();
    if (!ctx.ok) return ctx;
    const gate = dbRequired();
    if (gate) return gate;

    if (!uuid.safeParse(itemId).success) return err("not_found");
    const parsed = menuItemUpdateSchema.safeParse(input);
    if (!parsed.success) {
      return err("validation", undefined, zodFieldErrors(parsed.error));
    }

    const updated = await updateMenuItem(
      ctx.data.restaurantId,
      itemId,
      parsed.data,
    );
    if (!updated) return err("not_found");
    revalidatePath("/dashboard/menu");
    return ok({ id: itemId });
  } catch (error) {
    return fail(error, "updateMenuItemAction");
  }
}

export async function deleteMenuItemAction(
  itemId: string,
): Promise<Result<{ id: string }>> {
  try {
    const ctx = await requireRestaurantContext();
    if (!ctx.ok) return ctx;
    const gate = dbRequired();
    if (gate) return gate;

    if (!uuid.safeParse(itemId).success) return err("not_found");
    const deleted = await deleteMenuItem(ctx.data.restaurantId, itemId);
    if (!deleted) return err("not_found");
    revalidatePath("/dashboard/menu");
    return ok({ id: itemId });
  } catch (error) {
    return fail(error, "deleteMenuItemAction");
  }
}

export async function toggleMenuItemAvailabilityAction(
  itemId: string,
  isAvailable: boolean,
): Promise<Result<{ id: string }>> {
  try {
    const ctx = await requireRestaurantContext();
    if (!ctx.ok) return ctx;
    const gate = dbRequired();
    if (gate) return gate;

    if (!uuid.safeParse(itemId).success) return err("not_found");
    const updated = await setMenuItemAvailability(
      ctx.data.restaurantId,
      itemId,
      isAvailable,
    );
    if (!updated) return err("not_found");
    revalidatePath("/dashboard/menu");
    return ok({ id: itemId });
  } catch (error) {
    return fail(error, "toggleMenuItemAvailabilityAction");
  }
}
