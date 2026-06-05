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
- **Type:** Geist Sans only. Instrument Serif stays scoped to diner display.
- **Elevation:** border-first; shadows only on floating layers.
- **Layout:** content max width 1200px (`layout/dashboard-content-max`).
- **Primary action:** `gray-900`, never orange. Orange is brand accent only.

## Shared dashboard primitives

- `components/dashboard/ui/MetricCard.tsx` — one stat card (replaces 4 copies).
- `components/dashboard/ui/Toggle.tsx` — one switch.

## Phased rollout

Each phase is a self-contained, reviewable commit. Every phase ends green
(`tsc --noEmit` + `biome check`), flows verified, responsive at mobile/tablet/
desktop, with no unintended visual change.

| Phase | Scope | Status |
|---|---|---|
| 0 | Adapter relocation + foundation reconciliation; shared `MetricCard`/`Toggle`; register dashboard surface | ✅ done |
| 1 | Shell & navigation (`layout.tsx`, `dashboard/ui/*`) + tablet treatment | pending |
| 2 | Overview | pending |
| 3 | Orders (kanban + manual order) | pending |
| 4 | Menu (cards, forms, item sheet, live preview) | pending |
| 5 | Settings (worst offender — local primitives, 13 zinc) | pending |
| 6 | Tables (grid + QR modal) | pending |
| 7 | Transactions (table, filters, export) | pending |
| 8 | Loyalty (overview, customers, rewards, settings) | pending |
| 9 | Analytics (charts + metric cards) | pending |
| 10 | Staff | pending |
| 11 | Cross-cutting QA + responsive sweep | pending |

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
