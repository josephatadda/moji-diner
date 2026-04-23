"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS: Record<string, string> = {
  "Card":          "#111827",
  "Bank Transfer": "#16a34a",
  "USSD":          "#f97316",
  "Other":         "#9ca3af",
};

export function PaymentMethodChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 h-full">
      <h2 className="text-base font-bold text-gray-900 mb-4">Payment Methods</h2>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={COLORS[entry.name] ?? COLORS.Other} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
              formatter={(v) => [`${v}%`, "Share"]}
            />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: 16, fontSize: 13 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
