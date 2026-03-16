'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <Image
            src="/favicon-alt.ico"
            alt="MenuBuddy"
            width={36}
            height={36}
            className="rounded-xl shadow-sm ring-1 ring-orange-100"
          />
          <span className="text-xl font-extrabold tracking-tight leading-none">
            <span className="text-gray-900">Menu</span>
            <span className="text-orange-500">Buddy</span>
          </span>
        </Link>

        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-2">
          <Link
            href="/owner"
            className="text-sm font-semibold text-gray-500 hover:text-orange-600 px-3 py-2 rounded-xl hover:bg-orange-50 transition-all"
          >
            List your restaurant
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors shadow-sm shadow-orange-200"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Admin
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
          onClick={() => setDrawerOpen(true)}
          aria-label="Menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 sm:hidden" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="absolute top-0 right-0 bottom-0 w-64 bg-white shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className="font-extrabold text-gray-900">
                Menu<span className="text-orange-500">Buddy</span>
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col p-4 gap-2">
              <Link
                href="/owner"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 font-semibold hover:bg-orange-50 hover:text-orange-600 transition-colors"
              >
                <span>🏪</span> List your restaurant
              </Link>
              <Link
                href="/login"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors"
              >
                <span>👤</span> Admin Login
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
