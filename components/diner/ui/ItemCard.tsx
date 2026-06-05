"use client";

import { BowlFood, Check } from "@phosphor-icons/react";
import { formatModifiers, hasModifiers } from "@/lib/diner-utils";
import { cn } from "@/lib/utils";
import type { CartItem } from "@/store/cart";
import { DINER } from "./diner-tokens";

interface ItemCardBaseProps {
  item: CartItem;
}

interface CartVariantProps extends ItemCardBaseProps {
  variant: "cart";
  onIncrement: () => void;
  onDecrement: () => void;
}

interface OrderVariantProps extends ItemCardBaseProps {
  variant: "order";
}

interface SelectableVariantProps extends ItemCardBaseProps {
  variant: "selectable";
  selected: boolean;
  onToggle: () => void;
}

type ItemCardProps =
  | CartVariantProps
  | OrderVariantProps
  | SelectableVariantProps;

export function ItemCard(props: ItemCardProps) {
  const { item, variant } = props;
  const mods = hasModifiers(item.selectedModifiers)
    ? formatModifiers(item.selectedModifiers)
    : null;

  if (variant === "order") {
    return (
      <div
        className={cn(DINER.itemCard, "flex items-center gap-3 p-3 text-sm")}
      >
        <div
          className={cn(
            DINER.itemMediaFrame,
            "w-11 h-11 flex items-center justify-center flex-none text-gray-400",
          )}
        >
          <BowlFood size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn(DINER.cardTitle, "leading-tight")}>
            <span className="text-orange-500 mr-1.5 font-bold">
              {item.quantity}×
            </span>
            {item.itemName}
          </p>
          {mods && <p className={DINER.caption}>{mods}</p>}
          {item.specialNote && (
            <p className="text-xs text-blue-500 mt-0.5 italic">
              "{item.specialNote}"
            </p>
          )}
        </div>
        <span className={cn(DINER.price, "ml-3 flex-none")}>
          ₦{item.lineTotal.toLocaleString()}
        </span>
      </div>
    );
  }

  if (variant === "selectable") {
    const { selected, onToggle } = props as SelectableVariantProps;
    return (
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-full text-left flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-colors",
          selected
            ? "border-green-500 bg-white"
            : "border-gray-100 bg-white hover:border-gray-300",
          DINER.pressable,
        )}
      >
        <div
          className={cn(
            "w-5 h-5 rounded-md border flex items-center justify-center flex-none",
            selected
              ? "border-green-500 bg-green-500 text-white"
              : "border-gray-300",
          )}
        >
          {selected && <Check size={14} weight="bold" />}
        </div>
        <div
          className={cn(
            DINER.itemMediaFrame,
            "w-11 h-11 flex items-center justify-center flex-none text-gray-400",
          )}
        >
          <BowlFood size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={DINER.cardTitle}>
            {item.quantity}× {item.itemName}
          </p>
          <p className={cn(DINER.price, "mt-0.5")}>
            ₦{item.lineTotal.toLocaleString()}
          </p>
        </div>
      </button>
    );
  }

  // variant === "cart"
  const { onIncrement, onDecrement } = props as CartVariantProps;
  return (
    <div className={cn(DINER.itemCard, "flex items-center gap-3 p-3")}>
      <div
        className={cn(
          DINER.itemMediaFrame,
          "w-12 h-12 flex items-center justify-center flex-none text-gray-400",
        )}
      >
        <BowlFood size={20} />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <p className={cn(DINER.cardTitle, "leading-tight truncate")}>
          {item.itemName}
        </p>
        {mods && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">{mods}</p>
        )}
        {item.specialNote && (
          <p className="text-xs text-blue-500 mt-0.5 italic truncate">
            "{item.specialNote}"
          </p>
        )}
        <p className={cn(DINER.price, "mt-1")}>
          ₦{item.lineTotal.toLocaleString()}
        </p>
      </div>
      <div className="flex items-center gap-1.5 flex-none">
        <button
          type="button"
          onClick={onDecrement}
          className={cn(DINER.stepperButton, "h-9 w-9", DINER.pressable)}
        >
          −
        </button>
        <span className="w-5 text-center text-sm font-bold">
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          className={cn(DINER.stepperButtonPrimary, "h-9 w-9", DINER.pressable)}
        >
          +
        </button>
      </div>
    </div>
  );
}
