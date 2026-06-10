import { NextResponse } from "next/server";
import { completeOnboardingSchema } from "@/lib/domain/onboarding";
import { completeOnboarding } from "@/lib/services/onboarding/onboarding";

/**
 * POST /api/onboarding/complete
 *
 * Authenticated endpoint — called at the end of the onboarding wizard.
 * Creates the restaurant, owner membership, settings, and initial tables atomically.
 * Requires a valid session (enforced inside completeOnboarding via requireUser).
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();

    const parsed = completeOnboardingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const result = await completeOnboarding(parsed.data);

    if (!result.ok) {
      const status =
        result.code === "unauthorized"
          ? 401
          : result.code === "conflict"
            ? 409
            : result.code === "validation"
              ? 400
              : 500;

      return NextResponse.json(
        {
          error: result.message,
          code: result.code,
          fieldErrors: result.fieldErrors,
        },
        { status },
      );
    }

    return NextResponse.json({ data: result.data }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/onboarding/complete]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
