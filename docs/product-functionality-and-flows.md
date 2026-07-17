# Moji Product Functionality and Flow Documentation

Last updated: July 6, 2026

## 1. Product Overview

Moji is a restaurant operating system prototype with three major user-facing surfaces:

1. **Restaurant owner/staff dashboard** for managing restaurant setup, menu, orders, tables, transactions, loyalty, analytics, staff, and settings.
2. **Diner QR ordering experience** for browsing a restaurant menu, adding items to cart, placing dine-in orders, tracking order status, requesting a bill, paying, downloading receipts, and splitting bills.
3. **Community preset feed** for browsing and submitting UI/theme presets. This appears to be an inherited or parallel product surface and is not part of the restaurant ordering core.

The current product is partly backend-ready and partly local/mock. The dashboard and diner flows are functional in preview through mock data and Zustand/localStorage stores. Server actions, API routes, validation schemas, database schemas, and service layers exist for production-style behavior, but several write flows still fall back to mock behavior or require a configured database.

## 2. Current Architecture

### 2.1 Framework and Runtime

- **Framework:** Next.js 16 App Router.
- **Frontend:** React 19, Tailwind CSS 4, Phosphor icons, lucide icons, shadcn/base UI primitives.
- **State:** Zustand stores for menu, cart/session, dashboard settings, and dashboard orders.
- **Backend model:** Better Auth, Drizzle ORM, Neon/Postgres-compatible schema, server actions, API routes, Zod validation.
- **Design system:** `lib/moji-design-system` documents foundations, tokens, components, and diner ordering patterns. Dashboard-specific aliases live in `components/dashboard/ui/dashboard-tokens.ts`.
- **Persistence in preview:** Menu, cart/session, and dashboard settings persist in browser localStorage. Orders store is in-memory unless backed by server/database actions.

### 2.2 Important State Stores

#### `store/menu.ts`

Owns the current menu used by dashboard management and diner menu preview.

Current capabilities:

- Load initial categories/items from `MOCK_MENU`.
- Persist menu categories to localStorage under `moji-menu-store`.
- Add, update, and delete categories.
- Add, update, and delete menu items.
- Toggle item availability.
- Reset all items to available.
- Lookup item/category by id.

Current limitation:

- This is local browser persistence, not backend persistence, unless replaced by server-backed menu services.

#### `store/cart.ts`

Owns diner cart, submitted session batches, order context, and loyalty capture.

Current capabilities:

- Set restaurant/table context.
- Add items with quantity, selected modifiers, and special notes.
- Update item quantity and remove items.
- Clear active cart.
- Submit cart into `sessionBatches`.
- Demo-serve all submitted batches.
- Clear full diner session.
- Store loyalty name/phone locally.
- Persist data to localStorage under `moji-cart`.

Current limitation:

- Diner order submission in the live preview currently uses local session batches rather than always posting through `/api/orders`.

#### `store/dashboard-settings.ts`

Owns dashboard feature toggles, restaurant profile draft, tax settings, and PDF template choice.

Current capabilities:

- Persist settings to localStorage under `moji-dashboard-settings`.
- Toggle modules: menu, orders, tables, payments, loyalty, analytics, staff, notifications, integrations.
- Keep menu always enabled.
- Update profile fields such as name, slug, description, city, phone, logo, cover, address, email, currency.
- Update VAT/service-charge settings.
- Set PDF template.

Current limitation:

- Preview settings persistence is local. Server actions exist for DB-backed profile/settings updates, but the current dashboard UI primarily uses local store behavior.

#### `store/orders.ts`

Owns dashboard order queue state.

Current capabilities:

- Start with `MOCK_ORDERS`.
- Add manual/staff orders.
- Update order status.
- Select active order.
- Filter orders by status.

Current limitation:

- Store is in-memory and does not persist across reloads unless backed by server/database functionality.

## 3. Route Map

### 3.1 Auth Routes

- `/login`
- `/signup`
- `/verify-email`
- `/reset-password`
- `/reset-password?token=mock-token`
- `/staff-login`

### 3.2 Onboarding Routes

