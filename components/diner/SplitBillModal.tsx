"use client";

import { useState } from "react";
import { Users, ArrowLeft } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

import { useCartStore } from "@/store/cart";

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

  const allSessionItems = sessionBatches.flatMap(b => b.items);
  const groupedItems = allSessionItems.reduce((acc, curr) => {
    const modString = JSON.stringify(curr.selectedModifiers);
    const key = `${curr.menuItemId}-${modString}-${curr.specialNote || ""}`;
    if (!acc[key]) acc[key] = { ...curr };
    else {
      acc[key].quantity += curr.quantity;
      acc[key].lineTotal += curr.lineTotal;
    }
    return acc;
  }, {} as Record<string, typeof allSessionItems[0]>);

  const displayItems = Object.values(groupedItems);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  // Calculations
  const numParts = customParts ? parseInt(customParts) || 2 : parts;
  const amountEqually = Math.ceil(total / numParts);

  const selectedItemsTotal = displayItems
    .filter(item => selectedItemIds.has(item.cartId))
    .reduce((sum, item) => sum + item.lineTotal, 0);

  // Base URL for links
  const [token] = useState(() => Math.random().toString(36).substring(2, 8).toUpperCase());
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const handleGenerate = () => setGenerated(true);

  const handlePayPart = (i: number) => {
    if (!paid.includes(i)) {
      setPaid((prev) => [...prev, i]);
    }
  };

  const toggleItem = (id: string) => {
    const newSet = new Set(selectedItemIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedItemIds(newSet);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-white">
      {/* Header */}
      <div className="flex-none px-4 py-4 flex items-center gap-3 border-b border-gray-100">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft size={18} weight="bold" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Split Bill</h2>
          <p className="text-xs text-gray-400">Total: ₦{total.toLocaleString()}</p>
        </div>
      </div>

      {!generated ? (
        <>
          <div className="flex-none px-4 py-4">
            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-xl">
              {(["equally", "item", "custom"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "flex-1 h-10 text-sm font-bold rounded-lg capitalize transition-all",
                    mode === m ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  {m === "item" ? "By Item" : m}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-6">
            {mode === "equally" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <p className="text-sm font-semibold text-gray-700">How many people are splitting?</p>
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
                    >{n}</button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="Custom number of people..."
                  value={customParts}
                  onChange={(e) => setCustomParts(e.target.value)}
                  className="w-full px-4 h-12 border border-gray-200 rounded-xl text-base focus:border-gray-400 focus:outline-none transition-colors"
                />
              </div>
            )}

            {mode === "item" && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                <p className="text-sm font-semibold text-gray-700">Select items you're paying for</p>
                <div className="space-y-2">
                  {displayItems.map((item) => (
                    <div
                      key={item.cartId}
                      onClick={() => toggleItem(item.cartId)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
                        selectedItemIds.has(item.cartId) ? "border-gray-900 bg-gray-50" : "border-gray-100 bg-white hover:border-gray-300"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded border flex items-center justify-center flex-none",
                        selectedItemIds.has(item.cartId) ? "bg-gray-900 border-gray-900 text-white" : "border-gray-300"
                      )}>
                        {selectedItemIds.has(item.cartId) && <span className="text-xs font-bold">✓</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 leading-tight truncate">{item.quantity}× {item.itemName}</p>
                        <p className="font-medium text-sm text-gray-900 mt-0.5">₦{item.lineTotal.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mode === "custom" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <p className="text-sm font-semibold text-gray-700">How much are you paying?</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₦</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full pl-10 pr-4 h-12 text-xl font-bold border border-gray-200 rounded-xl focus:border-gray-400 focus:outline-none transition-colors"
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
                  <span className="text-sm text-gray-500 font-medium">Each person pays</span>
                  <span className="text-2xl font-bold text-gray-900">₦{amountEqually.toLocaleString()}</span>
                </div>
                <button
                  onClick={handleGenerate}
                  className="w-full h-12 rounded-2xl bg-gray-900 text-white font-bold text-base hover:bg-gray-700 active:scale-[0.98] transition-all"
                >
                  Generate Split Links
                </button>
              </div>
            )}

            {mode === "item" && (
              <button
                disabled={selectedItemIds.size === 0}
                onClick={() => {
                  alert("Payment for N" + selectedItemsTotal + " processed successfully!");
                  onBack(); // Just for demo
                }}
                className="w-full h-12 rounded-2xl bg-gray-900 text-white font-bold text-base hover:bg-gray-700 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                Pay My Share · ₦{selectedItemsTotal.toLocaleString()}
              </button>
            )}

            {mode === "custom" && (
              <button
                disabled={!customAmount || parseFloat(customAmount) <= 0}
                onClick={() => {
                  alert("Payment for N" + customAmount + " processed successfully!");
                  onBack(); // Just for demo
                }}
                className="w-full h-12 rounded-2xl bg-gray-900 text-white font-bold text-base hover:bg-gray-700 active:scale-[0.98] transition-all disabled:opacity-50"
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
                "flex items-center justify-between p-4 rounded-xl border transition-colors",
                isPaid ? "bg-green-50 border-green-100" : "bg-white border-gray-100"
              )}>
                <div>
                  <p className="font-semibold text-sm text-gray-900">
                    {i === 0 ? "You" : `Part ${i + 1}`}
                    {isPaid && <span className="ml-2 text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">Paid ✓</span>}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">₦{amountEqually.toLocaleString()}</p>
                </div>
                {!isPaid ? (
                  i === 0 ? (
                    <button
                      onClick={() => handlePayPart(i)}
                      className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-700 transition-colors active:scale-[0.97]"
                    >
                      Pay Now
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(link)}
                        className="px-3 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
                      >
                        Copy Link
                      </button>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`Pay your share for Table ${tableNumber} at ${restaurantName}: ${link}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center px-3 h-8 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors"
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
            <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-center">
              <p className="text-sm font-bold text-green-800">All parts paid! 🎉</p>
              <p className="text-xs text-green-600 mt-1">Session closed successfully. Receipt sent via WhatsApp.</p>
              <button
                onClick={() => {
                  clearSession();
                  window.location.href = `/${restaurantSlug}/t/${tableNumber}`;
                }}
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
