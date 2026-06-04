# Components

These are the current Diner Ordering Flow component standards. Future modules should not add their own final component rules until they are audited.

## Buttons

All diner buttons are fully rounded.

- Primary pill CTA: 48px minimum height, black background, white text, `Utility/Button`, active press feedback.
- Secondary pill action: white or gray surface, subtle border, same radius and press behavior.
- Icon pill button: circular/pill control for back, copy, plus, minus, and tool actions.
- Destructive action: red semantic text or surface, used only for removal or cancellation.

Required states: default, hover, active, focus-visible, disabled, loading.

Avoid rectangular CTAs, inconsistent heights, and icon-only controls without accessible labels.

## Inputs

Inputs are first-class diner components. See `inputs.md` for full rules.

Shared structure:

- Stacked label.
- Optional helper or error text.
- 48px minimum input height.
- `radius/input` field radius.
- Gray border and white surface.
- Clear focus-visible state.
- Text error message when invalid.

Placeholder text is never the only label.

## Selection Cards

Selection cards replace tiny radio/checkbox targets in diner flows.

Use them for modifiers, payment methods, split modes, item assignment, and optional upgrades.

Required states: default, selected, focus-visible, disabled, error.

Selection must not rely on color alone; include text, border, icon, or marker.

## Bottom Sheets and Modals

Bottom sheets are first-class diner surfaces. See `bottom-sheets.md` for full rules.

Reusable anatomy:

- Visible screen gutter.
- Rounded sheet container.
- Drag handle.
- Optional media/header.
- Scrollable content body.
- Fixed CTA footer when an action exists.
- Safe-area bottom padding.

Avoid overlapping close buttons, hidden content below CTAs, and sheets that fill the screen edge-to-edge on mobile.

## Item Card Family

Menu items, cart rows, order items, and bill rows should feel like siblings.

Shared anatomy:

- Thumbnail, icon, or fallback media slot.
- Item title using `Heading/XS`.
- Description, modifiers, or status note.
- Price/total using `Utility/L` or `Utility/M`.
- Pill action, quantity control, or status chip.

Use `radius/item-card` for diner item cards and `radius/card` for standard content cards. Cards are border-first and use `shadow/none` by default.

## Component Coverage

Current diner components covered by the design system:

- `BottomSheet`
- `DinerInput`
- `DinerTextarea`
- `SegmentedTabs`
- `PageHeader`
- `BillSummary`
- `ItemCard`
- `OrderStatusTimeline`
- `MenuItemCard`
- `ItemDetailModal`
- `PhoneCaptureModal`
- `CartScreen`
- `BillView`
- `SplitBillModal`
- `SplitPartPage`
- `DinerShell`
- `BillScreenClient`
- `DINER tokens`

`CartContextProvider`, `BillScreenClient`, and `DINER tokens` are documented as supporting behavior/client/token pieces, not visual component examples.

## Fixed CTA Footer

Use fixed footers when the main action must remain reachable while content scrolls.

Rules:

- Footer has a top border and white surface.
- Body content includes enough bottom padding to remain visible above the footer.
- Footer respects `space/footer-padding` and safe-area bottom.
- CTA remains 48px minimum height.

## Status Chips and Timelines

Status components stay compact.

- Status title: readable but not oversized.
- Supporting text: secondary and lighter.
- Dot and connector: aligned to one axis.
- Completed/current/upcoming states: visually distinct.

Do not use large timeline dots or stretched vertical gaps.

## Alerts, Toasts, and Empty States

Variants: neutral, info, success, warning, danger, empty, loading, error.

Rules:

- Use semantic state colors with text labels.
- Do not rely on color alone.
- Payment and order errors should include recovery actions.
- Temporary confirmations can be toast-like; blocking problems should stay visible.
