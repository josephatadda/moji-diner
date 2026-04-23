"use client";

import { useState, useMemo } from "react";
import { ArrowLeft, ArrowDown, MagnifyingGlass } from "@phosphor-icons/react";
import Link from "next/link";
import { MOCK_TRANSACTIONS, formatPrice, type PaymentMethod } from "@/lib/mockData";
import { ds, t } from "@/lib/design-tokens";

const METHOD_LABEL: Record<PaymentMethod, string> = {
  card: "Card", bank_transfer: "Transfer", ussd: "USSD", cash: "Cash",
};

function StatusBadge({ status }: { status: "success" | "failed" | "pending" }) {
  const map = {
    success: `${ds.badge.base} ${ds.badge.green}`,
    failed:  `${ds.badge.base} ${ds.badge.red}`,
    pending: `${ds.badge.base} ${ds.badge.orange}`,
  };
  const label = { success: "Paid", failed: "Failed", pending: "Pending" };
  return <span className={map[status]}>{label[status]}</span>;
}

function MethodBadge({ method }: { method: PaymentMethod }) {
  return (
    <span className={`${ds.badge.base} ${ds.badge.method[method]}`}>
      {METHOD_LABEL[method]}
    </span>
  );
}

export default function TransactionsPage() {
  // Extend mock data for a richer table
  const allTxns = [
    ...MOCK_TRANSACTIONS,
    // Extra rows for a useful demo
    { id: "txn-006", orderId: "ord-008", tableNumber: 5, dinerName: "Ngozi Eze",     amount: 5400,  method: "card"          as PaymentMethod, status: "success" as const, reference: "MJI-CC4491", createdAt: new Date(Date.now() - 1000*60*145) },
    { id: "txn-007", orderId: "ord-009", tableNumber: 2, dinerName: "Biodun Sule",   amount: 8900,  method: "bank_transfer"  as PaymentMethod, status: "success" as const, reference: "MJI-AA2287", createdAt: new Date(Date.now() - 1000*60*200) },
    { id: "txn-008", orderId: "ord-010", tableNumber: 1, dinerName: "Fatima Yusuf",  amount: 12300, method: "ussd"           as PaymentMethod, status: "pending" as const, reference: "MJI-BB3312", createdAt: new Date(Date.now() - 1000*60*240) },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [activeMethod, setActiveMethod] = useState<"All" | "Card" | "Transfer" | "USSD">("All");

  const filteredTxns = useMemo(() => {
    return allTxns.filter(txn => {
      const matchesSearch = txn.dinerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            txn.reference.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMethod = activeMethod === "All" || 
                            (activeMethod === "Card" && txn.method === "card") ||
                            (activeMethod === "Transfer" && txn.method === "bank_transfer") ||
                            (activeMethod === "USSD" && txn.method === "ussd");
      return matchesSearch && matchesMethod;
    });
  }, [allTxns, searchQuery, activeMethod]);

  const totalRevenue = filteredTxns.filter(t => t.status === "success").reduce((s, t) => s + t.amount, 0);
  const successCount = filteredTxns.filter(t => t.status === "success").length;
  const failedCount  = filteredTxns.filter(t => t.status === "failed").length;

  return (
    <div className={`${ds.page} space-y-6`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className={ds.btn.icon}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className={t.h1}>Transactions</h1>
            <p className={`${t.body} mt-1`}>All payment activity for today</p>
          </div>
        </div>
        <button className={`${ds.btn.ghost} shrink-0`}>
          <ArrowDown size={15} />
          Export CSV
        </button>
      </div>

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
          <p className={`${ds.metric.value} ${failedCount > 0 ? "text-red-500" : ""}`}>{failedCount}</p>
          <p className={ds.metric.sub}>needs attention</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input
            type="search"
            placeholder="Search by name or reference..."
            className={ds.input.withIcon}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(["All", "Card", "Transfer", "USSD"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveMethod(f)}
              className={activeMethod === f ? ds.btn.tabActive : ds.btn.tab}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions table */}
      <div className={`${ds.card.base} overflow-hidden`}>
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50/60">
          <div className={`col-span-3 ${ds.table.th} !p-0`}>Customer</div>
          <div className={`col-span-2 ${ds.table.th} !p-0`}>Reference</div>
          <div className={`col-span-1 ${ds.table.th} !p-0 text-center`}>Table</div>
          <div className={`col-span-2 ${ds.table.th} !p-0`}>Method</div>
          <div className={`col-span-2 ${ds.table.th} !p-0`}>Status</div>
          <div className={`col-span-2 ${ds.table.th} !p-0 text-right`}>Amount</div>
        </div>

        <div className={ds.card.divider}>
          {filteredTxns.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">No transactions found.</div>
          ) : (
            filteredTxns.map((txn) => {
              const ageMin = Math.floor((Date.now() - txn.createdAt.getTime()) / 60000);
              const timeLabel = ageMin < 60 ? `${ageMin}m ago` : `${Math.floor(ageMin / 60)}h ago`;

              return (
                <div
                  key={txn.id}
                className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-4 px-4 sm:px-5 py-4 items-start sm:items-center hover:bg-gray-50/50 transition-colors"
              >
                {/* Customer */}
                <div className="col-span-3">
                  <p className="text-sm font-semibold text-gray-900">{txn.dinerName}</p>
                  <p className={`${t.meta} mt-0.5`}>{timeLabel}</p>
                </div>

                {/* Reference */}
                <div className="col-span-2">
                  <span className={t.mono}>{txn.reference}</span>
                </div>

                {/* Table */}
                <div className="col-span-1 sm:text-center">
                  <span className="text-sm text-gray-600 sm:hidden font-medium text-gray-400 mr-1">Table</span>
                  <span className="text-sm font-medium text-gray-900 [font-variant-numeric:tabular-nums]">{txn.tableNumber}</span>
                </div>

                {/* Method */}
                <div className="col-span-2">
                  <MethodBadge method={txn.method} />
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <StatusBadge status={txn.status} />
                </div>

                {/* Amount */}
                <div className="col-span-2 sm:text-right">
                  <p className={`text-sm font-bold [font-variant-numeric:tabular-nums] ${
                    txn.status === "failed" ? "text-red-500" : "text-gray-900"
                  }`}>
                    {txn.status === "failed" ? "−" : "+"}₦{txn.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          }))}
        </div>

        {/* Footer */}
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
