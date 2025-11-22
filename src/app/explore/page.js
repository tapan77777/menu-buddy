"use client";
import { Check, ChevronRight, Clock, Menu, Settings, Smartphone, Star, TrendingUp, Users, X } from 'lucide-react';
import { useState } from 'react';

export default function MenuBuddyLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* NAVIGATION BAR */}
      <nav className="fixed top-0 w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-2xl font-bold text-orange-600">MenuBuddy</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#about" className="text-gray-700 hover:text-orange-600 transition">About Us</a>
              <a href="#customers" className="text-gray-700 hover:text-orange-600 transition">Customers</a>
              <a href="#merchants" className="text-gray-700 hover:text-orange-600 transition">Merchants</a>
              <a href="#contact" className="text-gray-700 hover:text-orange-600 transition">Contact Us</a>
              <button className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition">
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-700">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 pt-2 pb-4 space-y-2">
              <a href="#about" className="block py-2 text-gray-700 hover:text-orange-600">About Us</a>
              <a href="#customers" className="block py-2 text-gray-700 hover:text-orange-600">Customers</a>
              <a href="#merchants" className="block py-2 text-gray-700 hover:text-orange-600">Merchants</a>
              <a href="#contact" className="block py-2 text-gray-700 hover:text-orange-600">Contact Us</a>
              <button className="w-full bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 mt-2">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Stop Losing Customers to Menu Confusion
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8">
              The digital menu platform that helps diners decide faster and restaurants attract more customers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-700 transition flex items-center justify-center">
                For Restaurants <ChevronRight className="ml-2" />
              </button>
              <button className="bg-white text-orange-600 border-2 border-orange-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-50 transition">
                Explore as Diner
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* THE PROBLEM SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              The Problem We are Solving
            </h2>
            <p className="text-xl text-gray-600">
              Busy food streets, endless options, but no clarity
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">

           {/* For Diners */}
<div className="relative bg-gradient-to-br from-red-50 via-red-100 to-red-50 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:rotate-1 perspective-1000 group overflow-hidden">
  {/* Animated background circles */}
  <div className="absolute top-0 right-0 w-32 h-32 bg-red-200 rounded-full opacity-20 blur-2xl animate-pulse"></div>
  <div className="absolute bottom-0 left-0 w-40 h-40 bg-red-300 rounded-full opacity-20 blur-3xl animate-pulse delay-700"></div>
  
  {/* Floating gradient orb */}
  <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-red-400 to-orange-500 rounded-full opacity-30 blur-xl animate-[float_4s_ease-in-out_infinite]"></div>
  
  <div className="relative z-10">
    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
      <span className="text-4xl mr-3 animate-[bounce_2s_ease-in-out_infinite] drop-shadow-lg transform hover:scale-125 transition-transform duration-300">😕</span>
      <span className="bg-gradient-to-r from-gray-900 to-red-800 bg-clip-text text-transparent">For Diners</span>
    </h3>
    
    <ul className="space-y-4">
      <li className="flex items-start opacity-0 animate-[slideInRotate_0.8s_ease-out_0.1s_forwards] hover:translate-x-2 transition-transform duration-300">
        <div className="relative">
          <X className="text-red-600 mr-3 mt-1 flex-shrink-0 animate-[spin_3s_linear_infinite] drop-shadow-md" size={20} />
          <div className="absolute inset-0 bg-red-400 rounded-full blur-md opacity-50 animate-ping"></div>
        </div>
        <span className="text-gray-700 hover:text-gray-900 transition-colors">No easy way to compare nearby restaurant menus</span>
      </li>
      
      <li className="flex items-start opacity-0 animate-[slideInRotate_0.8s_ease-out_0.3s_forwards] hover:translate-x-2 transition-transform duration-300">
        <div className="relative">
          <X className="text-red-600 mr-3 mt-1 flex-shrink-0 animate-[spin_3s_linear_infinite] drop-shadow-md" size={20} />
          <div className="absolute inset-0 bg-red-400 rounded-full blur-md opacity-50 animate-ping"></div>
        </div>
        <span className="text-gray-700 hover:text-gray-900 transition-colors">Confusion about food variety, pricing, and availability</span>
      </li>
      
      <li className="flex items-start opacity-0 animate-[slideInRotate_0.8s_ease-out_0.5s_forwards] hover:translate-x-2 transition-transform duration-300">
        <div className="relative">
          <X className="text-red-600 mr-3 mt-1 flex-shrink-0 animate-[spin_3s_linear_infinite] drop-shadow-md" size={20} />
          <div className="absolute inset-0 bg-red-400 rounded-full blur-md opacity-50 animate-ping"></div>
        </div>
        <span className="text-gray-700 hover:text-gray-900 transition-colors">Time wasted walking place to place checking menus</span>
      </li>
      
      <li className="flex items-start opacity-0 animate-[slideInRotate_0.8s_ease-out_0.7s_forwards] hover:translate-x-2 transition-transform duration-300">
        <div className="relative">
          <X className="text-red-600 mr-3 mt-1 flex-shrink-0 animate-[spin_3s_linear_infinite] drop-shadow-md" size={20} />
          <div className="absolute inset-0 bg-red-400 rounded-full blur-md opacity-50 animate-ping"></div>
        </div>
        <span className="text-gray-700 hover:text-gray-900 transition-colors">Decision paralysis in tourist spots and crowded food streets</span>
      </li>
    </ul>
  </div>
  
  {/* 3D border effect */}
  <div className="absolute inset-0 rounded-2xl border-2 border-red-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform group-hover:scale-105"></div>
