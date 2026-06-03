"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { Users, Copy, CheckCircle, CreditCard, Money, Trophy, ArrowRight, Receipt } from "@phosphor-icons/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PageHeader } from "./ui/PageHeader";
import { BillSummary } from "./ui/BillSummary";
import { ItemCard } from "./ui/ItemCard";
import { SegmentedTabs } from "./ui/SegmentedTabs";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { DINER } from "./ui/diner-tokens";
import { groupSessionItems, calculateBill } from "@/lib/diner-utils";

interface BillViewProps {
  restaurantSlug: string;
  tableNumber: number;
  vatRate?: number;
  vatEnabled?: boolean;
  onSplitBill?: () => void;
}

const TIP_OPTIONS = [
  { label: "No tip", value: 0 },
  { label: "5%", value: 5 },
  { label: "10%", value: 10 },
  { label: "Custom", value: -1 },
];

export function BillView({
  restaurantSlug,
  tableNumber,
  vatRate = 7.5,
  vatEnabled = false,
  onSplitBill,
}: BillViewProps) {
  const { sessionBatches, clearSession, loyaltyName, loyaltyPhone, setLoyaltyData } = useCartStore();
  const [tipOption, setTipOption] = useState(0);
  const [customTip, setCustomTip] = useState("");
  const [paymentState, setPaymentState] = useState<"idle" | "method" | "success" | "failed">("idle");
  const [selectedMethod, setSelectedMethod] = useState<"bank" | "card" | "cash">("bank");
  const [copied, setCopied] = useState(false);
  const [claimName, setClaimName] = useState("");
  const [claimPhone, setClaimPhone] = useState("");
  const [pointsClaimed, setPointsClaimed] = useState(false);
  const [claimDrawerOpen, setClaimDrawerOpen] = useState(false);

  const displayItems = groupSessionItems(sessionBatches);
  const sub = displayItems.reduce((sum, i) => sum + i.lineTotal, 0);
  const tipPct = tipOption === -1 ? (parseFloat(customTip) || 0) : tipOption;
  const { vat, tip, total } = calculateBill({ subtotal: sub, vatRate, vatEnabled, tipPct });

  const menuUrl = `/${restaurantSlug}/t/${tableNumber}`;
  const cartUrl = `/${restaurantSlug}/t/${tableNumber}/cart`;

  // Payment method screen
  if (paymentState === "method") {
    return (
      <div>
        <PageHeader
          title="Payment Method"
          subtitle={`Total: ₦${Math.round(total).toLocaleString()}`}
          onBack={() => setPaymentState("idle")}
        />

        <div className="px-4 space-y-5 pb-8">
          <SegmentedTabs
            options={[
              { value: "bank", label: "Transfer" },
              { value: "card", label: "Card" },
              { value: "cash", label: "Cash" },
            ]}
            value={selectedMethod}
            onChange={setSelectedMethod}
          />

          {selectedMethod === "bank" && (
            <div className={cn(DINER.card, "p-5")}>
              <h3 className="font-bold text-gray-900 mb-1">Bank Transfer</h3>
              <p className={cn(DINER.caption, "mb-4")}>Transfer to the restaurant's account</p>
              <div className={cn(DINER.summaryCard, "space-y-3 mb-6")}>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Bank Name</span>
                  <span className="font-semibold text-gray-900">GTBank</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Account Name</span>
                  <span className="font-semibold text-gray-900">Moji Restaurant</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Account No.</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 tracking-wider">0123456789</span>
                    <button
                      onClick={() => { navigator.clipboard.writeText("0123456789"); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                      className="p-1.5 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      {copied ? <CheckCircle size={14} weight="bold" className="text-green-600" /> : <Copy size={14} weight="bold" className="text-gray-700" />}
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setPaymentState("success")}
                className={cn("w-full h-12 bg-gray-900 text-white rounded-2xl text-base font-bold", DINER.ctaPress)}
              >
                I have transferred ₦{Math.round(total).toLocaleString()}
              </button>
            </div>
          )}

          {selectedMethod === "card" && (
            <div className={cn(DINER.card, "p-5 text-center py-8")}>
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                <CreditCard size={32} weight="fill" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Pay with Card</h3>
              <p className={cn(DINER.body, "mb-8 max-w-[200px] mx-auto")}>A waiter will bring the POS terminal to your table.</p>
              <button onClick={() => setPaymentState("success")} className={cn("w-full h-12 bg-gray-900 text-white rounded-2xl text-base font-bold", DINER.ctaPress)}>
                Mark as paid
              </button>
            </div>
          )}

          {selectedMethod === "cash" && (
            <div className={cn(DINER.card, "p-5 text-center py-8")}>
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                <Money size={32} weight="fill" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Pay with Cash</h3>
              <p className={cn(DINER.body, "mb-8 max-w-[200px] mx-auto")}>A waiter will come to your table to collect your cash payment.</p>
              <button onClick={() => setPaymentState("success")} className={cn("w-full h-12 bg-gray-900 text-white rounded-2xl text-base font-bold", DINER.ctaPress)}>
                Mark as paid
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Success screen
  if (paymentState === "success") {
    const pointsEarned = Math.floor(sub / 100);
    const mockBalance = 1250 + pointsEarned;

    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center py-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
          <CheckCircle size={40} weight="fill" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>

        {loyaltyPhone && (
          <p className={cn(DINER.body, "mt-2 max-w-xs")}>
            A WhatsApp receipt will be sent to <span className="font-medium text-gray-700">{loyaltyPhone}</span>.
          </p>
        )}

        {loyaltyPhone || pointsClaimed ? (
          <div className="mt-6 w-full max-w-xs p-4 bg-orange-50 border border-orange-100 rounded-2xl text-left">
            <h3 className="font-bold text-orange-800 flex items-center gap-2 text-sm">
              <Trophy size={18} weight="fill" />
              {loyaltyName ? `Nice one, ${loyaltyName}!` : "Points Earned!"}
            </h3>
            <p className="text-xs text-orange-700 mt-1">You earned <span className="font-bold">{pointsEarned} points</span> on this order.</p>
            <div className="mt-3 pt-3 border-t border-orange-200/60 flex justify-between items-center text-sm">
              <span className="text-orange-800 font-medium">New Balance:</span>
              <span className="font-bold text-orange-900">{mockBalance.toLocaleString()} pts</span>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={() => setClaimDrawerOpen(true)}
              className={cn(DINER.card, "mt-6 w-full max-w-xs p-4 text-left hover:bg-gray-50 flex items-center justify-between group", DINER.ctaPress)}
            >
              <div>
                <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm mb-1">
                  <span className="text-lg">🎁</span> Claim your points
                </h3>
                <p className={DINER.caption}>You earned <span className="font-bold text-gray-900">{pointsEarned} points</span> today.</p>
              </div>
              <ArrowRight size={20} weight="bold" className="text-gray-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <Drawer open={claimDrawerOpen} onOpenChange={setClaimDrawerOpen}>
              <DrawerContent>
                <DrawerHeader className="px-5 pt-8 pb-6 flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-orange-600">
                    <Trophy size={24} />
                  </div>
                  <DrawerTitle className="text-2xl font-bold text-gray-900 mb-2">
                    Save your points
                  </DrawerTitle>
                  <DrawerDescription className={DINER.body}>
                    You earned {pointsEarned} points on this order. Enter your details to save them.
                  </DrawerDescription>
                </DrawerHeader>

                <div className="px-5 pb-8 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 text-left">Your name</label>
                      <input
                        type="text"
                        placeholder="e.g. Tunde"
                        value={claimName}
                        onChange={(e) => setClaimName(e.target.value)}
                        className="w-full px-4 h-12 border border-gray-200 rounded-xl text-base focus:border-gray-400 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 text-left">Your phone number</label>
                      <input
                        type="tel"
                        placeholder="0801 234 5678"
                        value={claimPhone}
                        onChange={(e) => setClaimPhone(e.target.value)}
                        className="w-full px-4 h-12 border border-gray-200 rounded-xl text-base focus:border-gray-400 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (claimName && claimPhone) {
                        setLoyaltyData(claimName, claimPhone);
                        setPointsClaimed(true);
                        setClaimDrawerOpen(false);
                      }
                    }}
                    disabled={!claimName || !claimPhone}
                    className={cn("w-full h-12 bg-gray-900 text-white font-bold text-base rounded-2xl disabled:opacity-50", DINER.ctaPress)}
                  >
                    Save my points
                  </button>
                </div>
              </DrawerContent>
            </Drawer>
          </>
        )}

        {/* Receipt */}
        <div className="mt-8 w-full max-w-xs text-left">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Your Receipt</p>
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
            {displayItems.map((item) => (
              <div key={item.cartId} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.quantity}× {item.itemName}</span>
                <span className="font-medium text-gray-900">₦{item.lineTotal.toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t border-dashed border-gray-300 pt-3 space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Subtotal</span>
                <span>₦{sub.toLocaleString()}</span>
              </div>
              {vatEnabled && vat > 0 && (
                <div className="flex justify-between text-sm text-gray-400">
                  <span>VAT ({vatRate}%)</span>
                  <span>₦{Math.round(vat).toLocaleString()}</span>
                </div>
              )}
              {tip > 0 && (
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Tip</span>
                  <span>₦{tip.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between font-black text-gray-900 text-base">
                <span>Total Paid</span>
                <span>₦{Math.round(total).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => { clearSession(); window.location.href = menuUrl; }}
          className={cn("mt-6 mb-4 w-full max-w-xs h-12 bg-gray-900 text-white rounded-2xl font-bold text-sm", DINER.ctaPress)}
        >
          Close Session
        </button>
      </div>
    );
  }

  // Empty state
  if (sessionBatches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <Receipt size={48} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Your order is being prepared</h2>
        <p className={cn(DINER.body, "mt-2")}>You'll be able to view and pay your bill once your items are served.</p>
        <Link
          href={menuUrl}
          className={cn("mt-6 bg-gray-900 text-white px-6 h-12 rounded-2xl text-sm font-bold flex items-center justify-center", DINER.ctaPress)}
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  // Bill idle state
  return (
    <div>
      <PageHeader title="Your Bill" backHref={cartUrl} />

      <div className="px-4 space-y-4 pb-8">
        {/* Itemized list */}
        <div className="bg-gray-50 rounded-2xl divide-y divide-gray-100">
          {displayItems.map((item) => (
            <ItemCard key={item.cartId} variant="order" item={item} />
          ))}
        </div>

        {/* Tip selector */}
        <div className={cn(DINER.card, DINER.cardPadding)}>
          <p className={cn(DINER.sectionHeading, "mb-3")}>Add a tip?</p>
          <div className="grid grid-cols-4 gap-2">
            {TIP_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => setTipOption(opt.value)}
                className={cn(
                  "py-2.5 rounded-xl text-sm font-semibold border transition-colors",
                  tipOption === opt.value
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {tipOption === -1 && (
            <div className="mt-3 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">₦</span>
              <input
                type="number"
                placeholder="Enter tip amount"
                value={customTip}
                onChange={(e) => setCustomTip(e.target.value)}
                className="w-full pl-10 pr-4 h-12 text-sm border border-gray-200 rounded-2xl focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>
          )}
        </div>

        <BillSummary subtotal={sub} vat={vat} vatRate={vatRate} vatEnabled={vatEnabled} tip={tip} total={total} />

        {paymentState === "failed" && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
            Payment didn't go through. Please try again.
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={() => setPaymentState("method")}
            className={cn("w-full h-12 rounded-2xl bg-gray-900 text-white font-bold text-base hover:bg-gray-700", DINER.ctaPress)}
          >
            Pay Now · ₦{Math.round(total).toLocaleString()}
          </button>
          <button
            onClick={onSplitBill}
            className="w-full h-12 rounded-2xl border border-gray-200 text-gray-700 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <Users size={18} />
            Split Bill
          </button>
        </div>
      </div>
    </div>
  );
}
