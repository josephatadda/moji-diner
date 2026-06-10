import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { restaurantSettings, restaurants } from "@/lib/db/schema";
import type {
  Features,
  UpdateRestaurantProfileInput,
  UpdateServiceChargeInput,
} from "@/lib/domain/settings";
import { hasDatabase } from "@/lib/env";
import { MOCK_RESTAURANT } from "@/lib/mockData";
import { err, fail, ok, type Result } from "@/lib/result";

// ── Read types ────────────────────────────────────────────────────────────────

export type RestaurantProfile = {
  id: string;
  name: string;
  slug: string;
  description: string;
  city: string;
  phone: string;
  logoUrl?: string;
  coverImageUrl?: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  currency: string;
  vatEnabled: boolean;
  vatRate: number;
  loyaltyEnabled: boolean;
  isAcceptingOrders: boolean;
};

export type RestaurantSettingsConfig = {
  features: Features;
  serviceChargeEnabled: boolean;
  serviceChargeRate: number;
};

// ── Reads ─────────────────────────────────────────────────────────────────────

/**
 * Get the public profile for a restaurant (dashboard settings view).
 * Returns mock data when no database is configured.
 */
export async function getRestaurantProfile(
  restaurantId: string,
): Promise<RestaurantProfile | null> {
  if (!hasDatabase()) {
    return {
      ...MOCK_RESTAURANT,
      bankName: "GTBank",
      bankAccountName: "Mama Put Kitchen",
      bankAccountNumber: "0123456789",
    };
  }

  const [row] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.id, restaurantId))
    .limit(1);

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    city: row.city,
    phone: row.phone,
    logoUrl: row.logoUrl ?? undefined,
    coverImageUrl: row.coverImageUrl ?? undefined,
    bankName: row.bankName ?? undefined,
    bankAccountName: row.bankAccountName ?? undefined,
    bankAccountNumber: row.bankAccountNumber ?? undefined,
    currency: row.currency,
    vatEnabled: row.vatEnabled,
    vatRate: row.vatRate,
    loyaltyEnabled: row.loyaltyEnabled,
    isAcceptingOrders: row.isAcceptingOrders,
  };
}

/**
 * Get service-charge and feature-flag settings for a restaurant.
 */
export async function getRestaurantSettings(
  restaurantId: string,
): Promise<RestaurantSettingsConfig | null> {
  if (!hasDatabase()) {
    return {
      features: {
        menu: true,
        orders: true,
        tables: true,
        payments: true,
        loyalty: true,
        analytics: true,
        staff: true,
        notifications: true,
        integrations: false,
      },
      serviceChargeEnabled: false,
      serviceChargeRate: 0,
    };
  }

  const [row] = await db
    .select()
    .from(restaurantSettings)
    .where(eq(restaurantSettings.restaurantId, restaurantId))
    .limit(1);

  if (!row) return null;

  return {
    features: row.features as Features,
    serviceChargeEnabled: row.serviceChargeEnabled,
    serviceChargeRate: row.serviceChargeRate,
  };
}

// ── Writes ────────────────────────────────────────────────────────────────────

/**
 * Update the restaurant's public profile fields.
 * Callers must already be authorized to `restaurantId`.
 */
export async function updateRestaurantProfile(
  restaurantId: string,
  input: UpdateRestaurantProfileInput,
): Promise<Result<{ restaurantId: string }>> {
  if (!hasDatabase()) {
    return err(
      "unavailable",
      "Connect a database to update restaurant settings.",
    );
  }

  try {
    const result = await db
      .update(restaurants)
      .set({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(input.city !== undefined ? { city: input.city } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.bankName !== undefined ? { bankName: input.bankName } : {}),
        ...(input.bankAccountName !== undefined
          ? { bankAccountName: input.bankAccountName }
          : {}),
        ...(input.bankAccountNumber !== undefined
          ? { bankAccountNumber: input.bankAccountNumber }
          : {}),
        ...(input.vatEnabled !== undefined
          ? { vatEnabled: input.vatEnabled }
          : {}),
        ...(input.vatRate !== undefined ? { vatRate: input.vatRate } : {}),
        ...(input.loyaltyEnabled !== undefined
          ? { loyaltyEnabled: input.loyaltyEnabled }
          : {}),
        ...(input.isAcceptingOrders !== undefined
          ? { isAcceptingOrders: input.isAcceptingOrders }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, restaurantId))
      .returning({ id: restaurants.id });

    if (result.length === 0) return err("not_found");
    return ok({ restaurantId });
  } catch (error) {
    return fail(error, "updateRestaurantProfile");
  }
}

/**
 * Update service charge configuration for a restaurant.
 */
export async function updateServiceCharge(
  restaurantId: string,
  input: UpdateServiceChargeInput,
): Promise<Result<{ restaurantId: string }>> {
  if (!hasDatabase()) {
    return err("unavailable", "Connect a database to update settings.");
  }

  try {
    await db
      .update(restaurantSettings)
      .set({
        serviceChargeEnabled: input.serviceChargeEnabled,
        ...(input.serviceChargeRate !== undefined
          ? { serviceChargeRate: input.serviceChargeRate }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(restaurantSettings.restaurantId, restaurantId));

    return ok({ restaurantId });
  } catch (error) {
    return fail(error, "updateServiceCharge");
  }
}
