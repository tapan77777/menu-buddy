"use client";

import Image from "next/image";
import Link from "next/link";

function pseudoRating(name = "") {
  const seed = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return (3.8 + (seed % 12) / 10).toFixed(1);
}

/**
 * Always-visible section showing all restaurants on the platform.
 * Receives restaurants from the server component so there's no client fetch.
 *
 * @param {{ restaurants: Array }} props
 */
export default function FeaturedRestaurants({ restaurants = [] }) {
  if (restaurants.length === 0) return null;

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 bg-[#f8f8f8] border-t border-gray-100">
      <div className="max-w-7xl mx-auto">

        <div className="mb-5">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">🍴 Featured Restaurants</h2>
          <p className="text-gray-500 text-sm mt-0.5">All restaurants on MenuBuddy</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {restaurants.map((r) => (
            <RestaurantCard key={r.slug} restaurant={r} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Card ──────────────────────────────────────────────────────────────────────

function RestaurantCard({ restaurant }) {
  const { name = "", address, slug, logoUrl } = restaurant;
  const rating   = pseudoRating(name);
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

  return (
    <Link
      href={`/restaurant/${slug}`}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 hover:border-orange-100 transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* Banner */}
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

        {/* Rating badge */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-lg shadow-sm">
          <span className="text-yellow-500 text-xs">★</span>
          <span className="text-gray-800 text-xs font-bold">{rating}</span>
        </div>
      </div>

      {/* Info */}
      <div className="px-3 py-3 flex flex-col gap-1 flex-1">
        <p className="font-bold text-gray-800 text-sm leading-snug line-clamp-1 group-hover:text-orange-600 transition-colors">
          {name}
        </p>
        {address && (
          <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
            <svg className="w-3 h-3 flex-shrink-0 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {address}
          </p>
        )}
        <div className="mt-auto pt-1.5 flex items-center justify-between">
          <span className="text-xs text-gray-400">View Menu</span>
          <span className="text-xs font-semibold text-orange-500 group-hover:underline">Menu →</span>
        </div>
      </div>
    </Link>
  );
}
