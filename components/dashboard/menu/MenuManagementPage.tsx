"use client";

import { ForkKnife } from "@phosphor-icons/react";
import { useState } from "react";
import {
  DashboardButton,
  DashboardConfirmDialog,
  DashboardEmptyState,
  DashboardPageHeader,
  dashboardToast,
} from "@/components/dashboard/ui";
import { MOCK_RESTAURANT } from "@/lib/mockData";
import { useMenuStore } from "@/store/menu";
import { CategoryCard } from "./CategoryCard";
import { CategoryForm } from "./CategoryForm";
import { MenuPreview } from "./MenuPreview";

export function MenuManagementPage() {
  const { categories, resetAllAvailability } = useMenuStore();
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false); // mobile only
  const [resetOpen, setResetOpen] = useState(false);

  return (
    <div className="h-full">
      {/* Mobile tab switcher */}
      <div className="lg:hidden flex border-b border-gray-100 bg-white sticky top-0 z-30">
        <button
          type="button"
          onClick={() => setPreviewMode(false)}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            !previewMode
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-400"
          }`}
        >
          Editor
        </button>
        <button
          type="button"
          onClick={() => setPreviewMode(true)}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            previewMode
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-400"
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
          <div className="sticky top-0 z-20 border-b border-gray-100 bg-white px-4 pt-4">
            <DashboardPageHeader
              title="Menu"
              description={`${categories.length} categories · ${categories.reduce((s, c) => s + c.items.length, 0)} items`}
              actions={
                <>
                  <DashboardButton
                    variant="ghost"
                    onClick={() => setResetOpen(true)}
                  >
                    Reset all
                  </DashboardButton>
                  <DashboardButton onClick={() => setAddCategoryOpen(true)}>
                    + Category
                  </DashboardButton>
                </>
              }
            />
          </div>

          {/* Categories */}
          <div className="px-4 py-4 space-y-4 pb-8">
            {categories.length === 0 ? (
              <DashboardEmptyState
                icon={ForkKnife}
                title="Your menu is empty"
                description="Start by adding your first category."
                actionLabel="Add category"
                onAction={() => setAddCategoryOpen(true)}
              />
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
          } lg:flex flex-col flex-1 lg:w-72 lg:flex-none xl:w-80 border-l border-gray-100 bg-gray-50 overflow-hidden`}
        >
          <div className="hidden border-b border-gray-100 bg-white px-4 py-4 lg:block">
            <p className="font-semibold text-gray-900 text-sm">Live Preview</p>
            <p className="text-xs text-gray-400 mt-0.5">Diner view at 375px</p>
          </div>
          <div className="flex-1 overflow-hidden lg:overflow-y-auto lg:p-4">
            <MenuPreview
              categories={categories}
              restaurantName={MOCK_RESTAURANT.name}
              mode={previewMode ? "fullscreen" : "phone"}
            />
          </div>
        </div>
      </div>

      {/* Add category form */}
      <CategoryForm
        open={addCategoryOpen}
        onClose={() => setAddCategoryOpen(false)}
      />
      <DashboardConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset availability?"
        description="Every menu item will be marked available again. Sold-out states will be cleared."
        confirmLabel="Reset all"
        onConfirm={() => {
          resetAllAvailability();
          dashboardToast("All items are available again");
        }}
      />
    </div>
  );
}
