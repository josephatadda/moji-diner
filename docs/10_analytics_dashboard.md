# 10 — Analytics Dashboard

**Module:** 9 | **Depends on:** `01_data_models.md`, `09_loyalty_system.md`  
**Responsive:** See `00b_responsive_design_spec.md` — Desktop: KPI cards in a 4-column grid, charts side by side where space allows. Mobile: all cards and charts stack vertically in a single column. Charts simplify on mobile (fewer labels, top 5 instead of top 10, larger touch targets). Date picker on mobile uses native date inputs.

---

## Table of Contents

1. [User Flow](#1-user-flow)
2. [Metrics Definitions](#2-metrics-definitions)
3. [File Structure](#3-file-structure)
4. [API Routes](#4-api-routes)
5. [Chart Specs](#5-chart-specs)
6. [Acceptance Criteria](#6-acceptance-criteria)

---

## 1. User Flow

### 1.1 Dashboard Overview

```
Desktop (lg+):
  DATE RANGE: [Today ●] [Yesterday] [Last 7 days] [Last 30 days] [Custom]

  OVERVIEW CARDS — 4-column grid (grid-cols-4):
  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │  ₦42,500     │  │     128      │  │    ₦332      │  │   34 min     │
  │  Total       │  │   Total      │  │  Avg Order   │  │  Avg Prep    │
  │  Revenue     │  │   Orders     │  │   Value      │  │   Time       │
  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘

  [TOP DISHES — lg:w-1/2]       [PAYMENT METHODS — lg:w-1/2]
  [REVENUE BY HOUR — full width]
  [LOYALTY SNAPSHOT — full width]

Mobile (<lg):
  DATE RANGE: scrollable chips — [Today ●] [7d] [30d] [Custom]

  OVERVIEW CARDS — 2×2 grid (grid-cols-2):
  ┌──────────────┐  ┌──────────────┐
  │  ₦42,500     │  │     128      │
  │  Revenue     │  │   Orders     │
  └──────────────┘  └──────────────┘
  ┌──────────────┐  ┌──────────────┐
  │    ₦332      │  │   34 min     │
  │  Avg Order   │  │  Avg Prep    │
  └──────────────┘  └──────────────┘

  TOP DISHES — full width, top 5 only
  REVENUE BY HOUR — full width, fewer axis labels
  PAYMENT METHODS — full width, centered donut
  LOYALTY SNAPSHOT — full width
  Orders with loyalty:        71%
  Points awarded:          1,240
  Points redeemed:           320
  Most loyal customer:  Chidi O. (🥇 Gold, 23 visits)
```

### 1.2 Custom Date Range

```
[Owner clicks "Custom"]
        │
        ▼
[Date picker shows two calendars (from / to)]
[Owner selects Jan 1 – Jan 31]
[All charts and cards update for that range]
[URL updates: /dashboard/analytics?from=2026-01-01&to=2026-01-31]
```

---

## 2. Metrics Definitions

| Metric | Formula | Notes |
|--------|---------|-------|
| Total Revenue | `SUM(orders.total_amount)` WHERE `status = 'paid'` | Excludes VAT if shown separately |
| Total Orders | `COUNT(orders)` WHERE `status = 'paid'` | Only completed/paid orders |
| Avg Order Value | `Total Revenue / Total Orders` | Formatted as ₦X,XXX |
| Avg Prep Time | `AVG(time from 'confirmed' to 'ready')` | Tracked via status timestamps |
| Top Dishes | `SUM(order_items.quantity) GROUP BY menu_item_id ORDER BY count DESC LIMIT 10` | |
| Revenue by Hour | `SUM(total_amount) GROUP BY EXTRACT(hour FROM paid_at)` | Local Nigeria time (WAT UTC+1) |
| Payment Methods | `COUNT(*) GROUP BY payments.method` | As % of total paid orders |
| Loyalty Orders % | `COUNT(orders with diner_phone) / COUNT(all orders) * 100` | |

---

## 3. File Structure

```
app/
├── dashboard/
│   └── analytics/
│       ├── page.tsx
│       └── components/
│           ├── AnalyticsPage.tsx       ← layout + date range state
│           ├── DateRangePicker.tsx     ← today/yesterday/7d/30d/custom
│           ├── MetricCard.tsx          ← reusable KPI card
│           ├── TopDishesChart.tsx      ← horizontal bar chart (recharts)
│           ├── RevenueByHourChart.tsx  ← area chart (recharts)
│           ├── PaymentMethodChart.tsx  ← donut/pie chart (recharts)
│           └── LoyaltySnapshot.tsx    ← loyalty stats block
```

---

## 4. API Routes

### GET `/api/analytics/:restaurantId`

```typescript
// Auth: restaurant owner JWT
// Query: ?from=2026-01-01&to=2026-01-31
// Defaults to today if no params

// Response:
{
  data: {
    period: { from: string, to: string },

    // Overview cards
    total_revenue: number,
    total_orders: number,
    average_order_value: number,
    average_prep_time_mins: number,

    // Top dishes (top 10)
    top_dishes: [
      {
        menu_item_id: string,
        item_name: string,
        order_count: number,
        total_quantity: number,
        total_revenue: number
      }
    ],

    // Revenue by hour (24 buckets: 0–23)
    revenue_by_hour: [
      { hour: number, revenue: number, order_count: number }
    ],

    // Payment methods
    payment_methods: [
      { method: string, count: number, total: number, percentage: number }
    ],

    // Loyalty
    loyalty: {
      new_members: number,
      orders_with_loyalty: number,
      orders_with_loyalty_pct: number,
      points_awarded: number,
      points_redeemed: number,
      top_customer: { name: string, phone: string, tier: string, visits: number } | null
    }
  }
}

// SQL queries:
// Use Supabase's PostgREST or raw SQL via supabase.rpc()
// For complex aggregations, create a Supabase DB function (PLPGSQL)

// Example: Revenue by hour
// SELECT
//   EXTRACT(hour FROM paid_at AT TIME ZONE 'Africa/Lagos') as hour,
//   SUM(total_amount) as revenue,
//   COUNT(*) as order_count
// FROM orders
// WHERE restaurant_id = $1
//   AND status = 'paid'
//   AND paid_at >= $2
//   AND paid_at < $3
// GROUP BY hour
// ORDER BY hour
```

### GET `/api/analytics/:restaurantId/export`

```typescript
// Auth: restaurant owner JWT
// Query: ?from=&to=&format=csv
// Returns CSV download of orders in date range
// Columns: date, time, table, items, subtotal, vat, tip, total, payment_method
```

---

## 5. Chart Specs

### All Charts

```typescript
// Library: recharts (npm install recharts)
// Currency formatter: ₦X,XXX (no decimals for display)
// Colors: use brand palette
//   Primary: #1A1A2E
//   Accent:  #E94560
//   Success: #0F9B58
//   Neutral: #8892A4

const formatNaira = (value: number) =>
  `₦${Math.round(value).toLocaleString('en-NG')}`
```

### `<TopDishesChart />`

```typescript
// Type: Horizontal bar chart (BarChart with layout="vertical")
// X-axis: order count (integer)
// Y-axis: item names (truncated to 20 chars)
// Tooltip: "{name}: ×{count} orders · ₦{revenue} revenue"
// Show top 10 items
// Color: gradient from accent to primary
// Mobile: full width, scrollable if > 5 items

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
```

### `<RevenueByHourChart />`

```typescript
// Type: Area chart
// X-axis: hours (0–23, formatted as "6am", "12pm", etc.)
// Y-axis: revenue in ₦
// Area fill: light brand color
// Tooltip: "{hour}: ₦{revenue} from {count} orders"
// Highlight peak hour with annotation
// Show only 6am–11pm range (filter out dead hours with 0 revenue)
```

### `<PaymentMethodChart />`

```typescript
// Type: Donut chart (PieChart with innerRadius)
// Slices: Card, Bank Transfer, USSD (+ Others if needed)
// Center label: total order count
// Legend below chart on mobile
// Colors: distinct per method

const METHOD_COLORS = {
  card: '#1A1A2E',
  bank_transfer: '#0F9B58',
  ussd: '#F5A623',
  other: '#8892A4'
}
```

### `<MetricCard />`

```typescript
// Props:
//   label: string          // "Total Revenue"
//   value: string          // "₦42,500"
//   subtext?: string       // "+12% vs yesterday"
//   icon?: React.ReactNode
//   trend?: 'up' | 'down' | 'neutral'
//
// Trend arrow: 🟢 up = good, 🔴 down = bad (for revenue/orders)
// Refresh: pulse animation when data is loading
```

---

## 6. Acceptance Criteria

- [ ] Analytics loads in < 3 seconds for a 30-day range
- [ ] Date range selector defaults to Today on first load
- [ ] All 4 KPI cards show correct values for selected period
- [ ] Top dishes chart shows correct item names and counts
- [ ] Revenue by hour uses Nigeria time (WAT = UTC+1)
- [ ] Payment method donut shows correct percentages
- [ ] All charts readable on mobile (5–6" screen) without horizontal scroll
- [ ] Currency always formatted as ₦X,XXX (no decimals)
- [ ] "Today" data refreshes automatically every 5 minutes
- [ ] Loyalty snapshot section only shown when loyalty_enabled = true
- [ ] CSV export works and downloads correctly named file
- [ ] Empty state shown for each chart when no data in selected period

---

*Next: `11_offline_support.md`*
