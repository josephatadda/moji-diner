import { NextResponse } from "next/server";
import { reportPaymentSchema } from "@/lib/domain/payments";
import { reportPayment } from "@/lib/services/payments";

/**
 * POST /api/payments/report
 *
 * Public endpoint — called by the diner to self-report a bank transfer or USSD payment.
 * Security:
 *  - Rate-limited per IP (5 requests / 10 minutes) inside reportPayment().
 *  - Payment amount is read from the linked order's grandTotal — never trusted from client.
 *  - A unique MJI-XXXXXXXX reference is generated server-side.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();

    const parsed = reportPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const result = await reportPayment(parsed.data, req.headers);

    if (!result.ok) {
      const status =
        result.code === "rate_limited"
          ? 429
          : result.code === "not_found"
            ? 404
            : 500;

      return NextResponse.json(
        { error: result.message, code: result.code },
        { status },
      );
    }

    return NextResponse.json({ data: result.data }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/payments/report]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