</div>

<style jsx>{`
  @keyframes slideInRotate {
    from {
      opacity: 0;
      transform: translateX(-30px) rotateY(-15deg);
    }
    to {
      opacity: 1;
      transform: translateX(0) rotateY(0deg);
    }
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
    }
    50% {
      transform: translateY(-20px) rotate(5deg);
    }
  }
  
  .perspective-1000 {
    perspective: 1000px;
  }
  
  .delay-700 {
    animation-delay: 0.7s;
  }
`}</style>

        {/* For Restaurants */}

<div className="relative bg-gradient-to-br from-red-50 via-orange-50 to-red-50 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-rotate-1 perspective-1000 group overflow-hidden">
  {/* Animated background circles */}
  <div className="absolute top-0 left-0 w-36 h-36 bg-orange-200 rounded-full opacity-20 blur-2xl animate-pulse"></div>
  <div className="absolute bottom-0 right-0 w-44 h-44 bg-red-300 rounded-full opacity-20 blur-3xl animate-pulse delay-500"></div>
  
  {/* Floating gradient orb */}
  <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-gradient-to-br from-orange-400 to-red-500 rounded-full opacity-30 blur-xl animate-[floatReverse_4s_ease-in-out_infinite]"></div>
  
  <div className="relative z-10">
    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
      <span className="text-4xl mr-3 animate-[shake_2s_ease-in-out_infinite] drop-shadow-lg transform hover:scale-125 transition-transform duration-300">🛑</span>
      <span className="bg-gradient-to-r from-gray-900 to-orange-800 bg-clip-text text-transparent">For Restaurants</span>
    </h3>
    
    <ul className="space-y-4">
      <li className="flex items-start opacity-0 animate-[slideInRotate_0.8s_ease-out_0.2s_forwards] hover:translate-x-2 transition-transform duration-300">
        <div className="relative">
          <X className="text-red-600 mr-3 mt-1 flex-shrink-0 animate-[spin_3s_linear_infinite] drop-shadow-md" size={20} />
          <div className="absolute inset-0 bg-red-400 rounded-full blur-md opacity-50 animate-ping"></div>
        </div>
        <span className="text-gray-700 hover:text-gray-900 transition-colors">Printed menus are expensive and hard to update</span>
      </li>
      
      <li className="flex items-start opacity-0 animate-[slideInRotate_0.8s_ease-out_0.4s_forwards] hover:translate-x-2 transition-transform duration-300">
        <div className="relative">
          <X className="text-red-600 mr-3 mt-1 flex-shrink-0 animate-[spin_3s_linear_infinite] drop-shadow-md" size={20} />
          <div className="absolute inset-0 bg-red-400 rounded-full blur-md opacity-50 animate-ping"></div>
        </div>
        <span className="text-gray-700 hover:text-gray-900 transition-colors">Customers keep asking the same questions about dishes</span>
      </li>
      
      <li className="flex items-start opacity-0 animate-[slideInRotate_0.8s_ease-out_0.6s_forwards] hover:translate-x-2 transition-transform duration-300">
        <div className="relative">
          <X className="text-red-600 mr-3 mt-1 flex-shrink-0 animate-[spin_3s_linear_infinite] drop-shadow-md" size={20} />
          <div className="absolute inset-0 bg-red-400 rounded-full blur-md opacity-50 animate-ping"></div>
        </div>
        <span className="text-gray-700 hover:text-gray-900 transition-colors">No online presence = losing walk-in customers</span>
      </li>
      
      <li className="flex items-start opacity-0 animate-[slideInRotate_0.8s_ease-out_0.8s_forwards] hover:translate-x-2 transition-transform duration-300">
        <div className="relative">
          <X className="text-red-600 mr-3 mt-1 flex-shrink-0 animate-[spin_3s_linear_infinite] drop-shadow-md" size={20} />
          <div className="absolute inset-0 bg-red-400 rounded-full blur-md opacity-50 animate-ping"></div>
        </div>
        <span className="text-gray-700 hover:text-gray-900 transition-colors">Difficulty attracting customers in competitive areas</span>
      </li>
    </ul>
  </div>
  
  {/* 3D border effect */}
  <div className="absolute inset-0 rounded-2xl border-2 border-orange-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform group-hover:scale-105"></div>
