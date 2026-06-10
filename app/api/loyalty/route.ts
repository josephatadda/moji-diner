import { NextResponse } from "next/server";
import { z } from "zod";
import { getLoyaltyProfile } from "@/lib/services/loyalty";
import { resolveRestaurantIdBySlug } from "@/lib/services/restaurant-context";

/**
 * GET /api/loyalty?slug=<restaurantSlug>&phone=<dinerPhone>
 *
 * Public endpoint — lets the diner check their loyalty points at any stage.
 * Returns the profile if found, or null if the diner has no profile yet.
 * No authentication required; phone is the diner's own number.
 */
export async function GET(req: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const phone = searchParams.get("phone");

    const parsed = z
      .object({
        slug: z.string().min(1),
        phone: z.string().regex(/^\+234\d{10}$/),
      })
      .safeParse({ slug, phone });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "slug and phone (+234…) are required." },
        { status: 400 },
      );
    }

    const restaurantId = await resolveRestaurantIdBySlug(parsed.data.slug);
    if (!restaurantId) {
      return NextResponse.json(
        { error: "Restaurant not found." },
        { status: 404 },
      );
    }

    const profile = await getLoyaltyProfile(restaurantId, parsed.data.phone);

    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error("[GET /api/loyalty]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
