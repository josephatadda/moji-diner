"use client";

import { CheckCircle, WhatsappLogo } from "@phosphor-icons/react";
import { useState } from "react";
import { groupSessionItems } from "@/lib/diner-utils";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { DinerFeedbackCard } from "./ui/DinerFeedbackCard";
import { DinerInfoRow } from "./ui/DinerInfoRow";
import { DinerInput } from "./ui/DinerInput";
import { DinerPaymentPanel } from "./ui/DinerPaymentPanel";
import { dinerToast } from "./ui/diner-toast";
import { DINER } from "./ui/diner-tokens";
import { ItemCard } from "./ui/ItemCard";
import { PageHeader } from "./ui/PageHeader";
import { SegmentedTabs } from "./ui/SegmentedTabs";

const SPLIT_OPTIONS = [2, 3, 4, 5];

interface SplitBillProps {
  total: number;
  restaurantName: string;
  restaurantSlug: string;
  tableNumber: number;
  onBack: () => void;
}

interface PendingPayment {
  amount: number;
  label: string;
  partIndex?: number;
  closeOnComplete?: boolean;
}

export function SplitBillModal({
  total,
  restaurantName,
  restaurantSlug,
  tableNumber,
  onBack,
}: SplitBillProps) {
  const [mode, setMode] = useState<"equally" | "item" | "custom">("equally");
  const [parts, setParts] = useState(2);
  const [customParts, setCustomParts] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [generated, setGenerated] = useState(false);
  const [paid, setPaid] = useState<number[]>([]);
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(
    null,
  );

  const { sessionBatches, clearSession } = useCartStore();
  const displayItems = groupSessionItems(sessionBatches);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    new Set(),
  );

  const numParts = customParts ? parseInt(customParts, 10) || 2 : parts;
  const amountEqually = Math.ceil(total / numParts);

  const selectedItemsTotal = displayItems
    .filter((item) => selectedItemIds.has(item.cartId))
    .reduce((sum, item) => sum + item.lineTotal, 0);

  const [token] = useState(() =>
    Math.random().toString(36).substring(2, 8).toUpperCase(),
  );
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const toggleItem = (id: string) => {
    const newSet = new Set(selectedItemIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedItemIds(newSet);
  };

  if (pendingPayment) {
    return (
      <div className="flex h-[100dvh] flex-col bg-white">
        <PageHeader
          title="Payment Method"
          subtitle={`${pendingPayment.label} · ₦${Math.round(pendingPayment.amount).toLocaleString()}`}
          onBack={() => setPendingPayment(null)}
        />
        <div className="px-4 pb-8">
          <DinerPaymentPanel
            amount={pendingPayment.amount}
            onComplete={() => {
              if (typeof pendingPayment.partIndex === "number") {
                setPaid((prev) =>
                  prev.includes(pendingPayment.partIndex as number)
                    ? prev
                    : [...prev, pendingPayment.partIndex as number],
                );
              }
              dinerToast.success("Payment recorded");
              setPendingPayment(null);
              if (pendingPayment.closeOnComplete) onBack();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-white">
      <PageHeader
        title="Split Bill"
        subtitle={`Total: ₦${Math.round(total).toLocaleString()}`}
        onBack={onBack}
      />

      {!generated ? (
        <>
          <div className="flex-none px-4 pb-4">
            <SegmentedTabs
              options={[
                { value: "equally", label: "Equally" },
                { value: "item", label: "By Item" },
                { value: "custom", label: "Custom" },
              ]}
              value={mode}
              onChange={setMode}
            />
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-24">
            {mode === "equally" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <p className={DINER.sectionHeading}>
                  How many people are splitting?
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {SPLIT_OPTIONS.map((n) => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => {
                        setParts(n);
                        setCustomParts("");
                      }}
                      className={cn(
                        "flex items-center justify-center",
                        DINER.choicePill,
                        parts === n && !customParts && DINER.choicePillActive,
                        DINER.pressable,
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <DinerInput
                  type="number"
                  placeholder="Custom number of people..."
                  value={customParts}
                  onChange={(e) => setCustomParts(e.target.value)}
                />
              </div>
            )}

            {mode === "item" && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                <p className={DINER.sectionHeading}>
                  Select items you're paying for
                </p>
                <div className={DINER.listGap}>
                  {displayItems.map((item) => (
                    <ItemCard
                      key={item.cartId}
                      variant="selectable"
                      item={item}
                      selected={selectedItemIds.has(item.cartId)}
                      onToggle={() => toggleItem(item.cartId)}
                    />
                  ))}
                </div>
              </div>
            )}

            {mode === "custom" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <p className={DINER.sectionHeading}>How much are you paying?</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold z-10">
                    ₦
                  </span>
                  <DinerInput
                    type="number"
                    placeholder="0"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="pl-10 text-xl font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sticky Bottom Bar */}
          <div className="flex-none border-t border-gray-100 bg-white p-4 pb-[calc(18px+env(safe-area-inset-bottom))]">
            {mode === "equally" && (
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <span className={DINER.body}>Each person pays</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ₦{amountEqually.toLocaleString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setGenerated(true)}
                  className={cn("w-full", DINER.primaryCta, DINER.ctaPress)}
                >
                  Generate Split Links
                </button>
              </div>
            )}

            {mode === "item" && (
              <button
                type="button"
                disabled={selectedItemIds.size === 0}
                onClick={() => {
                  setPendingPayment({
                    amount: selectedItemsTotal,
                    label: "My share",
                    closeOnComplete: true,
                  });
                }}
                className={cn("w-full", DINER.primaryCta, DINER.ctaPress)}
              >
                Pay My Share · ₦{selectedItemsTotal.toLocaleString()}
              </button>
            )}

            {mode === "custom" && (
              <button
                type="button"
                disabled={!customAmount || parseFloat(customAmount) <= 0}
                onClick={() => {
                  setPendingPayment({
                    amount: parseFloat(customAmount),
                    label: "Custom payment",
                    closeOnComplete: true,
                  });
                }}
                className={cn("w-full", DINER.primaryCta, DINER.ctaPress)}
              >
                Pay Custom Amount
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Split Status
          </p>

          {Array.from({ length: numParts }, (_, i) => {
            const isPaid = paid.includes(i);
            const link = `${baseUrl}/split/${token}/${i + 1}`;
            return (
              <div
                key={`split-part-${i + 1}`}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl border p-4 transition-colors",
                  isPaid
                    ? "bg-green-50 border-green-100"
                    : "bg-white border-gray-100",
                )}
              >
                <div className="min-w-0">
                  <p className={DINER.cardTitle}>
                    {i === 0 ? "You" : `Part ${i + 1}`}
                    {isPaid && (
                      <span className="ml-2 text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                        Paid ✓
                      </span>
                    )}
                  </p>
                  <p className={cn(DINER.caption, "mt-0.5")}>
                    ₦{amountEqually.toLocaleString()}
                  </p>
                </div>
                {!isPaid ? (
                  i === 0 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setPendingPayment({
                          amount: amountEqually,
                          label: i === 0 ? "Your share" : `Part ${i + 1}`,
                          partIndex: i,
                        })
                      }
                      className={cn(
                        DINER.primaryCta,
                        "h-8 px-4 text-xs",
                        DINER.pressable,
                      )}
                    >
                      Pay Now
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          void navigator.clipboard
                            .writeText(link)
                            .then(() => dinerToast.success("Split link copied"))
                            .catch(() =>
                              dinerToast.error("Could not copy link"),
                            );
                        }}
                        className={cn(
                          DINER.secondaryCta,
                          "h-8 px-3 text-xs font-medium",
                          DINER.pressable,
                        )}
                      >
                        Copy Link
                      </button>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`Pay your share for Table ${tableNumber} at ${restaurantName}: ${link}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                          "flex h-8 items-center rounded-full bg-green-600 px-3 text-xs font-bold text-white transition-colors hover:bg-green-700",
                          DINER.pressable,
                        )}
                      >
                        <WhatsappLogo
                          size={14}
                          weight="fill"
                          className="mr-1"
                        />
                        Send
                      </a>
                    </div>
                  )
                ) : null}
              </div>
            );
          })}

          {paid.length === numParts && (
            <DinerFeedbackCard
              title="All parts paid!"
              description="Session closed successfully. Receipt sent via WhatsApp."
              icon={CheckCircle}
              tone="success"
              align="center"
            >
              <div className="mt-3 space-y-2 border-t border-green-100 pt-3">
                <DinerInfoRow
                  label="Parts"
                  value={`${numParts}/${numParts} paid`}
                  emphasis
                />
                <DinerInfoRow
                  label="Total"
                  value={`₦${Math.round(total).toLocaleString()}`}
                  emphasis
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  clearSession();
                  window.location.href = `/${restaurantSlug}/t/${tableNumber}`;
                }}
                className={cn(
                  "mt-3 h-10 rounded-full bg-green-600 px-4 text-sm font-bold text-white hover:bg-green-700",
                  DINER.pressable,
                )}
              >
                Close Session
              </button>
            </DinerFeedbackCard>
          )}
        </div>
      )}
    </div>
  );
}
