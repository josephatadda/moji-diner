"use client";

export function LoyaltySnapshot() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-gray-900">Loyalty Snapshot</h2>
        <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Enabled</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Orders with Loyalty", value: "71%" },
          { label: "Points Awarded",      value: "1,240" },
          { label: "Points Redeemed",     value: "320" },
          { label: "Top Customer",        value: "Chidi O. 🥇" },
        ].map((s) => (
          <div key={s.label} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
