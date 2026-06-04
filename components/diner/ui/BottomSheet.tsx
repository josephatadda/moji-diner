"use client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { DINER } from "./diner-tokens";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  footerClassName?: string;
  accessibilityTitle?: string;
}

export function BottomSheet({
  open,
  onClose,
  children,
  title,
  description,
  header,
  footer,
  className,
  bodyClassName,
  footerClassName,
  accessibilityTitle,
}: BottomSheetProps) {
  const hasHeader = Boolean(header || title || description);
  const dialogTitle = accessibilityTitle ?? title ?? "Modal";
  const dialogDescription =
    typeof description === "string"
      ? description
      : title
        ? `${title} content`
        : "Modal content";

  return (
    <Drawer open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DrawerContent
        className={cn(
          "fixed inset-x-4 bottom-[18px] z-50 mx-auto flex w-auto max-w-[448px] flex-col overflow-hidden rounded-[20px] border border-gray-200 bg-white p-0 text-gray-900",
          "max-h-[calc(100dvh-112px)] data-[vaul-drawer-direction=bottom]:inset-x-4 data-[vaul-drawer-direction=bottom]:bottom-[18px] data-[vaul-drawer-direction=bottom]:max-h-[calc(100dvh-112px)]",
          "before:hidden [&>div:first-child]:hidden",
          className,
        )}
      >
        <DrawerTitle className="sr-only">{dialogTitle}</DrawerTitle>
        <DrawerDescription className="sr-only">
          {dialogDescription}
        </DrawerDescription>

        <div className="flex h-8 flex-none items-center justify-center px-5 pt-3">
          <div className="h-1 w-11 rounded-full bg-gray-200" />
        </div>

        {hasHeader && (
          <div className="flex-none px-5 pb-4 pt-4">
            {header ?? (
              <div>
                {title && <h2 className={cn(DINER.sheetTitle)}>{title}</h2>}
                {description && (
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    {description}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overscroll-contain px-5",
            hasHeader ? "pb-6" : "pt-5 pb-6",
            footer && "pb-8",
            bodyClassName,
          )}
        >
          {children}
        </div>

        {footer && (
          <div
            className={cn(
              "flex-none border-t border-gray-100 bg-white px-5 pb-[calc(18px+env(safe-area-inset-bottom))] pt-4",
              footerClassName,
            )}
          >
            {footer}
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
