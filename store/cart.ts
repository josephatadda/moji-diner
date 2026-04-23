import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MenuItem, ModifierOption, ModifierGroup } from "@/lib/mockData";

export interface CartItem {
  cartId: string; // unique per cart entry (same item+modifiers = different cartId)
  menuItemId: string;
  itemName: string;
  itemPrice: number;
  quantity: number;
  selectedModifiers: Record<string, ModifierOption[]>;
  specialNote?: string;
  lineTotal: number;
}

export interface OrderBatch {
  id: string;
  timestamp: number;
  status: "placed" | "preparing" | "ready" | "served";
  items: CartItem[];
}

interface CartState {
  restaurantId: string | null;
  restaurantSlug: string | null;
  tableNumber: number | null;
  items: CartItem[];
  sessionBatches: OrderBatch[]; // orders grouped by batch
  orderId: string | null; // once order is submitted
  loyaltyName: string | null;
  loyaltyPhone: string | null;

  // Actions
  setContext: (restaurantId: string, slug: string, tableNumber: number) => void;
  addItem: (
    item: MenuItem,
    quantity: number,
    selectedModifiers: Record<string, ModifierOption[]>,
    specialNote?: string
  ) => void;
  removeItem: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  clearSession: () => void;
  submitCartToSession: () => void;
  setOrderId: (orderId: string) => void;
  serveAllBatches: () => void; // For demo purposes
  setLoyaltyData: (name: string, phone: string) => void;

  // Selectors
  totalItems: () => number;
  subtotal: () => number;
}

function computeLineTotal(
  price: number,
  quantity: number,
  selectedModifiers: Record<string, ModifierOption[]>
): number {
  const modifierTotal = Object.values(selectedModifiers)
    .flat()
    .reduce((sum, opt) => sum + opt.priceDelta, 0);
  return (price + modifierTotal) * quantity;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      restaurantId: null,
      restaurantSlug: null,
      tableNumber: null,
      items: [],
      sessionBatches: [],
      orderId: null,
      loyaltyName: null,
      loyaltyPhone: null,

      setContext: (restaurantId, slug, tableNumber) =>
        set({ restaurantId, restaurantSlug: slug, tableNumber }),

      addItem: (item, quantity, selectedModifiers, specialNote) => {
        const cartId = `${item.id}-${Date.now()}`;
        const lineTotal = computeLineTotal(item.price, quantity, selectedModifiers);
        set((state) => ({
          items: [
            ...state.items,
            {
              cartId,
              menuItemId: item.id,
              itemName: item.name,
              itemPrice: item.price,
              quantity,
              selectedModifiers,
              specialNote,
              lineTotal,
            },
          ],
        }));
      },

      removeItem: (cartId) =>
        set((state) => ({ items: state.items.filter((i) => i.cartId !== cartId) })),

      updateQuantity: (cartId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.cartId === cartId
              ? {
                  ...i,
                  quantity,
                  lineTotal: computeLineTotal(i.itemPrice, quantity, i.selectedModifiers),
                }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [], orderId: null }),

      clearSession: () => set({ sessionBatches: [], items: [], orderId: null }),

      submitCartToSession: () => {
        const { items } = get();
        if (items.length === 0) return;
        
        const newBatch: OrderBatch = {
          id: `batch-${Date.now()}`,
          timestamp: Date.now(),
          status: "preparing",
          items: [...items],
        };
        
        set((state) => ({
          sessionBatches: [...state.sessionBatches, newBatch],
          items: [],
          orderId: null,
        }));
      },

      serveAllBatches: () => set((state) => ({
        sessionBatches: state.sessionBatches.map(b => ({ ...b, status: "served" }))
      })),

      setOrderId: (orderId) => set({ orderId }),

      setLoyaltyData: (name, phone) => set({ loyaltyName: name, loyaltyPhone: phone }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () => get().items.reduce((sum, i) => sum + i.lineTotal, 0),
    }),
    {
      name: "moji-cart",
    }
  )
);
