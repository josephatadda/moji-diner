"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart";

interface CartContextProviderProps {
  restaurantId: string;
  slug: string;
  tableNumber: number;
  children: React.ReactNode;
}

export function CartContextProvider({
  restaurantId,
  slug,
  tableNumber,
  children,
}: CartContextProviderProps) {
  const { setContext } = useCartStore();

  useEffect(() => {
    setContext(restaurantId, slug, tableNumber);
  }, [restaurantId, slug, tableNumber, setContext]);

  return <>{children}</>;
}
