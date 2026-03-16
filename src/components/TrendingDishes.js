"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function TrendingDishes() {
  const [dishes,    setDishes]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        // Primary: trending dishes (most common across restaurants)
        const res  = await fetch("/api/trending-dishes");
        const data = await res.json();

        if (data.success && data.dishes.length > 0) {
          setDishes(data.dishes);
          return;
        }

        // Fallback: random popular dishes when trending returns empty
        const res2  = await fetch("/api/popular-dishes");
        const data2 = await res2.json();

        if (data2.success && data2.dishes.length > 0) {
          setDishes(data2.dishes);
          setIsFallback(true);
        }
      } catch {
        // Silent — section simply hides if both calls fail
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // Hide section only if loading is done and there's truly nothing to show
  if (!loading && dishes.length === 0) return null;

  const title    = isFallback ? "🍽️ Popular Dishes" : "🔥 Featured & Trending Dishes";
  const subtitle = isFallback
    ? "Dishes loved by MenuBuddy diners"
    : "Most popular dishes across MenuBuddy restaurants";

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto">

        <div className="mb-5">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : dishes.map((dish, i) => (
                <DishCard key={i} dish={dish} rank={i} isFallback={isFallback} />
              ))}
        </div>
      </div>
    </section>
  );
}

// ─── Dish Card ─────────────────────────────────────────────────────────────────

function DishCard({ dish, rank, isFallback }) {
  const { name, price, imageUrl, restaurantName, restaurantSlug } = dish;

  return (
    <Link
      href={`/restaurant/${restaurantSlug}`}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-orange-100 transition-all duration-200 overflow-hidden flex flex-col"
    >
      <div className="relative h-36 bg-gradient-to-br from-orange-50 to-amber-100 flex-shrink-0 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-5xl select-none">
            🍽️
          </div>
        )}

        {/* Rank badge on top 3 trending items only */}
        {!isFallback && rank < 3 && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow">
            #{rank + 1} Trending
          </div>
        )}
      </div>

      <div className="px-3 py-2.5 flex flex-col gap-0.5 flex-1">
        <p className="font-bold text-gray-800 text-sm leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors">
          {name}
        </p>
        <p className="text-xs text-gray-400 truncate">{restaurantName}</p>
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-sm font-extrabold text-orange-600">₹{price}</span>
          <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-md border border-gray-100">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden animate-pulse bg-white">
      <div className="h-36 bg-gradient-to-br from-gray-100 to-gray-50" />
      <div className="px-3 py-2.5 space-y-2">
        <div className="h-3.5 bg-gray-200 rounded-lg w-4/5" />
        <div className="h-2.5 bg-gray-100 rounded-lg w-3/5" />
        <div className="h-3 bg-gray-200 rounded-lg w-1/3 mt-1" />
      </div>
    </div>
  );
}
