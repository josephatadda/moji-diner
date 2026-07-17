# Moji Production Readiness QA

This document defines the production-readiness QA program for Moji. It is meant to be run against a staging deployment with real environment variables, a clean seeded restaurant, and a production-like database before any release.

## Current Automated Gate

Playwright has been added as the first browser E2E gate.

Run:

```bash
npm install
npx tsc --noEmit
npx biome check app components lib store docs tests playwright.config.ts
npm run test:e2e
```

Run `npm run build` only when the required environment variables are available. A production build should be a release blocker when it fails with a real staging/prod environment.

## Automated Coverage Added

- Auth and onboarding smoke checks for login, signup, verify email, reset password, staff login, and onboarding step 1.
- Onboarding step 2 checks for the simplified QR flow:
  - no privacy/terms footer links,
  - no menu design style selection,
  - QR download is available,
  - complete setup redirects to dashboard without an internal error.
- Dashboard settings sync:
  - restaurant profile edits save,
  - logo and cover uploads can be selected,
  - profile data persists after reload,
  - dashboard overview, dashboard menu preview, and diner menu reflect the updated restaurant profile.
- Dashboard menu sync:
  - dashboard item edits persist to the shared menu store,
  - diner menu reflects the updated item name and description.
- Diner smoke:
  - menu, cart, and bill routes render without internal runtime overlays.

## Fixes Made For QA Readiness

- Dashboard settings now persist through `moji-dashboard-settings` local storage.
- Dashboard settings form draft rehydrates from persisted settings.
- Dashboard menu preview now reads the dashboard profile name instead of the static mock restaurant.
- Onboarding step 2 completes locally without the server-side onboarding endpoint, which currently needs real auth/env setup before production validation.
- QR download exists in onboarding step 2.

## Required Environment Gate

Before staging QA, confirm:

- `DATABASE_URL`
- Better Auth secret
- application URL/base URL
- email/auth provider config
- storage/upload config
- payment/receipt keys if payment flows are enabled
- production/staging feature flags

Any missing environment variable that prevents build, auth, onboarding, upload, or persistence is a blocker.

## Manual QA Matrix

### Auth And Onboarding

- Create owner account.
- Verify email state.
- Log in as owner.
- Reset password request and token state.
- Staff login with valid and invalid PIN.
- Onboarding step 1 validation:
  - required restaurant name,
  - slug preview,
  - city,
  - phone,
  - Instagram,
  - cuisine.
- Onboarding step 2:
  - QR preview renders,
  - QR download works,
  - complete setup redirects to dashboard,
  - no internal server error,
  - no payment/table/menu-style friction in the UI.

### Settings And Diner Sync

- Edit restaurant name, slug, description, phone, city, currency, and address.
- Save, reload, and confirm values persist.
- Confirm dashboard overview, dashboard menu, and diner menu reflect profile changes.
- Upload logo and cover image.
- Remove logo/cover.
- Choose gradient cover.
- Test invalid file type, large file, cancel upload, and re-upload.
- Toggle enabled modules and confirm nav/setup states update.
- Change VAT/service rules and confirm manual orders, diner cart, bill, receipt, and payment totals use the same rules.

### Menu Management

- Add, edit, and delete category.
- Validate empty names, duplicate-ish names, long names, and long descriptions.
- Add, edit, delete item.
- Upload/change/remove item photo.
- Set price, prep time, tags, featured state, sold-out/available state.
- Confirm dashboard list, live preview, and diner menu match.
- Reset all availability.
- Download menu PDF and verify restaurant details, categories, items, prices, and public link/QR copy.

### Dashboard Modules

- Overview metrics match orders/transactions/menu state.
- Accepting orders toggle has clear feedback and intended diner effect.
- Orders:
  - create manual order,
  - add multiple items,
  - confirm taxes/totals,
  - move through statuses,
  - view details and timestamps.
- Tables:
  - enabled state: add/edit/delete table, view QR, copy link, download QR,
  - disabled state: setup state with no broken actions.
- Transactions:
  - filter by method/status,
  - search by customer/reference,
  - export CSV,
  - confirm amount and status formatting.
- Loyalty:
  - disabled state,
  - enable flow,
  - customers, rewards, settings,
  - diner bill visibility when enabled.
- Analytics:
  - range selector,
  - charts on desktop/mobile,
  - empty/error states.
- Staff:
  - add/edit/deactivate/reactivate,
  - PIN validation,
  - role messaging.

### Diner Ordering

- Load menu by slug/table.
- Category tabs scroll.
- Item images/fallbacks render.
- Sold-out items cannot be added.
- Item detail modifiers, note, quantity, and fixed CTA work.
- Cart add/increment/decrement/remove/note/place order.
- Live order timeline includes timestamps.
- Cart action never opens live orders incorrectly.
- Bill tip, loyalty, transfer/card/cash, copy account number, success, and receipt download.
- Split bill equal/by-item/custom, copy/share link feedback, and pay-my-share payment flow.

## Responsive And Accessibility Gate

Check:

- 360px, 390px, 430px, 768px, 1024px, 1280px, 1440px.
- Keyboard navigation for forms and modals.
- Focus trap and escape behavior in modals.
- Labels tied to inputs.
- Adjacent or announced error text.
- Color contrast for muted text, badges, disabled states.
- No horizontal overflow.
- No clipped CTAs.
- Icon-only actions have accessible labels/tooltips.

## Current Known Production Risks

- Onboarding completion is currently mocked locally for the polished flow. The backend endpoint must be validated with real auth/session/database before launch.
- Dashboard settings persistence is localStorage-based in this pass. Production needs backend persistence and reload/re-login verification.
- Diner cart and bill server routes still read some static `MOCK_RESTAURANT` values, including VAT/name props. This must move to the same settings source before production.
- Menu item photo upload in the dashboard menu form is still a visual upload placeholder, not a persisted item image upload.
- Slug changes update local settings but public route availability still depends on server-side restaurant slug lookup.
- Build has historically been blocked when production env vars are missing during page-data collection. Treat that as an environment gate, not a visual QA pass.

## Production Acceptance Criteria

- All P0 flows pass on staging with a clean database seed.
- Profile, logo, cover, menu, tax, and feature settings persist after reload and re-login.
- Dashboard menu changes appear on diner menu.
- Diner orders appear in dashboard orders.
- Payment, bill, receipt, cart, and split totals match.
- QR downloads work from onboarding/settings/tables where enabled.
- No internal errors, module-not-found overlays, browser alerts, or silent failures.
- Production build passes with real environment variables.
- Known issues are documented with severity and owner.
