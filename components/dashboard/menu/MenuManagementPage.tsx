"use client";

import { CheckCircle, Circle, ForkKnife } from "@phosphor-icons/react";
import { useState } from "react";
import {
  DashboardButton,
  DashboardConfirmDialog,
  DashboardEmptyState,
  DashboardModal,
  DashboardPageHeader,
  dashboardToast,
} from "@/components/dashboard/ui";
import { generateMenuPDF } from "@/lib/menu-pdf";
import { MOCK_RESTAURANT } from "@/lib/mockData";
import { useDashboardSettingsStore } from "@/store/dashboard-settings";
import { useMenuStore } from "@/store/menu";
import { CategoryCard } from "./CategoryCard";
import { CategoryForm } from "./CategoryForm";
import { MenuPreview } from "./MenuPreview";

export function MenuManagementPage() {
  const { categories, resetAllAvailability } = useMenuStore();
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false); // mobile only
  const [resetOpen, setResetOpen] = useState(false);
  const [downloadPdfOpen, setDownloadPdfOpen] = useState(false);

  const { profile } = useDashboardSettingsStore();

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
                    onClick={() => setDownloadPdfOpen(true)}
                  >
                    Download PDF
                  </DashboardButton>
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

      <DownloadPdfModal
        open={downloadPdfOpen}
        onClose={() => setDownloadPdfOpen(false)}
        restaurantName={profile.name}
        restaurantDescription={profile.description}
        restaurantPhone={profile.phone}
        restaurantCity={profile.city}
        restaurantAddress={profile.address}
        restaurantEmail={profile.email}
        restaurantCurrency={profile.currency}
        restaurantSlug={profile.slug}
        categories={categories}
      />
    </div>
  );
}

interface DownloadPdfModalProps {
  open: boolean;
  onClose: () => void;
  restaurantName: string;
  restaurantDescription: string;
  restaurantPhone: string;
  restaurantCity: string;
  restaurantAddress?: string;
  restaurantEmail?: string;
  restaurantCurrency?: string;
  restaurantSlug: string;
  categories: any[];
}

export function DownloadPdfModal({
  open,
  onClose,
  restaurantName,
  restaurantDescription,
  restaurantPhone,
  restaurantCity,
  restaurantAddress,
  restaurantEmail,
  restaurantCurrency,
  restaurantSlug,
  categories,
}: DownloadPdfModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<
    "classic" | "modern" | "elegant"
  >("classic");

  if (!open) return null;

  const handleDownload = () => {
    generateMenuPDF(
      {
        name: restaurantName,
        description: restaurantDescription,
        phone: restaurantPhone,
        city: restaurantCity,
        address: restaurantAddress,
        email: restaurantEmail,
        currency: restaurantCurrency,
        slug: restaurantSlug,
      },
      categories,
      selectedTemplate,
    );
    dashboardToast("Menu PDF downloaded successfully", "success");
    onClose();
  };

  const templates = [
    {
      id: "classic" as const,
      title: "Classic & Standard Layout",
      description:
        "Classical columns with clear typography. Best for traditional menus.",
      accent: "border-gray-950 bg-gray-50",
    },
    {
      id: "modern" as const,
      title: "Modern Minimalist",
      description:
        "Bold headers with spacious, clean layouts. Best for cafes and grills.",
      accent: "border-teal-600 bg-teal-50/20",
    },
    {
      id: "elegant" as const,
      title: "Elegant Lounge",
      description:
        "Premium centered text with decorative divider rules. Best for fine dining.",
      accent: "border-amber-600 bg-amber-50/20",
    },
  ];

  return (
    <DashboardModal
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      title="Download Menu PDF"
      description="Choose a design template style to format and export your menu PDF."
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-end gap-3">
          <DashboardButton variant="ghost" onClick={onClose}>
            Cancel
          </DashboardButton>
          <DashboardButton onClick={handleDownload}>
            Download PDF
          </DashboardButton>
        </div>
      }
    >
      <div className="space-y-3">
        {templates.map((tmpl) => {
          const isSelected = selectedTemplate === tmpl.id;
          return (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => setSelectedTemplate(tmpl.id)}
              className={`w-full flex items-center text-left gap-4 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? "border-gray-900 bg-gray-50/50 ring-2 ring-gray-900/10"
                  : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/30"
              }`}
            >
              {/* Image Left */}
              <div className="w-24 h-20 bg-white rounded-xl border border-gray-150 shadow-xs flex-none overflow-hidden relative">
                {tmpl.id === "classic" && (
                  <div className="w-full h-full p-2 flex flex-col gap-1 items-center justify-center">
                    <div className="w-8 h-1 bg-gray-900 rounded-xs mb-0.5" />
                    <div className="w-12 h-0.5 bg-gray-400 rounded-xs" />
                    <div className="w-16 h-0.5 bg-gray-200 rounded-xs mb-1" />
                    <div className="w-full grid grid-cols-2 gap-x-1.5 gap-y-0.5 px-0.5">
                      <div className="space-y-0.5">
                        <div className="w-full h-0.5 bg-gray-300 rounded-xs" />
                        <div className="w-2/3 h-0.5 bg-gray-200 rounded-xs" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="w-full h-0.5 bg-gray-300 rounded-xs" />
                        <div className="w-2/3 h-0.5 bg-gray-200 rounded-xs" />
                      </div>
                    </div>
                  </div>
                )}
                {tmpl.id === "modern" && (
                  <div className="w-full h-full p-2 flex flex-col gap-1 justify-center">
                    <div className="flex gap-1 items-center mb-0.5">
                      <div className="w-1 h-2 bg-teal-500 rounded-full" />
                      <div className="w-8 h-0.5 bg-gray-800 rounded-xs" />
                    </div>
                    <div className="w-2/3 h-0.5 bg-gray-300 rounded-xs" />
                    <div className="space-y-0.5 pt-0.5">
                      <div className="flex justify-between items-center">
                        <div className="w-8 h-0.5 bg-gray-400 rounded-xs" />
                        <div className="w-2 h-0.5 bg-gray-300 rounded-xs" />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="w-10 h-0.5 bg-gray-400 rounded-xs" />
                        <div className="w-2 h-0.5 bg-gray-300 rounded-xs" />
                      </div>
                    </div>
                  </div>
                )}
                {tmpl.id === "elegant" && (
                  <div className="w-full h-full p-2 flex flex-col gap-0.5 items-center justify-center">
                    <div className="w-10 h-1 bg-gray-900 rounded-xs" />
                    <div className="w-12 h-0.5 bg-amber-500 rounded-xs my-0.5" />
                    <div className="w-16 h-0.5 bg-gray-300 rounded-xs mb-0.5" />
                    <div className="space-y-0.5 w-full flex flex-col items-center">
                      <div className="w-10 h-0.5 bg-gray-400 rounded-xs" />
                      <div className="w-12 h-0.5 bg-gray-400 rounded-xs" />
                    </div>
                  </div>
                )}
              </div>

              {/* Title and Description */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900">{tmpl.title}</p>
                <p className="text-xs text-gray-400 mt-1 leading-normal font-normal">
                  {tmpl.description}
                </p>
              </div>

              {/* Select Icon Indicator */}
              <div className="flex-none pl-2 pr-1">
                {isSelected ? (
                  <CheckCircle
                    size={22}
                    weight="fill"
                    className="text-gray-900"
                  />
                ) : (
                  <Circle
                    size={22}
                    className="text-gray-300 hover:text-gray-400 transition-colors"
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </DashboardModal>
  );
}
