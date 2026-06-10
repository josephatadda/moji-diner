"use server";

import { revalidatePath } from "next/cache";
import {
  updateRestaurantProfileSchema,
  updateServiceChargeSchema,
} from "@/lib/domain/settings";
import { err, fail, ok, type Result } from "@/lib/result";
import { requireRestaurantContext } from "@/lib/services/restaurant-context";
import {
  getRestaurantProfile,
  getRestaurantSettings,
  updateRestaurantProfile,
  updateServiceCharge,
} from "@/lib/services/settings";

/**
 * Dashboard settings actions — secured with requireRestaurantContext().
 * Reads fall back to mock data; writes require a real database.
 */

// ── Reads ─────────────────────────────────────────────────────────────────────

export async function getRestaurantProfileAction(): Promise<
  Result<{ profile: Awaited<ReturnType<typeof getRestaurantProfile>> }>
> {
  try {
    const ctx = await requireRestaurantContext();
    if (!ctx.ok) return ctx;

    const profile = await getRestaurantProfile(ctx.data.restaurantId);
    return ok({ profile });
  } catch (error) {
    return fail(error, "getRestaurantProfileAction");
  }
}

export async function getRestaurantSettingsAction(): Promise<
  Result<{ settings: Awaited<ReturnType<typeof getRestaurantSettings>> }>
> {
  try {
    const ctx = await requireRestaurantContext();
    if (!ctx.ok) return ctx;

    const settings = await getRestaurantSettings(ctx.data.restaurantId);
    return ok({ settings });
  } catch (error) {
    return fail(error, "getRestaurantSettingsAction");
  }
}

// ── Writes ────────────────────────────────────────────────────────────────────

export async function updateRestaurantProfileAction(
  input: Record<string, unknown>,
): Promise<Result<{ restaurantId: string }>> {
  try {
    const ctx = await requireRestaurantContext();
    if (!ctx.ok) return ctx;

    const parsed = updateRestaurantProfileSchema.safeParse(input);
    if (!parsed.success) {
      return err(
        "validation",
        "Invalid profile data.",
        parsed.error.flatten().fieldErrors,
      );
    }

    const result = await updateRestaurantProfile(
      ctx.data.restaurantId,
      parsed.data,
    );
    if (!result.ok) return result;

    revalidatePath("/dashboard/settings");
    return ok({ restaurantId: ctx.data.restaurantId });
  } catch (error) {
    return fail(error, "updateRestaurantProfileAction");
  }
}

export async function updateServiceChargeAction(
  input: Record<string, unknown>,
): Promise<Result<{ restaurantId: string }>> {
  try {
    const ctx = await requireRestaurantContext();
    if (!ctx.ok) return ctx;

    const parsed = updateServiceChargeSchema.safeParse(input);
    if (!parsed.success) {
      return err(
        "validation",
        "Invalid service charge data.",
        parsed.error.flatten().fieldErrors,
      );
    }

    const result = await updateServiceCharge(
      ctx.data.restaurantId,
      parsed.data,
    );
    if (!result.ok) return result;

    revalidatePath("/dashboard/settings");
    return ok({ restaurantId: ctx.data.restaurantId });
  } catch (error) {
    return fail(error, "updateServiceChargeAction");
  }
}
