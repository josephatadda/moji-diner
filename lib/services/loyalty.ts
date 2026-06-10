import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  loyaltyProfiles,
  loyaltyRewards,
  loyaltyTransactions,
} from "@/lib/db/schema";
import type {
  LoyaltyProfileRow,
  LoyaltyRewardRow,
} from "@/lib/db/schema/restaurant";
import {
  type AwardPointsInput,
  computePointsEarned,
  type EnrollProfileInput,
  type UpsertRewardInput,
} from "@/lib/domain/loyalty";
import { koboToNaira } from "@/lib/domain/money";
import { hasDatabase } from "@/lib/env";
import {
  type LoyaltyProfile,
  type LoyaltyReward,
  MOCK_LOYALTY_PROFILES,
  MOCK_REWARDS,
} from "@/lib/mockData";
import { err, fail, ok, type Result } from "@/lib/result";

// ── Type mappers ──────────────────────────────────────────────────────────────

function toProfile(row: LoyaltyProfileRow): LoyaltyProfile {
  return {
    phone: row.phone,
    restaurantId: row.restaurantId,
    totalPoints: row.totalPoints,
    totalVisits: row.totalVisits,
    totalSpent: koboToNaira(row.totalSpent),
    tier: row.tier as LoyaltyProfile["tier"],
  };
}

function toReward(row: LoyaltyRewardRow): LoyaltyReward {
  return {
    id: row.id,
    restaurantId: row.restaurantId,
    name: row.name,
    pointsRequired: row.pointsRequired,
    rewardType: row.rewardType as LoyaltyReward["rewardType"],
    rewardValue: row.rewardValue,
    isAvailable: row.isAvailable,
  };
}

// ── Reads ─────────────────────────────────────────────────────────────────────

/**
 * Look up a diner's loyalty profile by phone number.
 * Returns null if the diner has no profile for this restaurant.
 */
export async function getLoyaltyProfile(
  restaurantId: string,
  phone: string,
): Promise<LoyaltyProfile | null> {
  if (!hasDatabase()) {
    return MOCK_LOYALTY_PROFILES.find((p) => p.phone === phone) ?? null;
  }

  const [row] = await db
    .select()
    .from(loyaltyProfiles)
    .where(
      and(
        eq(loyaltyProfiles.restaurantId, restaurantId),
        eq(loyaltyProfiles.phone, phone),
      ),
    )
    .limit(1);

  return row ? toProfile(row) : null;
}

/**
 * List all loyalty profiles for a restaurant (owner customer view).
 * Returns mock data when no database is configured.
 */
export async function listLoyaltyProfiles(
  restaurantId: string,
): Promise<LoyaltyProfile[]> {
  if (!hasDatabase()) return MOCK_LOYALTY_PROFILES;

  const rows = await db
    .select()
    .from(loyaltyProfiles)
    .where(eq(loyaltyProfiles.restaurantId, restaurantId))
    .orderBy(desc(loyaltyProfiles.totalPoints));

  return rows.map(toProfile);
}

/**
 * List all rewards for a restaurant (dashboard catalog + public diner view).
 */
export async function listRewards(
  restaurantId: string,
): Promise<LoyaltyReward[]> {
  if (!hasDatabase()) return MOCK_REWARDS;

  const rows = await db
    .select()
    .from(loyaltyRewards)
    .where(eq(loyaltyRewards.restaurantId, restaurantId))
    .orderBy(loyaltyRewards.pointsRequired);

  return rows.map(toReward);
}

// ── Writes ────────────────────────────────────────────────────────────────────

/**
 * Enroll a diner into the loyalty program (or no-op if already enrolled).
 * Called when a diner provides their phone number at order time.
 * Uses INSERT … ON CONFLICT DO NOTHING for idempotency.
 */
export async function enrollProfile(
  input: EnrollProfileInput,
): Promise<Result<{ profileId: string }>> {
  if (!hasDatabase()) {
    return ok({ profileId: `mock-profile-${input.phone}` });
  }

  try {
    const [row] = await db
      .insert(loyaltyProfiles)
      .values({
        restaurantId: input.restaurantId,
        phone: input.phone,
        name: input.name ?? null,
      })
      .onConflictDoNothing()
      .returning({ id: loyaltyProfiles.id });

    // If conflict (already enrolled), fetch the existing profile id
    if (!row) {
      const [existing] = await db
        .select({ id: loyaltyProfiles.id })
        .from(loyaltyProfiles)
        .where(
          and(
            eq(loyaltyProfiles.restaurantId, input.restaurantId),
            eq(loyaltyProfiles.phone, input.phone),
          ),
        )
        .limit(1);

      if (!existing) return err("internal");
      return ok({ profileId: existing.id });
    }

    return ok({ profileId: row.id });
  } catch (error) {
    return fail(error, "enrollProfile");
  }
}

