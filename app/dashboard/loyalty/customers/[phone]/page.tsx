"use client";

import { useParams } from "next/navigation";
import { CaretLeft, Calendar, WhatsappLogo, PlusCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { MOCK_LOYALTY_PROFILES, MOCK_ORDERS, formatPrice } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const TIER_BADGE: Record<string, string> = {
  Gold:   "bg-yellow-100 text-yellow-700",
  Silver: "bg-gray-100 text-gray-600",
  Bronze: "bg-orange-100 text-orange-700",
};
const TIER_ICON: Record<string, string> = { Gold: "🥇", Silver: "🥈", Bronze: "🥉" };

export default function CustomerProfilePage() {
  const params = useParams();
  const phone = decodeURIComponent(params.phone as string);
  const profile = MOCK_LOYALTY_PROFILES.find((p) => p.phone === phone);

  if (!profile) {
    return (
      <div className="px-4 py-6 lg:px-8 max-w-[1200px] mx-auto">
        <p className="text-gray-500">Profile not found. <Link href="/dashboard/loyalty/customers" className="text-orange-500 hover:underline">Return to list</Link></p>
      </div>
    );
  }

  const customerOrders = MOCK_ORDERS.filter((o) => o.dinerPhone === phone || o.tableNumber === 1);

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/loyalty/customers" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <CaretLeft size={18} weight="bold" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{profile.phone}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold", TIER_BADGE[profile.tier])}>
              {TIER_ICON[profile.tier]} {profile.tier} Member
            </span>
            <span className="text-xs text-gray-400">First visit: Jan 12, 2026</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Stats + Actions */}
        <div className="space-y-3">
          {/* Stats */}
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
            {[
              { label: "Points", value: profile.totalPoints.toLocaleString() + " pts" },
              { label: "Visits",  value: String(profile.totalVisits) },
              { label: "Spent",   value: formatPrice(profile.totalSpent) },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
                <p className="text-xl font-bold text-gray-900 mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Actions</p>
            <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition-colors">
              <PlusCircle size={16} weight="bold" />
              Adjust Points
            </button>
            <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors">
              <WhatsappLogo size={16} weight="bold" />
              Send WhatsApp
            </button>
          </div>
        </div>

        {/* Right: Visit History */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-base font-bold text-gray-900">Visit History</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-4">Date</div>
              <div className="col-span-3">Order</div>
              <div className="col-span-3 text-right">Total</div>
              <div className="col-span-2 text-right">Points</div>
            </div>
            {customerOrders.map((order) => (
              <div key={order.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors">
                <div className="col-span-4 flex items-center gap-1.5 text-sm text-gray-600">
                  <Calendar size={14} />
                  {order.createdAt.toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                </div>
                <div className="col-span-3">
                  <p className="text-sm font-semibold text-gray-900">#{order.id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-gray-400">{order.items.length} items</p>
                </div>
                <div className="col-span-3 text-sm font-semibold text-gray-900 text-right">
                  {formatPrice(order.grandTotal)}
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    +{Math.floor(order.subtotal / 100)} pts
                  </span>
                </div>
              </div>
            ))}
            {customerOrders.length === 0 && (
              <div className="h-32 flex items-center justify-center">
                <p className="text-sm text-gray-400 font-medium">No orders on record for this customer</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
