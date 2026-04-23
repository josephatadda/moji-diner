# 07 — Bill Splitting

**Module:** 6 | **Depends on:** `06_payment_receipts.md`  
**Responsive:** See `00b_responsive_design_spec.md` — All split pages are diner-facing and render inside the 480px shell on desktop. The individual payer page (`/split/[token]/[part]`) is shared via WhatsApp and must load fast and look correct on any phone, including friends who've never heard of ScanServe.

---

## Table of Contents

1. [User Flow](#1-user-flow)
2. [Split Token System](#2-split-token-system)
3. [File Structure](#3-file-structure)
4. [API Routes](#4-api-routes)
5. [Component Specs](#5-component-specs)
6. [Acceptance Criteria](#6-acceptance-criteria)

---

## 1. User Flow

### 1.1 Initiating a Split

```
[Diner on Bill screen — taps "Split Bill"]
        │
        ▼
[SPLIT SETUP SCREEN]
  ┌─────────────────────────────────────────┐
  │  Split the Bill                         │
  │  Total: ₦12,800                         │
  │                                         │
  │  How many people are splitting?         │
  │                                         │
  │     [2]   [3]   [4]   [5]              │
  │                                         │
  │  Or enter a custom number: [___]        │
  │                                         │
  │  ─────────────────────────────────────  │
  │  Preview:                               │
  │  4 people × ₦3,200 each                │  ← updates live
  │                                         │
  │  [Generate Split Links →]              │
  └─────────────────────────────────────────┘
```

### 1.2 Split Status Screen (Table View)

```
[POST /api/splits/create called]
[bill_splits + bill_split_parts records created]
[Token generated: "XK9P2R"]
        │
        ▼
[SPLIT STATUS SCREEN]
  ┌─────────────────────────────────────────┐
  │  ← Split Bill · Table 5                 │
  │  Mama Put Uyo · Total: ₦12,800          │
  │                                         │
  │  Part 1 · ₦3,200                        │
  │  [Pay My Part Now]                      │  ← this device pays immediately
  │                                         │
  │  Part 2 · ₦3,200  ⏳ Waiting           │
  │  [Copy Link]  [WhatsApp]                │
  │                                         │
  │  Part 3 · ₦3,200  ⏳ Waiting           │
  │  [Copy Link]  [WhatsApp]                │
  │                                         │
  │  Part 4 · ₦3,200  ⏳ Waiting           │
  │  [Copy Link]  [WhatsApp]                │
  │                                         │
  │  ─────────────────────────────────────  │
  │  Progress: 0/4 paid                     │
  │  ⏰ Links expire in 2:00:00             │  ← countdown timer
  └─────────────────────────────────────────┘
```

### 1.3 Real-Time Status Updates

```
[Person 1 pays their part from this screen]
        │
        ▼
Part 1 · ₦3,200  ✅ Paid by You

[Friends open shared links on their phones and pay]
        │
        ▼
[Status screen updates in real time via Supabase Realtime]

Part 1 · ₦3,200  ✅ Paid
Part 2 · ₦3,200  ✅ Paid
Part 3 · ₦3,200  ⏳ Waiting  [Send Reminder]
Part 4 · ₦3,200  ✅ Paid

Progress: 3/4 paid
```

### 1.4 Individual Split Payer Flow (Friend's Phone)

```
[Friend opens link: scanserve.ng/split/XK9P2R/2]
        │
        ▼
[INDIVIDUAL SPLIT PAGE]
  ┌─────────────────────────────────────────┐
  │  🍽 Mama Put Uyo                        │
  │                                         │
  │  Your share of the bill                 │
  │  Part 2 of 4                            │
  │                                         │
  │  ₦3,200                                 │
  │                                         │
  │  [Pay ₦3,200 →]                        │
  │                                         │
  │  ─────────────────────────────────────  │
  │  Table 5 · {time} · {date}              │
  └─────────────────────────────────────────┘
        │
        ├─ Taps "Pay" → Paystack modal opens for ₦3,200
        │
        ├─ Already paid → Shows "✅ Already paid. Thank you!"
        │
        └─ Link expired → Shows "⏰ This split has expired.
                                   Ask the table to regenerate."
```

### 1.5 All Parts Paid

```
[All 4 parts paid]
        │
        ▼
[bill_splits.status → 'complete']
[orders.status → 'paid']
        │
        ▼
[Split status screen shows:]
  ✅ All parts paid! Enjoy your meal.

[All payers who provided phone receive WhatsApp receipt]
```

### 1.6 Send Reminder

```
[Person 1 taps "Send Reminder" on Part 3]
        │
        ▼
[Only available if Part 3 payer_phone was captured]
[POST /api/splits/:token/:partNumber/remind]
        │
        ▼
[WhatsApp message sent to part 3's phone:]
  "Hey! Your share of the bill at Mama Put Uyo is ready.
   Pay ₦3,200 here: scanserve.ng/split/XK9P2R/3
   Link expires soon!"
```

---

## 2. Split Token System

```typescript
// lib/split-token.ts

// Generate a short, URL-safe, human-readable token
// 6 characters: uppercase letters + digits, no ambiguous chars (0, O, I, 1)

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export const generateSplitToken = (): string => {
  let token = ''
  const array = new Uint8Array(6)
  crypto.getRandomValues(array)
  for (const byte of array) {
    token += CHARS[byte % CHARS.length]
  }
  return token
}

// Split URL format:
// Status page (initiator): scanserve.ng/split/XK9P2R
// Individual payer:        scanserve.ng/split/XK9P2R/2

// Expiry: 2 hours from creation
// After expiry: show expired message, offer to regenerate
```

### Rounding Logic

```typescript
// Distribute total across N parts, with remainder on part 1
export const calculateSplitAmounts = (
  total: number,
  numParts: number
): number[] => {
  const base = Math.floor((total * 100) / numParts) / 100  // floor to kobo precision
  const remainder = Math.round((total - base * numParts) * 100) / 100
  return [
    base + remainder,           // Part 1 gets any remainder
    ...Array(numParts - 1).fill(base)
  ]
}

// Example: ₦12,800 / 3 = [₦4,267, ₦4,267, ₦4,266] — NOT [₦4,266.67, ...]
// Paystack does not accept fractional kobo
```

---

## 3. File Structure

```
app/
├── split/
│   └── [token]/
│       ├── page.tsx              ← split status screen (initiator view)
│       └── [partNumber]/
│           └── page.tsx          ← individual payer page
│
├── components/
│   └── diner/
│       ├── SplitSetupScreen.tsx  ← choose number of payers
│       ├── SplitStatusScreen.tsx ← live split status with Realtime
│       ├── SplitPartRow.tsx      ← individual part row with status + actions
│       ├── SplitPayerPage.tsx    ← page for friend paying their share
│       └── SplitExpiredPage.tsx  ← expired link state
│
app/
└── api/
    └── splits/
        ├── create/
        │   └── route.ts
        ├── [token]/
        │   ├── route.ts          ← GET split status
        │   └── [partNumber]/
        │       ├── route.ts      ← GET individual part
        │       ├── pay/
        │       │   └── route.ts  ← POST initialize payment for part
        │       └── remind/
        │           └── route.ts  ← POST send WhatsApp reminder
```

---

## 4. API Routes

### POST `/api/splits/create`

```typescript
// Public — validated by diner_session_id + order_id
{
  order_id: string,
  diner_session_id: string,
  num_parts: number   // 2–20
}

// Server logic:
// 1. Verify order belongs to diner_session_id
// 2. Verify order status = 'served' (can't split unpaid bill mid-meal easily)
// 3. Calculate split amounts via calculateSplitAmounts()
// 4. Generate unique token (retry if collision)
// 5. INSERT bill_splits record
// 6. INSERT bill_split_parts records (part_number 1..N, amount each)

// Response:
{
  data: {
    split_id: string,
    token: string,               // e.g. "XK9P2R"
    total_amount: number,
    num_parts: number,
    amount_per_part: number,     // base amount (part 1 may differ by rounding)
    parts: [
      { part_number: 1, amount: 3267, status: "unpaid" },
      { part_number: 2, amount: 3267, status: "unpaid" },
      ...
    ],
    expires_at: string,
    status_url: "https://scanserve.ng/split/XK9P2R",
    part_urls: [
      "https://scanserve.ng/split/XK9P2R/1",
      "https://scanserve.ng/split/XK9P2R/2",
      ...
    ]
  }
}
```

### GET `/api/splits/:token`

```typescript
// Public — no auth needed (token IS the auth)
// Response:
{
  data: {
    token: string,
    restaurant_name: string,
    table_number: number,
    total_amount: number,
    num_parts: number,
    status: "open" | "partial" | "complete",
    expires_at: string,
    is_expired: boolean,
    parts: [
      {
        part_number: number,
        amount: number,
        status: "unpaid" | "paid",
        paid_at: string | null
      }
    ],
    paid_count: number,
    remaining_count: number
  }
}
```

### GET `/api/splits/:token/:partNumber`

```typescript
// Public
// Response:
{
  data: {
    part_number: number,
    total_parts: number,
    amount: number,
    status: "unpaid" | "paid",
    restaurant_name: string,
    restaurant_logo_url: string,
    table_number: number,
    is_expired: boolean,
    already_paid: boolean
  }
}

// Errors:
{ error: "Split not found", code: "NOT_FOUND" }
{ error: "Split has expired", code: "EXPIRED" }
{ error: "Part already paid", code: "ALREADY_PAID" }
```

### POST `/api/splits/:token/:partNumber/pay`

```typescript
// Public
// Initializes Paystack payment for a specific split part
{
  payer_name?: string,
  payer_phone?: string
}

// Response:
{
  data: {
    paystack_reference: string,
    amount: number,
    amount_kobo: number
  }
}
// Note: metadata passed to Paystack includes split_id + part_number
// Webhook handler (06_payment_receipts.md) handles completion
// Additional webhook logic for splits:
//   - Mark bill_split_parts record as paid
//   - Check if all parts paid → mark bill_splits.status = 'complete'
//   - Check if all parts paid → mark orders.status = 'paid'
```

### POST `/api/splits/:token/:partNumber/remind`

```typescript
// Public — rate limited: 1 reminder per part per 10 minutes
{
  token: string,
  part_number: number
}
// Sends WhatsApp to bill_split_parts.payer_phone if set
// Returns 200 if sent, 422 if no phone on file
```

---

## 5. Component Specs

### `<SplitStatusScreen />`

```typescript
// Props: token: string
//
// Behavior:
//   - Subscribes to Supabase Realtime on bill_split_parts for this split_id
//   - Updates part status rows in real time as friends pay
//   - Shows countdown timer to expiry (updates every second)
//   - "Copy Link" copies part URL to clipboard with toast confirmation
//   - "WhatsApp" opens: https://wa.me/?text=Your+share+of+the+bill...
//   - "Send Reminder" only shown for unpaid parts with payer_phone set
//   - When all parts paid: shows celebration state + "Order Complete"
```

### `<SplitPayerPage />`

```typescript
// Standalone page — no table context needed
// Friend lands here from shared link
// Shows: restaurant branding, amount, pay button
// No loyalty capture on split payer (too much friction)
// After payment: shows success + receipt note
```

---

## 6. Acceptance Criteria

- [ ] Split link works on any phone without scanning original QR
- [ ] Friend can pay their share within 30 seconds of opening link
- [ ] Split amounts calculated correctly with remainder on part 1 (no fractional kobo)
- [ ] Split links expire after 2 hours (confirmed server-side, not just client)
- [ ] Status screen updates in real time as each part is paid
- [ ] Countdown timer visible on status screen
- [ ] "Copy Link" copies correct URL to clipboard with toast feedback
- [ ] "WhatsApp" button pre-fills message with link and amount
- [ ] Order marked `paid` only when ALL parts are paid
- [ ] WhatsApp receipts sent to all payers who provided a phone number
- [ ] Already-paid link shows friendly "already paid" message
- [ ] Expired link shows clear message with option to return to table
- [ ] Reminder button rate-limited (can't spam)

---

*Next: `08_order_queue_dashboard.md`*
