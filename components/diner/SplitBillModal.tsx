"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { PageHeader } from "./ui/PageHeader";
import { SegmentedTabs } from "./ui/SegmentedTabs";
import { ItemCard } from "./ui/ItemCard";
import { DinerInput } from "./ui/DinerInput";
import { DINER } from "./ui/diner-tokens";
import { groupSessionItems } from "@/lib/diner-utils";

const SPLIT_OPTIONS = [2, 3, 4, 5];

interface SplitBillProps {
  total: number;
  restaurantName: string;
  restaurantSlug: string;
  tableNumber: number;
  onBack: () => void;
}

export function SplitBillModal({ total, restaurantName, restaurantSlug, tableNumber, onBack }: SplitBillProps) {
  const [mode, setMode] = useState<"equally" | "item" | "custom">("equally");
  const [parts, setParts] = useState(2);
  const [customParts, setCustomParts] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [generated, setGenerated] = useState(false);
  const [paid, setPaid] = useState<number[]>([]);

  const { sessionBatches, clearSession } = useCartStore();
  const displayItems = groupSessionItems(sessionBatches);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  const numParts = customParts ? parseInt(customParts) || 2 : parts;
  const amountEqually = Math.ceil(total / numParts);

  const selectedItemsTotal = displayItems
    .filter((item) => selectedItemIds.has(item.cartId))
    .reduce((sum, item) => sum + item.lineTotal, 0);

  const [token] = useState(() => Math.random().toString(36).substring(2, 8).toUpperCase());
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const toggleItem = (id: string) => {
    const newSet = new Set(selectedItemIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedItemIds(newSet);
  };

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

          <div className="flex-1 overflow-y-auto px-4 pb-6">
            {mode === "equally" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <p className={DINER.sectionHeading}>How many people are splitting?</p>
                <div className="grid grid-cols-4 gap-2">
                  {SPLIT_OPTIONS.map((n) => (
                    <button
                      key={n}
                      onClick={() => { setParts(n); setCustomParts(""); }}
                      className={cn(
                        "h-12 rounded-xl text-sm font-bold border transition-colors",
                        parts === n && !customParts
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
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
                <p className={DINER.sectionHeading}>Select items you're paying for</p>
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
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold z-10">₦</span>
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
          <div className="flex-none p-4 border-t border-gray-100 bg-white">
            {mode === "equally" && (
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <span className={DINER.body}>Each person pays</span>
                  <span className="text-2xl font-bold text-gray-900">₦{amountEqually.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => setGenerated(true)}
                  className={cn("w-full h-12 rounded-2xl bg-gray-900 text-white font-bold text-base hover:bg-gray-700", DINER.ctaPress)}
                >
                  Generate Split Links
                </button>
              </div>
            )}

            {mode === "item" && (
              <button
                disabled={selectedItemIds.size === 0}
                onClick={() => { alert("Payment for ₦" + selectedItemsTotal.toLocaleString() + " processed successfully!"); onBack(); }}
                className={cn("w-full h-12 rounded-2xl bg-gray-900 text-white font-bold text-base hover:bg-gray-700 disabled:opacity-50", DINER.ctaPress)}
              >
                Pay My Share · ₦{selectedItemsTotal.toLocaleString()}
              </button>
            )}

            {mode === "custom" && (
              <button
                disabled={!customAmount || parseFloat(customAmount) <= 0}
                onClick={() => { alert("Payment for ₦" + customAmount + " processed successfully!"); onBack(); }}
                className={cn("w-full h-12 rounded-2xl bg-gray-900 text-white font-bold text-base hover:bg-gray-700 disabled:opacity-50", DINER.ctaPress)}
              >
                Pay Custom Amount
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Split Status</p>

          {Array.from({ length: numParts }, (_, i) => {
            const isPaid = paid.includes(i);
            const link = `${baseUrl}/split/${token}/${i + 1}`;
            return (
              <div key={i} className={cn(
                "flex items-center justify-between p-4 rounded-2xl border transition-colors",
                isPaid ? "bg-green-50 border-green-100" : DINER.card.replace("shadow-[0_2px_8px_rgb(0,0,0,0.04)]", "")
              )}>
                <div>
                  <p className={DINER.cardTitle}>
                    {i === 0 ? "You" : `Part ${i + 1}`}
                    {isPaid && <span className="ml-2 text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">Paid ✓</span>}
                  </p>
                  <p className={cn(DINER.caption, "mt-0.5")}>₦{amountEqually.toLocaleString()}</p>
                </div>
                {!isPaid ? (
                  i === 0 ? (
                    <button
                      onClick={() => setPaid((prev) => [...prev, i])}
                      className={cn("px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-700 transition-colors", DINER.pressable)}
                    >
                      Pay Now
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(link)}
                        className="px-3 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
                      >
                        Copy Link
                      </button>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`Pay your share for Table ${tableNumber} at ${restaurantName}: ${link}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center px-3 h-8 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-colors"
                      >
                        WhatsApp
                      </a>
                    </div>
                  )
                ) : null}
              </div>
            );
          })}

          {paid.length === numParts && (
            <div className="p-4 bg-green-50 border border-green-100 rounded-2xl text-center">
              <p className="text-sm font-bold text-green-800">All parts paid!</p>
              <p className="text-xs text-green-600 mt-1">Session closed successfully. Receipt sent via WhatsApp.</p>
              <button
                onClick={() => { clearSession(); window.location.href = `/${restaurantSlug}/t/${tableNumber}`; }}
                className="mt-3 px-4 h-10 bg-green-600 text-white text-sm font-bold rounded-xl"
              >
                Close Session
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
