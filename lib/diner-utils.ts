import type { CartItem, OrderBatch } from "@/store/cart";
import type { ModifierOption } from "@/lib/mockData";

export function groupSessionItems(batches: OrderBatch[]): CartItem[] {
  const allItems = batches.flatMap((b) => b.items);
  const grouped = allItems.reduce(
    (acc, curr) => {
      const modString = JSON.stringify(curr.selectedModifiers);
      const key = `${curr.menuItemId}-${modString}-${curr.specialNote || ""}`;
      if (!acc[key]) acc[key] = { ...curr };
      else {
        acc[key].quantity += curr.quantity;
        acc[key].lineTotal += curr.lineTotal;
      }
      return acc;
    },
    {} as Record<string, CartItem>,
  );
  return Object.values(grouped);
}

export function calculateBill({
  subtotal,
  vatRate = 7.5,
  vatEnabled = false,
  tipPct = 0,
}: {
  subtotal: number;
  vatRate?: number;
  vatEnabled?: boolean;
  tipPct?: number;
}): { vat: number; tip: number; total: number } {
  const vat = vatEnabled ? subtotal * (vatRate / 100) : 0;
  const tip = Math.round(subtotal * (tipPct / 100));
  const total = subtotal + vat + tip;
  return { vat, tip, total };
}

export function formatModifiers(
  selectedModifiers: Record<string, ModifierOption[]>,
): string {
  return Object.values(selectedModifiers)
    .flat()
    .map((o) => o.name)
    .join(", ");
}

export function hasModifiers(
  selectedModifiers: Record<string, ModifierOption[]>,
): boolean {
  return Object.values(selectedModifiers).flat().length > 0;
}
