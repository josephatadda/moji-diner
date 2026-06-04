# Spacing

Diner spacing uses a 4px grid with mobile-first aliases.

## Numeric Scale

- `space-0`: 0px.
- `space-1`: 4px.
- `space-2`: 8px.
- `space-3`: 12px.
- `space-4`: 16px.
- `space-5`: 20px.
- `space-6`: 24px.
- `space-8`: 32px.
- `space-10`: 40px.
- `space-12`: 48px.

## Diner Aliases

- `space/page-gutter`: 16px.
- `space/section-gap`: 32px.
- `space/card-padding`: 16px.
- `space/item-gap`: 12px.
- `space/form-gap`: 12px.
- `space/sheet-inset`: 16px.
- `space/sheet-padding`: 20px.
- `space/modal-inset`: 16px.
- `space/footer-padding`: 18px.
- `space/safe-area-offset`: `env(safe-area-inset-bottom)`.
- `space/footer-offset`: 80px.

## Fixed Footer Rule

When a sheet or screen has a fixed CTA footer, the scrollable content must include bottom spacing so the last option remains fully visible above the footer.

## Density

- Diner menu and checkout: default to comfortable spacing.
- Status timelines: compact but readable.
- Future dashboard: may introduce compact density later after audit.

## Avoid

- Arbitrary spacing values when an alias exists.
- Sticky/fixed controls without scroll padding.
- Overly large vertical gaps inside status timelines.
- Dense controls below 44px touch target size.
