"use client";

import { useState } from "react";
import type { MenuItem, ModifierGroup, ModifierOption } from "@/lib/mockData";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";
import { BowlFood, Plus, Minus } from "@phosphor-icons/react";

// Standard Components
import { Button } from "./ui/Button";
import { ModalContainer } from "./ui/ModalContainer";
import { Input } from "./ui/Input";

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

  const toggleModifier = (group: ModifierGroup, option: ModifierOption) => {
    setSelectedModifiers((prev) => {
      const current = prev[group.id] ?? [];
      const alreadySelected = current.find((o) => o.id === option.id);

      if (group.maxSelections === 1) {
        return { ...prev, [group.id]: [option] };
      }

      if (alreadySelected) {
        return { ...prev, [group.id]: current.filter((o) => o.id !== option.id) };
      }
      if (current.length >= group.maxSelections) return prev;
      return { ...prev, [group.id]: [...current, option] };
    });
  };

  const handleAddToCart = () => {
    addItem(item, quantity, selectedModifiers, specialNote);
    handleClose();
  };

  const handleClose = () => {
    setQuantity(1);
    setSelectedModifiers({});
    setSpecialNote("");
    onClose();
  };

  const total = (item.price + Object.values(selectedModifiers).flat().reduce((sum, opt) => sum + opt.priceDelta, 0)) * quantity;

  const allGroupsSatisfied = item.modifierGroups.every((g) => {
    if (!g.required) return true;
    return (selectedModifiers[g.id]?.length ?? 0) >= (g.minSelections ?? 1);
  });

  return (
    <ModalContainer
      type="sheet"
      isOpen={open}
      onDismiss={handleClose}
      title={item.name}
      subtitle={item.description}
    >
      <div className="space-y-[var(--space-6)] py-[var(--space-2)]">
        {/* Item image placeholder */}
        <div className="w-full h-40 bg-[var(--color-surface)] rounded-[var(--radius-lg)] flex items-center justify-center text-[var(--color-muted-fg)]">
          <BowlFood size={64} weight="duotone" />
        </div>

        {/* Modifier groups */}
        {item.modifierGroups.map((group) => {
          const selected = selectedModifiers[group.id] ?? [];
          return (
            <div key={group.id} className="space-y-[var(--space-3)]">
              <div className="flex items-center justify-between">
                <p className="text-[var(--font-size-body)] font-bold text-[var(--color-primary)]">{group.name}</p>
                <div className="flex items-center gap-2">
                  {group.required ? (
                    <span className="text-[10px] font-bold text-[var(--color-background)] bg-[var(--color-error)] px-2 py-0.5 rounded-full uppercase tracking-wider">Required</span>
                  ) : (
                    <span className="text-[10px] font-bold text-[var(--color-muted)] bg-[var(--color-surface)] px-2 py-0.5 rounded-full uppercase tracking-wider">Optional</span>
                  )}
                </div>
              </div>
              <div className="space-y-[var(--space-2)]">
                {group.options.map((option) => {
                  const isSelected = selected.some((o) => o.id === option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => toggleModifier(group, option)}
                      className={cn(
                        "w-full flex items-center justify-between p-[var(--space-3)] rounded-[var(--radius-md)] border text-sm transition-all",
                        isSelected
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-background)]"
                          : "border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-muted-fg)] hover:border-[var(--color-muted)]"
                      )}
                    >
                      <span className="font-semibold">{option.name}</span>
                      <span className={cn("text-xs font-medium", isSelected ? "text-[var(--color-background)]/80" : "text-[var(--color-muted)]")}>
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
        <Input 
          type="textarea"
          label="Special Note"
          placeholder="e.g. No onions, extra spicy..."
          value={specialNote}
          onChange={(e) => setSpecialNote(e.target.value)}
        />

        {/* Quantity + Add button */}
        <div className="flex items-center gap-[var(--space-3)] pt-[var(--space-2)] sticky bottom-0 bg-[var(--color-background)]">
          <div className="flex items-center gap-1 bg-[var(--color-surface)] rounded-full p-1 border border-[var(--color-border)]">
            <Button
              variant="icon"
              size="icon-sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="bg-[var(--color-background)]"
            >
              <Minus size={14} weight="bold" />
            </Button>
            <span className="w-8 text-center font-black text-[var(--color-primary)]">{quantity}</span>
            <Button
              variant="icon"
              size="icon-sm"
              onClick={() => setQuantity(quantity + 1)}
              className="bg-[var(--color-background)]"
            >
              <Plus size={14} weight="bold" />
            </Button>
          </div>

          <Button
            fullWidth
            size="lg"
            disabled={!allGroupsSatisfied}
            onClick={handleAddToCart}
          >
            Add to order · ₦{total.toLocaleString()}
          </Button>
        </div>
      </div>
    </ModalContainer>
  );
}
