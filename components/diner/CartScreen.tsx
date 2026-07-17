"use client";

import { ShoppingCart } from "@phosphor-icons/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { calculateBill, groupSessionItems } from "@/lib/diner-utils";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { PhoneCaptureModal } from "./PhoneCaptureModal";
import { BillSummary } from "./ui/BillSummary";
import { DinerIconBadge } from "./ui/DinerIconBadge";
import { DINER } from "./ui/diner-tokens";
import { FixedActionBar } from "./ui/FixedActionBar";
import { ItemCard } from "./ui/ItemCard";
import { OrderStatusTimeline } from "./ui/OrderStatusTimeline";
import { PageHeader } from "./ui/PageHeader";

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
  const {
    items,
    sessionBatches,
    updateQuantity,
    clearCart,
    subtotal,
    submitCartToSession,
    serveAllBatches,
    setLoyaltyData,
  } = useCartStore();
  const searchParams = useSearchParams();
  const [phoneCaptureOpen, setPhoneCaptureOpen] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [timelineBatchId, setTimelineBatchId] = useState<string | null>(null);

  const menuUrl = `/${restaurantSlug}/t/${tableNumber}`;
  const billUrl = `/${restaurantSlug}/t/${tableNumber}/bill`;
  const requestedView = searchParams.get("view");
  const showSessionOrders =
    sessionBatches.length > 0 &&
    (requestedView === "orders" ||
      (items.length === 0 && requestedView !== "cart"));
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
    window.history.replaceState(null, "", "?view=orders");
  };

  // Session orders view
  if (showSessionOrders) {
    const sessionSub = sessionBatches.reduce(
      (sum, b) =>
        sum +
        b.items.reduce(
          (s, i) => s + (i.lineTotal ?? (i.itemPrice ?? 0) * (i.quantity ?? 1)),
          0,
        ),
      0,
    );
    const { vat: sessionVat, total: sessionTotal } = calculateBill({
      subtotal: sessionSub,
      vatRate,
      vatEnabled,
    });
    const allServed = sessionBatches.every((b) => b.status === "served");
    const timelineBatch =
      sessionBatches.find((b) => b.id === timelineBatchId) ?? null;

    return (
      <div>
        <PageHeader
          title="Your Orders"
          subtitle="Dine-in Menu"
          backHref={menuUrl}
        />

        <div className="px-4 space-y-4">
          {sessionBatches.map((batch) => {
            const groupedItems = groupSessionItems([batch]);
            const batchTotal = batch.items.reduce(
              (sum, i) =>
                sum + (i.lineTotal ?? (i.itemPrice ?? 0) * (i.quantity ?? 1)),
              0,
            );
            const batchItemCount = batch.items.reduce(
              (sum, i) => sum + (i.quantity ?? 0),
              0,
            );

            return (
              <div key={batch.id} className={DINER.card}>
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-t-xl border-b border-gray-100 bg-gray-50 px-4 py-3 text-left transition-colors active:bg-gray-100"
                  onClick={() => setTimelineBatchId(batch.id)}
                >
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-medium tracking-wide uppercase">
                      Order{" "}
                      {new Date(batch.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className={cn(DINER.caption, "mt-0.5")}>
                      {batchItemCount} items · ₦{batchTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className={DINER.statusChip}>
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        batch.status === "preparing"
                          ? DINER.statusPreparing
                          : DINER.statusReady,
                      )}
                    />
                    <span>{batch.status}</span>
                  </div>
                </button>

                <div className="p-3 space-y-2">
                  {groupedItems.map((item, index) => (
                    <ItemCard
                      key={
                        item.cartId || `${item.menuItemId || "item"}-${index}`
                      }
                      variant="order"
                      item={item}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-4 mt-4 pb-44">
          <BillSummary
            subtotal={sessionSub}
            vat={sessionVat}
            vatRate={vatRate}
            vatEnabled={vatEnabled}
            total={sessionTotal}
          />
        </div>

        <FixedActionBar>
          {!allServed && (
            <button
              type="button"
              onClick={serveAllBatches}
              className={cn(DINER.demoAction, DINER.pressable)}
            >
              [Demo] Mark all as served
            </button>
          )}

          {allServed ? (
            <Link
              href={billUrl}
              className={cn(
                "flex w-full items-center justify-center",
                DINER.primaryCta,
                DINER.ctaPress,
              )}
            >
              Request Bill · ₦{Math.round(sessionTotal).toLocaleString()}
            </Link>
          ) : (
            <p className="rounded-2xl bg-gray-50 px-3 py-2 text-center text-xs font-medium text-gray-500">
              You can request the bill once your items are served.
            </p>
          )}

          <Link
            href={menuUrl}
            className={cn(
              "flex w-full items-center justify-center",
              allServed ? DINER.secondaryCta : DINER.primaryCta,
              DINER.ctaPress,
            )}
          >
            + Add more items
          </Link>
        </FixedActionBar>

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
        <DinerIconBadge icon={ShoppingCart} tone="neutral" size="lg" />
        <h2 className={cn(DINER.operationalTitle, "mt-4")}>
          Your cart is empty
        </h2>
        <p className="text-sm text-gray-400 mt-2">
          Browse the menu and add items to get started.
        </p>
        <Link
          href={menuUrl}
          className={cn(
            "mt-6 px-6 flex items-center justify-center",
            DINER.primaryCta,
            DINER.ctaPress,
          )}
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
          <button
            type="button"
            onClick={() => clearCart()}
            className={cn(DINER.textDangerAction, DINER.pressable)}
          >
            Clear all
          </button>
        }
      />

      <div className="px-4 space-y-3 pb-44">
        <div className={DINER.listGap}>
          {items.map((item, index) => (
            <ItemCard
              key={item.cartId || `${item.menuItemId || "item"}-${index}`}
              variant="cart"
              item={item}
              onIncrement={() => updateQuantity(item.cartId, item.quantity + 1)}
              onDecrement={() => updateQuantity(item.cartId, item.quantity - 1)}
            />
          ))}
        </div>

        <div className={cn(DINER.fieldShell, "p-3")}>
          <textarea
            value={orderNote}
            onChange={(e) => setOrderNote(e.target.value)}
            placeholder="Add a note for the kitchen (optional)..."
            className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none resize-none"
            rows={2}
          />
        </div>

        <BillSummary
          subtotal={sub}
          vat={vat}
          vatRate={vatRate}
          vatEnabled={vatEnabled}
          total={total}
        />

        <FixedActionBar>
          <button
            type="button"
            onClick={handlePlaceOrder}
            className={cn("w-full", DINER.primaryCta, DINER.ctaPress)}
          >
            Place Order · ₦{Math.round(total).toLocaleString()}
          </button>

          <p className="text-center text-xs text-gray-400">
            You'll pay after your food is served
          </p>
        </FixedActionBar>
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
