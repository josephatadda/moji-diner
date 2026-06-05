import type { DesignToken } from "../types";

export const layoutTokens: DesignToken[] = [
  ["layout/mobile-page-gutter", "16px", "Left/right padding on mobile"],
  ["layout/diner-content-max", "480px", "Max width for diner ordering content"],
  [
    "layout/dashboard-content-max",
    "1200px",
    "Dashboard content max width (in use via the dashboard adapter)",
  ],
  ["layout/sheet-max-height", "85vh", "Max height for bottom sheet"],
  ["layout/modal-sm", "400px", "Small modal width"],
  ["layout/modal-md", "560px", "Medium modal width"],
  ["layout/modal-lg", "720px", "Large modal width"],
  ["layout/sticky-footer-height", "72px", "Fixed CTA footer height"],
  [
    "layout/mobile-safe-area-bottom",
    "env(safe-area-inset-bottom)",
    "iOS safe area",
  ],
  ["layout/page-header-height", "56px", "Top header bar height"],
].map(([name, value, usage]) => ({
  name,
  value,
  usage,
  layer: "semantic",
  category: "layout",
  status: "stable",
}));
