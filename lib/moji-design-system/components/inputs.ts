import type { ComponentVariant } from "../types";

export const inputComponentVariants: ComponentVariant[] = [
  {
    component: "DinerInput",
    variant: "text",
    group: "Inputs",
    surface: "diner-ordering",
    states: ["default", "focus-visible", "disabled", "error"],
    tokensUsed: [
      "radius/input",
      "border/default",
      "text/primary",
      "text/muted",
    ],
    anatomy: ["Stacked label", "48px field", "Helper or error text"],
    accessibility: [
      "Label must be programmatically connected",
      "Error text must be associated",
    ],
    usage: "Phone capture, name, reference, search, and custom split amount.",
    avoid: "Avoid placeholder-only labels.",
    exampleClassName:
      "h-12 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-900",
    status: "stable",
  },
  {
    component: "DinerTextarea",
    variant: "note",
    group: "Inputs",
    surface: "diner-ordering",
    states: ["default", "focus-visible", "disabled", "error"],
    tokensUsed: [
      "radius/input",
      "border/default",
      "Body/M",
      "space/control-gap",
    ],
    anatomy: ["Stacked label", "Multi-line field", "Helper or optional marker"],
    accessibility: [
      "Label must be connected",
      "Do not resize into fixed footer",
    ],
    usage: "Kitchen note and longer diner instructions.",
    avoid: "Avoid tiny note fields that hide entered text.",
    exampleClassName:
      "min-h-24 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm",
    status: "stable",
  },
  {
    component: "Selection Card",
    variant: "modifier",
    group: "Inputs",
    surface: "diner-ordering",
    states: ["default", "selected", "focus-visible", "disabled", "error"],
    tokensUsed: [
      "radius/card",
      "border/default",
      "state/danger",
      "text/secondary",
    ],
    anatomy: [
      "Clickable row",
      "Option title",
      "Price or status",
      "Selected marker",
    ],
    accessibility: [
      "Use radio/checkbox semantics or ARIA equivalent",
      "Full row should be clickable",
    ],
    usage: "Modifier choices, payment method selection, split mode selection.",
    avoid: "Avoid tiny radio-only targets.",
    exampleClassName:
      "rounded-xl border border-gray-200 bg-white p-4 text-sm data-[selected=true]:border-gray-900",
    status: "stable",
  },
];
