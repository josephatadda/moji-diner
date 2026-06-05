"use client";

import { ds } from "@/components/dashboard/ui/dashboard-tokens";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";

type DashboardConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function DashboardConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onOpenChange,
  onConfirm,
}: DashboardConfirmDialogProps) {
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
    >
      <div className="flex justify-end gap-2 px-1 pt-2">
        <button
          type="button"
          className={ds.btn.ghost}
          onClick={() => onOpenChange(false)}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          className={
            destructive
              ? "inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-red-700 active:scale-[0.98]"
              : ds.btn.primary
          }
          onClick={() => {
            onConfirm();
            onOpenChange(false);
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </ResponsiveDialog>
  );
}
