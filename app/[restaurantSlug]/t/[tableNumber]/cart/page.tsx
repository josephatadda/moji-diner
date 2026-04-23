import { DinerShell } from "@/components/diner/DinerShell";
import { CartScreen } from "@/components/diner/CartScreen";
import { CartContextProvider } from "@/components/diner/CartContextProvider";
import { MOCK_RESTAURANT } from "@/lib/mockData";
import Link from "next/link";

interface Props {
  params: Promise<{ restaurantSlug: string; tableNumber: string }>;
}

export const metadata = { title: "Your Order" };

export default async function CartPage({ params }: Props) {
  const { restaurantSlug, tableNumber } = await params;
  const tableNum = Number(tableNumber);

  return (
    <CartContextProvider
      restaurantId={MOCK_RESTAURANT.id}
      slug={restaurantSlug}
      tableNumber={tableNum}
    >
      <DinerShell
        restaurantName={MOCK_RESTAURANT.name}
        restaurantSlug={restaurantSlug}
        tableNumber={tableNum}
      >
        <div className="px-0 pt-2">
          <div className="px-4 mb-2">
            <Link
              href={`/${restaurantSlug}/t/${tableNumber}`}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors"
            >
              ← Back to menu
            </Link>
          </div>
        </div>
        <CartScreen
          restaurantSlug={restaurantSlug}
          tableNumber={tableNum}
          vatRate={MOCK_RESTAURANT.vatRate}
          vatEnabled={MOCK_RESTAURANT.vatEnabled}
          loyaltyEnabled={MOCK_RESTAURANT.loyaltyEnabled}
        />
      </DinerShell>
    </CartContextProvider>
  );
}
