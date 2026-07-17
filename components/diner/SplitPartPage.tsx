"use client";

import { CheckCircle } from "@phosphor-icons/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DinerIconBadge } from "./ui/DinerIconBadge";
import { DinerInfoRow } from "./ui/DinerInfoRow";
import { DinerPaymentPanel } from "./ui/DinerPaymentPanel";
import { DINER } from "./ui/diner-tokens";
import { PageHeader } from "./ui/PageHeader";

interface Props {
  token: string;
  part: number;
  totalParts: number;
  amount: number;
  restaurantName: string;
  tableNumber: number;
}

export default function SplitPartPage({
  part,
  totalParts,
  amount,
  restaurantName,
  tableNumber,
}: Props) {
  const [screen, setScreen] = useState<"review" | "payment" | "paid">("review");
  const [completedMethod, setCompletedMethod] = useState<
    "bank" | "card" | "cash"
  >("bank");

  const methodLabel =
    completedMethod === "bank"
      ? "Bank transfer"
      : completedMethod === "card"
        ? "Card"
        : "Cash";

  if (screen === "payment") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto min-h-screen max-w-[480px] bg-white">
          <PageHeader
            title="Pay your share"
            subtitle={`Part ${part} of ${totalParts} · ₦${amount.toLocaleString()}`}
            onBack={() => setScreen("review")}
          />
          <div className="px-4 pb-8">
            <DinerPaymentPanel
              amount={amount}
              onComplete={(method) => {
                setCompletedMethod(method);
                setScreen("paid");
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (screen === "paid") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className={cn(DINER.card, "p-8 max-w-sm w-full text-center")}>
          <DinerIconBadge
            icon={CheckCircle}
            tone="success"
            size="lg"
            className="mx-auto mb-4"
          />
          <h2 className={DINER.title}>Payment Confirmed!</h2>
          <p className={cn(DINER.caption, "mt-2")}>
            Your share of the bill has been paid.
          </p>
          <div className={cn(DINER.summaryCard, "mt-4 space-y-2 text-left")}>
            <DinerInfoRow label="Restaurant" value={restaurantName} />
            <DinerInfoRow label="Table" value={tableNumber} />
            <DinerInfoRow
              label="Amount paid"
              value={`₦${amount.toLocaleString()}`}
              emphasis
            />
            <DinerInfoRow label="Payment" value={methodLabel} />
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
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Bill Split
          </p>
          <h1 className={cn(DINER.title, "mt-1")}>{restaurantName}</h1>
          <p className={DINER.caption}>Table {tableNumber}</p>
        </div>

        <div className={cn(DINER.summaryCard, "mb-4 text-center")}>
          <p className={DINER.caption}>
            Part {part} of {totalParts}
          </p>
          <p className={cn(DINER.displayTitleSmall, "mt-1 tabular-nums")}>
            ₦{amount.toLocaleString()}
          </p>
        </div>

        {/* Part progress indicator */}
        <div className="flex gap-1.5 mb-6">
          {Array.from({ length: totalParts }, (_, i) => (
            <div
              key={`progress-${i + 1}`}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                i + 1 < part
                  ? "bg-green-500"
                  : i + 1 === part
                    ? "bg-gray-900"
                    : "bg-gray-200",
              )}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setScreen("payment")}
          className={cn("w-full", DINER.primaryCta, DINER.ctaPress)}
        >
          Pay ₦{amount.toLocaleString()}
        </button>
        <p className={cn(DINER.caption, "text-center mt-3")}>Powered by Moji</p>
      </div>
    </div>
  );
}