/**
 * Award loyalty points after a confirmed payment.
 * Creates or updates the diner's profile and appends a transaction record.
 * Called internally by the payment confirmation flow.
 */
export async function awardPoints(
  input: AwardPointsInput,
): Promise<Result<{ pointsAwarded: number }>> {
  if (!hasDatabase()) {
    const points = computePointsEarned(input.amountKobo, input.pointsPerNaira);
    return ok({ pointsAwarded: points });
  }

  try {
    const pointsEarned = computePointsEarned(
      input.amountKobo,
      input.pointsPerNaira,
    );
    if (pointsEarned <= 0) return ok({ pointsAwarded: 0 });

    // Upsert the loyalty profile
    await db
      .insert(loyaltyProfiles)
      .values({
        restaurantId: input.restaurantId,
        phone: input.phone,
        totalPoints: pointsEarned,
        totalVisits: 1,
        totalSpent: input.amountKobo,
      })
      .onConflictDoUpdate({
        target: [loyaltyProfiles.restaurantId, loyaltyProfiles.phone],
        set: {
          totalPoints: sql`${loyaltyProfiles.totalPoints} + ${pointsEarned}`,
          totalVisits: sql`${loyaltyProfiles.totalVisits} + 1`,
          totalSpent: sql`${loyaltyProfiles.totalSpent} + ${input.amountKobo}`,
          // Recalculate tier in-place based on new point total
          tier: sql`
            CASE
              WHEN ${loyaltyProfiles.totalPoints} + ${pointsEarned} >= 5000 THEN 'Platinum'
              WHEN ${loyaltyProfiles.totalPoints} + ${pointsEarned} >= 2000 THEN 'Gold'
              WHEN ${loyaltyProfiles.totalPoints} + ${pointsEarned} >= 500  THEN 'Silver'
              ELSE 'Bronze'
            END
          `,
        },
      });

    // Fetch the profile id for the transaction record
    const [profile] = await db
      .select({ id: loyaltyProfiles.id })
      .from(loyaltyProfiles)
      .where(
        and(
          eq(loyaltyProfiles.restaurantId, input.restaurantId),
          eq(loyaltyProfiles.phone, input.phone),
        ),
      )
      .limit(1);

    if (profile) {
      await db.insert(loyaltyTransactions).values({
        profileId: profile.id,
        orderId: input.orderId,
        pointsDelta: pointsEarned,
        reason: "order",
      });
    }

    return ok({ pointsAwarded: pointsEarned });
  } catch (error) {
    return fail(error, "awardPoints");
  }
}

/**
 * Create or update a reward in the restaurant's catalog.
 */
export async function upsertReward(
  restaurantId: string,
  input: UpsertRewardInput,
  rewardId?: string,
): Promise<Result<{ rewardId: string }>> {
  if (!hasDatabase()) {
    return err("unavailable", "Connect a database to manage rewards.");
  }

  try {
    if (rewardId) {
      // Update existing
      const result = await db
        .update(loyaltyRewards)
        .set({
          name: input.name,
          pointsRequired: input.pointsRequired,
          rewardType: input.rewardType,
          rewardValue: input.rewardValue,
          isAvailable: input.isAvailable,
        })
        .where(
          and(
            eq(loyaltyRewards.id, rewardId),
            eq(loyaltyRewards.restaurantId, restaurantId),
          ),
        )
        .returning({ id: loyaltyRewards.id });

      if (result.length === 0) return err("not_found");
      return ok({ rewardId: result[0].id });
    }

    // Insert new
    const [row] = await db
      .insert(loyaltyRewards)
      .values({ restaurantId, ...input })
      .returning({ id: loyaltyRewards.id });

    return ok({ rewardId: row.id });
  } catch (error) {
    return fail(error, "upsertReward");
  }
}

/**
 * Delete a reward from the catalog.
 */
export async function deleteReward(
  restaurantId: string,
  rewardId: string,
): Promise<boolean> {
  const result = await db
    .delete(loyaltyRewards)
    .where(
      and(
        eq(loyaltyRewards.id, rewardId),
        eq(loyaltyRewards.restaurantId, restaurantId),
      ),
    )
    .returning({ id: loyaltyRewards.id });

  return result.length > 0;
}
