import type { DesignToken } from "../types";

export const zIndexTokens: DesignToken[] = [
  ["z/base", "0", "Default stacking"],
  ["z/sticky", "10", "Sticky headers and category tabs"],
  ["z/dropdown", "20", "Dropdown menus and popovers"],
  ["z/fixed-footer", "30", "Fixed checkout CTA footer"],
  ["z/sheet", "40", "Bottom sheet"],
  ["z/modal", "50", "Modal dialogs and overlays"],
  ["z/toast", "60", "Toast notifications"],
  ["z/tooltip", "70", "Tooltips"],
].map(([name, value, usage]) => ({
  name,
  value,
  usage,
  layer: "semantic",
  category: "z-index",
  status: "stable",
}));
