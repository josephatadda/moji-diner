export const DINER = {
  // Layout
  page: "px-4 py-4",
  pageGap: "space-y-6",
  sectionGap: "space-y-3",
  listGap: "space-y-3",

  // Cards
  card: "bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgb(0,0,0,0.04)]",
  cardPadding: "p-4",
  summaryCard: "bg-gray-50 rounded-xl p-4",

  // Typography
  title: "text-xl font-bold text-gray-900",
  subtitle: "text-xs text-gray-400",
  sectionHeading: "text-sm font-semibold text-gray-700",
  cardTitle: "text-sm font-semibold text-gray-900",
  body: "text-sm text-gray-600",
  caption: "text-xs text-gray-400",
  price: "text-sm font-bold text-gray-900",
  priceLarge: "text-lg font-bold text-gray-900",

  // Interactive
  pressable: "active:scale-[0.97] transition-all ease-out",
  ctaPress: "active:scale-[0.98] transition-all",

  // Status colors
  statusPreparing: "bg-orange-500 animate-pulse",
  statusReady: "bg-green-500",
  statusServed: "bg-green-500",
} as const;
