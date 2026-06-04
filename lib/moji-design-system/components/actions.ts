import type { ComponentVariant } from "../types";

export const actionComponentVariants: ComponentVariant[] = [
  {
    component: "Button",
    variant: "primary",
    group: "Actions",
    surface: "diner-ordering",
    intent: "neutral",
    states: [
      "default",
      "hover",
      "active",
      "focus-visible",
      "disabled",
      "loading",
    ],
    tokensUsed: [
      "action/primary",
      "text/inverse",
      "radius/button",
      "space-3",
      "space-5",
      "scale/active",
    ],
    anatomy: [
      "Pill shape",
      "48px minimum height",
      "Bold label",
      "Optional price summary",
    ],
    accessibility: [
      "Use native button semantics",
      "Visible focus ring",
      "Disabled state must be announced",
    ],
    usage: "Add to cart, checkout, request bill, payment, split confirmation.",
    avoid: "Do not use orange as primary button background.",
    exampleClassName:
      "h-12 rounded-full bg-gray-900 px-5 text-sm font-semibold text-white",
    status: "stable",
  },
  {
    component: "Button",
    variant: "secondary",
    group: "Actions",
    surface: "diner-ordering",
    states: ["default", "hover", "active", "focus-visible", "disabled"],
    tokensUsed: [
      "action/secondary",
      "text/primary",
      "radius/button",
      "border/default",
    ],
    anatomy: [
      "Pill shape",
      "Light gray fill",
      "Optional border",
      "Short label",
    ],
    accessibility: ["Use native button semantics", "Do not rely on color only"],
    usage: "Cancel, alternate action, copy reference, continue browsing.",
    avoid: "Avoid competing visually with primary CTA.",
    exampleClassName:
      "h-12 rounded-full border border-gray-200 bg-gray-100 px-5 text-sm font-semibold text-gray-900",
    status: "stable",
  },
  {
    component: "Icon Button",
    variant: "default",
    group: "Actions",
    surface: "diner-ordering",
    states: ["default", "hover", "active", "focus-visible", "disabled"],
    tokensUsed: ["radius/button", "border/default", "text/secondary"],
    anatomy: ["Circular hit area", "Centered icon", "Optional border"],
    accessibility: [
      "Icon-only controls require an accessible label",
      "Standalone touch target should be at least 44px",
    ],
    usage: "Back, plus, minus, copy, remove, and utility actions.",
    avoid: "Avoid square icon buttons in diner flows.",
    exampleClassName:
      "flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700",
    status: "stable",
  },
  {
    component: "Quantity Stepper",
    variant: "default",
    group: "Actions",
    surface: "diner-ordering",
    states: ["default", "active", "focus-visible", "disabled"],
    tokensUsed: ["radius/button", "Utility/M", "space/inline-gap"],
    anatomy: [
      "Minus button",
      "Tabular value",
      "Plus button",
      "Shared pill rhythm",
    ],
    accessibility: [
      "Buttons require labels",
      "Min and max states must be announced",
    ],
    usage: "Item detail, cart quantity, split item assignment.",
    avoid: "Avoid tap targets below 44px including padding/hitbox.",
    exampleClassName:
      "inline-flex h-12 items-center gap-3 rounded-full border border-gray-200 bg-white px-2",
    status: "stable",
  },
];
