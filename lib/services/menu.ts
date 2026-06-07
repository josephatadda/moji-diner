import "server-only";

import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  menuCategories,
  menuItems,
  modifierGroups,
  modifierOptions,
} from "@/lib/db/schema";
import type {
  MenuItemRow,
  ModifierGroupRow,
  ModifierOptionRow,
} from "@/lib/db/schema/restaurant";
import type {
  CategoryCreateInput,
  CategoryUpdateInput,
  MenuItemCreateInput,
  MenuItemUpdateInput,
} from "@/lib/domain/menu";
import { koboToNaira, nairaToKobo } from "@/lib/domain/money";
import { hasDatabase } from "@/lib/env";
import {
  type Allergen,
  type MenuCategory,
  type MenuItem,
  MOCK_MENU,
  type ModifierGroup,
  type Tag,
} from "@/lib/mockData";
import { resolveRestaurantIdBySlug } from "@/lib/services/restaurant-context";

/**
 * Menu read service. DB mode assembles categories → items → modifier groups →
 * options and converts kobo→naira at the boundary. Mock-fallback mode returns
 * MOCK_MENU (already in naira) unchanged so the preview is unaffected.
 */

function buildItem(
  row: MenuItemRow,
  groups: ModifierGroupRow[],
  optionsByGroup: Map<string, ModifierOptionRow[]>,
): MenuItem {
  return {
    id: row.id,
    categoryId: row.categoryId,
    name: row.name,
    description: row.description,
    price: koboToNaira(row.price),
    photoUrl: row.photoUrl ?? undefined,
    isAvailable: row.isAvailable,
    isFeatured: row.isFeatured,
    tags: row.tags as Tag[],
    allergens: row.allergens as Allergen[],
    preparationTimeMins: row.preparationTimeMins,
    sortOrder: row.sortOrder,
    modifierGroups: groups
      .filter((g) => g.menuItemId === row.id)
      .map(
        (g): ModifierGroup => ({
          id: g.id,
          name: g.name,
          required: g.required,
          minSelections: g.minSelections,
          maxSelections: g.maxSelections,
          options: (optionsByGroup.get(g.id) ?? []).map((o) => ({
            id: o.id,
            name: o.name,
            priceDelta: koboToNaira(o.priceDelta),
          })),
        }),
      ),
  };
}

/** Full menu (categories with nested items + modifiers) for a restaurant id. */
export async function getMenuByRestaurantId(
  restaurantId: string,
): Promise<MenuCategory[]> {
  const categories = await db
    .select()
    .from(menuCategories)
    .where(eq(menuCategories.restaurantId, restaurantId))
    .orderBy(asc(menuCategories.sortOrder));

  if (categories.length === 0) return [];

  const items = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.restaurantId, restaurantId))
    .orderBy(asc(menuItems.sortOrder));

  const itemIds = items.map((i) => i.id);
  const groups = itemIds.length
    ? await db
        .select()
        .from(modifierGroups)
        .where(inArray(modifierGroups.menuItemId, itemIds))
        .orderBy(asc(modifierGroups.sortOrder))
    : [];

  const groupIds = groups.map((g) => g.id);
  const options = groupIds.length
    ? await db
        .select()
        .from(modifierOptions)
        .where(inArray(modifierOptions.groupId, groupIds))
        .orderBy(asc(modifierOptions.sortOrder))
    : [];

  const optionsByGroup = new Map<string, ModifierOptionRow[]>();
  for (const o of options) {
    const list = optionsByGroup.get(o.groupId) ?? [];
    list.push(o);
    optionsByGroup.set(o.groupId, list);
  }

  return categories.map(
    (cat): MenuCategory => ({
      id: cat.id,
      restaurantId: cat.restaurantId,
      name: cat.name,
      description: cat.description ?? undefined,
      sortOrder: cat.sortOrder,
      items: items
        .filter((i) => i.categoryId === cat.id)
        .map((i) => buildItem(i, groups, optionsByGroup)),
    }),
  );
}

/** Full menu by public slug (diner side). Mock-fallback safe. */
export async function getMenuBySlug(slug: string): Promise<MenuCategory[]> {
  if (!hasDatabase()) return MOCK_MENU;
  const restaurantId = await resolveRestaurantIdBySlug(slug);
  if (!restaurantId) return [];
  return getMenuByRestaurantId(restaurantId);
}

