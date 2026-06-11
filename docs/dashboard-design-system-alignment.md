# Dashboard ↔ Shared Design System Alignment

This note tracks the work to bring the **dashboard** onto the **one shared Moji
Design System** that was first established through the **Diner Ordering Flow**.

It is **not** a redesign or a second design system. The goal is consistency:
the dashboard derives from the same foundations (tokens, spacing, radius,
typography, elevation, color roles) and the current experience is preserved.

## Source of truth & adapters

```
lib/moji-design-system/            ← single source of truth
  tokens/ (colors, spacing, radius, typography, elevation, layout, …)
  components/, patterns/, foundations.ts
  (+ design-system/*.md docs, /design-system review route)

components/diner/ui/diner-tokens.ts        ← DINER.* — diner adapter
components/dashboard/ui/dashboard-tokens.ts ← ds/t/c/sp/r — dashboard adapter
```

An **adapter** exposes only surface-friendly aliases and component classes that
**derive from** the shared foundations. It must not define independent colors,
spacing, radii, typography, shadows, or one-off values. Every value maps back to
a foundation token. Adapters should **thin over time** as components consume the
shared system more directly.

## Sanctioned dashboard variants (operational surface, not deviations)

The dashboard is "operational, dense, scan-heavy." These choices are registered
in the system, not one-offs:

- **Neutral scale:** GRAY (foundation `gray.50–950`). No `zinc`.
- **Controls/cards:** `rounded-xl` (radius-12) / `rounded-2xl` (radius-16). Diner
  keeps `rounded-full` pills.
- **Type:** Geist Sans only. Georgia stays scoped to diner display.
- **Elevation:** border-first; shadows only on floating layers.
- **Layout:** content max width 1200px (`layout/dashboard-content-max`).
- **Primary action:** `gray-900`, never orange. Orange is brand accent only.

## Shared dashboard primitives

- `components/dashboard/ui/MetricCard.tsx` — one stat card (replaces 4 copies).
- `components/dashboard/ui/Toggle.tsx` — one switch.
- `components/dashboard/ui/DashboardButton.tsx` — one dashboard button API.
- `components/dashboard/ui/DashboardModal.tsx` — centered dialog primitive with
  structured header, scrollable body, and fixed footer region.
- `components/dashboard/ui/DashboardField.tsx` — field wrapper and input,
  textarea, select controls.
- `components/dashboard/ui/DashboardFilterBar.tsx` — shared search + segmented
  filter + action toolbar.
- `components/dashboard/ui/DashboardTable.tsx` — shared desktop data-table shell.
- `components/dashboard/ui/DashboardStatusBadge.tsx` — status/tone badge.
- `components/dashboard/ui/DashboardEmptyState.tsx` — empty/setup content state.
- `components/dashboard/ui/DashboardFileUpload.tsx` — dashboard upload/drop area.
- `components/dashboard/ui/index.ts` — dashboard UI barrel export.

## Visual polish (module phases)

Phases 0–1 (foundation + shell) were structural/token passes with intentionally
minimal visual change. **Phases 2–10 are an active visual refresh** — not just a
value-for-value token swap. For each module, beyond conformance:

- **Hierarchy** — correct heading/label/value emphasis and **font weights** via
  `t.*`; make the primary element in each card/row dominant; de-emphasize meta.
- **Balance & alignment** — even out uneven padding, ragged alignment, and
  unbalanced grids; make sibling cards/rows feel like one family.
- **Typography** — consistent sizes/weights, tabular-nums for numerics.
- **Component refinement** — route through shared primitives; tighten weak spots.
- **Border-first elevation** — cards use border + radius + surface, no default
  shadow.

**Preserved either way:** layouts, structure, the established look/identity, and
the **overall spacing density** (regularize onto the 4pt scale; do not globally
tighten or loosen). The refresh sharpens hierarchy/balance/type — it does not
restyle the product or change its density.

## Phased rollout

Each phase is a self-contained, reviewable commit. Every phase ends green
(`tsc --noEmit` + `biome check`), flows verified, responsive at mobile/tablet/
desktop. After a module phase, it should read as a more polished, consistent
version of the same screen.

| Phase | Scope | Status |
|---|---|---|
| 0 | Adapter relocation + foundation reconciliation; shared `MetricCard`/`Toggle`; register dashboard surface | ✅ done |
| 1 | Shell & navigation (`layout.tsx`, `dashboard/ui/*`) + tablet treatment | ✅ done |
| 2 | Overview | pending |
| 3 | Orders (kanban + manual order) | in progress |
| 4 | Menu (cards, forms, item sheet, live preview) | in progress |
| 5 | Settings (worst offender — local primitives, 13 zinc) | in progress |
| 6 | Tables (grid + QR modal) | in progress |
| 7 | Transactions (table, filters, export) | in progress |
| 8 | Loyalty (overview, customers, rewards, settings) | in progress |
| 9 | Analytics (charts + metric cards) | in progress |
| 10 | Staff | in progress |
| 11 | Cross-cutting QA + responsive sweep | in progress |

