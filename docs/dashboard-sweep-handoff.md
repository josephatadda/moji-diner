# Dashboard Sweep Handoff

## Goal

The current dashboard work is intended to turn Moji into a flexible restaurant control panel, not a fixed all-features-required admin. Restaurants should be able to use only the modules they need, such as menu-only, menu plus QR/table ordering, payments, loyalty, analytics, staff access, notifications, and integrations.

The dashboard should use Moji design-system foundations consistently: gray/white border-first surfaces, semantic colors, clear hierarchy, tokenized spacing/radius/typography, medium-weight labels, polished dialogs, visible feedback, and reusable components instead of one-off Tailwind combinations.

## Current Branch Context

- Branch: `main`
- The diner flow polish from the previous pass is still present in the working tree.
- The dashboard sweep now has a stronger reusable component foundation, but it
  should still be treated as an in-progress module sweep rather than a final
  dashboard-wide visual signoff.
- Preview server: `http://localhost:3000`.

## Implemented So Far

### Diner cleanup still in the working tree

- Added an info callout with icon to the Moji points bottom sheet.
- Tightened bank transfer payment panel spacing.
- Added a bit more split-bill header/content spacing.
- Adjusted diner page header bottom spacing.
- Updated split-bill item selection to use a green check icon with selected border rather than a green-filled item surface.

### Dashboard foundation

- Added/continued `store/dashboard-settings.ts` with mocked local restaurant settings:
  - Feature toggles for menu, orders, tables, payments, loyalty, analytics, staff, notifications, and integrations.
  - Restaurant profile settings.
  - Tax/service-charge settings.
- Added reusable dashboard UI primitives:
- `components/dashboard/ui/DashboardButton.tsx`
  - includes `size="sm"` for compact row actions and dense card controls.
  - `components/dashboard/ui/DashboardField.tsx`
    (`DashboardInput`, `DashboardTextarea`, `DashboardSelect`)
  - `components/dashboard/ui/DashboardFilterBar.tsx`
  - `components/dashboard/ui/DashboardFileUpload.tsx`
- `components/dashboard/ui/DashboardModal.tsx`
  - owns aligned headers, optional descriptions, scrollable body content, and
    fixed footer actions.
  - `components/dashboard/ui/DashboardPageHeader.tsx`
- `components/dashboard/ui/DashboardTable.tsx`
  - desktop uses the shared data-table pattern.
  - mobile renders expandable cards with summary metadata, details, and actions
    instead of forcing a horizontal table.
  - `components/dashboard/ui/DashboardStatusBadge.tsx`
  - `components/dashboard/ui/DashboardEmptyState.tsx`
  - `components/dashboard/ui/DashboardSetupPrompt.tsx`
  - `components/dashboard/ui/DashboardConfirmDialog.tsx`
  - `components/dashboard/ui/dashboard-toast.tsx`
- Added `components/dashboard/ui/index.ts` as the dashboard UI barrel export.
- Updated `components/dashboard/ui/dashboard-tokens.ts` with more consistent
  form/input/table tokens:
  - `ds.input.select`
  - `ds.form.*`
  - `ds.table.*`
  - label weight changed toward `font-medium`
  - form action/footer patterns added.
- Page header policy: top-level dashboard surfaces should not show back buttons.
  Navigation belongs in sidebar/top actions, not mixed into page titles.

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
- Category and menu item forms now use `DashboardModal` rather than side-sheet
  styling.
- Menu item modal uses a fixed standard modal height with scrollable content and
  fixed footer actions.
- Menu management toolbar now uses `DashboardPageHeader`, `DashboardButton`, and
  `DashboardEmptyState`.
- Live preview now supports a desktop phone-frame mode and a mobile full-screen
  preview mode, so the mobile preview tab uses the full viewport instead of a
  cramped mock phone.

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

- Tables page now has local CRUD:
  - Add table
  - Edit table
  - Delete table with confirmation
  - Status/capacity/table-number editing
  - QR modal
  - Copy link feedback
  - Mock download feedback
- Tables now uses `DashboardPageHeader`, `DashboardTable`,
  `DashboardStatusBadge`, `DashboardModal`, `DashboardField`, and
  `DashboardButton`.
