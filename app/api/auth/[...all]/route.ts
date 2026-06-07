import { toNextJsHandler } from "better-auth/next-js";
import type { NextRequest } from "next/server";
import { getAuth } from "@/lib/auth";

// Resolve the handler lazily so auth env is only required when an auth route is
// actually hit — keeps unrelated pages working in mock-fallback mode.
export function GET(req: NextRequest) {
  return toNextJsHandler(getAuth()).GET(req);
}

export function POST(req: NextRequest) {
  return toNextJsHandler(getAuth()).POST(req);
}
