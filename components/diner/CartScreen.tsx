"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { useState } from "react";
import { PhoneCaptureModal } from "./PhoneCaptureModal";
import { cn } from "@/lib/utils";
import { BowlFood, ShoppingCart } from "@phosphor-icons/react";
import { PageHeader } from "./ui/PageHeader";
import { BillSummary } from "./ui/BillSummary";
import { ItemCard } from "./ui/ItemCard";
import { OrderStatusTimeline } from "./ui/OrderStatusTimeline";
import { DINER } from "./ui/diner-tokens";
import { groupSessionItems, calculateBill, formatModifiers, hasModifiers } from "@/lib/diner-utils";

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
  const { items, sessionBatches, updateQuantity, clearCart, subtotal, submitCartToSession, serveAllBatches, setLoyaltyData } = useCartStore();
  const [phoneCaptureOpen, setPhoneCaptureOpen] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [timelineBatchId, setTimelineBatchId] = useState<string | null>(null);

  const menuUrl = `/${restaurantSlug}/t/${tableNumber}`;
  const sub = subtotal();
  const { vat, total } = calculateBill({ subtotal: sub, vatRate, vatEnabled });

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

  // Session orders view
  if (items.length === 0 && sessionBatches.length > 0) {
    const sessionSub = sessionBatches.reduce((sum, b) => sum + b.items.reduce((s, i) => s + i.lineTotal, 0), 0);
    const { vat: sessionVat, total: sessionTotal } = calculateBill({ subtotal: sessionSub, vatRate, vatEnabled });
    const allServed = sessionBatches.every((b) => b.status === "served");
    const timelineBatch = sessionBatches.find((b) => b.id === timelineBatchId) ?? null;

    return (
      <div>
        <PageHeader
          title="Your Orders"
          subtitle={`Table ${tableNumber}`}
          backHref={menuUrl}
        />

        <div className="px-4 space-y-4">
          {sessionBatches.map((batch) => {
            const groupedItems = groupSessionItems([batch]);
            const batchTotal = batch.items.reduce((sum, i) => sum + i.lineTotal, 0);
            const batchItemCount = batch.items.reduce((sum, i) => sum + i.quantity, 0);

            return (
              <div key={batch.id} className={DINER.card}>
                <div
                  className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between cursor-pointer active:bg-gray-100 transition-colors rounded-t-2xl"
                  onClick={() => setTimelineBatchId(batch.id)}
                >
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-medium tracking-wide uppercase">
                      Order {new Date(batch.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className={cn(DINER.caption, "mt-0.5")}>
                      {batchItemCount} items · ₦{batchTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-gray-200 shadow-sm">
                    <div className={cn("w-1.5 h-1.5 rounded-full", batch.status === "preparing" ? DINER.statusPreparing : DINER.statusReady)} />
                    <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">{batch.status}</span>
                  </div>
                </div>

                <div className="divide-y divide-gray-50">
                  {groupedItems.map((item) => (
                    <div key={item.cartId} className="flex items-center gap-3 p-4 bg-white">
                      <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center flex-none text-gray-400">
                        <BowlFood size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900 leading-tight truncate">
                            <span className="text-orange-500 mr-1.5 font-bold">{item.quantity}x</span>
                            {item.itemName}
                          </p>
                          <p className="text-sm font-bold text-gray-900 ml-3 flex-none">₦{item.lineTotal.toLocaleString()}</p>
                        </div>
                        {hasModifiers(item.selectedModifiers) && (
                          <p className="text-xs text-gray-400 mt-0.5">{formatModifiers(item.selectedModifiers)}</p>
                        )}
                        {item.specialNote && (
                          <p className="text-xs text-blue-500 mt-0.5 italic">"{item.specialNote}"</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-4 mt-6">
          <BillSummary
            subtotal={sessionSub}
            vat={sessionVat}
            vatRate={vatRate}
            vatEnabled={vatEnabled}
            total={sessionTotal}
          />
        </div>

        <div className="flex flex-col gap-3 px-4 mt-6 pb-8">
          {!allServed && (
            <button
              onClick={serveAllBatches}
              className="text-xs font-semibold text-orange-600 bg-orange-50 py-2 rounded-xl border border-orange-100 uppercase tracking-wide"
            >
              [Demo] Mark all as served
            </button>
          )}

          <Link
            href={menuUrl}
            className="flex items-center justify-center w-full h-12 bg-gray-100 text-gray-900 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-colors"
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
              "w-full h-12 rounded-2xl font-bold text-sm transition-colors",
              allServed
                ? "bg-gray-900 text-white hover:bg-gray-800"
                : "bg-gray-200 text-gray-500 cursor-not-allowed opacity-80"
            )}
          >
            {allServed ? "Request bill" : "Food still being prepared"}
          </button>
        </div>

        <OrderStatusTimeline
          open={!!timelineBatchId}
          onClose={() => setTimelineBatchId(null)}
          batch={timelineBatch}
        />
      </div>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <ShoppingCart size={48} className="text-gray-300" />
        <h2 className="text-xl font-bold text-gray-900 mt-4">Your cart is empty</h2>
        <p className="text-sm text-gray-400 mt-2">Browse the menu and add items to get started.</p>
        <Link
          href={menuUrl}
          className="mt-6 bg-gray-900 text-white px-6 h-12 rounded-2xl text-sm font-bold hover:bg-gray-700 transition-all flex items-center justify-center"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  // Active cart
  return (
    <>
      <PageHeader
        title="Your Order"
        backHref={menuUrl}
        rightAction={
          <button onClick={() => clearCart()} className="text-xs text-red-500 font-medium hover:text-red-700">
            Clear all
          </button>
        }
      />

      <div className="px-4 space-y-3 pb-8">
        <div className={DINER.listGap}>
          {items.map((item) => (
            <ItemCard
              key={item.cartId}
              variant="cart"
              item={item}
              onIncrement={() => updateQuantity(item.cartId, item.quantity + 1)}
              onDecrement={() => updateQuantity(item.cartId, item.quantity - 1)}
            />
          ))}
        </div>

        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 focus-within:border-gray-300 transition-colors">
          <textarea
            value={orderNote}
            onChange={(e) => setOrderNote(e.target.value)}
            placeholder="Add a note for the kitchen (optional)..."
            className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none resize-none"
            rows={2}
          />
        </div>

        <BillSummary subtotal={sub} vat={vat} vatRate={vatRate} vatEnabled={vatEnabled} total={total} />

        <button
          onClick={handlePlaceOrder}
          className={cn("w-full h-12 rounded-2xl bg-gray-900 text-white font-bold text-base hover:bg-gray-700", DINER.ctaPress)}
        >
          Place Order · ₦{Math.round(total).toLocaleString()}
        </button>

        <p className="text-center text-xs text-gray-400 pb-4">
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
