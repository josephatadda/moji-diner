import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { restaurantMembers, restaurants } from "@/lib/db/schema";
import { hasDatabase } from "@/lib/env";
import { err, ok, type Result } from "@/lib/result";
import { requireUser } from "@/lib/services/auth";

/**
 * Authorization core for the dashboard.
 *
 * Every dashboard action must resolve the acting owner's restaurant through
 * this module and scope all subsequent queries to the returned `restaurantId`.
 * The client never supplies a trusted restaurantId — it is derived from the
 * authenticated session + membership table here.
 */

export type RestaurantContext = {
  userId: string;
  restaurantId: string;
  role: "owner" | "manager" | "staff";
};

/**
 * Resolve the authenticated user's restaurant membership.
 * - Returns `unauthorized` if not signed in.
 * - Returns `forbidden` if the user owns/belongs to no restaurant.
 * - If `restaurantId` is provided, verifies the user is a member of THAT
 *   restaurant (defends against cross-tenant access via a forged id).
 */
export async function requireRestaurantContext(
  restaurantId?: string,
): Promise<Result<RestaurantContext>> {
  const user = await requireUser(); // throws "UNAUTHORIZED" -> mapped by fail()

  // Mock-fallback mode: no DB configured. The dashboard demo runs against the
  // single seeded restaurant; treat the signed-in user as its owner.
  if (!hasDatabase()) {
    return ok({
      userId: user.id,
      restaurantId: restaurantId ?? "mock-restaurant",
      role: "owner",
    });
  }

  const rows = await db
    .select({
      restaurantId: restaurantMembers.restaurantId,
      role: restaurantMembers.role,
    })
    .from(restaurantMembers)
    .where(eq(restaurantMembers.userId, user.id));

  if (rows.length === 0) return err("forbidden");

  if (restaurantId) {
    const match = rows.find((r) => r.restaurantId === restaurantId);
    if (!match) return err("forbidden");
    return ok({ userId: user.id, restaurantId, role: match.role });
  }

  // Default to the user's first restaurant (single-restaurant owners).
  const first = rows[0];
  return ok({
    userId: user.id,
    restaurantId: first.restaurantId,
    role: first.role,
  });
}

/** Resolve a restaurant id from a public slug (diner side). DB-or-null. */
export async function resolveRestaurantIdBySlug(
  slug: string,
): Promise<string | null> {
  if (!hasDatabase()) return null;
  const [row] = await db
    .select({ id: restaurants.id })
    .from(restaurants)
    .where(eq(restaurants.slug, slug))
    .limit(1);
  return row?.id ?? null;
}

/** True if the given user is a member of the given restaurant. */
export async function isMember(
  userId: string,
  restaurantId: string,
): Promise<boolean> {
  if (!hasDatabase()) return true;
  const [row] = await db
    .select({ userId: restaurantMembers.userId })
    .from(restaurantMembers)
    .where(
      and(
        eq(restaurantMembers.userId, userId),
        eq(restaurantMembers.restaurantId, restaurantId),
      ),
    )
    .limit(1);
  return Boolean(row);
}