## Phase notes

### Phase 0 — Adapter foundation (commit `8a55103`)
- Relocated `lib/design-tokens.ts` → `components/dashboard/ui/dashboard-tokens.ts`
  (all 13 importers rewritten); header rewritten to declare it the adapter.
- Adapter was already foundation-conformant (no zinc/hex/off-scale values).
- Consolidated 4 stat-card copies into `MetricCard`; added `Toggle`.

### Phase 1 — Shell & navigation (commit `6f5aab7`)
- Token-backed `layout.tsx`: `NavItem` → `ds.nav.item / itemActive /
  itemDisabled / activePip / offBadge`; group labels → `ds.nav.groupLabel`;
  avatars → `ds.avatar.brand` / `ds.avatar.sm`. Last shell `zinc` removed.
- `DashboardConfirmDialog` destructive button → `ds.btn.danger`.
- **New sanctioned `ds.nav` variants:** `itemDisabled`, `offBadge`, `groupLabel`.
- **Responsive decision:** the persistent sidebar stays at the `lg` breakpoint.
  Tablet (768–1023) uses the mobile drawer so content keeps the full viewport
  width for its grids — Tailwind breakpoints are viewport-based, so a sidebar
  at `md` would cramp `sm:`/`lg:` content grids. Verified clean at 768px.
- **Flow fix:** the mobile drawer stayed open after a nav tap. Now closes on
  any route change via a `pathname` effect (nav click, back, programmatic).

### Current sweep notes — dashboard primitives and consistency pass
- Added shared button, modal, field/input/select/textarea, filter bar, table,
  file upload, empty state, and status badge primitives.
- `DashboardButton size="sm"` is the sanctioned compact action size for dense
  rows/cards; avoid one-off `h-*` and `px-*` button classes in modules.
- `DashboardModal` owns the aligned header/content/footer structure. Modal
  headers with no description align vertically centered with the close action;
  headers with descriptions align from the top.
- `DashboardTable` owns responsive table behavior: desktop stays a data table;
  mobile becomes expandable cards with summary metadata, details, and actions.
- `MenuPreview` owns responsive preview behavior: phone frame on desktop side
  panels, full-screen preview mode on mobile preview tabs.
- Top-level dashboard headers should not use page-title back buttons. Back
  affordances were removed from Transactions and loyalty subpages during the
  consistency pass.
- Transactions now uses the shared filter bar and status badge.
- Loyalty Customers now uses the shared header, filter bar, table, badges, and
  empty state.
- Tables now has add/edit/delete local CRUD, QR modal, copy feedback, mock
  download feedback, and shared table/modal/input/button/status components.
- Menu management toolbar, category form, and item form now route through shared
  dashboard primitives. The item modal has fixed modal height with a scrollable
  body and fixed footer.
- Settings helper components now map through shared dashboard tokens/components,
  but a full settings information-architecture review is still recommended.
- Staff now uses the shared table/status/confirm primitives for active staff and
  deactivation.
- Analytics now uses the shared page header/button pattern and export feedback.

### QA stabilization notes — Jun 11, 2026

- Local dependency install restored the dashboard menu PDF export dependency
  (`jspdf`) that was declared in package files but missing from `node_modules`.
- Route smoke checks confirmed no missing-module/build overlay across auth,
  onboarding, dashboard core routes, and the diner menu.
- TypeScript now passes after narrowing the diner total fallback expressions.
- Remaining QA caveats are environment-related: `DATABASE_URL` is absent for
  production build gating and `BETTER_AUTH_SECRET` is absent for server-action
  backed dashboard data during local preview.
- The PDF export modal opens and templates render; actual download save cannot be
  verified in the Codex in-app browser because that browser surface does not
  support downloads.

## Per-module loop

1. Baseline screenshot (mobile/tablet/desktop).
2. Audit — map every raw/`zinc`/one-off value to a shared token via `ds.*`/`t.*`.
3. Align — consume shared tokens + shared primitives; correct spacing/hierarchy/
   typography/weight to the scale **without changing the intended look**.
4. Functionality — exercise every interaction; confirm flows complete.
5. Responsive — desktop ≥1024 / tablet 768–1023 / mobile ≤767.
6. Verify — tsc + biome clean; diff against baseline.

## Conventions for future dashboard work

1. Check the shared registry and `/design-system` first.
2. Use an existing token, component, or pattern when one exists.
3. New needs go **into** the shared system as a sanctioned variant — never a
   local one-off.
4. Record exceptions / migration debt in `design-system/audit.md`.
