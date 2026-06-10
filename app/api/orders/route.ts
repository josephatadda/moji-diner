import { NextResponse } from "next/server";
import { placeOrderSchema } from "@/lib/domain/orders";
import { placeOrder } from "@/lib/services/orders";

/**
 * POST /api/orders
 *
 * Public endpoint — called by the diner-facing QR menu app to place an order.
 * Security:
 *  - Rate-limited per IP inside placeOrder() (10 requests / 10 min)
 *  - Prices are re-validated from the DB; the client total is never trusted
 *  - restaurantId is resolved from `restaurantSlug`, not accepted from the client
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();

    const parsed = placeOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const result = await placeOrder(parsed.data, req.headers);

    if (!result.ok) {
      const status =
        result.code === "rate_limited"
          ? 429
          : result.code === "not_found"
            ? 404
            : result.code === "unavailable"
              ? 503
              : 500;

      return NextResponse.json(
        { error: result.message, code: result.code },
        { status },
      );
    }

    return NextResponse.json({ data: result.data }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/orders]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
