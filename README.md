# Moji — Scan. Order. Pay. Done.

A modern QR-code ordering and payment platform for Nigerian restaurants. Diners scan, browse, order, and pay from their phones — no app download, no waiter needed to take the order.

**Status:** Frontend prototype complete · Backend integration in progress  
**Market:** Nigeria — Launch city: Uyo → Lagos  
**Stack:** Next.js 16 · Drizzle ORM · Better Auth · Tailwind CSS · TypeScript · Zustand

---

## What It Does

| Role | Experience |
|---|---|
| **Diner** | Scans QR code at table → browses menu → adds items to cart → places order → watches live status → pays when served |
| **Restaurant** | Manages menu, receives orders on live dashboard, tracks tables, views analytics |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Database | PostgreSQL via Drizzle ORM + Neon Serverless |
| Auth | Better Auth |
| State | Zustand (persisted cart + session) |
| Styling | Tailwind CSS v4 |
| UI Primitives | shadcn/ui (Base UI + Radix) |
| Icons | Phosphor Icons |
| Charts | Recharts |
| Toasts | Sonner |
| Animations | Vaul (drawers), Motion |
| QR Codes | react-qr-code |
| Linting | Biome |

---

## Project Structure

```
app/
├── page.tsx                          # Landing / prototype nav
├── [restaurantSlug]/t/[tableNumber]/ # Diner experience (QR entry point)
│   ├── page.tsx                      # Menu browse
│   ├── cart/page.tsx                 # Cart + live orders
│   └── bill/page.tsx                 # Bill + payment
├── split/[token]/[part]/page.tsx     # Split bill individual payment
├── dashboard/                        # Restaurant owner dashboard
├── (auth)/                           # Auth flows
└── api/                              # API routes

components/
├── diner/                            # All diner-facing components
│   ├── DinerShell.tsx                # Page shell with floating cart
│   ├── MenuPage.tsx                  # Menu browse with sticky tabs
│   ├── MenuItemCard.tsx              # Individual menu item card
│   ├── ItemDetailModal.tsx           # Item details + modifier selection
│   ├── CartScreen.tsx                # Cart view + live session orders
│   ├── BillView.tsx                  # Bill, tip, payment methods
│   ├── BillScreenClient.tsx          # Bill/split state router
│   ├── PhoneCaptureModal.tsx         # Loyalty phone capture
│   ├── SplitBillModal.tsx            # Split bill (equally/by item/custom)
│   ├── SplitPartPage.tsx             # Individual split payment page
│   ├── CartContextProvider.tsx       # Cart context initializer
│   └── ui/                           # Shared diner design system
│       ├── diner-tokens.ts           # Design tokens (spacing, typography, cards)
│       ├── PageHeader.tsx            # Back-nav header
│       ├── BillSummary.tsx           # Subtotal/VAT/Total block
│       ├── ItemCard.tsx              # Cart/order/selectable item card variants
│       ├── SegmentedTabs.tsx         # Pill tab switcher
│       ├── OrderStatusTimeline.tsx   # Order status drawer
│       ├── BottomSheet.tsx           # Shared drawer primitive
│       ├── DinerInput.tsx            # Shared input component
│       └── DinerTextarea.tsx         # Shared textarea component

lib/
├── mockData.ts                       # Type definitions + mock restaurant/menu data
├── diner-utils.ts                    # Shared business logic (groupItems, calculateBill, formatModifiers)
└── utils.ts                          # cn() and general helpers

store/
├── cart.ts                           # Zustand cart + session store (persisted)
├── menu.ts                           # Zustand menu store
└── orders.ts                         # Zustand orders store

docs/                                 # Full product specification
```

---

## Diner Flow

```
Scan QR code at table
      ↓
Browse menu → sticky category tabs, tags, prep times
      ↓
Tap item → modifier sheet (spice level, protein, extras)
      ↓
Cart review → kitchen note, VAT summary
      ↓
[Optional] Loyalty phone capture (earn points)
      ↓
Place Order → live session tab
      ↓
Watch status: Placed → Preparing → Ready → Served
      ↓
Request bill → tip selector
      ↓
Pay: Bank Transfer / Card (POS) / Cash
      ↓
Success → loyalty points + WhatsApp receipt
      ↓
[Optional] Split bill: equally / by item / custom amount
```

---

## Diner Design System

The diner UI is built on a consistent design token system in `components/diner/ui/diner-tokens.ts`.

### Spacing
- Page padding: `px-4`
- Section gaps: `space-y-6` (major) / `space-y-3` (items)
- Card padding: `p-4`

