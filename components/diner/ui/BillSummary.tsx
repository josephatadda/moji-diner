import { cn } from "@/lib/utils";
import { DINER } from "./diner-tokens";

interface BillSummaryProps {
  subtotal: number;
  vat?: number;
  vatRate?: number;
  vatEnabled?: boolean;
  tip?: number;
  discount?: number;
  total: number;
  variant?: "default" | "receipt";
}

export function BillSummary({
  subtotal,
  vat = 0,
  vatRate = 7.5,
  vatEnabled = false,
  tip = 0,
  discount = 0,
  total,
  variant = "default",
}: BillSummaryProps) {
  const isReceipt = variant === "receipt";

  return (
    <div className={cn(DINER.summaryCard, "space-y-2.5")}>
      <div className="flex justify-between text-sm text-gray-500">
        <span>Subtotal</span>
        <span className="tabular-nums">₦{subtotal.toLocaleString()}</span>
      </div>
      {vatEnabled && vat > 0 && (
        <div className="flex justify-between text-sm text-gray-500">
          <span>VAT ({vatRate}%)</span>
          <span className="tabular-nums">
            ₦{Math.round(vat).toLocaleString()}
          </span>
        </div>
      )}
      {tip > 0 && (
        <div className="flex justify-between text-sm text-gray-500">
          <span>Tip</span>
          <span className="tabular-nums">₦{tip.toLocaleString()}</span>
        </div>
      )}
      {discount > 0 && (
        <div className="flex justify-between text-sm text-green-600">
          <span>Points discount</span>
          <span className="tabular-nums">-₦{discount.toLocaleString()}</span>
        </div>
      )}
      <div className="border-t border-gray-200 my-3" />
      <div
        className={cn(
          "flex justify-between items-center",
          isReceipt ? DINER.priceLarge : "font-bold text-base text-gray-900",
        )}
      >
        <span>{isReceipt ? "Total Paid" : "Total"}</span>
        <span className="tabular-nums">
          ₦{Math.round(total).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
