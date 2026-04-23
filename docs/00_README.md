# ScanServe — Development Documentation Index

**Version:** 2.0 | **Date:** March 2026 | **Status:** Active Development
**Stack:** Next.js 14 · Supabase · Paystack · Tailwind CSS · TypeScript
**Build Method:** AI-assisted (Cursor + Claude Code)
**Market:** Nigeria — Launch city: Uyo → Lagos (Month 4)

---

## How to Use These Docs

Each file is a self-contained module. Feed them to Cursor or Claude Code one at a time.

> **Start here → `01_data_models.md`**
> Run all SQL migrations in Supabase before touching any module file.
> Then work through modules in order — each builds on the previous.

---

## File Index

| File | Module | Description | Build Order |
|------|--------|-------------|-------------|
| `00b_responsive_design_spec.md` | Design System | Breakpoints, layouts, component behavior, spacing — **read before any UI work** | **Before all UI** |
| `01_data_models.md` | Data Layer | All database tables, RLS policies, realtime setup | **First** |
| `02_auth_onboarding.md` | Module 1 | Signup, email verify, onboarding wizard, staff PIN login | 2nd |
| `03_menu_management.md` | Module 2 | Menu builder, categories, items, photos, availability toggle | 3rd |
| `04_qr_code_system.md` | Module 3 | QR generation, URL structure, PDF export for printing | 4th |
| `05_diner_ordering_flow.md` | Module 4 | Diner PWA: scan → browse → cart → order → status | 5th |
| `06_payment_receipts.md` | Module 5 | Paystack integration, webhook handler, WhatsApp receipts | 6th |
| `07_bill_splitting.md` | Module 6 | Even split, shareable payment links, split status | 7th |
| `08_order_queue_dashboard.md` | Module 7 | Live kitchen/floor dashboard, realtime orders, manual entry | 8th |
| `09_loyalty_system.md` | Module 8 | Phone capture, points, tiers, rewards, customer profiles | 9th |
| `10_analytics_dashboard.md` | Module 9 | Revenue, top dishes, hourly charts, loyalty stats | 10th |
| `11_offline_support.md` | Module 10 | Service worker, IndexedDB order queue, offline UI states | 11th |
| `12_admin_panel.md` | Module 11 | Internal admin: restaurant management, payment logs | 12th |
| `13_api_reference.md` | API Docs | All routes, auth, error formats, rate limits | Reference |
| `14_environment_variables.md` | Config | All env vars with descriptions | Reference |
| `15_mvp_scope.md` | Scope | V1 feature list, post-V1 deferrals, non-goals | Reference |

---

## Architecture Overview

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

## User Roles

| Role | Description | Primary Interface |
|------|-------------|-------------------|
| `restaurant_owner` | Creates/manages restaurant, menu, settings | Dashboard (web) |
| `staff` | Manages live orders, availability, floor | Dashboard (mobile web) |
| `diner` | Scans QR, orders, pays | PWA (no login required) |
| `admin` | ScanServe internal team | Admin panel |

---

## The Core Loop

```
Diner scans QR
    → Menu loads in browser (< 2 seconds)
    → Diner browses menu, adds items to cart
    → Phone capture for loyalty (optional)
    → Order submitted → Kitchen dashboard notified (< 5 seconds)
    → Diner watches order status in real time
    → Order marked served → "Request Bill" unlocks
    → Diner pays via Paystack (card / bank transfer / USSD)
    → Loyalty points awarded
    → WhatsApp receipt sent
    → Table freed
```

---

*ScanServe — Scan. Order. Pay. Done.*
