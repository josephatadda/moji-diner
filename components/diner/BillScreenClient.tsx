"use client";

import { useState } from "react";
import { BillView } from "./BillView";
import { SplitBillModal } from "./SplitBillModal";
import { useCartStore } from "@/store/cart";

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
  const vat = vatEnabled ? sub * (vatRate / 100) : 0;
  const total = sub + vat;

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
