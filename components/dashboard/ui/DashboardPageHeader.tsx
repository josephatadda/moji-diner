import type { ReactNode } from "react";
import { t } from "@/components/dashboard/ui/dashboard-tokens";

type DashboardPageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  eyebrow?: string;
};

export function DashboardPageHeader({
  title,
  description,
  actions,
  eyebrow,
}: DashboardPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-orange-600">
            {eyebrow}
          </p>
        )}
        <h1 className={t.h1}>{title}</h1>
        {description && <p className={`${t.body} mt-1`}>{description}</p>}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      )}
    </div>
  );
}
