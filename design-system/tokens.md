# Tokens

Tokens are Moji's reusable design decisions. Product UI should prefer semantic and component-level tokens over raw values.

## Layers

- Primitive: raw values such as `gray.900`, `orange.500`, `radius-12`, `space-4`, `duration/base`.
- Semantic: roles such as `surface/card`, `text/secondary`, `border/subtle`, `action/primary`.
- Component: repeated decisions such as `button/primary.background`, `sheet/mobile.radius`, `input/default.border`.
- Pattern: real product combinations such as `Diner item detail sheet` or `Diner fixed CTA footer`.

## Diner Color Roles

- `surface/page`: gray.50 page canvas and neutral gutters.
- `surface/card`: white cards, rows, receipt blocks, and panels.
- `surface/elevated`: white sheets and modals.
- `text/primary`: item names, titles, prices, totals, and active labels.
- `text/secondary`: descriptions, helper text, and non-primary metadata.
- `text/muted`: timestamps, placeholders, disabled labels, low-emphasis captions.
- `border/subtle`: default card, sheet, option, and divider border.
- `action/primary`: black main CTAs with white text.
- `accent/diner`: warm orange highlight and preparation attention.
- `state/success`: ready, served, paid, copied, completed.
- `state/warning`: preparing, pending, required, needs attention.
- `state/danger`: sold out, validation error, failed payment, destructive action.
- `state/info`: payment instructions, notes, transfer references, links.

## Diner Radius Roles

- `radius/input`: radius-8.
- `radius/button`: radius-full.
- `radius/chip`: radius-full.
- `radius/card`: radius-12.
- `radius/item-card`: radius-16.
- `radius/sheet`: radius-20.
- `radius/modal`: radius-16.
- `radius/avatar`: radius-full.
- `radius/floating-action`: radius-full.

Child surfaces should usually use a radius 4px to 8px smaller than their parent.

## Diner Spacing Roles

- `space/page-gutter`: 16px mobile left/right page padding.
- `space/section-gap`: 32px between major diner sections.
- `space/card-padding`: 16px default card padding.
- `space/item-gap`: 12px between thumbnail, text, and controls.
- `space/form-gap`: 12px between inputs and selection cards.
- `space/sheet-inset`: 16px between bottom sheet and screen edge.
- `space/sheet-padding`: 20px left/right sheet content padding.
- `space/modal-inset`: 16px screen-edge inset for centered modals.
- `space/footer-padding`: 18px bottom fixed CTA padding before safe area.
- `space/safe-area-offset`: `env(safe-area-inset-bottom)`.
- `space/footer-offset`: 80px scroll padding to clear a fixed CTA.

## Elevation

Diner uses a border-first elevation policy. Cards should not rely on shadows. Prefer borders, radius, spacing, surface contrast, and overlay contrast.

Shadows are allowed only when a true overlay needs separation and border/surface contrast is insufficient. They should not be used as decoration.

## Adding Tokens

Add a token when it appears more than once, fixes inconsistency, improves accessibility, or clarifies a reusable product rule.

Do not add a token for a single temporary visual detail or an unaudited future module.