- `/onboarding`
- `/onboarding/step-1`
- `/onboarding/step-2`

### 3.3 Dashboard Routes

- `/dashboard`
- `/dashboard/menu`
- `/dashboard/orders`
- `/dashboard/settings`
- `/dashboard/tables`
- `/dashboard/transactions`
- `/dashboard/loyalty`
- `/dashboard/loyalty/customers`
- `/dashboard/loyalty/customers/[phone]`
- `/dashboard/loyalty/rewards`
- `/dashboard/loyalty/settings`
- `/dashboard/analytics`
- `/dashboard/staff`

### 3.4 Diner Routes

- `/[restaurantSlug]/t/[tableNumber]`
- `/[restaurantSlug]/t/[tableNumber]/cart`
- `/[restaurantSlug]/t/[tableNumber]/cart?view=cart`
- `/[restaurantSlug]/t/[tableNumber]/cart?view=orders`
- `/[restaurantSlug]/t/[tableNumber]/bill`
- `/split/[token]/[part]`

### 3.5 Design System Route

- `/design-system`

### 3.6 Community Preset Feed Routes

- `/feed`
- `/feed/[code]`

### 3.7 API Routes

- `/api/auth/[...all]`
- `/api/onboarding/check-slug`
- `/api/onboarding/complete`
- `/api/orders`
- `/api/payments/report`
- `/api/loyalty`

## 4. Authentication Flow

### 4.1 Owner Login

Route: `/login`

Present behavior:

- Shows the owner dashboard login form.
- Uses shared auth layout and auth card primitives.
- Includes email and password fields.
- Includes password visibility control.
- Includes forgot-password link.
- Includes Google continuation UI.
- Provides navigation to account creation and staff login.

Expected flow:

1. User enters email and password.
2. User submits login.
3. Auth provider validates the session.
4. User is routed to dashboard or onboarding depending on account/setup state.

Current implementation note:

- The UI is polished for preview, but the exact production auth behavior depends on Better Auth environment configuration and session availability.

### 4.2 Signup

Route: `/signup`

Present behavior:

- Shows account creation form.
- Uses the same auth visual system as login.
- Can transition into verification/setup states.

Expected flow:

1. User enters account details.
2. System creates owner account.
3. User verifies email.
4. User proceeds into onboarding.

Current implementation note:

- Verification and onboarding are partially mocked in preview.

### 4.3 Verify Email

Route: `/verify-email`

Present behavior:

- Shows verification instructions and resend/edit email actions.
- Maintains the auth page structure.

Expected flow:

1. User receives verification email.
2. User verifies account.
3. User continues to onboarding or dashboard.

### 4.4 Reset Password

Routes:

- `/reset-password`
- `/reset-password?token=mock-token`

Present behavior:

- Request-link state for entering email.
- Token state for setting a new password.
- Shared auth styling.

Expected flow:

1. User requests password reset.
2. User opens reset link.
3. User sets a new password.
4. User returns to login.

### 4.5 Staff Login

Route: `/staff-login`

Present behavior:

- Staff-facing PIN flow.
- Workspace confirmation and PIN entry.
- Mocked PIN notice.

Expected flow:

1. Staff selects/enters workspace.
2. Staff enters PIN.
3. Role-specific dashboard access is granted.

Current limitation:

- Staff PIN validation is mocked/local in the preview flow.

## 5. Onboarding Flow

### 5.1 Onboarding Entry

Route: `/onboarding`

Present behavior:

- Redirects or starts the setup sequence.

### 5.2 Step 1: Restaurant Details

Route: `/onboarding/step-1`

Current fields and actions:

- Restaurant name.
- Auto-generated/editable slug.
- City.
- Phone.
- Instagram.
- Cuisine selection.
- Logo upload placeholder.

Validation:

- Restaurant name is required.
- Slug is required and normalized.
- City is required.
- Nigerian phone number format is validated.
- Slug availability check can call `/api/onboarding/check-slug`.

State behavior:

- Step data is saved to `sessionStorage`.
- On successful validation, user proceeds to step 2.

Current limitation:

