"use client";

import type { CartItem } from "@/store/cart";
import { cn } from "@/lib/utils";
import { formatModifiers, hasModifiers } from "@/lib/diner-utils";
import { BowlFood } from "@phosphor-icons/react";
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

type ItemCardProps = CartVariantProps | OrderVariantProps | SelectableVariantProps;

export function ItemCard(props: ItemCardProps) {
  const { item, variant } = props;
  const mods = hasModifiers(item.selectedModifiers) ? formatModifiers(item.selectedModifiers) : null;

  if (variant === "order") {
    return (
      <div className="flex justify-between items-center px-4 py-3 text-sm">
        <div className="min-w-0 flex-1">
          <p className={DINER.cardTitle}>{item.quantity}× {item.itemName}</p>
          {mods && <p className={DINER.caption}>{mods}</p>}
          {item.specialNote && <p className="text-xs text-blue-500 mt-0.5 italic">"{item.specialNote}"</p>}
        </div>
        <span className={cn(DINER.price, "ml-3 flex-none")}>₦{item.lineTotal.toLocaleString()}</span>
      </div>
    );
  }

  if (variant === "selectable") {
    const { selected, onToggle } = props as SelectableVariantProps;
    return (
      <div
        onClick={onToggle}
        className={cn(
          "flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-colors",
          selected ? "border-gray-900 bg-gray-50" : "border-gray-100 bg-white hover:border-gray-300"
        )}
      >
        <div className={cn(
          "w-5 h-5 rounded border flex items-center justify-center flex-none",
          selected ? "bg-gray-900 border-gray-900 text-white" : "border-gray-300"
        )}>
          {selected && <span className="text-xs font-bold">✓</span>}
        </div>
        <div className="flex-1 min-w-0">
          <p className={DINER.cardTitle}>{item.quantity}× {item.itemName}</p>
          <p className={cn(DINER.price, "mt-0.5")}>₦{item.lineTotal.toLocaleString()}</p>
        </div>
      </div>
    );
  }

  // variant === "cart"
  const { onIncrement, onDecrement } = props as CartVariantProps;
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
      <div className="w-12 h-12 bg-white shadow-sm border border-gray-100 rounded-xl flex items-center justify-center flex-none text-gray-400">
        <BowlFood size={20} />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <p className={cn(DINER.cardTitle, "leading-tight truncate")}>{item.itemName}</p>
        {mods && <p className="text-xs text-gray-500 mt-0.5 truncate">{mods}</p>}
        {item.specialNote && <p className="text-xs text-blue-500 mt-0.5 italic truncate">"{item.specialNote}"</p>}
        <p className={cn(DINER.price, "mt-1")}>₦{item.lineTotal.toLocaleString()}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-none">
        <button
          onClick={onDecrement}
          className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 font-bold active:scale-[0.97] transition-all ease-out"
        >
          −
        </button>
        <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
        <button
          onClick={onIncrement}
          className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold active:scale-[0.97] transition-all ease-out"
        >
          +
        </button>
      </div>
    </div>
  );
}