### Typography
| Token | Usage | Class |
|---|---|---|
| `title` | Page titles | `text-2xl font-bold text-gray-900` |
| `sectionHeading` | Section labels | `text-sm font-semibold text-gray-700` |
| `cardTitle` | Item names | `text-sm font-semibold text-gray-900` |
| `body` | Descriptions | `text-sm text-gray-600` |
| `caption` | Meta / modifiers | `text-xs text-gray-400` |
| `price` | Inline prices | `text-sm font-bold text-gray-900` |
| `priceLarge` | Featured prices | `text-lg font-bold text-gray-900` |

### Components
- **Primary CTA**: `h-12 rounded-2xl bg-gray-900 text-white font-bold`
- **Secondary CTA**: `h-12 rounded-2xl border border-gray-200`
- **Cards**: `rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgb(0,0,0,0.04)]`
- **Inputs**: `h-12 rounded-xl border border-gray-200`
- **Category pills**: `rounded-full px-4 py-2`

---

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- PostgreSQL database (Neon recommended)

### Installation

```bash
git clone https://github.com/josephatadda/moji-diner.git
cd moji-diner
npm install
```

### Environment Variables

```bash
cp .env.example .env.local
```

Required variables (see `docs/14_environment_variables.md` for full reference):

```env
DATABASE_URL=          # Neon PostgreSQL connection string
BETTER_AUTH_SECRET=    # Auth secret (generate with: openssl rand -base64 32)
BETTER_AUTH_URL=       # App URL (http://localhost:3000 for dev)
```

### Database Setup

```bash
npm run db:generate    # Generate Drizzle migrations
npm run db:migrate     # Run migrations
npm run seed           # Seed mock data
npm run seed:brands    # Seed brand presets
```

### Development

```bash
npm run dev            # Start dev server on http://localhost:3000
```

Navigate to [`/mama-put-kitchen/t/1`](http://localhost:3000/mama-put-kitchen/t/1) to preview the full diner experience.

---

## Frontend Prototype Preview

The home page (`/`) links to three prototype flows:

| Flow | URL | Description |
|---|---|---|
| **Diner Menu** | `/mama-put-kitchen/t/1` | Full QR → order → pay flow |
| **Restaurant Dashboard** | `/dashboard` | Menu · Orders · Tables · Analytics |
| **Auth & Onboarding** | `/auth` | Signup → Login → Wizard |

---

## Mock Data

All diner data is mocked in `lib/mockData.ts` — ready for backend API integration:

- **Restaurant**: Mama Put Kitchen (Nigerian cuisine, NGN, 7.5% VAT, loyalty enabled)
- **Menu**: 4 categories, 11 items with modifier groups (spice levels, proteins, extras)
- **Orders**: Sample orders with various statuses
- **Loyalty**: 3 customer tiers (Bronze / Silver / Gold)

---

## Available Scripts

```bash
npm run dev            # Development server
npm run build          # Production build
npm run start          # Start production server
npm run lint           # Biome lint check
npm run format         # Biome format (auto-fix)
npm run test           # Run tests
npm run db:generate    # Generate Drizzle schema migrations
npm run db:migrate     # Apply migrations to database
npm run seed           # Seed database with mock data
npm run seed:brands    # Seed brand presets
```

---

## Documentation

Full product specification in `docs/`:

| Doc | Description |
|---|---|
| `00_README.md` | Architecture overview, user roles, core loop |
| `01_data_models.md` | Database schema, RLS policies |
| `02_auth_onboarding.md` | Auth flows, onboarding wizard |
| `03_menu_management.md` | Menu builder, categories, availability |
| `04_qr_code_system.md` | QR generation, URL structure |
| `05_diner_ordering_flow.md` | Diner PWA flow specification |
| `06_payment_receipts.md` | Paystack integration, WhatsApp receipts |
| `07_bill_splitting.md` | Split bill flows |
| `08_order_queue_dashboard.md` | Kitchen/floor live dashboard |
| `09_loyalty_system.md` | Points, tiers, rewards |
| `10_analytics_dashboard.md` | Revenue, top dishes, charts |
| `13_api_reference.md` | All API routes |
| `15_mvp_scope.md` | V1 scope, deferrals, non-goals |

---

## Roadmap

- [x] Diner menu experience (QR → browse → order → pay)
- [x] Diner design system with consistent tokens and reusable components
- [x] Split bill (equally / by item / custom amount)
- [x] Loyalty points capture
- [x] Restaurant dashboard prototype
- [ ] Backend API integration (replace mock data)
- [ ] Real-time order status (WebSockets / Supabase Realtime)
- [ ] Paystack payment integration
- [ ] WhatsApp receipt delivery (Twilio)
- [ ] Menu management CRUD
- [ ] Analytics dashboard
- [ ] PWA + offline support

---

*Moji — Built for Nigerian restaurants, designed for every table.*
