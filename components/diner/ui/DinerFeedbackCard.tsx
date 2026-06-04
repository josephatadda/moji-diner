import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { DinerIconBadge } from "./DinerIconBadge";
import { DINER } from "./diner-tokens";

interface DinerFeedbackCardProps {
  title: string;
  description?: string;
  icon: Icon;
  tone?: "success" | "warning" | "info" | "danger";
  align?: "left" | "center";
  children?: React.ReactNode;
  className?: string;
}

const toneClass = {
  success: "border-green-100 bg-green-50",
  warning: "border-orange-100 bg-orange-50",
  info: "border-blue-100 bg-blue-50",
  danger: "border-red-100 bg-red-50",
};

export function DinerFeedbackCard({
  title,
  description,
  icon,
  tone = "info",
  align = "left",
  children,
  className,
}: DinerFeedbackCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3",
        align === "left" && "flex gap-3 text-left",
        align === "center" && "text-center",
        toneClass[tone],
        className,
      )}
    >
      <DinerIconBadge
        icon={icon}
        tone={tone}
        size="sm"
        className={align === "center" ? "mx-auto mb-2" : undefined}
      />
      <div className="min-w-0 flex-1">
        <p className={DINER.cardTitle}>{title}</p>
        {description && (
          <p className={cn(DINER.caption, "mt-0.5")}>{description}</p>
        )}
        {children}
      </div>
    </div>
  );
}
