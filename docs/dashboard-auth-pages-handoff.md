# Dashboard Authentication Pages Handoff

## Goal

Build the dashboard authentication area as a polished, reusable, dashboard-aligned
entry point for restaurant owners and staff. The pages are still mocked locally,
but the UI now follows the shared Moji foundations through dashboard components
instead of one-off form styles.

## Routes Added Or Updated

- `/login`
  - Owner sign-in with email/password validation.
  - Mock login redirects to `/dashboard`.
  - Includes forgot-password link and demo access notice.
- `/signup`
  - Owner workspace creation with restaurant name, owner email, and password.
  - Redirects to mocked account verification after signup.
- `/verify-email`
  - Verification holding page with resend feedback.
- `/reset-password`
  - Request reset link flow.
  - If `?token=...` is present, shows mocked new-password form.
- `/staff-login`
  - Staff workspace + 4-digit PIN flow.
  - Mock PIN is `1234`.
  - Success redirects to `/dashboard/orders`.
- `/onboarding/step-1`
  - Restaurant details, slug preview, city, phone, optional Instagram, logo placeholder, and cuisine selection.
- `/onboarding/step-2`
  - Menu launch review with public menu QR preview and QR download.
  - Completes mocked local setup and redirects to `/dashboard`.

## Components Added

- `components/auth/AuthCard.tsx`
  - `MojiLogo`
  - `AuthCard`
  - `AuthNotice`
  - `AuthLink`
  - `AuthDivider`
  - `PasswordField`
  - `PinInput`
  - `AuthSelectionCard`
  - `SetupStepHeader`
  - `SetupActionFooter`

These auth components intentionally consume dashboard primitives and tokens:

- `DashboardButton`
- `DashboardField`
- `DashboardInput`
- `ds.input.*`

This keeps dashboard authentication visually aligned with the operational
dashboard while avoiding duplicated button/input/modal styles.

## UX Decisions

- Auth pages use a centered-card pattern on mobile and a split editorial/control
  panel on desktop.
- Georgia is registered as Moji's display serif and used only for expressive
  auth/onboarding headings. Forms, labels, buttons, and operational text remain
  Geist Sans.
- The auth/onboarding logo is owned by `MojiLogo`; do not recreate the mark or
  resize it per page.
- Text links are owned by `AuthLink`; account-switch, resend, forgot-password,
  and staff-login links should share the same treatment.
- Login and signup should remain sibling screens with the same content width,
  divider, field rhythm, CTA height, and bottom-link placement.
- Onboarding uses a fixed-height framed setup container. Sidebar and header stay
  fixed; only the step content scrolls; setup footers stay visible.
- Setup step internals use `SetupStepHeader`, `AuthSelectionCard`, and
  `SetupActionFooter` instead of one-off section/card/action styling.
- Orange is used as accent/link color only. Primary actions stay gray-900.
- Every mocked action gives inline feedback instead of `alert()`.
- Password fields include visibility toggles.
- Staff PIN uses numeric input mode and limits input to four digits.
- Onboarding no longer asks for payment integration, table setup, or menu design
  style selection during this flow. Those can live later in dashboard settings as
  optional modules.

## Still Mocked / Future Backend Work

- Owner login/signup should connect to the real auth provider.
- Email verification and password reset should use provider-generated links.
- Staff login should validate restaurant slug and PIN against backend staff
  records and rate-limit failed attempts.
- On successful owner signup, verified users continue into the simplified
  onboarding wizard from `docs/02_auth_onboarding.md`.
- The onboarding completion action is currently local/mocked to avoid backend
  auth/env blockers during setup. Real restaurant creation should later call the
  backend completion endpoint once auth sessions and required environment
  variables are available.
- The current route protection/middleware behavior should be revisited once real
  sessions are in place.

## Verification

Run before pushing future changes:

- `npx tsc --noEmit`
- `npx biome check app/'(auth)' app/onboarding components/auth components/dashboard/ui docs/dashboard-auth-pages-handoff.md`
- `npm run test:e2e -- tests/e2e/auth-onboarding.spec.ts`

## Production QA Update — Jun 11, 2026

- Playwright E2E has been introduced as the browser QA gate.
- The auth/onboarding suite now checks login, signup, verify-email,
  reset-password, staff-login, onboarding step 1, and the simplified onboarding
  step 2 QR flow.
- Onboarding step 2 is intentionally local/mocked in this pass. It verifies that
  the QR download action exists, payment/table/menu-style friction is removed,
  setup completion redirects to dashboard, and no internal error overlay appears.
- Full production validation still requires real auth sessions, required
  environment variables, and backend restaurant creation through the onboarding
  completion endpoint.
- See `docs/production-readiness-qa.md` for the full production-readiness QA
  matrix and known blockers.

## QA Stabilization Update — Jun 11, 2026

- Refreshed local dependencies with `npm install` so the declared `jspdf`
  package is available to the dashboard menu PDF export runtime.
- Kept `lib/menu-pdf.ts` on the declared `import { jsPDF } from "jspdf"` path;
  no fallback dynamic import was needed after dependency installation.
- Fixed narrow diner TypeScript nullish checks in cart, bill, receipt, item card,
  order timeline, and cart store totals without changing total calculation
  behavior.
- `npx tsc --noEmit` passes.
- `npx biome check app components lib store docs` completes with existing
  warnings only: legacy `<img>` usage, a few `any` types, and unused parameters
  outside this stabilization pass.
- Browser route smoke passed for auth, onboarding, dashboard menu/orders/
  settings/tables/transactions/loyalty/staff, and diner menu. Analytics and the
  diner route compiled successfully after first-load timeouts during the browser
  sequence.
- Dashboard menu PDF modal opens without the previous missing-module/build
  overlay. The Codex in-app browser does not support file downloads, so the
  actual saved PDF file could not be verified inside that browser surface.
- `npm run build` was not used as the pass/fail gate because local env is missing
  `DATABASE_URL`; dashboard server actions also report missing
  `BETTER_AUTH_SECRET` during local QA. Those are environment blockers, not
  frontend compile blockers.
