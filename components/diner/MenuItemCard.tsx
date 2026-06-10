"use client";

import { BowlFood, Star } from "@phosphor-icons/react";
import Image from "next/image";
import { useState } from "react";
import type { MenuItem } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { ItemDetailModal } from "./ItemDetailModal";
import { DINER } from "./ui/diner-tokens";

interface MenuItemCardProps {
  item: MenuItem;
  restaurantSlug: string;
  tableNumber: number;
}

const TAG_COLORS: Record<string, string> = {
  Spicy: "bg-red-100 text-red-700",
  Vegetarian: "bg-green-100 text-green-700",
  Vegan: "bg-emerald-100 text-emerald-700",
  "Gluten-Free": "bg-yellow-100 text-yellow-700",
  Bestseller: "bg-orange-100 text-orange-700",
  New: "bg-blue-100 text-blue-700",
  "Chef's Special": "bg-purple-100 text-purple-700",
};

export function MenuItemCard({ item }: MenuItemCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { items: cartItems, addItem, updateQuantity } = useCartStore();

  const cartEntry = cartItems.find((ci) => ci.menuItemId === item.id);
  const hasModifiers = item.modifierGroups.length > 0;

  const handleAddDirect = () => {
    if (!item.isAvailable) return;
    if (hasModifiers) {
      setModalOpen(true);
    } else {
      addItem(item, 1, {});
    }
  };

  return (
    <>
      <div
        className={cn(
          "group flex gap-3 p-3",
          item.isAvailable
            ? DINER.itemCard
            : "bg-gray-50 border border-gray-100 opacity-60 rounded-2xl",
        )}
      >
        {/* Thumbnail */}
        <button
          type="button"
          onClick={() => item.isAvailable && setModalOpen(true)}
          disabled={!item.isAvailable}
          className={cn(
            "flex-none w-24 h-24 rounded-xl overflow-hidden relative border border-gray-100 bg-gray-50",
            item.isAvailable && "cursor-pointer",
          )}
        >
          {item.photoUrl ? (
            <Image
              src={item.photoUrl}
              alt={item.name}
              fill
              unoptimized
              sizes="96px"
              className="object-cover transition-transform duration-[400ms] ease-[var(--ease-out-strong)] group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-400">
              <BowlFood size={28} />
            </div>
          )}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-gray-100/80 flex items-center justify-center">
              <span className="text-[10px] font-bold text-gray-500 bg-white px-1.5 py-0.5 rounded-full">
                Sold Out
              </span>
            </div>
          )}
          {item.isFeatured && item.isAvailable && (
            <span className="absolute top-1 left-1 text-[9px] font-bold bg-orange-500 text-white p-1 rounded-full flex items-center justify-center">
              <Star size={10} weight="fill" />
            </span>
          )}
        </button>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => item.isAvailable && setModalOpen(true)}
            disabled={!item.isAvailable}
            className={cn(
              "block w-full text-left",
              item.isAvailable && "cursor-pointer",
            )}
          >
            <p className={cn(DINER.cardTitle, "leading-snug")}>{item.name}</p>
            {item.description && (
              <p
                className={cn(
                  DINER.caption,
                  "mt-1 line-clamp-2 leading-relaxed",
                )}
              >
                {item.description}
              </p>
            )}
          </button>

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap mt-1.5">
              {item.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                    TAG_COLORS[tag] ?? "bg-gray-100 text-gray-600",
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Price + action */}
          <div className="flex items-center justify-between gap-2 mt-2.5">
            <div>
              <span className={DINER.price}>
                ₦{item.price.toLocaleString()}
              </span>
              {item.preparationTimeMins > 0 && (
                <span className={cn(DINER.caption, "ml-1.5")}>
                  ~{item.preparationTimeMins}m
                </span>
              )}
            </div>

            {item.isAvailable ? (
              cartEntry && !hasModifiers ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(cartEntry.cartId, cartEntry.quantity - 1)
                    }
                    className={cn(
                      DINER.stepperButton,
                      "h-9 w-9",
                      DINER.pressable,
                    )}
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm font-bold text-gray-900">
                    {cartEntry.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => addItem(item, 1, {})}
                    className={cn(
                      DINER.stepperButtonPrimary,
                      "h-9 w-9",
                      DINER.pressable,
                    )}
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAddDirect}
                  className={cn(
                    "flex h-9 flex-none items-center gap-1 rounded-full bg-gray-900 px-3 text-xs font-bold text-white hover:bg-gray-800",
                    DINER.pressable,
                  )}
                >
                  <span>+</span>
                  <span>Add</span>
                  {hasModifiers && <span className="text-gray-400">›</span>}
                </button>
              )
            ) : null}
          </div>
        </div>
      </div>

      <ItemDetailModal
        item={item}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
