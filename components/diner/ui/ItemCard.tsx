"use client";

import { cn } from "@/lib/utils";
import { Plus, Minus, CaretRight, BowlFood } from "@phosphor-icons/react";
import { Button } from "./Button";

interface ItemCardProps {
  variant?: "menu" | "cart" | "order" | "selectable";
  name: string;
  price: number;
  description?: string;
  quantity?: number;
  modifiers?: string[];
  note?: string;
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdateQuantity?: (q: number) => void;
  onClick?: () => void;
}

export function ItemCard({
  variant = "menu",
  name,
  price,
  description,
  quantity,
  modifiers,
  note,
  isSelected,
  onSelect,
  onUpdateQuantity,
  onClick,
}: ItemCardProps) {
  const isMenu = variant === "menu";
  const isCart = variant === "cart";
  const isOrder = variant === "order";
  const isSelectable = variant === "selectable";

  return (
    <div 
      onClick={onClick || onSelect}
      className={cn(
        "group relative flex gap-[var(--space-3)] p-[var(--space-3)] bg-[var(--color-background)] border transition-all duration-200",
        isSelectable ? "rounded-[var(--radius-lg)]" : "rounded-[var(--radius-lg)] border-[var(--color-border)] shadow-sm",
        isSelectable && isSelected ? "border-[var(--color-primary)] bg-[var(--color-surface)]" : isSelectable ? "border-[var(--color-border)]" : "",
        onClick || onSelect ? "cursor-pointer active:scale-[0.99]" : ""
      )}
    >
      <div className="w-14 h-14 bg-[var(--color-surface)] rounded-[var(--radius-md)] flex items-center justify-center text-[var(--color-muted-fg)] flex-none">
        <BowlFood size={28} weight="duotone" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex justify-between items-start">
          <h4 className="text-[var(--font-size-body)] font-bold text-[var(--color-primary)] leading-tight truncate">
            {isOrder && quantity && <span className="text-[var(--color-primary)] mr-1.5 opacity-60">{quantity}×</span>}
            {name}
          </h4>
          {!isCart && !isOrder && <span className="text-[var(--font-size-body)] font-black text-[var(--color-primary)]">₦{price.toLocaleString()}</span>}
        </div>
        {description && isMenu && <p className="text-[var(--font-size-muted)] text-[var(--color-muted)] mt-1 line-clamp-2">{description}</p>}
        {modifiers && modifiers.length > 0 && (
          <p className="text-[var(--font-size-muted)] text-[var(--color-muted-fg)] mt-0.5 truncate italic">
            {modifiers.join(", ")}
          </p>
        )}
        {note && <p className="text-[var(--font-size-muted)] text-[var(--color-primary)] opacity-60 mt-0.5 italic">"{note}"</p>}
        {(isCart || isOrder) && (
          <p className="text-[var(--font-size-body)] font-black text-[var(--color-primary)] mt-1">₦{price.toLocaleString()}</p>
        )}
      </div>
      {isCart && onUpdateQuantity && quantity !== undefined && (
        <div className="flex items-center gap-1.5 flex-none ml-2">
          <Button variant="icon" size="icon-xs" onClick={(e) => { e.stopPropagation(); onUpdateQuantity(quantity - 1); }} className="bg-[var(--color-surface)]">
            <Minus size={12} weight="bold" />
          </Button>
          <span className="w-5 text-center text-sm font-black text-[var(--color-primary)]">{quantity}</span>
          <Button variant="icon" size="icon-xs" onClick={(e) => { e.stopPropagation(); onUpdateQuantity(quantity + 1); }} className="bg-[var(--color-primary)] text-[var(--color-background)]">
            <Plus size={12} weight="bold" />
          </Button>
        </div>
      )}
      {isMenu && <CaretRight size={16} className="text-[var(--color-muted-fg)] opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all self-center" />}
      {isSelectable && (
        <div className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center self-center transition-all",
          isSelected ? "bg-[var(--color-primary)] border-[var(--color-primary)]" : "border-[var(--color-border)] bg-transparent"
        )}>
          {isSelected && <span className="w-1.5 h-1.5 bg-[var(--color-background)] rounded-full" />}
        </div>
      )}
    </div>
  );
}
