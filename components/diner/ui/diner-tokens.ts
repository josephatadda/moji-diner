export const DINER = {
  // Layout
  page: "px-4 py-4",
  pageGap: "space-y-6",
  sectionGap: "space-y-4",
  listGap: "space-y-3",
  footerOffset: "pb-24",

  // Cards
  card: "bg-white rounded-xl border border-gray-100",
  cardInteractive:
    "bg-white rounded-xl border border-gray-100 transition-all duration-200 ease-[var(--ease-out-strong)] hover:border-gray-200",
  itemCard:
    "bg-white rounded-2xl border border-gray-100 transition-all duration-200 ease-[var(--ease-out-strong)] hover:border-gray-200",
  cardMuted: "bg-gray-50 rounded-xl border border-gray-100",
  cardPadding: "p-4",
  summaryCard: "bg-gray-50 rounded-xl border border-gray-100 p-4",
  mediaFrame: "rounded-xl border border-gray-100 bg-gray-50",
  itemMediaFrame: "rounded-xl border border-gray-100 bg-gray-50",

  // Typography
  displayTitle:
    "text-[32px] font-medium leading-[1.05] text-gray-900 [font-family:var(--font-display)]",
  displayTitleSmall:
    "text-[28px] font-medium leading-[1.12] text-gray-900 [font-family:var(--font-display)]",
  sheetTitle:
    "text-2xl font-semibold leading-[1.2] text-gray-900 [font-family:var(--font-display)]",
  sectionTitle:
    "text-[22px] font-medium leading-[1.25] text-gray-900 [font-family:var(--font-display)]",
  title: "text-xl font-semibold text-gray-900",
  operationalTitle: "text-xl font-bold text-gray-900",
  subtitle: "text-xs text-gray-400",
  sectionHeading: "text-sm font-semibold text-gray-700",
  inputLabel: "text-sm font-medium text-gray-700",
  cardTitle: "text-sm font-semibold text-gray-900",
  body: "text-sm text-gray-600",
  caption: "text-xs text-gray-400",
  price: "text-sm font-bold text-gray-900",
  priceLarge: "text-lg font-bold text-gray-900",
  stat: "text-[22px] font-bold text-gray-900 tabular-nums",
  priceTabular: "font-bold text-gray-900 tabular-nums",

  // Interactive
  pressable: "active:scale-[0.97] transition-transform duration-150 ease-[var(--ease-out-strong)]",
  ctaPress: "active:scale-[0.98] transition-transform duration-150 ease-[var(--ease-out-strong)]",
  primaryCta:
    "h-12 rounded-full bg-gray-900 px-5 text-white font-bold text-[15px] hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:hover:bg-gray-200 disabled:cursor-not-allowed",
  secondaryCta:
    "h-12 rounded-full bg-gray-100 px-5 text-gray-900 font-bold text-sm hover:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed",
  outlineCta:
    "h-12 rounded-full border border-gray-200 bg-white px-5 text-gray-700 font-semibold text-sm hover:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed",
  iconButton:
    "w-11 h-11 rounded-full border border-gray-200 bg-white text-gray-700 flex items-center justify-center hover:bg-gray-50",
  stepperShell:
    "flex h-12 items-center gap-2 rounded-full border border-gray-100 bg-gray-50 p-1",
  stepperButton:
    "flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-sm font-bold text-gray-700 hover:bg-gray-50",
  stepperButtonPrimary:
    "flex h-10 w-10 items-center justify-center rounded-full border border-gray-900 bg-gray-900 text-sm font-bold text-white hover:bg-gray-800",
  categoryTab:
    "flex-none rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors text-gray-500 hover:bg-gray-100 hover:text-gray-900",
  categoryTabActive:
    "bg-gray-900 text-white hover:bg-gray-900 hover:text-white",
  choicePill:
    "h-12 rounded-full border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-400",
  choicePillActive:
    "border-gray-900 bg-gray-900 text-white hover:border-gray-900",
  floatingSecondary:
    "flex h-12 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-sm font-bold text-gray-900 hover:bg-gray-50",
  floatingPrimary:
    "flex h-12 items-center gap-3 rounded-full border border-gray-900 bg-gray-900 px-5 text-white hover:bg-gray-800",
  textDangerAction:
    "rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 hover:text-red-700",
  demoAction:
    "rounded-full border border-orange-100 bg-orange-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-orange-600",
  input:
    "w-full h-12 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none transition-colors",
  textarea:
    "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none resize-none transition-colors",
  fieldShell:
    "rounded-lg border border-gray-200 bg-white transition-colors focus-within:border-gray-500",
  selectionCard:
    "flex w-full items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3.5 text-left text-sm transition-colors hover:border-gray-200",
  selectionCardSelected: "border-gray-900 bg-gray-900 text-white",
  statusChip:
    "inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-700",
  metaChip:
    "inline-flex items-center gap-1.5 rounded-full border border-gray-100 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-700",

  // Status colors
  statusPreparing: "bg-orange-500 animate-pulse",
  statusReady: "bg-green-500",
  statusServed: "bg-green-500",
} as const;
