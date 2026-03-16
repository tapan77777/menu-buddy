"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const STATES = {
  IDLE:     "idle",
  LOCATING: "locating",
  LOADING:  "loading",
  DONE:     "done",
  HIDDEN:   "hidden",
};

function pseudoRating(name = "") {
  const seed = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return (3.8 + (seed % 12) / 10).toFixed(1);
}

function pseudoDelivery(name = "") {
  const seed = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const base = 15 + (seed % 4) * 5;
  return `${base}–${base + 10} min`;
}

function isOpenNow() {
  const h = new Date().getHours();
  return h >= 9 && h < 22;
}

// Section fade-in hook
function useInView() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setInView(true); return; }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

export default function NearbyRestaurants() {
  const [status,      setStatus]      = useState(STATES.IDLE);
  const [restaurants, setRestaurants] = useState([]);
  const [sectionRef, inView]          = useInView();

  useEffect(() => {
    if (!navigator.geolocation) { setStatus(STATES.HIDDEN); return; }

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
            setStatus(STATES.HIDDEN);
          }
        } catch {
          setStatus(STATES.HIDDEN);
        }
      },
      () => setStatus(STATES.HIDDEN),
      { timeout: 10_000 }
    );
  }, []);

  if (status === STATES.IDLE || status === STATES.HIDDEN) return null;

  const isLoading = status === STATES.LOCATING || status === STATES.LOADING;

  return (
    <section
      ref={sectionRef}
      className={`py-10 px-4 sm:px-6 lg:px-8 bg-[#f8f8f8] section-fade ${inView ? "in-view" : ""}`}
    >
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <span>📍</span> Nearby Cafes
            </h2>
            <p className="text-gray-400 text-sm mt-1">Restaurants within 5 km of your location</p>
          </div>
          <span className="text-xs font-semibold text-orange-500 hidden sm:block">Based on your location</span>
        </div>

        {isLoading ? (
          <SkeletonRow />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {restaurants.map((r, i) => (
              <RestaurantCard key={r.slug ?? r._id} restaurant={r} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Restaurant Card ────────────────────────────────────────────────────────────

function RestaurantCard({ restaurant, index }) {
  const { name = "", city, address, slug, logoUrl, distance } = restaurant;
  const subtitle  = city || address || "";
  const rating    = pseudoRating(name);
  const delivery  = pseudoDelivery(name);
  const open      = isOpenNow();
  const initials  = name.trim().split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  const distLabel = distance ? `${(distance / 1000).toFixed(1)} km` : null;

  return (
    <Link
      href={`/restaurant/${slug}`}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-orange-100 transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1.5"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Image */}
      <div className="relative h-36 sm:h-40 bg-gradient-to-br from-orange-100 to-amber-50 overflow-hidden flex-shrink-0">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-white text-xl font-extrabold">{initials}</span>
            </div>
          </div>
        )}

        {/* Gradient overlay for badge legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

        {/* Rating — bottom left */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
          <span className="text-yellow-400 text-xs">★</span>
          <span className="text-white text-xs font-bold">{rating}</span>
        </div>

        {/* Open/Closed — top right */}
        <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-sm ${
          open ? "bg-green-500/90 text-white" : "bg-gray-800/80 text-gray-300"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${open ? "bg-white" : "bg-gray-500"}`} />
          {open ? "Open" : "Closed"}
        </div>
      </div>

      {/* Info */}
      <div className="px-3 py-3 flex flex-col gap-1 flex-1">
        <p className="font-bold text-gray-900 text-sm leading-snug line-clamp-1 group-hover:text-orange-600 transition-colors">
          {name.trim()}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
            <svg className="w-3 h-3 flex-shrink-0 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {subtitle}
          </p>
        )}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-[11px] text-gray-400">
            {distLabel ? `📍 ${distLabel}` : `🕐 ${delivery}`}
          </span>
          <span className="text-[11px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-lg">
            Menu →
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="h-36 sm:h-40 skeleton-wave" />
          <div className="px-3 py-3 space-y-2.5">
            <div className="h-3.5 skeleton-wave rounded-lg w-4/5" />
            <div className="h-2.5 skeleton-wave rounded-lg w-3/5" />
            <div className="h-2.5 skeleton-wave rounded-lg w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
