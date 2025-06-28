
// ✅ SERVER COMPONENT
import MenuList from "./MenuList";

export const revalidate = 60; // Enable ISR every 60 sec

async function getData(slug) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/restaurant/${slug}/menu`, {
    next: { revalidate: 60 },
  });
  return res.json();
}

export default async function RestaurantPage({ params }) {
  const { slug } = await params;
  const { restaurant, items, success } = await getData(slug);

  if (!success) return <p className="text-center mt-10">Failed to load restaurant</p>;

  return <MenuList items={items} restaurant={restaurant} />;
}
