# 05 — Diner Ordering Flow

**Module:** 4 | **Depends on:** `01_data_models.md`, `03_menu_management.md`, `04_qr_code_system.md`  
**Responsive:** See `00b_responsive_design_spec.md` — Diner pages always render as a **max-width 480px centered shell** on desktop. Do not create wide desktop layouts for any diner-facing screen. The experience is intentionally app-like on all screen sizes. Bottom sheets on mobile become the same bottom sheets inside the shell on desktop.

> This is the most critical user-facing module. Every interaction must be fast, clear, and work on an Android phone with intermittent 4G. Test everything on a Tecno or Infinix device before marking done.

---

## Table of Contents

1. [User Flow — Full Walkthrough](#1-user-flow--full-walkthrough)
2. [Diner Session Management](#2-diner-session-management)
3. [File Structure](#3-file-structure)
4. [API Routes](#4-api-routes)
5. [Component Specs](#5-component-specs)
6. [State Management](#6-state-management)
7. [Acceptance Criteria](#7-acceptance-criteria)

---

## 1. User Flow — Full Walkthrough

### 1.1 Entry via QR Scan

```
[Diner scans QR code at Table 5]
        │
        ▼
[Browser opens: scanserve.ng/mama-put-uyo/t/5]
        │
        ▼
[LOADING STATE — target: < 2 seconds on 3G]
  - Skeleton loaders for menu items
  - Restaurant branding renders first (logo, name)
  - Service Worker caches menu JSON + images for offline
        │
        ▼
[MENU PAGE renders]
```

### 1.2 Menu Browsing

```
[MENU PAGE]
  ┌─────────────────────────────────────────┐
  │  🍽 Mama Put Uyo          🛒 0          │  ← header: name + cart badge
  │  Table 5                                │
  │  ─────────────────────────────────────  │
  │  [Starters] [Mains] [Drinks] [Desserts] │  ← sticky category tabs
  │  ─────────────────────────────────────  │
  │                                         │
  │  ⭐ FEATURED                            │  ← featured items strip (horizontal scroll)
  │  [Jollof Rice ₦2,500] [Suya ₦3,200]... │
  │                                         │
  │  STARTERS                               │
  │  ┌───────┐  Peppered Snail   ₦3,200     │
  │  │  img  │  Rich peppered sauce         │
  │  │       │                    [+ Add]   │
  │  └───────┘                              │
  │                                         │
  │  ┌───────┐  Spring Rolls     ₦1,800     │
  │  │  img  │  Crispy, served with dip     │
  │  │       │          [SOLD OUT]          │  ← greyed, unclickable
  │  └───────┘                              │
  └─────────────────────────────────────────┘

  Sticky bottom bar (when cart has items):
  ┌─────────────────────────────────────────┐
  │  🛒 2 items              View Order ›   │
  └─────────────────────────────────────────┘
```

### 1.3 Adding an Item — No Modifiers

```
[Diner taps "+ Add" on Spring Rolls]
        │
        ▼
[Item added directly to cart]
[Cart badge increments: 0 → 1]
[Brief haptic feedback on mobile (if supported)]
[Button changes: [+ Add] → [1 ▾] with quantity control]
```

### 1.4 Adding an Item — With Modifiers

```
[Diner taps "+ Add" on Jollof Rice (has modifiers)]
        │
        ▼
[ITEM DETAIL MODAL slides up from bottom]
  ┌─────────────────────────────────────────┐
  │  [Full-width photo]                     │
  │                                    [✕]  │
  │  Jollof Rice                           │
  │  Smoky party jollof. Served with...    │
  │  ₦2,500                                 │
  │  ─────────────────────────────────────  │
  │  Spice Level *required                  │
  │  ○ Mild         ○ Medium                │
  │  ○ Hot          ○ Extra Hot (+₦200)     │
  │  ─────────────────────────────────────  │
  │  Add-ons (optional, max 2)              │
  │  ☐ Extra Sauce   +₦300                  │
  │  ☐ Extra Protein +₦500                  │
  │  ─────────────────────────────────────  │
  │  Special note (optional)                │
  │  [_________________________________]    │
  │  ─────────────────────────────────────  │
  │  Quantity:   [−]  1  [+]               │
  │  ─────────────────────────────────────  │
  │  [Add to Order — ₦2,500]               │  ← disabled until required modifiers selected
  └─────────────────────────────────────────┘
        │
        ▼
[Diner selects "Hot" → [Add to Order] button activates]
[Taps button → Item added to cart, modal closes]
```

### 1.5 Cart View

```
[Diner taps cart icon or bottom "View Order" bar]
        │
        ▼
[CART SCREEN]
  ┌─────────────────────────────────────────┐
  │  ← Your Order              Table 5      │
  │  ─────────────────────────────────────  │
  │  Jollof Rice (Hot)                      │
  │  ₦2,500                   [−] 1 [+] [🗑]│
  │                                         │
  │  Spring Rolls                           │
  │  ₦1,800                   [−] 1 [+] [🗑]│
  │                                         │
  │  ─────────────────────────────────────  │
  │  Special instructions (optional)        │
  │  [No onions please____________]         │
  │  ─────────────────────────────────────  │
  │  Subtotal               ₦4,300          │
  │                                         │
  │  [Place Order — ₦4,300]                │  ← primary CTA
  └─────────────────────────────────────────┘
```

### 1.6 Loyalty Phone Capture (Before Order Submission)

```
[Diner taps "Place Order"]
        │
        ├─ restaurant.loyalty_enabled = true?
        │     ▼
        │  [PHONE CAPTURE MODAL]
        │  ┌───────────────────────────────────┐
        │  │  🏆 Earn Loyalty Points            │
        │  │                                   │
        │  │  Enter your phone to earn points  │
        │  │  on every visit to Mama Put Uyo   │
        │  │                                   │
        │  │  +234 [_______________________]   │
        │  │                                   │
        │  │  [Earn Points →]   [Skip →]       │
        │  └───────────────────────────────────┘
        │     │
        │     ├─ Enters phone + taps "Earn Points"
        │     │     → Phone stored in order + loyalty profile looked up/created
        │     │     → If returning customer: "Welcome back! You have 340 pts 🏆"
        │     │
        │     └─ Taps "Skip"
        │           → Order proceeds without phone, no loyalty tracking
        │
        └─ loyalty_enabled = false → skip directly to order submission
        │
        ▼
[Order validation]
  - All items still available? (re-check server-side)
  - Restaurant still accepting orders?
        │
        ├─ Validation passes → POST /api/orders
        └─ Item no longer available → "Sorry, [item] just sold out. Remove it to continue."
```

### 1.7 Order Confirmation

```
[Order submitted successfully]
        │
        ▼
[ORDER CONFIRMATION SCREEN]
  ┌─────────────────────────────────────────┐
  │       ✅ Order Placed!                  │
  │       Mama Put Uyo · Table 5           │
  │                                         │
  │  Jollof Rice (Hot)          ₦2,500     │
  │  Spring Rolls               ₦1,800     │
  │  ─────────────────────────────────────  │
  │  Total                      ₦4,300     │
  │                                         │
  │  ⏱ Est. ready in ~20 mins              │
  │                                         │
  │  [+ Add More Items]                     │
  └─────────────────────────────────────────┘
  
  Live status bar (updates in real time):
  ● Order Received → ● In Kitchen → ○ Ready → ○ Served
```

### 1.8 Adding More Items to Same Order

```
[Diner taps "+ Add More Items"]
        │
        ▼
[Returns to menu with same order context]
[New items added to SAME order_id]
[Kitchen dashboard shows "+ added" badge on existing order]
[Status bar shows combined estimated time]
```

### 1.9 Requesting the Bill

```
[Order status reaches "served"]
["Get Bill" button activates on confirmation screen]
        │
        ▼
[BILL SCREEN — see Module 5 (06_payment_receipts.md)]
```

---

## 2. Diner Session Management

```typescript
// lib/diner-session.ts
// No login required. Diner identified by anonymous UUID in localStorage.

const SESSION_KEY = 'scanserve_session_id'
const ACTIVE_ORDER_KEY = 'scanserve_active_order'

export const getDinerSessionId = (): string => {
  if (typeof window === 'undefined') return ''
  let sessionId = localStorage.getItem(SESSION_KEY)
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, sessionId)
  }
  return sessionId
}

export const setActiveOrder = (orderId: string, restaurantSlug: string): void => {
  localStorage.setItem(ACTIVE_ORDER_KEY, JSON.stringify({
    orderId,
    restaurantSlug,
    createdAt: Date.now()
  }))
}

export const getActiveOrder = (): { orderId: string, restaurantSlug: string } | null => {
  const raw = localStorage.getItem(ACTIVE_ORDER_KEY)
  if (!raw) return null
  const parsed = JSON.parse(raw)
  // Expire after 3 hours
  if (Date.now() - parsed.createdAt > 3 * 60 * 60 * 1000) {
    localStorage.removeItem(ACTIVE_ORDER_KEY)
    return null
  }
  return parsed
}

export const clearActiveOrder = (): void => {
  localStorage.removeItem(ACTIVE_ORDER_KEY)
}
```

---

## 3. File Structure

```
// IMPORTANT: All diner pages render inside a max-w-[480px] centered shell on desktop.
// See 00b_responsive_design_spec.md Section 2a for the shell CSS.
// Do NOT create two-column or wide layouts for any path under [restaurantSlug].

app/
├── [restaurantSlug]/
│   ├── page.tsx
│   └── t/
│       └── [tableNumber]/
│           └── page.tsx              ← wraps everything in .diner-shell
│
├── components/
│   └── diner/
│       ├── DinerShell.tsx            ← max-w-[480px] mx-auto wrapper
│       │   // On desktop: adds box-shadow and min-height:100vh background
│       │   // On mobile: full-width, no shell styling needed
│       ├── MenuPage.tsx
│       ├── RestaurantHeader.tsx      ← fixed top, full-width within shell
│       ├── CategoryTabs.tsx          ← sticky below header, horizontal scroll
│       ├── FeaturedStrip.tsx         ← horizontal scroll strip
│       ├── CategorySection.tsx
│       ├── MenuItemCard.tsx
│       │   // Mobile + Desktop: identical — 72px min height, image left
│       ├── SoldOutBadge.tsx
│       ├── ItemDetailModal.tsx
│       │   // Both: slides up from bottom within the shell
│       │   // NOT a centered dialog — always bottom sheet
│       ├── ModifierSelector.tsx
│       ├── CartBottomBar.tsx         ← fixed to bottom of shell (not viewport on desktop)
│       ├── CartScreen.tsx
│       │   // Mobile: full-screen slide-up
│       │   // Desktop: full-screen within the 480px shell
│       ├── CartItem.tsx
│       ├── PhoneCaptureModal.tsx     ← bottom sheet in shell
│       ├── OrderConfirmation.tsx
│       ├── OrderStatusBar.tsx
│       └── BillRequestButton.tsx
```

---

## 4. API Routes

### GET `/api/menu/:restaurantSlug`

```typescript
// Public — no auth
// Returns restaurant info + full menu
// Response:
{
  data: {
    restaurant: {
      id, name, slug, description,
      logo_url, cover_image_url,
      is_accepting_orders,
      currency, vat_enabled, vat_rate,
      loyalty_enabled  // from restaurant_settings
    },
    categories: [
      {
        id, name, sort_order,
        items: [
          {
            id, name, description, price,
            photo_url, is_available, is_featured,
            tags, allergens, preparation_time_mins,
            modifier_groups
          }
        ]
      }
    ]
  }
}

// Cache headers: Cache-Control: s-maxage=30, stale-while-revalidate=60
// Realtime availability changes bypass cache via Supabase subscription on client
```

### POST `/api/orders`

```typescript
// Public — no auth (diner places order)
// Request:
{
  restaurant_id: string,
  table_id: string,
  table_number: number,
  diner_session_id: string,   // from localStorage
  diner_phone?: string,       // optional, for loyalty
  items: [
    {
      menu_item_id: string,
      quantity: number,
      modifiers: [            // selected modifier options
        { group_id: string, option_id: string, name: string, price_delta: number }
      ],
      special_note?: string
    }
  ],
  special_instructions?: string
}

// Server logic:
// 1. Validate restaurant exists + is_accepting_orders = true
// 2. Validate all menu_item_ids exist + is_available = true
// 3. Calculate line_totals, modifier_totals, subtotal, vat, grand total
// 4. Create orders record
// 5. Create order_items records (snapshot item_name + item_price at time of order)
// 6. If diner_phone: call loyalty profile upsert
// 7. Broadcast to Supabase Realtime channel: orders:${restaurant_id}
// 8. Return order details

// Response:
{
  data: {
    order_id: string,
    table_number: number,
    items: OrderItem[],
    subtotal: number,
    total_amount: number,
    estimated_ready_mins: number   // max prep time across all items
  }
}

// Errors:
{ error: "Restaurant not accepting orders", code: "NOT_ACCEPTING" }
{ error: "Item 'Peppered Snail' is no longer available", code: "ITEM_UNAVAILABLE" }
```

### PATCH `/api/orders/:id/add-items`

```typescript
// Public — validated by diner_session_id match
// Request:
{
  diner_session_id: string,   // must match existing order
  items: [ ...same format as POST /api/orders items... ]
}

// Server logic:
// 1. Verify order belongs to diner_session_id
// 2. Verify order status is not 'paid' or 'cancelled'
// 3. Append new order_items
// 4. Recalculate order totals
// 5. Broadcast update to kitchen dashboard
```

### GET `/api/orders/:id/status`

```typescript
// Public — validated by diner_session_id in query param
// Query: ?session=diner_session_id
// Response:
{
  data: {
    order_id: string,
    status: "pending" | "confirmed" | "in_kitchen" | "ready" | "served" | "paid",
    items: [{ id, item_name, quantity, status }],
    can_request_bill: boolean,   // true when status = 'served'
    estimated_ready_at: string | null
  }
}
```

---

## 5. Component Specs

### `<MenuItemCard />`

```typescript
// Props:
//   item: MenuItem
//   onAdd: (item: MenuItem) => void
//
// States:
//   - Available, not in cart: shows "+ Add" button
//   - Available, in cart: shows quantity stepper [− 1 +]
//   - Sold out: greyed out, "Sold Out" badge, no button
//   - No photo: shows placeholder with food emoji
//
// Subscribes to Supabase Realtime for is_available changes
// Updates without page reload
```

### `<ItemDetailModal />`

```typescript
// Props:
//   item: MenuItem
//   isOpen: boolean
//   onClose: () => void
//   onAddToCart: (cartItem: CartItem) => void
//
// Behavior:
//   - Slides up from bottom on mobile (sheet pattern)
//   - Required modifier groups validated before "Add" button activates
//   - Price in "Add to Order" button updates as modifiers selected
//   - Quantity stepper: min 1, max 20
//   - Special note: plain text input, max 100 chars
```

### `<PhoneCaptureModal />`

```typescript
// Props:
//   restaurantName: string
//   onSubmit: (phone: string) => void
//   onSkip: () => void
//
// Behavior:
//   - Nigerian phone format: accepts 080XXXXXXXX or +234XXXXXXXXX
//   - Shows existing loyalty balance if phone is already registered
//   - "Skip" is always visible and accessible — never hidden or de-emphasized
//   - Shown once per order — if skipped, don't show again for same order
```

### `<OrderStatusBar />`

```typescript
// Props:
//   orderId: string
//   initialStatus: OrderStatus
//
// Behavior:
//   - Subscribes to Supabase Realtime for order status changes
//   - Shows 4 steps: Received → Kitchen → Ready → Served
//   - Active step highlighted, completed steps filled
//   - Estimated time countdown when status = 'in_kitchen'
//   - Gentle pulse animation on active step
```

---

## 6. State Management

```typescript
// Use Zustand for cart state — persisted to localStorage
// npm install zustand

// store/cart.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  menu_item_id: string
  item_name: string
  item_price: number
  quantity: number
  modifiers: SelectedModifier[]
  modifier_total: number
  line_total: number
  special_note?: string
}

interface CartStore {
  restaurantSlug: string | null
  tableNumber: number | null
  items: CartItem[]
  specialInstructions: string
  addItem: (item: CartItem) => void
  removeItem: (menu_item_id: string) => void
  updateQuantity: (menu_item_id: string, quantity: number) => void
  setSpecialInstructions: (text: string) => void
  clearCart: () => void
  subtotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      restaurantSlug: null,
      tableNumber: null,
      items: [],
      specialInstructions: '',
      addItem: (item) => set((state) => {
        const existing = state.items.find(i => i.menu_item_id === item.menu_item_id)
        if (existing) {
          return {
            items: state.items.map(i =>
              i.menu_item_id === item.menu_item_id
                ? { ...i, quantity: i.quantity + item.quantity, line_total: (i.quantity + item.quantity) * (i.item_price + i.modifier_total) }
                : i
            )
          }
        }
        return { items: [...state.items, item] }
      }),
      removeItem: (id) => set(state => ({
        items: state.items.filter(i => i.menu_item_id !== id)
      })),
      updateQuantity: (id, qty) => set(state => ({
        items: qty === 0
          ? state.items.filter(i => i.menu_item_id !== id)
          : state.items.map(i => i.menu_item_id === id
              ? { ...i, quantity: qty, line_total: qty * (i.item_price + i.modifier_total) }
              : i
          )
      })),
      setSpecialInstructions: (text) => set({ specialInstructions: text }),
      clearCart: () => set({ items: [], specialInstructions: '' }),
      subtotal: () => get().items.reduce((sum, i) => sum + i.line_total, 0)
    }),
    {
      name: 'scanserve-cart',
      // Clear cart after 3 hours
      onRehydrateStorage: () => (state) => {
        // Check timestamp, clear if stale
      }
    }
  )
)
```

---

## 7. Acceptance Criteria

- [ ] Menu loads in < 2 seconds on 3G (test with Chrome DevTools throttling)
- [ ] Sold-out items are visually distinct (greyed, badge) and completely unclickable
- [ ] Modifier modal blocks "Add" button until all required selections are made
- [ ] Price in "Add to Order" button updates in real-time as modifiers are selected
- [ ] Cart persists across page navigation and on browser back/forward
- [ ] Diner can add more items to same order after initial placement
- [ ] Order status updates in real time without page reload (Supabase Realtime)
- [ ] Phone capture for loyalty shows "Skip" at all times — never mandatory
- [ ] Returning customer shown their current points balance on phone capture
- [ ] "Get Bill" button only activates when order status = 'served'
- [ ] Works correctly on: Chrome Android, Samsung Internet, Safari iOS
- [ ] Entire menu browsing works offline after first load (see Module 10)
- [ ] Restaurant name + table number always visible in header
- [ ] No app download prompt — full browser experience

---

*Next: `06_payment_receipts.md`*
