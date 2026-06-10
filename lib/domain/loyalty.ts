import { z } from "zod";

/**
 * Loyalty domain — Zod schemas for the points + rewards system.
 *
 * Earning: 1 point per ₦100 spent (configurable via restaurant settings).
 * Tiers: Bronze → Silver (500pts) → Gold (2000pts) → Platinum.
 * Redemption: points deducted; rewardValue is kobo (free_item) or percent (discount).
 */

export const LOYALTY_TIERS = ["Bronze", "Silver", "Gold", "Platinum"] as const;

export const REWARD_TYPES = ["free_item", "discount_percent"] as const;

export type LoyaltyTier = (typeof LOYALTY_TIERS)[number];
export type RewardType = (typeof REWARD_TYPES)[number];

// Tier thresholds (points required to reach each tier)
export const TIER_THRESHOLDS: Record<LoyaltyTier, number> = {
  Bronze: 0,
  Silver: 500,
  Gold: 2000,
  Platinum: 5000,
};

// ── Pure helpers ──────────────────────────────────────────────────────────────

/**
 * Compute the loyalty tier for a given point total.
 * Used server-side when awarding points so the tier is always up to date.
 */
export function computeTier(totalPoints: number): LoyaltyTier {
  if (totalPoints >= TIER_THRESHOLDS.Platinum) return "Platinum";
  if (totalPoints >= TIER_THRESHOLDS.Gold) return "Gold";
  if (totalPoints >= TIER_THRESHOLDS.Silver) return "Silver";
  return "Bronze";
}

/**
 * Compute points to award for a given spend amount (kobo).
 * Default rate: 1 point per ₦100 = 1 point per 10,000 kobo.
 */
export function computePointsEarned(
  amountKobo: number,
  pointsPerNaira = 0.01,
): number {
  const naira = amountKobo / 100;
  return Math.floor(naira * pointsPerNaira * 100); // 1 pt per ₦100 by default
}

// ── Schemas ───────────────────────────────────────────────────────────────────

/** Look up a diner's loyalty profile by their phone number. */
export const lookupProfileSchema = z.object({
  phone: z
    .string()
    .regex(/^\+234\d{10}$/, "Must be a valid Nigerian phone number (+234…)"),
});

/** Capture diner phone at order time (optional, for loyalty enrollment). */
export const enrollProfileSchema = z.object({
  restaurantId: z.string().uuid(),
  phone: z
    .string()
    .regex(/^\+234\d{10}$/, "Must be a valid Nigerian phone number (+234…)"),
  name: z.string().trim().min(1).max(100).optional(),
});

/** Award points after a confirmed payment (internal, server-only). */
export const awardPointsSchema = z.object({
  restaurantId: z.string().uuid(),
  phone: z.string(),
  orderId: z.string().uuid(),
  amountKobo: z.number().int().min(0),
  pointsPerNaira: z.number().default(0.01),
});

/** Create or update a reward in the catalog. */
export const upsertRewardSchema = z.object({
  name: z.string().trim().min(1).max(100),
  pointsRequired: z.number().int().min(1),
  rewardType: z.enum(REWARD_TYPES),
  /** kobo for free_item; percentage integer for discount_percent */
  rewardValue: z.number().int().min(0),
  isAvailable: z.boolean().default(true),
});

// ── Types ─────────────────────────────────────────────────────────────────────

export type LookupProfileInput = z.infer<typeof lookupProfileSchema>;
export type EnrollProfileInput = z.infer<typeof enrollProfileSchema>;
export type AwardPointsInput = z.infer<typeof awardPointsSchema>;
export type UpsertRewardInput = z.infer<typeof upsertRewardSchema>;
