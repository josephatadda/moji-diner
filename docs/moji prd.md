# Moji — Development PRD & User Flow Documentation
**Version:** 2.0 | **Date:** March 2026 | **Status:** Active Development  
**Stack:** Next.js 14 · Supabase · Paystack · Tailwind CSS · TypeScript  
**Build Method:** AI-assisted (Cursor + Claude Code)  
**Market:** Nigeria — Launch city: Uyo → Lagos (Month 4)

---

> **How to use this document**  
> Each module is self-contained. Start with the Data Models section before building any module. Each feature section includes: user flow (step-by-step), database schema, API routes, component tree, and acceptance criteria. Feed individual module sections directly to Cursor or Claude Code as context.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Data Models](#2-data-models)
3. [Module 1 — Authentication & Restaurant Onboarding](#3-module-1--authentication--restaurant-onboarding)
4. [Module 2 — Menu Management](#4-module-2--menu-management)
5. [Module 3 — QR Code System](#5-module-3--qr-code-system)
6. [Module 4 — Diner Ordering Flow](#6-module-4--diner-ordering-flow)
7. [Module 5 — Payment & Receipts](#7-module-5--payment--receipts)
8. [Module 6 — Bill Splitting](#8-module-6--bill-splitting)
9. [Module 7 — Live Order Queue (Kitchen/Floor Dashboard)](#9-module-7--live-order-queue-kitchenfloor-dashboard)
10. [Module 8 — Loyalty & Repeat Customer Tracking](#10-module-8--loyalty--repeat-customer-tracking)
11. [Module 9 — Restaurant Analytics Dashboard](#11-module-9--restaurant-analytics-dashboard)
12. [Module 10 — Offline Support](#12-module-10--offline-support)
13. [Module 11 — Admin Panel](#13-module-11--admin-panel)
14. [API Reference](#14-api-reference)
15. [Environment Variables](#15-environment-variables)
16. [MVP Scope Boundary](#16-mvp-scope-boundary)
17. [Non-Goals](#17-non-goals)

---

## 1. Product Overview

### What Moji Is

A software-only QR-based restaurant ordering and payment platform. No hardware. No app downloads. A diner scans a QR code at their table → browses a live digital menu → places an order → pays → receives a WhatsApp receipt. The restaurant sees every order in real time on a live kitchen dashboard.

### The Core Loop

```
Diner scans QR → Menu loads in browser → 
Diner orders → Order hits kitchen dashboard → 
Diner requests bill → Pays via Paystack → 
WhatsApp receipt sent → Loyalty points recorded
```

### User Roles

| Role | Description | Primary Interface |
|------|-------------|-------------------|
| `restaurant_owner` | Creates/manages restaurant, menu, settings | Dashboard (web) |
| `staff` | Manages live orders, availability, floor | Dashboard (mobile web) |
| `diner` | Scans QR, orders, pays | PWA (no login required) |
| `admin` | Moji internal team | Admin panel |

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 14 App                        │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  /app/menu   │  │  /app/dash   │  │  /app/admin   │  │
│  │  (diner PWA) │  │  (restaurant)│  │  (internal)   │  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘  │
│         └─────────────────┼──────────────────┘          │
│                     API Routes                           │
│                  /app/api/[...]                          │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   Supabase       Paystack      Twilio
  (DB + Auth   (Payments +    (WhatsApp
  + Realtime    Webhooks)      Receipts)
  + Storage)
```

---

## 2. Data Models

> **Instruction for Cursor/Claude Code:** Create all these tables in Supabase. Enable Row Level Security (RLS) on every table. Use UUIDs as primary keys throughout. Run migrations in the order listed.

### 2.1 Core Tables

```sql
-- ================================================
-- RESTAURANTS
-- ================================================
CREATE TABLE restaurants (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  slug              TEXT UNIQUE NOT NULL, -- URL-safe, e.g. "mama-put-uyo"
  description       TEXT,
  address           TEXT,
  city              TEXT NOT NULL DEFAULT 'Uyo',
  phone             TEXT,
  instagram_handle  TEXT,
  logo_url          TEXT,
  cover_image_url   TEXT,
  currency          TEXT NOT NULL DEFAULT 'NGN',
  is_active         BOOLEAN DEFAULT true,
  is_accepting_orders BOOLEAN DEFAULT true,
  vat_enabled       BOOLEAN DEFAULT false,
  vat_rate          DECIMAL(4,2) DEFAULT 7.50,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- TABLES (physical restaurant tables)
-- ================================================
CREATE TABLE restaurant_tables (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id  UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number   INTEGER NOT NULL,
  label          TEXT, -- e.g. "Window Table", "VIP Room"
  capacity       INTEGER DEFAULT 4,
  qr_code_url    TEXT, -- stored QR image URL
  is_active      BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE(restaurant_id, table_number)
);

-- ================================================
-- MENU CATEGORIES
-- ================================================
CREATE TABLE menu_categories (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id  UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name           TEXT NOT NULL, -- e.g. "Starters", "Mains", "Drinks"
  description    TEXT,
  sort_order     INTEGER DEFAULT 0,
  is_active      BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- MENU ITEMS
-- ================================================
CREATE TABLE menu_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id     UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  price           DECIMAL(10,2) NOT NULL,
  photo_url       TEXT,
  is_available    BOOLEAN DEFAULT true,
  is_featured     BOOLEAN DEFAULT false,
  preparation_time_mins INTEGER DEFAULT 15,
  allergens       TEXT[], -- e.g. ['nuts', 'dairy']
  tags            TEXT[], -- e.g. ['spicy', 'vegetarian', 'bestseller']
  modifier_groups JSONB DEFAULT '[]', -- see modifier schema below
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- modifier_groups JSONB schema:
-- [
--   {
--     "id": "uuid",
--     "name": "Spice Level",
--     "required": true,
--     "min_selections": 1,
--     "max_selections": 1,
--     "options": [
--       { "id": "uuid", "name": "Mild", "price_delta": 0 },
--       { "id": "uuid", "name": "Medium", "price_delta": 0 },
--       { "id": "uuid", "name": "Hot", "price_delta": 0 }
--     ]
--   }
-- ]

-- ================================================
-- ORDERS
-- ================================================
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id        UUID REFERENCES restaurant_tables(id),
  table_number    INTEGER NOT NULL, -- denormalized for quick display
  diner_session_id TEXT NOT NULL, -- anonymous session UUID stored in localStorage
  diner_name      TEXT, -- optional, captured if loyalty profile exists
  diner_phone     TEXT, -- optional, for loyalty matching
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','in_kitchen','ready','served','paid','cancelled')),
  subtotal        DECIMAL(10,2) DEFAULT 0,
  vat_amount      DECIMAL(10,2) DEFAULT 0,
  tip_amount      DECIMAL(10,2) DEFAULT 0,
  total_amount    DECIMAL(10,2) DEFAULT 0,
  special_instructions TEXT,
  source          TEXT DEFAULT 'qr' CHECK (source IN ('qr','staff','manual')),
  split_session_id UUID, -- references bill_splits if this is a split bill
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- ORDER ITEMS
-- ================================================
CREATE TABLE order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id    UUID REFERENCES menu_items(id),
  item_name       TEXT NOT NULL, -- snapshot at time of order
  item_price      DECIMAL(10,2) NOT NULL, -- snapshot at time of order
  quantity        INTEGER NOT NULL DEFAULT 1,
  modifiers       JSONB DEFAULT '[]', -- selected modifier options
  modifier_total  DECIMAL(10,2) DEFAULT 0,
  line_total      DECIMAL(10,2) NOT NULL,
  special_note    TEXT,
  status          TEXT DEFAULT 'pending'
                    CHECK (status IN ('pending','preparing','ready','served','cancelled')),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- PAYMENTS
-- ================================================
CREATE TABLE payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            UUID REFERENCES orders(id),
  restaurant_id       UUID REFERENCES restaurants(id),
  paystack_reference  TEXT UNIQUE,
  amount              DECIMAL(10,2) NOT NULL,
  currency            TEXT DEFAULT 'NGN',
  method              TEXT CHECK (method IN ('card','bank_transfer','ussd','qr','mobile_money')),
  status              TEXT DEFAULT 'pending'
                        CHECK (status IN ('pending','success','failed','abandoned','refunded')),
  paystack_response   JSONB, -- raw Paystack webhook payload
  paid_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- BILL SPLITS
-- ================================================
CREATE TABLE bill_splits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID REFERENCES orders(id) ON DELETE CASCADE,
  restaurant_id   UUID REFERENCES restaurants(id),
  split_type      TEXT DEFAULT 'even' CHECK (split_type IN ('even','custom')),
  total_parts     INTEGER NOT NULL DEFAULT 2,
  amount_per_part DECIMAL(10,2),
  split_token     TEXT UNIQUE NOT NULL, -- short shareable token for URL
  status          TEXT DEFAULT 'open' CHECK (status IN ('open','partial','complete')),
  expires_at      TIMESTAMPTZ DEFAULT (now() + interval '2 hours'),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE bill_split_parts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  split_id        UUID REFERENCES bill_splits(id) ON DELETE CASCADE,
  part_number     INTEGER NOT NULL,
  amount          DECIMAL(10,2) NOT NULL,
  payer_name      TEXT,
  payer_phone     TEXT,
  payment_id      UUID REFERENCES payments(id),
  status          TEXT DEFAULT 'unpaid' CHECK (status IN ('unpaid','paid')),
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- LOYALTY PROFILES (V1)
-- ================================================
CREATE TABLE loyalty_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  phone           TEXT NOT NULL,
  name            TEXT,
  email           TEXT,
  total_points    INTEGER DEFAULT 0,
  total_visits    INTEGER DEFAULT 0,
  total_spent     DECIMAL(10,2) DEFAULT 0,
  tier            TEXT DEFAULT 'bronze'
                    CHECK (tier IN ('bronze','silver','gold')),
  first_visit_at  TIMESTAMPTZ DEFAULT now(),
  last_visit_at   TIMESTAMPTZ DEFAULT now(),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(restaurant_id, phone)
);

-- ================================================
-- LOYALTY TRANSACTIONS
-- ================================================
CREATE TABLE loyalty_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID REFERENCES loyalty_profiles(id) ON DELETE CASCADE,
  restaurant_id   UUID REFERENCES restaurants(id),
  order_id        UUID REFERENCES orders(id),
  type            TEXT NOT NULL CHECK (type IN ('earn','redeem','bonus','expire','manual')),
  points          INTEGER NOT NULL, -- positive = earn, negative = redeem
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- LOYALTY REWARDS (restaurant-configured)
-- ================================================
CREATE TABLE loyalty_rewards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL, -- e.g. "Free Drink"
  description     TEXT,
  points_required INTEGER NOT NULL,
  reward_type     TEXT CHECK (reward_type IN ('free_item','discount_percent','discount_amount')),
  reward_value    DECIMAL(10,2), -- discount amount or % depending on type
  free_item_id    UUID REFERENCES menu_items(id),
  is_active       BOOLEAN DEFAULT true,
  max_per_customer INTEGER DEFAULT NULL, -- null = unlimited
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- STAFF ACCOUNTS
-- ================================================
CREATE TABLE staff_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id),
  name            TEXT NOT NULL,
  role            TEXT DEFAULT 'staff' CHECK (role IN ('manager','staff','kitchen')),
  pin             TEXT, -- 4-digit PIN for quick dashboard login
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- RESTAURANT SETTINGS
-- ================================================
CREATE TABLE restaurant_settings (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id           UUID UNIQUE REFERENCES restaurants(id) ON DELETE CASCADE,
  -- Loyalty config
  loyalty_enabled         BOOLEAN DEFAULT true,
  points_per_naira        DECIMAL(6,4) DEFAULT 0.01, -- 1 point per ₦100 spent
  tier_silver_threshold   INTEGER DEFAULT 500,   -- points to reach silver
  tier_gold_threshold     INTEGER DEFAULT 2000,  -- points to reach gold
  -- Notifications
  whatsapp_receipts       BOOLEAN DEFAULT true,
  notify_new_order        BOOLEAN DEFAULT true,
  notify_low_stock        BOOLEAN DEFAULT false,
  -- Operations
  table_order_timeout_mins INTEGER DEFAULT 90,   -- auto-close table after N mins
  allow_special_instructions BOOLEAN DEFAULT true,
  require_diner_name      BOOLEAN DEFAULT false,
  tip_options             INTEGER[] DEFAULT '{0,5,10}', -- tip % options
  -- Paystack
  paystack_public_key     TEXT,
  paystack_secret_key     TEXT, -- stored encrypted
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);
```

### 2.2 Row Level Security Policies

```sql
-- Restaurants: owner can do everything; public can read active restaurants
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner full access" ON restaurants
  FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Public read active" ON restaurants
  FOR SELECT USING (is_active = true);

-- Menu items: restaurant owner manages; public reads available items
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages menu" ON menu_items
  FOR ALL USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );
CREATE POLICY "Public reads menu" ON menu_items
  FOR SELECT USING (true); -- filtered in query by restaurant_id

-- Orders: owner and staff see their restaurant's orders; diners see their session
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Restaurant sees own orders" ON orders
  FOR ALL USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );
CREATE POLICY "Diner sees own session orders" ON orders
  FOR SELECT USING (true); -- filtered by diner_session_id in app logic

-- Loyalty: owner manages; diners read own profile by phone
ALTER TABLE loyalty_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages loyalty" ON loyalty_profiles
  FOR ALL USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
  );
```

### 2.3 Realtime Subscriptions

Enable Supabase Realtime on these tables:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items; -- for availability updates
```

---

## 3. Module 1 — Authentication & Restaurant Onboarding

### 3.1 User Flow

```
[Owner visits moji.ng/signup]
        │
        ▼
[Enter email + password]
        │
        ▼
[Supabase sends verification email]
        │
        ▼
[Owner verifies email → redirected to /onboarding]
        │
        ▼
┌─────────────────────────────────┐
│  ONBOARDING WIZARD (3 steps)    │
│                                 │
│  Step 1: Restaurant Details     │
│  - Name (generates slug)        │
│  - City                         │
│  - Phone number                 │
│  - Instagram handle (optional)  │
│  - Upload logo (optional)       │
│                                 │
│  Step 2: Payment Setup          │
│  - Paystack public key          │
│  - Paystack secret key          │
│  - Test connection button       │
│                                 │
│  Step 3: Add Tables             │
│  - How many tables? (1–50)      │
│  - Auto-generates table records │
│  - Preview QR code for Table 1  │
└─────────────────────────────────┘
        │
        ▼
[Redirected to /dashboard]
[Success toast: "You're live! Share your QR codes."]
```

### 3.2 Staff Login Flow

```
[Staff visits /staff-login]
        │
        ▼
[Enter restaurant slug + 4-digit PIN]
        │
        ▼
[Validated against staff_accounts table]
        │
        ├─ Valid → [Redirect to /dashboard/orders (staff view)]
        └─ Invalid → [Error: "Incorrect PIN. Try again."]
```

### 3.3 File Structure

```
app/
├── (auth)/
│   ├── signup/page.tsx
│   ├── login/page.tsx
│   ├── verify-email/page.tsx
│   └── staff-login/page.tsx
├── onboarding/
│   ├── page.tsx            ← wizard wrapper
│   ├── step-1/page.tsx     ← restaurant details
│   ├── step-2/page.tsx     ← payment setup
│   └── step-3/page.tsx     ← table setup
```

### 3.4 API Routes

```
POST /api/auth/signup
  Body: { email, password }
  Action: Creates Supabase auth user

POST /api/onboarding/complete
  Body: { restaurant_details, paystack_keys, table_count }
  Action: Creates restaurant, restaurant_settings, restaurant_tables records
  Returns: { restaurant_id, slug }

POST /api/auth/staff-login
  Body: { slug, pin }
  Action: Validates PIN, returns session token for staff view
```

### 3.5 Acceptance Criteria

- [ ] Signup → email verification → onboarding completes in < 10 minutes
- [ ] Slug auto-generated from restaurant name (lowercase, hyphens, unique)
- [ ] Paystack test connection verifies API keys before saving
- [ ] Tables auto-created with sequential numbers on setup completion
- [ ] Staff PIN login works without email/password (4-digit only)
- [ ] Owner redirected to dashboard with empty state guidance on first login

---

## 4. Module 2 — Menu Management

### 4.1 User Flow — Owner Creates Menu

```
[Owner on /dashboard/menu]
        │
        ▼
[Empty state: "Your menu is empty. Add a category to start."]
        │
        ▼
[+ Add Category]
  → Name (e.g. "Starters"), Sort order
  → Save → Category appears
        │
        ▼
[+ Add Item (inside category)]
  → Photo upload (drag/drop or tap)
  → Name, Description, Price (₦)
  → Availability toggle (on by default)
  → Featured toggle
  → Tags (spicy, vegetarian, etc.) — chip select
  → Modifier groups (optional) — see below
  → Save
        │
        ▼
[Item appears in menu preview on right side (desktop) 
 or via "Preview" tab (mobile)]
        │
        ▼
[Owner can: reorder categories (drag), reorder items, 
 edit, duplicate, or delete any item]
```

### 4.2 User Flow — Real-Time Availability Toggle

```
[Service starts — kitchen runs out of Peppered Snail]
        │
        ▼
[Floor manager opens /dashboard/menu on mobile]
        │
        ▼
[Taps toggle next to "Peppered Snail"]
  → Status changes: Available → Sold Out
        │
        ▼
[Within 30 seconds: all active diner sessions 
 see "Peppered Snail" greyed out with "Sold Out" badge]
        │
        ▼
[At close of business or next morning:]
[Manager taps "Reset All Availability" 
 → all items return to Available]
```

### 4.3 Modifier Groups Flow

```
[Owner adds modifier group to a menu item]
        │
        ▼
[+ Add Modifier Group]
  → Group name: "Spice Level"
  → Required? Yes/No
  → Min selections: 1, Max selections: 1
        │
        ▼
[+ Add Options]
  → "Mild" (₦0 extra)
  → "Medium" (₦0 extra)
  → "Hot" (₦0 extra)
  → "Extra Hot" (+₦200)
        │
        ▼
[Saved to menu_items.modifier_groups JSONB]
[Diner sees options when adding this item to cart]
```

### 4.4 File Structure

```
app/
├── dashboard/
│   └── menu/
│       ├── page.tsx                  ← main menu management view
│       ├── components/
│       │   ├── CategoryCard.tsx
│       │   ├── MenuItemCard.tsx
│       │   ├── MenuItemForm.tsx      ← create/edit item form
│       │   ├── ModifierGroupBuilder.tsx
│       │   ├── AvailabilityToggle.tsx
│       │   ├── MenuPreview.tsx       ← live preview as diner sees it
│       │   └── ImageUploader.tsx     ← handles compress + Supabase upload
```

### 4.5 API Routes

```
GET    /api/menu/:restaurantSlug
  Returns: full menu (categories + items) — public, cached

POST   /api/menu/categories
  Body: { restaurant_id, name, sort_order }
  Auth: restaurant owner

PUT    /api/menu/categories/:id
PATCH  /api/menu/categories/:id/reorder
DELETE /api/menu/categories/:id

POST   /api/menu/items
  Body: { category_id, name, description, price, photo_url, ... }

PUT    /api/menu/items/:id
PATCH  /api/menu/items/:id/availability
  Body: { is_available: boolean }
  Action: Updates DB + triggers Supabase Realtime broadcast

DELETE /api/menu/items/:id

POST   /api/menu/upload-image
  Body: FormData with image file
  Action: Compress to < 200KB, upload to Supabase Storage
  Returns: { url }
```

### 4.6 Acceptance Criteria

- [ ] Menu item photo compressed automatically to < 200KB before storage
- [ ] Category/item drag-to-reorder works on both desktop and mobile
- [ ] Availability toggle updates diner-facing menu within 30 seconds
- [ ] "Reset all availability" button with confirmation modal
- [ ] Menu preview shows exactly what diners will see
- [ ] Modifier groups support: required/optional, min/max selections, price deltas
- [ ] Empty category shows "Add your first item" prompt inline

---

## 5. Module 3 — QR Code System

### 5.1 URL Structure

```
Public menu URL:
  https://moji.ng/[restaurant-slug]

Table-specific URL (used in QR codes):
  https://moji.ng/[restaurant-slug]/t/[table-number]

Bill split URL:
  https://moji.ng/split/[split-token]
```

### 5.2 User Flow — Owner Generates QR Codes

```
[Owner on /dashboard/tables]
        │
        ▼
[See list of tables with status indicators]
[Each table shows: number, label, active orders, QR preview]
        │
        ▼
[Owner clicks "Download All QR Codes"]
  → PDF generated with one QR per page
  → Each QR includes: restaurant name, table number, Moji branding
  → Formatted for A6 / business card printing
        │
        ▼
[OR: click individual table → "Download QR" for single table]
        │
        ▼
[Owner prints and places QR cards/stands on tables]
```

### 5.3 QR Code Generation Logic

```typescript
// QR data: full URL to table-specific page
// Format: text/URL (not binary, for maximum scanner compatibility)
// Error correction: M level (15% recovery — good for printed cards)
// Size: minimum 200x200px for reliable scanning at arm's length

import QRCode from 'qrcode'

const generateTableQR = async (slug: string, tableNumber: number) => {
  const url = `https://moji.ng/${slug}/t/${tableNumber}`
  const qrDataURL = await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'M',
    width: 300,
    margin: 2,
    color: { dark: '#1A1A2E', light: '#FFFFFF' }
  })
  return qrDataURL
}
```

### 5.4 PDF Generation for Printing

```typescript
// Use jsPDF + qrcode to generate printable PDF
// Each page: QR code + restaurant name + "Scan to Order" + table number
// Page size: A6 (105mm x 148mm) — fits standard table card holders

// npm install jspdf qrcode
```

### 5.5 File Structure

```
app/
├── dashboard/
│   └── tables/
│       ├── page.tsx              ← table list + management
│       └── components/
│           ├── TableCard.tsx
│           ├── QRCodeDisplay.tsx
│           └── QRPDFExport.tsx   ← generates print-ready PDF
```

### 5.6 API Routes

```
GET  /api/tables/:restaurantId
  Returns: all tables with current order status

POST /api/tables
  Body: { restaurant_id, table_number, label, capacity }

PUT  /api/tables/:id

DELETE /api/tables/:id
  Guard: Cannot delete table with active orders

GET  /api/tables/:id/qr
  Returns: QR code as PNG data URL
```

### 5.7 Acceptance Criteria

- [ ] QR code encodes correct table-specific URL
- [ ] QR scannable from phone camera without dedicated QR app (tests: iPhone Camera, Google Lens, Samsung Camera)
- [ ] PDF download generates one page per table, A6 format
- [ ] Each QR page includes restaurant name + table number + "Scan to Order" label
- [ ] Table list shows real-time order status (Available / Occupied / Awaiting Payment)

---

## 6. Module 4 — Diner Ordering Flow

> This is the most critical user-facing module. Every interaction must be fast, clear, and work on an Android phone with intermittent 4G.

### 6.1 Complete Diner User Flow

```
[Diner scans QR code at Table 5, Restaurant "Mama Put Uyo"]
        │
        ▼
[Browser opens: moji.ng/mama-put-uyo/t/5]
        │
        ▼
[LOADING STATE — < 2 seconds on 3G]
  - Restaurant branding (logo, cover image)
  - Service Worker caches menu JSON + images
        │
        ▼
[MENU PAGE]
  ┌─────────────────────────────────────┐
  │  🍽 Mama Put Uyo  ·  Table 5        │
  │  ─────────────────────────────────  │
  │  [Starters] [Mains] [Drinks] [...]  │ ← category tabs
  │                                     │
  │  ┌─────────┐  Jollof Rice    ₦2,500 │
  │  │  📸 img │  Smoky & seasoned...   │
  │  │         │  [+ Add]               │
  │  └─────────┘                        │
  │                                     │
  │  ┌─────────┐  Peppered Snail ₦3,200 │
  │  │  📸 img │  [SOLD OUT]            │ ← greyed, unclickable
  │  └─────────┘                        │
  └─────────────────────────────────────┘
        │
        ▼
[Diner taps "+ Add" on Jollof Rice]
        │
        ├─ Has modifiers? YES
        │     ▼
        │  [ITEM DETAIL MODAL]
        │  - Photo (full width)
        │  - Name + description + price
        │  - Modifier groups (required first)
        │    → "Spice Level" (required): ● Mild ○ Medium ○ Hot
        │  - Quantity selector (+/-)
        │  - Special note (free text, optional)
        │  - [Add to Order — ₦2,500]
        │
        └─ Has modifiers? NO
              ▼
           [Item added to cart directly]
           [Cart badge appears/updates in nav bar]
        │
        ▼
[CART — accessible via cart icon or bottom nav]
  - List of items with quantities + totals
  - Edit quantity inline (+ / -)
  - Remove item (swipe or X button)
  - Special instructions for whole order
  - Subtotal displayed
  - [Place Order] button (prominent)
        │
        ▼
[Diner taps "Place Order"]
        │
        ├─ loyalty_enabled for this restaurant? YES
        │     ▼
        │  [PHONE CAPTURE MODAL — optional]
        │  "Enter your phone to earn loyalty points"
        │  +234 [__________]
        │  [Earn Points] or [Skip]
        │     │
        │     ▼ (either path)
        │
        ├─ restaurant.is_accepting_orders = false?
        │     → [Error toast: "Restaurant is currently not accepting orders"]
        │
        ▼
[ORDER SUBMITTED]
  - POST to /api/orders
  - Optimistic UI: show "Order Placed! 🎉"
  - Kitchen dashboard receives order in real time
  - Order confirmation screen shows:
    - Items ordered
    - Estimated time (from menu_items.preparation_time_mins)
    - "Add more items" button
    - "Request Bill" button (disabled until order is served)
        │
        ▼
[DINER ADDS MORE ITEMS — OPTIONAL]
  - Taps "Add more items" → back to menu
  - New items added to SAME order (same order_id)
  - Kitchen sees updated order with "+ Added" badge
        │
        ▼
[ORDER STATUS UPDATES — real time via polling or push]
  - "Order Received ✓"
  - "In Kitchen 👨‍🍳"  
  - "Ready for pickup / Being served 🍽"
        │
        ▼
[REQUEST BILL]
  - Diner taps "Get Bill"
  - Bill screen shows itemized list + subtotal + VAT (if enabled) + tip
  - Tip selector: 0% / 5% / 10% / Custom
  - [Pay Now — ₦X,XXX] button
  - [Split Bill] button
```

### 6.2 Diner Session Management

```typescript
// No login required for diners
// Session identified by UUID stored in localStorage
// Created on first page load, persists for browser session

const getDinerSession = (): string => {
  const key = 'moji_session_id'
  let sessionId = localStorage.getItem(key)
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem(key, sessionId)
  }
  return sessionId
}
```

### 6.3 File Structure

```
app/
├── [restaurantSlug]/
│   ├── page.tsx              ← menu page (public)
│   ├── t/
│   │   └── [tableNumber]/
│   │       └── page.tsx      ← table-specific entry (sets context, loads menu)
│   └── components/
│       ├── MenuPage.tsx
│       ├── CategoryTabs.tsx
│       ├── MenuItemCard.tsx
│       ├── ItemDetailModal.tsx
│       ├── Cart.tsx
│       ├── CartItem.tsx
│       ├── OrderConfirmation.tsx
│       ├── OrderStatus.tsx
│       ├── BillView.tsx
│       └── PhoneCaptureModal.tsx  ← loyalty phone entry
```

### 6.4 API Routes

```
GET  /api/menu/:restaurantSlug
  Returns: { restaurant, categories, items }
  Cache: 30 seconds (revalidate on availability change)

POST /api/orders
  Body: {
    restaurant_id, table_id, table_number,
    diner_session_id, diner_phone (optional),
    items: [{ menu_item_id, quantity, modifiers, special_note }],
    special_instructions
  }
  Action:
    1. Validate all items exist + are available
    2. Calculate subtotal, VAT, total
    3. Create order + order_items records
    4. Broadcast to Supabase Realtime channel
    5. If diner_phone provided: create/update loyalty profile
  Returns: { order_id, order_number, estimated_time }

PATCH /api/orders/:id/add-items
  Body: { items: [...] }
  Action: Appends new items to existing order, recalculates total

GET  /api/orders/:id/status
  Returns: { status, items_status, estimated_ready_at }
```

### 6.5 Acceptance Criteria

- [ ] Menu loads in < 2 seconds on 3G connection
- [ ] Sold-out items are visually distinct and unclickable
- [ ] Modifier modal enforces required selections before allowing "Add"
- [ ] Cart persists across page navigation (stored in state + localStorage)
- [ ] Order placement optimistic UI — shows confirmation before server response
- [ ] Diner can add more items to same order after initial placement
- [ ] Order status updates without full page reload
- [ ] Phone capture for loyalty is optional — "Skip" always visible
- [ ] Entire ordering flow works offline (menu browsing) with "offline" banner
- [ ] Works correctly on Chrome Android, Samsung Browser, Safari iOS

---

## 7. Module 5 — Payment & Receipts

### 7.1 Payment Flow

```
[Diner on Bill screen — sees itemized total]
        │
        ▼
[Selects tip: 0% / 5% / 10% / ₦500 custom]
  → Total updates in real time
        │
        ▼
[Taps "Pay Now — ₦X,XXX"]
        │
        ▼
[Paystack inline modal opens]
  ┌─────────────────────────────────┐
  │  Pay ₦X,XXX                     │
  │  Mama Put Uyo                   │
  │                                 │
  │  [Card] [Bank Transfer] [USSD]  │ ← available channels
  │                                 │
  │  Card: [**** **** **** 4242]    │
  │  [Pay Now]                      │
  └─────────────────────────────────┘
        │
        ├─ Payment SUCCESS
        │     ▼
        │  [Paystack webhook fires → POST /api/webhooks/paystack]
        │     ▼
        │  [Server verifies signature + marks payment as success]
        │  [Order status updated → 'paid']
        │  [Loyalty points awarded if phone was provided]
        │  [WhatsApp receipt dispatched via Twilio]
        │     ▼
        │  [Diner sees: "Payment Successful! 🎉"]
        │  [Shows: receipt summary + loyalty points earned]
        │
        └─ Payment FAILED
              ▼
           [Error message: "Payment didn't go through. Try again."]
           [Paystack modal stays open — retry without re-opening]
           [After 3 failures: show "Pay at Counter" option]
```

### 7.2 Paystack Integration

```typescript
// Frontend: Initialize Paystack inline
// npm install @paystack/inline-js

const initializePayment = async (order: Order) => {
  const reference = `SS-${order.id.slice(0, 8)}-${Date.now()}`
  
  // Create payment record before opening modal
  await fetch('/api/payments/initialize', {
    method: 'POST',
    body: JSON.stringify({ order_id: order.id, reference, amount: order.total_amount })
  })
  
  const handler = PaystackPop.setup({
    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    email: `table-${order.table_number}@${order.restaurant_slug}.moji.ng`,
    amount: order.total_amount * 100, // Paystack uses kobo
    currency: 'NGN',
    ref: reference,
    channels: ['card', 'bank_transfer', 'ussd'],
    metadata: {
      order_id: order.id,
      restaurant_id: order.restaurant_id,
      table_number: order.table_number,
    },
    callback: (response) => {
      // Don't trust this — wait for webhook verification
      verifyPaymentOnServer(response.reference)
    },
    onClose: () => {
      // Payment modal closed without completing
      trackAbandonedPayment(reference)
    }
  })
  handler.openIframe()
}
```

### 7.3 Webhook Handler

```typescript
// app/api/webhooks/paystack/route.ts

export async function POST(req: Request) {
  const signature = req.headers.get('x-paystack-signature')
  const body = await req.text()
  
  // 1. Verify signature
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(body)
    .digest('hex')
  
  if (hash !== signature) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 })
  }
  
  const event = JSON.parse(body)
  
  if (event.event === 'charge.success') {
    const { reference, amount, metadata } = event.data
    
    // 2. Update payment record
    await supabase
      .from('payments')
      .update({ status: 'success', paid_at: new Date(), paystack_response: event.data })
      .eq('paystack_reference', reference)
    
    // 3. Update order status
    await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', metadata.order_id)
    
    // 4. Award loyalty points
    await awardLoyaltyPoints(metadata.order_id)
    
    // 5. Send WhatsApp receipt
    await sendWhatsAppReceipt(metadata.order_id)
  }
  
  return Response.json({ received: true })
}
```

### 7.4 WhatsApp Receipt

```typescript
// Uses Twilio WhatsApp API
// npm install twilio

const sendWhatsAppReceipt = async (orderId: string) => {
  const order = await getOrderWithItems(orderId)
  if (!order.diner_phone) return // No phone = no receipt
  
  const itemsList = order.items
    .map(i => `• ${i.item_name} x${i.quantity} — ₦${i.line_total.toLocaleString()}`)
    .join('\n')
  
  const message = `
✅ *Payment Confirmed — ${order.restaurant.name}*

Table ${order.table_number} · ${format(new Date(), 'dd MMM yyyy, h:mm a')}

${itemsList}

──────────────
Subtotal: ₦${order.subtotal.toLocaleString()}${order.vat_amount > 0 ? `\nVAT (7.5%): ₦${order.vat_amount.toLocaleString()}` : ''}${order.tip_amount > 0 ? `\nTip: ₦${order.tip_amount.toLocaleString()}` : ''}
*Total: ₦${order.total_amount.toLocaleString()}*

${order.loyalty_points_earned ? `🏆 You earned *${order.loyalty_points_earned} points* on your loyalty card!` : ''}

Thank you for dining with us! 🍽
  `.trim()
  
  await twilioClient.messages.create({
    from: 'whatsapp:+14155238886', // Twilio sandbox or business number
    to: `whatsapp:${order.diner_phone}`,
    body: message
  })
}
```

### 7.5 Acceptance Criteria

- [ ] Paystack modal opens in < 2 seconds
- [ ] Payment webhook verified with HMAC signature before processing
- [ ] Duplicate webhook events handled idempotently (check `paystack_reference` uniqueness)
- [ ] Order status updated to 'paid' within 5 seconds of successful payment
- [ ] WhatsApp receipt sent within 60 seconds of payment confirmation
- [ ] "Pay at Counter" escape hatch available after 3 payment failures
- [ ] Receipt includes: itemized list, totals, VAT if applicable, loyalty points earned
- [ ] Payment failure does not lose the order (order remains, payment retried)

---

## 8. Module 6 — Bill Splitting

### 8.1 User Flow

```
[Diner on Bill screen]
        │
        ▼
[Taps "Split Bill"]
        │
        ▼
[SPLIT BILL SCREEN]
  "How many people are splitting?"
  [2]  [3]  [4]  [5]  [Custom: ___]
        │
        ▼
[Shows: split amount per person]
  "₦3,200 each (4 people × ₦12,800)"
        │
        ▼
[Taps "Generate Split Links"]
  → POST /api/splits/create
  → Creates bill_splits + 4 x bill_split_parts records
  → Generates short token (e.g. "XK9P2R")
        │
        ▼
[SPLIT STATUS SCREEN]
  Part 1: You        ₦3,200  [Pay Now]
  Part 2: Share →    ₦3,200  [Copy Link] [WhatsApp Share]
  Part 3: Share →    ₦3,200  [Copy Link] [WhatsApp Share]
  Part 4: Share →    ₦3,200  [Copy Link] [WhatsApp Share]
        │
        ▼
[Person 1 pays their part immediately via Paystack]
[Parts 2–4 share link: moji.ng/split/XK9P2R/2]
        │
        ▼
[Friends open split link on their phones]
  [Split Bill — Mama Put Uyo]
  [Part 2 of 4 — ₦3,200]
  [Pay Now]
        │
        ▼
[As each part is paid, status screen updates in real time]
  Part 1: Paid ✓    ₦3,200
  Part 2: Paid ✓    ₦3,200
  Part 3: Pending   ₦3,200  [Send Reminder]
  Part 4: Pending   ₦3,200  [Send Reminder]
        │
        ▼
[All parts paid → Order marked as fully paid]
[WhatsApp receipt sent to anyone who provided phone]
```

### 8.2 API Routes

```
POST /api/splits/create
  Body: { order_id, num_parts }
  Action:
    1. Calculate amount_per_part (rounded, any remainder on part 1)
    2. Generate unique 6-char token
    3. Create bill_splits record
    4. Create bill_split_parts records
  Returns: { split_id, token, parts }

GET  /api/splits/:token
  Returns: { split, order_summary, parts_with_status }

GET  /api/splits/:token/:partNumber
  Returns: { part, amount, restaurant_name, already_paid }

POST /api/splits/:token/:partNumber/pay
  Body: { paystack_reference }
  Action: Verify payment, mark part as paid, check if all complete
```

### 8.3 Split Link Page

```
app/
├── split/
│   └── [token]/
│       ├── page.tsx           ← split status (for table)
│       └── [partNumber]/
│           └── page.tsx       ← individual payer page
```

### 8.4 Acceptance Criteria

- [ ] Split link works without the payer having scanned the original QR
- [ ] Split links expire after 2 hours
- [ ] Split status updates in real time as parts are paid
- [ ] "Send Reminder" sends WhatsApp to part recipient (if phone captured)
- [ ] Fractional amounts rounded correctly (remainder on part 1)
- [ ] Order marked paid only when ALL parts are paid

---

## 9. Module 7 — Live Order Queue (Kitchen/Floor Dashboard)

### 9.1 User Flow

```
[Staff opens /dashboard/orders on phone or tablet]
        │
        ▼
[LIVE ORDER BOARD — Kanban style]
  ┌──────────────┬──────────────┬──────────────┬──────────────┐
  │   PENDING    │  IN KITCHEN  │    READY     │   SERVED     │
  │─────────────│─────────────│─────────────│─────────────│
  │ [Table 5]   │ [Table 2]   │ [Table 7]   │ [Table 1]   │
  │ 2 items     │ 3 items     │ 1 item      │ Paid ✓      │
  │ 3 mins ago  │ 12 mins ago │ READY NOW ⚡│             │
  │ [Confirm ▶] │ [Ready ▶]   │ [Served ▶]  │             │
  └──────────────┴──────────────┴──────────────┴──────────────┘
        │
        ▼
[New order arrives — AUDIO NOTIFICATION + visual flash]
  [Table 3 — 2 items just ordered]
  → Staff taps order card to expand
  → Sees: Jollof Rice x1 (Hot), Chicken Suya x2 (no onion)
  → Taps [Confirm → In Kitchen]
        │
        ▼
[Kitchen ready — taps [Ready]]
  → Card moves to READY column
  → If diner is watching status on their phone: updates in real time
        │
        ▼
[Floor staff confirms delivery — taps [Served]]
  → Card moves to SERVED
  → Diner's "Request Bill" button becomes active
        │
        ▼
[Payment received — order auto-moves to SERVED/PAID]
  → Card shows "Paid ✓" badge
  → Table freed for next diners
```

### 9.2 Manual Order Entry (Hybrid Mode)

```
[Guest doesn't want to use QR — asks waiter directly]
        │
        ▼
[Staff taps "+ Manual Order" on dashboard]
  → Select table number
  → Add items from menu (same interface as diner)
  → Add diner phone (optional, for loyalty)
  → Submit order
        │
        ▼
[Order enters same queue as QR orders]
[Source shows as "staff" not "qr"]
```

### 9.3 Supabase Realtime Subscription

```typescript
// Dashboard subscribes to new orders for this restaurant
const subscribeToOrders = (restaurantId: string, onNewOrder: (order: Order) => void) => {
  const channel = supabase
    .channel(`orders:${restaurantId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'orders',
        filter: `restaurant_id=eq.${restaurantId}`
      },
      (payload) => {
        playNotificationSound()
        onNewOrder(payload.new as Order)
      }
    )
    .subscribe()
    
  return () => supabase.removeChannel(channel)
}
```

### 9.4 Notification Sound

```typescript
// Play audio on new order (requires user interaction first to unlock audio)
// Use Web Audio API — no external file dependency

const playNotificationSound = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext
  const ctx = new AudioContext()
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()
  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)
  oscillator.frequency.value = 880
  gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + 0.5)
}
```

### 9.5 File Structure

```
app/
├── dashboard/
│   └── orders/
│       ├── page.tsx               ← main order queue
│       └── components/
│           ├── OrderBoard.tsx     ← kanban columns
│           ├── OrderCard.tsx      ← individual order
│           ├── OrderItemList.tsx
│           ├── ManualOrderForm.tsx
│           ├── TableStatusBar.tsx ← top bar showing table statuses
│           └── useRealtimeOrders.ts ← Supabase subscription hook
```

### 9.6 API Routes

```
GET    /api/orders?restaurant_id=&status=&date=
  Returns: filtered orders for dashboard

PATCH  /api/orders/:id/status
  Body: { status: 'confirmed' | 'in_kitchen' | 'ready' | 'served' }
  Action: Updates status, broadcasts via Realtime

PATCH  /api/orders/:id/items/:itemId/status
  Body: { status: 'preparing' | 'ready' }
  Action: Per-item status for large orders

POST   /api/orders (also used for manual entry)
  Body: { source: 'staff', table_number, items, diner_phone? }
```

### 9.7 Acceptance Criteria

- [ ] New order appears on dashboard within 5 seconds of placement
- [ ] Audio + visual notification on new order (respects browser audio policy)
- [ ] Order status drag-and-drop OR tap-to-advance works on mobile
- [ ] Manual order entry available for non-QR guests
- [ ] Dashboard works as PWA (installable on staff's phone)
- [ ] Shows order age (time since placement) with color coding (green < 10min, amber 10-20min, red > 20min)
- [ ] "Request Bill" button on diner side activates only after order status = 'served'

---

## 10. Module 8 — Loyalty & Repeat Customer Tracking

> **V1 inclusion rationale:** Loyalty is the primary mechanism for capturing diner phone numbers, enabling repeat marketing, and differentiating Moji from a generic payment tool. Building it in V1 means every early order builds a customer database the restaurant actually owns.

### 10.1 System Design

```
Earning:   ₦100 spent = 1 point (configurable per restaurant)
Tiers:     Bronze (0–499pts) → Silver (500–1,999pts) → Gold (2,000+pts)
Redeeming: At bill payment screen — apply available rewards
Expiry:    Points expire after 12 months of inactivity (V2)
```

### 10.2 Diner Loyalty Flow (Earning)

```
[Diner places order via QR]
        │
        ▼
[PHONE CAPTURE MODAL appears before order submission]
  ┌─────────────────────────────────────────┐
  │  🏆 Earn Loyalty Points                 │
  │                                         │
  │  Enter your phone to earn points        │
  │  on every order at Mama Put Uyo         │
  │                                         │
  │  +234 [___________________]             │
  │                                         │
  │  [Earn Points →]   [Skip]               │
  │                                         │
  │  Already have points? You'll see        │
  │  your balance on the bill screen.       │
  └─────────────────────────────────────────┘
        │
        ├─ Enters phone + taps "Earn Points"
        │     ▼
        │  [Phone stored in order.diner_phone]
        │  [Loyalty profile looked up or created]
        │  [Current points balance fetched]
        │  [Shown on order confirmation: "You have 340 pts"]
        │
        └─ Taps "Skip"
              ▼
           [Order proceeds without phone]
           [No loyalty tracking for this order]
        │
        ▼
[On payment success:]
  - points_earned = Math.floor(order.subtotal / 100) × points_per_naira
  - loyalty_profiles.total_points += points_earned
  - loyalty_profiles.total_visits += 1
  - loyalty_profiles.total_spent += order.subtotal
  - loyalty_profiles.last_visit_at = now()
  - loyalty_transactions record created (type: 'earn')
  - Tier recalculated and updated
        │
        ▼
[WhatsApp receipt includes:]
  "🏆 You earned 32 points! Total: 372 points (Silver tier in 128 pts)"
```

### 10.3 Diner Loyalty Flow (Redeeming)

```
[Diner on Bill screen — has phone on file]
        │
        ▼
[Bill screen shows loyalty balance]
  ┌─────────────────────────────────────────┐
  │  Your Loyalty Points: 450 pts 🥈        │ ← Silver tier badge
  │  Available rewards:                     │
  │  • Free Coca-Cola (200 pts)  [Redeem]   │
  │  • 10% Discount (350 pts)   [Redeem]   │
  └─────────────────────────────────────────┘
        │
        ▼
[Diner taps "Redeem" on "10% Discount (350 pts)"]
        │
        ▼
[Confirmation modal]
  "Use 350 points for 10% off your bill?"
  Current bill: ₦8,500
  Discount: -₦850
  New total: ₦7,650
  Points remaining: 100
  [Confirm Redemption]
        │
        ▼
[Order updated with discount]
[Paystack initialized with new total]
[On payment: loyalty_transactions record (type: 'redeem', points: -350)]
```

### 10.4 Restaurant Owner — Loyalty Dashboard

```
[Owner on /dashboard/loyalty]
        │
        ▼
[LOYALTY OVERVIEW]
  ┌─────────────────────────────────────────────┐
  │  Total loyalty members: 234                 │
  │  Orders with loyalty: 67% (last 30 days)    │
  │  Points in circulation: 12,450              │
  │                                             │
  │  [Bronze: 180] [Silver: 42] [Gold: 12]      │
  └─────────────────────────────────────────────┘
        │
        ▼
[CUSTOMER LIST — searchable by phone/name]
  +234 803 XXX 1234  |  Chidi O.  |  Gold  |  ₦45,200  |  23 visits
  +234 802 XXX 5678  |  Amaka N.  |  Silver |  ₦18,700  |  11 visits
  [View Profile] for each
        │
        ▼
[CUSTOMER PROFILE PAGE]
  - Phone, name, tier, points balance
  - Visit history (date, order total, points earned)
  - Total spent at this restaurant
  - [Add manual points] [Send WhatsApp message]
        │
        ▼
[REWARDS MANAGEMENT]
  - Create/edit/delete loyalty rewards
  - Toggle rewards active/inactive
  - See redemption stats
        │
        ▼
[LOYALTY SETTINGS]
  - Points per ₦100 spent: [1] (adjustable)
  - Silver tier threshold: [500] pts
  - Gold tier threshold: [2000] pts
  - Enable/disable loyalty: toggle
```

### 10.5 File Structure

```
app/
├── dashboard/
│   └── loyalty/
│       ├── page.tsx                  ← overview
│       ├── customers/
│       │   ├── page.tsx              ← customer list
│       │   └── [phone]/page.tsx      ← individual profile
│       ├── rewards/
│       │   └── page.tsx              ← rewards management
│       └── settings/
│           └── page.tsx              ← loyalty configuration
│
│   (diner-facing loyalty components in Module 4 components)
```

### 10.6 API Routes

```
GET  /api/loyalty/:restaurantId/profile/:phone
  Returns: { profile, points, tier, available_rewards }

POST /api/loyalty/profile
  Body: { restaurant_id, phone, name? }
  Action: Creates or fetches existing profile
  Returns: { profile_id, points, tier }

POST /api/loyalty/award
  Body: { order_id }
  Action: Calculate and award points based on order subtotal
  Called internally after payment success

POST /api/loyalty/redeem
  Body: { profile_id, reward_id, order_id }
  Action: Validate sufficient points, apply discount, deduct points
  Returns: { discount_amount, points_deducted, remaining_points }

GET  /api/loyalty/:restaurantId/customers
  Query params: ?page=&search=&tier=
  Returns: paginated customer list

GET  /api/loyalty/:restaurantId/stats
  Returns: { total_members, tier_breakdown, points_circulation, top_customers }

POST /api/loyalty/rewards
  Body: { restaurant_id, name, points_required, reward_type, reward_value }

GET  /api/loyalty/:restaurantId/rewards
  Returns: active rewards for this restaurant

POST /api/loyalty/manual-points
  Body: { profile_id, points, description }
  Auth: restaurant owner only
```

### 10.7 Tier Calculation

```typescript
const calculateTier = (totalPoints: number, settings: RestaurantSettings): LoyaltyTier => {
  if (totalPoints >= settings.tier_gold_threshold) return 'gold'
  if (totalPoints >= settings.tier_silver_threshold) return 'silver'
  return 'bronze'
}

// Tier benefits (display only in V1 — not enforced in pricing)
const TIER_BENEFITS = {
  bronze: { label: 'Bronze', icon: '🥉', description: 'Welcome to the family!' },
  silver: { label: 'Silver', icon: '🥈', description: 'Valued regular' },
  gold:   { label: 'Gold',   icon: '🥇', description: 'VIP customer' }
}
```

### 10.8 Acceptance Criteria

- [ ] Phone capture modal appears before every order submission when loyalty is enabled
- [ ] "Skip" always visible — loyalty is never mandatory
- [ ] Existing customers recognized by phone (no login required)
- [ ] Points calculated and awarded within 10 seconds of payment confirmation
- [ ] Points balance shown on bill screen for returning customers
- [ ] Available rewards shown with points required and current balance
- [ ] Redemption applies discount to Paystack payment amount
- [ ] WhatsApp receipt includes points earned + new balance
- [ ] Restaurant owner can view full customer list, profiles, and visit history
- [ ] Owner can manually adjust points (with reason field)
- [ ] Loyalty settings (points rate, tier thresholds) configurable per restaurant

---

## 11. Module 9 — Restaurant Analytics Dashboard

### 11.1 User Flow

```
[Owner opens /dashboard/analytics]
        │
        ▼
[DATE RANGE SELECTOR]
  [Today] [Yesterday] [Last 7 days] [Last 30 days] [Custom]
        │
        ▼
[OVERVIEW CARDS — top row]
  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ ₦42,500  │  │   128    │  │  ₦332   │  │  34 min  │
  │ Revenue  │  │  Orders  │  │  Avg AOV │  │  Avg Time│
  └──────────┘  └──────────┘  └──────────┘  └──────────┘
        │
        ▼
[TOP DISHES — bar chart]
  1. Jollof Rice        ×42   ₦105,000
  2. Peppered Chicken   ×38   ₦133,000
  3. Chicken Suya       ×29   ₦72,500
        │
        ▼
[REVENUE BY HOUR — area chart]
  Shows peak hours across selected date range
        │
        ▼
[PAYMENT METHOD BREAKDOWN — donut chart]
  Bank Transfer: 58%
  Card: 34%
  USSD: 8%
        │
        ▼
[LOYALTY SNAPSHOT]
  New loyalty members this period: 23
  Orders with loyalty: 71%
  Points awarded: 1,240
  Points redeemed: 320
```

### 11.2 File Structure

```
app/
├── dashboard/
│   └── analytics/
│       ├── page.tsx
│       └── components/
│           ├── MetricCard.tsx
│           ├── TopDishesChart.tsx     ← uses recharts
│           ├── RevenueByHourChart.tsx ← uses recharts
│           ├── PaymentMethodChart.tsx ← uses recharts
│           ├── LoyaltySnapshot.tsx
│           └── DateRangePicker.tsx
```

### 11.3 API Routes

```
GET /api/analytics/:restaurantId?from=&to=
  Returns: {
    total_revenue,
    total_orders,
    average_order_value,
    average_preparation_time,
    top_dishes: [{ name, count, revenue }],
    revenue_by_hour: [{ hour, revenue, orders }],
    payment_methods: [{ method, count, percentage }],
    loyalty: { new_members, orders_with_loyalty, points_awarded, points_redeemed }
  }
```

### 11.4 Acceptance Criteria

- [ ] Analytics loads within 3 seconds
- [ ] Date range picker works and updates all charts
- [ ] Charts readable on mobile (6" screen)
- [ ] "Today" data refreshes automatically every 5 minutes
- [ ] All monetary values formatted as ₦X,XXX

---

## 12. Module 10 — Offline Support

### 12.1 Architecture

```
OFFLINE-FIRST STRATEGY:
  - Menu browsing: works fully offline after first load
  - Order submission: queued offline, synced on reconnect
  - Dashboard: degraded mode (cached data, no new orders)
```

### 12.2 Service Worker Setup

```typescript
// next.config.js — enable next-pwa
// npm install next-pwa

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      // Cache menu API responses
      urlPattern: /^https:\/\/moji\.ng\/api\/menu\/.*/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'menu-cache',
        expiration: { maxAgeSeconds: 300 } // 5 mins
      }
    },
    {
      // Cache menu images
      urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: { maxEntries: 100, maxAgeSeconds: 86400 } // 1 day
      }
    }
  ]
})
```

### 12.3 Order Queue for Offline Submission

```typescript
// When offline, store order in IndexedDB
// On reconnect, flush queue to server

import { openDB } from 'idb' // npm install idb

const DB_NAME = 'moji-offline'
const STORE_NAME = 'pending-orders'

const queueOrderOffline = async (order: OrderPayload) => {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) { db.createObjectStore(STORE_NAME, { keyPath: 'tempId' }) }
  })
  await db.add(STORE_NAME, { ...order, tempId: crypto.randomUUID(), queued_at: Date.now() })
}

const flushOfflineOrders = async () => {
  const db = await openDB(DB_NAME, 1)
  const pending = await db.getAll(STORE_NAME)
  for (const order of pending) {
    try {
      await submitOrder(order)
      await db.delete(STORE_NAME, order.tempId)
    } catch (err) {
      console.error('Failed to sync order:', err)
    }
  }
}

// Listen for reconnection
window.addEventListener('online', flushOfflineOrders)
```

### 12.4 Offline UI States

```
DINER — offline detected:
  - Banner: "You're offline. Menu is available but ordering requires connection."
  - Menu browsing: fully functional
  - "Place Order" button: queues order, shows "Order will be sent when reconnected"

DASHBOARD — offline detected:
  - Banner: "No connection. Showing last known data."
  - Existing orders: visible from cache
  - New orders: won't appear until reconnected
  - All action buttons: disabled with tooltip "Reconnect to update"
```

### 12.5 Acceptance Criteria

- [ ] Menu loads from cache when offline (after first visit)
- [ ] "You're offline" banner shown when navigator.onLine = false
- [ ] Orders queued offline submitted automatically on reconnect
- [ ] Images load from cache when offline
- [ ] PWA installable on Android (Add to Home Screen)

---

## 13. Module 11 — Admin Panel

> Internal use only. Not customer-facing. Minimal features for V1.

### 13.1 Features

```
/admin (protected route — admin role only)
├── /restaurants     ← list, view, activate, deactivate
├── /orders          ← platform-wide order volume + errors
├── /payments        ← payment error logs, manual reconciliation
└── /flags           ← feature flags per restaurant
```

### 13.2 Admin Authentication

```typescript
// Admin routes protected by middleware
// Check user has admin role in database
// middleware.ts

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const session = getSession(request)
    if (!session || session.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
}
```

---

## 14. API Reference

### Base URL

```
Production: https://moji.ng/api
Development: http://localhost:3000/api
```

### Authentication

```
Owner/Staff routes: Bearer token (Supabase JWT) in Authorization header
Webhook routes: HMAC signature verification (no Bearer)
Public routes: No auth (menu browsing, order placement)
```

### Error Format

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Standard Response Format

```json
{
  "data": {},
  "meta": {
    "timestamp": "2026-03-01T12:00:00Z"
  }
}
```

### Rate Limiting

```
Public endpoints (menu, order): 100 req/min per IP
Authenticated endpoints: 1000 req/min per user
Webhook endpoints: 500 req/min (Paystack IPs only)
```

---

## 15. Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # server-side only

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...
PAYSTACK_SECRET_KEY=sk_live_...   # server-side only, never exposed

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# App
NEXT_PUBLIC_APP_URL=https://moji.ng
NEXT_PUBLIC_APP_NAME=Moji

# Admin
ADMIN_SECRET=...  # internal admin panel access
```

---

## 16. MVP Scope Boundary

### Ships in V1 (8-week build)

| Module | Feature | Priority |
|--------|---------|----------|
| Auth | Signup, email verify, login, staff PIN | P0 |
| Onboarding | 3-step wizard (restaurant + payment + tables) | P0 |
| Menu | Create categories, items, photos, pricing | P0 |
| Menu | Real-time availability toggle | P0 |
| QR | Generate QR codes per table | P0 |
| QR | Download all as PDF | P0 |
| Ordering | Diner browsing flow (mobile PWA) | P0 |
| Ordering | Cart + order submission | P0 |
| Ordering | Order status updates | P0 |
| Payments | Paystack (bank transfer + card) | P0 |
| Payments | USSD fallback | P1 |
| Payments | WhatsApp receipt via Twilio | P0 |
| Bill Split | Even split with shareable links | P1 |
| Kitchen | Live order queue with real-time updates | P0 |
| Kitchen | Manual order entry | P1 |
| Loyalty | Phone capture + points earning | P0 |
| Loyalty | Tier system (bronze/silver/gold) | P0 |
| Loyalty | Rewards redemption at bill | P1 |
| Loyalty | Owner customer list + profiles | P1 |
| Analytics | Revenue, orders, top dishes, hourly | P1 |
| Offline | Menu caching + order queue | P0 |

### Post-V1 (Month 3+)

| Feature | Reason deferred |
|---------|----------------|
| By-item bill splitting | Even split covers 90% of cases. +3 weeks |
| NQR / OPay / PalmPay | Paystack covers launch. Add at 50+ restaurants |
| Multi-location | No launch restaurant needs this |
| Inventory management | Beyond ordering scope for V1 |
| Reservation system | Separate product category |
| Loyalty points expiry | Adds complexity, no urgency at launch |
| AI menu recommendations | Needs order history. V2. |
| Native apps | PWA sufficient. iOS < 10% Nigeria market |

---

## 17. Non-Goals

These decisions are final for V1. Do not build, plan, or design for these:

1. **POS integration** — We are not a POS. No Toast, Orda, or Square integration.
2. **Delivery** — Chowdeck owns delivery. We own dine-in. Do not build delivery features.
3. **Hardware** — No tablets, printers, kitchen displays, or card readers. Software only.
4. **QSR chains** — Chicken Republic is not our customer. No multi-location enterprise features.
5. **Custom payment processing** — We route through Paystack. We do not hold, settle, or process money.
6. **Subscription billing** — We will manually invoice pilot restaurants. No subscription billing code in V1.
7. **iOS native app** — Android PWA covers the market. Ship PWA first.
8. **Social features** — No reviews, ratings, or social sharing built in. Diners use Instagram naturally.

---

*Moji Development PRD v2.0 — Internal Document*  
*Scan. Order. Pay. Done.*
