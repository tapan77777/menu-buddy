// src/components/ClientHomePage.js (Client Component)
'use client';
import PromotionalBanner from '@/components/PromotionalBanner';
import RestaurantCard from '@/components/RestaurantCard';
import SearchBar from '@/components/SearchBar';
import Image from 'next/image';
import { useState } from 'react';
import Header from './Header';

export default function ClientHomePage({ initialRestaurants, initialError }) {
  const [allRestaurants] = useState(initialRestaurants || []);
  const [filteredRestaurants, setFilteredRestaurants] = useState(initialRestaurants || []);
  const [error] = useState(initialError);

  const handleSearch = ({ query }) => {
    if (!query || query.trim() === '') {
      setFilteredRestaurants(allRestaurants);
      return;
    }
    const searchTerm = query.toLowerCase().trim();
    setFilteredRestaurants(
      allRestaurants.filter(
        (r) =>
          r.name.toLowerCase().includes(searchTerm) ||
          r.address.toLowerCase().includes(searchTerm)
      )
    );
  };

  const promoData = {
    title: '🎉 Flat ₹200 OFF',
    description: 'On top restaurants near you',
    buttonText: 'View Offers',
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-white">
        <header className="bg-gradient-to-r from-red-800 via-red-600 to-red-400 shadow-md relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
            <Image
              src="/favicon-alt.ico"
              alt="MenuBuddy Logo"
              width={40}
              height={40}
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

  const isFiltered = filteredRestaurants.length !== allRestaurants.length;

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50">

        {/* Promotional Banner */}
        <PromotionalBanner promo={promoData} />

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} />

        {/* Restaurant Section */}
        <section className="px-4 sm:px-6 pb-10 mt-6">

          {/* Section header */}
          <div className="flex items-center justify-between mb-4">
            {isFiltered ? (
              <div>
                <h2 className="text-lg font-bold text-gray-900">Search Results</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {filteredRestaurants.length === 0
                    ? 'No restaurants found — try different keywords'
                    : `${filteredRestaurants.length} restaurant${filteredRestaurants.length !== 1 ? 's' : ''} found`}
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-bold text-gray-900">Restaurants Near You</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {allRestaurants.length} restaurant{allRestaurants.length !== 1 ? 's' : ''} available
                </p>
              </div>
            )}

            {/* Sort pill — visual only for now */}
            <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm hover:border-orange-300 hover:text-orange-600 transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              Sort
            </button>
          </div>

          {/* Grid */}
          {filteredRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredRestaurants.map((restaurant, index) => (
                <RestaurantCard
                  key={restaurant.slug}
                  restaurant={restaurant}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-700 mb-1">No restaurants found</h3>
              <p className="text-sm text-gray-400">Try searching with different keywords</p>
            </div>
          )}

        </section>
      </main>
    </>
  );
}
