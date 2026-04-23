# ScanServe — Step-by-Step Build Workflow

**For:** Solo founder building with Cursor + Claude Code  
**Timeline:** 8 weeks to MVP  
**Principle:** Each step produces something testable before moving on. Never build two things at once.

---

## How to Use This Document

Every step has:
- **What you're building** — the output
- **Cursor/Claude prompt** — paste this to start the step
- **Done when** — exact test you run to confirm it works
- **Do NOT move on until** — the blockers

Work top to bottom. Do not skip steps.

---

## Pre-Work: Accounts & Setup (Day 0)

Get these before writing a single line of code.

```
□ Supabase account — supabase.com (free tier is fine to start)
□ Paystack account — paystack.com (use test mode throughout development)
□ Twilio account — twilio.com (activate WhatsApp sandbox)
□ Vercel account — vercel.com (for deployment, free tier)
□ GitHub account — for version control
□ Node.js installed — v18 or higher
□ Cursor installed — cursor.sh
```

**Create your Supabase project now** — you'll need the URL + keys for Step 1.  
**Get Paystack test keys now** — Dashboard → Settings → API Keys.  
**Set up Twilio WhatsApp sandbox now** — it requires a phone number verification step that takes time.

---

## PHASE 1: FOUNDATION
### Goal: A running Next.js app connected to Supabase

---

### Step 1 — Project Scaffolding

**What you're building:** A working Next.js app with Supabase connected and environment variables set up.

**Cursor prompt:**
```
Create a new Next.js 14 project called "scanserve" with the following setup:
- TypeScript
- Tailwind CSS
- App Router (not Pages Router)
- src/ directory: NO (use app/ at root)
- Install these packages: @supabase/supabase-js @supabase/auth-helpers-nextjs

Create the file structure:
  app/
  lib/
  components/
  hooks/
  store/
  public/

Create a lib/supabase.ts file that exports:
  - createBrowserClient (for client components)
  - createServerClient (for server components and API routes)

Using NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from environment variables.

Create a .env.local.example file listing all required environment variables with placeholder values.
Create a .gitignore that includes .env.local.
```

**Done when:**
- `npm run dev` starts without errors
- `http://localhost:3000` shows the Next.js default page
- No TypeScript errors in the terminal

**Do NOT move on until:** The dev server runs clean.

---

### Step 2 — Database Schema

**What you're building:** All 13 tables in Supabase with RLS and realtime enabled.

**How to do it:**
1. Open Supabase Dashboard → SQL Editor
2. Open `01_data_models.md` from your docs folder
3. Copy the entire SQL from Section 1 (Core Tables) — paste and run
4. Copy Section 2 (RLS Policies) — paste and run
5. Copy Section 3 (Realtime) — paste and run
6. Copy Section 4 (Indexes) — paste and run

**Done when:**
- Supabase Table Editor shows all 13 tables:
  `restaurants`, `restaurant_tables`, `menu_categories`, `menu_items`,
  `orders`, `order_items`, `payments`, `bill_splits`, `bill_split_parts`,
  `loyalty_profiles`, `loyalty_transactions`, `loyalty_rewards`,
  `staff_accounts`, `restaurant_settings`
- No SQL errors in the output

**Do NOT move on until:** All 13 tables exist. Run this verification query:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

---

### Step 3 — Environment Variables

**What you're building:** A complete `.env.local` file with all real credentials.

**Do this manually** (not via Cursor — these are secrets):
1. Copy `.env.local.example` → `.env.local`
2. Fill in from `14_environment_variables.md`:
   - Supabase URL + anon key (from Supabase Dashboard → Settings → API)
   - Supabase service role key (same place)
   - Paystack test public + secret keys
   - Twilio credentials
   - Set `NEXT_PUBLIC_APP_URL=http://localhost:3000` for now

**Done when:**
- Create `app/api/health/route.ts` that imports supabase and does a test query
- Hit `http://localhost:3000/api/health` — returns `{ ok: true }`

---

## PHASE 2: AUTHENTICATION
### Goal: Owner can sign up, verify email, and reach a dashboard

---

### Step 4 — Supabase Auth Configuration

**Do this in Supabase Dashboard (not code):**
1. Authentication → Email → Enable "Confirm email"
2. Authentication → URL Configuration → set Site URL: `http://localhost:3000`
3. Add Redirect URLs: `http://localhost:3000/auth/callback`

No code in this step. Just Supabase config.

---

### Step 5 — Auth Pages

**What you're building:** Signup, login, and email verification pages.

**Cursor prompt:**
```
I'm building ScanServe, a QR ordering SaaS for Nigerian restaurants.

Create the following auth pages using Next.js 14 App Router, Tailwind CSS, and Supabase Auth:

1. app/(auth)/signup/page.tsx
   - Email + password fields
   - On submit: call supabase.auth.signUp()
   - On success: show "Check your email to verify your account"
   - On error (email exists): show inline error message

2. app/(auth)/login/page.tsx
   - Email + password fields
   - On submit: call supabase.auth.signInWithPassword()
   - On success: redirect to /dashboard (or /onboarding if no restaurant exists)
   - "Forgot password?" link

3. app/(auth)/layout.tsx
   - Centered card layout
   - ScanServe logo/name at top
   - No navigation bar

4. app/auth/callback/route.ts
   - Handles Supabase email verification redirect
   - Exchanges code for session
   - Redirects to /onboarding

Use clean, minimal Tailwind styling. Mobile-first. No external UI libraries.
```

