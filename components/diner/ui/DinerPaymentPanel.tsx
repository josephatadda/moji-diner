"use client";

import {
  Bank,
  CheckCircle,
  Copy,
  CreditCard,
  Money,
} from "@phosphor-icons/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DinerIconBadge } from "./DinerIconBadge";
import { DinerInfoRow } from "./DinerInfoRow";
import { dinerToast } from "./diner-toast";
import { DINER } from "./diner-tokens";
import { FixedActionBar } from "./FixedActionBar";
import { SegmentedTabs } from "./SegmentedTabs";

interface DinerPaymentPanelProps {
  amount: number;
  onComplete: (method: "bank" | "card" | "cash") => void;
}

export function DinerPaymentPanel({
  amount,
  onComplete,
}: DinerPaymentPanelProps) {
  const [method, setMethod] = useState<"bank" | "card" | "cash">("bank");
  const [copied, setCopied] = useState(false);
  const formattedAmount = `₦${Math.round(amount).toLocaleString()}`;

  return (
    <div className="space-y-5 pb-32">
      <SegmentedTabs
        options={[
          { value: "bank", label: "Transfer" },
          { value: "card", label: "Card" },
          { value: "cash", label: "Cash" },
        ]}
        value={method}
        onChange={setMethod}
      />

      {method === "bank" && (
        <div className={cn(DINER.card, "p-5")}>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
              <Bank size={24} weight="fill" />
            </div>
            <div className="min-w-0">
              <h3 className={DINER.title}>Bank transfer</h3>
              <p className={DINER.caption}>Send payment to this account</p>
            </div>
          </div>

          <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Amount to transfer
            </p>
            <p className="mt-1 text-[32px] font-bold leading-none tracking-tight text-gray-950 tabular-nums">
              {formattedAmount}
            </p>
          </div>

          <div className={cn(DINER.summaryCard, "mb-6 space-y-3")}>
            <DinerInfoRow label="Bank Name" value="GTBank" />
            <DinerInfoRow label="Account Name" value="Moji Restaurant" />
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-gray-500">Account No.</span>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-wider text-gray-900">
                  0123456789
                </span>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard
                      .writeText("0123456789")
                      .then(() => {
                        setCopied(true);
                        dinerToast.success("Account number copied");
                        setTimeout(() => setCopied(false), 2000);
                      })
                      .catch(() =>
                        dinerToast.error("Could not copy account number"),
                      );
                  }}
                  className={cn(DINER.iconButton, "h-8 w-8", DINER.pressable)}
                >
                  {copied ? (
                    <CheckCircle
                      size={14}
                      weight="bold"
                      className="text-green-600"
                    />
                  ) : (
                    <Copy size={14} weight="bold" className="text-gray-700" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {method === "card" && (
        <div className={cn(DINER.card, "p-5 py-8 text-center")}>
          <DinerIconBadge
            icon={CreditCard}
            tone="info"
            size="lg"
            className="mx-auto mb-4"
          />
          <h3 className={cn(DINER.title, "mb-2 text-lg")}>Pay with Card</h3>
          <p className={cn(DINER.body, "mx-auto mb-8 max-w-[220px]")}>
            A waiter will bring the POS terminal to your table for{" "}
            {formattedAmount}.
          </p>
        </div>
      )}

      {method === "cash" && (
        <div className={cn(DINER.card, "p-5 py-8 text-center")}>
          <DinerIconBadge
            icon={Money}
            tone="success"
            size="lg"
            className="mx-auto mb-4"
          />
          <h3 className={cn(DINER.title, "mb-2 text-lg")}>Pay with Cash</h3>
          <p className={cn(DINER.body, "mx-auto mb-8 max-w-[220px]")}>
            A waiter will come to your table to collect {formattedAmount}.
          </p>
        </div>
      )}

      <FixedActionBar>
        <button
          type="button"
          onClick={() => onComplete(method)}
          className={cn("w-full", DINER.primaryCta, DINER.ctaPress)}
        >
          {method === "bank"
            ? `I have transferred ${formattedAmount}`
            : `Mark ${formattedAmount} as paid`}
        </button>
      </FixedActionBar>
    </div>
  );
}
