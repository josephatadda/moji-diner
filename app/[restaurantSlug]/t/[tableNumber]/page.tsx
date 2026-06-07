import { notFound } from "next/navigation";
import { CartContextProvider } from "@/components/diner/CartContextProvider";
import { DinerShell } from "@/components/diner/DinerShell";
import { MenuPage } from "@/components/diner/MenuPage";
import { getMenuBySlug } from "@/lib/services/menu";
import { getRestaurantBySlug } from "@/lib/services/restaurants";

interface Props {
  params: Promise<{ restaurantSlug: string; tableNumber: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { restaurantSlug, tableNumber } = await params;
  const restaurant = await getRestaurantBySlug(restaurantSlug);
  if (!restaurant) return { title: "Restaurant not found" };
  return {
    title: `${restaurant.name} — Table ${tableNumber}`,
    description: `Browse the menu and order from ${restaurant.name}`,
  };
}

export default async function DinerMenuPage({ params }: Props) {
  const { restaurantSlug, tableNumber } = await params;
  const tableNum = Number(tableNumber);

  const restaurant = await getRestaurantBySlug(restaurantSlug);
  if (!restaurant) notFound();

  const categories = await getMenuBySlug(restaurantSlug);

  return (
    <CartContextProvider
      restaurantId={restaurant.id}
      slug={restaurantSlug}
      tableNumber={tableNum}
    >
      <DinerShell
        restaurantName={restaurant.name}
        restaurantSlug={restaurantSlug}
        tableNumber={tableNum}
      >
        <MenuPage
          categories={categories}
          restaurantSlug={restaurantSlug}
          tableNumber={tableNum}
          restaurantName={restaurant.name}
          restaurantDescription={restaurant.description}
          rating="4.8"
          estimatedWaitMins="15-20"
        />
      </DinerShell>
    </CartContextProvider>
  );
}
