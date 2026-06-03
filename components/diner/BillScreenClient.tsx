"use client";

import { useState } from "react";
import { BillView } from "./BillView";
import { SplitBillModal } from "./SplitBillModal";
import { useCartStore } from "@/store/cart";
import { calculateBill } from "@/lib/diner-utils";

interface Props {
  restaurantSlug: string;
  tableNumber: number;
  restaurantName: string;
  vatRate: number;
  vatEnabled: boolean;
}

export function BillScreenClient({ restaurantSlug, tableNumber, restaurantName, vatRate, vatEnabled }: Props) {
  const [screen, setScreen] = useState<"bill" | "split">("bill");
  const { sessionBatches } = useCartStore();

  const sub = sessionBatches.reduce((sum, b) => sum + b.items.reduce((s, i) => s + i.lineTotal, 0), 0);
  const { vat, total } = calculateBill({ subtotal: sub, vatRate, vatEnabled });

  if (screen === "split") {
    return (
      <SplitBillModal
        total={total}
        restaurantName={restaurantName}
        restaurantSlug={restaurantSlug}
        tableNumber={tableNumber}
        onBack={() => setScreen("bill")}
      />
    );
  }

  return (
    <BillView
      restaurantSlug={restaurantSlug}
      tableNumber={tableNumber}
      vatRate={vatRate}
      vatEnabled={vatEnabled}
      onSplitBill={() => setScreen("split")}
    />
  );
}
