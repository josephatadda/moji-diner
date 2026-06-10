# Backend Implementation Handoff

Phased backend implementation for the Moji Diner dashboard.
Follows the Server Actions + service-layer architecture documented in `docs/backend.md`.

## Architecture Overview

```
lib/domain/*.ts        Zod schemas + pure helpers — no DB, no auth imports
lib/services/*.ts      DB queries + mock fallbacks — server-only
app/(actions)/*.ts     "use server" — validate → call service → revalidate → Result
app/api/**/*.ts        API routes for public (diner) or webhook endpoints
```

**Invariants** (every future phase must uphold these):
- Mock fallback always checked with `if (!hasDatabase())` before any DB call
- Every dashboard action calls `requireRestaurantContext()` first (tenant isolation)
- All public writes (diner API) are rate-limited via `lib/rate-limit.ts`
- Money is integer kobo in the DB; converted with `nairaToKobo`/`koboToNaira` at the boundary
- Errors returned to clients use the shared `Result<T>` type — no raw errors or stack traces

---

## Files Added

### Domain (Zod schemas + types)

| File | Purpose |
|------|---------|
| `lib/domain/onboarding.ts` | Restaurant profile + tables setup schemas |
| `lib/domain/orders.ts` | PlaceOrder, UpdateOrderStatus schemas + OrderStatus enum |
| `lib/domain/settings.ts` | Restaurant profile update, service charge, feature flags |
| `lib/domain/tables.ts` | CreateTable, UpdateTable, BatchCreateTables schemas |

### Services (data access)

| File | Purpose |
|------|---------|
| `lib/services/onboarding/onboarding.ts` | `completeOnboarding`, `checkSlugAvailability` |
| `lib/services/orders.ts` | `listActiveOrders`, `listOrders`, `placeOrder`, `updateOrderStatus` |
| `lib/services/tables.ts` | `listTables`, `getTableByNumber`, `createTable`, `batchCreateTables`, `updateTable`, `deleteTable` |
| `lib/services/settings.ts` | `getRestaurantProfile`, `getRestaurantSettings`, `updateRestaurantProfile`, `updateServiceCharge` |

### Server Actions (dashboard)

| File | Purpose |
|------|---------|
| `app/(actions)/orders.ts` | `listActiveOrdersAction`, `listOrdersAction`, `updateOrderStatusAction` |
| `app/(actions)/tables.ts` | `listTablesAction`, `createTableAction`, `batchCreateTablesAction`, `updateTableAction`, `deleteTableAction` |
| `app/(actions)/settings.ts` | `getRestaurantProfileAction`, `getRestaurantSettingsAction`, `updateRestaurantProfileAction`, `updateServiceChargeAction` |

### API Routes (public / diner-side)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/orders` | POST | Diner places a new order (rate-limited, price-validated) |
| `/api/onboarding/complete` | POST | Finalize onboarding (authenticated) |
| `/api/onboarding/check-slug` | GET | Live slug availability check |

---

## Phase Status

| Phase | Scope | Status |
|-------|-------|--------|
| B0 | Schema + security spine (env/result/rate-limit/restaurant-context) | ✅ done (existing) |
| B1 | Menu CRUD — service + actions | ✅ done (existing + cleaned) |
| B1.5 | Onboarding completion API | ✅ done |
| B2 | Orders — place + list + status update | ✅ done |
| B5 | Tables — CRUD + batch create | ✅ done |
| B6 | Settings — profile + service charge | ✅ done |
| B3 | Payments (self-reported, confirm) | pending |
| B4 | Loyalty (profiles, points, rewards) | pending |
| B7 | Analytics | pending |
| B8 | Staff records | pending |
| B9 | Auth hardening + middleware | pending |

---

## Pending Phases

### B3 — Payments

Service: `lib/services/payments.ts`
Actions: `app/(actions)/payments.ts`

Key operations:
- `listPayments(restaurantId)` — dashboard payments history
- `reportPayment(input)` — diner self-reports a bank transfer (public, rate-limited)
- `confirmPayment(paymentId)` — owner/staff marks a payment as confirmed
- `rejectPayment(paymentId)` — owner marks payment as rejected

### B4 — Loyalty

Service: `lib/services/loyalty.ts`
Actions: `app/(actions)/loyalty.ts`

Key operations:
- `getLoyaltyProfile(restaurantId, phone)` — look up diner by phone
- `awardPoints(profileId, orderId, amountKobo)` — add points after confirmed payment
- `listLoyaltyProfiles(restaurantId)` — owner customer list
- `listRewards(restaurantId)` — public + dashboard reward catalog
- `redeemReward(profileId, rewardId)` — deduct points

### B7 — Analytics

Service: `lib/services/analytics.ts`
Actions: `app/(actions)/analytics.ts`

Key operations:
- `getRevenueSummary(restaurantId, range)` — daily totals for chart
- `getTopDishes(restaurantId, limit)` — most ordered items
- `getPaymentMethodBreakdown(restaurantId)` — pie chart data

### B9 — Hardening

- `middleware.ts` — protect `/dashboard` and `/onboarding` with Better Auth session check
- Audit all public API routes for missing rate limits
- Verify `server-only` guards on all service modules

---

## Verification

```bash
# Type safety
npx tsc --noEmit

# Linting + formatting
npx biome check app/'(actions)' lib/services lib/domain app/api

# Auto-fix formatting
npx biome check --write app/'(actions)' lib/services lib/domain app/api
```
