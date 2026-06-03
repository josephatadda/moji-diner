"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle } from "@phosphor-icons/react";
import { DINER } from "./ui/diner-tokens";

interface Props {
  token: string;
  part: number;
  totalParts: number;
  amount: number;
  restaurantName: string;
  tableNumber: number;
}

export default function SplitPartPage({ token, part, totalParts, amount, restaurantName, tableNumber }: Props) {
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setPaid(true);
    setLoading(false);
  };

  if (paid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className={cn(DINER.card, "p-8 max-w-sm w-full text-center")}>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
            <CheckCircle size={32} weight="fill" />
          </div>
          <h2 className={DINER.title}>Payment Confirmed!</h2>
          <p className={cn(DINER.caption, "mt-2")}>Your share of the bill has been paid.</p>
          <div className={cn(DINER.summaryCard, "mt-4")}>
            <p className={DINER.caption}>Amount paid</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">₦{amount.toLocaleString()}</p>
          </div>
          <p className={cn(DINER.caption, "mt-6")}>Powered by Moji</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className={cn(DINER.card, "p-6 max-w-sm w-full")}>
        <div className="text-center mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bill Split</p>
          <h1 className={cn(DINER.title, "mt-1")}>{restaurantName}</h1>
          <p className={DINER.caption}>Table {tableNumber}</p>
        </div>

        <div className={cn(DINER.summaryCard, "mb-4 text-center")}>
          <p className={DINER.caption}>Part {part} of {totalParts}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">₦{amount.toLocaleString()}</p>
        </div>

        {/* Part progress indicator */}
        <div className="flex gap-1.5 mb-6">
          {Array.from({ length: totalParts }, (_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                i + 1 < part ? "bg-green-500" : i + 1 === part ? "bg-gray-900" : "bg-gray-200",
              )}
            />
          ))}
        </div>

        <button
          onClick={handlePay}
          disabled={loading}
          className={cn("w-full h-12 rounded-2xl bg-gray-900 text-white font-bold text-base hover:bg-gray-700 disabled:opacity-60", DINER.ctaPress)}
        >
          {loading ? "Processing…" : `Pay ₦${amount.toLocaleString()}`}
        </button>
        <p className={cn(DINER.caption, "text-center mt-3")}>Powered by Moji</p>
      </div>
    </div>
  );
}
