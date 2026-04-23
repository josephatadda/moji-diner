/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MOJI DESIGN SYSTEM — v2.0
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Single source of truth for all visual tokens and component classes.
 * Follows shadcn/ui conventions: semantic CSS variables + Tailwind gray scale.
 *
 * DECISION: GRAY (not zinc).
 *   shadcn default theme is gray-based. 52 existing gray-* uses beats 24 zinc-*.
 *   All new code uses gray. All zinc-* occurrences should be migrated to gray.
 *
 * USAGE:
 *   import { c, t, sp, r, ds } from "@/lib/design-tokens";
 *   <p className={t.body}>{label}</p>
 *   <button className={ds.btn.primary}>Save</button>
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ┌─────────────────────────────────────────────────────────────────────────────
// │ COLORS  c.*
// │ Rule: gray for neutrals, orange-500 as the ONE accent, semantic for states
// └─────────────────────────────────────────────────────────────────────────────

export const c = {
  // ── Neutral scale (gray) ─────────────────────────────────────────────────
  //   50   100   200   300   400   500   600   700   800   900   950
  //  #f9  #f3   #e5   #d1   #9c   #6b   #52   #37   #1f   #11   #07
  //
  // Text hierarchy:
  text: {
    primary:    "text-gray-900",   // headings, values, high-emphasis — #111827
    secondary:  "text-gray-600",   // body copy, description            — #4B5563
    muted:      "text-gray-400",   // timestamps, placeholders          — #9CA3AF
    disabled:   "text-gray-300",   // disabled labels                   — #D1D5DB
    inverse:    "text-white",      // on dark backgrounds               — #FFFFFF
    accent:     "text-orange-500", // links, active, highlights         — #F97316
    accentHover:"text-orange-600", // hover on accent text              — #EA580C
    success:    "text-green-600",
    warning:    "text-amber-600",
    danger:     "text-red-500",
  },

  // Background scale:
  bg: {
    page:       "bg-gray-50",   // page canvas              — #F9FAFB
    surface:    "bg-white",     // cards, panels            — #FFFFFF
    subtle:     "bg-gray-50",   // input background         — #F9FAFB
    raised:     "bg-gray-100",  // hover states, chips      — #F3F4F6
    overlay:    "bg-gray-200",  // skeleton, dividers       — #E5E7EB
    dark:       "bg-gray-900",  // primary buttons          — #111827
    accent:     "bg-orange-50",
    accentMid:  "bg-orange-100",
    accentFull: "bg-orange-500",
    success:    "bg-green-50",
    successMid: "bg-green-100",
    warning:    "bg-amber-50",
    danger:     "bg-red-50",
    dangerMid:  "bg-red-100",
  },

  // Border scale:
  border: {
    subtle:  "border-gray-50",   // card internal dividers  — #F9FAFB
    default: "border-gray-100",  // card outlines           — #F3F4F6
    input:   "border-gray-200",  // input rings             — #E5E7EB
    strong:  "border-gray-300",  // emphasis dividers       — #D1D5DB
    accent:  "border-orange-200",
    success: "border-green-100",
    warning: "border-amber-100",
    danger:  "border-red-100",
  },
} as const;

// ┌─────────────────────────────────────────────────────────────────────────────
// │ TYPOGRAPHY  t.*
// │ Font: Geist Sans (sans), Geist Mono (mono) — loaded in app/layout.tsx
// │ Rule: sentence case everywhere. Tabular nums on all financial/numeric data.
// └─────────────────────────────────────────────────────────────────────────────

