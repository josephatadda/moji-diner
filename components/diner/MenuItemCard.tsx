"use client";

import { useState } from "react";
import type { MenuItem } from "@/lib/mockData";
import { useCartStore } from "@/store/cart";
import { ItemDetailModal } from "./ItemDetailModal";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BowlFood, Star } from "@phosphor-icons/react";

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

export function MenuItemCard({ item, restaurantSlug, tableNumber }: MenuItemCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { items: cartItems, addItem, updateQuantity, removeItem } = useCartStore();

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
          "flex gap-3 p-3 rounded-2xl border transition-all",
          item.isAvailable
            ? "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"
            : "bg-gray-50 border-gray-100 opacity-60"
        )}
      >
        {/* Thumbnail */}
        <div
          onClick={() => item.isAvailable && setModalOpen(true)}
          className={cn(
            "flex-none w-20 h-20 rounded-xl overflow-hidden relative",
            item.isAvailable && "cursor-pointer"
          )}
        >
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500">
            <span className="text-3xl"><BowlFood /></span>
          </div>
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-gray-100/80 flex items-center justify-center">
              <span className="text-[10px] font-bold text-gray-500 bg-white px-1.5 py-0.5 rounded-full">
                Sold Out
              </span>
            </div>
          )}
          {item.isFeatured && item.isAvailable && (
            <span className="absolute top-1 left-1 text-[9px] font-bold bg-orange-500 text-white p-1 rounded-full flex items-center justify-center">
              <Star />
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div
            onClick={() => item.isAvailable && setModalOpen(true)}
            className={item.isAvailable ? "cursor-pointer" : undefined}
          >
            <p className="font-semibold text-gray-900 text-sm leading-snug">{item.name}</p>
            {item.description && (
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap mt-1.5">
              {item.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                    TAG_COLORS[tag] ?? "bg-gray-100 text-gray-600"
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Price + action */}
          <div className="flex items-center justify-between mt-2">
            <div>
              <span className="font-bold text-gray-900 text-sm">
                ₦{item.price.toLocaleString()}
              </span>
              {item.preparationTimeMins > 0 && (
                <span className="text-[10px] text-gray-400 ml-1.5">
                  ~{item.preparationTimeMins}m
                </span>
              )}
            </div>

            {item.isAvailable ? (
              cartEntry && !hasModifiers ? (
                // Quantity stepper
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQuantity(cartEntry.cartId, cartEntry.quantity - 1)}
                    className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-[0.97] transition-all ease-out flex items-center justify-center text-gray-700 font-bold text-sm"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-gray-900">
                    {cartEntry.quantity}
                  </span>
                  <button
                    onClick={() => addItem(item, 1, {})}
                    className="w-7 h-7 rounded-full bg-gray-900 hover:bg-gray-700 active:scale-[0.97] transition-all ease-out flex items-center justify-center text-white font-bold text-sm"
                  >
                    +
                  </button>
                </div>
              ) : (
                // Add button
                <button
                  onClick={handleAddDirect}
                  className="flex items-center gap-1 bg-gray-900 text-white text-xs font-bold px-3 py-2 rounded-full hover:bg-gray-700 active:scale-[0.97] transition-all ease-out"
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

      {/* Item detail / modifier modal */}
      <ItemDetailModal
        item={item}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
