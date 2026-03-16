"use client";

import DishSearch          from "@/components/DishSearch";
import FeaturedRestaurants from "@/components/FeaturedRestaurants";
import FoodCategories      from "@/components/FoodCategories";
import Header              from "@/components/Header";
import NearbyRestaurants   from "@/components/NearbyRestaurants";
import PopularNearYou      from "@/components/PopularNearYou";
import TrendingDishes      from "@/components/TrendingDishes";
import { useRef }          from "react";

/**
 * Root discovery homepage.
 *
 * Section order:
 *   1. Hero Search
 *   2. Scrolling Food Categories
 *   3. Popular Near You      ← 6 featured dish tiles
 *   4. Nearby Cafes          ← hides when geo unavailable / 0 results
 *   5. Featured & Trending   ← falls back to popular if trending empty
 *   6. Featured Restaurants  ← always visible, server-prefetched
 */
export default function DiscoveryHomePage({ fallbackRestaurants = [] }) {
  const setQueryRef = useRef(null);

  function handleCategorySelect(label) {
    if (setQueryRef.current) {
      setQueryRef.current(label);
      document.getElementById("dish-search-anchor")?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f4f2]">

      {/* Sticky header */}
      <div className="sticky top-0 z-40">
        <Header />
      </div>

      {/* 1. Search hero */}
      <div id="dish-search-anchor">
        <DishSearch setQueryRef={setQueryRef} />
      </div>

      {/* 2. Category marquee */}
      <FoodCategories onSelect={handleCategorySelect} />

      {/* 3. Popular near you — dish tiles */}
      <PopularNearYou />

      {/* 4. Nearby cafes — hides when geo unavailable or no results */}
      <NearbyRestaurants />

      {/* 5. Trending / popular dishes */}
      <TrendingDishes />

      {/* 6. Featured restaurants — always visible */}
      <FeaturedRestaurants restaurants={fallbackRestaurants} />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-gray-800">
              Menu<span className="text-red-600">Buddy</span>
            </span>
            <span>·</span>
            <span>Discover food near you</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="/owner"  className="hover:text-red-600 transition-colors font-medium">List your restaurant</a>
            <a href="/login"  className="hover:text-red-600 transition-colors font-medium">Restaurant login</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
