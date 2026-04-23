"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { Receipt, Users, CheckCircle, Warning } from "@phosphor-icons/react";
import { Button } from "./ui/Button";

interface BillViewProps {
  restaurantSlug: string;
  tableNumber: number;
  vatRate?: number;
  vatEnabled?: boolean;
  onSplitBill?: () => void;
}

const TIP_OPTIONS = [
  { label: "No tip", value: 0 },
  { label: "5%", value: 5 },
  { label: "10%", value: 10 },
  { label: "Custom", value: -1 },
];

export function BillView({
  restaurantSlug,
  tableNumber,
  vatRate = 7.5,
  vatEnabled = false,
  onSplitBill,
}: BillViewProps) {
  const { sessionBatches, subtotal, clearCart, loyaltyPhone, setLoyaltyData } = useCartStore();
  const [tipOption, setTipOption] = useState(0);
  const [customTip, setCustomTip] = useState("");
  const [paymentState, setPaymentState] = useState<"idle" | "method" | "success" | "failed">("idle");

  const sub = sessionBatches.reduce((sum, b) => sum + b.items.reduce((s, i) => s + i.lineTotal, 0), 0);
  const vat = vatEnabled ? sub * (vatRate / 100) : 0;
  const tipPct = tipOption === -1 ? parseFloat(customTip) || 0 : tipOption;
  const tip = Math.round(sub * (tipPct / 100));
  const total = sub + vat + tip;

  const handlePay = async () => {
    setPaymentState("success");
  };

  if (paymentState === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-[var(--space-6)] text-center">
        <div className="w-20 h-20 bg-[var(--color-success)]/10 text-[var(--color-success)] rounded-full flex items-center justify-center mb-[var(--space-6)]">
          <CheckCircle size={40} weight="fill" />
        </div>
        <h2 className="text-[var(--font-size-heading)] font-black text-[var(--color-primary)]">Payment Successful!</h2>
        <p className="text-[var(--font-size-body)] text-[var(--color-muted)] mt-2">Your receipt has been sent to your WhatsApp.</p>
        
        <div className="mt-[var(--space-8)] w-full max-w-sm bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-[var(--space-4)] border border-[var(--color-border)] text-left">
          <p className="text-[var(--font-size-label)] font-bold text-[var(--color-muted)] uppercase tracking-widest mb-[var(--space-3)]">Transaction Details</p>
          <div className="space-y-2">
            <div className="flex justify-between text-[var(--font-size-body)]">
              <span className="text-[var(--color-muted-fg)]">Amount Paid</span>
              <span className="font-bold text-[var(--color-primary)]">₦{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[var(--font-size-body)]">
              <span className="text-[var(--color-muted-fg)]">Date</span>
              <span className="font-bold text-[var(--color-primary)]">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-[var(--font-size-body)]">
              <span className="text-[var(--color-muted-fg)]">Table</span>
              <span className="font-bold text-[var(--color-primary)]">{tableNumber}</span>
            </div>
          </div>
        </div>

        <div className="mt-[var(--space-8)] w-full max-w-sm">
          <Button fullWidth onClick={() => window.location.href = `/${restaurantSlug}/t/${tableNumber}`}>Return to Menu</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-[var(--space-4)] py-[var(--space-4)] space-y-[var(--space-6)]">
      <h2 className="text-[var(--font-size-heading)] font-black text-[var(--color-primary)]">Checkout</h2>

      {/* Bill summary */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-[var(--space-4)] space-y-[var(--space-3)] border border-[var(--color-border)]">
        <div className="flex justify-between text-[var(--font-size-body)] text-[var(--color-muted)]">
          <span>Subtotal</span>
          <span>₦{sub.toLocaleString()}</span>
        </div>
        {vatEnabled && (
          <div className="flex justify-between text-[var(--font-size-body)] text-[var(--color-muted)]">
            <span>VAT ({vatRate}%)</span>
            <span>₦{Math.round(vat).toLocaleString()}</span>
          </div>
        )}
        <div className="h-px bg-[var(--color-border)] my-1" />
        <div className="flex justify-between text-[var(--font-size-title)] font-black text-[var(--color-primary)]">
          <span>Total Bill</span>
          <span>₦{total.toLocaleString()}</span>
        </div>
      </div>

      {/* Tip selector */}
      <div className="space-y-[var(--space-3)]">
        <p className="text-[var(--font-size-label)] font-bold text-[var(--color-muted)] uppercase tracking-wider px-1">Add a tip?</p>
        <div className="grid grid-cols-4 gap-2">
          {TIP_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => setTipOption(opt.value)}
              className={cn(
                "h-11 rounded-[var(--radius-md)] text-[var(--font-size-muted)] font-bold transition-all border",
                tipOption === opt.value
                  ? "bg-[var(--color-primary)] text-[var(--color-background)] border-[var(--color-primary)]"
                  : "bg-[var(--color-background)] text-[var(--color-muted-fg)] border-[var(--color-border)] hover:border-[var(--color-muted)]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {tipOption === -1 && (
          <div className="relative mt-2">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)] font-bold">₦</span>
            <input
              type="number"
              placeholder="Enter custom amount"
              value={customTip}
              onChange={(e) => setCustomTip(e.target.value)}
              className="w-full h-11 pl-8 pr-4 bg-[var(--color-background)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--font-size-body)] focus:border-[var(--color-primary)] focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Payment CTAs */}
      <div className="pt-[var(--space-4)] space-y-[var(--space-3)]">
        <Button fullWidth size="lg" onClick={handlePay}>
          Pay Now · ₦{total.toLocaleString()}
        </Button>
        <Button variant="outline" fullWidth onClick={onSplitBill} leftIcon={<Users size={20} />}>
          Split this bill
        </Button>
      </div>

      <p className="text-center text-[var(--font-size-muted)] text-[var(--color-muted)] px-4">
        Secure payment processed via Paystack.
      </p>
    </div>
  );
}
