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

export default function FoodCategories({ onSelect }) {
  const [active, setActive] = useState(null);

  function handleClick(label) {
    setActive(prev => (prev === label ? null : label));
    onSelect?.(label);
  }

  return (
    <section className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
        <div
          className="flex gap-2 sm:gap-3 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {CATEGORIES.map(({ label, emoji }) => {
            const isActive = active === label;
            return (
              <button
                key={label}
                onClick={() => handleClick(label)}
                className={`
                  flex-shrink-0 flex flex-col items-center gap-1.5
                  w-16 sm:w-20 py-3 rounded-2xl
                  border-2 transition-all duration-150 active:scale-95
                  ${isActive
                    ? "bg-orange-500 border-orange-500 shadow-md shadow-orange-200"
                    : "bg-gray-50 border-transparent hover:bg-orange-50 hover:border-orange-200"}
                `}
              >
                <span className="text-3xl leading-none">{emoji}</span>
                <span className={`text-[11px] font-semibold whitespace-nowrap leading-none ${isActive ? "text-white" : "text-gray-600"}`}>
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
