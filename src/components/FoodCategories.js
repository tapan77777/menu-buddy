"use client";

import { useState } from "react";

const CATEGORIES = [
  { label: "Biryani",   emoji: "🍛" },
  { label: "Pizza",     emoji: "🍕" },
  { label: "Burger",    emoji: "🍔" },
  { label: "Chinese",   emoji: "🥢" },
  { label: "Pasta",     emoji: "🍝" },
  { label: "Sandwich",  emoji: "🥪" },
  { label: "Desserts",  emoji: "🍰" },
  { label: "Coffee",    emoji: "☕" },
  { label: "Juice",     emoji: "🥤" },
  { label: "Rolls",     emoji: "🌯" },
  { label: "Noodles",   emoji: "🍜" },
  { label: "Thali",     emoji: "🍱" },
];

// Doubled for seamless infinite loop — translateX(-50%) === one full set
const DOUBLED = [...CATEGORIES, ...CATEGORIES];

export default function FoodCategories({ onSelect }) {
  const [active, setActive] = useState(null);

  function handleClick(label) {
    setActive((prev) => (prev === label ? null : label));
    onSelect?.(label);
  }

  return (
    <section className="bg-white border-b border-gray-100 py-4 sm:py-5">
      {/* Section label */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.12em]">Browse by Category</p>
      </div>

      {/* Marquee track */}
      <div className="overflow-hidden relative">
        {/* Fade masks */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-16 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-16 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none" />

        <div className="animate-marquee flex gap-3 sm:gap-4 px-6 w-max">
          {DOUBLED.map(({ label, emoji }, i) => {
            const isActive = active === label;
            return (
              <button
                key={`${label}-${i}`}
                onClick={() => handleClick(label)}
                className={`
                  flex-shrink-0 flex flex-col items-center gap-1.5
                  w-[68px] sm:w-20 py-3 rounded-2xl border-2
                  transition-all duration-200 active:scale-90
                  ${isActive
                    ? "bg-gradient-to-br from-red-600 to-orange-500 border-red-500 shadow-lg shadow-red-200/60 scale-105"
                    : "bg-gray-50 border-transparent hover:bg-red-50 hover:border-red-200 hover:scale-105"
                  }
                `}
              >
                <span className="text-3xl leading-none">{emoji}</span>
                <span className={`text-[10px] sm:text-[11px] font-bold whitespace-nowrap leading-none ${isActive ? "text-white" : "text-gray-600"}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
