# 15 — MVP Scope & Non-Goals

**Reference document** — Scope decisions are final for V1.

---

## Table of Contents

1. [V1 Feature List (8-Week Build)](#1-v1-feature-list-8-week-build)
2. [Build Timeline](#2-build-timeline)
3. [Post-V1 Deferrals (Month 3+)](#3-post-v1-deferrals-month-3)
4. [Non-Goals (Never in V1)](#4-non-goals-never-in-v1)
5. [Launch Definition of Done](#5-launch-definition-of-done)

---

## 1. V1 Feature List (8-Week Build)

### P0 — Must ship before any paying customer

| Module | Feature | Doc |
|--------|---------|-----|
| Auth | Signup + email verify + owner login | `02_auth_onboarding.md` |
| Auth | Staff 4-digit PIN login | `02_auth_onboarding.md` |
| Onboarding | 3-step wizard: restaurant + Paystack + tables | `02_auth_onboarding.md` |
| Menu | Create categories + items + photos + pricing | `03_menu_management.md` |
| Menu | Real-time availability toggle (sold out) | `03_menu_management.md` |
| QR | Generate QR codes per table | `04_qr_code_system.md` |
| QR | Download all tables as A6 PDF | `04_qr_code_system.md` |
| Ordering | Diner menu browsing (mobile PWA, no app download) | `05_diner_ordering_flow.md` |
| Ordering | Cart + order submission | `05_diner_ordering_flow.md` |
| Ordering | Order status real-time updates (diner view) | `05_diner_ordering_flow.md` |
| Payment | Paystack bank transfer + card | `06_payment_receipts.md` |
| Payment | Webhook handler with HMAC verification | `06_payment_receipts.md` |
| Payment | WhatsApp receipt via Twilio | `06_payment_receipts.md` |
| Kitchen | Live order queue with Supabase Realtime | `08_order_queue_dashboard.md` |
| Kitchen | Audio notification on new order | `08_order_queue_dashboard.md` |
| Kitchen | Order status advance (Pending → Kitchen → Ready → Served) | `08_order_queue_dashboard.md` |
| Loyalty | Phone capture modal (optional, skippable) | `09_loyalty_system.md` |
| Loyalty | Points earning on payment (1pt per ₦100) | `09_loyalty_system.md` |
| Loyalty | Tier system: Bronze / Silver / Gold | `09_loyalty_system.md` |
| Loyalty | Points shown on WhatsApp receipt | `09_loyalty_system.md` |
| Offline | Menu caching via Service Worker | `11_offline_support.md` |
| Offline | Order queue in IndexedDB, sync on reconnect | `11_offline_support.md` |

### P1 — Ship before first paying restaurant goes live

| Module | Feature | Doc |
|--------|---------|-----|
| Payment | USSD channel support via Paystack | `06_payment_receipts.md` |
| Payment | Pay at Counter fallback (after 3 failures) | `06_payment_receipts.md` |
| Bill Split | Even split with shareable links | `07_bill_splitting.md` |
| Bill Split | Real-time split status screen | `07_bill_splitting.md` |
| Kitchen | Manual order entry (for non-QR guests) | `08_order_queue_dashboard.md` |
| Kitchen | Mark as paid (cash/POS terminal) | `08_order_queue_dashboard.md` |
| Loyalty | Rewards creation + management | `09_loyalty_system.md` |
| Loyalty | Reward redemption at bill screen | `09_loyalty_system.md` |
| Loyalty | Owner customer list + profiles | `09_loyalty_system.md` |
| Analytics | Revenue, order count, AOV, top dishes | `10_analytics_dashboard.md` |
| Analytics | Revenue by hour chart | `10_analytics_dashboard.md` |
| Analytics | Payment method breakdown | `10_analytics_dashboard.md` |
| PWA | Installable on Android (Add to Home Screen) | `11_offline_support.md` |

---

## 2. Build Timeline

```
Week 1–2: Foundation
  ✅ Next.js 14 project setup + Supabase schema (all tables, RLS, realtime)
  ✅ Auth: signup, login, email verify
  ✅ Onboarding wizard (3 steps)
  ✅ Environment variables + Paystack test connection

Week 3: Menu
  ✅ Menu management: categories, items, photos
  ✅ Image upload + compression
  ✅ Availability toggle + reset
  ✅ QR code generation + PDF export

Week 4: Diner Flow
  ✅ Diner menu PWA (browsing, category tabs, featured)
  ✅ Item detail modal with modifiers
  ✅ Cart with Zustand (persist)
  ✅ Phone capture modal (loyalty)
  ✅ Order submission API

Week 5: Kitchen + Payment
  ✅ Live order dashboard with Supabase Realtime
  ✅ Audio notification system
  ✅ Order status advancement
  ✅ Paystack inline modal + initialize/verify API
  ✅ Paystack webhook handler
  ✅ WhatsApp receipt via Twilio

Week 6: Loyalty + Splits
  ✅ Loyalty: award points on payment
  ✅ Loyalty: tier calculation
  ✅ Loyalty: reward redemption on bill screen
  ✅ Loyalty: owner customer list + profile view
  ✅ Bill split: create, share links, real-time status

Week 7: Analytics + Offline
  ✅ Analytics dashboard (revenue, top dishes, charts)
  ✅ Service Worker setup (next-pwa)
  ✅ IndexedDB offline order queue
  ✅ PWA manifest + icons

Week 8: Polish + Launch Prep
  ✅ Manual order entry (dashboard)
  ✅ Pay at Counter fallback
  ✅ Admin panel (basic)
  ✅ Error states + loading states throughout
  ✅ Mobile optimization pass (test on real Android device)
  ✅ Offline state UI polish
  ✅ End-to-end test with pilot restaurant in Uyo
```

---

## 3. Post-V1 Deferrals (Month 3+)

| Feature | Why Deferred | Target |
|---------|-------------|--------|
| By-item bill splitting | Even split covers 90% of real-world cases. Adds 3+ weeks. | Month 4 |
| NQR / OPay / PalmPay channels | Paystack handles launch. Add at 50+ restaurants. | Month 3 |
| Google Review prompt on receipt | Nice-to-have, minimal lift, adds after stabilization | Month 3 |
| Loyalty points expiry (12 months) | No urgency at launch. Adds complexity. | Month 6 |
| AI menu recommendations | Needs meaningful order history first. | Month 8 |
| Multi-location restaurant support | No pilot restaurant needs this at launch. | Month 6 |
| Reservation system | Separate product category. Different buyer journey. | Month 9 |
| Inventory management | Beyond ordering scope. Separate research needed. | Month 7 |
| Native iOS/Android app | PWA covers market. Android dominates at 88%. | Month 12 |
| Subscription billing automation | Manually invoice first 20 restaurants. | Month 4 |
| POS integration (Orda, etc.) | We are not a POS. Evaluate after product-market fit. | TBD |
| Customer-facing loyalty card page | Low priority vs earning/redeeming | Month 4 |
| WhatsApp marketing broadcast | Send to loyalty list. Needs legal compliance review. | Month 5 |
| Staff performance tracking | Out of scope for V1. | Month 9 |

---

## 4. Non-Goals (Never in V1)

These decisions are final. Do not build, design, or plan for these in V1.

**1. POS Integration**
We are not a POS. No Toast, Orda, Square, or Crust integration. ScanServe is a dine-in ordering layer. Restaurants that need POS will use separate tools.

**2. Delivery**
Chowdeck owns delivery in Nigeria. We own the dine-in moment. Adding delivery creates a different business, different ops, and direct competition with funded players on their home turf.

**3. Hardware**
No tablets, printers, kitchen display screens, or card readers. Software only. This is a core constraint, not a limitation — it keeps our cost-to-serve near zero.

**4. QSR / Fast Food Chains**
Chicken Republic, KFC, and similar chains have their own technology teams and vendor processes. Our ICP is independent and semi-chain restaurants (20–100 seats). No enterprise features.

**5. Custom Payment Processing**
We route through Paystack. We do not hold, settle, or reconcile money directly. No CBN license required. No payment float on our books.

**6. In-App Subscription Billing**
First 20 restaurants are manually invoiced by the founder. No Stripe subscriptions, no SaaS billing portal in V1.

**7. Social Features**
No in-app ratings, reviews, or sharing. Diners naturally use Instagram and Google. We don't need to replicate this.

**8. Nutrition / Calorie Tracking**
Out of scope. Nigerian restaurant market is not asking for this.

---

## 5. Launch Definition of Done

Before considering V1 launched (even for pilot):

```
Technical:
  ☐ End-to-end order placed, paid, and receipted without errors
  ☐ Kitchen dashboard receives order in < 5 seconds
  ☐ Payment webhook verified and idempotent
  ☐ Menu loads in < 2 seconds on real 4G (tested on Android device)
  ☐ Works offline (menu caching confirmed)
  ☐ QR scans correctly on iPhone Camera + Android Camera apps
  ☐ WhatsApp receipt arrives within 60 seconds of payment

Loyalty:
  ☐ Points awarded correctly after payment
  ☐ Returning customer recognized by phone
  ☐ Reward redemption reduces Paystack amount correctly

Operations:
  ☐ Owner completed onboarding in < 10 minutes (tested with real owner)
  ☐ Staff PIN login works on mobile browser
  ☐ Printed QR codes tested at table (physically placed + scanned)
  ☐ PDF export generates correct QR codes for all tables

Stability:
  ☐ No unhandled crashes in 1 hour of continuous use
  ☐ Paystack test mode transactions succeed
  ☐ Supabase Realtime maintains connection for > 30 minutes

Business:
  ☐ At least 1 Uyo restaurant agreed to pilot (design partner)
  ☐ Pilot restaurant trained on dashboard (< 30 minutes)
  ☐ Emergency contact protocol in place (WhatsApp for support)
```

---

*This is the complete ScanServe V1 documentation set.*
*Scan. Order. Pay. Done.*
