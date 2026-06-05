# Moji Design System

This design system is being built as a living extraction layer. Phase 1 is focused on the Diner Ordering Flow because that is the product surface currently being polished: menu browsing, item detail, cart, live orders, bill, payment, split bill, phone capture, loyalty prompts, and feedback states.

The live review surface is available at `/design-system`.

## Principles

- Extract standards from real Moji UI before inventing future-module rules.
- Keep the diner experience mobile-first, touch-friendly, compact, and calm.
- Use a border-first visual structure: cards rely on borders, surface contrast, radius, and spacing before shadows.
- Use Instrument Serif for diner display and heading moments only.
- Use Geist Sans for body copy, labels, inputs, controls, prices, totals, and operational text.
- Route live diner UI through `DINER` and shared diner tokens rather than scattering raw Tailwind values.
- Document new visual decisions before migrating product UI to them.

## Architecture

The system uses five layers:

1. Primitive tokens: raw values such as `gray.900`, `radius-12`, and `space-4`.
2. Semantic tokens: product roles such as `surface/card`, `action/primary`, and `radius/sheet`.
3. Component specs: component-scoped decisions such as `button/primary.background`, variants, states, tokens, accessibility, use, and avoid guidance.
4. Product patterns: how real diner screens compose components and tokens, such as `pattern/dinerOrderingFlow.itemCard`.
5. Roadmap modules: future product surfaces that stay draft until each one is audited.

Future modules such as dashboard, auth, analytics, staff, settings, billing, and loyalty should reuse the same architecture, but their rules should stay draft until each module is audited.

## Current Source Files

- `lib/moji-design-system/`: modular typed registry used by `/design-system`.
- `components/diner/ui/diner-tokens.ts`: live diner UI bridge for migrations.
- `app/design-system/page.tsx`: browsable review surface.
- `design-system/*.md`: editable documentation.

## Docs

- `foundations.md`: brand, visual, and surface principles.
- `tokens.md`: token architecture and naming rules.
- `typography.md`: font strategy and type scale.
- `colors.md`: primitive, alpha, and semantic color roles.
- `radius.md`: numeric scale and semantic aliases.
- `spacing.md`: numeric scale and semantic spacing.
- `elevation.md`: border-first elevation and shadow rules.
- `borders.md`: border roles and focus/error rules.
- `motion.md`: duration, easing, and interaction motion.
- `z-index.md`: stacking order.
- `layout.md`: gutters, max widths, sheets, footers, and safe areas.
- `components.md`: component variants and coverage.
- `diner-ordering-flow.md`: first extracted product surface.
- `audit.md`: current gaps and migration priorities.
- `roadmap.md`: future module extraction order.

## Future UI Work Rule

1. Check the design-system docs and `/design-system` route first.
2. Use an existing token, component spec, or pattern when one exists.
3. Add a new standard only when it is repeated, reusable, or fixes a clear inconsistency.
4. Keep one-off product details local unless they become a repeated rule.
5. Record exceptions or migration debt in `audit.md`.
