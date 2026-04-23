"use client";

import { useState } from "react";
import { Export } from "@phosphor-icons/react";
import { MOCK_ANALYTICS, formatPrice } from "@/lib/mockData";
import { TopDishesChart } from "./TopDishesChart";
import { RevenueByHourChart } from "./RevenueByHourChart";
import { PaymentMethodChart } from "./PaymentMethodChart";
import { LoyaltySnapshot } from "./LoyaltySnapshot";
import { ds, t } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

const RANGES = ["Today", "Yesterday", "Last 7 days", "Last 30 days", "Custom"];

function MetricCard({ label, value, trend }: { label: string; value: string; trend: string }) {
  const positive = trend.startsWith("+") || trend.startsWith("-4");
  return (
    <div className={ds.metric.card}>
      <div className={ds.metric.header}>
        <p className={ds.metric.label}>{label}</p>
        <span className={positive ? ds.metric.up : ds.metric.down}>{trend}</span>
      </div>
      <div>
        <p className={ds.metric.value}>{value}</p>
        <p className={ds.metric.sub}>vs yesterday</p>
      </div>
    </div>
  );
}

export function AnalyticsPage() {
  const [range, setRange] = useState("Today");

  return (
    <div className={ds.page}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className={t.h1}>Analytics</h1>
          <p className={`${t.body} mt-1`}>Performance metrics for {range.toLowerCase()}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Range selector */}
          <div className="flex bg-white border border-gray-200 p-1 rounded-xl gap-0.5 overflow-x-auto scrollbar-none">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  range === r ? ds.btn.tabActive : ds.btn.tab,
                  "whitespace-nowrap"
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <button className={`${ds.btn.ghost} hidden lg:inline-flex`}>
            <Export size={15} />
            Export
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <MetricCard label="Total revenue"    value={formatPrice(42500)} trend="+12%" />
        <MetricCard label="Total orders"     value="128"                trend="+8%"  />
        <MetricCard label="Avg. order value" value={formatPrice(3320)}  trend="-2%"  />
        <MetricCard label="Avg. prep time"   value="34 min"             trend="-4 min" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <TopDishesChart data={MOCK_ANALYTICS.topDishes} />
        <PaymentMethodChart data={MOCK_ANALYTICS.paymentMethods} />
      </div>

      {/* Revenue trend */}
      <div className="mb-4">
        <RevenueByHourChart data={MOCK_ANALYTICS.revenueTrend} />
      </div>

      <LoyaltySnapshot />
    </div>
  );
}
