"use client";

import { useState } from "react";
import type { MenuItem } from "@/lib/mockData";
import { useMenuStore } from "@/store/menu";
import { MenuItemForm } from "./MenuItemForm";
import { cn } from "@/lib/utils";
import { BowlFood, PencilSimple, Trash, Star } from "@phosphor-icons/react";

interface DashboardMenuItemCardProps {
  item: MenuItem;
  categoryId: string;
  allCategories: { id: string; name: string }[];
}

export function DashboardMenuItemCard({ item, categoryId, allCategories }: DashboardMenuItemCardProps) {
  const { toggleAvailability, deleteItem } = useMenuStore();
  const [editOpen, setEditOpen] = useState(false);

  const handleDelete = () => {
    if (window.confirm(`Delete "${item.name}"?`)) {
      deleteItem(item.id);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group">
        {/* Thumbnail */}
        <div
          className={cn(
            "flex-none w-14 h-14 rounded-xl overflow-hidden relative cursor-pointer",
            !item.isAvailable && "opacity-50"
          )}
          onClick={() => setEditOpen(true)}
        >
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500">
            <span className="text-2xl"><BowlFood /></span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setEditOpen(true)}>
          <div className="flex items-center gap-2">
            <p className={cn("font-semibold text-sm", item.isAvailable ? "text-gray-900" : "text-gray-400")}>
              {item.name}
            </p>
            {item.isFeatured && <span className="inline-flex items-center gap-1 font-bold text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full"><Star weight="fill" /> Featured</span>}
            {!item.isAvailable && (
              <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">Sold Out</span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">₦{item.price.toLocaleString()}</p>
          {item.tags.length > 0 && (
            <p className="text-[10px] text-gray-300 mt-0.5">{item.tags.slice(0, 2).join(" · ")}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-none">
          {/* Availability toggle */}
          <button
            onClick={() => toggleAvailability(item.id)}
            title={item.isAvailable ? "Mark sold out" : "Mark available"}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none min-w-[44px]",
              item.isAvailable ? "bg-green-500" : "bg-gray-200"
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                item.isAvailable ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>

          {/* Edit */}
          <button
            onClick={() => setEditOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all text-sm opacity-0 group-hover:opacity-100"
          >
            <PencilSimple />
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all text-sm opacity-0 group-hover:opacity-100"
          >
            <Trash />
          </button>
        </div>
      </div>

      <MenuItemForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        categoryId={categoryId}
        existingItem={item}
      />
    </>
  );
}
