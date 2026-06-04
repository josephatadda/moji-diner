"use client";

import { Receipt, ShoppingCart } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { DINER } from "./ui/diner-tokens";

interface DinerShellProps {
  restaurantName: string;
  restaurantSlug: string;
  tableNumber: number;
  children: React.ReactNode;
}

export function DinerShell({
  restaurantSlug,
  tableNumber,
  children,
}: DinerShellProps) {
  const { sessionBatches, totalItems, subtotal } = useCartStore();
  const count = totalItems();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const hasOrders = mounted && sessionBatches?.length > 0;
  const ordersStatus = sessionBatches?.some((b) => b.status === "preparing")
    ? "orange"
    : "green";

  const baseUrl = `/${restaurantSlug}/t/${tableNumber}`;
  const isCart = pathname.endsWith("/cart");
  const isBill = pathname.endsWith("/bill") || pathname.includes("/split");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Centered shell — full width mobile, 480px capped on desktop */}
      <div className="mx-auto max-w-[480px] min-h-screen bg-white relative flex flex-col border-x border-gray-100">
        <main className="flex-1 pb-28">{children}</main>
      </div>

      {/* Floating Actions — fixed to viewport, horizontally aligned to shell */}
      {!isCart && !isBill && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 z-50 flex flex-col items-end gap-3 pointer-events-none">
          <div className="flex flex-col items-end gap-3 pointer-events-auto">
            {hasOrders && (
              <Link
                href={`${baseUrl}/cart?view=orders`}
                className={cn(DINER.floatingSecondary, DINER.pressable)}
              >
                <div className="relative flex items-center justify-center">
                  <Receipt size={18} weight="bold" />
                  <span
                    className={cn(
                      "absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white",
                      ordersStatus === "orange"
                        ? DINER.statusPreparing
                        : DINER.statusReady,
                    )}
                  />
                </div>
                Live Orders
              </Link>
            )}

            <Link
              href={`${baseUrl}/cart?view=cart`}
              className={cn(DINER.floatingPrimary, DINER.pressable)}
            >
              <div className="relative">
                <ShoppingCart size={20} weight="fill" />
                {mounted && count > 0 && (
                  <span className="absolute -top-2 -right-2.5 w-5 h-5 bg-orange-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-gray-900">
                    {count}
                  </span>
                )}
              </div>
              <div className="w-px h-4 bg-gray-700 mx-1" />
              <span className="font-bold text-sm tracking-tight">
                {mounted ? formatPrice(subtotal()) : "₦0"}
              </span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
