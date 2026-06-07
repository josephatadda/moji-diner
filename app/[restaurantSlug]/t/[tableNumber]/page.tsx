import { CartContextProvider } from "@/components/diner/CartContextProvider";
import { DinerShell } from "@/components/diner/DinerShell";
import { MenuPage } from "@/components/diner/MenuPage";
import { MOCK_RESTAURANT } from "@/lib/mockData";

interface Props {
  params: Promise<{ restaurantSlug: string; tableNumber: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { tableNumber } = await params;
  return {
    title: `${MOCK_RESTAURANT.name} — Table ${tableNumber}`,
    description: `Browse the menu and order from ${MOCK_RESTAURANT.name}`,
  };
}

export default async function DinerMenuPage({ params }: Props) {
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
        <MenuPage
          categories={[]}
          restaurantSlug={restaurantSlug}
          tableNumber={tableNum}
          restaurantName={MOCK_RESTAURANT.name}
          restaurantDescription={MOCK_RESTAURANT.description}
          rating="4.8"
          estimatedWaitMins="15-20"
        />
      </DinerShell>
    </CartContextProvider>
  );
}
