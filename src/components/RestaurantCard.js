'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function RestaurantCard({ restaurant, index = 0 }) {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite((prev) => !prev);
  };

  return (
    <Link
      href={`/restaurant/${restaurant.slug}`}
      className="block group"
      prefetch={true}
    >
      <article
        className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 overflow-hidden border border-gray-100"
        style={{ animationDelay: `${index * 60}ms` }}
      >

        {/* ── Image Section ── */}
        <div className="relative h-44 sm:h-48 overflow-hidden bg-gray-100">
          <Image
            src={restaurant.logoUrl || '/default-restaurant.jpg'}
            alt={restaurant.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Bottom gradient — makes bottom badges readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          {/* Top gradient — makes top badges readable */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />

          {/* Top-left — delivery time */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
              ⏱ 20–30 min
            </span>
          </div>

          {/* Top-right — favorite button */}
          <button
            onClick={handleFavorite}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/25 backdrop-blur-sm flex items-center justify-center hover:bg-black/40 hover:scale-110 active:scale-90 transition-all duration-200"
            aria-label={isFavorite ? 'Remove from favourites' : 'Add to favourites'}
          >
            <svg
              viewBox="0 0 24 24"
              strokeWidth={2.2}
              className={`w-4 h-4 transition-all duration-200 ${
                isFavorite
                  ? 'fill-red-500 stroke-red-500 scale-110'
                  : 'fill-transparent stroke-white'
              }`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>

          {/* Bottom-left — offer badge */}
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
              🏷️ Flat ₹50 OFF
            </span>
          </div>
        </div>

        {/* ── Card Body ── */}
        <div className="p-4">

          {/* Name */}
          <h2 className="text-base font-bold text-gray-900 truncate leading-snug">
            {restaurant.name}
          </h2>

          {/* Address / location */}
          <p className="text-sm text-gray-400 truncate mt-0.5 mb-3">
            {restaurant.address || 'View menu'}
          </p>

          {/* Divider */}
          <div className="h-px bg-gray-100 mb-3" />

          {/* Meta row */}
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded-md">
              ⭐ 4.2
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-500 font-medium">20–30 min</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-500 font-medium">₹₹</span>
            <span className="ml-auto">
              <span className="text-orange-500 font-semibold">Open</span>
            </span>
          </div>

        </div>
      </article>
    </Link>
  );
}
