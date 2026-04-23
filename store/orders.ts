import { create } from "zustand";
import type { Order, OrderStatus } from "@/lib/mockData";
import { MOCK_ORDERS } from "@/lib/mockData";

interface OrdersState {
  orders: Order[];
  activeOrderId: string | null;

  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  setActiveOrderId: (orderId: string | null) => void;

  getOrderById: (orderId: string) => Order | undefined;
  getOrdersByStatus: (status: OrderStatus) => Order[];
}

export const useOrdersStore = create<OrdersState>()((set, get) => ({
  orders: MOCK_ORDERS,
  activeOrderId: null,

  setOrders: (orders) => set({ orders }),

  addOrder: (order) =>
    set((state) => ({ orders: [order, ...state.orders] })),

  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status, updatedAt: new Date() } : o
      ),
    })),

  setActiveOrderId: (orderId) => set({ activeOrderId: orderId }),

  getOrderById: (orderId) => get().orders.find((o) => o.id === orderId),

  getOrdersByStatus: (status) => get().orders.filter((o) => o.status === status),
}));
