"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/mockData";
import { ShoppingCart, Receipt, List, ForkKnife } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";

interface DinerShellProps {
  restaurantName: string;
  restaurantSlug: string;
  tableNumber: number;
  children: React.ReactNode;
}

export function DinerShell({ restaurantName, restaurantSlug, tableNumber, children }: DinerShellProps) {
  const { items, sessionBatches, totalItems, subtotal } = useCartStore();
  const count = totalItems();
  const pathname = usePathname();

  const hasOrders = sessionBatches?.length > 0;
  const ordersStatus = sessionBatches?.some(b => b.status === "preparing") ? "orange" : "green";

  const baseUrl = `/${restaurantSlug}/t/${tableNumber}`;
  const isMenu = pathname === baseUrl;
  const isCart = pathname.endsWith("/cart");
  const isBill = pathname.endsWith("/bill") || pathname.includes("/split");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Centered shell — full width mobile, 480px capped on desktop */}
      <div className="mx-auto max-w-[480px] min-h-screen bg-white relative flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.12)]">
        {/* Page content */}
        <main className="flex-1 pb-24">{children}</main>

        {/* Floating Actions */}
        {!isCart && !isBill && (
          <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            {hasOrders && (
              <Link
                href={`/${restaurantSlug}/t/${tableNumber}/cart`}
                className="flex items-center gap-2 bg-white text-gray-900 px-4 py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.15)] hover:bg-gray-50 hover:scale-105 active:scale-[0.97] transition-all relative border border-gray-100 font-bold text-sm"
              >
                <div className="relative flex items-center justify-center">
                  <Receipt size={18} weight="bold" />
                  <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white ${ordersStatus === "orange" ? "bg-orange-500 animate-pulse" : "bg-green-500"}`} />
                </div>
                Live Orders
              </Link>
            )}

            <Link
              href={`/${restaurantSlug}/t/${tableNumber}/cart`}
              className="flex items-center gap-3 bg-gray-900 text-white px-5 h-12 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:bg-gray-800 hover:scale-105 active:scale-[0.97] transition-all"
            >
              <div className="relative">
                <ShoppingCart size={20} weight="fill" />
                {count > 0 && (
                  <span className="absolute -top-2 -right-2.5 w-5 h-5 bg-orange-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-gray-900">
                    {count}
                  </span>
                )}
              </div>
              <div className="w-px h-4 bg-gray-700 mx-1" />
              <span className="font-bold text-sm tracking-tight">
                {formatPrice(subtotal())}
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
