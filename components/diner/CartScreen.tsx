"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { PhoneCaptureModal } from "./PhoneCaptureModal";
import { ItemCard } from "./ui/ItemCard";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { ModalContainer } from "./ui/ModalContainer";
import { StatusTimeline } from "./ui/StatusTimeline";
import { cn } from "@/lib/utils";
import { ShoppingCart, ArrowLeft, Clock, CheckCircle } from "@phosphor-icons/react";

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
    setLoyaltyData 
  } = useCartStore();
  
  const [phoneCaptureOpen, setPhoneCaptureOpen] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

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

  const activeBatch = sessionBatches.find(b => b.id === selectedBatchId);
  const allServed = sessionBatches.length > 0 && sessionBatches.every(b => b.status === "served");

  // ORDERS VIEW (When cart is empty but active session exists)
  if (items.length === 0 && sessionBatches.length > 0) {
    const totalSession = sessionBatches.reduce((sum, b) => sum + b.items.reduce((s, i) => s + i.lineTotal, 0), 0);
    const vatSession = vatEnabled ? totalSession * (vatRate / 100) : 0;
    const finalSession = totalSession + vatSession;

    return (
      <div className="bg-[var(--color-background)] min-h-screen">
        {/* Header */}
        <div className="px-[var(--space-4)] pt-[var(--space-8)] pb-[var(--space-4)] text-center">
          <div className="w-16 h-16 bg-[var(--color-success)]/10 text-[var(--color-success)] rounded-full flex items-center justify-center mx-auto mb-[var(--space-4)] text-[var(--color-success)]">
            <CheckCircle size={32} weight="fill" />
          </div>
          <h1 className="text-[var(--font-size-title)] font-bold text-[var(--color-primary)]">Your Orders</h1>
          <p className="text-[var(--font-size-muted)] text-[var(--color-muted)] mt-1">Live session tab · Table {tableNumber}</p>
        </div>

        {/* Active Orders List */}
        <div className="px-[var(--space-4)] space-y-[var(--space-4)] mt-[var(--space-4)]">
          {sessionBatches.map((batch) => {
            const batchTotal = batch.items.reduce((sum, i) => sum + i.lineTotal, 0);
            return (
              <div key={batch.id} className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden shadow-sm">
                <div 
                  className="px-[var(--space-4)] py-[var(--space-3)] bg-[var(--color-surface)] border-b border-[var(--color-border)] flex justify-between items-center cursor-pointer active:opacity-70 transition-opacity"
                  onClick={() => setSelectedBatchId(batch.id)}
                >
                  <div>
                    <p className="text-[var(--font-size-label)] font-bold text-[var(--color-muted)] uppercase tracking-wider">
                      Order {new Date(batch.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[var(--font-size-muted)] text-[var(--color-muted-fg)] mt-0.5">
                      {batch.items.reduce((sum, i) => sum + i.quantity, 0)} items · ₦{batchTotal.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-[var(--space-2)] bg-[var(--color-background)] px-[var(--space-2)] py-1 rounded-full border border-[var(--color-border)]">
                    <div className={cn("w-1.5 h-1.5 rounded-full", batch.status === "preparing" ? "bg-[var(--color-warning)] animate-pulse" : "bg-[var(--color-success)]")} />
                    <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-wider">{batch.status}</span>
                  </div>
                </div>
                <div className="divide-y divide-[var(--color-border)]">
                  {batch.items.map((item, idx) => (
                    <ItemCard
                      key={item.cartId + idx}
                      variant="order"
                      name={item.itemName}
                      quantity={item.quantity}
                      price={item.lineTotal}
                      modifiers={Object.values(item.selectedModifiers).flat().map(o => o.name)}
                      note={item.specialNote}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Session Summary */}
        <div className="px-[var(--space-4)] mt-[var(--space-8)] mb-[var(--space-12)]">
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-[var(--space-4)] space-y-[var(--space-2)]">
            <div className="flex justify-between text-[var(--font-size-body)] text-[var(--color-muted)]">
              <span>Subtotal</span>
              <span>₦{totalSession.toLocaleString()}</span>
            </div>
            {vatEnabled && (
              <div className="flex justify-between text-[var(--font-size-body)] text-[var(--color-muted)]">
                <span>VAT ({vatRate}%)</span>
                <span>₦{vatSession.toLocaleString()}</span>
              </div>
            )}
            <div className="h-px bg-[var(--color-border)] my-[var(--space-2)]" />
            <div className="flex justify-between text-[var(--font-size-heading)] font-bold text-[var(--color-primary)]">
              <span>Total Bill</span>
              <span>₦{finalSession.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-[var(--space-6)] space-y-[var(--space-3)]">
            <Link href={`/${restaurantSlug}/t/${tableNumber}`} className="block w-full">
              <Button variant="outline" fullWidth>+ Add more items</Button>
            </Link>
            <Button 
              fullWidth 
              disabled={!allServed}
              onClick={() => {
                if (allServed) window.location.href = `/${restaurantSlug}/t/${tableNumber}/bill`;
              }}
            >
              {allServed ? "Request bill" : "Food still being prepared"}
            </Button>
            
            {/* Demo Helper */}
            {!allServed && (
              <Button variant="ghost" size="sm" fullWidth onClick={serveAllBatches} className="text-[var(--color-warning)]">
                [Demo] Mark all as served
              </Button>
            )}
          </div>
        </div>

        {/* Timeline Modal */}
        <ModalContainer
          type="sheet"
          isOpen={!!selectedBatchId}
          onDismiss={() => setSelectedBatchId(null)}
          title="Order Status"
          subtitle={activeBatch ? `Order placed at ${new Date(activeBatch.timestamp).toLocaleTimeString()}` : ""}
        >
          {activeBatch && (
            <StatusTimeline 
              steps={[
                { label: "Order placed", timestamp: new Date(activeBatch.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), state: "completed" },
                { label: "Being prepared", timestamp: "Kitchen is working", state: activeBatch.status === "preparing" ? "active" : "completed" },
                { label: "Ready", timestamp: "Ready for pickup", state: activeBatch.status === "ready" ? "active" : activeBatch.status === "served" ? "completed" : "pending" },
                { label: "Served", timestamp: "Delivered to table", state: activeBatch.status === "served" ? "completed" : "pending" },
              ]}
            />
          )}
        </ModalContainer>
      </div>
    );
  }

  // EMPTY CART VIEW
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-[var(--space-6)] text-center">
        <div className="w-20 h-20 bg-[var(--color-surface)] rounded-full flex items-center justify-center mb-[var(--space-4)] text-[var(--color-muted-fg)]">
          <ShoppingCart size={40} />
        </div>
        <h2 className="text-[var(--font-size-heading)] font-bold text-[var(--color-primary)]">Your cart is empty</h2>
        <p className="text-[var(--font-size-body)] text-[var(--color-muted)] mt-2">Browse the menu and add items to get started.</p>
        <div className="mt-[var(--space-8)] w-full max-w-xs">
          <Link href={`/${restaurantSlug}/t/${tableNumber}`} className="block w-full">
            <Button fullWidth>Browse Menu</Button>
          </Link>
        </div>
      </div>
    );
  }

  // CART VIEW
  return (
    <div className="bg-[var(--color-background)] min-h-screen">
      {/* Header */}
      <div className="px-[var(--space-4)] py-[var(--space-4)] flex items-center justify-between border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <Link href={`/${restaurantSlug}/t/${tableNumber}`}>
            <Button variant="icon" size="icon-sm" className="bg-[var(--color-surface)]"><ArrowLeft size={16} weight="bold" /></Button>
          </Link>
          <h1 className="text-[var(--font-size-heading)] font-bold text-[var(--color-primary)]">Your Order</h1>
        </div>
        <button onClick={clearCart} className="text-[var(--font-size-label)] font-semibold text-[var(--color-error)]">Clear all</button>
      </div>

      <div className="px-[var(--space-4)] py-[var(--space-4)] space-y-[var(--space-6)]">
        {/* Cart Items */}
        <div className="space-y-[var(--space-3)]">
          {items.map((item) => (
            <ItemCard
              key={item.cartId}
              variant="cart"
              name={item.itemName}
              quantity={item.quantity}
              price={item.lineTotal}
              modifiers={Object.values(item.selectedModifiers).flat().map(o => o.name)}
              note={item.specialNote}
              onUpdateQuantity={(q) => updateQuantity(item.cartId, q)}
            />
          ))}
        </div>

        {/* Kitchen Note */}
        <Input 
          type="textarea"
          label="Kitchen Note"
          placeholder="e.g. No onions, extra spicy..."
          value={orderNote}
          onChange={(e) => setOrderNote(e.target.value)}
        />

        {/* Bill Summary */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-[var(--space-4)] space-y-[var(--space-2)]">
          <div className="flex justify-between text-[var(--font-size-body)] text-[var(--color-muted)]">
            <span>Subtotal</span>
            <span>₦{sub.toLocaleString()}</span>
          </div>
          {vatEnabled && (
            <div className="flex justify-between text-[var(--font-size-body)] text-[var(--color-muted)]">
              <span>VAT ({vatRate}%)</span>
              <span>₦{vat.toLocaleString()}</span>
            </div>
          )}
          <div className="h-px bg-[var(--color-border)] my-[var(--space-2)]" />
          <div className="flex justify-between text-[var(--font-size-heading)] font-bold text-[var(--color-primary)]">
            <span>Total</span>
            <span>₦{total.toLocaleString()}</span>
          </div>
        </div>

        {/* Footer info & CTA */}
        <div className="pt-[var(--space-2)] space-y-[var(--space-4)]">
          <Button fullWidth size="lg" onClick={handlePlaceOrder}>
            Place Order · ₦{total.toLocaleString()}
          </Button>
          <p className="text-center text-[var(--font-size-muted)] text-[var(--color-muted)]">
            You'll pay after your food is served
          </p>
        </div>
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
    </div>
  );
}
