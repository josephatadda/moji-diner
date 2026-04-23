# 01 — Data Models

**Build order:** FIRST — run all migrations before any other module.

> **Instruction for Cursor/Claude Code:**
> Create all these tables in Supabase. Enable Row Level Security (RLS) on every table.
> Use UUIDs as primary keys throughout. Run migrations in the exact order listed below.

---

## Table of Contents

1. [Core Tables](#1-core-tables)
2. [Row Level Security Policies](#2-row-level-security-policies)
3. [Realtime Subscriptions](#3-realtime-subscriptions)
4. [Indexes](#4-indexes)

---

## 1. Core Tables

### 1.1 Restaurants

```sql
CREATE TABLE restaurants (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id              UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  slug                  TEXT UNIQUE NOT NULL, -- URL-safe, e.g. "mama-put-uyo"
  description           TEXT,
  address               TEXT,
  city                  TEXT NOT NULL DEFAULT 'Uyo',
  phone                 TEXT,
  instagram_handle      TEXT,
  logo_url              TEXT,
  cover_image_url       TEXT,
  currency              TEXT NOT NULL DEFAULT 'NGN',
  is_active             BOOLEAN DEFAULT true,
  is_accepting_orders   BOOLEAN DEFAULT true,
  vat_enabled           BOOLEAN DEFAULT false,
  vat_rate              DECIMAL(4,2) DEFAULT 7.50,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);
```

### 1.2 Restaurant Tables (Physical)

```sql
CREATE TABLE restaurant_tables (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number    INTEGER NOT NULL,
  label           TEXT,         -- e.g. "Window Table", "VIP Room"
  capacity        INTEGER DEFAULT 4,
  qr_code_url     TEXT,         -- stored QR image URL in Supabase Storage
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(restaurant_id, table_number)
);
```

### 1.3 Menu Categories

```sql
CREATE TABLE menu_categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,  -- e.g. "Starters", "Mains", "Drinks"
  description     TEXT,
  sort_order      INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### 1.4 Menu Items

```sql
CREATE TABLE menu_items (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id         UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id           UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
  name                  TEXT NOT NULL,
  description           TEXT,
  price                 DECIMAL(10,2) NOT NULL,
  photo_url             TEXT,
  is_available          BOOLEAN DEFAULT true,
  is_featured           BOOLEAN DEFAULT false,
  preparation_time_mins INTEGER DEFAULT 15,
  allergens             TEXT[],     -- e.g. ['nuts', 'dairy']
  tags                  TEXT[],     -- e.g. ['spicy', 'vegetarian', 'bestseller']
  modifier_groups       JSONB DEFAULT '[]',  -- see schema below
  sort_order            INTEGER DEFAULT 0,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
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
--       { "id": "uuid", "name": "Mild",       "price_delta": 0 },
--       { "id": "uuid", "name": "Medium",     "price_delta": 0 },
--       { "id": "uuid", "name": "Hot",        "price_delta": 0 },
--       { "id": "uuid", "name": "Extra Hot",  "price_delta": 200 }
--     ]
--   }
-- ]
```

### 1.5 Orders

```sql
CREATE TABLE orders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id         UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id              UUID REFERENCES restaurant_tables(id),
  table_number          INTEGER NOT NULL,       -- denormalized for fast display
  diner_session_id      TEXT NOT NULL,          -- anonymous UUID from localStorage
  diner_name            TEXT,                   -- optional, from loyalty profile
  diner_phone           TEXT,                   -- optional, for loyalty matching
  status                TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN (
                            'pending','confirmed','in_kitchen',
                            'ready','served','paid','cancelled'
                          )),
  subtotal              DECIMAL(10,2) DEFAULT 0,
  vat_amount            DECIMAL(10,2) DEFAULT 0,
  tip_amount            DECIMAL(10,2) DEFAULT 0,
  total_amount          DECIMAL(10,2) DEFAULT 0,
  special_instructions  TEXT,
  source                TEXT DEFAULT 'qr'
                          CHECK (source IN ('qr','staff','manual')),
  split_session_id      UUID,                   -- references bill_splits if split
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);
```

### 1.6 Order Items

```sql
CREATE TABLE order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id    UUID REFERENCES menu_items(id),
  item_name       TEXT NOT NULL,            -- snapshot at time of order
  item_price      DECIMAL(10,2) NOT NULL,   -- snapshot at time of order
  quantity        INTEGER NOT NULL DEFAULT 1,
  modifiers       JSONB DEFAULT '[]',       -- selected modifier options
  modifier_total  DECIMAL(10,2) DEFAULT 0,
  line_total      DECIMAL(10,2) NOT NULL,
  special_note    TEXT,
  status          TEXT DEFAULT 'pending'
                    CHECK (status IN (
                      'pending','preparing','ready','served','cancelled'
                    )),
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### 1.7 Payments

