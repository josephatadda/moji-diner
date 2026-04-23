import { DinerShell } from "@/components/diner/DinerShell";
import { BillScreenClient } from "@/components/diner/BillScreenClient";
import { CartContextProvider } from "@/components/diner/CartContextProvider";
import { MOCK_RESTAURANT } from "@/lib/mockData";

interface Props {
  params: Promise<{ restaurantSlug: string; tableNumber: string }>;
}

export const metadata = { title: "Your Bill" };

export default async function BillPage({ params }: Props) {
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
        <BillScreenClient
          restaurantSlug={restaurantSlug}
          tableNumber={tableNum}
          restaurantName={MOCK_RESTAURANT.name}
          vatRate={MOCK_RESTAURANT.vatRate}
          vatEnabled={MOCK_RESTAURANT.vatEnabled}
        />
      </DinerShell>
    </CartContextProvider>
  );
}
