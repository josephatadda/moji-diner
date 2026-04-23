"use client";

import { useState, useEffect } from "react";
import type { MenuItem, Tag, Allergen, ModifierGroup } from "@/lib/mockData";
import { useMenuStore } from "@/store/menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Image as ImageIcon, Warning } from "@phosphor-icons/react";

const ALL_TAGS: Tag[] = ["Spicy", "Vegetarian", "Vegan", "Gluten-Free", "Bestseller", "New", "Chef's Special"];
const ALL_ALLERGENS: Allergen[] = ["Nuts", "Dairy", "Gluten", "Eggs", "Fish"];

interface MenuItemFormProps {
  open: boolean;
  onClose: () => void;
  categoryId: string;
  existingItem?: MenuItem;
}

export function MenuItemForm({ open, onClose, categoryId, existingItem }: MenuItemFormProps) {
  const { addItem, updateItem, categories } = useMenuStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [prepTime, setPrepTime] = useState("15");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<Allergen[]>([]);

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
      setName(""); setDescription(""); setPrice(""); setIsAvailable(true);
      setIsFeatured(false); setPrepTime("15"); setSelectedTags([]); setSelectedAllergens([]);
    }
  }, [existingItem, open]);

  const toggleTag = (tag: Tag) =>
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  const toggleAllergen = (a: Allergen) =>
    setSelectedAllergens((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);

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
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:w-[480px] overflow-y-auto p-0"
      >
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-gray-100">
          <SheetTitle className="text-lg font-bold text-gray-900">
            {existingItem ? "Edit Item" : "Add Menu Item"}
          </SheetTitle>
        </SheetHeader>

        <div className="px-5 py-4 space-y-5 pb-8">
          {/* Photo placeholder */}
          <div className="w-full h-36 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors text-gray-400">
            <span className="text-3xl"><ImageIcon /></span>
            <p className="text-sm font-medium text-gray-500">Upload photo</p>
            <p className="text-xs text-gray-400">JPEG or PNG, max 5MB</p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Item name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jollof Rice + Chicken"
              className="w-full h-11 px-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Description <span className="text-gray-400 font-normal">(optional, max 200 chars)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 200))}
              placeholder="Describe the dish…"
              rows={3}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 resize-none transition-colors"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{description.length}/200</p>
          </div>

          {/* Price + Prep time */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Price ₦ <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full h-11 px-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Prep time (min)</label>
              <input
                type="number"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="15"
                min="1"
                className="w-full h-11 px-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            {[
              { label: "Available", sub: "Diners can order this item", value: isAvailable, set: setIsAvailable },
              { label: "Featured", sub: "Show at the top of the menu", value: isFeatured, set: setIsFeatured },
            ].map(({ label, sub, value, set }) => (
              <div key={label} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
                <button
                  onClick={() => set(!value)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                    value ? "bg-green-500" : "bg-gray-200"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                      value ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                    selectedTags.includes(tag)
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Allergens */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Allergens</label>
            <div className="flex flex-wrap gap-2">
              {ALL_ALLERGENS.map((a) => (
                <button
                  key={a}
                  onClick={() => toggleAllergen(a)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                    selectedAllergens.includes(a)
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  )}
                >
                  <Warning className="inline-block mr-1" /> {a}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 h-11 border border-gray-200 text-sm font-semibold text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim() || !price}
              className="flex-1 h-11 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {existingItem ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