- Tables mobile view now uses the sanctioned expandable-card behavior from
  `DashboardTable`; desktop remains the shared table pattern.
- Transactions export action now gives mocked feedback.
- Transactions uses `DashboardFilterBar` and `DashboardStatusBadge`; the
  redundant page-title back arrow was removed.
- Loyalty Customers now uses `DashboardPageHeader`, `DashboardFilterBar`,
  `DashboardTable`, `DashboardStatusBadge`, and `DashboardEmptyState`.
- Loyalty Rewards and Loyalty Settings no longer use ad hoc header back arrows.
- Staff page now keeps local staff state, supports mocked add/deactivate/reactivate, and provides feedback.
- Staff now uses `DashboardPageHeader`, `DashboardTable`, `DashboardStatusBadge`,
  and `DashboardConfirmDialog` for the active staff list and deactivation flow.
- Settings now routes its local helper components through shared dashboard
  tokens for cards, toggles, buttons, field labels, and input classes.
- Analytics now uses `DashboardPageHeader` and `DashboardButton` with mocked
  export feedback.

## Important Decisions

- Dashboard should not copy the diner visual personality. It should remain operational, dense, and work-focused.
- Menu is treated as the core module and should remain enabled.
- Optional module disablement is mocked locally for now.
- Disabled modules should not create broken routes; they should show setup prompts or route users to Settings.
- Browser `alert()` and `confirm()` should be removed from dashboard flows.
- Settings is intended to become the main control panel for everything restaurant owners configure.
- No backend/API/database/schema changes have been made.

## Known Incomplete Work

The dashboard sweep is not finished. Continue from these items:

1. Continue final visual review.
   - Orders: visually review manual order modal and queue layout.
   - Menu: visually review category/item cards and live preview alignment.
   - Settings: visual QA still recommended, but the worst local primitives now
     map through shared tokens.
   - Loyalty: finish deeper overview/detail polish if the product direction
     changes, but search/table/header consistency has been addressed.

2. Finish input definitions across Settings and older module pages.
   - `DashboardField/Input/Textarea/Select` are available.
   - Settings still contains small local `Field`/`ToggleSwitch` wrappers, but
     they now consume shared dashboard tokens/components instead of independent
     visual styles.

3. Connect settings to diner-facing surfaces more intentionally.
   - The store exists, but only dashboard flows currently read most of it.
   - Future work should decide which local settings should affect diner menu/bill immediately.

4. Improve real file/QR export behavior.
   - Copy feedback is implemented.
   - QR PNG/PDF export remains mocked.

## Verification Status

- `npx tsc --noEmit` passed.
- `npx biome check app/dashboard components/dashboard components/diner store lib/moji-design-system 'app/[restaurantSlug]/t'` passed.
- Playwright production-readiness coverage now exists under `tests/e2e`.
  It checks onboarding QR completion, settings persistence, logo/cover upload
  selection, dashboard profile reflection, dashboard menu edits, diner menu sync,
  and diner menu/cart/bill smoke rendering.
- `npm run build` is not a reliable pass/fail gate unless `DATABASE_URL` is
  provided; previous builds reached page-data collection and then failed at
  `/sitemap.xml` because `DATABASE_URL` was missing.

## Production QA Update — Jun 11, 2026

- Dashboard settings now persist through the `moji-dashboard-settings`
  local-storage store. This was required because profile/logo edits were not a
  trustworthy QA target if they disappeared after reload.
- Dashboard settings form drafts now rehydrate from persisted settings.
- Dashboard menu preview now uses the settings profile instead of the static
  mock restaurant name.
- A full QA matrix lives in `docs/production-readiness-qa.md`.
- Known production blockers remain:
  - settings are still localStorage-backed in this pass, not backend-backed;
  - diner cart and bill routes still receive some static `MOCK_RESTAURANT`
    props, including tax/name-related values;
  - dashboard menu item photo upload is still a visual placeholder;
  - slug changes need server-side route/data validation before they can be
    treated as production-ready.

## Suggested Next Step

Continue the module sweep in this order:

1. Settings
2. Orders
3. Menu visual QA
4. Transactions table migration
5. Loyalty overview/settings/detail
6. Staff table/edit pass
7. Analytics
8. Overview and shell final pass
