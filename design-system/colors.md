# Colors

Phase 1 fully documents only diner-relevant colors. Future palettes can be added when future modules are audited.

## Core Diner Palette

- Neutral white and gray: page, cards, muted surfaces, text, borders, disabled states.
- Black: primary action and highest-emphasis text.
- Orange: diner accent, preparation, required attention.
- Green: ready, served, paid, completed.
- Red: sold out, validation error, failed payment, destructive action.
- Blue: informational notes, transfer instructions, links.
- Overlay alpha: sheet and modal scrim.

## Semantic Roles

- `surface/page`: page canvas.
- `surface/card`: card, sheet, row, receipt block.
- `surface/muted`: placeholders, wells, segmented backgrounds.
- `text/primary`: title, item name, price, total.
- `text/secondary`: description, helper, modifier copy.
- `text/muted`: timestamp, placeholder, disabled.
- `border/subtle`: default separation.
- `action/primary`: black CTA.
- `accent/diner`: warm accent.
- `state/success`, `state/warning`, `state/danger`, `state/info`: feedback and status.

## Foreground Pairing

- Black action backgrounds use white text.
- Light state surfaces use their darker text pair, such as green surface with green text.
- Muted surfaces use primary or secondary text depending on importance.
- Disabled surfaces use muted text and should not rely on opacity alone.

## Avoid

- Orange as the primary CTA replacement.
- Color-only status communication.
- Shadows or glows as color substitutes.
- Adding future dashboard/chart palettes before those modules are audited.
