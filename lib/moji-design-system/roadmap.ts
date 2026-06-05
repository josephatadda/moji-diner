import type { RoadmapItem } from "./types";

export const roadmapItems: RoadmapItem[] = [
  {
    phase: 1,
    module: "Diner Ordering Flow",
    status: "in-progress",
    expectedExtractions: [
      "Typography hierarchy",
      "Menu cards",
      "Category tabs",
      "Bottom sheet",
      "Cart and checkout",
      "Bill and payment",
      "Split bill",
      "Order status timeline",
      "Fixed CTA footer",
      "Quantity controls",
      "Inputs and textareas",
      "Selection cards",
      "Badges",
      "Empty/loading/error states",
    ],
  },
  {
    phase: 2,
    module: "Auth",
    status: "not-yet-extracted",
    expectedExtractions: ["Auth layout", "Form fields", "Error messaging"],
  },
  {
    phase: 3,
    module: "Dashboard",
    status: "not-yet-extracted",
    expectedExtractions: ["Sidebar", "Page headers", "Metric cards", "Tables"],
  },
  {
    phase: 4,
    module: "Billing",
    status: "not-yet-extracted",
    expectedExtractions: ["Invoices", "Payment status", "Financial tables"],
  },
  {
    phase: 5,
    module: "Analytics",
    status: "not-yet-extracted",
    expectedExtractions: ["Chart containers", "Date filters", "Loading states"],
  },
  {
    phase: 6,
    module: "Staff / Admin",
    status: "not-yet-extracted",
    expectedExtractions: ["Role badges", "Permission warnings", "Bulk actions"],
  },
  {
    phase: 7,
    module: "Loyalty",
    status: "not-yet-extracted",
    expectedExtractions: ["Reward cards", "Member status", "Promotions"],
  },
];

export const roadmapModules = roadmapItems.map((item) => item.module);
