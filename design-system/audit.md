# Design System Audit

This audit tracks diner-first extraction priorities and future migration work.

## Current Strengths

- Diner flow already has a strong compact mobile direction.
- `components/diner/ui/diner-tokens.ts` exists as a live migration bridge.
- The app already uses accessible primitives through shadcn/Base UI where applicable.
- Recent diner polish established a border-first, no-card-shadow direction.

## Current Gaps

| Issue | Current example | Recommendation | Priority | Status |
| --- | --- | --- | --- | --- |
| Token bridge needs consolidation | Diner components mix `DINER` tokens with one-off Tailwind utilities | Map repeated values through `DINER` and the diner registry before product migration | High | Needs review |
| Inputs need first-class rules | Notes, phone capture, split amounts, and modifiers had related but undocumented states | Use `inputs.md` as the shared label, focus, error, disabled, and selection-card standard | High | Stable |
| Bottom sheets need one reusable structure | Item detail, order status, phone capture, and split bill sheets can drift | Use `bottom-sheets.md` for anatomy, scroll, CTA footer, safe-area, and radius rules | High | Stable |
| Radius hierarchy can drift | Outer cards, media, option cards, and inputs may use unrelated radii | Use card, inner card, sheet, input, button, chip aliases | High | Stable |
| Diner elevation should stay border-first | Shadows previously appeared on cards and sheets inconsistently | Use borders, spacing, radius, and surface contrast before shadows | Medium | Stable |
| Status timeline needs compact scale | Large type/dots can overlap or stretch the status sheet | Use compact timeline labels, aligned dots, and text-backed states | Medium | Stable |
| Future modules are not audited | Dashboard, auth, analytics, staff, settings, loyalty are not reviewed in this pass | Keep them roadmap-only until each module is polished from real UI | Low | Draft |

## Migration Priorities

1. Align live `DINER` tokens with the documented diner registry.
2. Migrate repeated diner inputs, selection cards, and sheet structures through shared components.
3. Normalize item card family usage across menu, cart, live orders, bill, and split bill.
4. Normalize fixed CTA footers and scroll padding across item, cart, payment, and split flows.
5. Audit future modules one at a time after the diner system is reviewed.

## Dashboard Surface — In Progress

The Dashboard is being audited as the second product surface on the shared system.

- **Adapter:** `components/dashboard/ui/dashboard-tokens.ts` (`ds` / `t` / `c` / `sp` / `r`) — mirrors the diner adapter `components/diner/ui/diner-tokens.ts`. It exposes only dashboard aliases + component classes derived from the shared foundations; it is not a separate system. The adapter should thin over time as dashboard components consume the registry more directly.
- **Sanctioned dashboard variants** (operational surface, not deviations): GRAY neutral scale; controls/cards use `rounded-xl` (radius-12) / `rounded-2xl` (radius-16) instead of the diner `rounded-full`; Geist Sans only (Georgia stays diner display); border-first elevation; content max width 1200px (`layout/dashboard-content-max`).
- **Shared dashboard primitives:** `components/dashboard/ui/MetricCard.tsx` (one stat card, replaces 4 copies) and `components/dashboard/ui/Toggle.tsx` (one switch).
- **Remaining per-module work:** migrate `zinc-*` → gray in settings/overview/shell; route module-local one-offs through the adapter; responsive audit across desktop/tablet/mobile.
