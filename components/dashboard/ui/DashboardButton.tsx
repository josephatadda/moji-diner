"use client";

import type * as React from "react";
import { ds } from "@/components/dashboard/ui/dashboard-tokens";
import { cn } from "@/lib/utils";

type DashboardButtonVariant =
  | "primary"
  | "ghost"
  | "danger"
  | "icon"
  | "tab"
  | "tabActive"
  | "link";

type DashboardButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: DashboardButtonVariant;
  fullWidth?: boolean;
  size?: "sm" | "md";
};

const variantClass: Record<DashboardButtonVariant, string> = {
  primary: ds.btn.primary,
  ghost: ds.btn.ghost,
  danger: ds.btn.danger,
  icon: ds.btn.icon,
  tab: ds.btn.tab,
  tabActive: ds.btn.tabActive,
  link: ds.btn.link,
};

export function DashboardButton({
  className,
  variant = "primary",
  fullWidth,
  size = "md",
  type = "button",
  ...props
}: DashboardButtonProps) {
  const baseClass =
    fullWidth && variant === "primary"
      ? ds.btn.primaryFull
      : fullWidth && variant === "ghost"
        ? ds.btn.ghostFull
        : variantClass[variant];

  return (
    <button
      type={type}
      className={cn(
        baseClass,
        size === "sm" &&
          variant !== "icon" &&
          variant !== "link" &&
          "h-8 px-3 text-xs",
        size === "sm" && variant === "icon" && "h-8 w-8",
        className,
      )}
      {...props}
    />
  );
}
