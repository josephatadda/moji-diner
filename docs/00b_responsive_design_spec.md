# 00b — Responsive Design Specification

**Read this before building any UI component.**  
Every screen in ScanServe has two versions: a mobile experience and a web experience. Neither is an afterthought. They are different layouts designed for different contexts — not the same layout scaled up or down.

---

## Table of Contents

1. [Breakpoints](#1-breakpoints)
2. [Layout Patterns Per Surface](#2-layout-patterns-per-surface)
3. [Component Behavior by Breakpoint](#3-component-behavior-by-breakpoint)
4. [Navigation Patterns](#4-navigation-patterns)
5. [Typography Scale](#5-typography-scale)
6. [Spacing & Density](#6-spacing--density)
7. [Touch vs Pointer Targets](#7-touch-vs-pointer-targets)
8. [Responsive Rules for Claude Code](#8-responsive-rules-for-claude-code)

---

## 1. Breakpoints

```
Mobile:   < 768px    (sm)   — Android phones, primary diner surface
Tablet:   768–1023px (md)   — iPad, kitchen display tablet
Desktop:  ≥ 1024px   (lg)   — Restaurant owner on laptop/desktop

Use Tailwind breakpoint prefixes throughout:
  default (no prefix) = mobile
  md:                 = tablet+
  lg:                 = desktop+

Never use xl: or 2xl: — we don't design for large monitors.
```

---

## 2. Layout Patterns Per Surface

### 2a. Diner-Facing (Menu, Cart, Order Status, Bill, Split)

This surface is **mobile-only in practice** — diners scan a QR code on their phone. But it must still look correct if someone opens the link on a desktop (e.g. testing, or a diner on a laptop).

```
Mobile (default):
  Full-width single column
  Sticky header (restaurant name + cart)
  Sticky bottom bar (cart CTA)
  Bottom-sheet modals (slide up from bottom)
  Tab bars at top of scrollable content

Desktop (md+):
  Max-width: 480px, centered
  Surrounded by a neutral background (not pure white)
  Looks like a phone frame / app shell
  Same layout as mobile — just contained and centered
  No sidebar, no two-column layouts here

  CSS approach:
  .diner-shell {
    max-width: 480px;
    margin: 0 auto;
    min-height: 100vh;
    box-shadow: 0 0 60px rgba(0,0,0,0.15); /* subtle lift on desktop */
  }
```

**Why:** Diners on desktop should still feel like they're using the mobile app. Two-column menu layouts on desktop are jarring and unnecessary for a dine-in context.

---

### 2b. Restaurant Dashboard (Menu Builder, Order Queue, Loyalty, Analytics)

This surface is used by **owners on desktop AND staff on mobile** — both are equally important.

```
Mobile layout (default):
  Single column
  Bottom tab navigation (5 items max)
  Full-screen pages (no sidebars)
  Drawers slide up from bottom for forms/detail views
  Tables become card stacks
  Charts take full width, simplified (fewer data points shown)

Desktop layout (lg:):
  Fixed left sidebar: 240px wide
  Main content: remaining width, max-content-width: 1200px
  Two-panel layouts where useful (e.g. menu editor: editor left + preview right)
  Modals instead of bottom drawers
  Full data tables
  Charts with full detail

Tablet layout (md:):
  Collapsible sidebar (icon-only collapsed, full on hover/toggle)
  Single-column main content
  Bottom sheet OR modal depending on context
```

---

### 2c. Auth & Onboarding

```
Mobile:
  Full-width card, 16px horizontal padding
  Inputs full width
  Single column form

Desktop:
  Centered card, max-width 440px
  Soft shadow, rounded corners
  Background: subtle pattern or brand color
  Same form — just contained
```

---

### 2d. Admin Panel (Internal)

```
Desktop-only design (lg:):
  Sidebar + main content
  Dense data tables are fine
  Not optimized for mobile — admin panel is used on a computer

Mobile fallback:
  Functional but not polished
  Show a "Best viewed on desktop" banner on screens < 768px
  Basic table → card stack transformation
```

---

## 3. Component Behavior by Breakpoint

### Modals & Overlays

```
Mobile:   Bottom sheet (slides up, partial or full height)
          Handle bar at top for drag-to-dismiss
          Never centered modal on mobile — too hard to reach top close button

Desktop:  Centered dialog, max-width 560px, backdrop blur
          Close button top-right
          Keyboard-accessible (Escape to close)

Tailwind pattern:
  // Wrapper that switches behavior
  <div className="
    fixed inset-x-0 bottom-0 rounded-t-2xl    // mobile: bottom sheet
    md:inset-0 md:flex md:items-center md:justify-center md:rounded-none  // desktop: centered
  ">
```

### Data Tables

```
Mobile:   Card stack — each row becomes a card
          Show only 3–4 most important columns
          "More" or accordion for additional fields

Desktop:  Full table with all columns
          Sortable headers
          Pagination or infinite scroll

Pattern:
  // Hide columns on mobile
  <td className="hidden md:table-cell">  // only show on desktop
```

### Navigation

See Section 4 below.

### Forms

```
Mobile:   Full-width inputs, stacked labels above inputs
          Large tap targets (min 48px height)
          Numeric keyboard auto-triggered for phone/price fields
          Single column always

Desktop:  Can use 2-column layouts for related fields (e.g. First / Last name)
          Max-width constrained (don't let inputs stretch to 1200px)
          Inline validation on blur
```

### Charts (Analytics)

```
Mobile:   Simplified — show top 5 instead of top 10
          Larger touch targets on chart elements
          Horizontal scroll for bar charts with many items
          Stack chart + legend vertically

Desktop:  Full detail — top 10, full legend, hover tooltips
          Side-by-side charts if space allows
```

### Cards (Menu Items, Order Cards)

```
Mobile:   Full-width, 72–80px min height for list items
          Image: square 72px left-aligned
          Text: fills remaining width

Desktop:  Grid layout (2–3 columns) OR still list — depends on context
          Menu editor: list (you need to see full details while editing)
          Analytics: grid cards for KPIs
          Image: larger, top of card

In Tailwind:
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

---

## 4. Navigation Patterns

### Diner-Facing

```
Mobile:
  Fixed top header: restaurant name (left) + cart icon (right)
  Sticky category tabs below header (horizontal scroll)
  No bottom nav — cart bottom bar takes that space

Desktop:
  Same fixed top header (contained in 480px shell)
  Same sticky category tabs
  Identical to mobile — intentional
```

### Restaurant Dashboard

```
Mobile:
  Bottom tab bar, 5 items max:
    [Orders] [Menu] [Tables] [Loyalty] [More ···]
  "More" opens a sheet with: Analytics, Settings, Staff Login, Sign Out
  Current page tab is highlighted

Desktop (lg:):
  Fixed left sidebar, 240px:
    ┌──────────────────────────┐
    │  [Logo] ScanServe        │
    │  Mama Put Uyo            │
    │  ─────────────────────  │
    │  📋 Orders               │  ← active state: accent left border
    │  🍽  Menu                │
    │  📱 Tables & QR          │
    │  🏆 Loyalty              │
    │  📊 Analytics            │
    │  ─────────────────────  │
    │  ⚙️  Settings            │
    │  👥 Staff                │
    │  ─────────────────────  │
    │  Sign Out                │
    └──────────────────────────┘
  No bottom tab bar on desktop

Tablet (md:):
  Icon-only sidebar (collapsed by default)
  Hover or toggle to expand to full labels
  Or: bottom tab bar if sidebar feels cramped
```

### Auth / Onboarding

```
No navigation — clean focused experience
Back arrow (top left) for multi-step flows
Progress bar for onboarding wizard (top of page)
```

---

## 5. Typography Scale

```
Use Inter (Google Fonts). Load only weights 400, 500, 600, 700.

Scale (mobile-first, desktop increases size slightly):

                  Mobile      Desktop
Display:          28px/700    36px/700    (page heroes, empty state headlines)
H1:               24px/700    28px/700    (page titles)
H2:               20px/600    22px/600    (section headers)
H3:               17px/600    18px/600    (card titles, modal titles)
Body Large:       16px/400    16px/400    (primary reading text)
Body:             14px/400    14px/400    (secondary text, descriptions)
Label:            13px/500    13px/500    (form labels, tags, badges)
Caption:          12px/400    12px/400    (timestamps, helper text)
Micro:            11px/400    11px/400    (legal, footnotes — use sparingly)

Price/Amount:     Use Body Large weight 600 — always
Currency symbol:  Same size as number, not superscript

In Tailwind custom config:
  fontSize: {
    'display': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
    'h1': ['24px', { lineHeight: '1.3', fontWeight: '700' }],
    // etc.
  }
```

---

## 6. Spacing & Density

```
Base unit: 4px (Tailwind default)

Page padding:
  Mobile:   16px horizontal (px-4)
  Desktop:  24–32px horizontal (px-6 or px-8)

Section gaps:
  Mobile:   24px between major sections (gap-6)
  Desktop:  32px (gap-8)

Card padding:
  Mobile:   16px (p-4)
  Desktop:  20px (p-5)

List item height:
  Menu items:    72px minimum
  Order cards:   Auto height (content-driven)
  Table rows:    48px minimum

Input height:
  Mobile:   48px minimum (touch-friendly)
  Desktop:  40px

Button height:
  Mobile:   48px (primary), 40px (secondary)
  Desktop:  40px (primary), 36px (secondary)

DO NOT use Tailwind's default "space-y-2" pattern for major layout sections.
Use "space-y-6" (24px) as minimum for section separation.
```

---

## 7. Touch vs Pointer Targets

```
Mobile touch targets:
  Minimum: 44×44px (Apple HIG standard)
  Preferred: 48×48px
  For list items: full row is tappable (not just text)
  Destructive actions (delete): require confirmation, never single tap

Desktop pointer targets:
  Minimum: 32×32px
  Hover states: always defined (cursor changes, background shifts)
  Right-click context menus: not needed for V1

Spacing between tappable elements:
  Mobile: minimum 8px gap between adjacent tap targets
  Never stack two tappable elements with < 8px between them

In code:
  Always add to tappable elements on mobile:
  className="min-h-[48px] flex items-center"  // ensure height
  
  For icon-only buttons:
  className="p-3"  // adds padding to increase tap area beyond icon size
```

---

## 8. Responsive Rules for Claude Code

**Include these instructions in every Cursor/Claude Code prompt that involves UI:**

```
RESPONSIVE REQUIREMENTS FOR THIS COMPONENT:

1. Mobile-first: write base styles for mobile, use md: and lg: prefixes 
   to layer in desktop behavior. Never write desktop-first.

2. Diner-facing pages: max-width 480px centered on desktop. 
   Same layout as mobile — do not create a wide desktop layout 
   for menu/cart/order/bill pages.

3. Dashboard pages: bottom tab nav on mobile (<lg), 
   left sidebar nav on desktop (lg+). 
   Tables become card stacks on mobile.
   Modals become bottom sheets on mobile.

4. Touch targets: all interactive elements minimum 48px height on mobile.

5. Typography: use the scale from 00b_responsive_design_spec.md.
   Never use text-xs for anything a user needs to read.

6. No horizontal scroll on mobile except: 
   category tab bars, featured item strips, chart overflows.
   Everything else must fit in viewport width.

7. Test mentally at 375px width (iPhone SE) — if it breaks there, fix it.

8. Spacing: minimum space-y-6 (24px) between major sections. 
   Do not use space-y-2 for section separation.
```

---

## Quick Reference: Which Layout for Which Page

| Page | Mobile Layout | Desktop Layout |
|------|--------------|----------------|
| Diner menu | Full width, single col | 480px centered shell |
| Diner cart | Full width, single col | 480px centered shell |
| Diner bill | Full width, single col | 480px centered shell |
| Split status | Full width, single col | 480px centered shell |
| Owner login | Full width card | 440px centered card |
| Onboarding wizard | Full width, single col | 440px centered card |
| Dashboard orders | Single col, card stack | Sidebar + kanban board |
| Dashboard menu | Single col list | Sidebar + editor + preview panel |
| Dashboard tables | Single col card list | Sidebar + full table |
| Dashboard loyalty | Single col, cards | Sidebar + full table + detail panel |
| Dashboard analytics | Single col, stacked charts | Sidebar + grid layout |
| Dashboard settings | Single col form | Sidebar + 2-col form sections |
| Admin panel | Card stack (functional) | Sidebar + full data tables |

---

*This document governs all UI decisions across the ScanServe codebase.*  
*When in doubt: mobile first, then enhance for desktop. Never the reverse.*
