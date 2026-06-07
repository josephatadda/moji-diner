"use client";

import { useEffect, useState } from "react";
import {
  DashboardButton,
  DashboardField,
  DashboardInput,
  DashboardModal,
  ds,
} from "@/components/dashboard/ui";
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
    <DashboardModal
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title={existingCategory ? "Edit category" : "Add category"}
      footer={
        <div className="flex justify-end gap-2">
          <DashboardButton variant="ghost" onClick={onClose}>
            Cancel
          </DashboardButton>
          <DashboardButton onClick={handleSave} disabled={!name.trim()}>
            {existingCategory ? "Save changes" : "Add category"}
          </DashboardButton>
        </div>
      }
    >
      <div className={ds.form.stack}>
        <DashboardField id="category-name" label="Category name">
          <DashboardInput
            id="category-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Starters, Mains, Drinks"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
        </DashboardField>

        <DashboardField id="category-description" label="Description" optional>
          <DashboardInput
            id="category-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description shown to diners"
          />
        </DashboardField>
      </div>
    </DashboardModal>
  );
}
