'use client'
import { useState } from 'react';

export default function PromotionalBanner({ promo }) {
  const [activeSlide, setActiveSlide] = useState(0);

  if (!promo) return null;

  const mainBanners = [
    {
      gradient: "from-orange-500 via-red-500 to-pink-500",
      title: "JANTASTIC BITES",
      subtitle: "Delicious meals delivered fast",
      cta: "ORDER NOW",
      icon: "🍔",
      image: "/burger.jpg"
    },
    {
      gradient: "from-purple-500 via-indigo-500 to-blue-500",
      title: "FLAT ₹200 OFF",
      subtitle: "On your first order",
      cta: "CLAIM NOW",
      icon: "🎉",
      image: "/food.jpg"
    }
  ];

  const quickActions = [
    { label: "Flat ₹200 OFF", subtitle: "& More", icon: "💰", color: "bg-orange-100" },
    { label: "Meals", subtitle: "At ₹99", icon: "🍱", color: "bg-yellow-100" },
    { label: "Food In", subtitle: "10 Mins", icon: "⚡", color: "bg-green-100" }
  ];

  const restaurants = [
    { name: "Pizza Palace", offer: "50% OFF", time: "25 mins", rating: "4.3", image: "/pizza.jpg" },
    { name: "Burger King", offer: "₹100 OFF", time: "20 mins", rating: "4.5", image: "/burger.jpg" },
    { name: "Chai Corner", offer: "40% OFF", time: "15 mins", rating: "4.2", image: "/chai.jpg" },
    { name: "Biryani House", offer: "₹150 OFF", time: "30 mins", rating: "4.6", image: "/biryani.jpg" },
    { name: "Dosa Point", offer: "35% OFF", time: "18 mins", rating: "4.4", image: "/dosa.jpg" }
  ];

  return (
    <section className="w-full relative overflow-hidden mx-0 my-0">
      {/* Main Hero Banner */}
      <div className="relative">
        <div className={`w-full h-48 bg-gradient-to-r ${mainBanners[activeSlide].gradient} relative overflow-hidden`}>
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-8 text-6xl animate-bounce">{mainBanners[activeSlide].icon}</div>
            <div className="absolute bottom-6 left-8 text-4xl animate-pulse">🍽️</div>
            <div className="absolute top-1/2 right-1/4 text-5xl opacity-60">✨</div>
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-between px-6">
            <div className="flex-1">
              <h1 className="text-3xl font-black text-white mb-2 leading-tight drop-shadow-lg">
                {mainBanners[activeSlide].title}
              </h1>
              <p className="text-white/90 text-sm mb-4">{mainBanners[activeSlide].subtitle}</p>
             
            </div>
            <div className="text-8xl opacity-90 animate-pulse">
              {mainBanners[activeSlide].icon}
            </div>
          </div>

          {/* Slide indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {mainBanners.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === activeSlide ? 'bg-white w-6' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="px-4 -mt-6 relative z-20">
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action, i) => (
            <div
              key={i}
              className={`${action.color} rounded-2xl p-4 shadow-lg hover:scale-105 transition-transform cursor-pointer`}
            >
              <div className="text-3xl mb-2">{action.icon}</div>
              <div className="text-xs font-bold text-gray-800">{action.label}</div>
              <div className="text-xs text-gray-600">{action.subtitle}</div>
            </div>
          ))}
        </div>
      </div>

      {/* What's on your mind section */}
      <div className="px-4 mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">What's on your mind?</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {['🍕', '🍔', '🍜', '🍰', '🥗', '🍗', '🌯', '🍱'].map((emoji, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center text-4xl hover:scale-110 transition-transform cursor-pointer"
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>

      
   

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce {
          animation: bounce 2s infinite;
        }
      `}</style>
    </section>
  );
}