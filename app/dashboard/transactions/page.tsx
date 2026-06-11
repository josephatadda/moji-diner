"use client";

import { ArrowDown } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { listPaymentsAction } from "@/app/(actions)/payments";
import {
  DashboardButton,
  DashboardEmptyState,
  DashboardFilterBar,
  DashboardPageHeader,
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
  const updateOrderStatus = useOrdersStore((state) => state.updateOrderStatus);
  const orders = useOrdersStore((state) => state.orders);

  // Extend mock data for a richer table, holding in component state for confirmation updates
  const [txns, setTxns] = useState<any[]>(() => [
    ...MOCK_TRANSACTIONS,
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
  ]);

  // Fetch live payment data on mount (falls back to mock if no DB)
  useEffect(() => {
    listPaymentsAction()
      .then((_result) => {
        // For now, mock data remains; once DB is connected the store will be updated
      })
      .catch(() => {});
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeMethod, setActiveMethod] = useState<
    "All" | "Card" | "Transfer" | "USSD"
  >("All");

  const handleConfirm = (txnId: string, orderId: string) => {
    setTxns((prev) =>
      prev.map((t) => (t.id === txnId ? { ...t, status: "success" } : t)),
    );
    updateOrderStatus(orderId, "paid");
    dashboardToast("Payment confirmed and order marked as paid", "success");
  };

  const handleReject = (txnId: string) => {
    setTxns((prev) =>
      prev.map((t) => (t.id === txnId ? { ...t, status: "failed" } : t)),
    );
    dashboardToast("Payment rejected", "error");
  };

  const filteredTxns = useMemo(() => {
    const matched = txns.filter((txn) => {
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

    // Sort based on status priority (Pending = 1, Success/Paid = 2, Failed = 3), then by latest date
    const statusPriority: Record<string, number> = {
      pending: 1,
      success: 2,
      failed: 3,
    };
    return [...matched].sort((a, b) => {
      if (statusPriority[a.status] !== statusPriority[b.status]) {
        return statusPriority[a.status] - statusPriority[b.status];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [txns, searchQuery, activeMethod]);

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
          <p className={ds.metric.value}>{txns.length}</p>
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
                // Fallback deterministic phone number if none is present
                const getFallbackPhone = (name: string) => {
                  const hash = name
                    .split("")
                    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  const lastDigits = String((hash % 9000000) + 1000000);
                  return `+234 80${lastDigits[0]} ${lastDigits.slice(1, 4)} ${lastDigits.slice(4)}`;
                };
                const phone =
                  order?.dinerPhone || getFallbackPhone(txn.dinerName);
                return (
                  <div>
                    <p className={t.bodyStrong}>{txn.dinerName}</p>
                    <p className={t.meta}>
                      {phone} · {timeLabel}
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
            {
              key: "actions",
              header: "Actions",
              headerClassName: "text-right",
              className: "text-right",
              render: (txn) => {
                if (txn.status === "pending") {
                  return (
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleConfirm(txn.id, txn.orderId)}
                        className="text-[11px] font-bold px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(txn.id)}
                        className="text-[11px] font-bold px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  );
                }
                return null;
              },
            },
          ]}
        />
      </div>
    </div>
  );
}
