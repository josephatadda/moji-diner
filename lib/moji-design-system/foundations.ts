import type { FoundationEntry } from "./types";

export const foundations: FoundationEntry[] = [
  {
    category: "Brand Principle",
    name: "Warm",
    description:
      "Customer-facing surfaces should feel welcoming without becoming decorative or childish.",
    status: "stable",
  },
  {
    category: "Brand Principle",
    name: "Fast",
    description:
      "Ordering, checkout, and payment should make the next action obvious and reachable.",
    status: "stable",
  },
  {
    category: "Brand Principle",
    name: "Trustworthy",
    description:
      "Payment, bill, status, and split flows prioritize clarity, contrast, and explicit state labels.",
    status: "stable",
  },
  {
    category: "Visual Principle",
    name: "Semantic before hardcoded",
    description:
      "Product UI should use semantic tokens and component decisions before adding one-off utility values.",
    status: "stable",
  },
  {
    category: "Visual Principle",
    name: "Border-first elevation",
    description:
      "Cards and inline surfaces separate with borders, radius, spacing, and background changes; shadows are reserved for floating layers.",
    status: "stable",
  },
  {
    category: "Visual Principle",
    name: "Status must be readable",
    description:
      "Success, warning, danger, and info states always include text or icon support; color is never the only cue.",
    status: "stable",
  },
  {
    category: "Visual Principle",
    name: "Touch-friendly diner",
    description:
      "Diner controls use fully rounded actions, clear spacing, and at least 44px touch targets.",
    status: "stable",
  },
  {
    category: "Surface Philosophy",
    name: "Diner Ordering Flow",
    description:
      "Mobile-first, comfortable, direct, and warm. Covers menu browsing through payment and split bill.",
    status: "stable",
  },
  {
    category: "Surface Philosophy",
    name: "Dashboard",
    description:
      "Operational, dense, and scan-heavy. Rules stay draft until the dashboard is audited.",
    status: "draft",
  },
  {
    category: "Surface Philosophy",
    name: "Auth",
    description:
      "Calm, narrow, form-first, and reassuring. Rules stay draft until auth is polished.",
    status: "draft",
  },
];

export const tokenArchitecture = [
  {
    layer: "Primitive",
    description:
      "Raw values such as gray.900, radius-12, space-4, and duration/base.",
    examples: ["gray.900", "orange.500", "radius-12", "space-4"],
  },
  {
    layer: "Semantic",
    description:
      "Product meaning such as action/primary, surface/card, and text/primary.",
    examples: ["action/primary", "surface/page", "text/inverse", "radius/card"],
  },
  {
    layer: "Component",
    description:
      "Component-scoped decisions such as button/primary.background and sheet/mobile.radius.",
    examples: [
      "button/primary.background",
      "button/primary.radius",
      "sheet/mobile.radius",
    ],
  },
  {
    layer: "Pattern",
    description:
      "How real module screens compose shared tokens and components.",
    examples: [
      "pattern/dinerOrderingFlow.itemCard",
      "pattern/dinerOrderingFlow.billPayment",
    ],
  },
  {
    layer: "Roadmap",
    description:
      "Future product surfaces that are intentionally not finalized until audited.",
    examples: ["auth", "dashboard", "billing", "analytics", "staff", "loyalty"],
  },
] as const;
