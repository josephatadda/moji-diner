"use client";

import type { MenuCategory } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { ShoppingCart, BowlFood } from "@phosphor-icons/react";

const TAG_COLORS: Record<string, string> = {
  Spicy: "bg-red-100 text-red-600",
  Vegetarian: "bg-green-100 text-green-600",
  Vegan: "bg-emerald-100 text-emerald-600",
  "Gluten-Free": "bg-yellow-100 text-yellow-700",
  Bestseller: "bg-orange-100 text-orange-600",
  New: "bg-blue-100 text-blue-600",
  "Chef's Special": "bg-purple-100 text-purple-600",
};

interface MenuPreviewProps {
  categories: MenuCategory[];
  restaurantName: string;
}

export function MenuPreview({ categories, restaurantName }: MenuPreviewProps) {
  return (
    /* Phone frame wrapper — always at 375px reference width */
    <div
      className="mx-auto bg-white rounded-[2rem] overflow-hidden shadow-2xl border-4 border-gray-800"
      style={{ width: 280, minHeight: 520 }}
    >
      {/* Status bar mock */}
      <div className="bg-gray-900 px-4 py-1.5 flex items-center justify-between">
        <span className="text-white text-[9px] font-semibold">9:41</span>
        <div className="flex items-center gap-1">
          <span className="text-white text-[9px]">●●●</span>
          <span className="text-white text-[9px]">WiFi</span>
          <span className="text-white text-[9px]">100%</span>
        </div>
      </div>

      {/* Restaurant header */}
      <div className="bg-white border-b border-gray-100 px-3 py-2.5 flex items-center justify-between">
        <div>
          <p className="font-bold text-gray-900 text-xs leading-tight truncate max-w-[140px]">{restaurantName}</p>
          <p className="text-[9px] text-gray-400 mt-0.5">Table 1</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-900 rounded-full px-2 py-1">
          <span className="text-[12px] text-white"><ShoppingCart /></span>
          <span className="text-[9px] text-white font-bold">Cart</span>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 overflow-x-auto px-2 py-1.5 border-b border-gray-100 scrollbar-none">
        {categories.map((cat, i) => (
          <span
            key={cat.id}
            className={cn(
              "flex-none px-2.5 py-1 rounded-full text-[9px] font-semibold whitespace-nowrap",
              i === 0 ? "bg-gray-900 text-white" : "text-gray-400 bg-gray-100"
            )}
          >
            {cat.name}
          </span>
        ))}
      </div>

      {/* Menu items preview */}
      <div className="overflow-y-auto" style={{ maxHeight: 360 }}>
        {categories.map((category) => (
          <div key={category.id}>
            {/* Category header */}
            <div className="px-3 pt-3 pb-1">
              <p className="text-[10px] font-bold text-gray-900">{category.name}</p>
            </div>

            {/* Items */}
            {category.items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex gap-2 px-3 py-2 border-b border-gray-50",
                  !item.isAvailable && "opacity-40"
                )}
              >
                {/* Mini thumb */}
                <div className="flex-none w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center relative text-gray-500">
                  <span className="text-base"><BowlFood /></span>
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-white/70 rounded-lg flex items-center justify-center">
                      <span className="text-[7px] font-bold text-gray-500">Out</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-gray-900 leading-tight line-clamp-1">{item.name}</p>
                  <p className="text-[8px] text-orange-600 font-bold mt-0.5">₦{item.price.toLocaleString()}</p>
                </div>

                {/* Add btn */}
                {item.isAvailable && (
                  <div className="flex-none w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold leading-none">+</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
