# Motion

Motion should make state changes feel responsive without distracting from ordering.

## Tokens

- `duration/instant`: 0ms.
- `duration/fast`: 100ms.
- `duration/base`: 200ms.
- `duration/slow`: 350ms.
- `ease/standard`: general transitions.
- `scale/active`: button/card press feedback.
- `transition/sheet`: bottom sheet open/close.

## Rules

- Use fast or base durations for hover and active states.
- Sheet and toast motion should be consistent across the product.
- Respect `prefers-reduced-motion`.
- Avoid motion on static content that is already visible.
