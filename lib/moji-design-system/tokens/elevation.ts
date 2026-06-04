import type { DesignToken } from "../types";

export const elevationTokens: DesignToken[] = [
  {
    name: "shadow/none",
    value: "none",
    layer: "semantic",
    category: "elevation",
    usage: "Default for all cards and inline surfaces.",
    status: "stable",
  },
  {
    name: "shadow/subtle",
    value: "0 1px 2px rgba(0,0,0,0.04)",
    layer: "semantic",
    category: "elevation",
    usage: "Rarely used; prefer border instead.",
    avoid: "Never use in the diner ordering flow as default card elevation.",
    status: "stable",
  },
  {
    name: "shadow/card",
    value: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
    layer: "semantic",
    category: "elevation",
    usage: "Use only when a card has no border and still needs separation.",
    status: "stable",
  },
  {
    name: "shadow/floating",
    value: "0 8px 24px rgba(0,0,0,0.12)",
    layer: "semantic",
    category: "elevation",
    usage: "Fixed CTA footer, dropdowns, and toasts.",
    status: "stable",
  },
  {
    name: "shadow/sheet",
    value: "0 -4px 24px rgba(0,0,0,0.10)",
    layer: "semantic",
    category: "elevation",
    usage: "Bottom sheet upward cast.",
    status: "stable",
  },
  {
    name: "shadow/modal",
    value: "0 16px 48px rgba(0,0,0,0.16)",
    layer: "semantic",
    category: "elevation",
    usage: "Modal dialogs.",
    status: "stable",
  },
];

export const elevationLevels = [
  ["0", "surface/page", "Page base"],
  ["1", "surface/card + border/subtle", "Cards, list items, inputs"],
  ["2", "surface/elevated + border/default", "Grouped and selected surfaces"],
  ["3", "surface/elevated + shadow/sheet", "Bottom sheets and drawers"],
  ["4", "surface/elevated + shadow/modal", "Modals and dialogs"],
  ["5", "surface/elevated + shadow/floating", "Fixed CTAs, dropdowns, toasts"],
] as const;