```sql
CREATE TABLE payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            UUID REFERENCES orders(id),
  restaurant_id       UUID REFERENCES restaurants(id),
  paystack_reference  TEXT UNIQUE,
  amount              DECIMAL(10,2) NOT NULL,
  currency            TEXT DEFAULT 'NGN',
  method              TEXT CHECK (
                        method IN ('card','bank_transfer','ussd','qr','mobile_money')
                      ),
  status              TEXT DEFAULT 'pending'
                        CHECK (status IN (
                          'pending','success','failed','abandoned','refunded'
                        )),
  paystack_response   JSONB,    -- raw Paystack webhook payload
  paid_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now()
);
```

### 1.8 Bill Splits

```sql
CREATE TABLE bill_splits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID REFERENCES orders(id) ON DELETE CASCADE,
  restaurant_id   UUID REFERENCES restaurants(id),
  split_type      TEXT DEFAULT 'even'
                    CHECK (split_type IN ('even','custom')),
  total_parts     INTEGER NOT NULL DEFAULT 2,
  amount_per_part DECIMAL(10,2),
  split_token     TEXT UNIQUE NOT NULL,   -- short shareable token e.g. "XK9P2R"
  status          TEXT DEFAULT 'open'
                    CHECK (status IN ('open','partial','complete')),
  expires_at      TIMESTAMPTZ DEFAULT (now() + interval '2 hours'),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE bill_split_parts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  split_id    UUID REFERENCES bill_splits(id) ON DELETE CASCADE,
  part_number INTEGER NOT NULL,
  amount      DECIMAL(10,2) NOT NULL,
  payer_name  TEXT,
  payer_phone TEXT,
  payment_id  UUID REFERENCES payments(id),
  status      TEXT DEFAULT 'unpaid'
                CHECK (status IN ('unpaid','paid')),
  paid_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

### 1.9 Loyalty Profiles

```sql
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
```

### 1.10 Loyalty Transactions

```sql
CREATE TABLE loyalty_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID REFERENCES loyalty_profiles(id) ON DELETE CASCADE,
  restaurant_id   UUID REFERENCES restaurants(id),
  order_id        UUID REFERENCES orders(id),
  type            TEXT NOT NULL
                    CHECK (type IN ('earn','redeem','bonus','expire','manual')),
  points          INTEGER NOT NULL,  -- positive = earn, negative = redeem
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### 1.11 Loyalty Rewards

```sql
CREATE TABLE loyalty_rewards (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id    UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,       -- e.g. "Free Drink"
  description      TEXT,
  points_required  INTEGER NOT NULL,
  reward_type      TEXT
                     CHECK (reward_type IN (
                       'free_item','discount_percent','discount_amount'
                     )),
  reward_value     DECIMAL(10,2),       -- discount amount or % depending on type
  free_item_id     UUID REFERENCES menu_items(id),
  is_active        BOOLEAN DEFAULT true,
  max_per_customer INTEGER DEFAULT NULL, -- null = unlimited
  created_at       TIMESTAMPTZ DEFAULT now()
);
```

### 1.12 Staff Accounts

