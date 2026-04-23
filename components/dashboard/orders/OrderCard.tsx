"use client";

import { useState } from "react";
import { useOrdersStore } from "@/store/orders";
import type { Order, OrderStatus } from "@/lib/mockData";
import { cn } from "@/lib/utils";

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
      case "pending": return "Confirm → Kitchen";
      case "in_kitchen": return "Mark Ready";
      case "ready": return "Mark Served";
      default: return "";
    }
  };

  const getNextStatus = (status: OrderStatus): OrderStatus | null => {
    switch (status) {
      case "pending": return "in_kitchen";
      case "in_kitchen": return "ready";
      case "ready": return "served";
      default: return null;
    }
  };

  const nextStatus = getNextStatus(order.status);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md">
      {/* Card Header (always visible) */}
      <div 
        className="p-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">Table {order.tableNumber}</span>
            {isNew && <span className="px-1.5 py-0.5 bg-blue-500 text-white text-[9px] font-bold rounded-full animate-pulse">NEW</span>}
            {order.source === "staff" && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[9px] font-bold rounded-full">STAFF</span>}
          </div>
          <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold", ageColor)}>
            {ageMins}m
          </span>
        </div>
        <p className="text-sm text-gray-500 truncate">
          {order.items.length} items · ₦{order.grandTotal.toLocaleString()}
        </p>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-3 pb-3 border-t border-gray-50 pt-2 bg-gray-50/50">
          <div className="space-y-2 mb-3">
            {order.items.map(item => (
              <div key={item.id} className="text-sm">
                <div className="flex items-start justify-between">
                  <span className="font-medium text-gray-900"><span className="text-gray-400 mr-1">{item.quantity}x</span>{item.itemName}</span>
                </div>
                {Object.values(item.selectedModifiers).flat().length > 0 && (
                  <p className="text-xs text-gray-500 ml-4">
                    + {Object.values(item.selectedModifiers).flat().map(m => m.name).join(", ")}
                  </p>
                )}
                {item.specialNote && (
                  <p className="text-xs text-blue-600 italic ml-4">"{item.specialNote}"</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {nextStatus && (
        <div className="p-2 bg-gray-50 border-t border-gray-100">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              updateOrderStatus(order.id, nextStatus);
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
