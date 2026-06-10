"use server";

import { revalidatePath } from "next/cache";
import { upsertRewardSchema } from "@/lib/domain/loyalty";
import { hasDatabase } from "@/lib/env";
import { err, fail, ok, type Result } from "@/lib/result";
import {
  deleteReward,
  listLoyaltyProfiles,
  listRewards,
  upsertReward,
} from "@/lib/services/loyalty";
import { requireRestaurantContext } from "@/lib/services/restaurant-context";

/**
 * Dashboard loyalty actions — secured with requireRestaurantContext().
 * Reads fall back to mock data; reward writes require a real database.
 */

function dbRequired(): Result<never> | null {
  return hasDatabase()
    ? null
    : err("unavailable", "Connect a database to manage loyalty rewards.");
}

// ── Reads ─────────────────────────────────────────────────────────────────────

export async function listLoyaltyProfilesAction(): Promise<
  Result<{ profiles: Awaited<ReturnType<typeof listLoyaltyProfiles>> }>
> {
  try {
    const ctx = await requireRestaurantContext();
    if (!ctx.ok) return ctx;

    const profiles = await listLoyaltyProfiles(ctx.data.restaurantId);
    return ok({ profiles });
  } catch (error) {
    return fail(error, "listLoyaltyProfilesAction");
  }
}

export async function listRewardsAction(): Promise<
  Result<{ rewards: Awaited<ReturnType<typeof listRewards>> }>
> {
  try {
    const ctx = await requireRestaurantContext();
    if (!ctx.ok) return ctx;

    const rewards = await listRewards(ctx.data.restaurantId);
    return ok({ rewards });
  } catch (error) {
    return fail(error, "listRewardsAction");
  }
}

// ── Writes ────────────────────────────────────────────────────────────────────

export async function upsertRewardAction(
  input: Record<string, unknown>,
  rewardId?: string,
): Promise<Result<{ rewardId: string }>> {
  try {
    const ctx = await requireRestaurantContext();
    if (!ctx.ok) return ctx;
    const gate = dbRequired();
    if (gate) return gate;

    const parsed = upsertRewardSchema.safeParse(input);
    if (!parsed.success) {
      return err(
        "validation",
        "Invalid reward data.",
        parsed.error.flatten().fieldErrors,
      );
    }

    const result = await upsertReward(
      ctx.data.restaurantId,
      parsed.data,
      rewardId,
    );
    if (!result.ok) return result;

    revalidatePath("/dashboard/loyalty");
    return ok({ rewardId: result.data.rewardId });
  } catch (error) {
    return fail(error, "upsertRewardAction");
  }
}

export async function deleteRewardAction(
  rewardId: string,
): Promise<Result<{ rewardId: string }>> {
  try {
    const ctx = await requireRestaurantContext();
    if (!ctx.ok) return ctx;
    const gate = dbRequired();
    if (gate) return gate;

    const deleted = await deleteReward(ctx.data.restaurantId, rewardId);
    if (!deleted) return err("not_found");

    revalidatePath("/dashboard/loyalty");
    return ok({ rewardId });
  } catch (error) {
    return fail(error, "deleteRewardAction");
  }
}
