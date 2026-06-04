# Radius

Radius is one of the most important diner polish tools. It should create a clear hierarchy between outer containers and inner controls.

## Numeric Scale

- `radius-0`: 0px.
- `radius-2`: 2px.
- `radius-4`: 4px.
- `radius-6`: 6px.
- `radius-8`: 8px.
- `radius-10`: 10px.
- `radius-12`: 12px.
- `radius-16`: 16px.
- `radius-20`: 20px.
- `radius-24`: 24px.
- `radius-28`: 28px.
- `radius-32`: 32px.
- `radius-full`: 9999px.

## Diner Aliases

- `radius/input`: `radius-8`.
- `radius/button`: `radius-full`.
- `radius/chip`: `radius-full`.
- `radius/card`: `radius-12`.
- `radius/item-card`: `radius-16`.
- `radius/sheet`: `radius-20`.
- `radius/modal`: `radius-16`.
- `radius/avatar`: `radius-full`.
- `radius/floating-action`: `radius-full`.

## Hierarchy Rule

Outer containers should be rounder than inner surfaces, but the semantic aliases in the updated MD are the source of truth. Use `radius/item-card` for diner item cards and `radius/sheet` for bottom sheets.

## Avoid

- Inner surfaces with the same radius as the parent unless they are visually separated.
- Large rounded cards inside other large rounded cards without enough spacing.
- Rectangular buttons in diner flows.
- One-off radii that do not map to the scale.
