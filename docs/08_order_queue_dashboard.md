# 08 — Order Queue Dashboard (Kitchen/Floor)

**Module:** 7 | **Depends on:** `01_data_models.md`, `05_diner_ordering_flow.md`  
**Responsive:** See `00b_responsive_design_spec.md` — This dashboard is used on both staff phones (small Android) and owner laptops. Mobile: horizontal-scroll kanban with one column visible at a time + column tabs at top. Desktop: all 4 columns side by side in the main content area. Card density increases on desktop (more info visible per card).

---

## Table of Contents

1. [User Flow](#1-user-flow)
2. [Realtime Architecture](#2-realtime-architecture)
3. [Notification System](#3-notification-system)
4. [Manual Order Entry](#4-manual-order-entry)
5. [File Structure](#5-file-structure)
6. [API Routes](#6-api-routes)
7. [Component Specs](#7-component-specs)
8. [Acceptance Criteria](#8-acceptance-criteria)

---

## 1. User Flow

### 1.1 Staff Opens Dashboard

```
Mobile (<lg) — Staff phone:
  [COLUMN SELECTOR TABS — top, sticky]
  [Pending ●3] [Kitchen ●1] [Ready ●1] [Served]

  One column visible at a time, full-width cards
  Horizontal swipe OR tap tabs to switch columns
  Cards full width, action button full width at bottom

Desktop (lg+) — Owner laptop or mounted tablet:
  [TABLE STATUS BAR — top strip]
  ┌────────────┬────────────┬────────────┬────────────┐
  │  PENDING   │ IN KITCHEN │   READY    │   SERVED   │
  │────────────│────────────│────────────│────────────│
  │ [Table 5]  │ [Table 2]  │ [Table 7]  │ [Table 1]  │
  │ 2 items    │ 3 items    │ 1 item     │ ✅ Paid     │
  │ Just now   │ 12 min     │ ⚡ READY   │            │
  │ [Confirm▶] │ [Ready ▶]  │ [Served ▶] │            │
  └────────────┴────────────┴────────────┴────────────┘
  All 4 columns visible, equal width, scroll within each column
```

### 1.2 New Order Arrives

```
[Diner submits order from Table 9]
        │
        ▼
[Dashboard receives Supabase Realtime event]
[AUDIO NOTIFICATION plays — "ding" sound]
[New order card animates into PENDING column]
[Browser tab title flashes: "🔔 New Order — Table 9"]
        │
        ▼
[Staff taps order card to expand]

[EXPANDED ORDER CARD]
  ┌────────────────────────────────────────┐
  │  Table 9 · Just now           [✕]      │
  │  QR Order · 2 items                    │
  │  ──────────────────────────────────── │
  │  Jollof Rice                ×1         │
  │  Spice: Hot                            │
  │  Note: No tomatoes please              │
  │                                        │
  │  Chicken Suya               ×2         │
  │  No onions                             │
  │  ──────────────────────────────────── │
  │  [Confirm — In Kitchen ▶]              │
  └────────────────────────────────────────┘
        │
        ▼
[Staff taps "Confirm — In Kitchen"]
[Card moves to IN KITCHEN column]
[Diner's order status updates: "In Kitchen 👨‍🍳"]
```

### 1.3 Status Progression

```
PENDING → [Confirm] → IN KITCHEN → [Ready] → READY → [Served] → SERVED → (auto when paid) → PAID

Each transition:
  - PATCH /api/orders/:id/status
  - Supabase Realtime broadcasts to:
    a. All other dashboard sessions (same restaurant)
    b. Diner's order status screen
```

### 1.4 Per-Item Status (Large Orders)

```
[Order has 5+ items across different prep times]
        │
        ▼
[Staff can mark individual items ready]

Inside expanded order card:
  ☐ Jollof Rice        → [Mark Ready]
  ✅ Chicken Suya      → Ready
  ☐ Fried Plantain     → [Mark Ready]

[When all items marked ready: order auto-moves to READY column]
```

### 1.5 Order Age Color Coding

```
Time since order was placed (visible on every card):

< 10 minutes  →  🟢 Green  (normal)
10–20 minutes →  🟡 Amber  (getting long)
> 20 minutes  →  🔴 Red    (needs attention)

Helps floor manager prioritize without checking timestamps manually.
```

### 1.6 Table Status Bar

```
[Top of dashboard — always visible]

Table status overview across all tables:

[T1 ✅][T2 🍳][T3 🟢][T4 ⏳][T5 🔴][T6 🟢]...

Colors:
  🟢 = Available (no active order)
  🍳 = In kitchen
  ⏳ = Awaiting payment
  ✅ = Recently paid
  🔴 = Overdue (>20 mins in kitchen)

Tapping a table number filters the board to that table only.
```

---

## 2. Realtime Architecture

### Supabase Channel Subscription

```typescript
// hooks/useRealtimeOrders.ts
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export const useRealtimeOrders = (restaurantId: string) => {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    // Initial fetch
    fetchActiveOrders(restaurantId).then(setOrders)

    const supabase = createClient(/* ... */)

    // Subscribe to order changes
    const channel = supabase
      .channel(`restaurant-orders:${restaurantId}`)

      // New orders
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'orders',
        filter: `restaurant_id=eq.${restaurantId}`
      }, (payload) => {
        const newOrder = payload.new as Order
        setOrders(prev => [newOrder, ...prev])
        playNotificationSound()
        flashTabTitle(`🔔 New Order — Table ${newOrder.table_number}`)
      })

      // Status updates
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `restaurant_id=eq.${restaurantId}`
      }, (payload) => {
        const updated = payload.new as Order
        setOrders(prev =>
          prev.map(o => o.id === updated.id ? { ...o, ...updated } : o)
        )
      })

      // New items added to existing order
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'order_items'
        // No filter — will check order_id client-side
      }, (payload) => {
        const newItem = payload.new as OrderItem
        setOrders(prev =>
          prev.map(o => o.id === newItem.order_id
            ? { ...o, items: [...o.items, newItem], has_new_items: true }
            : o
          )
        )
      })

      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [restaurantId])

  return orders
}
```

---

## 3. Notification System

### Audio Notification

```typescript
// lib/notification-sound.ts
// Uses Web Audio API — no external files, works offline

let audioContext: AudioContext | null = null

// Must be called once after a user interaction to unlock audio on mobile
export const unlockAudio = () => {
  if (!audioContext) {
    audioContext = new AudioContext()
    // Play silent buffer to unlock
    const buffer = audioContext.createBuffer(1, 1, 22050)
    const source = audioContext.createBufferSource()
    source.buffer = buffer
    source.connect(audioContext.destination)
    source.start(0)
  }
}

export const playNewOrderSound = () => {
  if (!audioContext) return

  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  // Two-tone "ding ding" pattern
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime)
  oscillator.frequency.setValueAtTime(1100, audioContext.currentTime + 0.15)

  gainNode.gain.setValueAtTime(0.4, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.5)
}
```

### Browser Tab Flash

```typescript
// lib/tab-title.ts
let flashInterval: NodeJS.Timeout | null = null
const originalTitle = document.title

export const flashTabTitle = (message: string, durationMs = 10000) => {
  if (flashInterval) clearInterval(flashInterval)

  let isFlashing = false
  const startTime = Date.now()

  flashInterval = setInterval(() => {
    if (Date.now() - startTime > durationMs) {
      clearInterval(flashInterval!)
      document.title = originalTitle
      return
    }
    document.title = isFlashing ? originalTitle : message
    isFlashing = !isFlashing
  }, 1000)
}
```

### Audio Unlock on First Tap

```typescript
// In DashboardLayout — call unlockAudio on first staff interaction
// Mobile browsers block audio until user has interacted with page

useEffect(() => {
  const handleFirstInteraction = () => {
    unlockAudio()
    document.removeEventListener('touchstart', handleFirstInteraction)
    document.removeEventListener('click', handleFirstInteraction)
  }
  document.addEventListener('touchstart', handleFirstInteraction)
  document.addEventListener('click', handleFirstInteraction)
  return () => {
    document.removeEventListener('touchstart', handleFirstInteraction)
    document.removeEventListener('click', handleFirstInteraction)
  }
}, [])
```

---

## 4. Manual Order Entry

```
[Guest at table doesn't use QR — waiter takes order verbally]
        │
        ▼
[Staff taps "+ New Order" on dashboard]
        │
        ▼
[MANUAL ORDER FORM]
  ┌────────────────────────────────────────┐
  │  New Order                    [✕]      │
  │  ──────────────────────────────────── │
  │  Table: [dropdown 1–20]               │
  │                                        │
  │  Customer phone (optional):            │
  │  +234 [___________________]           │
  │                                        │
  │  Search menu: [___________________]   │
  │                                        │
  │  Jollof Rice          ₦2,500  [+ Add] │
  │  Peppered Snail       ₦3,200  [+ Add] │
  │  ...                                   │
  │                                        │
  │  ──────────────────────────────────── │
  │  Cart (2 items):                       │
  │  Jollof Rice ×1  ₦2,500               │
  │  Suya ×2         ₦6,400               │
  │  Total: ₦8,900                         │
  │                                        │
  │  [Submit Order]                        │
  └────────────────────────────────────────┘
        │
        ▼
[Order enters same queue as QR orders]
[Source = 'staff' on order record]
[Diner phone captured for loyalty if provided]
```

---

## 5. File Structure

```
app/
├── dashboard/
│   ├── layout.tsx                    ← dashboard shell (nav, auth guard)
│   └── orders/
│       ├── page.tsx                  ← main order board
│       └── components/
│           ├── OrderBoard.tsx        ← 4-column kanban layout
│           ├── OrderColumn.tsx       ← single status column
│           ├── OrderCard.tsx         ← collapsed order card
│           ├── OrderCardExpanded.tsx ← expanded with items + actions
│           ├── OrderItemRow.tsx      ← individual item with per-item status
│           ├── OrderAgeBadge.tsx     ← green/amber/red time indicator
│           ├── TableStatusBar.tsx    ← top table overview strip
│           ├── ManualOrderDrawer.tsx ← slide-in manual order form
│           └── NewOrderBadge.tsx     ← "NEW" badge on fresh orders
│
hooks/
└── useRealtimeOrders.ts
│
lib/
├── notification-sound.ts
└── tab-title.ts
```

---

## 6. API Routes

### GET `/api/orders`

```typescript
// Auth: restaurant owner or staff JWT
// Query params: ?restaurant_id=&status=&date=&table_number=
// Returns active orders for dashboard (last 6 hours, not paid/cancelled)
{
  data: [
    {
      id, table_number, status, source,
      created_at, updated_at,
      diner_name, diner_phone,
      subtotal, total_amount,
      age_minutes,    // computed: minutes since created_at
      has_new_items,  // true if items added after initial order
      items: [
        { id, item_name, quantity, modifiers, special_note, status }
      ]
    }
  ]
}
```

### PATCH `/api/orders/:id/status`

```typescript
// Auth: restaurant owner or staff JWT
{
  status: "confirmed" | "in_kitchen" | "ready" | "served"
}
// Actions:
//   1. Update orders.status
//   2. Broadcast Supabase Realtime to:
//      - channel: restaurant-orders:{restaurant_id}  (dashboard)
//      - channel: order-status:{order_id}            (diner status screen)
// Returns: { data: { id, status, updated_at } }
```

### PATCH `/api/orders/:id/items/:itemId/status`

```typescript
// Auth: restaurant owner or staff JWT
{ status: "preparing" | "ready" }
// When all items = 'ready': auto-advance order to 'ready' status
```

### POST `/api/orders` (Manual Entry)

```typescript
// Auth: restaurant owner or staff JWT
{
  source: "staff",
  restaurant_id: string,
  table_number: number,
  diner_phone?: string,
  items: [
    { menu_item_id: string, quantity: number, modifiers: [], special_note?: string }
  ]
}
// Same validation + loyalty logic as diner-placed orders
```

### PATCH `/api/orders/:id/mark-paid-manual`

```typescript
// Auth: restaurant owner or staff JWT
// For "Pay at Counter" fallback — manually marks order as paid
{
  payment_method: "cash" | "pos_terminal" | "other",
  amount_received: number
}
// Creates payments record with method and no paystack_reference
// Updates order status to 'paid'
```

---

## 7. Component Specs

### `<OrderCard />`

```typescript
// Props: order: Order, onExpand: () => void, onStatusAdvance: () => void
//
// Collapsed state shows:
//   - Table number (large, prominent)
//   - Item count
//   - Age badge (color-coded)
//   - Quick action button (advances to next status)
//   - "NEW" badge if order age < 2 minutes
//   - "+" badge if items added after initial order
//
// Tapping card body → expand
// Tapping action button → advance status (no expand required)
```

### `<OrderBoard />`

```typescript
// Props: restaurantId: string
// Uses useRealtimeOrders hook
//
// Mobile (<lg):
//   Column selector tabs at top (Pending | Kitchen | Ready | Served)
//   Active tab shows count badge
//   One column renders at a time — full viewport width
//   Horizontal swipe gesture (optional enhancement) switches columns
//
// Desktop (lg+):
//   CSS Grid: grid-cols-4, each column equal width
//   Each column scrolls independently (overflow-y-auto, max-h set)
//   All 4 columns always visible
//
// Both:
//   Empty state per column: "No pending orders" etc.
//   Column header shows count: "PENDING (3)"
```

---

## 8. Acceptance Criteria

- [ ] New order appears on dashboard within 5 seconds of diner placing it
- [ ] Audio notification plays on new order (tested on iOS Safari + Chrome Android)
- [ ] Browser tab title flashes with table number on new order
- [ ] Audio unlocked on first staff interaction (no silent audio on mobile)
- [ ] Order status advance works with single tap (no confirmation required for speed)
- [ ] Order status changes broadcast to diner's status screen in real time
- [ ] Manual order entry available and enters same queue as QR orders
- [ ] Order age shown in minutes with green/amber/red color coding
- [ ] Per-item status toggle available for large orders
- [ ] Dashboard installable as PWA (Add to Home Screen prompt)
- [ ] Works in portrait orientation on 5–6" Android phones
- [ ] "Pay at Counter" manual payment marking available for cash/POS transactions
- [ ] Table status bar shows real-time overview of all tables
- [ ] Dashboard remains usable during brief connectivity drops (cached UI)

---

*Next: `09_loyalty_system.md`*
