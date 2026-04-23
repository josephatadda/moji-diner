"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { useState } from "react";
import { PhoneCaptureModal } from "./PhoneCaptureModal";
import { cn } from "@/lib/utils";
import { BowlFood, ShoppingCart, CheckCircle } from "@phosphor-icons/react";

interface CartScreenProps {
  restaurantSlug: string;
  tableNumber: number;
  vatRate: number;
  vatEnabled: boolean;
  loyaltyEnabled: boolean;
}

export function CartScreen({
  restaurantSlug,
  tableNumber,
  vatRate,
  vatEnabled,
  loyaltyEnabled,
}: CartScreenProps) {
  const { items, sessionBatches, removeItem, updateQuantity, clearCart, subtotal, submitCartToSession, serveAllBatches, setLoyaltyData } = useCartStore();
  const [phoneCaptureOpen, setPhoneCaptureOpen] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [selectedTimelineBatch, setSelectedTimelineBatch] = useState<string | null>(null);

  const sub = subtotal();
  const vat = vatEnabled ? sub * (vatRate / 100) : 0;
  const total = sub + vat;

  const handlePlaceOrder = () => {
    if (loyaltyEnabled) {
      setPhoneCaptureOpen(true);
    } else {
      submitOrder();
    }
  };

  const submitOrder = () => {
    submitCartToSession();
    setOrderNote("");
  };

  if (items.length === 0 && sessionBatches.length > 0) {
    const totalSession = sessionBatches.reduce((sum, b) => sum + b.items.reduce((s, i) => s + i.lineTotal, 0), 0);
    const vatSession = vatEnabled ? totalSession * (vatRate / 100) : 0;
    const finalSession = totalSession + vatSession;

    const activeBatch = sessionBatches.find(b => b.id === selectedTimelineBatch);
    const allServed = sessionBatches.every(b => b.status === "served");

    return (
      <div className="px-4 py-6 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full text-green-600 mb-3">
            <CheckCircle size={32} weight="fill" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Your Orders</h2>
          <p className="text-gray-500 text-sm mt-1">Live session tab</p>
        </div>

        <div className="space-y-4">
          {sessionBatches.map((batch) => {
            const groupedBatchItems = batch.items.reduce((acc, curr) => {
              const modString = JSON.stringify(curr.selectedModifiers);
              const key = `${curr.menuItemId}-${modString}-${curr.specialNote || ""}`;
              if (!acc[key]) acc[key] = { ...curr };
              else {
                acc[key].quantity += curr.quantity;
                acc[key].lineTotal += curr.lineTotal;
              }
              return acc;
            }, {} as Record<string, typeof batch.items[0]>);

            const displayItems = Object.values(groupedBatchItems);
            const batchTotal = batch.items.reduce((sum, i) => sum + i.lineTotal, 0);

            return (
              <div key={batch.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_2px_8px_rgb(0,0,0,0.04)]">
                <div
                  className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between cursor-pointer active:bg-gray-100 transition-colors"
                  onClick={() => setSelectedTimelineBatch(batch.id)}
                >
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-medium tracking-wide uppercase">Order {new Date(batch.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-[11px] text-gray-400 mt-0.5">{batch.items.reduce((sum, i) => sum + i.quantity, 0)} items · ₦{batchTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-gray-200 shadow-sm">
                    <div className={cn("w-1.5 h-1.5 rounded-full", batch.status === "preparing" ? "bg-orange-500 animate-pulse" : "bg-green-500")} />
                    <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">{batch.status}</span>
                  </div>
                </div>

                <div className="divide-y divide-gray-50">
                  {displayItems.map((item, idx) => (
                    <div key={item.cartId + idx} className="flex items-center gap-3 p-3 bg-white">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-none text-gray-500">
                        <span className="text-xl"><BowlFood /></span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm text-gray-900 leading-tight truncate">
                            <span className="text-orange-500 mr-1.5 font-bold">{item.quantity}x</span>
                            {item.itemName}
                          </p>
                          <p className="font-bold text-sm text-gray-900 ml-3 flex-none">₦{item.lineTotal.toLocaleString()}</p>
                        </div>
                        {Object.values(item.selectedModifiers).flat().length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                            {Object.values(item.selectedModifiers).flat().map((o) => o.name).join(", ")}
                          </p>
                        )}
                        {item.specialNote && (
                          <p className="text-xs text-blue-500 mt-1 italic">"{item.specialNote}"</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-gray-50 rounded-xl p-4 space-y-2 mt-4">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span>₦{totalSession.toLocaleString()}</span>
          </div>
          {vatEnabled && (
            <div className="flex justify-between text-sm text-gray-500">
              <span>VAT ({vatRate}%)</span>
              <span>₦{vatSession.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </div>
          )}
          <div className="h-px bg-gray-200 my-1" />
          <div className="flex justify-between font-bold text-gray-900">
            <span>Total to pay</span>
            <span>₦{finalSession.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          {!allServed && (
            <button
              onClick={serveAllBatches}
              className="text-xs font-semibold text-orange-600 bg-orange-50 py-2 rounded-lg border border-orange-100 uppercase tracking-wide"
            >
              [Demo] Mark all as served
            </button>
          )}

          <Link
            href={`/${restaurantSlug}/t/${tableNumber}`}
            className="w-full h-12 bg-gray-100 text-gray-900 rounded-xl font-bold text-sm text-center hover:bg-gray-200 transition-colors"
          >
            + Add more items
          </Link>

          <button
            onClick={() => {
              if (allServed) {
                window.location.href = `/${restaurantSlug}/t/${tableNumber}/bill`;
              }
            }}
            disabled={!allServed}
            className={cn(
              "w-full h-12 rounded-xl font-bold text-sm text-center transition-colors",
              allServed
                ? "bg-gray-900 text-white hover:bg-gray-800"
                : "bg-gray-200 text-gray-500 cursor-not-allowed opacity-80"
            )}
          >
            {allServed ? "Request bill" : "Food still being prepared"}
          </button>
        </div>

        {/* Timeline Modal */}
        {selectedTimelineBatch && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-[400px] p-6 shadow-2xl relative animate-in slide-in-from-bottom-10 fade-in duration-200">
              <button
                onClick={() => setSelectedTimelineBatch(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              >
                ✕
              </button>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Order Status</h3>

              <div className="relative pl-6 space-y-6">
                <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gray-100" />

                <div className="relative flex items-center gap-4">
                  <div className="absolute -left-[27px] w-5 h-5 bg-green-500 border-4 border-white rounded-full flex items-center justify-center shadow-sm">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">Order placed</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(activeBatch!.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                <div className="relative flex items-center gap-4">
                  <div className={cn("absolute -left-[27px] w-5 h-5 border-4 border-white rounded-full shadow-sm", activeBatch?.status === "preparing" ? "bg-orange-500 animate-pulse" : "bg-green-500")} />
                  <div>
                    <p className="font-bold text-sm text-gray-900">Being prepared</p>
                    <p className="text-xs text-gray-400 mt-0.5">Kitchen is working on it</p>
                  </div>
                </div>

                <div className="relative flex items-center gap-4">
                  <div className={cn("absolute -left-[27px] w-5 h-5 border-4 border-white rounded-full", activeBatch?.status === "ready" || activeBatch?.status === "served" ? "bg-green-500 shadow-sm" : "bg-gray-200")} />
                  <div>
                    <p className={cn("font-bold text-sm", activeBatch?.status === "ready" || activeBatch?.status === "served" ? "text-gray-900" : "text-gray-400")}>Ready</p>
                  </div>
                </div>

                <div className="relative flex items-center gap-4">
                  <div className={cn("absolute -left-[27px] w-5 h-5 border-4 border-white rounded-full", activeBatch?.status === "served" ? "bg-green-500 shadow-sm" : "bg-gray-200")} />
                  <div>
                    <p className={cn("font-bold text-sm", activeBatch?.status === "served" ? "text-gray-900" : "text-gray-400")}>Served</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center text-gray-300">
        <span className="text-5xl mb-4"><ShoppingCart /></span>
        <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="text-sm text-gray-400 mt-2">Browse the menu and add items to get started.</p>
        <div className="flex flex-col gap-3 mt-6 w-full max-w-xs">
          <Link
            href={`/${restaurantSlug}/t/${tableNumber}`}
            className="bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-gray-700 transition-all text-center"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 py-4 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-gray-900">Your Order</h2>
          <button
            onClick={() => clearCart()}
            className="text-xs text-red-500 font-medium hover:text-red-700"
          >
            Clear all
          </button>
        </div>

        {/* Cart items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.cartId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-white shadow-sm border border-gray-100 rounded-lg flex items-center justify-center flex-none text-gray-400">
                <span className="text-xl"><BowlFood /></span>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="font-semibold text-sm text-gray-900 leading-tight truncate">{item.itemName}</p>
                {/* Selected modifiers */}
                {Object.values(item.selectedModifiers).flat().length > 0 && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {Object.values(item.selectedModifiers)
                      .flat()
                      .map((o) => o.name)
                      .join(", ")}
                  </p>
                )}
                {item.specialNote && (
                  <p className="text-xs text-blue-500 mt-0.5 italic truncate">"{item.specialNote}"</p>
                )}
                <p className="font-bold text-sm text-gray-900 mt-1">₦{item.lineTotal.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-none">
                <button
                  onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                  className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 font-bold active:scale-[0.97] transition-all ease-out"
                >
                  −
                </button>
                <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                  className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold active:scale-[0.97] transition-all ease-out"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Note */}
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 focus-within:border-gray-300 transition-colors">
          <textarea
            value={orderNote}
            onChange={(e) => setOrderNote(e.target.value)}
            placeholder="Add a note for the kitchen (optional)..."
            className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none resize-none"
            rows={2}
          />
        </div>

        {/* Bill summary */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span>₦{sub.toLocaleString()}</span>
          </div>
          {vatEnabled && (
            <div className="flex justify-between text-sm text-gray-500">
              <span>VAT ({vatRate}%)</span>
              <span>₦{vat.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </div>
          )}
          <div className="h-px bg-gray-200 my-1" />
          <div className="flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span>₦{total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
          </div>
        </div>

        {/* Place order */}
        <button
          onClick={handlePlaceOrder}
          className="w-full h-12 rounded-2xl bg-gray-900 text-white font-bold text-base hover:bg-gray-700 active:scale-[0.98] transition-all"
        >
          Place Order · ₦{total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </button>

        <p className="text-center text-xs text-gray-400 pt-1 pb-4">
          You'll pay after your food is served
        </p>
      </div>

      <PhoneCaptureModal
        open={phoneCaptureOpen}
        onClose={() => setPhoneCaptureOpen(false)}
        onSkip={submitOrder}
        onConfirm={(name, phone) => {
          setLoyaltyData(name, phone);
          submitOrder();
        }}
        existingPoints={1250}
        isReturning={false}
      />
    </>
  );
}
