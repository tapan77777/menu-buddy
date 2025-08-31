// src/components/ClientHomePage.js (Client Component)
'use client';
import PromotionalBanner from '@/components/PromotionalBanner';
import SearchBar from '@/components/SearchBar';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import Header from './Header';

export default function ClientHomePage({ initialRestaurants, initialError }) {
  const [allRestaurants] = useState(initialRestaurants || []);
  const [filteredRestaurants, setFilteredRestaurants] = useState(initialRestaurants || []);
  const [error] = useState(initialError);

  // Handle search functionality
  const handleSearch = ({ query }) => {
    if (!query || query.trim() === '') {
      // If search is empty, show all restaurants
      setFilteredRestaurants(allRestaurants);
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    
    const filtered = allRestaurants.filter((restaurant) => {
      const nameMatch = restaurant.name.toLowerCase().includes(searchTerm);
      const addressMatch = restaurant.address.toLowerCase().includes(searchTerm);
      
      return nameMatch || addressMatch;
    });

    setFilteredRestaurants(filtered);
  };

  const promoData = {
    title: "🎉 Flat ₹200 OFF",
    description: "On top restaurants near you",
    buttonText: "View Offers"
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-white">
        <header className="bg-gradient-to-r from-red-800 via-red-600 to-red-400 shadow-md relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
           <Image
  src="/favicon-alt.ico"
  alt="MenuBuddy Logo"
  width={40}   // w-10 = 40px
  height={40}  // h-10 = 40px
  className="w-10 h-10 rounded-full shadow-lg ring-2 ring-white"
/>
            <h1 className="text-xl sm:text-2xl font-bold text-white">MenuBuddy</h1>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-center text-red-600 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* HEADER */}
      <Header />

      <main className="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-white relative">
        {/* Promotional Banner */}
        <div className="-mx-4 sm:-mx-6">
          <PromotionalBanner promo={promoData} />
        </div>

        {/* Search Bar */}
        <div className="-mx-4 sm:-mx-6">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Search Results Info */}
        {filteredRestaurants.length !== allRestaurants.length && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              Showing {filteredRestaurants.length} of {allRestaurants.length} restaurants
              {filteredRestaurants.length === 0 && (
                <span className="block mt-1 text-blue-600">
                  Try searching with different keywords or check your spelling.
                </span>
              )}
            </p>
          </div>
        )}

        {/* Restaurant Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" id="restaurantGrid">
          {filteredRestaurants.length > 0 ? (
            filteredRestaurants.map((rest, index) => (
              <Link key={rest.slug} href={`/restaurant/${rest.slug}`} className="block" prefetch={true}>
                <div
                  className="restaurant-card bg-white rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden animate-fadeInUp group"
                  style={{ animationDelay: `${index * 100}ms` }}
                  data-index={index}
                >
                  <div className="relative">
                   <Image
  src={rest.logoUrl || "/default-restaurant.jpg"}
  alt={rest.name}
  width={800}
  height={160}
  className="w-full h-40 object-cover transition-all duration-300 hover:scale-105"
  loading="lazy"
/>
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform duration-300">
                      Flat ₹50 OFF
                    </div>
                  </div>
                  <div className="p-4">
                    <h2 className="text-lg font-bold text-gray-900">{rest.name}</h2>
                    <p className="text-gray-500 text-sm">{rest.address}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-green-600 text-sm font-semibold bg-green-100 px-3 py-1 rounded-full shadow-sm">
                        ⭐ 4.2
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No restaurants found</h3>
              <p className="text-gray-500">Try searching with different keywords</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}