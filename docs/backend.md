# Moji Backend

The restaurant-domain backend, added additively on the existing
Drizzle + Neon + Better Auth foundation. It does not touch the dialectcn
`preset`/`like`/`feed` feature.

## Architecture
Server Actions + a transport-agnostic service layer:

```
app/(actions)/*      "use server" actions — validate → call service → Result
lib/services/*       data access (DB when configured, else mock fallback)
lib/domain/*         zod validation schemas (+ colocated tests)
lib/db/schema/*      Drizzle tables (restaurant domain)
```

All business logic lives in `lib/services`, so a future REST/mobile client can
reuse it via thin route handlers without a rewrite. Public diner reads run in
Server Components calling services directly.

## Data-source flag (mock fallback)
`lib/env.ts → hasDatabase()` is true when `DATABASE_URL` is set. Each service
does `if (!hasDatabase()) return <mock>` else queries the DB. `lib/db/client.ts`
is **lazy** — importing `db` never throws; it connects only on first use (inside
DB branches). Result: the preview works with **no** database, and flips to real
data once `DATABASE_URL` + seed are in place. No code changes to switch.

## Security model
- **Authz:** `requireUser()` on every dashboard action → `requireRestaurantContext()`
  (`lib/services/restaurant-context.ts`) resolves the owner's restaurant from the
  `restaurant_members` table. The client never supplies a trusted `restaurantId`.
- **Validation:** every action input parsed with a zod schema in `lib/domain/*`;
  typed field errors via the shared `Result` type (`lib/result.ts`).
- **Safe errors:** `fail()` logs the real error server-side and returns a generic
  safe message; no stack traces, secrets, or PII leave the server.
- **Money:** integer kobo, computed server-side; client totals are never trusted.
- **PII:** loyalty phone normalized, never returned in public diner responses.
- **Hardening:** `server-only` guards on db/env/services; server-generated UUID
  PKs; in-memory rate limiting (`lib/rate-limit.ts`) on public diner writes.

## Auth & payments (decisions)
- **Owner auth:** Better Auth (GitHub/Google). Dashboard is owner-gated.
- **Staff:** records only (name/role/status, no credential). Real staff access
  will reuse Better Auth member invites later — no bespoke PIN system.
- **Payments:** self-reported — show restaurant bank details; diner taps
  "I have transferred" / "Mark as paid"; owner/staff confirms. No gateway.
- **QR:** diner entry validated by slug + table existence (no HMAC signing).
- **Sessions:** derived from a table's unpaid orders (no sessions table).

## Setup
```
cp .env.example .env.local   # set DATABASE_URL + Better Auth vars
npm run db:migrate           # apply drizzle/ migrations
npm run seed:restaurant      # mirror the mock data into the DB
```
Without `DATABASE_URL` the app runs on mock data (preview mode).

## Phases
| Phase | Scope | Status |
|---|---|---|
| B0 | Schema (15 tables, 10 enums) + migration + security spine (env/result/rate-limit/restaurant-context) + lazy db client + seed + .env.example | ✅ done |
| B1 | Restaurant + Menu (diner read + dashboard CRUD) | pending |
| B2 | Orders (place/list/status/manual) | pending |
| B3 | Payments + bill (self-reported, confirm) | pending |
| B4 | Loyalty (profiles, points, rewards) | pending |
| B5 | Tables + QR resolution | pending |
| B6 | Settings (profile, taxes, features) | pending |
| B7 | Analytics | pending |
| B8 | Staff records | pending |
| B9 | Hardening & authz/leak verification sweep | pending |

Each phase: service → domain/zod → action → wire frontend behind the flag →
verify (tsc + biome clean; preview works with and without DB).
