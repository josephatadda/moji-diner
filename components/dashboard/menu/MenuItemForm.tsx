"use client";

import { Warning } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import {
  DashboardButton,
  DashboardField,
  DashboardFileUpload,
  DashboardInput,
  DashboardModal,
  DashboardTextarea,
  ds,
  Toggle,
} from "@/components/dashboard/ui";
import type { Allergen, MenuItem, Tag } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { useMenuStore } from "@/store/menu";

const ALL_TAGS: Tag[] = [
  "Spicy",
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Bestseller",
  "New",
  "Chef's Special",
];
const ALL_ALLERGENS: Allergen[] = ["Nuts", "Dairy", "Gluten", "Eggs", "Fish"];

interface MenuItemFormProps {
  open: boolean;
  onClose: () => void;
  categoryId: string;
  existingItem?: MenuItem;
}

export function MenuItemForm({
  open,
  onClose,
  categoryId,
  existingItem,
}: MenuItemFormProps) {
  const { addItem, updateItem } = useMenuStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [prepTime, setPrepTime] = useState("15");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<Allergen[]>([]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset form each time the sheet reopens
  useEffect(() => {
    if (existingItem) {
      setName(existingItem.name);
      setDescription(existingItem.description);
      setPrice(String(existingItem.price));
      setIsAvailable(existingItem.isAvailable);
      setIsFeatured(existingItem.isFeatured);
      setPrepTime(String(existingItem.preparationTimeMins));
      setSelectedTags(existingItem.tags);
      setSelectedAllergens(existingItem.allergens);
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setIsAvailable(true);
      setIsFeatured(false);
      setPrepTime("15");
      setSelectedTags([]);
      setSelectedAllergens([]);
    }
  }, [existingItem, open]);

  const toggleTag = (tag: Tag) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  const toggleAllergen = (a: Allergen) =>
    setSelectedAllergens((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    );

  const handleSave = () => {
    if (!name.trim() || !price) return;
    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || priceNum <= 0) return;

    if (existingItem) {
      updateItem(existingItem.id, {
        name: name.trim(),
        description: description.trim(),
        price: priceNum,
        isAvailable,
        isFeatured,
        preparationTimeMins: Number(prepTime) || 15,
        tags: selectedTags,
        allergens: selectedAllergens,
      });
    } else {
      const newItem: MenuItem = {
        id: `item-${Date.now()}`,
        categoryId,
        name: name.trim(),
        description: description.trim(),
        price: priceNum,
        isAvailable,
        isFeatured,
        preparationTimeMins: Number(prepTime) || 15,
        tags: selectedTags,
        allergens: selectedAllergens,
        modifierGroups: [],
        sortOrder: 999,
      };
      addItem(categoryId, newItem);
    }
    onClose();
  };

  return (
    <DashboardModal
      open={open}
      onOpenChange={(nextOpen) => !nextOpen && onClose()}
      title={existingItem ? "Edit item" : "Add menu item"}
      description="Manage the diner-facing name, pricing, availability, and labels."
      maxWidth="lg"
      height="standard"
      footer={
        <div className="grid grid-cols-2 gap-2">
          <DashboardButton variant="ghost" fullWidth onClick={onClose}>
            Cancel
          </DashboardButton>
          <DashboardButton
            fullWidth
            onClick={handleSave}
            disabled={!name.trim() || !price}
          >
            {existingItem ? "Save changes" : "Add item"}
          </DashboardButton>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Photo placeholder */}
        <DashboardFileUpload
          label="Upload photo"
          description="JPEG or PNG, max 5MB"
        />

        {/* Name */}
        <DashboardField id="menu-item-name" label="Item name">
          <DashboardInput
            id="menu-item-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Jollof Rice + Chicken"
          />
        </DashboardField>

        {/* Description */}
        <DashboardField
          id="menu-item-description"
          label="Description"
          optional
          hint={`${description.length}/200`}
        >
          <DashboardTextarea
            id="menu-item-description"
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 200))}
            placeholder="Describe the dish…"
            rows={3}
          />
        </DashboardField>

        {/* Price + Prep time */}
        <div className="flex gap-3">
          <DashboardField id="menu-item-price" label="Price ₦">
            <DashboardInput
              id="menu-item-price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              min="0"
            />
          </DashboardField>
          <div className="w-32 flex-none">
            <DashboardField id="menu-item-prep" label="Prep time">
              <DashboardInput
                id="menu-item-prep"
                type="number"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="15"
                min="1"
              />
            </DashboardField>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          {[
            {
              label: "Available",
              sub: "Diners can order this item",
              value: isAvailable,
              set: setIsAvailable,
            },
            {
              label: "Featured",
              sub: "Show at the top of the menu",
              value: isFeatured,
              set: setIsFeatured,
            },
          ].map(({ label, sub, value, set }) => (
            <div key={label} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-semibold text-gray-900">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
              <Toggle
                checked={value}
                onChange={() => set(!value)}
                ariaLabel={label}
              />
            </div>
          ))}
        </div>

        {/* Tags */}
        <div>
          <p className={ds.input.label}>Tags</p>
          <div className="flex flex-wrap gap-2">
            {ALL_TAGS.map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => toggleTag(tag)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                  selectedTags.includes(tag)
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300",
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Allergens */}
        <div>
          <p className={ds.input.label}>Allergens</p>
          <div className="flex flex-wrap gap-2">
            {ALL_ALLERGENS.map((a) => (
              <button
                type="button"
                key={a}
                onClick={() => toggleAllergen(a)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                  selectedAllergens.includes(a)
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300",
                )}
              >
                <Warning className="inline-block mr-1" /> {a}
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardModal>
  );
}
