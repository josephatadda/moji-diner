# Inputs

Diner inputs cover kitchen notes, phone capture, search/filter, payment references, amount fields, custom split amounts, modifier choices, payment methods, and split modes.

## Text Input

Use for short text, phone, amount, and search fields.

- Label: `Label/L`, stacked above the field.
- Field height: 48px minimum.
- Radius: `radius/input`.
- Border: `border/subtle`.
- Text: `Body/M` or numeric utility style for amount fields.
- Placeholder: `text/muted`.
- Focus: visible border/ring treatment.
- Helper/error: below the field.

States: default, focused, filled, required, disabled, error.

## Textarea

Use for kitchen notes and longer instructions.

- Same label, border, radius, and focus treatment as text input.
- Minimum height should be large enough for two lines.
- Do not resize unpredictably inside fixed-footer sheets.

## Phone Input

Use normal text input styling with phone-appropriate keyboard behavior in product UI.

Phone capture should include helper copy explaining why the number is needed.

## Amount Input

Use tabular numeric styling. Currency symbols should align clearly with the value.

Custom split amount inputs must show validation errors with text, not only red borders.

## Selection Card

Use for modifier choices, payment methods, split modes, and item assignment.

Anatomy:

- Full-row clickable card.
- Title.
- Optional helper text.
- Right-side price, status, or selected marker.
- Required/optional chip when needed.

States:

- Default.
- Selected.
- Focus-visible.
- Disabled.
- Error.

Selection must include more than color: border, check marker, text, or icon.

## Avoid

- Placeholder-only labels.
- Tiny radio buttons as the only tap target.
- Mixed input heights in the same form.
- Error states without text.
- Amount fields using proportional numbers.