- Logo upload in onboarding is still a placeholder.
- Cuisine selection exists in step 1 even though recent product direction may remove unnecessary setup friction.

### 5.3 Step 2: Menu QR

Route: `/onboarding/step-2`

Current behavior:

- Reads saved setup data from `sessionStorage`.
- Shows public menu link preview.
- Generates QR code preview.
- Allows QR code SVG download.
- Saves profile data into dashboard settings local store.
- Marks onboarding complete in `sessionStorage`.
- Redirects to `/dashboard`.

Current limitation:

- The actual server endpoint `/api/onboarding/complete` exists, but the current simplified UI path uses local mocked completion rather than requiring payment/table setup.

### 5.4 Onboarding API

`GET /api/onboarding/check-slug`

- Validates slug presence and format.
- Returns availability from service.
- In mock mode, slugs are treated as available.

`POST /api/onboarding/complete`

- Validates full onboarding payload.
- Calls `completeOnboarding`.
- DB mode creates restaurant, owner membership, settings, and initial tables.
- Mock mode returns synthetic success.

Current mismatch:

- The domain schema still expects profile plus table setup, while the simplified UI no longer visibly collects table setup. This should be reconciled before production.

## 6. Dashboard Shell and Navigation

Route group: `/dashboard/*`

Current behavior:

- Sidebar navigation groups dashboard modules.
- Mobile top bar/drawer support exists.
- Restaurant switcher exists in sidebar.
- Feature-aware navigation is partially supported through dashboard settings store.
- Disabled modules can show setup prompts.

Modules:

- Overview.
- Orders.
- Menu.
- Tables.
- Transactions.
- Loyalty.
- Analytics.
- Staff.
- Settings.

Current limitation:

- Some module enable/disable behavior is local and not fully persisted server-side.

## 7. Dashboard Overview

Route: `/dashboard`

Present functionality:

- Greeting with restaurant name/city from dashboard settings.
- Diner ordering status banner.
- Metrics for active orders, served revenue, menu items.
- Recent orders list.
- Recent transactions list.
- Quick actions for editing menu and QR codes.

Data sources:

- Menu count from `useMenuStore`.
- Profile from `useDashboardSettingsStore`.
- Orders from `useOrdersStore` or mock orders.
- Transactions from mock data.

Current limitations:

- Pause orders button is visual; full settings/diner enforcement needs backend-backed behavior.
- Recent transactions are still mock-driven.

## 8. Dashboard Menu Management

Route: `/dashboard/menu`

Primary components:

- `MenuManagementPage`
- `CategoryCard`
- `DashboardMenuItemCard`
- `CategoryForm`
- `MenuItemForm`
- `MenuPreview`

Present functionality:

- View categories and items.
- Add category.
- Edit category.
- Delete category.
- Add item to category.
- Edit item name, description, price, prep time, availability, featured state, and tags.
- Delete item.
- Toggle item availability.
- Reset all availability.
- Show diner-style live preview.
- Export/download menu PDF through `lib/menu-pdf.ts` with `jspdf`.

Data source:

- `store/menu.ts` with localStorage persistence.

Diner sync:

- Diner menu reads from the same menu store in client behavior, so dashboard edits should appear in the diner menu after client hydration.

Current limitations:

- Menu CRUD is local in preview.
- Item image upload UI exists, but production upload/storage still needs implementation.
- PDF export depends on `jspdf` being installed and available in the runtime.

## 9. Dashboard Orders

Route: `/dashboard/orders`

Primary components:

- `OrderCard`
- `DashboardModal`
- `DashboardTable`
- `DashboardFilterBar`
- `DashboardStatusBadge`

Present functionality:

- View orders in queue or table mode.
- Search and filter by status.
- Sort orders.
- Create manual/staff order from current menu items.
- Add multiple items to manual order.
- Compute VAT using dashboard tax settings.
- Move orders through statuses:
  - pending
  - in kitchen
  - ready
  - served
  - paid
- View order details.
- Display timestamps and totals.

Data source:

- `store/orders.ts` in preview.
- `updateOrderStatusAction` exists for server-backed status updates.