export const t = {
  // ── Display & Headings ────────────────────────────────────────────────────
  h1:    "text-2xl   font-bold    text-gray-900 tracking-tight leading-tight",
  h2:    "text-xl    font-bold    text-gray-900 tracking-tight leading-tight",
  h3:    "text-lg    font-semibold text-gray-900 leading-snug",
  h4:    "text-base  font-semibold text-gray-900",

  // ── Body ─────────────────────────────────────────────────────────────────
  body:  "text-sm    text-gray-600 leading-relaxed",
  bodyStrong: "text-sm font-medium text-gray-900",

  // ── Labels & Meta ─────────────────────────────────────────────────────────
  label: "text-xs    font-semibold text-gray-500",       // field labels, above inputs
  meta:  "text-xs    text-gray-400",                      // timestamps, sub-labels
  mono:  "font-mono  text-xs       text-gray-400",        // refs, codes, PINs

  // ── Section group label (nav, settings) ──────────────────────────────────
  groupLabel: "text-[10px] font-semibold text-gray-400 uppercase tracking-widest",

  // ── Data / Numbers ────────────────────────────────────────────────────────
  // Always tabular-nums on prices, counts, percentages
  stat:   "text-2xl font-bold text-gray-900 tracking-tight [font-variant-numeric:tabular-nums]",
  stat3xl:"text-3xl font-bold text-gray-900 tracking-tight [font-variant-numeric:tabular-nums]",
  number: "text-sm   font-bold  text-gray-900 [font-variant-numeric:tabular-nums]",
  numberMd: "text-base font-bold text-gray-900 [font-variant-numeric:tabular-nums]",
  price:  "text-sm   font-bold  text-gray-900 [font-variant-numeric:tabular-nums]",

  // ── Accent text ───────────────────────────────────────────────────────────
  link:  "text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors",

  // ── Badge text ────────────────────────────────────────────────────────────
  badge: "text-[10px] font-bold",
} as const;

// ┌─────────────────────────────────────────────────────────────────────────────
// │ SPACING  sp.*
// │ 4pt grid — all values are multiples of 4px.
// │ 1=4px  2=8px  3=12px  4=16px  5=20px  6=24px  8=32px  10=40px  12=48px
// └─────────────────────────────────────────────────────────────────────────────

export const sp = {
  // ── Page layout ───────────────────────────────────────────────────────────
  page:     "px-4 py-6 lg:px-8 lg:py-8",             // page-level padding
  pageWrap: "w-full max-w-[1200px] mx-auto",          // max-width container

  // ── Card internal padding ─────────────────────────────────────────────────
  cardPad:  "p-5",         // 20px — standard card body            [5×4pt]
  cardPadLg:"p-6",         // 24px — spacious cards (analytics)    [6×4pt]

  // ── Card header (with bottom divide) ─────────────────────────────────────
  cardHead: "px-5 pt-5 pb-4",   // 20-20-16px

  // ── List row ──────────────────────────────────────────────────────────────
  rowSm:   "px-4 py-3",         // 16-12px — compact rows
  row:     "px-5 py-3.5",       // 20-14px — standard rows         [3.5=14pt ≈ 4pt grid]
  rowLg:   "px-5 py-4",         // 20-16px — spacious rows

  // ── Inline gaps (flex / grid) ─────────────────────────────────────────────
  gap1:    "gap-1",    // 4px
  gap2:    "gap-2",    // 8px
  gap3:    "gap-3",    // 12px
  gap4:    "gap-4",    // 16px
  gap5:    "gap-5",    // 20px
  gap6:    "gap-6",    // 24px

  // ── Section spacing (between page sections) ───────────────────────────────
  section: "mb-4",     // 16px between sections
  sectionLg:"mb-6",    // 24px — after headers, before main content

  // ── Icon standard sizes ───────────────────────────────────────────────────
  // size={16} — nav items, inline icons
  // size={18} — card header icons, stat card icons
  // size={20} — empty states, primary icon on modal
  // size={24} — hero icons
} as const;

// ┌─────────────────────────────────────────────────────────────────────────────
// │ RADIUS  r.*
// │ Rule: inner = sm, interactive = md/lg, containers = xl/2xl
// └─────────────────────────────────────────────────────────────────────────────