// ── Writes (dashboard CRUD) ────────────────────────────────────────────────
// Callers must already be authorized to `restaurantId` (via restaurant-context)
// and must only run these in DB mode. All writes are scoped by restaurantId so
// a member can never mutate another tenant's menu.

/** Confirm a category belongs to the restaurant (tenant guard). */
async function categoryInRestaurant(
  categoryId: string,
  restaurantId: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: menuCategories.id })
    .from(menuCategories)
    .where(eq(menuCategories.id, categoryId))
    .limit(1);
  if (!row) return false;
  const [owned] = await db
    .select({ id: menuCategories.id })
    .from(menuCategories)
    .where(
      and(
        eq(menuCategories.id, categoryId),
        eq(menuCategories.restaurantId, restaurantId),
      ),
    )
    .limit(1);
  return Boolean(owned);
}

export async function createCategory(
  restaurantId: string,
  input: CategoryCreateInput,
): Promise<string> {
  const [row] = await db
    .insert(menuCategories)
    .values({
      restaurantId,
      name: input.name,
      description: input.description ?? null,
    })
    .returning({ id: menuCategories.id });
  return row.id;
}

export async function updateCategory(
  restaurantId: string,
  categoryId: string,
  input: CategoryUpdateInput,
): Promise<boolean> {
  const result = await db
    .update(menuCategories)
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined
        ? { description: input.description ?? null }
        : {}),
    })
    .where(
      and(
        eq(menuCategories.id, categoryId),
        eq(menuCategories.restaurantId, restaurantId),
      ),
    )
    .returning({ id: menuCategories.id });
  return result.length > 0;
}

export async function deleteCategory(
  restaurantId: string,
  categoryId: string,
): Promise<boolean> {
  const result = await db
    .delete(menuCategories)
    .where(
      and(
        eq(menuCategories.id, categoryId),
        eq(menuCategories.restaurantId, restaurantId),
      ),
    )
    .returning({ id: menuCategories.id });
  return result.length > 0;
}

export async function createMenuItem(
  restaurantId: string,
  input: MenuItemCreateInput,
): Promise<string | null> {
  // Tenant guard: the target category must belong to this restaurant.
  if (!(await categoryInRestaurant(input.categoryId, restaurantId))) {
    return null;
  }
  const [row] = await db
    .insert(menuItems)
    .values({
      restaurantId,
      categoryId: input.categoryId,
      name: input.name,
      description: input.description,
      price: nairaToKobo(input.price),
      isAvailable: input.isAvailable,
      isFeatured: input.isFeatured,
      preparationTimeMins: input.preparationTimeMins,
      tags: input.tags,
      allergens: input.allergens,
    })
    .returning({ id: menuItems.id });
  return row.id;
}

export async function updateMenuItem(
  restaurantId: string,
  itemId: string,
  input: MenuItemUpdateInput,
): Promise<boolean> {
  const result = await db
    .update(menuItems)
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.price !== undefined ? { price: nairaToKobo(input.price) } : {}),
      ...(input.isAvailable !== undefined
        ? { isAvailable: input.isAvailable }
        : {}),
      ...(input.isFeatured !== undefined
        ? { isFeatured: input.isFeatured }
        : {}),
      ...(input.preparationTimeMins !== undefined
        ? { preparationTimeMins: input.preparationTimeMins }
        : {}),
      ...(input.tags !== undefined ? { tags: input.tags } : {}),
      ...(input.allergens !== undefined ? { allergens: input.allergens } : {}),
    })
    .where(
      and(eq(menuItems.id, itemId), eq(menuItems.restaurantId, restaurantId)),
    )
    .returning({ id: menuItems.id });
  return result.length > 0;
}

export async function deleteMenuItem(
  restaurantId: string,
  itemId: string,
): Promise<boolean> {
  const result = await db
    .delete(menuItems)
    .where(
      and(eq(menuItems.id, itemId), eq(menuItems.restaurantId, restaurantId)),
    )
    .returning({ id: menuItems.id });
  return result.length > 0;
}

export async function setMenuItemAvailability(
  restaurantId: string,
  itemId: string,
  isAvailable: boolean,
): Promise<boolean> {
  return updateMenuItem(restaurantId, itemId, { isAvailable });
}
