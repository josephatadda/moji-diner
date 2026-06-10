"use client";

import { ArrowDown } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { listPaymentsAction } from "@/app/(actions)/payments";
import {
  DashboardButton,
  DashboardEmptyState,
  DashboardFilterBar,
  DashboardPageHeader,
  DashboardSetupPrompt,
  DashboardStatusBadge,
  DashboardTable,
  dashboardToast,
  ds,
  t,
} from "@/components/dashboard/ui";
import {
  formatPrice,
  MOCK_TRANSACTIONS,
  type PaymentMethod,
} from "@/lib/mockData";
import { useDashboardSettingsStore } from "@/store/dashboard-settings";
import { useOrdersStore } from "@/store/orders";

function StatusBadge({ status }: { status: "success" | "failed" | "pending" }) {
  const label = { success: "Paid", failed: "Failed", pending: "Pending" };
  const tone = { success: "green", failed: "red", pending: "orange" } as const;
  return (
    <DashboardStatusBadge tone={tone[status]}>
      {label[status]}
    </DashboardStatusBadge>
  );
}

export default function TransactionsPage() {
  const paymentsEnabled = useDashboardSettingsStore(
    (state) => state.features.payments,
  );
  const orders = useOrdersStore((state) => state.orders);

  // Extend mock data for a richer table (computed once on mount)
  const allTxns = useMemo(
    () => [
      ...MOCK_TRANSACTIONS,
      // Extra rows for a useful demo
      {
        id: "txn-006",
        orderId: "ord-008",
        tableNumber: 5,
        dinerName: "Ngozi Eze",
        amount: 5400,
        method: "card" as PaymentMethod,
        status: "success" as const,
        reference: "MJI-CC4491",
        createdAt: new Date(Date.now() - 1000 * 60 * 145),
      },
      {
        id: "txn-007",
        orderId: "ord-009",
        tableNumber: 2,
        dinerName: "Biodun Sule",
        amount: 8900,
        method: "bank_transfer" as PaymentMethod,
        status: "success" as const,
        reference: "MJI-AA2287",
        createdAt: new Date(Date.now() - 1000 * 60 * 200),
      },
      {
        id: "txn-008",
        orderId: "ord-010",
        tableNumber: 1,
        dinerName: "Fatima Yusuf",
        amount: 12300,
        method: "ussd" as PaymentMethod,
        status: "pending" as const,
        reference: "MJI-BB3312",
        createdAt: new Date(Date.now() - 1000 * 60 * 240),
      },
    ],
    [],
  );

  // Fetch live payment data on mount (falls back to mock if no DB)
  useEffect(() => {
    listPaymentsAction()
      .then((_result) => {
        // For now, mock data remains; once DB is connected the store will be updated
        // This primes the pattern for full wiring in a later iteration
      })
      .catch(() => {});
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeMethod, setActiveMethod] = useState<
    "All" | "Card" | "Transfer" | "USSD"
  >("All");

  const filteredTxns = useMemo(() => {
    return allTxns.filter((txn) => {
      const matchesSearch =
        txn.dinerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.reference.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMethod =
        activeMethod === "All" ||
        (activeMethod === "Card" && txn.method === "card") ||
        (activeMethod === "Transfer" && txn.method === "bank_transfer") ||
        (activeMethod === "USSD" && txn.method === "ussd");
      return matchesSearch && matchesMethod;
    });
  }, [allTxns, searchQuery, activeMethod]);

  if (!paymentsEnabled) {
    return (
      <DashboardSetupPrompt
        title="Payments are not configured"
        description="Enable payments to track card, transfer, USSD, and cash activity from diner bills."
        featureLabel="payments"
        icon={ArrowDown}
      />
    );
  }

  const totalRevenue = filteredTxns
    .filter((t) => t.status === "success")
    .reduce((s, t) => s + t.amount, 0);
  const successCount = filteredTxns.filter(
    (t) => t.status === "success",
  ).length;
  const failedCount = filteredTxns.filter((t) => t.status === "failed").length;

  return (
    <div className={`${ds.page} space-y-6`}>
      <DashboardPageHeader
        title="Transactions"
        description="All payment activity for today."
        actions={
          <DashboardButton
            variant="ghost"
            onClick={() =>
              dashboardToast("CSV export is mocked in this preview", "info")
            }
          >
            <ArrowDown size={15} />
            Export CSV
          </DashboardButton>
        }
      />

      {/* Summary metric cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className={ds.metric.card}>
          <p className={ds.metric.label}>Total collected</p>
          <p className={ds.metric.value}>{formatPrice(totalRevenue)}</p>
          <p className={ds.metric.sub}>{successCount} paid transactions</p>
        </div>
        <div className={ds.metric.card}>
          <p className={ds.metric.label}>Transactions</p>
          <p className={ds.metric.value}>{allTxns.length}</p>
          <p className={ds.metric.sub}>across all payment methods</p>
        </div>
        <div className={ds.metric.card}>
          <p className={ds.metric.label}>Failed</p>
          <p
            className={`${ds.metric.value} ${failedCount > 0 ? "text-red-500" : ""}`}
          >
            {failedCount}
          </p>
          <p className={ds.metric.sub}>needs attention</p>
        </div>
      </div>

      <DashboardFilterBar
        searchValue={searchQuery}
        searchPlaceholder="Search by name or reference..."
        onSearchChange={setSearchQuery}
        filters={["All", "Card", "Transfer", "USSD"] as const}
        activeFilter={activeMethod}
        onFilterChange={setActiveMethod}
        allLabel="All Transactions"
      />

      <div className={ds.card.base}>
        <DashboardTable
          rows={filteredTxns}
          getRowKey={(txn) => txn.id}
          className="rounded-none border-0"
          empty={
            <DashboardEmptyState
              icon={ArrowDown}
              title="No transactions found"
              description="Try a different search or payment method."
            />
          }
          columns={[
            {
              key: "customer",
              header: "Customer",
              render: (txn) => {
                const ageMin = Math.floor(
                  (Date.now() - txn.createdAt.getTime()) / 60000,
                );
                const timeLabel =
                  ageMin < 60
                    ? `${ageMin}m ago`
                    : `${Math.floor(ageMin / 60)}h ago`;
                const order = orders.find((o) => o.id === txn.orderId);
                const phone = order?.dinerPhone;
                return (
                  <div>
                    <p className={t.bodyStrong}>{txn.dinerName}</p>
                    <p className={t.meta}>
                      {phone ? `${phone} · ` : ""}
                      {timeLabel}
                    </p>
                  </div>
                );
              },
            },
            {
              key: "reference",
              header: "Reference",
              render: (txn) => <span className={t.mono}>{txn.reference}</span>,
            },
            {
              key: "date_time",
              header: "Date & Time",
              render: (txn) => {
                const dateStr = txn.createdAt.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                const timeStr = txn.createdAt.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <div>
                    <p className="font-medium text-gray-900">{dateStr}</p>
                    <p className="text-xs text-gray-400">{timeStr}</p>
                  </div>
                );
              },
            },
            {
              key: "table",
              header: "Table",
              headerClassName: "text-center",
              className: "text-center",
              render: (txn) => (
                <span className={t.number}>{txn.tableNumber}</span>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (txn) => <StatusBadge status={txn.status} />,
            },
            {
              key: "amount",
              header: "Amount",
              headerClassName: "text-right",
              className: "text-right",
              render: (txn) => (
                <span
                  className={`${t.number} ${
                    txn.status === "failed" ? "text-red-500" : ""
                  }`}
                >
                  {txn.status === "failed" ? "−" : "+"}₦
                  {txn.amount.toLocaleString()}
                </span>
              ),
            },
          ]}
        />
        <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
          <p className={t.meta}>{filteredTxns.length} transactions</p>
          <p className="text-xs font-semibold text-gray-900">
            Total: {formatPrice(totalRevenue)}
          </p>
        </div>
      </div>
    </div>
  );
}
