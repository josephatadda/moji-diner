# Typography

Moji's diner typography uses expressive serif type only where it adds warmth without hurting clarity.

## Font Roles

- Instrument Serif: display and expressive heading moments, using medium or semibold weight depending on hierarchy.
- Geist Sans: body copy, labels, controls, inputs, buttons, badges, prices, totals, and operational UI.
- Geist Mono: short references, transaction codes, PINs, and technical snippets only.

## Naming Convention

Use `Group/Size` or `Group/Role`.

### Display

- `Display/2XL`: 36px / 112%, Instrument Serif, medium. Rare diner brand or celebration moments.
- `Display/XL`: 32px / 115%, Instrument Serif, medium. Roomy empty-state or overview titles.
- `Display/L`: 28px / 120%, Instrument Serif, medium. Success, receipt, or large sheet titles.

### Heading

- `Heading/L`: 24px / 125%, Instrument Serif, semibold. Item detail sheet and confirmation titles.
- `Heading/M`: 22px / 127%, Instrument Serif, medium. Page headers and major sections.
- `Heading/S`: 18px / 130%, Instrument Serif, medium. Lower-emphasis section headings inside diner flows.
- `Heading/XS`: 15px / 130%, Geist Sans, semibold. Item names and compact card titles.

`Heading/XS` stays sans because repeated cards need tighter alignment and faster scanning.

### Body

- `Body/XL`: 16px / 145%, Geist Sans, regular. Roomy modal descriptions and success copy.
- `Body/L`: 15px / 140%, Geist Sans, regular. Item detail descriptions.
- `Body/M`: 14px / 140%, Geist Sans, regular. Default diner descriptions and notes.
- `Body/S`: 12px / 133%, Geist Sans, regular. Timestamps and secondary status copy.
- `Body/XS`: 11px / 133%, Geist Sans, regular. Dense metadata and low-emphasis helper text.

### Label

- `Label/L`: 14px / 120%, Geist Sans, medium. Form labels and modifier group titles.
- `Label/M`: 12px / 120%, Geist Sans, medium. Compact card labels and status titles.
- `Label/S`: 11px / 120%, Geist Sans, bold, uppercase. Group labels and dense metadata headers.

### Utility

- `Utility/Button`: 15px / 133%, Geist Sans, bold. Primary and secondary CTA labels.
- `Utility/Caption`: 12px / 120%, Geist Sans, medium. Hints and short helper copy.
- `Utility/Meta`: 11px / 120%, Geist Sans, semibold uppercase. Timestamps and compact metadata.
- `Utility/Badge`: 10px / 120%, Geist Sans, bold uppercase. Required pills, tags, status badges.
- `Utility/Price`: 15px / 120%, Geist Sans, bold tabular. Prices and totals.
- `Utility/Stat`: 22px / 120%, Geist Sans, bold tabular. Receipt totals and success amounts.

## Rules

- Use serif display/heading tokens sparingly and never inside dense controls.
- Use `Heading/XS` for repeated item card titles.
- Use `Utility/Price` for all prices, totals, and split amounts.
- Use tabular numbers for prices, counts, references, and bill totals.
- Do not scale text with viewport width.
- Do not use negative letter spacing.
- Do not use uppercase metadata styles for long labels.
