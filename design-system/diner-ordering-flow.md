# Diner Ordering Flow

The Diner Ordering Flow is Phase 1 of the Moji design system. It includes the guest-facing mobile ordering experience from menu browsing through payment and split bill.

## Menu Browsing

Use sticky category tabs, consistent item cards, visible image/fallback areas, tabular prices, and floating cart/live-order actions.

Avoid hiding images, inconsistent add controls, and floating actions that cover important content.

## Item Detail Sheet

Use the reusable bottom sheet structure:

- Drag handle.
- Optional media block.
- Title, description, and price.
- Modifier groups using selection cards.
- Required/optional badges.
- Special note textarea.
- Quantity stepper.
- Fixed add CTA footer.

Content must scroll naturally and remain visible above the footer.

## Cart and Checkout

Cart item cards should feel like menu item cards with a clearer quantity/edit emphasis.

Use:

- Diner card family.
- Kitchen note input.
- Bill summary card.
- Fixed checkout CTA.
- Empty cart state.

Do not change cart behavior while migrating visual standards.

## Live Orders and Status

Live order rows and order status sheets use compact status chips and timelines.

Timeline rules:

- Small aligned dots.
- Compact labels.
- Secondary supporting text.
- Clear completed/current/upcoming state.
- No oversized rows or overlapping content.

## Bill, Payment, and Split Bill

Use selection cards for payment methods and split modes. Receipt blocks should use tabular price styles and clear total hierarchy.

Split bill states must clearly show paid, unpaid, assigned, and remaining amounts with text support, not only color.

## Phone Capture and Loyalty

Phone capture uses the standard input pattern with helper copy. Loyalty prompts use card family spacing and semantic success/info states.

## Feedback

Use inline notes for persistent instructions, toasts for temporary confirmations, and error states with recovery actions for payment/order failures.
