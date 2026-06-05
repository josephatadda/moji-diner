# Layout

Layout tokens keep diner screens stable across mobile and desktop review contexts.

## Tokens

- `layout/mobile-page-gutter`: 16px.
- `layout/diner-content-max`: 480px.
- `layout/dashboard-content-max`: 1200px, draft.
- `layout/sheet-max-height`: 85vh.
- `layout/modal-sm`: 400px.
- `layout/modal-md`: 560px.
- `layout/modal-lg`: 720px.
- `layout/sticky-footer-height`: 72px.
- `layout/mobile-safe-area-bottom`: `env(safe-area-inset-bottom)`.
- `layout/page-header-height`: 56px.

## Rules

- Diner stays single-column and phone-like even on desktop.
- Fixed footers require content bottom offset.
- Bottom sheets must respect safe area and max height.
