import type { ComponentVariant } from "../types";

export const navigationComponentVariants: ComponentVariant[] = [
  {
    component: "Category Tab",
    variant: "scrollable",
    group: "Navigation",
    surface: "diner-ordering",
    states: [
      "default",
      "hover",
      "active",
      "focus-visible",
      "selected",
      "disabled",
    ],
    tokensUsed: [
      "text/secondary",
      "text/primary",
      "accent/brand",
      "space/inline-gap",
    ],
    anatomy: [
      "Horizontal scroll container",
      "Pill/tab item",
      "Active indicator",
    ],
    accessibility: [
      "Use tablist semantics where behavior is tab-like",
      "Active state must be textually clear",
    ],
    usage: "Menu category navigation.",
    avoid: "Avoid wrapping category tabs on mobile.",
    exampleClassName:
      "rounded-full px-4 py-2 text-sm font-medium data-[active=true]:bg-gray-900 data-[active=true]:text-white",
    status: "stable",
  },
  {
    component: "SegmentedTabs",
    variant: "split-mode",
    group: "Navigation",
    surface: "diner-ordering",
    states: ["default", "selected", "focus-visible", "disabled"],
    tokensUsed: ["radius/chip", "surface/muted", "action/primary"],
    anatomy: ["Pill container", "Equal segments", "Selected fill"],
    accessibility: ["Expose selected state", "Keep labels short and readable"],
    usage: "Split bill modes, payment views, bill tabs.",
    avoid: "Avoid long labels that wrap inside segments.",
    exampleClassName:
      "grid rounded-full bg-gray-100 p-1 text-sm data-[active=true]:bg-gray-900",
    status: "stable",
  },
  {
    component: "PageHeader",
    variant: "diner",
    group: "Navigation",
    surface: "diner-ordering",
    states: ["default"],
    tokensUsed: ["Heading/M", "Body/S", "space/page-gutter"],
    anatomy: [
      "Back/leading action",
      "Title",
      "Subtitle/meta",
      "Optional trailing action",
    ],
    accessibility: [
      "Use page-level heading once per view",
      "Icon buttons need labels",
    ],
    usage: "Menu, cart, bill, payment, and split views.",
    avoid: "Avoid oversized hero type in operational subflows.",
    status: "stable",
  },
];
