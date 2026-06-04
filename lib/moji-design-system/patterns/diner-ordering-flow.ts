import type { ProductPattern } from "../types";

export const dinerOrderingPatterns: ProductPattern[] = [
  {
    name: "Diner Ordering Flow Shell",
    surface: "diner-ordering",
    status: "stable",
    description:
      "Top-level mobile ordering layout from menu browsing through bill and payment.",
    uses: ["DinerShell", "PageHeader", "Category Tab", "Fixed CTA Footer"],
    anatomy: [
      "Header",
      "Sticky navigation",
      "Scrollable content",
      "Floating/fixed action",
    ],
    responsiveBehavior:
      "Single-column, max-width constrained on larger screens, still phone-like on desktop.",
    accessibility: [
      "Use main landmark",
      "Navigation is labelled",
      "Footer action is keyboard reachable",
    ],
    usage: "Guest-facing diner ordering routes.",
    avoid: "Do not reuse as dashboard/admin layout.",
  },
  {
    name: "Menu Item Card",
    surface: "diner-ordering",
    status: "stable",
    description:
      "Scannable touch-friendly item preview using border-first card treatment.",
    uses: ["MenuItemCard", "Badge", "Icon Button"],
    anatomy: [
      "Image/fallback",
      "Name",
      "Description",
      "Price",
      "Action/status",
    ],
    responsiveBehavior:
      "Full-width on narrow mobile; compact variants can grid later.",
    accessibility: [
      "Announce name, price, and availability",
      "Unavailable state uses text",
    ],
    usage: "Menu browsing and category lists.",
    avoid: "Avoid shadows by default; use shadow/none and border/subtle.",
  },
  {
    name: "Item Detail Sheet",
    surface: "diner-ordering",
    status: "stable",
    description:
      "Bottom sheet with media, item details, modifiers, note, quantity, and fixed add CTA.",
    uses: [
      "BottomSheet",
      "Selection Card",
      "DinerTextarea",
      "Quantity Stepper",
    ],
    anatomy: [
      "Drag handle",
      "Media",
      "Title/price",
      "Options",
      "Note",
      "Fixed CTA",
    ],
    responsiveBehavior:
      "Bottom sheet on mobile; future desktop can become modal or side panel after audit.",
    accessibility: [
      "Focus trapped while open",
      "Required options labelled",
      "Content visible above CTA",
    ],
    usage: "Viewing and adding menu items.",
    avoid:
      "Avoid close buttons over media and hidden options under the footer.",
  },
  {
    name: "Cart and Checkout",
    surface: "diner-ordering",
    status: "stable",
    description:
      "Cart review, kitchen notes, totals, and checkout action using the same card family.",
    uses: [
      "CartScreen",
      "ItemCard",
      "DinerTextarea",
      "BillSummary",
      "Fixed CTA Footer",
    ],
    anatomy: ["Cart list", "Kitchen note", "Summary", "Checkout CTA"],
    responsiveBehavior: "Single-column with footer offset.",
    accessibility: [
      "Quantity controls have labels",
      "Totals are tabular and readable",
    ],
    usage: "Review cart and place order.",
    avoid: "Avoid changing item card styling between menu and cart.",
  },
  {
    name: "Order Status",
    surface: "diner-ordering",
    status: "stable",
    description:
      "Compact status communication for live orders and status sheets.",
    uses: ["OrderStatusTimeline", "Badge", "ItemCard"],
    anatomy: ["Order batch", "Status chip", "Timeline", "Items"],
    responsiveBehavior: "Compact vertical timeline on mobile.",
    accessibility: [
      "Status states include text",
      "Current/upcoming/completed are distinct",
    ],
    usage: "Live order progress.",
    avoid:
      "Avoid oversized dots, stretched gaps, or overlapping timeline rows.",
  },
  {
    name: "Bill, Payment, and Split Bill",
    surface: "diner-ordering",
    status: "stable",
    description:
      "Bill summaries, payment method selection, split mode setup, and participant payments.",
    uses: [
      "BillView",
      "BillSummary",
      "Payment Card",
      "SplitBillModal",
      "SplitPartPage",
    ],
    anatomy: ["Receipt", "Payment methods", "Split controls", "Status", "CTA"],
    responsiveBehavior:
      "Single-column with fixed confirmation actions where needed.",
    accessibility: [
      "Errors include recovery text",
      "Paid/unpaid states are text-backed",
    ],
    usage: "Bill review, payment, and split bill.",
    avoid: "Avoid decorative color in payment-critical information.",
  },
];

export const patternStandards = dinerOrderingPatterns.map((pattern) => ({
  surface: pattern.surface,
  name: pattern.name,
  standard: pattern.description,
  uses: pattern.uses,
  avoid: pattern.avoid ?? "Avoid undocumented one-off patterns.",
  status: pattern.status,
}));
