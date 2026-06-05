# Dashboard Sweep Handoff

## Goal

The current dashboard work is intended to turn Moji into a flexible restaurant control panel, not a fixed all-features-required admin. Restaurants should be able to use only the modules they need, such as menu-only, menu plus QR/table ordering, payments, loyalty, analytics, staff access, notifications, and integrations.

The dashboard should use Moji design-system foundations consistently: gray/white border-first surfaces, semantic colors, clear hierarchy, tokenized spacing/radius/typography, medium-weight labels, polished dialogs, visible feedback, and reusable components instead of one-off Tailwind combinations.

## Current Branch Context

- Branch: `main`
- The diner flow polish from the previous pass is still present in the working tree.
- The dashboard sweep was interrupted mid-implementation, so the current changes should be treated as a useful foundation plus partial module work, not a finished dashboard polish pass.
- The `/dashboard` preview was opened for live review.

## Implemented So Far

### Diner cleanup still in the working tree

- Added an info callout with icon to the Moji points bottom sheet.
- Tightened bank transfer payment panel spacing.
- Added a bit more split-bill header/content spacing.
- Adjusted diner page header bottom spacing.
- Updated split-bill item selection to use a green check icon with selected border rather than a green-filled item surface.

### Dashboard foundation

- Added `store/dashboard-settings.ts` with mocked local restaurant settings:
  - Feature toggles for menu, orders, tables, payments, loyalty, analytics, staff, notifications, and integrations.
  - Restaurant profile settings.
  - Tax/service-charge settings.
- Added reusable dashboard UI helpers:
  - `components/dashboard/ui/DashboardPageHeader.tsx`
  - `components/dashboard/ui/DashboardSetupPrompt.tsx`
  - `components/dashboard/ui/DashboardConfirmDialog.tsx`
  - `components/dashboard/ui/dashboard-toast.tsx`
- Updated `lib/design-tokens.ts` with more consistent form/input tokens:
  - `ds.input.select`
  - `ds.form.*`
  - label weight changed toward `font-medium`
  - form action/footer patterns added.

### Orders module

- Manual order creation now adds a real local order through `useOrdersStore.addOrder`.
- Manual order form calculates subtotal, VAT, and total using local settings.
- Empty manual-order validation is now inline instead of `alert()`.
- Orders page respects the `orders` feature toggle and shows setup prompt when disabled.
- Order cards now:
  - Show counter orders when no table number exists.
  - Use cleaner amount/item hierarchy.
  - Show dashboard toast feedback when moving through statuses.

### Menu management

- Replaced browser `alert()`/`confirm()` paths in menu category/item actions with dashboard toast and confirmation dialogs.
- Category delete now blocks with a toast when the category still has items.
- Reset all availability now uses `DashboardConfirmDialog`.
- Category form and menu item form started moving to tokenized labels, inputs, and action footers.
- Menu item sheet now uses a sticky action footer, which is closer to the desired modal/action behavior.

### Feature-aware dashboard routes

The following routes now read mocked feature state and show setup prompts when disabled:

- `/dashboard/orders`
- `/dashboard/tables`
- `/dashboard/transactions`
- `/dashboard/loyalty`
- `/dashboard/loyalty/customers`
- `/dashboard/loyalty/rewards`
- `/dashboard/loyalty/settings`
- `/dashboard/analytics`
- `/dashboard/staff`

The dashboard sidebar now displays disabled optional modules with an `Off` badge and routes them toward Settings.

### Settings control panel

- Settings now has a new `Features` tab.
- Feature toggles are local/mock and update dashboard module availability.
- Restaurant profile inputs are locally editable and save into `useDashboardSettingsStore`.
- Tax settings update local tax/service-charge state.
- Webhook copy uses dashboard toast feedback.

### Other module improvements started

- Tables page keeps locally added tables in component state.
- Tables copy/download actions now provide feedback instead of silently doing nothing.
- Transactions export action now gives mocked feedback.
- Staff page now keeps local staff state, supports mocked add/deactivate/reactivate, and provides feedback.

## Important Decisions

- Dashboard should not copy the diner visual personality. It should remain operational, dense, and work-focused.
- Menu is treated as the core module and should remain enabled.
- Optional module disablement is mocked locally for now.
- Disabled modules should not create broken routes; they should show setup prompts or route users to Settings.
- Browser `alert()` and `confirm()` should be removed from dashboard flows.
- Settings is intended to become the main control panel for everything restaurant owners configure.
- No backend/API/database/schema changes have been made.

## Known Incomplete Work

The dashboard sweep is not finished. The next agent should continue from these items:

1. Finish tokenizing dashboard forms and dialogs.
   - Ensure all form labels use `ds.input.label`.
   - Ensure labels are associated with controls via `htmlFor`/`id`.
   - Ensure all buttons have explicit `type`.
   - Ensure modal actions use shared action/footer patterns.

2. Complete Biome cleanup.
   - A focused `npx biome check --write ...` was run and fixed formatting/imports, but remaining diagnostics include accessibility items.
   - Known remaining issue categories:
     - Missing `type="button"` on buttons.
     - Static overlay divs with click handlers in `app/dashboard/layout.tsx`.
     - Labels without associated controls in forms.

3. Continue module-by-module dashboard polish.
   - Orders: visually review manual order modal and queue layout.
   - Menu: finish form hierarchy and make create/edit actions show toasts.
   - Settings: continue replacing remaining `zinc-*` one-offs with gray/token classes.
   - Tables: improve QR modal and download behavior if needed.
   - Transactions: finish export feedback and row polish.
   - Loyalty: make reward create/edit mutate local state instead of closing with comments.
   - Analytics: add feedback for export and button types.
   - Staff: add proper confirmation for deactivate if desired.

4. Connect settings to diner-facing surfaces more intentionally.
   - The store exists, but only dashboard flows currently read most of it.
   - Future work should decide which local settings should affect diner menu/bill immediately.

5. Add/refresh documentation after the dashboard sweep is complete.
   - This handoff is a mid-sweep continuation document, not final dashboard design-system documentation.

## Verification Status

- `npx tsc --noEmit` passed after the dashboard settings/token/form changes.
- A later focused Biome run fixed many formatting/import-order items but still reported accessibility diagnostics.
- A final check should be run by the next agent after completing the accessibility cleanup:
  - `npx tsc --noEmit`
  - `npx biome check app/dashboard components/dashboard store/dashboard-settings.ts lib/design-tokens.ts`

## Suggested Next Step

Start by cleaning the remaining dashboard accessibility diagnostics, because that will stabilize the shared primitives and forms. Then continue the module sweep in this order:

1. Orders
2. Menu
3. Settings
4. Tables
5. Transactions
6. Loyalty
7. Analytics
8. Staff
9. Overview and shell final pass
