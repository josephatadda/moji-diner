# 13 — API Reference

**Reference document** — Not a build module. Use alongside module files.

---

## Table of Contents

1. [Base URL & Conventions](#1-base-url--conventions)
2. [Authentication](#2-authentication)
3. [Error Format](#3-error-format)
4. [Response Format](#4-response-format)
5. [Rate Limiting](#5-rate-limiting)
6. [Full Route Index](#6-full-route-index)

---

## 1. Base URL & Conventions

```
Production:   https://scanserve.ng/api
Development:  http://localhost:3000/api

HTTP Methods:
  GET    → Read/fetch
  POST   → Create
  PUT    → Replace (full update)
  PATCH  → Partial update
  DELETE → Remove

All request/response bodies: application/json
Date format: ISO 8601 (e.g. 2026-03-01T19:45:00.000Z)
Currency: All amounts in Nigerian Naira (₦), stored as DECIMAL(10,2)
```

---

## 2. Authentication

```
Owner / Staff routes:
  Authorization: Bearer {supabase_jwt}
  JWT issued by Supabase Auth on login

Admin routes:
  Authorization: Bearer {supabase_jwt}
  User must have app_metadata.role = 'admin'

Webhook routes:
  No Bearer token
  HMAC-SHA512 signature in x-paystack-signature header

Public routes (no auth):
  GET  /api/menu/:slug
  POST /api/orders
  GET  /api/orders/:id/status
  GET  /api/splits/:token
  GET  /api/splits/:token/:partNumber
  GET  /api/loyalty/:restaurantId/profile/:phone
```

---

## 3. Error Format

```json
// All errors return a consistent shape:
{
  "error": "Human-readable message shown to user",
  "code": "MACHINE_READABLE_CODE",
  "details": {}    // optional extra context
}
```

```
Common error codes:

UNAUTHORIZED        401  Missing or invalid auth token
FORBIDDEN           403  Authenticated but no permission
NOT_FOUND           404  Resource does not exist
VALIDATION_ERROR    422  Request body failed validation
RATE_LIMITED        429  Too many requests
SERVER_ERROR        500  Unexpected server error

Domain-specific codes:
NOT_ACCEPTING       422  Restaurant not accepting orders
ITEM_UNAVAILABLE    422  Menu item sold out
ALREADY_PAID        422  Order or split part already paid
SPLIT_EXPIRED       422  Bill split link has expired
INVALID_KEYS        422  Paystack API keys could not be verified
INSUFFICIENT_POINTS 422  Not enough loyalty points to redeem
INVALID_PIN         401  Staff PIN incorrect
```

---

## 4. Response Format

```json
// Success:
{
  "data": { ... },
  "meta": {
    "timestamp": "2026-03-01T19:45:00.000Z"
  }
}

// Paginated success:
{
  "data": [ ... ],
  "meta": {
    "total": 234,
    "page": 1,
    "per_page": 20,
    "total_pages": 12,
    "timestamp": "2026-03-01T19:45:00.000Z"
  }
}
```

---

## 5. Rate Limiting

```
Public endpoints (menu, order placement):
  100 requests / minute / IP

Authenticated endpoints:
  1,000 requests / minute / user

Webhook endpoints:
  500 requests / minute (Paystack IPs only)

Split reminder:
  1 reminder / split part / 10 minutes

Rate limit headers returned:
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 87
  X-RateLimit-Reset: 1740859500
```

---

## 6. Full Route Index

### Menu & Restaurant

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/menu/:slug` | None | Full menu for diner view |
| `POST` | `/api/menu/categories` | Owner | Create category |
| `PUT` | `/api/menu/categories/:id` | Owner | Update category |
| `PATCH` | `/api/menu/categories/reorder` | Owner | Batch reorder categories |
| `DELETE` | `/api/menu/categories/:id` | Owner | Delete category |
| `POST` | `/api/menu/items` | Owner | Create menu item |
| `PUT` | `/api/menu/items/:id` | Owner | Update menu item |
| `PATCH` | `/api/menu/items/:id/availability` | Owner/Staff | Toggle sold out |
| `PATCH` | `/api/menu/items/reorder` | Owner | Batch reorder items |
| `DELETE` | `/api/menu/items/:id` | Owner | Delete menu item |
| `POST` | `/api/menu/upload-image` | Owner | Upload + compress photo |
| `PATCH` | `/api/menu/availability/reset` | Owner | Reset all to available |

### Tables & QR

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/tables/:restaurantId` | Owner/Staff | List all tables with status |
| `POST` | `/api/tables` | Owner | Add table |
| `PUT` | `/api/tables/:id` | Owner | Update table |
| `DELETE` | `/api/tables/:id` | Owner | Delete table |
| `GET` | `/api/tables/:id/qr` | Owner | Get QR code PNG |

### Orders

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/orders` | None | Place order (diner or staff) |
| `GET` | `/api/orders` | Owner/Staff | List orders for dashboard |
| `GET` | `/api/orders/:id/status` | None | Order status for diner |
| `PATCH` | `/api/orders/:id/add-items` | None | Add items to existing order |
| `PATCH` | `/api/orders/:id/status` | Owner/Staff | Advance order status |
| `PATCH` | `/api/orders/:id/items/:itemId/status` | Owner/Staff | Per-item status |
| `PATCH` | `/api/orders/:id/mark-paid-manual` | Owner/Staff | Mark as cash/POS paid |

### Payments

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/payments/initialize` | None | Create payment + Paystack ref |
| `GET` | `/api/payments/verify/:reference` | None | Check payment status |
| `POST` | `/api/webhooks/paystack` | HMAC | Paystack event receiver |

### Bill Splits

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/splits/create` | None (session) | Create split |
| `GET` | `/api/splits/:token` | None | Get split status |
| `GET` | `/api/splits/:token/:partNumber` | None | Individual payer view |
| `POST` | `/api/splits/:token/:partNumber/pay` | None | Init payment for part |
| `POST` | `/api/splits/:token/:partNumber/remind` | None | Send WhatsApp reminder |

### Loyalty

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/loyalty/:restaurantId/profile/:phone` | None | Lookup profile by phone |
| `POST` | `/api/loyalty/profile` | None | Create/upsert profile |
| `POST` | `/api/loyalty/award` | Service | Award points (internal) |
| `POST` | `/api/loyalty/redeem` | None (phone) | Redeem reward |
| `GET` | `/api/loyalty/:restaurantId/customers` | Owner | Customer list |
| `GET` | `/api/loyalty/:restaurantId/customers/:phone` | Owner | Customer profile |
| `GET` | `/api/loyalty/:restaurantId/stats` | Owner | Loyalty stats |
| `POST` | `/api/loyalty/rewards` | Owner | Create reward |
| `GET` | `/api/loyalty/:restaurantId/rewards` | None | Active rewards |
| `PUT` | `/api/loyalty/rewards/:id` | Owner | Update reward |
| `POST` | `/api/loyalty/manual-points` | Owner | Manual point adjustment |

### Analytics

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/analytics/:restaurantId` | Owner | Revenue + charts data |
| `GET` | `/api/analytics/:restaurantId/export` | Owner | CSV export |

### Auth & Onboarding

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/auth/staff-login` | None | Staff PIN login |
| `POST` | `/api/onboarding/test-paystack` | Owner | Verify Paystack keys |
| `POST` | `/api/onboarding/complete` | Owner | Finish onboarding wizard |

### Admin (Internal Only)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/admin/restaurants` | Admin | All restaurants |
| `PATCH` | `/api/admin/restaurants/:id` | Admin | Update restaurant |
| `GET` | `/api/admin/payments` | Admin | Platform payment log |
| `GET` | `/api/admin/flags` | Admin | Feature flags |
| `PATCH` | `/api/admin/flags` | Admin | Update feature flag |

---

*See also: `14_environment_variables.md`*