Current limitations:

- Manual order creation is local/in-memory in preview.
- Server action status updates require authenticated restaurant context and database-backed UUID order ids.

## 10. Dashboard Settings

Route: `/dashboard/settings`

Present sections:

- General restaurant profile.
- Opening hours.
- Menu QR and PDF.
- Tax/VAT.
- Notifications.
- Security.

Present functionality:

- Update restaurant name, slug, description, city, phone, address, email, currency.
- Set logo and cover URL/preview values.
- Configure VAT and service charge values.
- Generate/copy menu links.
- View QR code.
- Download QR code.
- Set PDF template.
- Toggle notification preferences locally.
- Configure security placeholders.

Data source:

- `useDashboardSettingsStore` with localStorage persistence.

Server-backed actions:

- `getRestaurantProfileAction`
- `getRestaurantSettingsAction`
- `updateRestaurantProfileAction`
- `updateServiceChargeAction`

Current limitations:

- Real upload handling for logo/cover files is not complete.
- Settings-to-diner reflection is partial/local.
- Server writes require database configuration.

## 11. Dashboard Tables

Route: `/dashboard/tables`

Present functionality:

- Show table metrics.
- Show table list/cards.
- Add table.
- Edit table.
- Delete table.
- View QR.
- Copy diner link.
- Download QR.
- Display statuses:
  - available
  - occupied
  - awaiting payment

Data source:

- Mock tables in preview.
- Server actions exist for DB-backed reads/writes.

Server actions:

- `listTablesAction`
- `createTableAction`
- `batchCreateTablesAction`
- `updateTableAction`
- `deleteTableAction`

Current limitations:

- Writes require database configuration.
- UX has been under active redesign; mobile uses card patterns, desktop table pattern still needs final audit.

## 12. Dashboard Transactions

Route: `/dashboard/transactions`

Present functionality:

- View transaction metrics.
- Search transactions.
- Filter by payment method/status.
- Export CSV.
- Confirm/reject payment actions are present through server actions.
- Shows paid, pending, and failed/rejected states.

Data source:

- Attempts to fetch payment data through actions.
- Falls back to mock transactions when no database is configured.

Server actions:

- `listPaymentsAction`
- `confirmPaymentAction`
- `rejectPaymentAction`

Current limitations:

- Real payment confirmation/rejection requires database.
- Diner-side payment reporting API exists but the current UI payment panel is primarily mocked/local.

## 13. Dashboard Loyalty

Routes:

- `/dashboard/loyalty`
- `/dashboard/loyalty/customers`
- `/dashboard/loyalty/customers/[phone]`
- `/dashboard/loyalty/rewards`
- `/dashboard/loyalty/settings`

Present functionality:

- Loyalty overview.
- Customer list.
- Customer detail page by phone.
- Rewards list.
- Reward create/edit/delete flows.
- Loyalty settings interface.
- Disabled/setup prompt behavior when loyalty module is off.

Domain behavior:

- Tiers: Bronze, Silver, Gold, Platinum.
- Rewards: free item or discount percent.
- Points helper functions exist.

Current limitations:

- Reward writes require database.
- Diner bill uses local mocked points redemption, not full backend loyalty redemption.

## 14. Dashboard Analytics

Route: `/dashboard/analytics`

Present components:

- Revenue by hour chart.
- Top dishes chart.
- Payment method chart.
- Loyalty snapshot.
- KPI cards/range controls.

Data source:

- Analytics service reads database when available.
- Falls back to mock analytics data when no database is configured.

Server actions:

- `getDashboardAnalyticsAction`
- `getRevenueTrendAction`
- `getTopDishesAction`
- `getPaymentMethodBreakdownAction`

Current limitations:

- Production accuracy depends on real order/payment data in database.

## 15. Dashboard Staff

Route: `/dashboard/staff`

Present functionality:

- View staff list.
- Add staff member.
- Deactivate staff.
- Reactivate inactive staff.
- Display roles:
  - manager
  - staff
  - kitchen
- Display masked PIN.
- Mock edit PIN action.

Data source:

