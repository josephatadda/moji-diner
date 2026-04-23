import { cn } from "@/lib/utils";
import { type IconProps } from "@phosphor-icons/react";
import { TrendUp, TrendDown } from "@phosphor-icons/react";
import React from "react";

interface MetricCardProps {
  label: string;
  value: string;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ComponentType<IconProps>;
  className?: string;
}

export function MetricCard({ label, value, subtext, trend, icon: Icon, className }: MetricCardProps) {
  return (
    <div className={cn("bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md", className)}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-xl bg-gray-50 text-gray-900 border border-gray-100">
          <Icon size={24} weight="regular" />
        </div>
        {trend && trend !== "neutral" && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
            trend === "up" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
          )}>
            {trend === "up" ? <TrendUp weight="bold" /> : <TrendDown weight="bold" />}
            {subtext}
          </div>
        )}
      </div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
