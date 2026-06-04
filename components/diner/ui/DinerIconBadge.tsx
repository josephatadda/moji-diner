import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface DinerIconBadgeProps {
  icon: Icon;
  tone?: "neutral" | "success" | "warning" | "info" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const toneClass = {
  neutral: "border-gray-100 bg-gray-50 text-gray-500",
  success: "border-green-100 bg-green-50 text-green-600",
  warning: "border-orange-100 bg-orange-50 text-orange-600",
  info: "border-blue-100 bg-blue-50 text-blue-600",
  danger: "border-red-100 bg-red-50 text-red-600",
};

const sizeClass = {
  sm: "h-10 w-10 rounded-xl",
  md: "h-14 w-14 rounded-2xl",
  lg: "h-20 w-20 rounded-[24px]",
};

const iconSize = {
  sm: 20,
  md: 26,
  lg: 38,
};

export function DinerIconBadge({
  icon: IconComponent,
  tone = "neutral",
  size = "md",
  className,
}: DinerIconBadgeProps) {
  return (
    <div
      className={cn(
        "flex flex-none items-center justify-center border",
        toneClass[tone],
        sizeClass[size],
        className,
      )}
    >
      <IconComponent size={iconSize[size]} weight="fill" />
    </div>
  );
}
