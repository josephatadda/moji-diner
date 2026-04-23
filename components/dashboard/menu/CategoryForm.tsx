"use client";

import { useState, useEffect } from "react";
import type { MenuCategory } from "@/lib/mockData";
import { useMenuStore } from "@/store/menu";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";

interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  existingCategory?: MenuCategory;
}

export function CategoryForm({ open, onClose, existingCategory }: CategoryFormProps) {
  const { addCategory, updateCategory } = useMenuStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (existingCategory) {
      setName(existingCategory.name);
      setDescription(existingCategory.description ?? "");
    } else {
      setName("");
      setDescription("");
    }
  }, [existingCategory, open]);

  const handleSave = () => {
    if (!name.trim()) return;
    if (existingCategory) {
      updateCategory(existingCategory.id, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
    } else {
      const newCat: MenuCategory = {
        id: `cat-${Date.now()}`,
        restaurantId: "rest-001",
        name: name.trim(),
        description: description.trim() || undefined,
        sortOrder: 999,
        items: [],
      };
      addCategory(newCat);
    }
    onClose();
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title={existingCategory ? "Edit Category" : "Add Category"}
      icon={<span>📁</span>}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Category name <span className="text-red-500">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Starters, Mains, Drinks"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="w-full h-12 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Description <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description shown to diners"
            className="w-full h-12 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 transition-colors"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 h-12 border border-gray-200 text-sm font-semibold text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 h-12 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition-all disabled:opacity-40"
          >
            {existingCategory ? "Save Changes" : "Add Category"}
          </button>
        </div>
      </div>
    </ResponsiveDialog>
  );
}