- Local component state initialized from mock staff.

Current limitations:

- Staff records and PIN management are not database-backed in preview.
- Permission enforcement is not complete beyond UI display.

## 16. Diner Menu Flow

Route: `/[restaurantSlug]/t/[tableNumber]`

Primary components:

- `DinerShell`
- `MenuPage`
- `MenuItemCard`
- `ItemDetailModal`

Present functionality:

- Shows restaurant header, table, rating/time badges, and menu categories.
- Sticky category tabs.
- Menu sections with item counts.
- Item cards with fallback image treatment, tags, price, prep time, add controls.
- Sold-out items are disabled.
- Direct add for items without required modifiers.
- Item detail bottom sheet for items with modifiers or detail view.
- Required modifier validation.
- Optional modifiers.
- Special note.
- Quantity stepper.
- Fixed add-to-order CTA.
- Floating cart action.
- Floating live-orders action when session orders exist.

Data source:

- Menu store and mock restaurant data.

Current limitations:

- Diner route currently uses mock restaurant wrapper for server page props.
- Production diner route should resolve restaurant/table by slug/table through services.

## 17. Diner Cart Flow

Route: `/[restaurantSlug]/t/[tableNumber]/cart?view=cart`

Present functionality:

- View active cart items.
- Increment/decrement item quantities.
- Remove item when quantity reaches zero.
- Clear cart.
- Add kitchen note UI.
- View subtotal, VAT, total.
- Optional phone capture for loyalty before order submission.
- Place order.

State behavior:

- `submitCartToSession` moves cart items into a session batch.
- Cart is cleared after submission.
- URL view changes to `?view=orders`.

Current limitations:

- Kitchen note UI is not currently carried into the submitted session batch.
- Order submission is local in preview instead of always using `/api/orders`.

## 18. Diner Live Orders Flow

Route: `/[restaurantSlug]/t/[tableNumber]/cart?view=orders`

Present functionality:

- Shows submitted order batches.
- Shows grouped items per batch.
- Shows order status chip.
- Shows batch timestamp, item count, and batch total.
- Opens status timeline sheet per batch.
- Demo action marks all batches as served.
- Once all items are served, shows `Request Bill` CTA to the bill route.
- Allows adding more items.

Current timeline statuses:

- placed
- preparing
- ready
- served

Current limitation:

- Status updates are demo/local and not synced to dashboard orders in production mode.

## 19. Diner Bill Flow

Route: `/[restaurantSlug]/t/[tableNumber]/bill`

Primary components:

- `BillScreenClient`
- `BillView`
- `BillSummary`
- `DinerPaymentPanel`
- `DinerReceipt`
- `SplitBillModal`

Present functionality:

- Reads session batches from cart store.
- Groups items for bill display.
- Computes subtotal, VAT, tip, discount, and payable total.
- Allows tip selection:
  - no tip
  - 5%
  - 10%
  - custom
- Shows loyalty points entry or points summary when loyalty data exists.
- Applies/removes mocked points discount.
- Opens payment method screen.
- Opens split bill screen.
- Shows payment success screen.
- Shows receipt.
- Downloads receipt image.
- Clears session and returns to menu.

Current limitations:

- Loyalty redemption is mocked locally.
- Payment completion is mocked locally and does not necessarily call `/api/payments/report`.
- Bill route depends on local session batches. If localStorage is empty, it shows an empty/preparing state.

## 20. Diner Payment Flow

Component: `DinerPaymentPanel`

Payment methods:

- Bank transfer.
- Card.
- Cash.

Present functionality:

- Segmented method selector.
- Bank transfer account details:
  - bank name
  - account name
  - account number
  - copy account number
- Amount is shown prominently.
- Completion CTA:
  - bank: "I have transferred..."
  - card/cash: "Mark ... as paid"
- Calls `onComplete(method)` to return success state.
- Uses diner toasts for copy/payment feedback.

Current limitation:

- Account details are hardcoded in the component instead of reading from `getRestaurantPaymentInfo`.
- Completion is mocked and does not submit to payment API in the current diner UI.

