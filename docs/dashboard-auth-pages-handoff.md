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
  - Shows verification holding state after mocked signup.
- `/verify-email`
  - Verification holding page with resend feedback.
- `/reset-password`
  - Request reset link flow.
  - If `?token=...` is present, shows mocked new-password form.
- `/staff-login`
  - Staff workspace + 4-digit PIN flow.
  - Mock PIN is `1234`.
  - Success redirects to `/dashboard/orders`.

## Components Added

- `components/auth/AuthCard.tsx`
  - `AuthCard`
  - `AuthNotice`
  - `PasswordField`
  - `PinInput`
  - `AuthLink`

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
- The dashboard keeps Geist Sans; no diner serif styling is used here.
- Orange is used as accent/link color only. Primary actions stay gray-900.
- Every mocked action gives inline feedback instead of `alert()`.
- Password fields include visibility toggles.
- Staff PIN uses numeric input mode and limits input to four digits.

## Still Mocked / Future Backend Work

- Owner login/signup should connect to the real auth provider.
- Email verification and password reset should use provider-generated links.
- Staff login should validate restaurant slug and PIN against backend staff
  records and rate-limit failed attempts.
- On successful owner signup, verified users should continue into the onboarding
  wizard from `docs/02_auth_onboarding.md`.
- The current route protection/middleware behavior should be revisited once real
  sessions are in place.

## Verification

Run before pushing future changes:

- `npx tsc --noEmit`
- `npx biome check app/'(auth)' components/auth components/dashboard/ui docs/dashboard-auth-pages-handoff.md`

