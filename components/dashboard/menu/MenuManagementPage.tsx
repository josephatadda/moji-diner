"use client";

import { useState } from "react";
import { useMenuStore } from "@/store/menu";
import { CategoryCard } from "./CategoryCard";
import { CategoryForm } from "./CategoryForm";
import { MenuPreview } from "./MenuPreview";
import { MOCK_RESTAURANT } from "@/lib/mockData";

export function MenuManagementPage() {
  const { categories, resetAllAvailability } = useMenuStore();
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false); // mobile only

  return (
    <div className="h-full">
      {/* Mobile tab switcher */}
      <div className="lg:hidden flex border-b border-gray-100 bg-white sticky top-0 z-30">
        <button
          onClick={() => setPreviewMode(false)}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            !previewMode ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-400"
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => setPreviewMode(true)}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            previewMode ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-400"
          }`}
        >
          Preview
        </button>
      </div>

      <div className="flex h-full">
        {/* ── Editor panel ──────────────────────────────────────── */}
        <div
          className={`${
            previewMode ? "hidden" : "flex"
          } lg:flex flex-col flex-1 overflow-y-auto`}
        >
          {/* Toolbar */}
          <div className="sticky top-0 lg:top-0 z-20 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Menu</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {categories.length} categories ·{" "}
                {categories.reduce((s, c) => s + c.items.length, 0)} items
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (window.confirm("Mark all items as available again?")) {
                    resetAllAvailability();
                  }
                }}
                className="px-3 py-2 text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
              >
                Reset All ↺
              </button>
              <button
                onClick={() => setAddCategoryOpen(true)}
                className="px-4 py-2 text-xs font-bold bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-all"
              >
                + Category
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="px-4 py-4 space-y-4 pb-8">
            {categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="text-5xl mb-4">🍽</span>
                <h3 className="text-lg font-bold text-gray-900">Your menu is empty</h3>
                <p className="text-sm text-gray-400 mt-1 mb-6">
                  Start by adding your first category — e.g. "Starters"
                </p>
                <button
                  onClick={() => setAddCategoryOpen(true)}
                  className="px-6 py-3 bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-gray-700 transition-all"
                >
                  + Add your first category
                </button>
              </div>
            ) : (
              categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))
            )}
          </div>
        </div>

        {/* ── Live preview panel (desktop only sidebar, mobile tab) ── */}
        <div
          className={`${
            previewMode ? "flex" : "hidden"
          } lg:flex flex-col lg:w-72 xl:w-80 flex-none border-l border-gray-100 bg-gray-50 overflow-hidden`}
        >
          <div className="px-4 py-4 border-b border-gray-100 bg-white">
            <p className="font-semibold text-gray-900 text-sm">Live Preview</p>
            <p className="text-xs text-gray-400 mt-0.5">Diner view at 375px</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <MenuPreview categories={categories} restaurantName={MOCK_RESTAURANT.name} />
          </div>
        </div>
      </div>

      {/* Add category form */}
      <CategoryForm open={addCategoryOpen} onClose={() => setAddCategoryOpen(false)} />
    </div>
  );
}