## 21. Diner Split Bill Flow

Main route: `/[restaurantSlug]/t/[tableNumber]/bill`

Standalone split route: `/split/[token]/[part]`

### 21.1 Equal Split

Present functionality:

- Choose number of people:
  - 2
  - 3
  - 4
  - 5
  - custom number
- Calculate amount per person.
- Generate split links.
- "You" can pay your share through the payment method panel.
- Other parts expose copy link and WhatsApp send.
- Paid parts are marked in local state.
- When all parts are paid, session can be closed.

### 21.2 By Item Split

Present functionality:

- Select items from the bill.
- Selected items determine share total.
- Pay selected share through payment method panel.

### 21.3 Custom Split

Present functionality:

- Enter custom amount.
- Pay custom amount through payment method panel.

### 21.4 Standalone Split Link

Present functionality:

- Shows restaurant, table, part number, total parts, and amount due.
- User taps Pay.
- User sees the same diner payment method panel.
- Payment confirmation screen shows method and amount.

Current limitations:

- Split tokens are generated client-side and are not persisted server-side.
- Standalone split links use mocked route data and do not validate token ownership.
- Payment status across devices is not shared in real time.

## 22. Diner Loyalty Flow

Present functionality:

- Phone capture appears during order placement when loyalty is enabled.
- Diner can skip or enter name/phone.
- Bill page shows points if loyalty data exists.
- Mocked point balance defaults to 1,250 points.
- Earned points are computed as `Math.floor(subtotal / 100)`.
- Redemption rule is `1 point = ₦1`.
- Diner can apply or remove points.
- Discount appears in bill summary, payment amount, and receipt.
- Success screen shows updated points balance.

Current limitations:

- Points are local and mocked.
- Backend loyalty services exist but are not fully wired into diner bill redemption.

## 23. Receipt Flow

Present functionality:

- Receipt appears after payment success.
- Shows receipt id, restaurant/table, date/time, payment method, items, subtotal, VAT, tip, discount, and total.
- `Download receipt` generates an image from receipt data using canvas.

Current limitations:

- Receipt download is client-side image generation, not PDF.
- Receipt record is not persisted server-side in preview mode.

## 24. API and Server Action Behavior

### 24.1 Orders API

`POST /api/orders`

Intended behavior:

- Public diner order endpoint.
- Validates order payload.
- Rate-limits per IP.
- Resolves restaurant by slug.
- Revalidates menu item prices server-side.
- Creates order and order items in DB.

Mock behavior:

- Service can return mock behavior when database is absent.

### 24.2 Payments API

`POST /api/payments/report`

Intended behavior:

- Public self-reported payment endpoint.
- Validates payment payload.
- Rate-limits per IP.
- Reads amount from linked order instead of trusting client.
- Creates pending payment reference.

Current UI mismatch:

- Diner payment panel currently completes locally instead of always posting to this endpoint.

### 24.3 Loyalty API

`GET /api/loyalty?slug=<slug>&phone=<phone>`

Intended behavior:

- Public lookup of diner loyalty profile by restaurant slug and phone.
- Validates Nigerian phone format.
- Returns profile or null.

### 24.4 Auth API

`/api/auth/[...all]`

Behavior:

- Delegates GET/POST to Better Auth Next.js handler.
- Auth config is resolved lazily.

## 25. Design System and UI Foundations

Present design-system assets:

- `lib/moji-design-system/foundations.ts`
- token files for typography, colors, spacing, radius, borders, elevation, layout, motion, z-index
- component specs for actions, inputs, cards, feedback, flow, navigation, sheets
- diner ordering pattern docs
- `/design-system` route showing live specimens

Dashboard primitives:

- `DashboardButton`
- `DashboardModal`
- `DashboardField`
- `DashboardInput`
- `DashboardTextarea`
- `DashboardSelect`
- `DashboardFilterBar`
- `DashboardFileUpload`
- `DashboardEmptyState`
- `DashboardStatusBadge`
- `DashboardTable`
- `DashboardPageHeader`
- `DashboardSetupPrompt`
- `MetricCard`
- `Toggle`
- `dashboardToast`

