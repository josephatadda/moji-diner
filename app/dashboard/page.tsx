"use client";

import {
  ArrowRight,
  ClipboardText,
  CurrencyCircleDollar,
  DeviceMobile,
  ForkKnife,
  HandWaving,
  PencilSimple,
  QrCode,
} from "@phosphor-icons/react";
import Link from "next/link";
import { ds, t } from "@/components/dashboard/ui/dashboard-tokens";
import { MetricCard } from "@/components/dashboard/ui/MetricCard";
import {
  MOCK_ORDERS,
  MOCK_TRANSACTIONS,
  type PaymentMethod,
} from "@/lib/mockData";
import { useDashboardSettingsStore } from "@/store/dashboard-settings";
import { useMenuStore } from "@/store/menu";
import { useOrdersStore } from "@/store/orders";

const METHOD_LABEL: Record<PaymentMethod, string> = {
  card: "Card",
  bank_transfer: "Transfer",
  ussd: "USSD",
  cash: "Cash",
};
const METHOD_COLOR = ds.badge.method;
const STATUS_COLOR = ds.badge.status;
const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  in_kitchen: "In kitchen",
  ready: "Ready",
  served: "Served",
  paid: "Paid",
};

export default function DashboardPage() {
  const menuCategories = useMenuStore((state) => state.categories);
  const profile = useDashboardSettingsStore((state) => state.profile);
  const dashboardOrders = useOrdersStore((state) => state.orders);
  const orders = dashboardOrders.length ? dashboardOrders : MOCK_ORDERS;
  const activeOrders = orders.filter(
    (o) => o.status !== "served" && o.status !== "paid",
  ).length;
  const totalItems = menuCategories.reduce((s, c) => s + c.items.length, 0);
  const todayRevenue = orders
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
          {profile.name} · {profile.city}
        </p>
      </div>

      {/* Accepting orders banner */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-gray-50 text-green-600">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">
                Diner ordering is live
              </p>
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
                Accepting orders
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-500">
              QR menu and table orders are available to guests.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="h-8 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          Pause orders
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 mb-6 lg:grid-cols-4">
        <MetricCard
          label="Active orders"
          value={String(activeOrders)}
          sub="right now"
          icon={<ClipboardText size={18} />}
        />
        <MetricCard
          label="Today's revenue"
          value={`₦${todayRevenue.toLocaleString()}`}
          sub="from served orders"
          icon={<CurrencyCircleDollar size={18} />}
        />
        <MetricCard
          label="Menu items"
          value={String(totalItems)}
          sub={`${menuCategories.length} categories`}
          icon={<ForkKnife size={18} />}
        />
        <MetricCard
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
            <h2 className={t.h4}>Recent orders</h2>
            <Link
              href="/dashboard/orders"
              className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {orders.slice(0, 4).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between px-5 py-3.5"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 text-sm">
                      Table {order.tableNumber}
                    </p>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[order.status]}`}
                    >
                      {STATUS_LABEL[order.status]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {order.items.length} item
                    {order.items.length !== 1 ? "s" : ""} ·{" "}
                    {Math.floor(
                      (Date.now() - order.createdAt.getTime()) / 60000,
                    )}{" "}
                    min ago
                  </p>
                </div>
                <p className={t.price}>
                  ₦
                  {order.grandTotal.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent transactions */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-50">
            <h2 className={t.h4}>Recent transactions</h2>
            <Link
              href="/dashboard/analytics"
              className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {MOCK_TRANSACTIONS.map((txn) => {
              const ageMin = Math.floor(
                (Date.now() - txn.createdAt.getTime()) / 60000,
              );
              const ageLabel =
                ageMin < 60
                  ? `${ageMin}m ago`
                  : `${Math.floor(ageMin / 60)}h ago`;
              return (
                <div
                  key={txn.id}
                  className="flex items-center justify-between px-5 py-3.5"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">
                        Table {txn.tableNumber}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${METHOD_COLOR[txn.method]}`}
                      >
                        {METHOD_LABEL[txn.method]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {txn.dinerName} · {ageLabel}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold [font-variant-numeric:tabular-nums] ${
                        txn.status === "failed"
                          ? "text-red-500"
                          : "text-gray-900"
                      }`}
                    >
                      {txn.status === "failed" ? "−" : "+"}₦
                      {txn.amount.toLocaleString()}
                    </p>
                    {txn.status === "failed" && (
                      <p className="text-[10px] text-red-400 font-medium mt-0.5">
                        Failed
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <h2 className={`${t.h4} mb-3`}>Quick actions</h2>
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/dashboard/menu"
          className="group bg-white border border-gray-100 rounded-2xl p-5 hover:border-orange-200 transition-all duration-200"
        >
          <span className="text-xl text-orange-500 mb-3 block">
            <PencilSimple weight="duotone" />
          </span>
          <p className="font-semibold text-gray-900 text-sm">Edit menu</p>
          <p className="text-xs text-gray-400 mt-0.5">Add or update items</p>
        </Link>
        <Link
          href="/dashboard/tables"
          className="group bg-white border border-gray-100 rounded-2xl p-5 hover:border-blue-200 transition-all duration-200"
        >
          <span className="text-xl text-blue-500 mb-3 block">
            <QrCode weight="duotone" />
          </span>
          <p className="font-semibold text-gray-900 text-sm">QR codes</p>
          <p className="text-xs text-gray-400 mt-0.5">Download table codes</p>
        </Link>
      </div>
    </div>
  );
}
