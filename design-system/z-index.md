# Z-Index

Use semantic stacking values instead of arbitrary z-index numbers.

## Tokens

- `z/base`: 0.
- `z/sticky`: 10.
- `z/dropdown`: 20.
- `z/fixed-footer`: 30.
- `z/sheet`: 40.
- `z/modal`: 50.
- `z/toast`: 60.
- `z/tooltip`: 70.

## Rules

- Fixed checkout CTA uses `z/fixed-footer`.
- Bottom sheet appears above fixed footer.
- Toasts appear above sheets only if intentionally global.
