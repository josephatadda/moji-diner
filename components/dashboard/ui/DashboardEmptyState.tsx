"use client";

import type { Icon } from "@phosphor-icons/react";
import { ds } from "@/components/dashboard/ui/dashboard-tokens";
import { DashboardButton } from "./DashboardButton";

type DashboardEmptyStateProps = {
  icon: Icon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function DashboardEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: DashboardEmptyStateProps) {
  return (
    <div className={ds.empty.wrap}>
      <div className={ds.empty.icon}>
        <Icon size={22} />
      </div>
      <h3 className={ds.empty.title}>{title}</h3>
      <p className={ds.empty.body}>{description}</p>
      {actionLabel && onAction && (
        <DashboardButton className="mt-4" onClick={onAction}>
          {actionLabel}
        </DashboardButton>
      )}
    </div>
  );
}
