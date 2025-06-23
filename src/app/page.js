'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    async function fetchRestaurants() {
      const res = await fetch('/api/restaurant-list');
      const data = await res.json();
      if (data.success) {
        setRestaurants(data.restaurants);
      }
    }
    fetchRestaurants();
  }, []);

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
            <img
              src={rest.logoUrl}
              alt={rest.name}
              className="w-full h-40 object-cover rounded-xl mb-4"
            />
            <h2 className="text-xl font-semibold">{rest.name}</h2>
            <p className="text-gray-600 text-sm">{rest.address}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