**Done when:**
- Sign up with a real email → receive verification email
- Click link → redirected to `/onboarding` (even if that page doesn't exist yet — 404 is fine)
- Visit `/login` → enter credentials → redirected to `/dashboard` (404 is fine)

---

### Step 6 — Route Protection Middleware

**What you're building:** Middleware that redirects unauthenticated users away from protected routes.

**Cursor prompt:**
```
Create middleware.ts at the project root for ScanServe.

Protected routes (redirect to /login if no session):
  /dashboard/*
  /onboarding/*
  /admin/*

Public routes (always accessible):
  /
  /(auth)/*   — signup, login pages
  /[slug]/*   — diner-facing menu pages
  /split/*    — bill split pages
  /api/*      — API routes handle their own auth

Use @supabase/auth-helpers-nextjs createMiddlewareClient.
Refresh session on every request.
```

**Done when:**
- Visit `/dashboard` without being logged in → redirected to `/login`
- Visit `/login` → log in → can reach `/dashboard` (404 is fine)

---

### Step 7 — Onboarding Wizard

**What you're building:** The 3-step setup flow that creates the restaurant record.

**Cursor prompt:**
```
I'm building ScanServe. Create a 3-step onboarding wizard for new restaurant owners.

Reference: 02_auth_onboarding.md (Section 1.3)

Step 1 — app/onboarding/step-1/page.tsx:
  Fields: restaurant name, city (default "Uyo"), phone, Instagram handle (optional), logo upload (optional)
  Auto-generate a URL slug from the restaurant name: lowercase, spaces → hyphens
  Check slug uniqueness via GET /api/restaurants/check-slug?slug=xxx (create this route)
  Show: "✓ Available" or "✗ Taken" next to slug preview

Step 2 — app/onboarding/step-2/page.tsx:
  Fields: Paystack public key, Paystack secret key
  [Test Connection] button that calls POST /api/onboarding/test-paystack
  Next button disabled until connection verified

Step 3 — app/onboarding/step-3/page.tsx:
  Stepper input: "How many tables?" (1–50)
  Shows QR code preview for Table 1 using the qrcode npm package
  [Complete Setup] button calls POST /api/onboarding/complete

Create app/onboarding/layout.tsx with a progress bar showing current step.
Store step progress in sessionStorage so users can return to their step.

Create all three API routes as described in 02_auth_onboarding.md Section 3.
```

**Done when:**
- New signup → complete all 3 steps → redirected to `/dashboard`
- Check Supabase: `restaurants` table has 1 row, `restaurant_tables` has N rows

---

### Step 8 — Basic Dashboard Shell

**What you're building:** The dashboard layout with navigation — no content yet, just the shell.

**Cursor prompt:**
```
Create the dashboard shell for ScanServe restaurant owners.

app/dashboard/layout.tsx:
  - Left sidebar navigation on desktop
  - Bottom tab bar on mobile
  - Navigation items: Orders, Menu, Tables, Loyalty, Analytics, Settings
  - Restaurant name + logo in sidebar header
  - "Sign out" option
  - Auth guard: fetch restaurant for logged-in user; if none found, redirect to /onboarding

app/dashboard/page.tsx:
  - Simple placeholder: "Welcome to ScanServe, [Restaurant Name]"
  - Quick stats row (hardcode zeros for now — we'll fill data later)

Keep styling clean and minimal. Mobile-first. The dashboard must work on a phone screen.
```

**Done when:**
- Log in → see dashboard with navigation
- Navigation links render (all go to 404 for now — that's fine)
- Sidebar shows restaurant name

---

## PHASE 3: MENU
### Goal: Owner can build a complete menu with photos

---

### Step 9 — Menu Management Page

**What you're building:** The full menu editor — categories, items, photos.

**Cursor prompt:**
```
Build the menu management page for ScanServe.

Reference: 03_menu_management.md (full file)

Create app/dashboard/menu/page.tsx and its components.

Priority order:
1. Display existing categories and items from Supabase (empty state if none)
2. Add category form (modal) — POST /api/menu/categories
3. Add item form (slide-over panel) — POST /api/menu/items
   Fields: name, description, price, category, available toggle, featured toggle
   Photo upload: client-side compression using browser-image-compression npm package,
   then upload to Supabase Storage bucket "menu-images"
4. Edit and delete for both categories and items
5. Availability toggle that calls PATCH /api/menu/items/:id/availability

Create all API routes listed in 03_menu_management.md Section 3.

Do NOT build modifier groups yet — that's a separate step.
Do NOT build drag-to-reorder yet.
```

**Done when:**
- Create a category → appears in list
- Add item with photo → appears under category
- Toggle availability → item shows "Sold Out" state
- Supabase storage shows uploaded image
- All without page refresh (optimistic updates or refetch after mutation)

---

### Step 10 — Modifier Groups

**What you're building:** The modifier builder inside the item form.

**Cursor prompt:**
```
Add modifier groups to the ScanServe menu item form.

Reference: 03_menu_management.md Section 1.3 and Component Specs

Inside the item add/edit form, add a collapsible "Modifier Groups" section.

Each modifier group has:
- Group name (e.g. "Spice Level")
- Required toggle (yes/no)
- Min/max selections (numbers)
- List of options, each with: name + price delta (₦)
- Add/remove options

Modifier groups are stored as JSONB in menu_items.modifier_groups column.
Schema is defined in 01_data_models.md Section 1.4 (the comment block).

The modifier UI does not need drag-to-reorder — simple add/remove is enough for V1.
```

**Done when:**
- Add modifier group to an item → saved to DB
- Edit item → modifier group pre-fills correctly
- Modifier with price delta shows (+₦200) label

---

## PHASE 4: QR CODES
### Goal: Owner can download printable QR codes for every table

---

### Step 11 — QR Code System

**What you're building:** QR generation, table management, and PDF export.

**Cursor prompt:**
```
Build the QR code and table management system for ScanServe.

Reference: 04_qr_code_system.md (full file)

Install: npm install qrcode jspdf
Install types: npm install --save-dev @types/qrcode

1. app/dashboard/tables/page.tsx
   - List all tables from restaurant_tables
   - Each row: table number, label, capacity, status badge, download QR button
   - "+ Add Table" button → simple modal (number, label, capacity)
   - Status badge: Available / Occupied / Awaiting Payment (query orders table)

2. lib/qr.ts
   - generateTableQRDataURL() function from 04_qr_code_system.md Section 3
   - URL format: [NEXT_PUBLIC_APP_URL]/[slug]/t/[tableNumber]

3. lib/qr-pdf.ts
   - generateQRCodesPDF() function from 04_qr_code_system.md Section 4
   - A6 format (105mm × 148mm), one table per page
   - Include: restaurant name, "Scan to Order", QR code, table number

4. Single table PNG download button per row
5. "Download All QR Codes" PDF button at top of page

Create API routes from 04_qr_code_system.md Section 6.
```

**Done when:**
- Tables list shows all tables created during onboarding
- Click "Download All" → PDF downloads with correct QR codes per page
- Scan a QR code with your phone camera → URL opens in browser
  (URL will 404 for now — that's fine, we just need the URL to be correct)

---

## PHASE 5: DINER ORDERING FLOW
### Goal: Diner scans QR, browses menu, places an order

This is the most important phase. Take your time here.

---

### Step 12 — Diner Menu Page

**What you're building:** The public-facing menu page that diners see when they scan.

**Cursor prompt:**
```
Build the diner-facing menu page for ScanServe.

Reference: 05_diner_ordering_flow.md Sections 1.1, 1.2, and the file structure

Create:
  app/[restaurantSlug]/t/[tableNumber]/page.tsx — main entry point
  app/[restaurantSlug]/page.tsx — fallback (no table context)

The menu page must:
- Load restaurant info + full menu via GET /api/menu/[restaurantSlug]
  (Create this API route — see 05_diner_ordering_flow.md Section 4)
- Show restaurant header: logo, name, table number
- Show sticky category tab bar (horizontal scroll)
- Show menu items in a list: photo, name, description, price, "+ Add" button
- Grey out sold-out items with "Sold Out" badge (unclickable)
- Work on mobile (Android Chrome primary target)
- Load fast — use Next.js static/cached rendering where possible

Do NOT build the cart yet — just the browsing experience.
Do NOT build the item detail modal yet.

Store restaurant slug and table number in a React context so child components can access them.
```

**Done when:**
- Scan the QR code from Step 11 → menu page loads
- See all categories and items
- Sold-out items (toggle one from dashboard) show correctly
- Page looks good on a real phone

---

### Step 13 — Cart & Item Detail Modal

**What you're building:** The cart state, item modal (for modifiers), and cart view.

**Cursor prompt:**
```
Add cart functionality to the ScanServe diner menu.

Reference: 05_diner_ordering_flow.md Sections 1.3, 1.4, 1.5, and Section 6 (Zustand store)

Install: npm install zustand

1. Create store/cart.ts — Zustand store from Section 6
   Persist to localStorage with key "scanserve-cart"

2. ItemDetailModal component (05_diner_ordering_flow.md Section 1.4):
   - Slides up from bottom on mobile
   - Shows photo, name, description, price
   - Renders modifier groups (radio for single-select, checkbox for multi)
   - Blocks "Add to Order" button until required modifiers selected
   - Price in button updates as modifiers are selected
   - Quantity stepper
   - Optional special note

3. MenuItemCard update:
   - Items without modifiers: tap "+ Add" → add directly to cart
   - Items with modifiers: tap "+ Add" → open ItemDetailModal
   - When item is in cart: show quantity stepper instead of "+ Add"

4. Cart bottom bar: sticky at bottom when cart has items
   "🛒 {count} items · View Order →"

5. CartScreen component (slide-up or separate page):
   - List cart items with quantity controls and remove button
   - Special instructions text area
   - Subtotal calculation
   - "Place Order" CTA button (no functionality yet — next step)
```

**Done when:**
- Add items (with and without modifiers) to cart
- Cart persists if you refresh the page (localStorage)
- Cart count updates in real time
- Removing items works

---

### Step 14 — Order Submission

**What you're building:** The actual POST to create an order, plus the confirmation screen.

**Cursor prompt:**
```
Build order submission for ScanServe diners.

Reference: 05_diner_ordering_flow.md Sections 1.6, 1.7, 1.8 and API Routes Section 4

1. lib/diner-session.ts — session management from Section 2
   getDinerSessionId(), setActiveOrder(), getActiveOrder(), clearActiveOrder()

2. PhoneCaptureModal (loyalty phone entry — Section 1.6):
   - Shown when user taps "Place Order" AND restaurant.loyalty_enabled = true
   - Nigerian phone format validation
   - "Earn Points" and "Skip" buttons — Skip must be equally prominent
   - If phone recognized: show "Welcome back! You have X pts"

3. POST /api/orders route — full implementation from Section 4:
   - Validate all items still available
   - Calculate totals (subtotal, VAT if enabled, grand total)
   - Create orders + order_items records
   - Snapshot item_name and item_price at time of order
   - Broadcast to Supabase Realtime channel: orders:{restaurant_id}
   - Return order_id + estimated_ready_mins

4. OrderConfirmation screen (Section 1.7):
   - "✅ Order Placed!" with items list and estimated time
   - "Add More Items" button (returns to menu, preserves order_id)
   - Order status bar (received → kitchen → ready → served) — static for now

5. PATCH /api/orders/:id/add-items — for adding more items to same order
```

**Done when:**
- Full flow: scan QR → browse → add to cart → place order
- Order appears in Supabase `orders` table
- Confirmation screen shows with correct items and total
- "Add more items" returns to menu and appends to same order

---

## PHASE 6: KITCHEN DASHBOARD
### Goal: Staff see orders in real time and can manage their status

---

### Step 15 — Live Order Queue

**What you're building:** The kitchen/floor dashboard with real-time order tracking.

**Cursor prompt:**
```
Build the live order queue dashboard for ScanServe restaurant staff.

Reference: 08_order_queue_dashboard.md (full file)

Install: (no new packages — uses Supabase Realtime which is already installed)

1. hooks/useRealtimeOrders.ts — Supabase Realtime subscription from Section 2
   Subscribe to INSERT and UPDATE on orders table filtered by restaurant_id
   Subscribe to INSERT on order_items (for "add more items" updates)

2. app/dashboard/orders/page.tsx — 4-column Kanban board
   Columns: Pending | In Kitchen | Ready | Served
   Mobile: horizontal scroll with column selector tabs at top

3. OrderCard component:
   - Shows: table number, item count, age in minutes, quick-advance button
   - Color-coded age: green < 10min, amber 10–20min, red > 20min
   - "NEW" badge for orders < 2 minutes old
   - Tap to expand → shows full item list with modifiers and special notes

4. Status advance buttons:
   [Confirm → In Kitchen] [Ready] [Served]
   Each calls PATCH /api/orders/:id/status

5. lib/notification-sound.ts — Web Audio API sound from Section 3
   Two-tone "ding ding" on new order
   lib/tab-title.ts — browser tab flash

6. Audio unlock on first staff interaction (mobile requirement)

Create GET /api/orders and PATCH /api/orders/:id/status API routes.
```

**Done when:**
- Place an order from a phone → appears on dashboard within 5 seconds
- Audio notification plays when new order arrives (test on phone)
- Advance order through statuses → order moves between columns
- On diner's phone: order status bar updates when staff advances status

---

### Step 16 — Manual Order Entry

**What you're building:** Staff can place orders for guests who don't use QR.

**Cursor prompt:**
```
Add manual order entry to the ScanServe kitchen dashboard.

Reference: 08_order_queue_dashboard.md Section 4

Add a "+ New Order" button to the dashboard header.
Clicking opens a slide-over drawer: ManualOrderDrawer.tsx

The drawer contains:
- Table number dropdown (from restaurant's tables)
- Customer phone (optional, for loyalty)
- Menu search: type to filter items
- Tap item → add to a local cart list
- Cart shows: item name, quantity controls, line totals
- Submit button → POST /api/orders with source: "staff"

The submitted order enters the same queue as QR orders.
Order cards from manual entry show a "Staff" badge instead of "QR".
```

**Done when:**
- Create a manual order from dashboard → appears in Pending column
- Manual orders show "Staff" source badge

---

## PHASE 7: PAYMENT
### Goal: Diner can pay, webhook confirms it, receipt sent via WhatsApp

---

### Step 17 — Bill Screen & Paystack Integration

**What you're building:** The bill view, tip selection, and Paystack modal.

**Cursor prompt:**
```
Build the payment flow for ScanServe.

Reference: 06_payment_receipts.md Sections 1 and 2

Install: npm install @paystack/inline-js

1. Update diner order status bar:
   When order status = 'served', show "Get Bill →" button

2. app/[restaurantSlug]/t/[tableNumber]/bill/page.tsx (or modal):
   - Fetch order details + items
   - Show itemized bill
   - Show VAT line only if restaurant.vat_enabled = true
   - TipSelector: 0% / 5% / 10% / Custom — total updates live
   - [Split Bill] button (routes to Step 19)
   - [Pay Now — ₦X,XXX] button

3. POST /api/payments/initialize route:
   - Validates order + diner_session_id
   - Creates payments record (status: pending)
   - Returns Paystack reference

4. PayNowButton component:
   - Calls POST /api/payments/initialize
   - Opens Paystack inline modal with correct amount (in kobo)
   - Passes metadata: order_id, restaurant_id, table_number, tip_amount
   - On callback: calls GET /api/payments/verify/:reference
   - Shows "Confirming..." loading state after Paystack callback

5. GET /api/payments/verify/:reference:
   - Checks local DB only (does NOT call Paystack — trust webhook)
   - Returns: { status, order_id, paid_at }

6. PaymentSuccessScreen:
   - "✅ Payment Successful!"
   - Amount + timestamp
   - "Your WhatsApp receipt is on its way 📱" (if phone provided)
```

**Done when:**
- Diner places order → staff marks served → "Get Bill" appears
- Tap Get Bill → see correct itemized amounts
- Tap Pay Now → Paystack modal opens in test mode
- Complete test payment with Paystack test card: `4084 0840 8408 4081`

---

### Step 18 — Paystack Webhook & WhatsApp Receipt

**What you're building:** The webhook handler that confirms payment and sends receipts.

**Cursor prompt:**
```
Build the Paystack webhook handler and WhatsApp receipt for ScanServe.

Reference: 06_payment_receipts.md Sections 3 and 4

Install: npm install twilio

1. app/api/webhooks/paystack/route.ts — full implementation from Section 3:
   - Read raw body as text (required for HMAC)
   - Verify HMAC SHA-512 signature using PAYSTACK_SECRET_KEY
   - Return 401 if signature invalid
   - Handle charge.success event:
     a. Idempotency check — skip if paystack_reference already marked success
     b. Update payments record: status → success, method, paid_at
     c. Update orders record: status → paid
     d. Call awardLoyaltyPoints(order_id) — implement stub for now
     e. Call sendWhatsAppReceipt(order_id)
   - Return 200 immediately for all events

2. lib/whatsapp-receipt.ts — full implementation from Section 4:
   - Fetch order + items + restaurant + loyalty transaction
   - Build WhatsApp message with itemized list
   - Send via Twilio to diner_phone (if set)
   - Handle gracefully if Twilio fails (log, don't throw)

3. Register webhook URL in Paystack Dashboard:
   Settings → API Keys & Webhooks → Webhook URL:
   Use a tunnel for local testing: ngrok http 3000
   Then: https://your-ngrok-url.ngrok.io/api/webhooks/paystack

Test using Paystack Dashboard → Events → Send Test Event
```

**Done when:**
- Complete test payment → Paystack webhook fires
- Check Supabase: order.status = 'paid', payment.status = 'success'
- WhatsApp message received on test phone (if you set up Twilio sandbox)

---

## PHASE 8: LOYALTY
### Goal: Phone capture works, points earn and display correctly

---

### Step 19 — Loyalty Points & Profile

**What you're building:** The complete points earning and profile system.

**Cursor prompt:**
```
Build the loyalty system for ScanServe.

Reference: 09_loyalty_system.md (full file)

1. lib/loyalty.ts — business logic functions:
   calculateTier(), calculatePointsEarned(), getPointsToNextTier()
   TIER_DISPLAY constants

2. Complete the awardLoyaltyPoints() stub from Step 18:
   - Calculate points from order.subtotal
   - Upsert loyalty_profiles record (create if new, update if existing)
   - Update: total_points, total_visits, total_spent, last_visit_at, tier
   - Insert loyalty_transactions record (type: 'earn')
   - Return points_earned (so webhook can pass to WhatsApp receipt)

3. GET /api/loyalty/:restaurantId/profile/:phone route:
   - Returns profile, tier, points_to_next_tier, available_rewards
   - Returns exists: false if no profile

4. PhoneCaptureModal update — when phone is entered:
   - Calls GET /api/loyalty/:restaurantId/profile/:phone
   - If returning: shows "Welcome back! You have X pts 🏆 [tier icon]"
   - If new: shows "You'll earn X points on this order!"

5. Update WhatsApp receipt to include loyalty info:
   Fetch loyalty_transactions for the order → include points earned + new balance

6. LoyaltyBillPanel on bill screen:
   - If diner_phone on file: fetch loyalty profile
   - Show: tier badge, current points, available rewards (if any exist)
```

**Done when:**
- Place order with phone → pay → check Supabase: loyalty_profiles has 1 row
- Place second order with same phone → points accumulate
- WhatsApp receipt shows "🏆 You earned 46 points!"
- Returning customer sees their points in PhoneCaptureModal

---

### Step 20 — Reward Redemption

**What you're building:** The owner can create rewards; diners can redeem them.

**Cursor prompt:**
```
Build loyalty reward creation and redemption for ScanServe.

Reference: 09_loyalty_system.md Sections 3 and 6

1. app/dashboard/loyalty/rewards/page.tsx:
   - List existing rewards
   - "+ Create Reward" form: name, points_required, reward_type, reward_value
   - Toggle active/inactive per reward

2. POST /api/loyalty/rewards and PUT /api/loyalty/rewards/:id API routes

3. RewardCard component (shown on diner bill screen):
   - Shows reward name, points required
   - "Redeem" button if diner has enough points, disabled if not

4. RedemptionModal:
   - Shows: current bill, discount amount, new total, points that will be deducted
   - [Confirm Redemption] button

5. POST /api/loyalty/redeem route:
   - Validate sufficient points
   - Deduct points from profile
   - Insert loyalty_transaction (type: 'redeem', points: negative)
   - Return discount details

6. Apply discount to Paystack payment amount:
   When diner confirms redemption → update order total → Paystack initialized with new total
```

**Done when:**
- Create a "10% Discount (350 pts)" reward from dashboard
- Get a customer profile to 350+ points
- See reward appear on bill screen
- Redeem it → Paystack amount is reduced by 10%
- Supabase shows loyalty_transaction with type: 'redeem'

---

### Step 21 — Loyalty Owner Dashboard

**What you're building:** Owner can see customer list, profiles, and loyalty stats.

**Cursor prompt:**
```
Build the loyalty owner dashboard for ScanServe.

Reference: 09_loyalty_system.md Section 4

1. app/dashboard/loyalty/page.tsx — overview stats:
   - Total members, orders with loyalty %, points in circulation
   - Tier breakdown: Bronze / Silver / Gold counts

2. app/dashboard/loyalty/customers/page.tsx — customer list:
   - Table: phone, name, tier icon, points, total spent, visits, last visit
   - Search by phone or name
   - Filter by tier

3. app/dashboard/loyalty/customers/[phone]/page.tsx — profile:
   - Customer stats header
   - Visit history table (paginated)
   - "+ Manual Points" button (modal with reason field)

Create all API routes from 09_loyalty_system.md Section 6.
```

**Done when:**
- Dashboard → Loyalty → see customer count
- Click into a customer → see their visit history

---

## PHASE 9: BILL SPLITTING
### Goal: Even split with shareable links that any phone can pay

---

### Step 22 — Bill Split System

**Cursor prompt:**
```
Build the bill splitting system for ScanServe.

Reference: 07_bill_splitting.md (full file)

Install: no new packages needed

1. lib/split-token.ts — generateSplitToken() and calculateSplitAmounts() from Section 2

2. SplitSetupScreen component:
   - Number selector: 2 / 3 / 4 / 5 / custom
   - Live preview: "4 people × ₦3,200 each"
   - [Generate Split Links] button

3. POST /api/splits/create route — full implementation from Section 4

4. app/split/[token]/page.tsx — SplitStatusScreen:
   - Shows all parts with paid/unpaid status
   - "Pay My Part Now" for part 1 (this device)
   - "Copy Link" + "WhatsApp" share buttons for other parts
   - Countdown timer to expiry
   - Subscribes to Supabase Realtime on bill_split_parts

5. app/split/[token]/[partNumber]/page.tsx — individual payer page:
   - Shows: restaurant name, "Part X of Y", amount
   - [Pay ₦X,XXX] button → Paystack modal
   - Already paid state, expired state

6. Update Paystack webhook to handle split payments:
   - Check if payment.metadata has split_id + part_number
   - Mark bill_split_parts record as paid
   - If all parts paid → mark bill_splits.status = 'complete' → mark order paid

Create all API routes from Section 4.
```

**Done when:**
- Tap "Split Bill" on bill screen → split setup appears
- Generate links → status screen shows all parts
- Open a split link on a different phone → pay → status screen updates
- All parts paid → order marked as paid in Supabase

---

## PHASE 10: ANALYTICS & POLISH
### Goal: Owner has visibility into their business

---

### Step 23 — Analytics Dashboard

**Cursor prompt:**
```
Build the analytics dashboard for ScanServe.

Reference: 10_analytics_dashboard.md (full file)

Install: npm install recharts

1. app/dashboard/analytics/page.tsx with DateRangePicker:
   Presets: Today, Yesterday, Last 7 days, Last 30 days, Custom

2. GET /api/analytics/:restaurantId route:
   Use Supabase rpc() to run aggregation queries
   Create a Supabase DB function (SQL) for the complex revenue-by-hour query
   Return all data in a single response

3. Components using recharts:
   - MetricCard (4x: revenue, orders, AOV, avg prep time)
   - TopDishesChart (horizontal bar)
   - RevenueByHourChart (area chart — WAT timezone, filter 6am–11pm)
   - PaymentMethodChart (donut)
   - LoyaltySnapshot block

Format all currency as ₦X,XXX (no decimals).
Charts must be readable on a 6" mobile screen.
```

**Done when:**
- Dashboard → Analytics → see real data from test orders
- Date range changes update all charts
- All currency formatted correctly

---

### Step 24 — Offline Support

**Cursor prompt:**
```
Add offline support and PWA capability to ScanServe.

Reference: 11_offline_support.md (full file)

Install: npm install next-pwa idb

1. Configure next-pwa in next.config.js per Section 2:
   - Cache menu API responses (StaleWhileRevalidate, 5 min)
   - Cache menu images (CacheFirst, 1 day)
   - Cache app shell static files

2. lib/offline-queue.ts — full implementation from Section 3:
   queueOrderOffline(), getPendingOrders(), flushOfflineOrders(), clearExpiredOrders()

3. hooks/useOfflineSync.ts — flush queue on reconnect

4. Update cart order submission (Step 14):
   If navigator.onLine = false → call queueOrderOffline() instead of fetch
   Show "Order queued" confirmation state

5. OfflineBanner component — sticky banner when offline (Section 5)

6. public/manifest.json — PWA manifest from Section 4

7. Create icons: public/icons/icon-192.png and icon-512.png
   (Use a simple ScanServe "SS" logo or any placeholder for now)

8. Dashboard offline state:
   Show "No connection" banner
   Disable action buttons with tooltip
```

**Done when:**
- In Chrome DevTools → Network tab → set to Offline
- Menu page still loads (from cache)
- Offline banner appears
- Place order while "offline" → order appears in IndexedDB
- Switch back to Online → order submits automatically

---

### Step 25 — Staff PIN Login & Settings

**Cursor prompt:**
```
Add staff PIN login and restaurant settings to ScanServe.

STAFF LOGIN:
Reference: 02_auth_onboarding.md Section 1.4

Create app/(auth)/staff-login/page.tsx:
- Restaurant slug input (validates on blur, shows restaurant name)
- 4-digit PIN input (auto-advance between digits, auto-submit on 4th digit)
- POST /api/auth/staff-login route (validates PIN, returns staff session)
- Rate limit: 5 failed attempts = 15 minute lockout

SETTINGS PAGE:
Create app/dashboard/settings/page.tsx with tabs:

Tab 1 — Restaurant:
  Edit: name, description, address, phone, Instagram, logo, cover image
  Toggle: is_accepting_orders (kill switch for ordering)
  Toggle: vat_enabled, vat_rate

Tab 2 — Loyalty:
  Points per ₦100 spent
  Silver tier threshold
  Gold tier threshold
  Enable/disable loyalty

Tab 3 — Staff:
  List staff accounts
  Add staff (name, role, set 4-digit PIN)
  Deactivate staff

Tab 4 — Payments:
  Update Paystack keys
  Test connection button
```

**Done when:**
- Visit `/staff-login` → enter slug + PIN → see order dashboard
- Settings page saves changes → refresh → changes persist
- Toggle "Accepting Orders" off → diner trying to order sees error message

---

## PHASE 11: FINAL POLISH
### Goal: Production-ready for Uyo pilot

---

### Step 26 — Error States & Loading States

**Cursor prompt:**
```
Add comprehensive error and loading states throughout ScanServe.

Audit every user-facing screen and add:

1. Loading states:
   - Skeleton loaders for menu page (not spinner — skeleton matches layout)
   - Loading spinner on all form submit buttons (replace text while loading)
   - Skeleton for dashboard order cards on initial load
   - Skeleton for analytics charts

2. Error states:
   - Menu fails to load: "Menu unavailable. Please ask staff for assistance."
   - Order submission fails: inline error with retry button
   - Payment fails: clear error message + retry option
   - Restaurant not accepting orders: friendly message

3. Empty states:
   - No menu items: "Menu coming soon. Ask your waiter for today's options."
   - No orders today: "No orders yet today."
   - No loyalty members: "Your first loyalty member will appear here."

4. Toast notifications for:
   - Item added to cart
   - Order placed
   - Availability toggle changed
   - Settings saved
   Use a simple custom toast (no heavy library needed)

5. 404 page for invalid restaurant slugs:
   "This restaurant isn't on ScanServe yet."
```

---

### Step 27 — Mobile Optimization Pass

Do this manually on a real Android phone (not just Chrome DevTools):

```
Test every screen on your actual phone:

□ Menu page loads in < 3 seconds on mobile data
□ Category tabs scroll horizontally without issues
□ "+ Add" buttons are large enough to tap (min 44px)
□ Item detail modal slides up smoothly
□ Cart bottom bar doesn't cover important content
□ Dashboard order cards are tappable on mobile
□ Kanban columns scroll correctly on small screen
□ All text is readable without zooming
□ QR code scans correctly from printed paper

Fix anything that feels awkward on mobile before deployment.
```

---

### Step 28 — Deploy to Vercel

**Cursor prompt:**
```
Prepare ScanServe for production deployment on Vercel.

1. Update next.config.js:
   - Add image domains for Supabase storage
   - Set up proper security headers

2. Create vercel.json with:
   - Function timeout: 30 seconds (for webhook handler)
   - Region: closest to Nigeria (likely fra1 — Frankfurt, or use default)

3. Check all environment variables are in .env.local.example with descriptions

4. Ensure no hardcoded localhost URLs anywhere — all use NEXT_PUBLIC_APP_URL
```

**Manual deployment steps:**
```
1. Push code to GitHub
2. Import project in Vercel → connect GitHub repo
3. Add all environment variables in Vercel Dashboard
   (Use live Paystack keys for production, test keys for preview)
4. Deploy
5. Update Supabase: Authentication → URL Configuration → add your Vercel URL
6. Update Paystack webhook URL to your Vercel URL
7. Set NEXT_PUBLIC_APP_URL in Vercel to your production URL
```

**Done when:**
- Production URL loads the app
- Sign up on production → receives email → can complete onboarding
- Place a test order → payment goes through → WhatsApp receipt received

---

## PHASE 12: PILOT LAUNCH
### Goal: First real restaurant in Uyo using ScanServe

---

### Step 29 — Pilot Preparation

```
Before you walk into the restaurant:

□ Create their account yourself (you drive the onboarding)
□ Build their menu from their existing menu card or Instagram
□ Add all their tables
□ Print QR codes (A6 cards or laminated sheets)
□ Do a full test: scan QR → order → pay (use ₦100 test order)

During onboarding with the owner:
□ Show them the dashboard on their phone
□ Show them the order queue — place a test order while they watch
□ Show them how to toggle items sold out
□ Show them how to advance order status
□ Show them the loyalty customer list (will be empty)
□ Give them your WhatsApp number for support

Leave them with:
□ Printed quick-start guide (1 page)
□ QR codes on tables
□ Your WhatsApp for same-day support
```

---

### Step 30 — Admin Panel (Basic)

Build this after pilot launch, not before. You need real data to make it useful.

**Cursor prompt:**
```
Build the basic ScanServe admin panel.

Reference: 12_admin_panel.md (full file)

This is internal-only. Simple is fine.

1. app/admin/layout.tsx — separate from restaurant dashboard
2. app/admin/restaurants/page.tsx — table of all restaurants with stats
3. app/admin/payments/page.tsx — platform-wide payment log

Grant admin access by running this in Supabase SQL editor:
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your@email.com';
```

---

## Quick Reference: Cursor Best Practices

**Starting a new session:**
```
Always begin by saying:
"I'm building ScanServe — a QR-based restaurant ordering SaaS for Nigeria.
The tech stack is Next.js 14, Supabase, Paystack, Tailwind CSS, TypeScript.
The database schema is in [paste relevant section of 01_data_models.md].

RESPONSIVE REQUIREMENTS:
- Mobile-first. Base styles for mobile, md:/lg: for desktop.
- Diner-facing pages: max-width 480px centered shell on desktop. Same layout as mobile.
- Dashboard pages: bottom tab nav on mobile (<lg), left sidebar (lg+).
- Tables → card stacks on mobile. Modals → bottom sheets on mobile.
- All touch targets minimum 48px height on mobile.
- No horizontal scroll except category tabs, featured strips, chart overflow.
- Reference: 00b_responsive_design_spec.md for all layout decisions."
```

**When Cursor gets confused:**
```
"Stop. Let's focus only on [specific thing].
The file to modify is [filename].
The expected behavior is [behavior].
Do not touch any other files."
```

**When something breaks:**
```
"This error is happening: [paste error]
The file that has the problem is: [filename]
Here is the relevant code: [paste code]
Fix only this specific error. Do not refactor anything else."
```

**When you want to add a feature:**
```
"Add [feature] to [component/page].
The reference doc for this is: [paste the relevant section from your docs].
Keep all existing functionality intact."
```

---

## Checkpoint Summary

| Checkpoint | Phase Complete | What You Can Demo |
|------------|---------------|-------------------|
| After Step 8 | Auth + Dashboard shell | Owner signup → onboarding → dashboard |
| After Step 11 | Menu + QR | Build menu, download QR codes |
| After Step 14 | Diner ordering | Full scan → browse → order flow |
| After Step 16 | Kitchen | Real-time order queue with audio |
| After Step 18 | Payments | Full payment + WhatsApp receipt |
| After Step 21 | Loyalty | Earning, tiers, redemption, owner view |
| After Step 22 | Bill split | Shareable split links, real-time status |
| After Step 24 | Offline | Works offline, installs as PWA |
| After Step 28 | Deploy | Live on production URL |
| After Step 29 | **PILOT** | First real restaurant live |

---

*Build in order. Ship the checkpoint. Then move on.*
*Scan. Order. Pay. Done.*
