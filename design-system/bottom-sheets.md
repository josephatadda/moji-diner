# Bottom Sheets and Modals

Diner bottom sheets are reusable mobile task surfaces. They should feel like the reference direction: clean, spacious, rounded, readable, and naturally scrollable.

## Anatomy

- Overlay scrim.
- Visible space between sheet and screen edges.
- Rounded sheet container using `radius/sheet`.
- Drag handle at the top.
- Optional media/header area.
- Scrollable content body.
- Fixed CTA footer when the sheet has a primary action.
- Safe-area bottom padding.

## Variants

- Item detail sheet.
- Order status sheet.
- Phone capture sheet.
- Split bill sheet.
- Payment confirmation or success sheet.
- Generic confirmation sheet.
- Error/retry sheet.

## Layout Rules

- The sheet should not sit flush edge-to-edge on mobile unless the viewport is too small.
- Drag handle should sit above the media/header and not overlap content.
- Content body scrolls; fixed CTA footer does not cover content.
- Add bottom padding to the scroll area equal to the footer height plus breathing room.
- Use `space/sheet-inset` for screen edge spacing.
- Use `space/sheet-padding` for inner content.
- Use `space/footer-padding` plus safe area for fixed footer.

## Radius Rules

- Sheet container: `radius/sheet`.
- Media frame: smaller than sheet, usually `radius/card` or `radius/item-card`.
- Option cards and inputs: smaller again, usually `radius/input` or `radius/card`.
- Buttons and chips: `radius/button` or `radius/chip`.

## Accessibility

- Sheet must expose a semantic title.
- Description should be connected when present.
- Focus should move into the sheet when opened.
- Keyboard dismissal should work where supported.
- All controls must be keyboard reachable.
- Dismiss behavior should not lose entered user data unless clearly confirmed.

## Avoid

- Close buttons overlapping media.
- Hidden options below the fixed CTA.
- Timeline rows that overlap inside status sheets.
- Sheets with no screen gutter on normal mobile widths.
- Decorative shadows replacing clear borders and surface contrast.
