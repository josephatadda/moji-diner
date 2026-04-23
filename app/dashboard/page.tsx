import React from "react";
import Link from "next/link";
import {
  HandWaving, ClipboardText, CurrencyCircleDollar, ForkKnife,
  DeviceMobile, PencilSimple, QrCode, ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import { MOCK_RESTAURANT, MOCK_ORDERS, MOCK_MENU, MOCK_TRANSACTIONS, type PaymentMethod } from "@/lib/mockData";
import { ds, t } from "@/lib/design-tokens";

export const metadata = { title: "Dashboard" };

function StatCard({
  label, value, sub, icon, accent = false
}: {
  label: string; value: string; sub: string; icon: React.ReactNode; accent?: boolean
}) {
  return (
    <div className={ds.metric.card}>
      <div className={ds.metric.header}>
        <p className={ds.metric.label}>{label}</p>
        <span className={accent ? ds.metric.iconAccent : ds.metric.iconMuted}>{icon}</span>
      </div>
      <div>
        <p className={ds.metric.value}>{value}</p>
        <p className={ds.metric.sub}>{sub}</p>
      </div>
    </div>
  );
}

const METHOD_LABEL: Record<PaymentMethod, string> = {
  card: "Card", bank_transfer: "Transfer", ussd: "USSD", cash: "Cash",
};
const METHOD_COLOR = ds.badge.method;
const STATUS_COLOR  = ds.badge.status;
const STATUS_LABEL: Record<string, string> = {
  pending: "Pending", in_kitchen: "In kitchen", ready: "Ready", served: "Served", paid: "Paid",
};

export default function DashboardPage() {
  const activeOrders = MOCK_ORDERS.filter(
    (o) => o.status !== "served" && o.status !== "paid"
  ).length;
  const totalItems = MOCK_MENU.reduce((s, c) => s + c.items.length, 0);
  const todayRevenue = MOCK_ORDERS
    .filter((o) => o.status === "served" || o.status === "paid")
    .reduce((s, o) => s + o.grandTotal, 0);

  return (
    <div className={`${ds.page}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`${t.h1} flex items-center gap-2`}>
          Good morning
          <HandWaving className="text-orange-400" weight="fill" size={22} />
        </h1>
        <p className={`${t.body} mt-1`}>
          {MOCK_RESTAURANT.name} · {MOCK_RESTAURANT.city}
        </p>
      </div>

      {/* Accepting orders banner */}
      <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-2xl px-5 py-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-none" />
          <div>
            <p className="font-semibold text-green-800 text-sm">Accepting orders</p>
            <p className="text-xs text-green-600 mt-0.5">Diners can scan and order right now</p>
          </div>
        </div>
        <button className="text-xs font-semibold text-green-700 bg-green-100 hover:bg-green-200 px-3 py-1.5 rounded-lg transition-colors">
          Pause
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 mb-6 lg:grid-cols-4">
        <StatCard
          label="Active orders"
          value={String(activeOrders)}
          sub="right now"
          icon={<ClipboardText size={18} />}
          accent
        />
        <StatCard
          label="Today's revenue"
          value={`₦${todayRevenue.toLocaleString()}`}
          sub="from served orders"
          icon={<CurrencyCircleDollar size={18} />}
          accent
        />
        <StatCard
          label="Menu items"
          value={String(totalItems)}
          sub={`${MOCK_MENU.length} categories`}
          icon={<ForkKnife size={18} />}
        />
        <StatCard
          label="Tables"
          value="6"
          sub="2 occupied"
          icon={<DeviceMobile size={18} />}
        />
      </div>

      {/* Recent orders + transactions — side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">

        {/* Recent orders */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-zinc-900">Recent orders</h2>
            <Link
              href="/dashboard/orders"
              className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {MOCK_ORDERS.slice(0, 4).map((order) => (
              <div key={order.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-zinc-900 text-sm">Table {order.tableNumber}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[order.status]}`}>
                      {STATUS_LABEL[order.status]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""} ·{" "}
                    {Math.floor((Date.now() - order.createdAt.getTime()) / 60000)} min ago
                  </p>
                </div>
                <p className="font-bold text-zinc-900 text-sm [font-variant-numeric:tabular-nums]">
                  ₦{order.grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent transactions */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-zinc-900">Recent transactions</h2>
            <Link
              href="/dashboard/analytics"
              className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {MOCK_TRANSACTIONS.map((txn) => {
              const ageMin = Math.floor((Date.now() - txn.createdAt.getTime()) / 60000);
              const ageLabel = ageMin < 60 ? `${ageMin}m ago` : `${Math.floor(ageMin / 60)}h ago`;
              return (
                <div key={txn.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-zinc-900">Table {txn.tableNumber}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${METHOD_COLOR[txn.method]}`}>
                        {METHOD_LABEL[txn.method]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{txn.dinerName} · {ageLabel}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold [font-variant-numeric:tabular-nums] ${
                      txn.status === "failed" ? "text-red-500" : "text-zinc-900"
                    }`}>
                      {txn.status === "failed" ? "−" : "+"}₦{txn.amount.toLocaleString()}
                    </p>
                    {txn.status === "failed" && (
                      <p className="text-[10px] text-red-400 font-medium mt-0.5">Failed</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Quick actions */}
      <h2 className="text-sm font-semibold text-zinc-900 mb-3">Quick actions</h2>
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/dashboard/menu"
          className="group bg-white border border-gray-100 rounded-2xl p-5 hover:border-orange-200 transition-all duration-200"
        >
          <span className="text-xl text-orange-500 mb-3 block">
            <PencilSimple weight="duotone" />
          </span>
          <p className="font-semibold text-zinc-900 text-sm">Edit menu</p>
          <p className="text-xs text-gray-400 mt-0.5">Add or update items</p>
        </Link>
        <Link
          href="/dashboard/tables"
          className="group bg-white border border-gray-100 rounded-2xl p-5 hover:border-blue-200 transition-all duration-200"
        >
          <span className="text-xl text-blue-500 mb-3 block">
            <QrCode weight="duotone" />
          </span>
          <p className="font-semibold text-zinc-900 text-sm">QR codes</p>
          <p className="text-xs text-gray-400 mt-0.5">Download table codes</p>
        </Link>
      </div>
    </div>
  );
}
