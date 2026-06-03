"use client";

import { X } from "@phosphor-icons/react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function BottomSheet({ open, onClose, title, description, children, footer }: BottomSheetProps) {
  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="max-h-[92vh] flex flex-col">
        {/* Drag handle */}
        <div className="mx-auto mt-3 w-10 h-1 rounded-full bg-gray-200 flex-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center text-gray-500"
        >
          <X size={14} weight="bold" />
        </button>

        {/* Header */}
        <div className="flex-none px-12 pt-4 pb-2 text-center">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {description && (
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">{description}</p>
          )}
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 pb-4">
          {children}
        </div>

        {/* Pinned footer */}
        {footer && (
          <div className="flex-none border-t border-gray-100 px-5 pb-8 pt-4 bg-white">
            {footer}
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
