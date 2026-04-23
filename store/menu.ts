import { create } from "zustand";
import { MOCK_MENU, type MenuCategory, type MenuItem } from "@/lib/mockData";

interface MenuState {
  categories: MenuCategory[];
  isLoading: boolean;

  setCategories: (categories: MenuCategory[]) => void;
  addCategory: (category: MenuCategory) => void;
  updateCategory: (categoryId: string, updates: Partial<MenuCategory>) => void;
  deleteCategory: (categoryId: string) => void;

  addItem: (categoryId: string, item: MenuItem) => void;
  updateItem: (itemId: string, updates: Partial<MenuItem>) => void;
  deleteItem: (itemId: string) => void;
  toggleAvailability: (itemId: string) => void;
  resetAllAvailability: () => void;

  getItemById: (itemId: string) => MenuItem | undefined;
  getCategoryById: (categoryId: string) => MenuCategory | undefined;
}

export const useMenuStore = create<MenuState>()((set, get) => ({
  categories: MOCK_MENU,
  isLoading: false,

  setCategories: (categories) => set({ categories }),

  addCategory: (category) =>
    set((state) => ({ categories: [...state.categories, category] })),

  updateCategory: (categoryId, updates) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === categoryId ? { ...c, ...updates } : c
      ),
    })),

  deleteCategory: (categoryId) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== categoryId),
    })),

  addItem: (categoryId, item) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === categoryId ? { ...c, items: [...c.items, item] } : c
      ),
    })),

  updateItem: (itemId, updates) =>
    set((state) => ({
      categories: state.categories.map((c) => ({
        ...c,
        items: c.items.map((i) => (i.id === itemId ? { ...i, ...updates } : i)),
      })),
    })),

  deleteItem: (itemId) =>
    set((state) => ({
      categories: state.categories.map((c) => ({
        ...c,
        items: c.items.filter((i) => i.id !== itemId),
      })),
    })),

  toggleAvailability: (itemId) =>
    set((state) => ({
      categories: state.categories.map((c) => ({
        ...c,
        items: c.items.map((i) =>
          i.id === itemId ? { ...i, isAvailable: !i.isAvailable } : i
        ),
      })),
    })),

  resetAllAvailability: () =>
    set((state) => ({
      categories: state.categories.map((c) => ({
        ...c,
        items: c.items.map((i) => ({ ...i, isAvailable: true })),
      })),
    })),

  getItemById: (itemId) => {
    for (const cat of get().categories) {
      const item = cat.items.find((i) => i.id === itemId);
      if (item) return item;
    }
    return undefined;
  },

  getCategoryById: (categoryId) =>
    get().categories.find((c) => c.id === categoryId),
}));
