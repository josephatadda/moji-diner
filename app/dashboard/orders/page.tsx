"use client";

import {
  BellRinging,
  BowlFood,
  CheckCircle,
  Clock,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import { useState } from "react";
import { OrderCard } from "@/components/dashboard/orders/OrderCard";
import { DashboardPageHeader } from "@/components/dashboard/ui/DashboardPageHeader";
import { DashboardSetupPrompt } from "@/components/dashboard/ui/DashboardSetupPrompt";
import { dashboardToast } from "@/components/dashboard/ui/dashboard-toast";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { ds, t } from "@/lib/design-tokens";
import type { MenuItem, OrderStatus } from "@/lib/mockData";
import { MOCK_MENU } from "@/lib/mockData";
import { useDashboardSettingsStore } from "@/store/dashboard-settings";
import { useOrdersStore } from "@/store/orders";

const COLUMNS: {
  title: string;
  status: OrderStatus;
  Icon: React.ElementType;
  bg: string;
  dot: string;
}[] = [
  {
    title: "Pending",
    status: "pending",
    Icon: Clock,
    bg: "bg-orange-50/50",
    dot: "bg-orange-400",
  },
  {
    title: "In kitchen",
    status: "in_kitchen",
    Icon: BowlFood,
    bg: "bg-blue-50/50",
    dot: "bg-blue-400",
  },
  {
    title: "Ready",
    status: "ready",
    Icon: BellRinging,
    bg: "bg-green-50/50",
    dot: "bg-green-500",
  },
  {
    title: "Served",
    status: "served",
    Icon: CheckCircle,
    bg: "bg-gray-50/50",
    dot: "bg-gray-300",
  },
];

export default function OrdersPage() {
  const { getOrdersByStatus, addOrder } = useOrdersStore();
  const ordersEnabled = useDashboardSettingsStore(
    (state) => state.features.orders,
  );
  const tableOrderingEnabled = useDashboardSettingsStore(
    (state) => state.features.tables,
  );
  const taxes = useDashboardSettingsStore((state) => state.taxes);
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    MOCK_MENU[0]?.id || "",
  );
  const [selectedItems, setSelectedItems] = useState<
    { item: MenuItem; qty: number }[]
  >([]);
  const [tableNumber, setTableNumber] = useState("");
  const [formError, setFormError] = useState("");

  const handleAddItem = (item: MenuItem) => {
    setSelectedItems((prev) => {
      const existing = prev.find((p) => p.item.id === item.id);
      if (existing) {
        return prev.map((p) =>
          p.item.id === item.id ? { ...p, qty: p.qty + 1 } : p,
        );
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems((prev) => prev.filter((p) => p.item.id !== itemId));
  };

  const selectedCategory = MOCK_MENU.find((c) => c.id === selectedCategoryId);
  const orderTotal = selectedItems.reduce(
    (sum, p) => sum + p.item.price * p.qty,
    0,
  );
  const vatAmount = taxes.vatEnabled
    ? Math.round(orderTotal * (taxes.vatRate / 100))
    : 0;
  const grandTotal = orderTotal + vatAmount;

  const handleManualOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      setFormError("Add at least one item before creating the order.");
      return;
    }

    const table = Number(tableNumber) || 0;
    const now = new Date();
    addOrder({
      id: `ord-staff-${now.getTime()}`,
      restaurantId: "rest-001",
      tableId: table ? `tbl-${table}` : "counter",
      tableNumber: table,
      status: "pending",
      items: selectedItems.map(({ item, qty }, index) => ({
        id: `oi-staff-${now.getTime()}-${index}`,
        menuItemId: item.id,
        itemName: item.name,
        itemPrice: item.price,
        quantity: qty,
        selectedModifiers: {},
        lineTotal: item.price * qty,
      })),
      subtotal: orderTotal,
      vatAmount,
      grandTotal,
      source: "staff",
      createdAt: now,
      updatedAt: now,
      estimatedReadyMins: Math.max(
        ...selectedItems.map(({ item }) => item.preparationTimeMins || 10),
        10,
      ),
    });

    setIsManualOrderOpen(false);
    setSelectedItems([]);
    setTableNumber("");
    setFormError("");
    dashboardToast("Manual order added to the queue");
  };

  if (!ordersEnabled) {
    return (
      <DashboardSetupPrompt
        title="Orders are not enabled"
        description="Turn on order management when this restaurant is ready to receive and track diner orders."
        featureLabel="orders"
        icon={Clock}
      />
    );
  }

  return (
    <div className="h-full flex flex-col pt-6">
      <div className="px-4 lg:px-8">
        <DashboardPageHeader
          title="Order queue"
          description="Live tracking for dine-in, QR, and staff-created orders."
          actions={
            <button
              type="button"
              onClick={() => setIsManualOrderOpen(true)}
              className={`${ds.btn.primary} hidden sm:inline-flex`}
            >
              + Manual order
            </button>
          }
        />
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
                    <h2 className="text-sm font-semibold text-gray-900">
                      {title}
                    </h2>
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
                    <div className="m-1 flex h-32 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white/50">
                      <p className={`${t.meta} font-medium`}>
                        No {title.toLowerCase()} orders
                      </p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))
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
        <form
          onSubmit={handleManualOrderSubmit}
          className="space-y-4 px-1 py-2"
        >
          <div className={ds.form.field}>
            <label htmlFor="manual-order-location" className={ds.input.label}>
              {tableOrderingEnabled ? "Table number" : "Order location"}
              <span className="text-gray-400"> (optional)</span>
            </label>
            <input
              id="manual-order-location"
              type="number"
              placeholder={tableOrderingEnabled ? "e.g. 5" : "Counter order"}
              className={ds.input.base}
              value={tableNumber}
              onChange={(event) => setTableNumber(event.target.value)}
            />
          </div>
          <div className="space-y-3">
            <label htmlFor="manual-order-category" className={ds.input.label}>
              Add items
            </label>
            <div className="flex gap-2">
              <select
                id="manual-order-category"
                className={ds.input.select}
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
              >
                {MOCK_MENU.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="border border-gray-100 rounded-xl max-h-48 overflow-y-auto divide-y divide-gray-50">
              {selectedCategory?.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      ₦{item.price.toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleAddItem(item);
                      setFormError("");
                    }}
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
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Order Summary
              </p>
              {selectedItems.map((line) => (
                <div
                  key={line.item.id}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="font-medium text-gray-900">
                    {line.qty}x {line.item.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">
                      ₦{(line.item.price * line.qty).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(line.item.id)}
                      className="text-red-500 p-1 hover:bg-red-50 rounded"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-gray-900">
                <span>{taxes.vatEnabled ? "Subtotal" : "Total"}</span>
                <span>₦{orderTotal.toLocaleString()}</span>
              </div>
              {taxes.vatEnabled && (
                <>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>VAT ({taxes.vatRate}%)</span>
                    <span>₦{vatAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>Total</span>
                    <span>₦{grandTotal.toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>
          )}
          {formError && (
            <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {formError}
            </p>
          )}
          <div className={ds.form.actions}>
            <button
              type="button"
              onClick={() => setIsManualOrderOpen(false)}
              className={ds.btn.ghost}
            >
              Cancel
            </button>
            <button type="submit" className={ds.btn.primary}>
              Create order
            </button>
          </div>
        </form>
      </ResponsiveDialog>
      <button
        type="button"
        onClick={() => setIsManualOrderOpen(true)}
        className={`${ds.btn.primary} fixed bottom-4 right-4 z-20 sm:hidden`}
      >
        + Manual order
      </button>
    </div>
  );
}
