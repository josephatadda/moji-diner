"use client";

import { CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { toast } from "sonner";

type DashboardToastKind = "success" | "error" | "info";

const styles: Record<DashboardToastKind, string> = {
  success: "border-green-200 bg-green-50 text-green-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
};

export function dashboardToast(
  message: string,
  kind: DashboardToastKind = "success",
) {
  const Icon = kind === "error" ? WarningCircle : CheckCircle;

  toast.custom(() => (
    <div
      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium shadow-sm ${styles[kind]}`}
    >
      <Icon size={17} weight="fill" />
      <span>{message}</span>
    </div>
  ));
}
