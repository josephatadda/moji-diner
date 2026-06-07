"use client";

import { X } from "@phosphor-icons/react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import type * as React from "react";
import { cn } from "@/lib/utils";

type DashboardModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  height?: "auto" | "standard" | "large";
  bodyClassName?: string;
};

const maxWidthClass = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-2xl",
} as const;

const heightClass = {
  auto: "max-h-[min(720px,calc(100dvh-32px))]",
  standard: "h-[min(680px,calc(100dvh-32px))]",
  large: "h-[min(760px,calc(100dvh-32px))]",
} as const;

export function DashboardModal({
  open,
  onOpenChange,
  title,
  description,
  icon,
  children,
  footer,
  maxWidth = "md",
  height = "auto",
  bodyClassName,
}: DashboardModalProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-gray-950/35 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 flex w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-950/10 outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            maxWidthClass[maxWidth],
            heightClass[height],
          )}
        >
          <div
            className={cn(
              "flex gap-4 border-b border-gray-100 px-6 py-5",
              description ? "items-start" : "items-center",
            )}
          >
            {icon && (
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-gray-600">
                {icon}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <DialogPrimitive.Title className="text-lg font-semibold leading-tight text-gray-900">
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description
                  className={cn("mt-1 text-sm leading-6 text-gray-500")}
                >
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close
              className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              aria-label="Close"
            >
              <X size={16} />
            </DialogPrimitive.Close>
          </div>

          <div
            className={cn(
              "min-h-0 flex-1 overflow-y-auto px-6 py-5",
              bodyClassName,
            )}
          >
            {children}
          </div>

          {footer && (
            <div className="border-t border-gray-100 bg-white px-6 py-4">
              {footer}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
