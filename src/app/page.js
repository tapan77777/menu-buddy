// src/app/page.js
export const revalidate = 60; // ISR — revalidate every 60 seconds

import PromotionalBanner from '@/components/PromotionalBanner';
import SearchBar from '@/components/SearchBar';
import Link from 'next/link';

export async function generateMetadata() {
  return {
    title: "MenuBuddy - Explore QR Menus Near You",
    description: "Discover top-rated restaurants and view digital menus instantly with MenuBuddy.",
    icons: {
      icon: [
        {
          url: '/favicon-alt.ico',
          type: 'image/x-icon',
          sizes: 'any',
        },
      ],
    },
    keywords: ["digital menu", "QR menu", "restaurant menus", "menubuddy", "order online"],
    openGraph: {
      title: "MenuBuddy - Smart QR Menus",
      images: [
        {
          url: "https://menubuddy.co.in/images/menubuddy-logo.png",
          width: 1200,
          height: 630,
          alt: "MenuBuddy Preview"
        }
      ],
      description: "Explore digital menus with QR, promotions, and more.",
      url: "https://menubuddy.co.in",
      siteName: "MenuBuddy",
      type: "website"
    },
    alternates: {
      canonical: "https://menubuddy.co.in"
    }
  };
}

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
    <>
      

      {/* HEADER */}
      <header className="bg-gradient-to-r from-red-800 via-red-600 to-red-400 shadow-md relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          {/* Logo */}
          <img
            src="/favicon-alt.ico"
            alt="MenuBuddy Logo"
            className="w-10 h-10 rounded-full shadow-lg ring-2 ring-white"
          />
          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-white">MenuBuddy</h1>
        </div>
      </header>

      <main className="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-white relative">
        {/* Promotional Banner with Pull Animation */}
        <div className="-mx-4 sm:-mx-6">
    <PromotionalBanner promo={promoData} />
  </div>
<div className="-mx-4 sm:-mx-6">
        <SearchBar/>
</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" id="restaurantGrid">
          {restaurants.map((rest, index) => (
            <Link key={rest.slug} href={`/restaurant/${rest.slug}`} className="block">
              <div
                className="restaurant-card bg-white rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
                data-index={index}
              >
                <img
                  src={rest.logoUrl || "/default-restaurant.jpg"}
                  alt={rest.name}
                  className="w-full h-40 object-cover transition-all duration-300 hover:scale-105"
                />
                <div className="p-4">
                  <h2 className="text-lg font-bold text-gray-900">{rest.name}</h2>
                  <p className="text-gray-500 text-sm">{rest.address}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-green-600 text-sm font-semibold bg-green-100 px-3 py-1 rounded-full shadow-sm">
                      ⭐ 4.2
                    </span>
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform duration-300">
                      Flat ₹50 OFF
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}