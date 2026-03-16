"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const DEBOUNCE_MS = 300;
const QUICK_CHIPS = ["Biryani", "Pizza", "Burger", "Coffee", "Thali", "Momos"];

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
    <section className="relative min-h-[54vh] sm:min-h-[60vh] flex items-center overflow-hidden">

      {/* ── Background: deep red → warm orange (aligned with MenuBuddy brand) ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3b0a0a] via-[#9b1c1c] to-[#c2410c]" />

      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px",
        }}
      />

      {/* Ambient light blobs */}
      <div className="absolute -top-20 -right-20 w-[420px] h-[420px] bg-red-400/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[380px] h-[380px] bg-orange-700/20 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[180px] bg-red-600/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Floating food emoji decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
        <span className="absolute top-[12%] left-[6%]  text-4xl opacity-20 animate-float">🍕</span>
        <span className="absolute top-[18%] right-[8%] text-3xl opacity-15 animate-float-delayed">🍔</span>
        <span className="absolute bottom-[22%] left-[12%] text-3xl opacity-15 animate-float-delayed">🍜</span>
        <span className="absolute bottom-[14%] right-[7%] text-4xl opacity-20 animate-float">🍛</span>
        <span className="absolute top-[55%] right-[3%]  text-2xl opacity-10 animate-float">☕</span>
        <span className="absolute top-[65%] left-[4%]  text-2xl opacity-10 animate-float-delayed">🍰</span>
        <span className="absolute top-[8%]  left-[45%] text-3xl opacity-10 animate-float">🌯</span>
      </div>

      {/* ── Content ── */}
      <div className="relative w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-2xl mx-auto text-center">

          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-orange-200 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/10 mb-5">
            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse inline-block" />
            MenuBuddy Discovery
          </div>

          {/* Heading */}
          <h1 className="text-white font-extrabold leading-[1.1] mb-4 drop-shadow-lg">
            <span className="block text-4xl sm:text-5xl lg:text-6xl">What are you</span>
            <span className="block text-4xl sm:text-5xl lg:text-6xl text-orange-300 mt-1">craving?</span>
          </h1>

          <p className="text-red-200/80 text-sm sm:text-base mb-8 max-w-md mx-auto leading-relaxed">
            Search dishes across nearby restaurants and discover what&apos;s trending today.
          </p>

          {/* ── Search box ── */}
          <div ref={wrapperRef} className="relative">
            <div className="flex items-center bg-white rounded-2xl shadow-2xl shadow-black/30 px-5 py-4 gap-3 focus-within:ring-2 focus-within:ring-orange-400 focus-within:ring-offset-2 transition-all duration-200 group">
              <svg
                className="w-5 h-5 text-orange-400 flex-shrink-0 group-focus-within:text-orange-500 transition-colors"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}
              >
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

          {/* Quick-search chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => setQuery(chip)}
                className="text-xs font-semibold text-orange-200/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/25 px-3 py-1.5 rounded-full transition-all"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave → connects to white FoodCategories section */}
      <div className="absolute bottom-0 left-0 right-0 leading-none pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 1440 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
          <path d="M0 44L1440 44L1440 22C1200 2 960 42 720 22C480 2 240 42 0 22L0 44Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
