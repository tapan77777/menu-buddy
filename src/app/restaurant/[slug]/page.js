
// ✅ SERVER COMPONENT
import MenuList from "./MenuList";

export const revalidate = 60; // Enable ISR every 60 sec

async function getData(slug) {
  // cache: 'no-store' so the fetch always hits the API fresh when ISR rebuilds the page.
  // Page-level `revalidate = 60` above already controls how often rebuilds happen —
  // having a second 60-second data-cache on top caused stale snapshots that didn't
  // match each other, making categories appear/disappear unpredictably.
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/restaurant/${slug}/menu`, {
    cache: 'no-store',
  });
  return res.json();
}

export default async function RestaurantPage({ params }) {
  const { slug } = await params;
  const { restaurant, items, success } = await getData(slug);

  if (!success) return <p className="text-center mt-10">Failed to load restaurant</p>;

  return (
  <MenuList
    items={items}
    restaurant={restaurant}
    restaurantId={restaurant?._id}
    categories={restaurant?.categories || []}
  />
)

}
