"use client";

import { DashboardButton } from "./DashboardButton";
import { DashboardModal } from "./DashboardModal";

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
    <DashboardModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={
        <div className="flex justify-end gap-2">
          <DashboardButton variant="ghost" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </DashboardButton>
          <DashboardButton
            variant={destructive ? "danger" : "primary"}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </DashboardButton>
        </div>
      }
    >
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm text-gray-600">
        {description}
      </div>
    </DashboardModal>
  );
}
