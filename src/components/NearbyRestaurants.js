"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const STATES = {
  IDLE:     "idle",
  LOCATING: "locating",
  LOADING:  "loading",
  DONE:     "done",
  HIDDEN:   "hidden", // geo unavailable or no results — section hides itself
};

function pseudoRating(name = "") {
  const seed = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return (3.8 + (seed % 12) / 10).toFixed(1);
}

export default function NearbyRestaurants() {
  const [status,      setStatus]      = useState(STATES.IDLE);
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus(STATES.HIDDEN);
      return;
    }

    setStatus(STATES.LOCATING);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setStatus(STATES.LOADING);
        try {
          const res  = await fetch(
            `/api/restaurants/nearby?lat=${coords.latitude}&lng=${coords.longitude}`
          );
          const data = await res.json();

          if (data.success && data.restaurants.length > 0) {
            setRestaurants(data.restaurants);
            setStatus(STATES.DONE);
          } else {
            // No nearby results → hide this section; Featured Restaurants covers it
            setStatus(STATES.HIDDEN);
          }
        } catch {
          setStatus(STATES.HIDDEN);
        }
      },
      () => setStatus(STATES.HIDDEN), // Permission denied or error → hide
      { timeout: 10_000 }
    );
  }, []);

  // Hide section entirely when geo is unavailable or no results found
  if (status === STATES.IDLE || status === STATES.HIDDEN) return null;

  const isLoading = status === STATES.LOCATING || status === STATES.LOADING;

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 bg-[#f8f8f8]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-5">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">📍 Nearby Cafes</h2>
          <p className="text-gray-500 text-sm mt-0.5">Restaurants within 5 km of your location</p>
        </div>

        {isLoading ? (
          <SkeletonRow />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {restaurants.map((r) => (
              <RestaurantCard key={r.slug ?? r._id} restaurant={r} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Restaurant Card ───────────────────────────────────────────────────────────

function RestaurantCard({ restaurant }) {
  const { name = "", city, address, slug, logoUrl } = restaurant;
  const subtitle = city || address || "";
  const rating   = pseudoRating(name);
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

  return (
    <Link
      href={`/restaurant/${slug}`}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 hover:border-orange-100 transition-all duration-200 overflow-hidden flex flex-col"
    >
      <div className="relative h-32 sm:h-36 bg-gradient-to-br from-orange-100 to-amber-50 overflow-hidden flex-shrink-0">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">{initials}</span>
            </div>
          </div>
        )}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-lg shadow-sm">
          <span className="text-yellow-500 text-xs">★</span>
          <span className="text-gray-800 text-xs font-bold">{rating}</span>
        </div>
      </div>

      <div className="px-3 py-3 flex flex-col gap-1 flex-1">
        <p className="font-bold text-gray-800 text-sm leading-snug line-clamp-1 group-hover:text-orange-600 transition-colors">
          {name}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
            <svg className="w-3 h-3 flex-shrink-0 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {subtitle}
          </p>
        )}
        <div className="mt-auto pt-1.5 flex items-center justify-between">
          <span className="text-xs text-gray-400">Open now</span>
          <span className="text-xs font-semibold text-orange-500 group-hover:underline">Menu →</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
          <div className="h-32 sm:h-36 bg-gradient-to-br from-gray-100 to-gray-50" />
          <div className="px-3 py-3 space-y-2">
            <div className="h-3.5 bg-gray-200 rounded-lg w-4/5" />
            <div className="h-2.5 bg-gray-100 rounded-lg w-3/5" />
            <div className="h-2.5 bg-gray-100 rounded-lg w-2/5 mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}
