"use client";

import DishSearch          from "@/components/DishSearch";
import FeaturedRestaurants from "@/components/FeaturedRestaurants";
import FoodCategories      from "@/components/FoodCategories";
import Header              from "@/components/Header";
import NearbyRestaurants   from "@/components/NearbyRestaurants";
import TrendingDishes      from "@/components/TrendingDishes";
import { useRef }          from "react";

/**
 * Root discovery homepage.
 *
 * Section order:
 *   1. Search (hero banner)
 *   2. Food categories
 *   3. Nearby Cafes          ← hides itself when geo is unavailable / 0 results
 *   4. Featured & Trending Dishes  ← falls back to popular dishes if trending empty
 *   5. Featured Restaurants  ← always visible, zero client fetch (server-prefetched)
 *
 * @param {{ fallbackRestaurants: Array }} props
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
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Sticky header */}
      <div className="sticky top-0 z-40">
        <Header />
      </div>

      {/* 1. Search hero */}
      <div id="dish-search-anchor">
        <DishSearch setQueryRef={setQueryRef} />
      </div>

      {/* 2. Category chips */}
      <FoodCategories onSelect={handleCategorySelect} />

      {/* 3. Nearby cafes — hides when geo unavailable or no results */}
      <NearbyRestaurants />

      {/* 4. Trending / popular dishes */}
      <TrendingDishes />

      {/* 5. Featured restaurants — always visible */}
      <FeaturedRestaurants restaurants={fallbackRestaurants} />

      <div className="h-8" />
    </div>
  );
}
