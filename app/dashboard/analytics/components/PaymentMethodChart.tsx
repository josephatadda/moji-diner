"use client";

import { Cell, Legend, Pie, PieChart, Tooltip } from "recharts";
import { MeasuredChartFrame } from "./MeasuredChartFrame";

const COLORS: Record<string, string> = {
  Card: "#111827",
  "Bank Transfer": "#16a34a",
  USSD: "#f97316",
  Other: "#9ca3af",
};

export function PaymentMethodChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <div className="h-full min-w-0 rounded-2xl border border-gray-100 bg-white p-5">
      <h2 className="text-base font-bold text-gray-900 mb-4">
        Payment Methods
      </h2>
      <MeasuredChartFrame className="h-60 min-w-0 w-full">
        {({ width, height }) => (
          <PieChart width={width} height={height}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[entry.name] ?? COLORS.Other}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(v) => [`${v}%`, "Share"]}
            />
            <Legend
              iconType="circle"
              wrapperStyle={{ paddingTop: 16, fontSize: 13 }}
            />
          </PieChart>
        )}
      </MeasuredChartFrame>
    </div>
  );
}
