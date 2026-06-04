import { CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { toast } from "sonner";

type DinerToastTone = "success" | "error";

const toneClass: Record<DinerToastTone, string> = {
  success: "border-green-100 bg-green-50 text-green-800",
  error: "border-red-100 bg-red-50 text-red-800",
};

const iconClass: Record<DinerToastTone, string> = {
  success: "text-green-600",
  error: "text-red-600",
};

const icon = {
  success: CheckCircle,
  error: WarningCircle,
};

function showDinerToast(message: string, tone: DinerToastTone) {
  const Icon = icon[tone];

  toast.custom(() => (
    <div
      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium ${toneClass[tone]}`}
    >
      <Icon size={18} weight="fill" className={iconClass[tone]} />
      <span>{message}</span>
    </div>
  ));
}

export const dinerToast = {
  success: (message: string) => showDinerToast(message, "success"),
  error: (message: string) => showDinerToast(message, "error"),
};
