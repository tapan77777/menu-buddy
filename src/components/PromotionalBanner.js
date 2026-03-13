'use client';

import Image from 'next/image';

const quickActions = [
  {
    label: 'Up to ₹200 OFF',
    subtitle: 'On first order',
    icon: '🏷️',
    bg: 'bg-orange-50',
    iconBg: 'bg-orange-100',
    border: 'border-orange-100',
  },
  {
    label: 'Fast Delivery',
    subtitle: '15–30 mins',
    icon: '⚡',
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    border: 'border-amber-100',
  },
  {
    label: 'Top Rated',
    subtitle: '4.5+ only',
    icon: '⭐',
    bg: 'bg-yellow-50',
    iconBg: 'bg-yellow-100',
    border: 'border-yellow-100',
  },
];

const categories = [
  { emoji: '🍕', label: 'Pizza' },
  { emoji: '🍔', label: 'Burgers' },
  { emoji: '🍜', label: 'Noodles' },
  { emoji: '🥗', label: 'Healthy' },
  { emoji: '🍗', label: 'Chicken' },
  { emoji: '🍰', label: 'Desserts' },
  { emoji: '🥤', label: 'Drinks' },
  { emoji: '🍱', label: 'Combos' },
];

export default function PromotionalBanner({ promo }) {
  if (!promo) return null;

  return (
    <section className="w-full">

      {/* ── Hero Banner ── */}
      <div className="relative h-60 sm:h-72 overflow-hidden">

        {/* Background photo */}
        <Image
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80&fm=webp"
          alt="Delicious food spread"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105 hover:scale-100 transition-transform duration-700"
        />

        {/* Depth gradient — dark bottom, lighter top */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/15" />
        {/* Side vignette for warmth */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-950/30 via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between px-5 pt-5 pb-6">

          {/* Top — glassmorphism pill badges */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/25 shadow-sm">
              ⚡ Fast Delivery
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/25 shadow-sm">
              ⭐ Top Rated
            </span>
            <span className="inline-flex items-center gap-1.5 bg-orange-500/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
              🏷️ Best Offers
            </span>
          </div>

          {/* Bottom — headline + stats */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white leading-[1.1] mb-1.5 drop-shadow-lg">
              Discover Great Food
              <span className="block text-orange-300 italic">Near You</span>
            </h1>
            <p className="text-white/75 text-sm font-medium mb-4 tracking-wide">
              Scan menus, explore restaurants, and order instantly
            </p>

            {/* Stats row */}
            <div className="flex gap-5">
              <div className="flex items-center gap-1.5">
                <span className="text-base">🕐</span>
                <span className="text-white/90 text-xs font-semibold">15–30 min</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-base">🍽️</span>
                <span className="text-white/90 text-xs font-semibold">100+ menus</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-base">📱</span>
                <span className="text-white/90 text-xs font-semibold">Scan & Order</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Quick Action Cards — float over banner ── */}
      <div className="px-4 -mt-5 relative z-20">
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action, i) => (
            <div
              key={i}
              className={`${action.bg} border ${action.border} rounded-2xl p-3.5 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer`}
            >
              <div className={`${action.iconBg} w-9 h-9 rounded-xl flex items-center justify-center mb-2 text-lg`}>
                {action.icon}
              </div>
              <p className="text-xs font-bold text-gray-800 leading-tight">{action.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{action.subtitle}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Category Scroll ── */}
      <div className="px-4 mt-6">
        <h2 className="text-base font-bold text-gray-800 mb-3">What are you craving?</h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat, i) => (
            <div
              key={i}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:shadow-md group-hover:border-orange-200 transition-all duration-200">
                {cat.emoji}
              </div>
              <span className="text-xs text-gray-600 font-medium">{cat.label}</span>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
