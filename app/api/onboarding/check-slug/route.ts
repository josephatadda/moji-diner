import { NextResponse } from "next/server";
import { z } from "zod";
import { checkSlugAvailability } from "@/lib/services/onboarding/onboarding";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    // basic format validation
    const parsed = z
      .string()
      .regex(/^[a-z0-9-]+$/)
      .safeParse(slug);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid slug format" },
        { status: 400 },
      );
    }

    const result = await checkSlugAvailability(slug);

    if (!result.ok) {
      return NextResponse.json(
        { error: "Failed to check slug availability" },
        { status: 500 },
      );
    }

    return NextResponse.json({ available: result.data.available });
  } catch (error) {
    console.error("[GET /api/onboarding/check-slug]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
