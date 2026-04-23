"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { ArrowLeft, Receipt, Users, Copy, CheckCircle, Check, CreditCard, Money, Trophy, ArrowRight } from "@phosphor-icons/react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
  const [failCount, setFailCount] = useState(0);
  const [claimName, setClaimName] = useState("");
  const [claimPhone, setClaimPhone] = useState("");
  const [pointsClaimed, setPointsClaimed] = useState(false);
  const [claimDrawerOpen, setClaimDrawerOpen] = useState(false);

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
  const sub = displayItems.reduce((sum, i) => sum + i.lineTotal, 0);
  const vat = vatEnabled ? sub * (vatRate / 100) : 0;
  const tipPct = tipOption === -1 ? (parseFloat(customTip) || 0) : tipOption;
  const tip = Math.round(sub * (tipPct / 100));
  const total = sub + vat + tip;

  const handlePay = () => {
    setPaymentState("method");
  };

  if (paymentState === "method") {
    return (
      <div className="px-4 py-4 space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setPaymentState("idle")} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft size={18} weight="bold" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
            <p className="text-xs text-gray-400">Total: ₦{total.toLocaleString()}</p>
          </div>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {(["bank", "card", "cash"] as const).map(method => (
            <button
              key={method}
              onClick={() => setSelectedMethod(method)}
              className={cn(
                "flex-1 h-10 text-sm font-bold rounded-lg transition-colors capitalize",
                selectedMethod === method ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              {method === "bank" ? "Transfer" : method}
            </button>
          ))}
        </div>

        <div>
          {selectedMethod === "bank" && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-1">Bank Transfer</h3>
              <p className="text-xs text-gray-500 mb-4">Transfer to the restaurant's account</p>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Bank Name</span>
                  <span className="font-semibold text-gray-900">GTBank</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Account Name</span>
                  <span className="font-semibold text-gray-900">Moji Restaurant</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Account No.</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 tracking-wider">0123456789</span>
                    <button
                      onClick={() => { navigator.clipboard.writeText("0123456789"); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                      className="p-1.5 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      {copied ? <CheckCircle size={14} weight="bold" className="text-green-600" /> : <Copy size={14} weight="bold" className="text-gray-700" />}
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setPaymentState("success")}
                className="w-full h-12 bg-gray-900 text-white rounded-xl text-base font-bold active:scale-[0.98] transition-transform"
              >
                I have transferred ₦{total.toLocaleString()}
              </button>
            </div>
          )}

          {selectedMethod === "card" && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm text-center py-8">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                <CreditCard size={32} weight="fill" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Pay with Card</h3>
              <p className="text-sm text-gray-500 mb-8 max-w-[200px] mx-auto">A waiter will bring the POS terminal to your table.</p>
              <button
                onClick={() => setPaymentState("success")}
                className="w-full h-12 bg-gray-900 text-white rounded-xl text-base font-bold active:scale-[0.98] transition-transform"
              >
                Mark as paid
              </button>
            </div>
          )}

          {selectedMethod === "cash" && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm text-center py-8">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                <Money size={32} weight="fill" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Pay with Cash</h3>
              <p className="text-sm text-gray-500 mb-8 max-w-[200px] mx-auto">A waiter will come to your table to collect your cash payment.</p>
              <button
                onClick={() => setPaymentState("success")}
                className="w-full h-12 bg-gray-900 text-white rounded-xl text-base font-bold active:scale-[0.98] transition-transform"
              >
                Mark as paid
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (paymentState === "success") {
    const pointsEarned = Math.floor(sub / 100);
    const mockBalance = 1250 + pointsEarned;

    const handleClaimPoints = () => {
      if (claimName && claimPhone) {
        setLoyaltyData(claimName, claimPhone);
        setPointsClaimed(true);
      }
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center py-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600 text-4xl shadow-sm">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>

        {loyaltyPhone && (
          <p className="text-gray-500 mt-2 text-sm max-w-xs">
            A WhatsApp receipt will be sent to <span className="font-medium text-gray-700">{loyaltyPhone}</span>.
          </p>
        )}

        {/* Loyalty Points Display */}
        {loyaltyPhone || pointsClaimed ? (
          <div className="mt-6 w-full max-w-xs p-4 bg-orange-50 border border-orange-100 rounded-2xl text-left">
            <h3 className="font-bold text-orange-800 flex items-center gap-2 text-sm">
              <span className="text-lg">🏆</span>
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
              className="mt-6 w-full max-w-xs p-4 bg-white border border-gray-200 shadow-sm rounded-2xl text-left hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-between group"
            >
              <div>
                <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm mb-1">
                  <span className="text-lg">🎁</span> Claim your points
                </h3>
                <p className="text-xs text-gray-500">You earned <span className="font-bold text-gray-900">{pointsEarned} points</span> today.</p>
              </div>
              <ArrowRight size={20} weight="bold" className="text-gray-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <Drawer open={claimDrawerOpen} onOpenChange={setClaimDrawerOpen}>
              <DrawerContent>
                <DrawerHeader className="px-5 pt-8 pb-6 flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-orange-600">
                    <span className="text-2xl"><Trophy /></span>
                  </div>
                  <DrawerTitle className="text-2xl font-bold text-gray-900 mb-2">
                    Save your points
                  </DrawerTitle>
                  <DrawerDescription className="text-sm text-gray-500 leading-relaxed">
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
                        onChange={e => setClaimName(e.target.value)}
                        className="w-full px-4 h-12 border border-gray-200 rounded-xl text-base focus:border-gray-400 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 text-left">Your phone number</label>
                      <input
                        type="tel"
                        placeholder="0801 234 5678"
                        value={claimPhone}
                        onChange={e => setClaimPhone(e.target.value)}
                        className="w-full px-4 h-12 border border-gray-200 rounded-xl text-base focus:border-gray-400 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleClaimPoints();
                      setClaimDrawerOpen(false);
                    }}
                    disabled={!claimName || !claimPhone}
                    className="w-full h-12 bg-gray-900 text-white font-bold text-base rounded-xl active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    Save my points
                  </button>
                </div>
              </DrawerContent>
            </Drawer>
          </>
        )}

        <div className="mt-8 w-full max-w-xs text-left">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Your Receipt</p>
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
            <div className="space-y-3 mb-4">
              {displayItems.map((item) => (
                <div key={item.cartId} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.quantity}× {item.itemName}</span>
                  <span className="font-medium text-gray-900">₦{item.lineTotal.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-gray-300 my-4" />

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>₦{sub.toLocaleString()}</span>
              </div>
              {vatEnabled && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>VAT ({vatRate}%)</span>
                  <span>₦{Math.round(vat).toLocaleString()}</span>
                </div>
              )}
              {tip > 0 && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Tip</span>
                  <span>₦{tip.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 my-4" />

            <div className="flex justify-between items-center font-black text-gray-900 text-lg">
              <span>Total Paid</span>
              <span>₦{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            clearSession();
            window.location.href = `/${restaurantSlug}/t/${tableNumber}`;
          }}
          className="mt-6 mb-4 w-full max-w-xs h-12 bg-gray-900 text-white rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform"
        >
          Close Session
        </button>
      </div>
    );
  }

  if (sessionBatches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="text-5xl mb-4 text-gray-300">
          <Receipt />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Your order is being prepared</h2>
        <p className="text-gray-500 mt-2 text-sm">You'll be able to view and pay your bill once your items are served.</p>
        <Link
          href={`/${restaurantSlug}/t/${tableNumber}`}
          className="mt-6 bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-bold shadow-sm active:scale-95 transition-transform"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Your Bill</h2>

      {/* Itemized list */}
      <div className="bg-gray-50 rounded-xl divide-y divide-gray-200">
        {displayItems.map((item) => (
          <div key={item.cartId} className="flex justify-between items-center px-4 py-3 text-sm">
            <div>
              <p className="font-semibold text-gray-900">{item.quantity}× {item.itemName}</p>
              {Object.values(item.selectedModifiers).flat().length > 0 && (
                <p className="text-xs text-gray-400">{Object.values(item.selectedModifiers).flat().map((o) => o.name).join(", ")}</p>
              )}
            </div>
            <span className="font-semibold text-gray-900">₦{item.lineTotal.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* Tip selector */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Add a tip?</p>
        <div className="grid grid-cols-4 gap-2">
          {TIP_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => setTipOption(opt.value)}
              className={cn(
                "py-2 rounded-xl text-sm font-semibold border transition-colors",
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
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₦</span>
            <input
              type="number"
              placeholder="Enter tip amount"
              value={customTip}
              onChange={(e) => setCustomTip(e.target.value)}
              className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Subtotal</span>
          <span>₦{sub.toLocaleString()}</span>
        </div>
        {vatEnabled && (
          <div className="flex justify-between text-sm text-gray-500">
            <span>VAT ({vatRate}%)</span>
            <span>₦{Math.round(vat).toLocaleString()}</span>
          </div>
        )}
        {tip > 0 && (
          <div className="flex justify-between text-sm text-gray-500">
            <span>Tip</span>
            <span>₦{tip.toLocaleString()}</span>
          </div>
        )}
        <div className="h-px bg-gray-200 my-1" />
        <div className="flex justify-between font-bold text-gray-900 text-base">
          <span>Total</span>
          <span>₦{total.toLocaleString()}</span>
        </div>
      </div>

      {/* Failed state */}
      {paymentState === "failed" && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
          Payment didn't go through. Please try again.
          {failCount >= 3 && (
            <p className="mt-1 font-semibold">You can also pay at the counter.</p>
          )}
        </div>
      )}

      {/* CTA buttons */}
      <div className="space-y-2">
        <button
          onClick={handlePay}
          className="w-full h-12 rounded-2xl bg-gray-900 text-white font-bold text-base hover:bg-gray-700 active:scale-[0.98] transition-all"
        >
          Pay Now · ₦{total.toLocaleString()}
        </button>

        <button
          onClick={onSplitBill}
          className="w-full py-3 rounded-2xl border border-gray-200 text-gray-700 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
        >
          <Users size={18} />
          Split Bill
        </button>
      </div>
    </div>
  );
}
