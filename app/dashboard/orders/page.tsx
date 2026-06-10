"use client";

import {
  BellRinging,
  BowlFood,
  CheckCircle,
  ClipboardText,
  Clock,
  CreditCard,
  List,
  Plus,
  SquaresFour,
  Trash,
} from "@phosphor-icons/react";
import { useState } from "react";
import { updateOrderStatusAction } from "@/app/(actions)/orders";
import { OrderCard } from "@/components/dashboard/orders/OrderCard";
import {
  DashboardButton,
  DashboardEmptyState,
  DashboardField,
  DashboardFilterBar,
  DashboardInput,
  DashboardModal,
  DashboardPageHeader,
  DashboardSelect,
  DashboardSetupPrompt,
  DashboardStatusBadge,
  DashboardTable,
  dashboardToast,
  ds,
  statusLabel,
  t,
} from "@/components/dashboard/ui";
import {
  type MenuItem,
  MOCK_TRANSACTIONS,
  type Order,
  type OrderStatus,
} from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { useDashboardSettingsStore } from "@/store/dashboard-settings";
import { useMenuStore } from "@/store/menu";
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
  {
    title: "Paid",
    status: "paid",
    Icon: CreditCard,
    bg: "bg-emerald-50/50",
    dot: "bg-emerald-500",
  },
];

const STATUS_FILTERS = [
  "All",
  "Pending",
  "In kitchen",
  "Ready",
  "Served",
  "Paid",
] as const;

type SortOption = "newest" | "oldest" | "total_desc" | "total_asc";

const formatOrderId = (id: string) => {
  if (id.startsWith("ord-staff-")) {
    return `#STF-${id.replace("ord-staff-", "").slice(-4)}`;
  }
  if (id.startsWith("ord-diner-")) {
    return `#DNR-${id.replace("ord-diner-", "").slice(-4)}`;
  }
  return `#${id.toUpperCase().replace("ORD-", "")}`;
};

