import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  restaurantMembers,
  restaurantSettings,
  restaurants,
  restaurantTables,
} from "@/lib/db/schema";
import type { CompleteOnboardingInput } from "@/lib/domain/onboarding";
import { DEFAULT_FEATURES } from "@/lib/domain/settings";
import { hasDatabase } from "@/lib/env";
import { err, fail, ok, type Result } from "@/lib/result";
import { requireUser } from "@/lib/services/auth";

// ── Reads ─────────────────────────────────────────────────────────────────────

/**
 * Check whether a restaurant slug is available (not taken by any other restaurant).
 * Always returns `available: true` in mock mode (no DB conflict possible).
 */
export async function checkSlugAvailability(
  slug: string,
): Promise<Result<{ available: boolean }>> {
  if (!hasDatabase()) return ok({ available: true });

  try {
    const [existing] = await db
      .select({ id: restaurants.id })
      .from(restaurants)
      .where(eq(restaurants.slug, slug))
      .limit(1);

    return ok({ available: !existing });
  } catch (error) {
    return fail(error, "checkSlugAvailability");
  }
}

// ── Writes ────────────────────────────────────────────────────────────────────

/**
 * Complete the onboarding wizard by atomically creating:
 *   1. The restaurant record
 *   2. The owner's membership
 *   3. Default restaurant settings (feature flags, service charge)
 *   4. The initial set of dining tables
 *
 * In mock mode (no DB), returns a synthetic success so the preview works.
 * All DB operations run inside a transaction — either everything succeeds or nothing persists.
 */
export async function completeOnboarding(
  input: CompleteOnboardingInput,
): Promise<Result<{ restaurantId: string; slug: string }>> {
  // Require authentication — throws UNAUTHORIZED if no session
  const user = await requireUser();

  if (!hasDatabase()) {
    return ok({ restaurantId: "mock-rest-id", slug: input.profile.slug });
  }

  try {
    // Slug uniqueness guard before we open a transaction
    const { data: slugCheck } = await checkSlugAvailability(
      input.profile.slug,
    ).then((r) => {
      if (!r.ok) throw new Error(r.message);
      return r;
    });

    if (!slugCheck.available) {
      return err("conflict", "This restaurant slug is already taken.", {
        slug: ["Slug is already in use — try a different one."],
      });
    }

    // Atomically create all related records
    const result = await db.transaction(async (tx) => {
      // 1. Restaurant
      const [restaurant] = await tx
        .insert(restaurants)
        .values({
          name: input.profile.name,
          slug: input.profile.slug,
          phone: input.profile.phone,
          city: "Lagos", // Default; editable in Settings after onboarding
          description: input.profile.cuisines.join(", "),
        })
        .returning({ id: restaurants.id });

      // 2. Owner membership
      await tx.insert(restaurantMembers).values({
        restaurantId: restaurant.id,
        userId: user.id,
        role: "owner",
      });

      // 3. Default settings
      await tx.insert(restaurantSettings).values({
        restaurantId: restaurant.id,
        features: DEFAULT_FEATURES,
        serviceChargeEnabled: false,
        serviceChargeRate: 0,
      });

      // 4. Dining tables (numbered from 1 to tableCount)
      await tx.insert(restaurantTables).values(
        Array.from({ length: input.tables.tableCount }, (_, i) => ({
          restaurantId: restaurant.id,
          tableNumber: i + 1,
          label: `Table ${i + 1}`,
          capacity: 4,
        })),
      );

      return { restaurantId: restaurant.id, slug: input.profile.slug };
    });

    return ok(result);
  } catch (error) {
    return fail(error, "completeOnboarding");
  }
}
