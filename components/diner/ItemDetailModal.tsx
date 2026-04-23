"use client";

import { useState } from "react";
import type { MenuItem, ModifierGroup, ModifierOption } from "@/lib/mockData";
import { useCartStore } from "@/store/cart";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { BowlFood } from "@phosphor-icons/react";

interface ItemDetailModalProps {
  item: MenuItem;
  open: boolean;
  onClose: () => void;
}

export function ItemDetailModal({ item, open, onClose }: ItemDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, ModifierOption[]>>({});
  const [specialNote, setSpecialNote] = useState("");
  const { addItem } = useCartStore();

  const handleClose = () => {
    setQuantity(1);
    setSelectedModifiers({});
    setSpecialNote("");
    onClose();
  };

  const toggleModifier = (group: ModifierGroup, option: ModifierOption) => {
    setSelectedModifiers((prev) => {
      const current = prev[group.id] ?? [];
      const alreadySelected = current.some((o) => o.id === option.id);

      if (group.maxSelections === 1) {
        // Radio behaviour
        return { ...prev, [group.id]: alreadySelected ? [] : [option] };
      }

      // Checkbox behaviour
      if (alreadySelected) {
        return { ...prev, [group.id]: current.filter((o) => o.id !== option.id) };
      }
      if (current.length >= group.maxSelections) return prev;
      return { ...prev, [group.id]: [...current, option] };
    });
  };

  const isGroupSatisfied = (group: ModifierGroup) => {
    if (!group.required) return true;
    const selected = selectedModifiers[group.id] ?? [];
    return selected.length >= group.minSelections;
  };

  const allGroupsSatisfied = item.modifierGroups.every(isGroupSatisfied);

  const modifierTotal = Object.values(selectedModifiers)
    .flat()
    .reduce((sum, opt) => sum + opt.priceDelta, 0);
  const unitPrice = item.price + modifierTotal;
  const total = unitPrice * quantity;

  const handleAddToCart = () => {
    if (!allGroupsSatisfied) return;
    addItem(item, quantity, selectedModifiers, specialNote || undefined);
    handleClose();
  };

  return (
    <Drawer open={open} onOpenChange={(o) => !o && handleClose()}>
      <DrawerContent className="max-h-[92vh]">
        {/* Item image */}
        <div className="w-full h-44 bg-gray-100 flex items-center justify-center flex-none text-gray-500">
          <span className="text-7xl"><BowlFood /></span>
        </div>

        <div className="overflow-y-auto flex-1">
          <DrawerHeader className="px-4 pt-4 pb-2 text-left">
            <DrawerTitle className="text-xl font-bold text-gray-900">{item.name}</DrawerTitle>
            {item.description && (
              <DrawerDescription className="text-sm text-gray-500 mt-1 leading-relaxed">
                {item.description}
              </DrawerDescription>
            )}
            <p className="text-lg font-bold text-gray-900 mt-2">₦{item.price.toLocaleString()}</p>
          </DrawerHeader>

          <div className="px-4 pb-4 space-y-6">
            {/* Modifier groups */}
            {item.modifierGroups.map((group) => {
              const selected = selectedModifiers[group.id] ?? [];
              return (
                <div key={group.id}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900 text-sm">{group.name}</p>
                    <div className="flex items-center gap-1.5">
                      {group.required ? (
                        <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">
                          Required
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          Optional
                        </span>
                      )}
                      {group.maxSelections > 1 && (
                        <span className="text-[10px] text-gray-400">
                          Choose up to {group.maxSelections}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {group.options.map((option) => {
                      const isSelected = selected.some((o) => o.id === option.id);
                      return (
                        <button
                          key={option.id}
                          onClick={() => toggleModifier(group, option)}
                          className={cn(
                            "w-full flex items-center justify-between p-3 rounded-xl border text-sm text-left transition-all",
                            isSelected
                              ? "border-gray-900 bg-gray-900 text-white"
                              : "border-gray-100 bg-gray-50 text-gray-700 hover:border-gray-200"
                          )}
                        >
                          <span className="font-medium">{option.name}</span>
                          <span className={cn("text-sm", isSelected ? "text-gray-300" : "text-gray-400")}>
                            {option.priceDelta > 0 ? `+₦${option.priceDelta.toLocaleString()}` : "Free"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Special note */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Special note <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={specialNote}
                onChange={(e) => setSpecialNote(e.target.value)}
                placeholder="No onions, extra spicy, etc."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base resize-none h-20 focus:border-gray-400 focus:outline-none transition-colors bg-white"
              />
            </div>

            {/* Quantity + Add button */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-700 font-bold text-lg active:scale-[0.97] transition-all ease-out"
                >
                  −
                </button>
                <span className="w-8 text-center font-bold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-700 font-bold text-lg active:scale-[0.97] transition-all ease-out"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!allGroupsSatisfied}
                className={cn(
                  "flex-1 h-12 rounded-full font-bold text-sm transition-all",
                  allGroupsSatisfied
                    ? "bg-gray-900 text-white hover:bg-gray-700 active:scale-95"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                Add to order · ₦{total.toLocaleString()}
              </button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
