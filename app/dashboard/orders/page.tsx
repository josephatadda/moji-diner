"use client";

import { useState } from "react";
import { useOrdersStore } from "@/store/orders";
import { OrderCard } from "@/components/dashboard/orders/OrderCard";
import type { OrderStatus, MenuItem } from "@/lib/mockData";
import { MOCK_MENU } from "@/lib/mockData";
import { Clock, BowlFood, BellRinging, CheckCircle, Trash, Plus } from "@phosphor-icons/react";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { ds, t } from "@/lib/design-tokens";

const COLUMNS: {
  title: string;
  status: OrderStatus;
  Icon: React.ElementType;
  bg: string;
  dot: string;
}[] = [
  { title: "Pending",     status: "pending",    Icon: Clock,        bg: "bg-orange-50/50", dot: "bg-orange-400" },
  { title: "In kitchen",  status: "in_kitchen", Icon: BowlFood,     bg: "bg-blue-50/50",   dot: "bg-blue-400"   },
  { title: "Ready",       status: "ready",      Icon: BellRinging,  bg: "bg-green-50/50",  dot: "bg-green-500"  },
  { title: "Served",      status: "served",     Icon: CheckCircle,  bg: "bg-gray-50/50",   dot: "bg-gray-300"   },
];

export default function OrdersPage() {
  const { getOrdersByStatus } = useOrdersStore();
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(MOCK_MENU[0]?.id || "");
  const [selectedItems, setSelectedItems] = useState<{item: MenuItem, qty: number}[]>([]);

  const handleAddItem = (item: MenuItem) => {
    setSelectedItems(prev => {
      const existing = prev.find(p => p.item.id === item.id);
      if (existing) {
        return prev.map(p => p.item.id === item.id ? { ...p, qty: p.qty + 1 } : p);
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(prev => prev.filter(p => p.item.id !== itemId));
  };

  const selectedCategory = MOCK_MENU.find(c => c.id === selectedCategoryId);
  const orderTotal = selectedItems.reduce((sum, p) => sum + (p.item.price * p.qty), 0);

  const handleManualOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) return alert("Add at least one item.");
    setIsManualOrderOpen(false);
    setSelectedItems([]);
    // Real implementation would add to orders store
  };

  return (
    <div className="h-full flex flex-col pt-4">
      {/* Header */}
      <div className="px-4 lg:px-8 mb-4 flex items-center justify-between flex-none">
        <div>
          <h1 className={t.h1}>Order queue</h1>
          <p className={`${t.body} mt-1`}>Live tracking — updates in real time</p>
        </div>
        <button 
          onClick={() => setIsManualOrderOpen(true)} 
          className={`${ds.btn.primary} hidden sm:inline-flex`}
        >
          + Manual order
        </button>
      </div>

      {/* Kanban columns */}
      <div className="flex-1 overflow-x-auto pb-6 px-4 lg:px-8">
        <div className="flex flex-nowrap gap-4 h-full min-w-max pb-4">
          {COLUMNS.map(({ title, status, Icon, bg, dot }) => {
            const orders = getOrdersByStatus(status);
            return (
              <div
                key={status}
                className={`flex flex-col w-72 md:w-80 h-full rounded-2xl border border-gray-100 flex-none ${bg}`}
              >
                {/* Column header */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-none bg-white/60 rounded-t-2xl">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${dot}`} />
                    <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Icon size={14} />
                    <span className="bg-white border border-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
                      {orders.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {orders.length === 0 ? (
                    <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl m-1">
                      <p className={`${t.meta} font-medium`}>No orders</p>
                    </div>
                  ) : (
                    orders.map(order => <OrderCard key={order.id} order={order} />)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Manual Order Modal */}
      <ResponsiveDialog
        open={isManualOrderOpen}
        onOpenChange={setIsManualOrderOpen}
        title="New Manual Order"
        description="Record an order taken at the counter or over the phone."
      >
        <form onSubmit={handleManualOrderSubmit} className="space-y-4 px-1 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Table Number (Optional)</label>
            <input type="number" placeholder="e.g. 5" className={ds.input.base} />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">Add Items</label>
            <div className="flex gap-2">
              <select 
                className={ds.input.base}
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
              >
                {MOCK_MENU.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div className="border border-gray-100 rounded-xl max-h-48 overflow-y-auto divide-y divide-gray-50">
              {selectedCategory?.items.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">₦{item.price.toLocaleString()}</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => handleAddItem(item)}
                    className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Plus size={14} weight="bold" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {selectedItems.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-xl space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase">Order Summary</p>
              {selectedItems.map((line, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-900">{line.qty}x {line.item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">₦{(line.item.price * line.qty).toLocaleString()}</span>
                    <button type="button" onClick={() => handleRemoveItem(line.item.id)} className="text-red-500 p-1 hover:bg-red-50 rounded">
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span>₦{orderTotal.toLocaleString()}</span>
              </div>
            </div>
          )}
          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setIsManualOrderOpen(false)} className={ds.btn.ghost}>Cancel</button>
            <button type="submit" className={ds.btn.primary}>Create Order</button>
          </div>
        </form>
      </ResponsiveDialog>
    </div>
  );
}