export default function OrdersPage() {
  const {
    orders: allOrders,
    getOrdersByStatus,
    addOrder,
    updateOrderStatus,
  } = useOrdersStore();
  const ordersEnabled = useDashboardSettingsStore(
    (state) => state.features.orders,
  );
  const tableOrderingEnabled = useDashboardSettingsStore(
    (state) => state.features.tables,
  );
  const taxes = useDashboardSettingsStore((state) => state.taxes);
  const menuCategories = useMenuStore((state) => state.categories);
  const getItemById = useMenuStore((state) => state.getItemById);

  const [viewMode, setViewMode] = useState<"queue" | "table">("queue");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Pending" | "In kitchen" | "Ready" | "Served" | "Paid"
  >("All");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    menuCategories[0]?.id || "",
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

  const selectedCategory = menuCategories.find(
    (c) => c.id === selectedCategoryId,
  );
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

  const getNextStatus = (status: OrderStatus): OrderStatus | null => {
    switch (status) {
      case "pending":
        return "in_kitchen";
      case "in_kitchen":
        return "ready";
      case "ready":
        return "served";
      case "served":
        return "paid";
      default:
        return null;
    }
  };

  const getNextStatusText = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "Confirm";
      case "in_kitchen":
        return "Mark Ready";
      case "ready":
        return "Mark Served";
      case "served":
        return "Mark Paid";
      default:
        return "";
    }
  };

  // Filter Logic
  const filteredOrders = allOrders.filter((order) => {
    if (statusFilter !== "All") {
      const targetStatus = statusFilter
        .toLowerCase()
        .replace(" ", "_") as OrderStatus;
      if (order.status !== targetStatus) return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const tableStr =
        order.tableNumber > 0 ? `table ${order.tableNumber}` : "counter";
      const phoneStr = order.dinerPhone?.toLowerCase() || "";
      const itemsStr = order.items
        .map((i) => i.itemName.toLowerCase())
        .join(" ");
      const idStr = formatOrderId(order.id).toLowerCase();

      if (
        !tableStr.includes(query) &&
        !phoneStr.includes(query) &&
        !itemsStr.includes(query) &&
        !idStr.includes(query)
      ) {
        return false;
      }
    }

    return true;
  });

  // Sort Logic
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortOption) {
      case "newest":
        return b.createdAt.getTime() - a.createdAt.getTime();
      case "oldest":
        return a.createdAt.getTime() - b.createdAt.getTime();
      case "total_desc":
        return b.grandTotal - a.grandTotal;
      case "total_asc":
        return a.grandTotal - b.grandTotal;
      default:
        return 0;
    }
  });

  // Columns definition for DashboardTable (History View)
  const columns = [
    {
      key: "id",
      header: "Order ID",
      render: (order: Order) => (
        <span className="font-mono text-xs font-semibold text-gray-500">
          {formatOrderId(order.id)}
        </span>
      ),
    },
    {
      key: "location",
      header: "Table",
      render: (order: Order) => {
        const tableLabel =
          order.tableNumber > 0 ? `Table ${order.tableNumber}` : "Counter";
        return <span className="font-bold text-gray-900">{tableLabel}</span>;
      },
    },
    {
      key: "customer",
      header: "Customer",
      render: (order: Order) => {
        const txn = MOCK_TRANSACTIONS.find((t) => t.orderId === order.id);
        const dinerName = txn?.dinerName;
        const phone = order.dinerPhone;
        const hasCustomer = dinerName || phone;
        return hasCustomer ? (
          <span className="font-semibold text-gray-900">
            {dinerName || "—"}
            {phone ? ` (${phone})` : ""}
          </span>
        ) : (
          <span className="text-gray-300">—</span>
        );
      },
    },
    {
      key: "timestamp",
      header: "Date/Time",
      render: (order: Order) => {
        const dateStr = order.createdAt.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });
        const timeStr = order.createdAt.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        return (
          <span className="font-medium text-gray-900">
            {dateStr}, {timeStr}
          </span>
        );
      },
    },
    {
      key: "items",
      header: "Items",
      render: (order: Order) => (
        <div className="space-y-1 max-w-xs md:max-w-sm lg:max-w-md">
          {order.items.map((item) => (
            <div key={item.id} className="text-sm">
              <span className="font-semibold text-gray-500 mr-1">
                {item.quantity}x
              </span>
              <span className="text-gray-900">{item.itemName}</span>
              {Object.values(item.selectedModifiers).flat().length > 0 && (
                <span className="text-xs text-gray-400 ml-1">
                  (
                  {Object.values(item.selectedModifiers)
                    .flat()
                    .map((m) => m.name)
                    .join(", ")}
                  )
                </span>
              )}
              {item.specialNote && (
                <span className="ml-2 text-xs italic text-blue-600">
                  "{item.specialNote}"
                </span>
              )}
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "total",
      header: "Total",
      headerClassName: "text-right",
      className: "text-right",
      render: (order: Order) => (
        <span className="font-bold text-gray-900">
          ₦{order.grandTotal.toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (order: Order) => {
        const statusToneMap: Record<
          OrderStatus,
          "orange" | "blue" | "green" | "gray" | "purple"
        > = {
          pending: "orange",
          in_kitchen: "blue",
          ready: "green",
          served: "gray",
          paid: "green",
        };
        return (
          <DashboardStatusBadge tone={statusToneMap[order.status]}>
            {statusLabel.order[order.status]}
          </DashboardStatusBadge>
        );
      },
    },
    {
      key: "actions",
      header: "Action",
      headerClassName: "text-right",
      className: "text-right",
      render: (order: Order) => (
        <DashboardButton
          size="sm"
          variant="ghost"
          onClick={() => setViewingOrder(order)}
        >
          View Order
        </DashboardButton>
      ),
    },
  ];

  const emptyState = (
    <DashboardEmptyState
      icon={ClipboardText}
      title="No orders found"
      description={
        searchQuery || statusFilter !== "All"
          ? "Try adjusting your search query or status filters."
          : "You haven't received or created any orders yet."
      }
      actionLabel={
        searchQuery || statusFilter !== "All" ? "Clear filters" : undefined
      }
      onAction={
        searchQuery || statusFilter !== "All"
          ? () => {
              setSearchQuery("");
              setStatusFilter("All");
            }
          : undefined
      }
    />
  );

  const sortSelect = (
    <DashboardSelect
      value={sortOption}
      onChange={(e) => setSortOption(e.target.value as SortOption)}
      className="w-full sm:w-40"
    >
      <option value="newest">Newest first</option>
      <option value="oldest">Oldest first</option>
      <option value="total_desc">Amount: High to Low</option>
      <option value="total_asc">Amount: Low to High</option>
    </DashboardSelect>
  );

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
      <div className="px-4 lg:px-8 flex-none">
        <DashboardPageHeader
          title={viewMode === "queue" ? "Order queue" : "Order directory"}
          description={
            viewMode === "queue"
              ? "Live tracking for active in-progress kitchen orders."
              : "Comprehensive search, filters, and historical logs of all orders."
          }
          actions={
            <div className="flex items-center gap-3">
              {/* View Switcher Toggle */}
              <div className="flex rounded-xl bg-gray-100 p-0.5 border border-gray-100 h-10 items-center">
                <button
                  type="button"
                  onClick={() => setViewMode("queue")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all h-9 cursor-pointer",
                    viewMode === "queue"
                      ? "bg-white text-gray-900 shadow-sm border border-gray-200/50"
                      : "text-gray-500 hover:text-gray-900",
                  )}
                >
                  <SquaresFour size={14} />
                  Queue
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all h-9 cursor-pointer",
                    viewMode === "table"
                      ? "bg-white text-gray-900 shadow-sm border border-gray-200/50"
                      : "text-gray-500 hover:text-gray-900",
                  )}
                >
                  <List size={14} />
                  Directory
                </button>
              </div>

              <DashboardButton
                onClick={() => setIsManualOrderOpen(true)}
                className="hidden sm:inline-flex"
              >
                + Manual order
              </DashboardButton>
            </div>
          }
        />
      </div>

      {viewMode === "queue" ? (
        /* Kanban columns (Active & Completed Statuses for Tracking) */
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
      ) : (
        /* Table view layout */
        <div className="flex-1 flex flex-col min-h-0 px-4 lg:px-8 pb-8 space-y-4">
          <div className="flex-none">
            <DashboardFilterBar
              searchValue={searchQuery}
              searchPlaceholder="Search table, ID, phone, items..."
              onSearchChange={setSearchQuery}
              filters={STATUS_FILTERS}
              activeFilter={statusFilter}
              onFilterChange={setStatusFilter}
              allLabel="All Orders"
              actions={sortSelect}
            />
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            <DashboardTable
              rows={sortedOrders}
              columns={columns}
              getRowKey={(order) => order.id}
              empty={emptyState}
            />
          </div>
        </div>
      )}

      {/* Manual Order Modal */}
      <DashboardModal
        open={isManualOrderOpen}
        onOpenChange={setIsManualOrderOpen}
        title="New manual order"
        description="Record an order taken at the counter or over the phone."
        maxWidth="lg"
        footer={
          <div className="flex justify-end gap-2">
            <DashboardButton
              variant="ghost"
              onClick={() => setIsManualOrderOpen(false)}
            >
              Cancel
            </DashboardButton>
            <DashboardButton type="submit" form="manual-order-form">
              Create order
            </DashboardButton>
          </div>
        }
      >
        <form
          id="manual-order-form"
          onSubmit={handleManualOrderSubmit}
          className="space-y-5"
        >
          <DashboardField
            id="manual-order-location"
            label={tableOrderingEnabled ? "Table number" : "Order location"}
            optional
          >
            <DashboardInput
              id="manual-order-location"
              type="number"
              placeholder={tableOrderingEnabled ? "e.g. 5" : "Counter order"}
              value={tableNumber}
              onChange={(event) => setTableNumber(event.target.value)}
            />
          </DashboardField>
          <div className="space-y-3">
            <label htmlFor="manual-order-category" className={ds.input.label}>
              Add items
            </label>
            <div className="flex gap-2">
              <DashboardSelect
                id="manual-order-category"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
              >
                {menuCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </DashboardSelect>
            </div>

            <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-100 bg-white divide-y divide-gray-50">
              {selectedCategory?.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      ₦{item.price.toLocaleString()}
                    </p>
                  </div>
                  <DashboardButton
                    variant="icon"
                    onClick={() => {
                      handleAddItem(item);
                      setFormError("");
                    }}
                  >
                    <Plus size={14} weight="bold" />
                  </DashboardButton>
                </div>
              ))}
            </div>
          </div>

          {selectedItems.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-xl space-y-2 border border-gray-100">
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
        </form>
      </DashboardModal>

      {/* View Order Details Modal */}
      {viewingOrder &&
        (() => {
          const txn = MOCK_TRANSACTIONS.find(
            (t) => t.orderId === viewingOrder.id,
          );
          const dinerName = txn?.dinerName;
          const hasCustomer = Boolean(dinerName || viewingOrder.dinerPhone);
          const statusToneMap: Record<
            OrderStatus,
            "orange" | "blue" | "green" | "gray"
          > = {
            pending: "orange",
            in_kitchen: "blue",
            ready: "green",
            served: "gray",
            paid: "green",
          };
          return (
            <DashboardModal
              open={!!viewingOrder}
              onOpenChange={(open) => {
                if (!open) setViewingOrder(null);
              }}
              title={`Order ${formatOrderId(viewingOrder.id)}`}
              description={`Created on ${viewingOrder.createdAt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} at ${viewingOrder.createdAt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`}
              maxWidth="md"
              footer={
                <div className="flex justify-end gap-2">
                  <DashboardButton
                    variant="ghost"
                    onClick={() => setViewingOrder(null)}
                  >
                    Close
                  </DashboardButton>
                  {getNextStatus(viewingOrder.status) && (
                    <DashboardButton
                      onClick={() => {
                        const next = getNextStatus(viewingOrder.status);
                        if (next) {
                          // Optimistic update (local store)
                          updateOrderStatus(viewingOrder.id, next);
                          dashboardToast(
                            `Order moved to ${statusLabel.order[next].toLowerCase()}`,
                          );
                          setViewingOrder(null);
                          // Persist to DB (fire-and-forget; failure is silent in demo)
                          updateOrderStatusAction(viewingOrder.id, next).catch(
                            () => {},
                          );
                        }
                      }}
                    >
                      {getNextStatusText(viewingOrder.status)}
                    </DashboardButton>
                  )}
                </div>
              }
            >
              <div className="space-y-6">
                {/* ── Status Section ─────────────────────────────── */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <span className="text-sm text-gray-500 font-medium">
                    Status
                  </span>
                  <DashboardStatusBadge
                    tone={statusToneMap[viewingOrder.status]}
                  >
                    {statusLabel.order[viewingOrder.status]}
                  </DashboardStatusBadge>
                </div>

                {/* ── Customer Details Section ─────────────────────── */}
                {hasCustomer && (
                  <div className="pb-5 border-b border-gray-100">
                    <span
                      className={cn(
                        t.meta,
                        "block text-gray-400 font-medium mb-3",
                      )}
                    >
                      Customer Details
                    </span>
                    <div className="flex items-center gap-3">
                      <div className={ds.avatar.sm}>
                        {(dinerName || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className={t.bodyStrong}>{dinerName || "—"}</p>
                        {viewingOrder.dinerPhone && (
                          <p className={cn(t.meta, "mt-0.5")}>
                            {viewingOrder.dinerPhone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Items Ordered Section (Label Outside the Card Container) ── */}
                <div>
                  <h4 className={cn(t.h4, "mb-3")}>
                    Items ordered ({viewingOrder.items.length})
                  </h4>

                  <div className={ds.card.base}>
                    {/* Items list with design system dividers */}
                    <div className={ds.card.divider}>
                      {viewingOrder.items.map((item) => {
                        const menuItem = getItemById(item.menuItemId);
                        const photoUrl = menuItem?.photoUrl;
                        const hasExtras =
                          Object.values(item.selectedModifiers).flat().length >
                            0 || item.specialNote;

                        return (
                          <div
                            key={item.id}
                            className={cn(
                              ds.card.row,
                              "gap-4 py-3.5",
                              hasExtras ? "items-start" : "items-center",
                            )}
                          >
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              {/* Image or icon fallback */}
                              {photoUrl ? (
                                <img
                                  src={photoUrl}
                                  alt={item.itemName}
                                  className="w-10 h-10 rounded-lg object-cover flex-none"
                                />
                              ) : (
                                <div className="w-10 h-10 flex-none bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center">
                                  <BowlFood size={18} />
                                </div>
                              )}

                              <div className="flex-1 min-w-0">
                                <p className={t.bodyStrong}>
                                  <span className="text-gray-400 mr-2">
                                    {item.quantity}x
                                  </span>
                                  {item.itemName}
                                </p>
                                {Object.values(item.selectedModifiers).flat()
                                  .length > 0 && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    +{" "}
                                    {Object.values(item.selectedModifiers)
                                      .flat()
                                      .map((m) => m.name)
                                      .join(", ")}
                                  </p>
                                )}
                                {item.specialNote && (
                                  <div className="flex items-start gap-1.5 mt-1.5 p-2 rounded-xl bg-orange-50/50 border border-orange-100/30 text-xs text-orange-600">
                                    <span className="font-semibold select-none">
                                      Note:
                                    </span>
                                    <span className="italic">
                                      "{item.specialNote}"
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <span className={cn(t.price, "flex-none mt-0.5")}>
                              ₦
                              {(
                                item.itemPrice * item.quantity
                              ).toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Financial Summary card footer */}
                    <div className={ds.card.footer}>
                      <div className="space-y-2.5 text-sm">
                        <div className="flex justify-between text-gray-500 font-medium">
                          <span>Subtotal</span>
                          <span className={t.number}>
                            ₦{viewingOrder.subtotal.toLocaleString()}
                          </span>
                        </div>
                        {viewingOrder.vatAmount > 0 && (
                          <div className="flex justify-between text-gray-500 font-medium">
                            <span>
                              VAT ({taxes.vatEnabled ? taxes.vatRate : 7.5}%)
                            </span>
                            <span className={t.number}>
                              ₦{viewingOrder.vatAmount.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                          <span className="font-bold text-gray-900 text-sm">
                            Total Amount
                          </span>
                          <span className="font-bold text-gray-900 text-base">
                            ₦{viewingOrder.grandTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DashboardModal>
          );
        })()}

      <DashboardButton
        onClick={() => setIsManualOrderOpen(true)}
        className="fixed bottom-4 right-4 z-20 sm:hidden"
      >
        + Manual order
      </DashboardButton>
    </div>
  );
}
