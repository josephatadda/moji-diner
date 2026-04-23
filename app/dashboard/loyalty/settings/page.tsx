"use client";

import { useState } from "react";
import { CaretLeft, Info } from "@phosphor-icons/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LoyaltySettingsPage() {
  const [enabled,          setEnabled]          = useState(true);
  const [pointsRate,       setPointsRate]       = useState(1);
  const [silverThreshold,  setSilverThreshold]  = useState(500);
  const [goldThreshold,    setGoldThreshold]    = useState(2000);

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/loyalty" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <CaretLeft size={18} weight="bold" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loyalty Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure earning rates and tier thresholds</p>
        </div>
      </div>

      <div className="max-w-xl space-y-4">
        {/* Enable toggle */}
        <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl p-5">
          <div>
            <p className="font-semibold text-gray-900 text-sm">Loyalty Program</p>
            <p className="text-xs text-gray-400 mt-0.5">Enable or disable rewards for customers</p>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={cn(
              "w-12 h-6 rounded-full flex items-center px-1 transition-colors",
              enabled ? "bg-green-500 justify-end" : "bg-gray-200 justify-start"
            )}
          >
            <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
          </button>
        </div>

        {enabled && (
          <>
            {/* Earning rate */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Earning Rate</p>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Points per ₦100 spent</p>
                  <p className="text-xs text-gray-400 mt-0.5">e.g. 1 pt = ₦100</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={pointsRate}
                    onChange={(e) => setPointsRate(Number(e.target.value))}
                    className="w-16 px-3 py-1.5 text-center text-sm font-bold bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    min={1}
                  />
                  <span className="text-sm text-gray-400">pts</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  Changing the rate only applies to future orders — existing points are unaffected.
                </p>
              </div>
            </div>

            {/* Tier thresholds */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tier Thresholds</p>

              {[
                { icon: "🥈", label: "Silver threshold", value: silverThreshold, onChange: setSilverThreshold },
                { icon: "🥇", label: "Gold threshold",   value: goldThreshold,   onChange: setGoldThreshold },
              ].map((tier) => (
                <div key={tier.label} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{tier.icon}</span>
                    <p className="text-sm font-semibold text-gray-900">{tier.label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={tier.value}
                      onChange={(e) => tier.onChange(Number(e.target.value))}
                      className="w-20 px-3 py-1.5 text-center text-sm font-bold bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                      min={0}
                    />
                    <span className="text-sm text-gray-400">pts</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <button className="w-full py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition-colors active:scale-[0.97] ease-out">
          Save Settings
        </button>
      </div>
    </div>
  );
}
