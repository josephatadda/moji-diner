"use client";

import { ArrowRight, Trophy, Users } from "@phosphor-icons/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  DashboardEmptyState,
  DashboardFilterBar,
  DashboardPageHeader,
  DashboardSetupPrompt,
  DashboardStatusBadge,
  DashboardTable,
  ds,
  t,
} from "@/components/dashboard/ui";
import { formatPrice, MOCK_LOYALTY_PROFILES } from "@/lib/mockData";
import { useDashboardSettingsStore } from "@/store/dashboard-settings";

const TIER_TONE: Record<string, "orange" | "gray" | "green"> = {
  Bronze: "orange",
  Silver: "gray",
  Gold: "green",
};

const FILTERS = ["All", "Bronze", "Silver", "Gold"] as const;
type TierFilter = (typeof FILTERS)[number];

export default function CustomerListPage() {
  const loyaltyEnabled = useDashboardSettingsStore(
    (state) => state.features.loyalty,
  );
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TierFilter>("All");

  const filtered = useMemo(
    () =>
      MOCK_LOYALTY_PROFILES.filter((customer) => {
        const normalizedSearch = search.trim().toLowerCase();
        const matchesSearch =
          customer.phone.toLowerCase().includes(normalizedSearch) ||
          customer.tier.toLowerCase().includes(normalizedSearch);
        const matchesFilter = filter === "All" || customer.tier === filter;
        return matchesSearch && matchesFilter;
      }),
    [filter, search],
  );

  if (!loyaltyEnabled) {
    return (
      <DashboardSetupPrompt
        title="Loyalty is not enabled"
        description="Enable loyalty before viewing customer points, tiers, and visit history."
        featureLabel="loyalty"
        icon={Trophy}
      />
    );
  }

  return (
    <div className={ds.page}>
      <DashboardPageHeader
        title="Loyalty Members"
        description="Search customers, review points, and inspect visit history."
      />

      <DashboardFilterBar
        searchValue={search}
        searchPlaceholder="Search by phone or tier..."
        onSearchChange={setSearch}
        filters={FILTERS}
        activeFilter={filter}
        onFilterChange={setFilter}
        allLabel="All Members"
      />

      <div className="mt-5">
        <DashboardTable
          rows={filtered}
          getRowKey={(profile) => profile.phone}
          empty={
            <DashboardEmptyState
              icon={Users}
              title="No matching members"
              description="Try another phone number or loyalty tier."
            />
          }
          columns={[
            {
              key: "customer",
              header: "Customer",
              render: (profile) => (
                <div>
                  <p className={t.bodyStrong}>{profile.phone}</p>
                  <p className={t.meta}>Joined Jan 2026</p>
                </div>
              ),
            },
            {
              key: "tier",
              header: "Tier",
              render: (profile) => (
                <DashboardStatusBadge tone={TIER_TONE[profile.tier] ?? "gray"}>
                  {profile.tier}
                </DashboardStatusBadge>
              ),
            },
            {
              key: "points",
              header: "Points",
              headerClassName: "text-right",
              className: "text-right",
              render: (profile) => (
                <span className={t.number}>
                  {profile.totalPoints.toLocaleString()} pts
                </span>
              ),
            },
            {
              key: "spent",
              header: "Total spent",
              headerClassName: "text-right",
              className: "text-right",
              render: (profile) => formatPrice(profile.totalSpent),
            },
            {
              key: "visits",
              header: "Visits",
              headerClassName: "text-right",
              className: "text-right",
              render: (profile) => profile.totalVisits,
            },
            {
              key: "action",
              header: "",
              className: "text-right",
              render: (profile) => (
                <Link
                  href={`/dashboard/loyalty/customers/${profile.phone}`}
                  className={ds.btn.link}
                >
                  View
                  <ArrowRight size={13} />
                </Link>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
