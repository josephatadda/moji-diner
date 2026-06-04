"use client";

import { BowlFood } from "@phosphor-icons/react";
import Image from "next/image";
import { useState } from "react";
import type { MenuItem, ModifierGroup, ModifierOption } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { BottomSheet } from "./ui/BottomSheet";
import { DINER } from "./ui/diner-tokens";

interface ItemDetailModalProps {
  item: MenuItem;
  open: boolean;
  onClose: () => void;
}

export function ItemDetailModal({ item, open, onClose }: ItemDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<
    Record<string, ModifierOption[]>
  >({});
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
        return { ...prev, [group.id]: alreadySelected ? [] : [option] };
      }
      if (alreadySelected) {
        return {
          ...prev,
          [group.id]: current.filter((o) => o.id !== option.id),
        };
      }
      if (current.length >= group.maxSelections) return prev;
      return { ...prev, [group.id]: [...current, option] };
    });
  };

  const isGroupSatisfied = (group: ModifierGroup) => {
    if (!group.required) return true;
    return (selectedModifiers[group.id] ?? []).length >= group.minSelections;
  };

  const allGroupsSatisfied = item.modifierGroups.every(isGroupSatisfied);

  const modifierTotal = Object.values(selectedModifiers)
    .flat()
    .reduce((sum, opt) => sum + opt.priceDelta, 0);
  const total = (item.price + modifierTotal) * quantity;

  const handleAddToCart = () => {
    if (!allGroupsSatisfied) return;
    addItem(item, quantity, selectedModifiers, specialNote || undefined);
    handleClose();
  };

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      accessibilityTitle={item.name}
      bodyClassName="px-0 pt-1 pb-0"
      footerClassName="px-4"
      footer={
        <div className="flex items-center gap-3">
          <div className={DINER.stepperShell}>
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className={cn(DINER.stepperButton, "text-lg", DINER.pressable)}
            >
              −
            </button>
            <span className="w-8 text-center font-bold text-gray-900">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className={cn(DINER.stepperButton, "text-lg", DINER.pressable)}
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!allGroupsSatisfied}
            className={cn("flex-1", DINER.primaryCta, DINER.ctaPress)}
          >
            Add to order · ₦{total.toLocaleString()}
          </button>
        </div>
      }
    >
      {/* Item image */}
      <div className="bg-white px-5 pb-4 pt-1">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
          {item.photoUrl ? (
            <Image
              src={item.photoUrl}
              alt={item.name}
              fill
              unoptimized
              sizes="448px"
              className="object-contain p-2"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#f9fafb_0%,#f3f4f6_100%)] text-gray-400">
              <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-gray-200 bg-white">
                <BowlFood size={48} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6 px-5 pb-7 pt-4">
        <div className="space-y-2">
          <h2 className={DINER.sheetTitle}>{item.name}</h2>
          {item.description && (
            <p className="text-sm leading-relaxed text-gray-600">
              {item.description}
            </p>
          )}
          <p className={cn(DINER.stat, "pt-1")}>
            ₦{item.price.toLocaleString()}
          </p>
        </div>

        {/* Modifier groups */}
        {item.modifierGroups.map((group) => {
          const selected = selectedModifiers[group.id] ?? [];
          return (
            <div key={group.id} className="space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-gray-900">
                  {group.name}
                </p>
                <div className="flex shrink-0 items-center gap-1.5">
                  {group.required ? (
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      Required
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-400">
                      Optional
                    </span>
                  )}
                  {group.maxSelections > 1 && (
                    <span className={DINER.caption}>
                      Choose up to {group.maxSelections}
                    </span>
                  )}
                </div>
              </div>
              <div className={DINER.listGap}>
                {group.options.map((option) => {
                  const isSelected = selected.some((o) => o.id === option.id);
                  return (
                    <button
                      type="button"
                      key={option.id}
                      onClick={() => toggleModifier(group, option)}
                      className={cn(
                        DINER.selectionCard,
                        isSelected
                          ? DINER.selectionCardSelected
                          : "bg-gray-50 text-gray-700",
                        DINER.pressable,
                      )}
                    >
                      <span className="font-semibold">{option.name}</span>
                      <span
                        className={cn(
                          "text-sm",
                          isSelected ? "text-gray-300" : "text-gray-400",
                        )}
                      >
                        {option.priceDelta > 0
                          ? `+₦${option.priceDelta.toLocaleString()}`
                          : "Free"}
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
          <label
            htmlFor="item-special-note"
            className="mb-2 block text-sm font-medium text-gray-900"
          >
            Special note{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="item-special-note"
            value={specialNote}
            onChange={(e) => setSpecialNote(e.target.value)}
            placeholder="No onions, extra spicy, etc."
            className={cn(DINER.textarea, "h-20 text-base")}
          />
        </div>
      </div>
    </BottomSheet>
  );
}
