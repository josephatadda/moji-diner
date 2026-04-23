"use client";

import { useState } from "react";
import type { MenuCategory } from "@/lib/mockData";
import { useMenuStore } from "@/store/menu";
import { DashboardMenuItemCard } from "./DashboardMenuItemCard";
import { MenuItemForm } from "./MenuItemForm";
import { CategoryForm } from "./CategoryForm";
import { cn } from "@/lib/utils";
import { CaretRight, PencilSimple, Trash } from "@phosphor-icons/react";

interface CategoryCardProps {
  category: MenuCategory;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const { deleteCategory } = useMenuStore();
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [editCategoryOpen, setEditCategoryOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleDeleteCategory = () => {
    if (category.items.length > 0) {
      alert("Move or delete items in this category first.");
      return;
    }
    if (window.confirm(`Delete category "${category.name}"?`)) {
      deleteCategory(category.id);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Category header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-2 flex-1 text-left"
          >
            <span className={cn("text-xs text-gray-400 transition-transform", collapsed ? "" : "rotate-90")}>
              <CaretRight />
            </span>
            <div>
              <p className="font-bold text-gray-900 text-sm">{category.name}</p>
              <p className="text-xs text-gray-400">{category.items.length} item{category.items.length !== 1 ? "s" : ""}</p>
            </div>
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setAddItemOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
            >
              + Item
            </button>
            <button
              onClick={() => setEditCategoryOpen(true)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all text-sm"
            >
              <PencilSimple />
            </button>
            <button
              onClick={handleDeleteCategory}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all text-sm"
            >
              <Trash />
            </button>
          </div>
        </div>

        {/* Items */}
        {!collapsed && (
          <div>
            {category.items.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-gray-400">No items yet</p>
                <button
                  onClick={() => setAddItemOpen(true)}
                  className="mt-2 text-sm font-semibold text-orange-500 hover:text-orange-600"
                >
                  + Add Item
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {category.items.map((item) => (
                  <DashboardMenuItemCard
                    key={item.id}
                    item={item}
                    categoryId={category.id}
                    allCategories={[{ id: category.id, name: category.name }]}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <MenuItemForm
        open={addItemOpen}
        onClose={() => setAddItemOpen(false)}
        categoryId={category.id}
      />
      <CategoryForm
        open={editCategoryOpen}
        onClose={() => setEditCategoryOpen(false)}
        existingCategory={category}
      />
    </>
  );
}
