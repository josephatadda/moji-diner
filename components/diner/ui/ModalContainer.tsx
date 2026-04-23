"use client";

import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ModalContainerProps {
  isOpen: boolean;
  onDismiss: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  type?: "dialog" | "sheet";
}

export function ModalContainer({
  isOpen,
  onDismiss,
  title,
  subtitle,
  children,
  footer,
  type = "sheet",
}: ModalContainerProps) {
  if (type === "dialog") {
    return (
      <ResponsiveDialog open={isOpen} onOpenChange={(o) => !o && onDismiss()}>
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[var(--color-primary)]">{title}</h2>
            {subtitle && <p className="text-sm text-[var(--color-muted)] mt-1">{subtitle}</p>}
          </div>
          {children}
          {footer && <div className="mt-8">{footer}</div>}
        </div>
      </ResponsiveDialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={(o) => !o && onDismiss()}>
      <DrawerContent className="max-h-[92vh]">
        <div className="mx-auto w-12 h-1.5 bg-[var(--color-border)] rounded-full mt-3 mb-2 opacity-50" />
        <DrawerHeader className="px-[var(--space-4)] pt-[var(--space-4)] pb-[var(--space-2)] text-left">
          <DrawerTitle className="text-[var(--font-size-heading)] font-bold text-[var(--color-primary)]">{title}</DrawerTitle>
          {subtitle && (
            <DrawerDescription className="text-[var(--font-size-body)] text-[var(--color-muted)] mt-1 leading-relaxed">
              {subtitle}
            </DrawerDescription>
          )}
        </DrawerHeader>
        <div className="px-[var(--space-4)] pb-[var(--space-8)] overflow-y-auto">
          {children}
        </div>
        {footer && <DrawerFooter className="px-[var(--space-4)] pt-0 pb-[var(--space-6)]">{footer}</DrawerFooter>}
      </DrawerContent>
    </Drawer>
  );
}