export const r = {
  none:   "rounded-none",    //  0px
  sm:     "rounded",         //  4px  — checkbox, small indicator
  md:     "rounded-md",      //  6px  — dropdown items, tooltips
  lg:     "rounded-lg",      //  8px  — icon boxes, inner chips
  xl:     "rounded-xl",      // 12px  — buttons, inputs, small cards
  "2xl":  "rounded-2xl",     // 16px  — cards, panels, modals
  "3xl":  "rounded-3xl",     // 24px  — mobile sheet bottoms, drawers
  full:   "rounded-full",    //  ∞    — badges, pill tags, toggles, avatars
} as const;

// ┌─────────────────────────────────────────────────────────────────────────────
// │ COMPONENTS  ds.*
// │ Pre-composed Tailwind strings for every pattern in the app.
// └─────────────────────────────────────────────────────────────────────────────

export const ds = {

  // ── BUTTONS ─────────────────────────────────────────────────────────────
  btn: {
    /** Primary: black fill — confirm, submit, save actions */
    primary:
      "inline-flex items-center justify-center gap-2 h-9 px-4 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 active:scale-[0.97] transition-all ease-out disabled:opacity-50 disabled:cursor-not-allowed",

    /** Primary full-width — mobile CTAs, form submissions */
    primaryFull:
      "w-full flex items-center justify-center gap-2 h-10 px-4 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 active:scale-[0.97] transition-all ease-out disabled:opacity-50 disabled:cursor-not-allowed",

    /** Ghost: outlined — secondary actions */
    ghost:
      "inline-flex items-center justify-center gap-2 h-9 px-4 bg-white text-gray-900 text-sm font-medium rounded-xl border border-gray-200 hover:bg-gray-50 active:scale-[0.97] transition-all ease-out",

    /** Ghost full-width */
    ghostFull:
      "w-full flex items-center justify-center gap-2 h-10 px-4 bg-white text-gray-900 text-sm font-medium rounded-xl border border-gray-200 hover:bg-gray-50 active:scale-[0.97] transition-all ease-out",

    /** Danger: red fill — delete, destructive */
    danger:
      "inline-flex items-center justify-center gap-2 h-9 px-4 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 active:scale-[0.97] transition-all ease-out",

    /** Icon button: square icon-only */
    icon:
      "inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors",

    /** Tab / filter pill — inactive */
    tab:
      "inline-flex items-center justify-center h-8 px-3 text-xs font-medium text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors",

    /** Tab / filter pill — active */
    tabActive:
      "inline-flex items-center justify-center h-8 px-3 text-xs font-semibold bg-gray-900 text-white rounded-lg",

    /** Link-style — text-only, no background */
    link:
      "inline-flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors",
  },

  // ── CARDS ─────────────────────────────────────────────────────────────────
  card: {
    /** Base white card with border */
    base:    "bg-white rounded-2xl border border-gray-100",

    /** Card with a titled header section + divider */
    // Usage:
    // <div className={ds.card.base}>
    //   <div className={ds.card.header}><h2 className={t.h4}>Title</h2></div>
    //   <div className={ds.card.body}>...</div>
    // </div>
    header:  "flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-50",
    body:    "p-5",
    footer:  "px-5 pb-5 pt-3 border-t border-gray-50",

    /** List card: rows separated by dividers instead of padding */
    list:    "bg-white rounded-2xl border border-gray-100",
    row:     "flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors",
    rowCompact: "flex items-center justify-between px-4 py-3",
    divider: "divide-y divide-gray-50",
  },

  // ── METRIC CARDS (stat cards for dashboards) ─────────────────────────────
  metric: {
    /** Outer card wrapper */
    card:     "bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3",

    /** Top row: label + icon */
    header:   "flex items-center justify-between",

    /** Label text */
    label:    "text-xs font-medium text-gray-400 tracking-wide",

    /** Big number / stat value */
    value:    "text-2xl font-bold text-gray-900 tracking-tight [font-variant-numeric:tabular-nums]",

    /** Sub-label below value */
    sub:      "text-xs text-gray-400",

    /** Trend indicator: positive */
    up:       "text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full",

    /** Trend indicator: negative */
    down:     "text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full",

    /** Icon container — accent */
    iconAccent: "w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center flex-none",

    /** Icon container — neutral */
    iconMuted:  "w-9 h-9 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center flex-none",
  },

  // ── TABLES ───────────────────────────────────────────────────────────────
  table: {
    /** Outer wrapper */
    wrap:   "bg-white rounded-2xl border border-gray-100 overflow-hidden",

    /** <table> element */
    table:  "w-full text-sm",

    /** <thead> row */
    thead:  "border-b border-gray-100",

    /** <th> cell */
    th:     "px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider",

    /** <tbody> rows */
    tbody:  "divide-y divide-gray-50",

    /** <tr> — base */
    tr:     "hover:bg-gray-50/50 transition-colors",

    /** <td> — base */
    td:     "px-4 py-3.5 text-sm text-gray-900",

    /** <td> — muted (secondary column) */
    tdMuted: "px-4 py-3.5 text-sm text-gray-400",

    /** <td> — mono (refs, codes) */
    tdMono:  "px-4 py-3.5 text-xs font-mono text-gray-400",
  },

  // ── BADGES ───────────────────────────────────────────────────────────────
  badge: {
    /** Base — apply color variant on top */
    base: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",

    // Order status
    status: {
      pending:    "bg-orange-100 text-orange-700",
      in_kitchen: "bg-blue-100   text-blue-700",
      ready:      "bg-green-100  text-green-700",
      served:     "bg-gray-100   text-gray-600",
      paid:       "bg-purple-100 text-purple-700",
    },

    // Payment method
    method: {
      card:          "bg-blue-50   text-blue-600",
      bank_transfer: "bg-green-50  text-green-600",
      ussd:          "bg-purple-50 text-purple-600",
      cash:          "bg-gray-50   text-gray-500",
    },

    // Table occupancy
    table: {
      available:        "bg-green-100  text-green-700",
      occupied:         "bg-orange-100 text-orange-700",
      awaiting_payment: "bg-blue-100   text-blue-700",
    },

    // Loyalty tier
    tier: {
      Bronze:   "bg-orange-100 text-orange-700",
      Silver:   "bg-gray-100   text-gray-700",
      Gold:     "bg-yellow-100 text-yellow-700",
      Platinum: "bg-purple-100 text-purple-700",
    },

    // General purpose
    green:  "bg-green-100  text-green-700",
    orange: "bg-orange-100 text-orange-700",
    blue:   "bg-blue-100   text-blue-700",
    red:    "bg-red-100    text-red-600",
    gray:   "bg-gray-100   text-gray-600",
    purple: "bg-purple-100 text-purple-700",
  },

  // ── INPUTS ───────────────────────────────────────────────────────────────
  input: {
    base:
      "w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-all",

    withIcon:
      "w-full h-10 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-all",

    textarea:
      "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-all resize-none",

    /** Label sits above input — always */
    label: "block text-xs font-semibold text-gray-500 mb-1.5",

    /** Helper text sits below input */
    hint: "text-xs text-gray-400 mt-1",

    /** Error text sits below input */
    error: "text-xs text-red-500 mt-1",

    /** Icon positioning inside input */
    iconLeft: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none",
  },

  // ── AVATARS & ICON CONTAINERS ─────────────────────────────────────────────
  avatar: {
    // Initials avatars
    xs:    "w-6  h-6  rounded-full bg-gray-900 flex items-center justify-center flex-none text-white text-[9px] font-bold",
    sm:    "w-8  h-8  rounded-full bg-gray-900 flex items-center justify-center flex-none text-white text-xs font-bold",
    md:    "w-9  h-9  rounded-full bg-gray-100 flex items-center justify-center flex-none text-gray-600 text-sm font-bold",
    lg:    "w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-none text-gray-600 font-bold",

    // Brand / restaurant square avatar
    brand: "w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-none text-white text-xs font-bold",
    brandLg: "w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-none text-white text-sm font-bold",
  },

  iconBox: {
    sm:     "w-8  h-8  rounded-lg  flex items-center justify-center",
    md:     "w-9  h-9  rounded-xl  flex items-center justify-center",
    lg:     "w-10 h-10 rounded-xl  flex items-center justify-center",
    accent: "w-9  h-9  rounded-xl  bg-orange-50  text-orange-500 flex items-center justify-center",
    muted:  "w-9  h-9  rounded-xl  bg-gray-50    text-gray-400   flex items-center justify-center",
    success:"w-9  h-9  rounded-xl  bg-green-50   text-green-600  flex items-center justify-center",
    danger: "w-9  h-9  rounded-xl  bg-red-50     text-red-500    flex items-center justify-center",
  },

  // ── ALERTS & INFO BOXES ───────────────────────────────────────────────────
  alert: {
    base:    "flex items-start gap-2 p-3 rounded-xl text-xs",
    info:    "bg-blue-50   border border-blue-100   text-blue-700",
    warning: "bg-orange-50 border border-orange-100 text-orange-700",
    success: "bg-green-50  border border-green-100  text-green-700",
    danger:  "bg-red-50    border border-red-100    text-red-700",
  },

  // ── NAVIGATION ────────────────────────────────────────────────────────────
  nav: {
    item:
      "flex items-center gap-3 pl-3 pr-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors relative",
    itemActive:
      "flex items-center gap-3 pl-3 pr-4 py-2 rounded-lg text-sm font-semibold bg-orange-50 text-orange-600 relative",
    activePip:
      "absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-orange-500",
  },

  // ── LAYOUT ────────────────────────────────────────────────────────────────
  page:    "px-4 py-6 lg:px-8 lg:py-8 w-full max-w-[1200px] mx-auto",

  // ── EMPTY STATES ─────────────────────────────────────────────────────────
  empty: {
    wrap:  "flex flex-col items-center justify-center py-16 px-4 text-center",
    icon:  "w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4",
    title: "text-sm font-semibold text-gray-900 mb-1",
    body:  "text-xs text-gray-400 max-w-[200px]",
  },

  // ── TOGGLE / SWITCH ───────────────────────────────────────────────────────
  toggle: {
    track: (on: boolean) =>
      `w-11 h-6 rounded-full flex items-center px-1 transition-colors duration-200 ${on ? "bg-gray-900 justify-end" : "bg-gray-200 justify-start"}`,
    thumb: "w-4 h-4 bg-white rounded-full shadow-sm",
  },

  // ── DIVIDERS ─────────────────────────────────────────────────────────────
  divider: {
    y:  "divide-y divide-gray-50",
    x:  "divide-x divide-gray-100",
    hr: "border-t border-gray-100",
  },
} as const;

// ┌─────────────────────────────────────────────────────────────────────────────
// │ STATUS LABEL MAPS  (shared across multiple pages)
// └─────────────────────────────────────────────────────────────────────────────

export const statusLabel = {
  order: {
    pending:    "Pending",
    in_kitchen: "In kitchen",
    ready:      "Ready",
    served:     "Served",
    paid:       "Paid",
  },
  table: {
    available:        "Available",
    occupied:         "Occupied",
    awaiting_payment: "Awaiting payment",
  },
  transaction: {
    success: "Paid",
    failed:  "Failed",
    pending: "Pending",
  },
} as const;

export const methodLabel: Record<string, string> = {
  card:          "Card",
  bank_transfer: "Transfer",
  ussd:          "USSD",
  cash:          "Cash",
};
