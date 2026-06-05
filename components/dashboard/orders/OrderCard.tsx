"use client";

import { useState } from "react";
import { dashboardToast } from "@/components/dashboard/ui/dashboard-toast";
import type { Order, OrderStatus } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { useOrdersStore } from "@/store/orders";

export function OrderCard({ order }: { order: Order }) {
  const { updateOrderStatus } = useOrdersStore();
  const [expanded, setExpanded] = useState(false);

  const ageMins = Math.floor((Date.now() - order.createdAt.getTime()) / 60000);
  const isNew = ageMins < 2;

  let ageColor = "text-green-600 bg-green-50";
  if (ageMins >= 20) ageColor = "text-red-600 bg-red-50";
  else if (ageMins >= 10) ageColor = "text-orange-600 bg-orange-50";

  const getNextStatusText = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "Confirm → Kitchen";
      case "in_kitchen":
        return "Mark Ready";
      case "ready":
        return "Mark Served";
      default:
        return "";
    }
  };

  const getNextStatus = (status: OrderStatus): OrderStatus | null => {
    switch (status) {
      case "pending":
        return "in_kitchen";
      case "in_kitchen":
        return "ready";
      case "ready":
        return "served";
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus(order.status);
  const statusLabel: Record<OrderStatus, string> = {
    pending: "Pending",
    in_kitchen: "In kitchen",
    ready: "Ready",
    served: "Served",
    paid: "Paid",
  };

  const tableLabel =
    order.tableNumber > 0 ? `Table ${order.tableNumber}` : "Counter";

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white transition-colors hover:border-gray-200">
      {/* Card Header (always visible) */}
      <button
        type="button"
        aria-expanded={expanded}
        className="w-full cursor-pointer p-3 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">{tableLabel}</span>
            {isNew && (
              <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-700">
                NEW
              </span>
            )}
            {order.source === "staff" && (
              <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold text-violet-700">
                STAFF
              </span>
            )}
          </div>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-xs font-bold",
              ageColor,
            )}
          >
            {ageMins}m
          </span>
        </div>
        <div className="flex items-end justify-between gap-3">
          <p className="truncate text-sm text-gray-500">
            {order.items.length} item{order.items.length === 1 ? "" : "s"}
          </p>
          <p className="text-sm font-bold text-gray-900 tabular-nums">
            ₦{order.grandTotal.toLocaleString()}
          </p>
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-50 bg-gray-50/60 px-3 pb-3 pt-2">
          <div className="space-y-2 mb-3">
            {order.items.map((item) => (
              <div key={item.id} className="text-sm">
                <div className="flex items-start justify-between">
                  <span className="font-medium text-gray-900">
                    <span className="text-gray-400 mr-1">{item.quantity}x</span>
                    {item.itemName}
                  </span>
                </div>
                {Object.values(item.selectedModifiers).flat().length > 0 && (
                  <p className="text-xs text-gray-500 ml-4">
                    +{" "}
                    {Object.values(item.selectedModifiers)
                      .flat()
                      .map((m) => m.name)
                      .join(", ")}
                  </p>
                )}
                {item.specialNote && (
                  <p className="ml-4 text-xs italic text-blue-600">
                    "{item.specialNote}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {nextStatus && (
        <div className="border-t border-gray-100 bg-gray-50 p-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              updateOrderStatus(order.id, nextStatus);
              dashboardToast(
                `Order moved to ${statusLabel[nextStatus].toLowerCase()}`,
              );
            }}
            className="w-full py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-700 active:scale-[0.97] transition-all ease-out"
          >
            {getNextStatusText(order.status)}
          </button>
        </div>
      )}
    </div>
  );
}
