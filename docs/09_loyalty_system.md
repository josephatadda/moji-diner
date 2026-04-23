# 09 — Loyalty & Repeat Customer Tracking

**Module:** 8 | **Depends on:** `01_data_models.md`, `05_diner_ordering_flow.md`, `06_payment_receipts.md`  
**Responsive:** See `00b_responsive_design_spec.md` — Diner-facing loyalty components (phone capture, rewards on bill screen) are inside the 480px shell. Owner-facing loyalty dashboard: customer list is a full data table on desktop, card stack on mobile. Customer profile page is single-column on both.

> **Why this is V1, not V2:** Loyalty is the primary mechanism for capturing diner phone numbers, enabling repeat marketing, and giving the restaurant a customer database they actually own. Every order from day one builds this asset. Retrofitting loyalty later means losing all early data.

---

## Table of Contents

1. [System Design](#1-system-design)
2. [Diner Flow — Earning Points](#2-diner-flow--earning-points)
3. [Diner Flow — Redeeming Rewards](#3-diner-flow--redeeming-rewards)
4. [Owner Dashboard — Loyalty Management](#4-owner-dashboard--loyalty-management)
5. [File Structure](#5-file-structure)
6. [API Routes](#6-api-routes)
7. [Business Logic](#7-business-logic)
8. [Acceptance Criteria](#8-acceptance-criteria)

---

## 1. System Design

```
EARNING
  Rate:    ₦100 spent = 1 point (configurable per restaurant in settings)
  Trigger: Payment confirmed via Paystack webhook
  Source:  order.subtotal (before VAT, before tip)

TIERS
  Bronze:  0 – 499 points   (default, everyone starts here)
  Silver:  500 – 1,999 points
  Gold:    2,000+ points
  
  Thresholds configurable per restaurant in restaurant_settings.

REDEEMING
  At bill screen: diner selects a reward to apply as discount
  Discount applied to Paystack payment amount
  Points deducted immediately on redemption confirmation

EXPIRY
  V1: No expiry (keeps it simple for launch)
  V2: Points expire after 12 months of inactivity

IDENTIFICATION
  No app. No account. Phone number only.
  Same phone = same profile across all visits.
  Phone captured voluntarily at order time.
```

---

## 2. Diner Flow — Earning Points

### 2.1 Phone Capture at Order Time

```
[Diner taps "Place Order" in cart]
        │
        ▼
[PHONE CAPTURE MODAL — if restaurant.loyalty_enabled = true]
  ┌─────────────────────────────────────────┐
  │  🏆 Earn Loyalty Points                 │
  │                                         │
  │  Enter your phone to earn points        │
  │  on every visit at Mama Put Uyo         │
  │                                         │
  │  +234 [_______________________]         │
  │                                         │
  │  [Earn Points →]      [Skip →]          │
  │                                         │
  │  Your phone is only used for            │
  │  loyalty tracking at this restaurant.   │
  └─────────────────────────────────────────┘
        │
        ├─ Enters phone → taps "Earn Points"
        │     ▼
        │  GET /api/loyalty/:restaurantId/profile/:phone
        │     ├─ Existing customer:
        │     │    "Welcome back, Chidi! 🏆 You have 340 pts"
        │     │    [Silver tier badge shown]
        │     └─ New customer:
        │          "You'll earn points on this order!"
        │     ▼
        │  Phone stored in order.diner_phone
        │  Proceed to order submission
        │
        └─ Taps "Skip"
              → No phone stored
              → No loyalty tracking for this order
              → Never shown twice for same order session
```

### 2.2 Points Awarded After Payment

```
[Paystack webhook fires — charge.success]
        │
        ▼
[POST /api/loyalty/award called internally]
  points_earned = Math.floor(order.subtotal / 100) × points_per_naira
  
  Example: ₦4,600 subtotal × 0.01 = 46 points

  Updates:
    loyalty_profiles.total_points    += 46
    loyalty_profiles.total_visits    += 1
    loyalty_profiles.total_spent     += 4600
    loyalty_profiles.last_visit_at   = now()
    loyalty_profiles.tier            = recalculated
    loyalty_profiles.updated_at      = now()
  
  Inserts:
    loyalty_transactions { type: 'earn', points: 46, order_id }
        │
        ▼
[WhatsApp receipt includes:]
  "🏆 You earned 46 points! Total: 386 pts (Silver in 114 pts)"
```

---

## 3. Diner Flow — Redeeming Rewards

### 3.1 Rewards on Bill Screen

```
[Diner with phone on file opens bill screen]
        │
        ▼
[Bill screen fetches loyalty profile by phone]
[If points > 0: loyalty panel shown]

  ┌─────────────────────────────────────────┐
  │  🥈 Silver Member · 450 pts            │
  │                                         │
  │  Available Rewards                      │
  │  ─────────────────────────────────────  │
  │  Free Coca-Cola                         │
  │  200 pts required · You have 450 pts ✓ │
  │  [Redeem]                               │
  │                                         │
  │  10% Discount                           │
  │  350 pts required · You have 450 pts ✓ │
  │  [Redeem]                               │
  │                                         │
  │  Free Dessert                           │
  │  600 pts required · You need 150 more  │
  │  [Not enough pts]  ← disabled           │
  └─────────────────────────────────────────┘
```

### 3.2 Redemption Confirmation

```
[Diner taps "Redeem" on "10% Discount (350 pts)"]
        │
        ▼
[REDEMPTION CONFIRMATION MODAL]
  ┌─────────────────────────────────────────┐
  │  Redeem 10% Discount?                   │
  │                                         │
  │  Current bill:    ₦4,945               │
  │  10% discount:   −₦495                 │
  │  New total:       ₦4,450               │
  │                                         │
  │  Points used:    350 pts               │
  │  Points left:    100 pts               │
  │                                         │
  │  [Confirm Redemption]   [Cancel]        │
  └─────────────────────────────────────────┘
        │
        ▼
[POST /api/loyalty/redeem called]
  - Validates: profile has enough points
  - Validates: reward is still active
  - Validates: not exceeded max_per_customer
  - Inserts loyalty_transactions { type: 'redeem', points: -350 }
  - Updates loyalty_profiles.total_points -= 350
  - Updates order.total_amount with discount applied
        │
        ▼
[Bill screen total updates to ₦4,450]
[Paystack initialized with ₦4,450]
```

---

## 4. Owner Dashboard — Loyalty Management

### 4.1 Loyalty Overview Page (`/dashboard/loyalty`)

```
[OVERVIEW CARDS]
  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │    234       │  │     67%      │  │   12,450     │
  │  Total       │  │  Orders with │  │   Points in  │
  │  Members     │  │  Loyalty     │  │  Circulation │
  └──────────────┘  └──────────────┘  └──────────────┘

[TIER BREAKDOWN]
  🥉 Bronze: 180 members  (77%)
  🥈 Silver:  42 members  (18%)
  🥇 Gold:    12 members   (5%)

[RECENT ACTIVITY]
  +234 803 XXX 1234  |  Chidi O.   |  Just now  |  +46 pts  |  Order #4821
  +234 802 XXX 5678  |  Amaka N.   |  2 hrs ago |  +38 pts  |  Order #4819
```

### 4.2 Customer List (`/dashboard/loyalty/customers`)

```
Desktop (lg+):
  [SEARCH BAR]
  [FILTERS: All | Bronze | Silver | Gold]
  [FULL DATA TABLE]
  Phone             | Name     | Tier   | Pts   | Spent     | Visits | Last Visit
  +234 803 XXX 1234 | Chidi O. | 🥇Gold | 2,340 | ₦234,000  | 23     | Today
  ...
  [View Profile] per row

Mobile (<lg):
  [SEARCH BAR — full width]
  [FILTER CHIPS — horizontal scroll]
  [CARD STACK]
  ┌──────────────────────────────────────┐
  │  🥇 Chidi O.          2,340 pts      │
  │  +234 803 XXX 1234    23 visits      │
  │  ₦234,000 total · Last visit: Today  │
  │  [View Profile →]                    │
  └──────────────────────────────────────┘
```

### 4.3 Customer Profile (`/dashboard/loyalty/customers/:phone`)

```
[PROFILE HEADER]
  +234 803 XXX 1234
  Chidi Okonkwo · 🥇 Gold Member
  First visit: Jan 12, 2026 · Last visit: Today

[STATS]
  Total spent: ₦234,000 | Total visits: 23 | Points: 2,340

[ACTIONS]
  [+ Add Manual Points]     [📱 Send WhatsApp Message]

[VISIT HISTORY — paginated]
  Date       | Order ID | Items | Total    | Points Earned | Points Used
  Today      | #4821    | 3     | ₦4,600   | +46           | -
  3 days ago | #4780    | 2     | ₦3,800   | +38           | -350 (10% off)
  1 week ago | #4711    | 5     | ₦8,900   | +89           | -
```

### 4.4 Rewards Management (`/dashboard/loyalty/rewards`)

```
[+ Create New Reward]

[ACTIVE REWARDS]
  ─────────────────────────────────────────────
  Free Coca-Cola
  200 pts · free_item · Redeemed 14 times
  [Edit] [Deactivate]
  
  10% Discount
  350 pts · discount_percent · Redeemed 7 times
  [Edit] [Deactivate]

[INACTIVE REWARDS]
  Free Dessert
  600 pts · Deactivated Jan 20
  [Reactivate] [Delete]
```

### 4.5 Loyalty Settings (`/dashboard/loyalty/settings`)

```
Points per ₦100 spent:  [1  ] pts  (current rate: 1 point = ₦100)
Silver tier threshold:  [500] pts
Gold tier threshold:    [2000] pts

Loyalty enabled:  [✓ ON]

[Save Settings]

Note: Changing point rates does not affect existing points.
      New rate applies to future orders only.
```

---

## 5. File Structure

```
app/
├── dashboard/
│   └── loyalty/
│       ├── page.tsx                          ← overview
│       ├── customers/
│       │   ├── page.tsx                      ← customer list
│       │   └── [phone]/
│       │       └── page.tsx                  ← customer profile
│       ├── rewards/
│       │   └── page.tsx                      ← rewards management
│       └── settings/
│           └── page.tsx                      ← loyalty settings
│
├── components/
│   ├── diner/
│   │   ├── PhoneCaptureModal.tsx             ← (also in Module 4)
│   │   ├── LoyaltyBillPanel.tsx              ← points + rewards on bill screen
│   │   ├── RewardCard.tsx                    ← individual reward option
│   │   └── RedemptionModal.tsx               ← confirmation before redeeming
│   └── dashboard/
│       └── loyalty/
│           ├── LoyaltyOverview.tsx
│           ├── TierBreakdownChart.tsx
│           ├── CustomerTable.tsx
│           ├── CustomerProfile.tsx
│           ├── VisitHistoryTable.tsx
│           ├── RewardForm.tsx                ← create/edit reward
│           ├── ManualPointsModal.tsx
│           └── LoyaltySettingsForm.tsx
│
lib/
└── loyalty.ts                                ← award/redeem logic
```

---

## 6. API Routes

### GET `/api/loyalty/:restaurantId/profile/:phone`

```typescript
// Public — called when diner enters phone
// Response:
{
  data: {
    exists: boolean,
    profile_id: string | null,
    name: string | null,
    total_points: number,
    tier: "bronze" | "silver" | "gold",
    tier_icon: "🥉" | "🥈" | "🥇",
    points_to_next_tier: number | null,   // null if already gold
    available_rewards: [
      {
        id: string,
        name: string,
        points_required: number,
        reward_type: string,
        reward_value: number,
        can_redeem: boolean              // true if profile has enough points
      }
    ]
  }
}
```

### POST `/api/loyalty/profile`

```typescript
// Public — called when diner submits phone
{
  restaurant_id: string,
  phone: string,
  name?: string
}
// Upsert: create new or return existing
// Returns: { data: { profile_id, total_points, tier } }
```

### POST `/api/loyalty/award` (Internal)

```typescript
// Called internally after payment success — NOT a public endpoint
// Auth: service role key only
{
  order_id: string
}
// Logic:
const awardLoyaltyPoints = async (orderId: string) => {
  const order = await getOrder(orderId)
  if (!order.diner_phone) return   // no phone = no loyalty

  const settings = await getRestaurantSettings(order.restaurant_id)
  if (!settings.loyalty_enabled) return

  // Upsert profile
  const profile = await upsertLoyaltyProfile({
    restaurant_id: order.restaurant_id,
    phone: order.diner_phone
  })

  // Calculate points on subtotal (not including VAT or tip)
  const pointsEarned = Math.floor(order.subtotal / 100 * settings.points_per_naira * 100)
  if (pointsEarned <= 0) return

  // Update profile totals
  await supabase.from('loyalty_profiles').update({
    total_points: profile.total_points + pointsEarned,
    total_visits: profile.total_visits + 1,
    total_spent: profile.total_spent + order.subtotal,
    last_visit_at: new Date().toISOString(),
    tier: calculateTier(profile.total_points + pointsEarned, settings)
  }).eq('id', profile.id)

  // Record transaction
  await supabase.from('loyalty_transactions').insert({
    profile_id: profile.id,
    restaurant_id: order.restaurant_id,
    order_id: orderId,
    type: 'earn',
    points: pointsEarned,
    description: `Order #${orderId.slice(-6).toUpperCase()}`
  })

  return pointsEarned
}
```

### POST `/api/loyalty/redeem`

```typescript
// Public — called from bill screen
{
  profile_id: string,
  reward_id: string,
  order_id: string,
  phone: string        // verification
}

// Validations:
// 1. Profile exists + phone matches
// 2. Profile.total_points >= reward.points_required
// 3. Reward is active
// 4. max_per_customer not exceeded (if set)

// On success:
// 1. Deduct points from profile
// 2. Insert loyalty_transactions { type: 'redeem', points: -N }
// 3. Return discount details

// Response:
{
  data: {
    discount_type: "percent" | "amount",
    discount_value: number,      // % or ₦ amount
    discount_applied: number,    // actual ₦ discount on this order
    new_total: number,
    points_deducted: number,
    remaining_points: number
  }
}
```

### GET `/api/loyalty/:restaurantId/customers`

```typescript
// Auth: restaurant owner JWT
// Query: ?page=1&per_page=20&search=&tier=&sort=last_visit_desc

// Response:
{
  data: Customer[],
  meta: { total, page, per_page, total_pages }
}
```

### GET `/api/loyalty/:restaurantId/customers/:phone`

```typescript
// Auth: restaurant owner JWT
// Returns full profile + paginated visit history

{
  data: {
    profile: LoyaltyProfile,
    visit_history: [
      {
        order_id, created_at, total_amount,
        items_count, points_earned, points_redeemed
      }
    ],
    transaction_history: LoyaltyTransaction[]
  }
}
```

### GET `/api/loyalty/:restaurantId/stats`

```typescript
// Auth: restaurant owner JWT
// Query: ?from=&to=

{
  data: {
    total_members: number,
    new_members_period: number,
    tier_breakdown: { bronze: N, silver: N, gold: N },
    orders_with_loyalty_pct: number,
    points_awarded_period: number,
    points_redeemed_period: number,
    top_customers: [{ phone, name, tier, total_spent, total_visits }]
  }
}
```

### POST `/api/loyalty/rewards`

```typescript
// Auth: restaurant owner JWT
{
  restaurant_id: string,
  name: string,
  description?: string,
  points_required: number,
  reward_type: "free_item" | "discount_percent" | "discount_amount",
  reward_value: number,
  free_item_id?: string,   // required if reward_type = 'free_item'
  max_per_customer?: number
}
```

### POST `/api/loyalty/manual-points`

```typescript
// Auth: restaurant owner JWT only
{
  profile_id: string,
  points: number,           // positive = add, negative = deduct
  description: string       // reason (required for audit trail)
}
```

---

## 7. Business Logic

### Tier Calculation

```typescript
// lib/loyalty.ts

export type LoyaltyTier = 'bronze' | 'silver' | 'gold'

export const calculateTier = (
  totalPoints: number,
  settings: { tier_silver_threshold: number; tier_gold_threshold: number }
): LoyaltyTier => {
  if (totalPoints >= settings.tier_gold_threshold) return 'gold'
  if (totalPoints >= settings.tier_silver_threshold) return 'silver'
  return 'bronze'
}

export const TIER_DISPLAY = {
  bronze: { label: 'Bronze', icon: '🥉', color: '#CD7F32' },
  silver: { label: 'Silver', icon: '🥈', color: '#C0C0C0' },
  gold:   { label: 'Gold',   icon: '🥇', color: '#FFD700' }
}

export const getPointsToNextTier = (
  totalPoints: number,
  settings: { tier_silver_threshold: number; tier_gold_threshold: number }
): { nextTier: LoyaltyTier | null; pointsNeeded: number } => {
  if (totalPoints < settings.tier_silver_threshold) {
    return { nextTier: 'silver', pointsNeeded: settings.tier_silver_threshold - totalPoints }
  }
  if (totalPoints < settings.tier_gold_threshold) {
    return { nextTier: 'gold', pointsNeeded: settings.tier_gold_threshold - totalPoints }
  }
  return { nextTier: null, pointsNeeded: 0 }
}

export const calculatePointsEarned = (
  subtotal: number,
  pointsPerNaira: number  // e.g. 0.01 = 1 point per ₦100
): number => {
  return Math.floor(subtotal * pointsPerNaira)
}
```

---

## 8. Acceptance Criteria

- [ ] Phone capture modal shown before every order submission when loyalty is enabled
- [ ] "Skip" is always visible — same size and prominence as "Earn Points" button
- [ ] Returning customer recognized by phone — shows name + points balance immediately
- [ ] New customer welcomed with "You'll earn X points on this order"
- [ ] Points calculated correctly: `floor(subtotal * points_per_naira)`
- [ ] Points awarded within 10 seconds of payment confirmation
- [ ] Points balance + tier shown on bill screen for customers with phone on file
- [ ] Only rewards with sufficient points show active "Redeem" button
- [ ] Redemption confirmation modal shows exact before/after amounts
- [ ] Discount applied to Paystack payment amount (not just display)
- [ ] WhatsApp receipt includes points earned + running balance
- [ ] Owner can view full customer list, searchable by phone/name
- [ ] Owner can view individual customer profile with full visit history
- [ ] Owner can add/deduct manual points with required reason field
- [ ] Loyalty settings (rate, thresholds) configurable per restaurant
- [ ] Tier recalculated automatically on every points update
- [ ] Phone capture skipped for split bill payers (too much friction)

---

*Next: `10_analytics_dashboard.md`*
