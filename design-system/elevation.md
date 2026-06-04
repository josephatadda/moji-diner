# Elevation and Shadows

Moji uses a border-first elevation system.

Cards, list items, inputs, and inline surfaces use `border/subtle` and `surface/card`, not shadows. Shadows are reserved for surfaces that physically float above the page.

## Hierarchy

- Level 0: `surface/page`.
- Level 1: `surface/card + border/subtle`.
- Level 2: `surface/elevated + border/default`.
- Level 3: `surface/elevated + shadow/sheet`.
- Level 4: `surface/elevated + shadow/modal`.
- Level 5: `surface/elevated + shadow/floating`.

## Rules

- Default card shadow is `shadow/none`.
- Item cards use `shadow/none`.
- Use `shadow/card` only when a card has no border and still needs separation.
- Use shadows for bottom sheets, modals, dropdowns, toasts, and fixed CTAs.
- Avoid combining border and shadow unless the surface is level 3 or higher.
