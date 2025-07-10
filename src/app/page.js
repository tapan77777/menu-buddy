// src/app/page.js or wherever this page is located
export const revalidate = 60; // ISR — revalidate every 60 seconds
import PromotionalBanner from '@/components/PromotionalBanner';
import Link from 'next/link';

export default async function HomePage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/restaurant-list`);
  const data = await res.json();

  if (!data.success) {
    return <p className="text-center mt-10">Failed to load restaurants</p>;
  }

  const restaurants = data.restaurants;
  const promoData = {
  title: "🎉 Flat ₹200 OFF",
  description: "On top restaurants near you",
  buttonText: "View Offers"
};

  return (
    
     <main className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      
      
<PromotionalBanner promo={promoData}/>
      
      <h1 className="text-2xl font-bold text-center mb-6 text-black">🍽️ Explore Restaurants</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
       

        {restaurants.map((rest) => (
          <Link key={rest.slug} href={`/restaurant/${rest.slug}`} className="block">
            <div className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden">
              <img
                src={rest.logoUrl || "/default-restaurant.jpg"}
                alt={rest.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold text-black">{rest.name}</h2>
                <p className="text-gray-500 text-sm">{rest.address}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-green-600 text-sm font-medium bg-green-100 px-2 py-1 rounded-full">
                    4.2 ★
                  </span>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    Flat ₹50 OFF
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
