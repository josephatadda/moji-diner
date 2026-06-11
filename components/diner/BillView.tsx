"use client";

import {
  ArrowRight,
  CheckCircle,
  DownloadSimple,
  Info,
  Receipt,
  Trophy,
  Users,
  WarningCircle,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { calculateBill, groupSessionItems } from "@/lib/diner-utils";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { BillSummary } from "./ui/BillSummary";
import { BottomSheet } from "./ui/BottomSheet";
import { DinerFeedbackCard } from "./ui/DinerFeedbackCard";
import { DinerIconBadge } from "./ui/DinerIconBadge";
import { DinerInfoRow } from "./ui/DinerInfoRow";
import { DinerPaymentPanel } from "./ui/DinerPaymentPanel";
import { DinerReceipt } from "./ui/DinerReceipt";
import { dinerToast } from "./ui/diner-toast";
import { DINER } from "./ui/diner-tokens";
import { downloadReceiptImage } from "./ui/download-receipt";
import { FixedActionBar } from "./ui/FixedActionBar";
import { ItemCard } from "./ui/ItemCard";
import { PageHeader } from "./ui/PageHeader";

interface BillViewProps {
  restaurantSlug: string;
  tableNumber: number;
  restaurantName: string;
  vatRate?: number;
  vatEnabled?: boolean;
  onSplitBill?: (splitTotal?: number) => void;
}

const TIP_OPTIONS = [
  { label: "No tip", value: 0 },
  { label: "5%", value: 5 },
  { label: "10%", value: 10 },
  { label: "Custom", value: -1 },
];

const STARTING_LOYALTY_POINTS = 1250;

function paymentMethodLabel(method: "bank" | "card" | "cash") {
  if (method === "bank") return "Bank transfer";
  if (method === "card") return "Card";
  return "Cash";
}

export function BillView({
  restaurantSlug,
  tableNumber,
  restaurantName,
  vatRate = 7.5,
  vatEnabled = false,
  onSplitBill,
}: BillViewProps) {
  const {
    sessionBatches,
    clearSession,
    loyaltyName,
    loyaltyPhone,
    setLoyaltyData,
  } = useCartStore();
  const [tipOption, setTipOption] = useState(0);
  const [customTip, setCustomTip] = useState("");
  const [paymentState, setPaymentState] = useState<
    "idle" | "method" | "success" | "failed"
  >("idle");
  const [completedMethod, setCompletedMethod] = useState<
    "bank" | "card" | "cash"
  >("bank");
  const [claimName, setClaimName] = useState("");
  const [claimPhone, setClaimPhone] = useState("");
  const [pointsClaimed, setPointsClaimed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [claimDrawerOpen, setClaimDrawerOpen] = useState(false);
  const [loyaltyDrawerOpen, setLoyaltyDrawerOpen] = useState(false);
  const [pointsModalOpen, setPointsModalOpen] = useState(false);

  useEffect(() => setMounted(true), []);
  const [appliedPoints, setAppliedPoints] = useState(0);
  const [receiptIssuedAt] = useState(() => new Date());
  const [receiptId] = useState(() => `MOJI-${Date.now().toString().slice(-6)}`);

  const displayItems = groupSessionItems(sessionBatches);
  const subtotal = displayItems.reduce(
    (sum, item) =>
      sum +
      (item.lineTotal ?? (item.itemPrice ?? 0) * (item.quantity ?? 1) ?? 0),
    0,
  );
  const tipPct = tipOption === -1 ? parseFloat(customTip) || 0 : tipOption;
  const {
    vat,
    tip,
    total: totalBeforeDiscount,
  } = calculateBill({
    subtotal,
    vatRate,
    vatEnabled,
    tipPct,
  });
  const loyaltyActive = Boolean(loyaltyPhone || pointsClaimed);
  const pointsEarned = Math.floor(subtotal / 100);
  const maxRedeemablePoints = loyaltyActive
    ? Math.min(STARTING_LOYALTY_POINTS, Math.floor(totalBeforeDiscount))
    : 0;
  const safeAppliedPoints = Math.min(appliedPoints, maxRedeemablePoints);
  const payableTotal = Math.max(totalBeforeDiscount - safeAppliedPoints, 0);
  const updatedPointsBalance =
    STARTING_LOYALTY_POINTS - safeAppliedPoints + pointsEarned;

  const menuUrl = `/${restaurantSlug}/t/${tableNumber}`;
  const cartUrl = `/${restaurantSlug}/t/${tableNumber}/cart`;
  const methodLabel = paymentMethodLabel(completedMethod);

  if (paymentState === "method") {
    return (
      <div>
        <PageHeader
          title="Payment Method"
          subtitle={`Total: ₦${Math.round(payableTotal).toLocaleString()}`}
          onBack={() => setPaymentState("idle")}
        />

        <div className="px-4 pb-8">
          <DinerPaymentPanel
            amount={payableTotal}
            onComplete={(method) => {
              setCompletedMethod(method);
              setPaymentState("success");
              dinerToast.success("Payment recorded");
            }}
          />
        </div>
      </div>
    );
  }

  if (paymentState === "success") {
    return (
      <div>
        <div className="space-y-5 px-4 pb-44 pt-8">
          <section className="flex flex-col items-center text-center">
            <DinerIconBadge icon={CheckCircle} tone="success" size="lg" />
            <h2 className={cn(DINER.displayTitleSmall, "mt-4")}>
              Payment successful
            </h2>
            <p className={cn(DINER.body, "mt-2 max-w-xs")}>
              Your payment of ₦{Math.round(payableTotal).toLocaleString()} has
              been recorded.
            </p>
          </section>

          {/* Points CTA — opens modal for details */}
          {loyaltyActive ? (
            <button
              type="button"
              onClick={() => setPointsModalOpen(true)}
              className={cn(
                DINER.card,
                "flex w-full items-center justify-between p-4 text-left hover:bg-gray-50",
                DINER.ctaPress,
              )}
            >
              <div className="flex items-center gap-3">
                <DinerIconBadge icon={Trophy} tone="warning" size="sm" />
                <div>
                  <p className={DINER.cardTitle}>
                    {loyaltyName
                      ? `Nice one, ${loyaltyName}!`
                      : "Points updated"}
                  </p>
                  <p className={cn(DINER.caption, "mt-0.5")}>
                    +{pointsEarned} earned ·{" "}
                    {updatedPointsBalance.toLocaleString()} pts balance
                  </p>
                </div>
              </div>
              <ArrowRight size={18} weight="bold" className="text-gray-400" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setClaimDrawerOpen(true)}
              className={cn(
                DINER.card,
                "flex w-full items-center justify-between p-4 text-left hover:bg-gray-50",
                DINER.ctaPress,
              )}
            >
              <div className="flex items-center gap-3">
                <DinerIconBadge icon={Trophy} tone="warning" size="sm" />
                <div>
                  <p className={DINER.cardTitle}>Claim your points</p>
                  <p className={DINER.caption}>
                    You earned{" "}
                    <span className="font-bold text-gray-900">
                      {pointsEarned} points
                    </span>{" "}
                    today.
                  </p>
                </div>
              </div>
              <ArrowRight size={18} weight="bold" className="text-gray-400" />
            </button>
          )}

          {/* Points details modal */}
          <BottomSheet
            open={pointsModalOpen}
            onClose={() => setPointsModalOpen(false)}
            accessibilityTitle="Points details"
            header={
              <div className="flex flex-col items-center text-center">
                <DinerIconBadge
                  icon={Trophy}
                  tone="warning"
                  size="md"
                  className="mb-4"
                />
                <h2 className={cn(DINER.sheetTitle, "mb-2")}>
                  {loyaltyName ? `${loyaltyName}'s Points` : "Your Points"}
                </h2>
              </div>
            }
            footer={
              <button
                type="button"
                onClick={() => setPointsModalOpen(false)}
                className={cn("w-full", DINER.primaryCta, DINER.ctaPress)}
              >
                Done
              </button>
            }
          >
            <div className={cn(DINER.summaryCard, "space-y-3")}>
              <DinerInfoRow
                label="Earned on this order"
                value={`+${pointsEarned} pts`}
              />
              {safeAppliedPoints > 0 && (
                <DinerInfoRow
                  label="Redeemed"
                  value={`-${safeAppliedPoints.toLocaleString()} pts`}
                />
              )}
              <DinerInfoRow
                label="New balance"
                value={`${updatedPointsBalance.toLocaleString()} pts`}
                emphasis
              />
              {loyaltyPhone && (
                <DinerInfoRow label="Saved to" value={loyaltyPhone} />
              )}
            </div>
          </BottomSheet>

          {/* Claim points drawer (for users without loyalty) */}
          <BottomSheet
            open={claimDrawerOpen}
            onClose={() => setClaimDrawerOpen(false)}
            accessibilityTitle="Save your points"
            header={
              <div className="flex flex-col items-center text-center">
                <DinerIconBadge
                  icon={Trophy}
                  tone="warning"
                  size="md"
                  className="mb-4"
                />
                <h2 className={cn(DINER.sheetTitle, "mb-2")}>
                  Save your points
                </h2>
                <p className={DINER.body}>
                  You earned {pointsEarned} points on this order. Enter your
                  details to save them.
                </p>
              </div>
            }
            footer={
              <button
                type="button"
                onClick={() => {
                  if (claimName && claimPhone) {
                    setLoyaltyData(claimName, claimPhone);
                    setPointsClaimed(true);
                    setClaimDrawerOpen(false);
                    dinerToast.success("Points saved");
                  }
                }}
                disabled={!claimName || !claimPhone}
                className={cn("w-full", DINER.primaryCta, DINER.ctaPress)}
              >
                Save my points
              </button>
            }
          >
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="claim-name"
                  className={cn(DINER.inputLabel, "mb-2 block text-left")}
                >
                  Your name
                </label>
                <input
                  id="claim-name"
                  type="text"
                  placeholder="e.g. Tunde"
                  value={claimName}
                  onChange={(event) => setClaimName(event.target.value)}
                  className={DINER.input}
                />
              </div>
              <div>
                <label
                  htmlFor="claim-phone"
                  className={cn(DINER.inputLabel, "mb-2 block text-left")}
                >
                  Your phone number
                </label>
                <input
                  id="claim-phone"
                  type="tel"
                  placeholder="0801 234 5678"
                  value={claimPhone}
                  onChange={(event) => setClaimPhone(event.target.value)}
                  className={DINER.input}
                />
              </div>
            </div>
          </BottomSheet>

          <DinerReceipt
            items={displayItems}
            subtotal={subtotal}
            vat={vat}
            vatRate={vatRate}
            vatEnabled={vatEnabled}
            tip={tip}
            discount={safeAppliedPoints}
            total={payableTotal}
            tableNumber={tableNumber}
            paymentMethod={methodLabel}
            restaurantName={restaurantName}
            receiptId={receiptId}
            issuedAt={receiptIssuedAt}
          />

          <FixedActionBar>
            <button
              type="button"
              onClick={() => {
                downloadReceiptImage({
                  restaurantName,
                  tableNumber,
                  receiptId,
                  issuedAt: receiptIssuedAt,
                  items: displayItems,
                  subtotal,
                  vat,
                  vatRate,
                  vatEnabled,
                  tip,
                  discount: safeAppliedPoints,
                  total: payableTotal,
                  paymentMethod: methodLabel,
                });
                dinerToast.success("Receipt downloaded");
              }}
              className={cn(
                "flex w-full items-center justify-center gap-2",
                DINER.outlineCta,
                DINER.ctaPress,
              )}
            >
              <DownloadSimple size={18} weight="bold" />
              Download receipt
            </button>

            <button
              type="button"
              onClick={() => {
                clearSession();
                window.location.href = menuUrl;
              }}
              className={cn("w-full", DINER.primaryCta, DINER.ctaPress)}
            >
              Close Session
            </button>
          </FixedActionBar>
        </div>
      </div>
    );
  }

  // Wait for hydration before showing empty state — prevents flash
  // when navigating from cart (Zustand localStorage loads on client)
  if (!mounted || sessionBatches.length === 0) {
    if (!mounted) return null;
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <DinerIconBadge icon={Receipt} tone="neutral" size="lg" />
        <h2 className={cn(DINER.operationalTitle, "mt-4")}>
          Your order is being prepared
        </h2>
        <p className={cn(DINER.body, "mt-2")}>
          You'll be able to view and pay your bill once your items are served.
        </p>
        <Link
          href={menuUrl}
          className={cn(
            "mt-6 flex items-center justify-center px-6",
            DINER.primaryCta,
            DINER.ctaPress,
          )}
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Your Bill" backHref={cartUrl} />

      <div className="space-y-4 px-4 pb-44">
        <div className={DINER.listGap}>
          {displayItems.map((item, index) => (
            <ItemCard
              key={item.cartId || `${item.menuItemId || "item"}-${index}`}
              variant="order"
              item={item}
            />
          ))}
        </div>

        <div className={cn(DINER.card, DINER.cardPadding)}>
          <p className={cn(DINER.sectionHeading, "mb-3")}>Add a tip?</p>
          <div className="grid grid-cols-4 gap-2">
            {TIP_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.label}
                onClick={() => setTipOption(option.value)}
                className={cn(
                  "flex h-11 items-center justify-center",
                  DINER.choicePill,
                  tipOption === option.value && DINER.choicePillActive,
                  DINER.pressable,
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          {tipOption === -1 && (
            <div className="relative mt-3">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                ₦
              </span>
              <input
                type="number"
                placeholder="Enter tip amount"
                value={customTip}
                onChange={(event) => setCustomTip(event.target.value)}
                className={cn(DINER.input, "pl-10")}
              />
            </div>
          )}
        </div>

        {loyaltyActive && (
          <>
            <button
              type="button"
              onClick={() => setLoyaltyDrawerOpen(true)}
              className={cn(
                DINER.card,
                "flex w-full items-center gap-3 p-4 text-left hover:bg-gray-50",
                DINER.pressable,
              )}
            >
              <DinerIconBadge icon={Trophy} tone="warning" size="sm" />
              <div className="min-w-0 flex-1">
                <p className={DINER.cardTitle}>
                  {safeAppliedPoints > 0
                    ? `${safeAppliedPoints.toLocaleString()} points applied`
                    : "Moji points available"}
                </p>
                <p className={cn(DINER.caption, "mt-0.5")}>
                  {STARTING_LOYALTY_POINTS.toLocaleString()} pts available ·{" "}
                  {pointsEarned.toLocaleString()} pts earned
                </p>
              </div>
              <span
                className={cn(
                  "flex-none rounded-full px-3 py-1.5 text-xs font-bold",
                  safeAppliedPoints > 0
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-700",
                )}
              >
                {safeAppliedPoints > 0
                  ? `-₦${safeAppliedPoints.toLocaleString()}`
                  : "View"}
              </span>
            </button>

            <BottomSheet
              open={loyaltyDrawerOpen}
              onClose={() => setLoyaltyDrawerOpen(false)}
              accessibilityTitle="Moji points"
              header={
                <div className="flex flex-col items-center text-center">
                  <DinerIconBadge
                    icon={Trophy}
                    tone="warning"
                    size="md"
                    className="mb-4"
                  />
                  <h2 className={cn(DINER.sheetTitle, "mb-2")}>Moji points</h2>
                  <p className={DINER.body}>
                    {loyaltyName
                      ? `${loyaltyName}, you can use points on this bill.`
                      : "You can use points on this bill."}
                  </p>
                </div>
              }
              footer={
                safeAppliedPoints > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedPoints(0);
                      setLoyaltyDrawerOpen(false);
                      dinerToast.success("Points removed");
                    }}
                    className={cn("w-full", DINER.secondaryCta, DINER.ctaPress)}
                  >
                    Remove points
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={maxRedeemablePoints <= 0}
                    onClick={() => {
                      setAppliedPoints(maxRedeemablePoints);
                      setLoyaltyDrawerOpen(false);
                      dinerToast.success("Points applied");
                    }}
                    className={cn("w-full", DINER.primaryCta, DINER.ctaPress)}
                  >
                    Apply ₦{maxRedeemablePoints.toLocaleString()} discount
                  </button>
                )
              }
            >
              <div className="space-y-4">
                <div className={cn(DINER.summaryCard, "space-y-3")}>
                  {loyaltyPhone && (
                    <DinerInfoRow label="Saved to" value={loyaltyPhone} />
                  )}
                  <DinerInfoRow
                    label="Available"
                    value={`${STARTING_LOYALTY_POINTS.toLocaleString()} pts`}
                    emphasis
                  />
                  <DinerInfoRow
                    label="Earn on this bill"
                    value={`${pointsEarned.toLocaleString()} pts`}
                  />
                  <DinerInfoRow label="Redemption" value="1 point = ₦1" />
                  {safeAppliedPoints > 0 && (
                    <DinerInfoRow
                      label="Applied now"
                      value={`-₦${safeAppliedPoints.toLocaleString()}`}
                      emphasis
                    />
                  )}
                </div>
                <div className="flex gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5 text-blue-800">
                  <Info
                    size={16}
                    weight="fill"
                    className="mt-0.5 flex-none text-blue-600"
                  />
                  <p className="text-xs leading-relaxed">
                    Points are mocked locally for this demo. Your receipt and
                    payment total will reflect any discount you apply.
                  </p>
                </div>
              </div>
            </BottomSheet>
          </>
        )}

        <BillSummary
          subtotal={subtotal}
          vat={vat}
          vatRate={vatRate}
          vatEnabled={vatEnabled}
          tip={tip}
          discount={safeAppliedPoints}
          total={payableTotal}
        />

        {paymentState === "failed" && (
          <DinerFeedbackCard
            title="Payment didn't go through"
            description="Please try again."
            icon={WarningCircle}
            tone="danger"
          />
        )}

        <FixedActionBar>
          <button
            type="button"
            onClick={() => setPaymentState("method")}
            className={cn("w-full", DINER.primaryCta, DINER.ctaPress)}
          >
            Pay Now · ₦{Math.round(payableTotal).toLocaleString()}
          </button>
          <button
            type="button"
            onClick={() => onSplitBill?.(payableTotal)}
            className={cn(
              "flex w-full items-center justify-center gap-2",
              DINER.outlineCta,
              DINER.ctaPress,
            )}
          >
            <Users size={18} />
            Split Bill
          </button>
        </FixedActionBar>
      </div>
    </div>
  );
}
