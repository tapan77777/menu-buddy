// src/app/page.js or wherever this page is located
export const revalidate = 60; // ISR — revalidate every 60 seconds

import Link from 'next/link';

export default async function HomePage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/restaurant-list`);
  const data = await res.json();

  if (!data.success) {
    return <p className="text-center mt-10">Failed to load restaurants</p>;
  }

  const restaurants = data.restaurants;

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">🍽️ Explore Restaurants</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {restaurants.map((rest) => (
          <Link
            key={rest.slug}
            href={`/restaurant/${rest.slug}`}
            className="bg-white shadow rounded-2xl p-4 hover:shadow-lg transition"
          >
            {rest.logoUrl ? (
  <img
    src={rest.logoUrl}
    alt={rest.name}
    className="w-full h-40 object-cover rounded-xl mb-4"
  />
) : null}

            <h2 className="text-xl font-semibold">{rest.name}</h2>
            <p className="text-gray-600 text-sm">{rest.address}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
