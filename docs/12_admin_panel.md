# 12 — Admin Panel

**Module:** 11 | **Depends on:** `01_data_models.md`, `02_auth_onboarding.md`  
**Responsive:** Admin panel is desktop-optimized (sidebar + data tables). On mobile screens below 768px, show a "Best viewed on desktop" banner. Tables degrade to card stacks as a functional fallback — not a polished mobile experience.

> Internal use only. Not customer-facing. Minimal features for V1. Access restricted to ScanServe team.

---

## Table of Contents

1. [User Flow](#1-user-flow)
2. [File Structure](#2-file-structure)
3. [API Routes](#3-api-routes)
4. [Access Control](#4-access-control)
5. [Acceptance Criteria](#5-acceptance-criteria)

---

## 1. User Flow

### 1.1 Admin Overview

```
[Admin navigates to /admin]
  → Checks auth.users metadata for role: 'admin'
  → Non-admins redirected to /login
        │
        ▼
[ADMIN DASHBOARD]

  Navigation:
  [Restaurants] [Payments] [Logs] [Feature Flags]
```

### 1.2 Restaurants List

```
[/admin/restaurants]

[SEARCH + FILTERS]
  Search: [_________________]
  Status: [All] [Active] [Inactive]
  City:   [All] [Uyo] [Lagos] [Abuja]

[TABLE]
  Name           | Slug           | Owner Email       | City | Plan    | Orders | Joined    | Status
  Mama Put Uyo   | mama-put-uyo   | owner@email.com   | Uyo  | Free    | 234    | Jan 2026  | ✅ Active
  Yellow Chilli  | yellow-chilli  | chef@email.com    | Abuja| Starter | 891    | Dec 2025  | ✅ Active
  ...

  [View] [Deactivate] per row

[/admin/restaurants/:id — detail view]
  - Restaurant info
  - Owner email
  - Order history (count, revenue)
  - Loyalty member count
  - Payment history
  - [Activate / Deactivate]
  - [Impersonate] → opens dashboard as that restaurant (read-only)
```

### 1.3 Payment Logs

```
[/admin/payments]

Filters: Date range, restaurant, status (success/failed/refunded)

[TABLE]
  Reference     | Restaurant    | Amount   | Method        | Status  | Date
  SS-4a2b-1234  | Mama Put Uyo  | ₦4,945   | Bank Transfer | ✅ Paid | 01 Mar 2026
  SS-9c3d-5678  | Yellow Chilli | ₦12,800  | Card          | ❌ Failed | 01 Mar 2026
  ...

[Failed payment detail]
  - Paystack response payload (JSON viewer)
  - Order details
  - [Mark as paid manually] (for edge cases)
```

### 1.4 Feature Flags

```
[/admin/flags]

Global flags (affect all restaurants):
  maintenance_mode      [OFF] ← shows maintenance page to all users
  new_order_sound_v2    [OFF] ← test new notification sound
  loyalty_enabled       [ON]  ← global kill switch for loyalty feature

Per-restaurant flags:
  [restaurant dropdown]
  whatsapp_receipts     [ON]
  analytics_enabled     [ON]
  loyalty_enabled       [ON]  ← can override per restaurant
```

---

## 2. File Structure

```
app/
├── admin/
│   ├── layout.tsx                  ← admin shell (separate from dashboard)
│   ├── page.tsx                    ← redirect to /admin/restaurants
│   ├── restaurants/
│   │   ├── page.tsx                ← restaurant list
│   │   └── [id]/
│   │       └── page.tsx            ← restaurant detail
│   ├── payments/
│   │   └── page.tsx
│   └── flags/
│       └── page.tsx
│
app/
└── api/
    └── admin/
        ├── restaurants/
        │   ├── route.ts            ← GET all restaurants
        │   └── [id]/
        │       └── route.ts        ← GET + PATCH single restaurant
        ├── payments/
        │   └── route.ts
        └── flags/
            └── route.ts
```

---

## 3. API Routes

### GET `/api/admin/restaurants`

```typescript
// Auth: admin role only
// Query: ?search=&status=&city=&page=&per_page=20

{
  data: [
    {
      id, name, slug, city,
      owner_email,
      plan: "free" | "starter" | "growth" | "pro",
      total_orders,
      total_revenue,
      loyalty_members,
      created_at,
      is_active
    }
  ],
  meta: { total, page, per_page }
}
```

### PATCH `/api/admin/restaurants/:id`

```typescript
// Auth: admin role only
{ is_active?: boolean, plan?: string }
```

### GET `/api/admin/payments`

```typescript
// Auth: admin role only
// Query: ?from=&to=&restaurant_id=&status=

{
  data: Payment[],
  meta: { total, total_amount, success_rate }
}
```

### GET `/api/admin/flags`

```typescript
// Auth: admin role only
{
  data: {
    global: { [flag_name]: boolean },
    per_restaurant: { [restaurant_id]: { [flag_name]: boolean } }
  }
}
```

### PATCH `/api/admin/flags`

```typescript
// Auth: admin role only
{
  scope: "global" | "restaurant",
  restaurant_id?: string,
  flag: string,
  value: boolean
}
```

---

## 4. Access Control

```typescript
// Admin role stored in Supabase auth.users metadata
// Set manually by ScanServe team via Supabase dashboard

// middleware.ts addition
if (req.nextUrl.pathname.startsWith('/admin')) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

// To grant admin access (run in Supabase SQL editor):
// UPDATE auth.users
// SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'
// WHERE email = 'admin@scanserve.ng';
```

---

## 5. Acceptance Criteria

- [ ] `/admin` routes completely inaccessible to non-admin users
- [ ] Admin can view all restaurants with key stats
- [ ] Admin can activate/deactivate any restaurant
- [ ] Admin can view all payment transactions with Paystack reference
- [ ] Admin can view failed payment details (Paystack response)
- [ ] Feature flag changes take effect without code deployment
- [ ] No customer-facing functionality exposed in admin panel

---

*Next: `13_api_reference.md`*
