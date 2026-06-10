"use client";

import { Export } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { getDashboardAnalyticsAction } from "@/app/(actions)/analytics";
import {
  DashboardButton,
  DashboardField,
  DashboardInput,
  DashboardModal,
  DashboardPageHeader,
  DashboardSelect,
  DashboardSetupPrompt,
  dashboardToast,
} from "@/components/dashboard/ui";
import { ds } from "@/components/dashboard/ui/dashboard-tokens";
import { MetricCard } from "@/components/dashboard/ui/MetricCard";
import { formatPrice, MOCK_ANALYTICS } from "@/lib/mockData";
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
  const [analytics, setAnalytics] = useState(MOCK_ANALYTICS);

  // Fetch live analytics when the component mounts (falls back to mock if no DB)
  useEffect(() => {
    getDashboardAnalyticsAction()
      .then((result) => {
        if (result.ok && result.data.analytics) {
          setAnalytics(result.data.analytics);
        }
      })
      .catch(() => {
        // Silently keep mock data on error
      });
  }, []);
  const [isCustomRangeModalOpen, setIsCustomRangeModalOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");

  const handleApplyRange = () => {
    if (!tempStartDate || !tempEndDate) {
      dashboardToast("Please select both start and end dates", "error");
      return;
    }
    if (new Date(tempStartDate) > new Date(tempEndDate)) {
      dashboardToast("Start date cannot be after end date", "error");
      return;
    }
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setIsCustomRangeModalOpen(false);
  };

  const descriptionText =
    range === "Custom" && startDate && endDate
      ? `Performance metrics for ${new Date(startDate).toLocaleDateString(
          undefined,
          {
            month: "short",
            day: "numeric",
            year: "numeric",
          },
        )} - ${new Date(endDate).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}.`
      : `Performance metrics for ${range.toLowerCase()}.`;

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
        description={descriptionText}
        actions={
          <div className="flex items-center gap-2">
            {/* Range selector */}
            <DashboardSelect
              value={range}
              onChange={(e) => {
                const val = e.target.value;
                setRange(val);
                if (val === "Custom") {
                  setTempStartDate(startDate);
                  setTempEndDate(endDate);
                  setIsCustomRangeModalOpen(true);
                }
              }}
              className="w-40"
            >
              {RANGES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </DashboardSelect>
            <DashboardButton
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
        <TopDishesChart data={analytics.topDishes} />
        <PaymentMethodChart data={analytics.paymentMethods} />
      </div>

      {/* Revenue trend */}
      <div className="mb-4">
        <RevenueByHourChart data={analytics.revenueTrend} />
      </div>

      <LoyaltySnapshot />

      {/* Custom Date Range Picker Modal */}
      <DashboardModal
        open={isCustomRangeModalOpen}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setIsCustomRangeModalOpen(false);
            if (!startDate || !endDate) {
              setRange("Today");
            }
          }
        }}
        title="Select Date Range"
        description="Choose a custom start and end date for analytics."
        maxWidth="sm"
        footer={
          <div className="flex justify-end gap-2">
            <DashboardButton
              variant="ghost"
              onClick={() => {
                setIsCustomRangeModalOpen(false);
                if (!startDate || !endDate) {
                  setRange("Today");
                }
              }}
            >
              Cancel
            </DashboardButton>
            <DashboardButton onClick={handleApplyRange}>
              Apply Range
            </DashboardButton>
          </div>
        }
      >
        <div className="space-y-4">
          <DashboardField id="start-date" label="Start Date">
            <DashboardInput
              id="start-date"
              type="date"
              value={tempStartDate}
              onChange={(e) => setTempStartDate(e.target.value)}
              className="w-full"
            />
          </DashboardField>
          <DashboardField id="end-date" label="End Date">
            <DashboardInput
              id="end-date"
              type="date"
              value={tempEndDate}
              onChange={(e) => setTempEndDate(e.target.value)}
              className="w-full"
            />
          </DashboardField>
        </div>
      </DashboardModal>
    </div>
  );
}
