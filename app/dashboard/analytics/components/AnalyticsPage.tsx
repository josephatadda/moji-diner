"use client";

import { Export } from "@phosphor-icons/react";
import { useState } from "react";
import {
  DashboardButton,
  DashboardPageHeader,
  DashboardSetupPrompt,
  dashboardToast,
} from "@/components/dashboard/ui";
import { ds } from "@/components/dashboard/ui/dashboard-tokens";
import { MetricCard } from "@/components/dashboard/ui/MetricCard";
import { formatPrice, MOCK_ANALYTICS } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { useDashboardSettingsStore } from "@/store/dashboard-settings";
import { LoyaltySnapshot } from "./LoyaltySnapshot";
import { PaymentMethodChart } from "./PaymentMethodChart";
import { RevenueByHourChart } from "./RevenueByHourChart";
import { TopDishesChart } from "./TopDishesChart";

const RANGES = ["Today", "Yesterday", "Last 7 days", "Last 30 days", "Custom"];

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
      <DashboardPageHeader
        title="Analytics"
        description={`Performance metrics for ${range.toLowerCase()}.`}
        actions={
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
            <DashboardButton
              variant="ghost"
              className="hidden lg:inline-flex"
              onClick={() =>
                dashboardToast(
                  "Analytics export is mocked in this preview",
                  "info",
                )
              }
            >
              <Export size={15} />
              Export
            </DashboardButton>
          </div>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <MetricCard
          label="Total revenue"
          value={formatPrice(42500)}
          trend="+12%"
          sub="vs yesterday"
        />
        <MetricCard
          label="Total orders"
          value="128"
          trend="+8%"
          sub="vs yesterday"
        />
        <MetricCard
          label="Avg. order value"
          value={formatPrice(3320)}
          trend="-2%"
          sub="vs yesterday"
        />
        <MetricCard
          label="Avg. prep time"
          value="34 min"
          trend="-4 min"
          trendPositive
          sub="vs yesterday"
        />
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
