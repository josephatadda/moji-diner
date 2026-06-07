"use client";

import { Image, UploadSimple } from "@phosphor-icons/react";
import { ds, t } from "@/components/dashboard/ui/dashboard-tokens";
import { cn } from "@/lib/utils";

type DashboardFileUploadProps = {
  label: string;
  description: string;
  className?: string;
};

export function DashboardFileUpload({
  label,
  description,
  className,
}: DashboardFileUploadProps) {
  return (
    <button
      type="button"
      className={cn(
        "group flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center transition-colors hover:border-gray-300 hover:bg-gray-100",
        className,
      )}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-500 group-hover:text-gray-900">
        <Image size={20} />
      </span>
      <span className={t.bodyStrong}>{label}</span>
      <span className={t.meta}>{description}</span>
      <span className={cn(ds.btn.ghost, "mt-1 h-8 px-3 text-xs")}>
        <UploadSimple size={14} />
        Choose file
      </span>
    </button>
  );
}
