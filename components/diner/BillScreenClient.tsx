"use client";

import { useState } from "react";
import { calculateBill } from "@/lib/diner-utils";
import { useCartStore } from "@/store/cart";
import { BillView } from "./BillView";
import { SplitBillModal } from "./SplitBillModal";

interface Props {
  restaurantSlug: string;
  tableNumber: number;
  restaurantName: string;
  vatRate: number;
  vatEnabled: boolean;
}

export function BillScreenClient({
  restaurantSlug,
  tableNumber,
  restaurantName,
  vatRate,
  vatEnabled,
}: Props) {
  const [screen, setScreen] = useState<"bill" | "split">("bill");
  const [splitTotalOverride, setSplitTotalOverride] = useState<number | null>(
    null,
  );
  const { sessionBatches } = useCartStore();

  const sub = sessionBatches.reduce(
    (sum, b) => sum + b.items.reduce((s, i) => s + i.lineTotal, 0),
    0,
  );
  const { total } = calculateBill({ subtotal: sub, vatRate, vatEnabled });

  if (screen === "split") {
    return (
      <SplitBillModal
        total={splitTotalOverride ?? total}
        restaurantName={restaurantName}
        restaurantSlug={restaurantSlug}
        tableNumber={tableNumber}
        onBack={() => {
          setSplitTotalOverride(null);
          setScreen("bill");
        }}
      />
    );
  }

  return (
    <BillView
      restaurantSlug={restaurantSlug}
      tableNumber={tableNumber}
      restaurantName={restaurantName}
      vatRate={vatRate}
      vatEnabled={vatEnabled}
      onSplitBill={(splitTotal) => {
        setSplitTotalOverride(splitTotal ?? total);
        setScreen("split");
      }}
    />
  );
}
