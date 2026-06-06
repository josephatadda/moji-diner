import "server-only";

/**
 * Minimal in-memory fixed-window rate limiter for public (unauthenticated)
 * diner writes — order placement, payment notification, loyalty lookup.
 *
 * Single-instance only. Swap the backing store for Upstash/Redis when the app
 * runs on multiple instances; the call sites won't change.
 */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/**
 * @param key     unique caller+action key, e.g. `place-order:${ip}`
 * @param limit   max requests per window
 * @param windowMs window length in milliseconds
 * @returns true if allowed, false if the limit is exceeded
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

/** Best-effort client IP from request headers (Next.js / proxies). */
export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return headers.get("x-real-ip")?.trim() || "unknown";
}