```sql
CREATE TABLE staff_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id),
  name            TEXT NOT NULL,
  role            TEXT DEFAULT 'staff'
                    CHECK (role IN ('manager','staff','kitchen')),
  pin             TEXT,   -- 4-digit PIN for quick dashboard login
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### 1.13 Restaurant Settings

```sql
CREATE TABLE restaurant_settings (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id             UUID UNIQUE REFERENCES restaurants(id) ON DELETE CASCADE,

  -- Loyalty config
  loyalty_enabled           BOOLEAN DEFAULT true,
  points_per_naira          DECIMAL(6,4) DEFAULT 0.01,  -- 1 point per ₦100
  tier_silver_threshold     INTEGER DEFAULT 500,
  tier_gold_threshold       INTEGER DEFAULT 2000,

  -- Notifications
  whatsapp_receipts         BOOLEAN DEFAULT true,
  notify_new_order          BOOLEAN DEFAULT true,
  notify_low_stock          BOOLEAN DEFAULT false,

  -- Operations
  table_order_timeout_mins  INTEGER DEFAULT 90,
  allow_special_instructions BOOLEAN DEFAULT true,
  require_diner_name        BOOLEAN DEFAULT false,
  tip_options               INTEGER[] DEFAULT '{0,5,10}',

  -- Paystack
  paystack_public_key       TEXT,
  paystack_secret_key       TEXT,  -- stored encrypted, never exposed to client

  created_at                TIMESTAMPTZ DEFAULT now(),
  updated_at                TIMESTAMPTZ DEFAULT now()
);
```

---

## 2. Row Level Security Policies

```sql
-- ── RESTAURANTS ──────────────────────────────────────────
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner full access" ON restaurants
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Public read active" ON restaurants
  FOR SELECT USING (is_active = true);

-- ── RESTAURANT TABLES ────────────────────────────────────
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages tables" ON restaurant_tables
  FOR ALL USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Public reads tables" ON restaurant_tables
  FOR SELECT USING (is_active = true);

-- ── MENU CATEGORIES ──────────────────────────────────────
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages categories" ON menu_categories
  FOR ALL USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Public reads categories" ON menu_categories
  FOR SELECT USING (is_active = true);

-- ── MENU ITEMS ───────────────────────────────────────────
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages menu items" ON menu_items
  FOR ALL USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Public reads menu items" ON menu_items
  FOR SELECT USING (true);  -- filtered by restaurant_id in app query

-- ── ORDERS ───────────────────────────────────────────────
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant sees own orders" ON orders
  FOR ALL USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Diner reads own session orders" ON orders
  FOR SELECT USING (true);  -- filtered by diner_session_id in app logic

-- ── ORDER ITEMS ──────────────────────────────────────────
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant manages order items" ON order_items
  FOR ALL USING (
    order_id IN (
      SELECT id FROM orders
      WHERE restaurant_id IN (
        SELECT id FROM restaurants WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Public reads order items" ON order_items
  FOR SELECT USING (true);

-- ── PAYMENTS ─────────────────────────────────────────────
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant sees own payments" ON payments
  FOR ALL USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

-- ── LOYALTY PROFILES ─────────────────────────────────────
ALTER TABLE loyalty_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages loyalty" ON loyalty_profiles
  FOR ALL USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

-- ── LOYALTY TRANSACTIONS ─────────────────────────────────
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner reads loyalty transactions" ON loyalty_transactions
  FOR ALL USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

-- ── LOYALTY REWARDS ──────────────────────────────────────
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages rewards" ON loyalty_rewards
  FOR ALL USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Public reads active rewards" ON loyalty_rewards
  FOR SELECT USING (is_active = true);

-- ── STAFF ACCOUNTS ───────────────────────────────────────
ALTER TABLE staff_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages staff" ON staff_accounts
  FOR ALL USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

-- ── RESTAURANT SETTINGS ──────────────────────────────────
ALTER TABLE restaurant_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages settings" ON restaurant_settings
  FOR ALL USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );
```

---

## 3. Realtime Subscriptions

Enable Supabase Realtime on these tables only — others don't need push:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;  -- availability updates
ALTER PUBLICATION supabase_realtime ADD TABLE bill_split_parts; -- split payment status
```

---

## 4. Indexes

```sql
-- Orders — most frequently queried by restaurant + status
CREATE INDEX idx_orders_restaurant_status ON orders(restaurant_id, status);
CREATE INDEX idx_orders_restaurant_created ON orders(restaurant_id, created_at DESC);
CREATE INDEX idx_orders_diner_session ON orders(diner_session_id);

-- Order items
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Menu items
CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_category ON menu_items(category_id);

-- Loyalty
CREATE INDEX idx_loyalty_profiles_restaurant_phone ON loyalty_profiles(restaurant_id, phone);
CREATE INDEX idx_loyalty_transactions_profile ON loyalty_transactions(profile_id);

-- Payments
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_reference ON payments(paystack_reference);

-- Bill splits
CREATE INDEX idx_bill_splits_token ON bill_splits(split_token);
CREATE INDEX idx_bill_split_parts_split_id ON bill_split_parts(split_id);
```

---

*Next: `02_auth_onboarding.md`*
