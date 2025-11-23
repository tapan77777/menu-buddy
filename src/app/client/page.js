import ClientHomePage from "../../components/ClientHomepage";

export const revalidate = 30; // optional caching

export default async function ClientPage() {
  let restaurants = [];
  let error = null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/restaurant-list`, {
      next: { revalidate: 30 },
    });

    const data = await res.json();

    if (data.success) {
      restaurants = data.restaurants;
    } else {
      error = "Failed to load restaurants";
    }
  } catch (err) {
    console.error("Error in client page:", err);
    error = "Failed to load restaurants";
  }

  return (
    <ClientHomePage
      initialRestaurants={restaurants}
      initialError={error}
    />
  );
}
