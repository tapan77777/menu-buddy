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

export default function TrendingDishes() {
  const [dishes,     setDishes]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [sectionRef, inView]        = useInView();

  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch("/api/trending-dishes");
        const data = await res.json();

        if (data.success && data.dishes.length > 0) {
          setDishes(data.dishes);
          return;
        }

        const res2  = await fetch("/api/popular-dishes");
        const data2 = await res2.json();

        if (data2.success && data2.dishes.length > 0) {
          setDishes(data2.dishes);
          setIsFallback(true);
        }
      } catch {
        // Silent — section hides if both fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (!loading && dishes.length === 0) return null;

  const title    = isFallback ? "Popular Dishes" : "Featured & Trending";
  const subtitle = isFallback
    ? "Dishes loved by MenuBuddy diners"
    : "Most ordered across MenuBuddy restaurants right now";
  const icon = isFallback ? "⭐" : "🔥";

  return (
    <section
      ref={sectionRef}
      className={`py-10 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-100 section-fade ${inView ? "in-view" : ""}`}
    >
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <span>{icon}</span> {title}
            </h2>
            <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
          </div>
          {!isFallback && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-500 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-full hidden sm:flex">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
              Live trending
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
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

// ── Dish Card ──────────────────────────────────────────────────────────────────

function DishCard({ dish, rank, isFallback }) {
  const { name, price, imageUrl, restaurantName, restaurantSlug } = dish;

  return (
    <Link
      href={`/restaurant/${restaurantSlug}`}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-100 transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1.5"
    >
      {/* Image */}
      <div className="relative h-36 bg-gradient-to-br from-orange-50 to-amber-100 flex-shrink-0 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-5xl select-none">🍽️</div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        {/* Rank badge */}
        {!isFallback && rank < 3 && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-orange-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-md">
            🔥 #{rank + 1}
          </div>
        )}
        {isFallback && rank < 3 && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-md">
            ⭐ Popular
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-3 py-2.5 flex flex-col gap-0.5 flex-1">
        <p className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors">
          {name}
        </p>
        <p className="text-xs text-gray-400 truncate">{restaurantName}</p>
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-sm font-extrabold text-orange-600">₹{price}</span>
          <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 hover:bg-orange-50 hover:text-orange-500 px-2 py-0.5 rounded-lg border border-gray-100 transition-colors">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white">
      <div className="h-36 skeleton-wave" />
      <div className="px-3 py-2.5 space-y-2.5">
        <div className="h-3.5 skeleton-wave rounded-lg w-4/5" />
        <div className="h-2.5 skeleton-wave rounded-lg w-3/5" />
        <div className="h-3 skeleton-wave rounded-lg w-1/3 mt-1" />
      </div>
    </div>
  );
}