</div>

<style jsx>{`
  @keyframes slideInRotate {
    from {
      opacity: 0;
      transform: translateX(-30px) rotateY(-15deg);
    }
    to {
      opacity: 1;
      transform: translateX(0) rotateY(0deg);
    }
  }
  
  @keyframes floatReverse {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
    }
    50% {
      transform: translateY(20px) rotate(-5deg);
    }
  }
  
  @keyframes shake {
    0%, 100% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(-5deg);
    }
    75% {
      transform: rotate(5deg);
    }
  }
  
  .perspective-1000 {
    perspective: 1000px;
  }
  
  .delay-500 {
    animation-delay: 0.5s;
  }
`}</style>


          </div>
        </div>
      </section>

      {/* THE SOLUTION SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How MenuBuddy Solves This
            </h2>
            <p className="text-xl text-gray-600">
              One platform, two powerful solutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* For Diners Solution */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold text-orange-600 mb-6">🌐 For Diners</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Check className="text-green-600 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700">One digital platform to explore multiple nearby restaurants</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-green-600 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700">View complete menus with photos, prices, and categories</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-green-600 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700">Make quick, informed choices without asking anyone</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-green-600 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700">Save time and avoid frustration when dining out</span>
                </li>
              </ul>
            </div>

           {/* For Restaurants Solution */}
<div className="relative bg-gradient-to-br from-white via-orange-50 to-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:rotate-1 perspective-1000 group overflow-hidden border-2 border-orange-200">
  {/* Animated success wave effect */}
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-200 to-transparent opacity-0 group-hover:opacity-30 animate-[wave_2s_ease-in-out_infinite] skew-x-12"></div>
  
  {/* Floating sparkles */}
  <div className="absolute top-4 right-4 w-3 h-3 bg-green-400 rounded-full animate-[sparkle_2s_ease-in-out_infinite]"></div>
  <div className="absolute top-12 right-12 w-2 h-2 bg-orange-400 rounded-full animate-[sparkle_2s_ease-in-out_0.5s_infinite]"></div>
  <div className="absolute bottom-8 left-8 w-2 h-2 bg-green-500 rounded-full animate-[sparkle_2s_ease-in-out_1s_infinite]"></div>
  
  {/* Glowing orbs */}
  <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-orange-300 to-green-300 rounded-full opacity-20 blur-3xl animate-[pulse_3s_ease-in-out_infinite]"></div>
  <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-gradient-to-br from-green-300 to-orange-300 rounded-full opacity-20 blur-3xl animate-[pulse_3s_ease-in-out_1.5s_infinite]"></div>
  
  <div className="relative z-10">
    <h3 className="text-2xl font-bold text-orange-600 mb-6 flex items-center">
      <span className="text-4xl mr-3 animate-[cookBounce_2s_ease-in-out_infinite] drop-shadow-lg transform hover:scale-125 transition-transform duration-300 filter brightness-110">🧑‍🍳</span>
      <span className="bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent animate-[shimmer_3s_ease-in-out_infinite]">
        For Restaurants
      </span>
    </h3>
    
    <ul className="space-y-4">
      <li className="flex items-start opacity-0 animate-[popIn_0.6s_ease-out_0.2s_forwards] hover:translate-x-3 transition-all duration-300 group/item">
        <div className="relative">
          <Check className="text-green-600 mr-3 mt-1 flex-shrink-0 animate-[checkPop_2s_ease-in-out_infinite] drop-shadow-lg group-hover/item:scale-125 transition-transform" size={20} />
          <div className="absolute inset-0 bg-green-400 rounded-full blur-md opacity-40 animate-[ping_2s_ease-in-out_infinite]"></div>
          {/* Success ripple */}
          <div className="absolute inset-0 bg-green-300 rounded-full opacity-0 group-hover/item:opacity-50 group-hover/item:animate-ping"></div>
        </div>
        <span className="text-gray-700 group-hover/item:text-gray-900 group-hover/item:font-medium transition-all duration-300">
          Easy-to-use admin dashboard to manage menus in real-time
        </span>
      </li>
      
      <li className="flex items-start opacity-0 animate-[popIn_0.6s_ease-out_0.4s_forwards] hover:translate-x-3 transition-all duration-300 group/item">
        <div className="relative">
          <Check className="text-green-600 mr-3 mt-1 flex-shrink-0 animate-[checkPop_2s_ease-in-out_0.3s_infinite] drop-shadow-lg group-hover/item:scale-125 transition-transform" size={20} />
          <div className="absolute inset-0 bg-green-400 rounded-full blur-md opacity-40 animate-[ping_2s_ease-in-out_0.3s_infinite]"></div>
          <div className="absolute inset-0 bg-green-300 rounded-full opacity-0 group-hover/item:opacity-50 group-hover/item:animate-ping"></div>
        </div>
        <span className="text-gray-700 group-hover/item:text-gray-900 group-hover/item:font-medium transition-all duration-300">
          Upload photos, change prices, update availability—anytime
        </span>
      </li>
      
      <li className="flex items-start opacity-0 animate-[popIn_0.6s_ease-out_0.6s_forwards] hover:translate-x-3 transition-all duration-300 group/item">
        <div className="relative">
          <Check className="text-green-600 mr-3 mt-1 flex-shrink-0 animate-[checkPop_2s_ease-in-out_0.6s_infinite] drop-shadow-lg group-hover/item:scale-125 transition-transform" size={20} />
          <div className="absolute inset-0 bg-green-400 rounded-full blur-md opacity-40 animate-[ping_2s_ease-in-out_0.6s_infinite]"></div>
          <div className="absolute inset-0 bg-green-300 rounded-full opacity-0 group-hover/item:opacity-50 group-hover/item:animate-ping"></div>
        </div>
        <span className="text-gray-700 group-hover/item:text-gray-900 group-hover/item:font-medium transition-all duration-300">
          Highlight daily specials, offers, or bestsellers
        </span>
      </li>
      
      <li className="flex items-start opacity-0 animate-[popIn_0.6s_ease-out_0.8s_forwards] hover:translate-x-3 transition-all duration-300 group/item">
        <div className="relative">
          <Check className="text-green-600 mr-3 mt-1 flex-shrink-0 animate-[checkPop_2s_ease-in-out_0.9s_infinite] drop-shadow-lg group-hover/item:scale-125 transition-transform" size={20} />
          <div className="absolute inset-0 bg-green-400 rounded-full blur-md opacity-40 animate-[ping_2s_ease-in-out_0.9s_infinite]"></div>
          <div className="absolute inset-0 bg-green-300 rounded-full opacity-0 group-hover/item:opacity-50 group-hover/item:animate-ping"></div>
        </div>
        <span className="text-gray-700 group-hover/item:text-gray-900 group-hover/item:font-medium transition-all duration-300">
          Create digital presence without hiring a developer
        </span>
      </li>
    </ul>
  </div>
  
  {/* 3D border glow effect */}
  <div className="absolute inset-0 rounded-2xl border-2 border-green-400 opacity-0 group-hover:opacity-60 transition-opacity duration-500 transform group-hover:scale-105 shadow-[0_0_30px_rgba(34,197,94,0.5)]"></div>
  
  {/* Success particles on hover */}
  <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-[particle1_1.5s_ease-out_infinite]"></div>
  <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-[particle2_1.5s_ease-out_infinite]"></div>
  <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-[particle3_1.5s_ease-out_infinite]"></div>
</div>

<style jsx>{`
  @keyframes popIn {
    0% {
      opacity: 0;
      transform: translateY(20px) scale(0.8);
    }
    50% {
      transform: translateY(-5px) scale(1.05);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @keyframes checkPop {
    0%, 100% {
      transform: scale(1) rotate(0deg);
    }
    50% {
      transform: scale(1.2) rotate(10deg);
    }
  }
  
  @keyframes wave {
    0% {
      transform: translateX(-100%) skewX(-12deg);
    }
    100% {
      transform: translateX(200%) skewX(-12deg);
    }
  }
  
  @keyframes sparkle {
    0%, 100% {
      opacity: 0;
      transform: scale(0) rotate(0deg);
    }
    50% {
      opacity: 1;
      transform: scale(1.5) rotate(180deg);
    }
  }
  
  @keyframes shimmer {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }
  
  @keyframes cookBounce {
    0%, 100% {
      transform: translateY(0) rotate(0deg);
    }
    25% {
      transform: translateY(-10px) rotate(-5deg);
    }
    75% {
      transform: translateY(-5px) rotate(5deg);
    }
  }
  
  @keyframes particle1 {
    0% {
      transform: translate(-50%, -50%) translate(0, 0);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) translate(40px, -40px);
      opacity: 0;
    }
  }
  
  @keyframes particle2 {
    0% {
      transform: translate(-50%, -50%) translate(0, 0);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) translate(-40px, -40px);
      opacity: 0;
    }
  }
  
  @keyframes particle3 {
    0% {
      transform: translate(-50%, -50%) translate(0, 0);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) translate(0, -50px);
      opacity: 0;
    }
  }
  
  .perspective-1000 {
    perspective: 1000px;
  }
`}</style>
          </div>
        </div>
      </section>

      {/* KEY FEATURES SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features Built for Modern Dining
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards - Easy to customize */}
            <FeatureCard 
              icon={<Smartphone className="text-orange-600" size={32} />}
              title="Real-Time Menu Updates"
              description="Change prices, add items, or mark dishes unavailable instantly—no reprinting needed"
            />
            <FeatureCard 
              icon={<Star className="text-orange-600" size={32} />}
              title="Photo-Rich Menus"
              description="Showcase your dishes with beautiful photos that attract hungry customers"
            />
            <FeatureCard 
              icon={<Users className="text-orange-600" size={32} />}
              title="Location Discovery"
              description="Help nearby diners find your restaurant when they're looking for where to eat"
            />
            <FeatureCard 
              icon={<Settings className="text-orange-600" size={32} />}
              title="No-Code Dashboard"
              description="Manage everything yourself—no technical skills or developers required"
            />
            <FeatureCard 
              icon={<TrendingUp className="text-orange-600" size={32} />}
              title="Highlight Specials"
              description="Promote daily deals, chef's specials, and bestsellers to drive more orders"
            />
            <FeatureCard 
              icon={<Clock className="text-orange-600" size={32} />}
              title="Save Time & Money"
              description="Eliminate printing costs and reduce repetitive customer questions"
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600">
              No tech skills needed—just good food to share
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard 
              number="1"
              title="Sign Up Free"
              description="Create your restaurant account in minutes. Simple registration, no credit card required."
            />
            <StepCard 
              number="2"
              title="Build Your Menu"
              description="Upload dishes, add photos and prices. Our dashboard makes it easy and intuitive."
            />
            <StepCard 
              number="3"
              title="Go Live"
              description="Share your MenuBuddy link and watch customers discover your delicious offerings!"
            />
          </div>

          <div className="text-center mt-12">
            <button className="bg-orange-600 text-white px-10 py-4 rounded-lg text-lg font-semibold hover:bg-orange-700 transition">
              Start Building Your Digital Menu
            </button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Loved by Restaurants & Diners
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial Cards - Easy to add more */}
            <TestimonialCard 
              quote="MenuBuddy helped us attract 40% more walk-in customers. Diners love browsing our menu before stepping in!"
              author="Rajesh Kumar"
              restaurant="Spice Garden Restaurant"
            />
            <TestimonialCard 
              quote="No more reprinting menus every week! We update specials daily and customers see it instantly."
              author="Priya Sharma"
              restaurant="Café Aroma"
            />
            <TestimonialCard 
              quote="As a foodie, MenuBuddy saves me so much time. I can check 10 restaurants in 2 minutes!"
              author="Amit Patel"
              restaurant="Food Enthusiast"
            />
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-600 to-orange-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Transform Your Restaurants Digital Presence?
          </h2>
          <p className="text-xl mb-8 text-orange-100">
            Join hundreds of restaurants already using MenuBuddy to attract more customers
          </p>
          <button className="bg-white text-orange-600 px-10 py-4 rounded-lg text-lg font-semibold hover:bg-orange-50 transition">
            Get Started for Free
          </button>
          <p className="mt-4 text-orange-100">No credit card required • Setup in 5 minutes</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">MenuBuddy</h3>
              <p className="text-gray-400">Simplifying dining decisions, empowering restaurants</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">For Restaurants</a></li>
                <li><a href="#" className="hover:text-white">For Diners</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-white">About Us</a></li>
                <li><a href="#contact" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MenuBuddy. Built with MERN Stack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// REUSABLE COMPONENTS - Easy to customize

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 text-white rounded-full text-2xl font-bold mb-4">
        {number}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function TestimonialCard({ quote, author, restaurant }) {
  return (
    <div className="bg-orange-50 p-6 rounded-xl">
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="text-yellow-500 fill-current" size={20} />
        ))}
      </div>
      <p className="text-gray-700 mb-4 italic">{quote}</p>
      <div>
        <p className="font-semibold text-gray-900">{author}</p>
        <p className="text-gray-600 text-sm">{restaurant}</p>
      </div>
    </div>
  );
}