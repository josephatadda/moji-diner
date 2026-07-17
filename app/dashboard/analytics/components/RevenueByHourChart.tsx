"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPrice } from "@/lib/mockData";
import { MeasuredChartFrame } from "./MeasuredChartFrame";

export function RevenueByHourChart({
  data,
}: {
  data: { date: string; revenue: number }[];
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-5">
      <h2 className="text-base font-bold text-gray-900 mb-4">Revenue Trend</h2>
      <MeasuredChartFrame className="h-72 min-w-0 w-full">
        {({ width, height }) => (
          <AreaChart
            width={width}
            height={height}
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f3f4f6"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              tickFormatter={(v) => `₦${v / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(v) => [formatPrice(Number(v)), "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#f97316"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#revenueGrad)"
            />
          </AreaChart>
        )}
      </MeasuredChartFrame>
    </div>
  );
}
