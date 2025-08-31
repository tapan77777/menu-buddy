'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [showAdminButton, setShowAdminButton] = useState(false);

  const handleLogoClick = () => {
    setShowAdminButton(!showAdminButton);
  };

  return (
    <header className="bg-gradient-to-r from-red-800 via-red-600 to-red-400 shadow-md relative overflow-hidden">
      <div className="container mx-auto px-2 sm:px-6 lg:px-8 py-4 flex items-center gap-3 relative">
        {/* Logo - Clickable */}
        <div className="relative">
          <Image
  src="/favicon-alt.ico"
  alt="MenuBuddy Logo"
  width={40}   // w-10 = 40px
  height={40}  // h-10 = 40px
  className="w-10 h-10 rounded-full shadow-lg ring-2 ring-white cursor-pointer hover:scale-110 transition-transform duration-200"
  onClick={handleLogoClick}
/>
          
          {/* Admin Button - Slides from logo to left */}
          <div className={`absolute top-0 transition-all duration-500 ease-out ${
            showAdminButton 
              ? 'right-[-230px] opacity-100 scale-100' 
              : 'right-0 opacity-0 scale-75 pointer-events-none'
          }`}>
            <Link 
              href="/login"
              className="flex items-center gap-1 bg-white/90 backdrop-blur-sm text-red-600 px-2 py-1 rounded-full text-sm font-semibold hover:bg-white hover:scale-105 transition-all duration-200 shadow-lg border border-white/20"
            >
              <span className="text-xs">👤</span>
              Admin
            </Link>
          </div>
          {/* Owner Button - Slides from logo to left */}
          <div className={`absolute top-0 transition-all duration-500 ease-out ${
            showAdminButton 
              ? 'right-[-320px] opacity-100 scale-100' 
              : 'right-0 opacity-0 scale-75 pointer-events-none'
          }`}>
            <Link 
              href="/owner"
              className="flex items-center gap-1 bg-white/90 backdrop-blur-sm text-red-600 px-2 py-1 rounded-full text-sm font-semibold hover:bg-white hover:scale-105 transition-all duration-200 shadow-lg border border-white/20"
            >
              <span className="text-xs">👤</span>
              Owner
            </Link>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-white">MenuBuddy</h1>

        {/* Click outside to close */}
        {showAdminButton && (
          <div 
            className="fixed inset-0 z-[-1]" 
            onClick={() => setShowAdminButton(false)}
          />
        )}
      </div>
    </header>
  );
}