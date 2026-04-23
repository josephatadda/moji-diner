import SplitPartPage from "@/components/diner/SplitPartPage";

interface Props {
  params: Promise<{ token: string; part: string }>;
}

export function generateMetadata() {
  return { title: "Split Bill — Moji" };
}

export default async function SplitPage({ params }: Props) {
  const { token, part } = await params;
  const partNum = Number(part);

  // These would come from DB in prod; mocked here
  const totalParts   = 4;
  const amount       = 3200;
  const restaurantName = "Mama Put Kitchen";
  const tableNumber  = 5;

  return (
    <SplitPartPage
      token={token}
      part={partNum}
      totalParts={totalParts}
      amount={amount}
      restaurantName={restaurantName}
      tableNumber={tableNumber}
    />
  );
}
