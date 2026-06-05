"use client";

import { useEffect, useState } from "react";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { ds } from "@/lib/design-tokens";
import type { MenuCategory } from "@/lib/mockData";
import { useMenuStore } from "@/store/menu";

interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  existingCategory?: MenuCategory;
}

export function CategoryForm({
  open,
  onClose,
  existingCategory,
}: CategoryFormProps) {
  const { addCategory, updateCategory } = useMenuStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset form each time the dialog reopens
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
      title={existingCategory ? "Edit category" : "Add category"}
    >
      <div className={ds.form.stack}>
        <div className={ds.form.field}>
          <label htmlFor="category-name" className={ds.input.label}>
            Category name <span className="text-red-500">*</span>
          </label>
          <input
            id="category-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Starters, Mains, Drinks"
            // biome-ignore lint/a11y/noAutofocus: intentional focus on first field when dialog opens
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className={ds.input.base}
          />
        </div>

        <div className={ds.form.field}>
          <label htmlFor="category-description" className={ds.input.label}>
            Description{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="category-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description shown to diners"
            className={ds.input.base}
          />
        </div>

        <div className={ds.form.actions}>
          <button type="button" onClick={onClose} className={ds.btn.ghost}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className={ds.btn.primary}
          >
            {existingCategory ? "Save changes" : "Add category"}
          </button>
        </div>
      </div>
    </ResponsiveDialog>
  );
}
