import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { restaurants } from "@/lib/db/schema";
import type { RestaurantRow } from "@/lib/db/schema/restaurant";
import { hasDatabase } from "@/lib/env";
import { MOCK_RESTAURANT, type Restaurant } from "@/lib/mockData";

/**
 * Restaurant read service (diner + dashboard).
 *
 * DB mode: looks up by slug. Mock-fallback mode (no DATABASE_URL): returns the
 * seeded demo restaurant so the preview works unchanged. Maps the DB row to the
 * public `Restaurant` contract and never exposes internal/sensitive columns
 * (bank details are intentionally omitted here — see getRestaurantPaymentInfo).
 */

function toRestaurant(row: RestaurantRow): Restaurant {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    logoUrl: row.logoUrl ?? undefined,
    coverImageUrl: row.coverImageUrl ?? undefined,
    isAcceptingOrders: row.isAcceptingOrders,
    currency: row.currency,
    vatEnabled: row.vatEnabled,
    vatRate: row.vatRate,
    city: row.city,
    phone: row.phone,
    loyaltyEnabled: row.loyaltyEnabled,
  };
}

/** Resolve a restaurant by its public slug. Returns null if not found. */
export async function getRestaurantBySlug(
  slug: string,
): Promise<Restaurant | null> {
  if (!hasDatabase()) {
    // Single-restaurant demo: serve the mock regardless of slug.
    return MOCK_RESTAURANT;
  }
  const [row] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.slug, slug))
    .limit(1);
  return row ? toRestaurant(row) : null;
}

/** Bank details shown to diners on the bill (self-reported payment). */
export async function getRestaurantPaymentInfo(restaurantId: string): Promise<{
  bankName: string | null;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
} | null> {
  if (!hasDatabase()) {
    return {
      bankName: "GTBank",
      bankAccountName: "Moji Restaurant",
      bankAccountNumber: "0123456789",
    };
  }
  const [row] = await db
    .select({
      bankName: restaurants.bankName,
      bankAccountName: restaurants.bankAccountName,
      bankAccountNumber: restaurants.bankAccountNumber,
    })
    .from(restaurants)
    .where(eq(restaurants.id, restaurantId))
    .limit(1);
  return row ?? null;
}
