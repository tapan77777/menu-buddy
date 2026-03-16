"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const DEBOUNCE_MS = 300;

export default function DishSearch({ setQueryRef } = {}) {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);

  const wrapperRef = useRef(null);
  const timerRef   = useRef(null);

  // Expose setter to parent (FoodCategories bridge)
  useEffect(() => {
    if (setQueryRef) setQueryRef.current = setQuery;
  }, [setQueryRef]);

  // Close on outside click
  useEffect(() => {
    function onOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  // Debounced fetch
  useEffect(() => {
    clearTimeout(timerRef.current);
    if (!query.trim()) {
      setResults([]); setOpen(false); setLoading(false);
      return;
    }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res  = await fetch(`/api/search-dishes?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.success ? data.dishes : []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  function handleSelect() {
    setQuery(""); setOpen(false); setResults([]);
  }

  const showDropdown = open && query.trim().length > 0;

  return (
    /* ── Hero banner ── */
    <section className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 px-4 sm:px-6 lg:px-8 pt-10 pb-14">
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-72 h-72 bg-amber-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto text-center">
        <p className="text-orange-100 text-xs sm:text-sm font-semibold uppercase tracking-widest mb-2">
          MenuBuddy Discovery
        </p>
        <h1 className="text-white text-3xl sm:text-4xl font-extrabold mb-1 leading-tight drop-shadow">
          What are you craving?
        </h1>
        <p className="text-orange-100 text-sm mb-7">
          Search dishes across all nearby restaurants
        </p>

        {/* Search box */}
        <div ref={wrapperRef} className="relative">
          <div className="flex items-center bg-white rounded-2xl shadow-2xl px-4 py-4 gap-3 focus-within:ring-2 focus-within:ring-orange-300 transition-all">
            {/* Search icon */}
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setOpen(true)}
              placeholder="Search for Biryani, Pizza, Burger…"
              className="flex-1 outline-none text-gray-800 placeholder-gray-400 text-base sm:text-lg bg-transparent font-medium"
            />

            {loading && (
              <svg className="w-5 h-5 text-orange-400 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            {!loading && query && (
              <button
                onClick={() => { setQuery(""); setOpen(false); setResults([]); }}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex-shrink-0 transition-colors"
                aria-label="Clear"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Results dropdown */}
          {showDropdown && (
            <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 text-left">
              {results.length === 0 && !loading ? (
                <div className="px-5 py-8 text-center text-gray-400 text-sm">
                  <span className="text-3xl block mb-2">🍽️</span>
                  No dishes found for &ldquo;{query}&rdquo;
                </div>
              ) : (
                <ul className="max-h-[22rem] overflow-y-auto divide-y divide-gray-50">
                  {results.map((dish, i) => (
                    <li key={i}>
                      <Link
                        href={`/restaurant/${dish.restaurantSlug}`}
                        onClick={handleSelect}
                        className="flex items-center gap-3 px-4 py-3.5 hover:bg-orange-50 active:bg-orange-100 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0 flex items-center justify-center">
                          {dish.imageUrl ? (
                            <div className="relative w-full h-full">
                              <Image src={dish.imageUrl} alt={dish.name} fill className="object-cover" sizes="48px" />
                            </div>
                          ) : (
                            <span className="text-2xl">🍽️</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate">{dish.name}</p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{dish.restaurantName}</p>
                        </div>
                        {dish.price > 0 && (
                          <span className="text-sm font-bold text-orange-600 flex-shrink-0 bg-orange-50 px-2 py-1 rounded-lg">
                            ₹{dish.price}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
