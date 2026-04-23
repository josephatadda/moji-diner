"use client";

import { useState } from "react";
import { MagnifyingGlass, ArrowRight, CaretLeft } from "@phosphor-icons/react";
import Link from "next/link";
import { MOCK_LOYALTY_PROFILES, formatPrice } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const TIER_BADGE: Record<string, string> = {
  Gold:   "bg-yellow-100 text-yellow-700",
  Silver: "bg-gray-100 text-gray-600",
  Bronze: "bg-orange-100 text-orange-700",
};
const TIER_ICON: Record<string, string> = { Gold: "🥇", Silver: "🥈", Bronze: "🥉" };

export default function CustomerListPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = MOCK_LOYALTY_PROFILES.filter((c) => {
    const matchSearch = c.phone.includes(search);
    const matchFilter = filter === "All" || c.tier === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-[1200px] mx-auto w-full">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/loyalty" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <CaretLeft size={18} weight="bold" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loyalty Members</h1>
          <p className="text-sm text-gray-500 mt-1">Searchable customer database with visit history</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
          />
        </div>
        <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 gap-1">
          {["All", "Bronze", "Silver", "Gold"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors",
                filter === t ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white border border-gray-100 rounded-2xl overflow-hidden mb-4">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-4">Customer</div>
          <div className="col-span-2">Tier</div>
          <div className="col-span-2 text-right">Points</div>
          <div className="col-span-2 text-right">Total Spent</div>
          <div className="col-span-1 text-right">Visits</div>
          <div className="col-span-1" />
        </div>
        <div className="divide-y divide-gray-100">
          {filtered.map((profile) => (
            <div key={profile.phone} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors">
              <div className="col-span-4">
                <p className="font-semibold text-gray-900 text-sm">{profile.phone}</p>
                <p className="text-xs text-gray-400">Joined Jan 2026</p>
              </div>
              <div className="col-span-2">
                <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold", TIER_BADGE[profile.tier])}>
                  {TIER_ICON[profile.tier]} {profile.tier}
                </span>
              </div>
              <div className="col-span-2 text-sm font-semibold text-gray-900 text-right">
                {profile.totalPoints.toLocaleString()} pts
              </div>
              <div className="col-span-2 text-sm text-gray-700 text-right">
                {formatPrice(profile.totalSpent)}
              </div>
              <div className="col-span-1 text-sm text-gray-700 text-right">
                {profile.totalVisits}
              </div>
              <div className="col-span-1 flex justify-end">
                <Link
                  href={`/dashboard/loyalty/customers/${profile.phone}`}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg transition-colors border border-transparent hover:border-gray-300"
                >
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Card Stack */}
      <div className="lg:hidden space-y-3">
        {filtered.map((profile) => (
          <div key={profile.phone} className="bg-white border border-gray-100 rounded-2xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{profile.phone}</p>
                <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mt-1", TIER_BADGE[profile.tier])}>
                  {TIER_ICON[profile.tier]} {profile.tier}
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900">{profile.totalPoints.toLocaleString()} pts</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
              <span>{formatPrice(profile.totalSpent)} total · {profile.totalVisits} visits</span>
              <Link
                href={`/dashboard/loyalty/customers/${profile.phone}`}
                className="flex items-center gap-1 font-semibold text-orange-500 hover:text-orange-600 transition-colors"
              >
                View Profile <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="h-40 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl">
          <p className="text-sm text-gray-400 font-medium">No customers match your search</p>
        </div>
      )}
    </div>
  );
}