Diner primitives:

- `BottomSheet`
- `FixedActionBar`
- `PageHeader`
- `SegmentedTabs`
- `ItemCard`
- `BillSummary`
- `DinerPaymentPanel`
- `DinerReceipt`
- `DinerFeedbackCard`
- `DinerIconBadge`
- `DinerInfoRow`
- `DinerInput`
- `DinerTextarea`
- `OrderStatusTimeline`
- `dinerToast`

Typography:

- Georgia is configured as display serif for expressive titles/headings.
- Geist Sans remains the operational font for body, inputs, buttons, labels, tables, and dashboard UI.

## 26. Community Preset Feed

Routes:

- `/feed`
- `/feed/[code]`

Present functionality:

- Browse community presets.
- Filter/sort preset feed.
- View preset details.
- Like presets if authenticated.
- Submit community preset.
- Random preset support.
- Open Graph image route for preset detail.

Services/actions:

- `fetchPresetsAction`
- `pickRandomPresetCodeAction`
- `toggleLikeAction`
- `submitCommunityPreset`

Current note:

- This surface is separate from the restaurant ordering product and should be treated as a parallel module unless product strategy says otherwise.

## 27. Production Readiness Notes

### 27.1 Currently Working in Preview

- Auth page UI.
- Onboarding UI with local setup completion.
- Dashboard overview with local/mock data.
- Dashboard menu CRUD with localStorage persistence.
- Diner menu browsing and cart.
- Diner order session batches.
- Diner bill, payment panel, split bill, and receipt flows in local mode.
- Dashboard settings local profile/tax state.
- QR code preview and download in onboarding/settings.
- Local dashboard staff management.
- Local dashboard orders management.

### 27.2 Backend-Ready but Not Fully Wired in UI

- Order placement API.
- Payment reporting API.
- Loyalty lookup API.
- Dashboard server actions for menu, orders, payments, tables, settings, analytics, loyalty.
- Database schema for restaurants, settings, tables, orders, payments, loyalty, staff-like membership.

### 27.3 Major Gaps Before Production

1. Real auth/session gating for dashboard and staff routes.
2. Full database persistence for restaurant profile, logo/cover uploads, menu CRUD, orders, tables, payments, loyalty, staff, and settings.
3. File upload/storage for restaurant logos, covers, and menu item images.
4. Reconcile onboarding UI with backend onboarding schema.
5. Wire diner order placement to `/api/orders`.
6. Wire diner payment confirmation to `/api/payments/report`.
7. Persist split bill tokens/parts and synchronize payment status across users.
8. Make dashboard orders reflect diner-submitted orders.
9. Make payment confirmations update transactions and order state.
10. Finish feature-toggle enforcement across dashboard and diner.
11. Complete accessibility QA for modals, focus traps, labels, and mobile layouts.
12. Add automated E2E coverage for auth, onboarding, settings sync, menu CRUD, diner ordering, payment, split bill, and dashboard modules.

## 28. Recommended QA Coverage

Minimum production acceptance tests:

1. Owner signs up, verifies email, completes onboarding, and lands in dashboard.
2. Owner edits restaurant profile/logo/cover/settings, reloads, and sees persisted data.
3. Owner adds/edits/deletes categories and items; diner menu reflects changes.
4. Diner scans table route, adds item with modifiers, places order.
5. Dashboard receives order and staff progresses it to served.
6. Diner requests bill, applies tip/loyalty if enabled, chooses payment method, and receives receipt.
7. Split bill equal/by-item/custom flows complete and status remains synchronized.
8. Table QR download works.
9. Transactions reflect reported/confirmed/rejected payments.
10. Disabled modules show setup states, not broken pages.

## 29. Summary

Moji currently has a strong front-end prototype with meaningful dashboard and diner ordering flows, a growing design system, local persistence for preview workflows, and a backend architecture scaffold for production. The biggest remaining product work is connecting the polished UI flows to durable backend persistence, especially settings/profile uploads, menu CRUD, diner orders, payments, split bills, loyalty, and dashboard synchronization.
