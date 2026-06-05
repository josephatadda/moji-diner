"use client";

import { Export } from "@phosphor-icons/react";
import { useState } from "react";
import { DashboardSetupPrompt } from "@/components/dashboard/ui/DashboardSetupPrompt";
import { ds, t } from "@/lib/design-tokens";
import { formatPrice, MOCK_ANALYTICS } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { useDashboardSettingsStore } from "@/store/dashboard-settings";
import { LoyaltySnapshot } from "./LoyaltySnapshot";
import { PaymentMethodChart } from "./PaymentMethodChart";
import { RevenueByHourChart } from "./RevenueByHourChart";
import { TopDishesChart } from "./TopDishesChart";

const RANGES = ["Today", "Yesterday", "Last 7 days", "Last 30 days", "Custom"];

function MetricCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: string;
}) {
  const positive = trend.startsWith("+") || trend.startsWith("-4");
  return (
    <div className={ds.metric.card}>
      <div className={ds.metric.header}>
        <p className={ds.metric.label}>{label}</p>
        <span className={positive ? ds.metric.up : ds.metric.down}>
          {trend}
        </span>
      </div>
      <div>
        <p className={ds.metric.value}>{value}</p>
        <p className={ds.metric.sub}>vs yesterday</p>
      </div>
    </div>
  );
}

export function AnalyticsPage() {
  const analyticsEnabled = useDashboardSettingsStore(
    (state) => state.features.analytics,
  );
  const [range, setRange] = useState("Today");

  if (!analyticsEnabled) {
    return (
      <DashboardSetupPrompt
        title="Analytics are off"
        description="Enable analytics when this restaurant wants performance charts, top dishes, loyalty snapshots, and revenue trends."
        featureLabel="analytics"
        icon={Export}
      />
    );
  }

  return (
    <div className={ds.page}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className={t.h1}>Analytics</h1>
          <p className={`${t.body} mt-1`}>
            Performance metrics for {range.toLowerCase()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Range selector */}
          <div className="flex bg-white border border-gray-200 p-1 rounded-xl gap-0.5 overflow-x-auto scrollbar-none">
            {RANGES.map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  range === r ? ds.btn.tabActive : ds.btn.tab,
                  "whitespace-nowrap",
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={`${ds.btn.ghost} hidden lg:inline-flex`}
          >
            <Export size={15} />
            Export
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <MetricCard
          label="Total revenue"
          value={formatPrice(42500)}
          trend="+12%"
        />
        <MetricCard label="Total orders" value="128" trend="+8%" />
        <MetricCard
          label="Avg. order value"
          value={formatPrice(3320)}
          trend="-2%"
        />
        <MetricCard label="Avg. prep time" value="34 min" trend="-4 min" />
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
