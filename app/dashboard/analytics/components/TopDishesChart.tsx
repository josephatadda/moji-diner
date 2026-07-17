"use client";

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { MeasuredChartFrame } from "./MeasuredChartFrame";

export function TopDishesChart({
  data,
}: {
  data: { name: string; sales: number }[];
}) {
  return (
    <div className="h-full min-w-0 rounded-2xl border border-gray-100 bg-white p-5">
      <h2 className="text-base font-bold text-gray-900 mb-4">Top Dishes</h2>
      <MeasuredChartFrame className="h-72 min-w-0 w-full">
        {({ width, height }) => (
          <BarChart
            width={width}
            height={height}
            data={data}
            layout="vertical"
            margin={{ left: -20, right: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="#f3f4f6"
            />
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              width={130}
            />
            <Tooltip
              cursor={{ fill: "#f9fafb" }}
              contentStyle={{
                borderRadius: 12,
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(v) => [Number(v), "Orders"]}
            />
            <Bar
              dataKey="sales"
              fill="#f97316"
              radius={[0, 6, 6, 0]}
              barSize={18}
            />
          </BarChart>
        )}
      </MeasuredChartFrame>
    </div>
  );
}
