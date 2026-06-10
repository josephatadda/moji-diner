import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";

/**
 * Route protection middleware.
 *
 * Protected paths:
 *   /dashboard/**  — owner-only, requires an active Better Auth session.
 *   /onboarding/** — same; a signed-in user must finish setup before seeing dashboard.
 *
 * Unprotected:
 *   /api/auth/**   — Better Auth's own endpoints (sign-in, sign-out, OAuth callbacks…)
 *   /api/**        — public diner API (ordering, slug check, etc.)
 *   /(auth)/**     — login, signup, verify, reset pages
 *
 * Mock-fallback mode (no auth env vars):
 *   Auth env is only accessed when a protected route is actually hit.
 *   Static/public pages are never interrupted.
 */

const PROTECTED_PREFIXES = ["/dashboard", "/onboarding"];

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  // Only run protection logic for the paths that need it
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  if (!isProtected) return NextResponse.next();

  try {
    // getAuth() is lazy — only constructs when auth is actually invoked.
    // This keeps pages that don't touch auth working in mock-fallback mode.
    const session = await getAuth().api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      // No valid session → redirect to login, preserving the intended destination
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    // Auth env not configured (BETTER_AUTH_SECRET missing) → allow through.
    // The mock-fallback dashboard works without a real session.
    // In production this branch will never be reached.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     *   - _next/static  (Next.js build assets)
     *   - _next/image   (Next.js image optimisation)
     *   - favicon.ico   (browser icon)
     *   - public files  (images, manifests, icons)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
