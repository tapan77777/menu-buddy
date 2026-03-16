"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// Section fade-in hook
function useInView() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setInView(true); return; }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.06 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

/**
 * "Popular Near You" — 6 featured dish tiles shown in a
 * horizontally scrollable row on mobile and a 6-column grid on desktop.
 * Uses the same trending/popular-dishes APIs as TrendingDishes but rendered
 * as tall overlay cards rather than small grid cards.
 */
export default function PopularNearYou() {
  const [dishes,  setDishes]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [sectionRef, inView]  = useInView();

  useEffect(() => {
    async function load() {
      try {
        // Primary: trending — falls back to popular
        const res  = await fetch("/api/trending-dishes");
        const data = await res.json();
        if (data.success && data.dishes.length > 0) {
          setDishes(data.dishes.slice(0, 6));
          return;
        }
        const res2  = await fetch("/api/popular-dishes");
        const data2 = await res2.json();
        if (data2.success && data2.dishes.length > 0) {
          setDishes(data2.dishes.slice(0, 6));
        }
      } catch {
        // Silent — section hides when both fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (!loading && dishes.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className={`py-9 bg-[#FFF6F0] border-t border-orange-100 section-fade ${inView ? "in-view" : ""}`}
    >
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <div className="flex items-end justify-between px-4 sm:px-6 lg:px-8 mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <span>🔥</span> Popular Near You
            </h2>
            <p className="text-gray-400 text-sm mt-1">Dishes everyone around you is ordering</p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            Trending now
          </div>
        </div>

        {/* ── Mobile: horizontal snap scroll ── */}
        <div
          className="sm:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 px-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonTile key={i} />)
            : dishes.map((dish, i) => <DishTile key={i} dish={dish} rank={i} />)
          }
        </div>

        {/* ── Desktop: 6-column grid ── */}
        <div className="hidden sm:grid grid-cols-3 lg:grid-cols-6 gap-4 px-4 sm:px-6 lg:px-8">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonTile key={i} desktop />)
            : dishes.map((dish, i) => <DishTile key={i} dish={dish} rank={i} desktop />)
          }
        </div>
      </div>
    </section>
  );
}

// ── Dish Tile ──────────────────────────────────────────────────────────────────
// Tall card with food photo filling the card and text overlaid at the bottom.

function DishTile({ dish, rank, desktop = false }) {
  const { name, price, imageUrl, restaurantName, restaurantSlug } = dish;
  const isHot = rank < 3;

  return (
    <Link
      href={`/restaurant/${restaurantSlug}`}
      className={`
        group flex-shrink-0 snap-start relative rounded-2xl overflow-hidden
        shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5
        ${desktop ? "w-auto" : "w-36"}
      `}
    >
      {/* Image — fills card */}
      <div className="relative h-48 sm:h-52 bg-gradient-to-br from-red-100 to-orange-50">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 144px, (max-width: 1024px) 33vw, 16vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl select-none">
            🍽️
          </div>
        )}

        {/* Gradient overlay — darkens bottom for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Hot badge */}
        {isHot && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-gradient-to-r from-red-600 to-orange-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md">
            🔥 Hot
          </div>
        )}

        {/* Text overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white font-bold text-sm leading-tight line-clamp-2 drop-shadow">
            {name}
          </p>
          <p className="text-white/65 text-xs mt-0.5 truncate">{restaurantName}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-orange-300 font-extrabold text-sm">₹{price}</span>
            <span className="text-white/60 text-[10px] font-semibold bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
              View →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function SkeletonTile({ desktop = false }) {
  return (
    <div className={`flex-shrink-0 rounded-2xl overflow-hidden ${desktop ? "w-auto" : "w-36"}`}>
      <div className="h-48 sm:h-52 skeleton-wave" />
    </div>
  );
}
