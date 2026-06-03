import { cn } from "@/lib/utils";

interface BillSummaryProps {
  subtotal: number;
  vat?: number;
  vatRate?: number;
  vatEnabled?: boolean;
  tip?: number;
  total: number;
  variant?: "default" | "receipt";
}

export function BillSummary({
  subtotal,
  vat = 0,
  vatRate = 7.5,
  vatEnabled = false,
  tip = 0,
  total,
  variant = "default",
}: BillSummaryProps) {
  const isReceipt = variant === "receipt";

  return (
    <div className={cn("bg-gray-50 rounded-2xl p-4 space-y-2.5")}>
      <div className="flex justify-between text-sm text-gray-400">
        <span>Subtotal</span>
        <span>₦{subtotal.toLocaleString()}</span>
      </div>
      {vatEnabled && vat > 0 && (
        <div className="flex justify-between text-sm text-gray-400">
          <span>VAT ({vatRate}%)</span>
          <span>₦{Math.round(vat).toLocaleString()}</span>
        </div>
      )}
      {tip > 0 && (
        <div className="flex justify-between text-sm text-gray-400">
          <span>Tip</span>
          <span>₦{tip.toLocaleString()}</span>
        </div>
      )}
      <div className="border-t border-gray-200 my-3" />
      <div className={cn(
        "flex justify-between items-center",
        isReceipt ? "font-black text-lg text-gray-900" : "font-bold text-base text-gray-900"
      )}>
        <span>{isReceipt ? "Total Paid" : "Total"}</span>
        <span>₦{Math.round(total).toLocaleString()}</span>
      </div>
    </div>
  );
}
