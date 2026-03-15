'use client';

import HomeIconButton from '@/components/HomeIconButton';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const ItemDetailModal  = dynamic(() => import('@/components/ItemDetailModal'),  { ssr: false });
const CartModal        = dynamic(() => import('@/components/CartModal'),         { ssr: false });
const ImagePreviewModal = dynamic(() => import('@/components/ImagePreviewModal'), { ssr: false });

// ── Debounce hook ─────────────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// ── Veg / Non-veg dot indicator ───────────────────────────────────────────────
function VegIndicator({ category }) {
  const isVeg = category === 'veg';
  return (
    <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center bg-white ${
      isVeg ? 'border-green-600' : 'border-red-600'
    }`}>
      <div className={`w-2 h-2 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
    </div>
  );
}

const DEFAULT_CATEGORIES = [
  { id: 'veg',     label: 'Veg',      emoji: '🥗' },
  { id: 'non-veg', label: 'Non-Veg',  emoji: '🍗' },
  { id: 'starters',label: 'Starters', emoji: '🍢' },
  { id: 'special', label: 'Special',  emoji: '⭐' },
  { id: 'drinks',  label: 'Drinks',   emoji: '🥤' },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function MenuList({ restaurant, items = [], restaurantId, categories = [] }) {
  const searchParams = useSearchParams();
  const tableFromUrl = searchParams.get('table') ?? '';
  // Build a lookup map from the restaurant's category config (for emoji + display label).
  // Fall back to DEFAULT_CATEGORIES when the restaurant has no saved config yet.
  // Use (c.name ?? c.id) so both shapes work: restaurant categories have `name`,
  // DEFAULT_CATEGORIES have `id` — without this, all keys were "undefined".
  const configList = categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  const catConfigMap = Object.fromEntries(
    configList.map((c) => [(c.name ?? c.id).toLowerCase(), c])
  );

  // Derive the category list directly from the items that are actually on this menu.
  // This is the source of truth — it is always consistent with the items array and
  // is never affected by stale restaurant.categories cache or missing config entries.
  const uniqueCategoryNames = [
    ...new Set(
      items.map((i) => (i.category ?? '').trim().toLowerCase()).filter(Boolean)
    ),
  ];

  const CATEGORIES = [
    { id: 'all', label: 'All', emoji: '🍴' },
    ...uniqueCategoryNames.map((name) => {
      const cfg = catConfigMap[name];
      return {
        id: name,
        label: cfg
          ? cfg.name.charAt(0).toUpperCase() + cfg.name.slice(1)
          : name.charAt(0).toUpperCase() + name.slice(1),
        emoji: cfg?.emoji ?? '🍽️',
      };
    }),
  ];
  const [filter, setFilter]               = useState('all');
  const [searchQuery, setSearchQuery]     = useState('');
  const [selectedItem, setSelectedItem]   = useState(null);
  const [cartItems, setCartItems]         = useState([]);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [showCart, setShowCart]           = useState(false);
  // Tracks which item IDs had "Added" flashed recently
  const [flashedItems, setFlashedItems]   = useState(new Set());

  // One-time menu view tracking per session
  useEffect(() => {
    if (!restaurant?._id) return;
    const key = `viewed-${restaurant._id}`;
    if (!sessionStorage.getItem(key)) {
      fetch('/api/analytics/menu-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId: restaurant._id }),
      }).catch(() => {});
      sessionStorage.setItem(key, 'true');
    }
  }, [restaurant?._id]);

  // Clear cart on unmount
  useEffect(() => () => setCartItems([]), []);

  // ── Cart helpers ────────────────────────────────────────────────────────────
  const addToCart = useCallback((item) => {
    setCartItems((prev) => {
      const normalized = { ...item, quantity: item.quantity ?? 1 };
      const exists = prev.find((i) => i._id === normalized._id);
      if (exists) return prev;
      return [...prev, normalized];
    });
  }, []);

  const updateQuantity = useCallback((id, newQty) => {
    setCartItems((prev) =>
      newQty <= 0
        ? prev.filter((i) => i._id !== id)
        : prev.map((i) => (i._id === id ? { ...i, quantity: newQty } : i))
    );
  }, []);

  const removeFromCart = useCallback((id) => {
    setCartItems((prev) => prev.filter((i) => i._id !== id));
  }, []);

  // Flash "Added" for 1.4s after tapping ADD+
  const handleAddToCart = useCallback((e, item) => {
    e.stopPropagation();
    addToCart(item);
    setFlashedItems((prev) => new Set([...prev, item._id]));
    setTimeout(() => {
      setFlashedItems((prev) => {
        const next = new Set(prev);
        next.delete(item._id);
        return next;
      });
    }, 1400);
    // Track add-to-cart (fire-and-forget)
    fetch('/api/analytics/add-to-cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantId: restaurantId || restaurant?._id }),
    }).catch(() => {});
  }, [addToCart, restaurantId, restaurant?._id]);

  // ── Item interaction ────────────────────────────────────────────────────────
  const handleCardClick = (item) => {
    if (!item) return;
    setSelectedItem(item);
    // Track item click (fire-and-forget)
    fetch('/api/analytics/item-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurantId: restaurantId || restaurant?._id,
        itemId: item._id,
        itemName: item.name,
      }),
    }).catch(() => {});
  };

  // Tapping the image opens full-screen image preview
  const handleImageClick = (e, item) => {
    e.stopPropagation();
    setSelectedItem(item);
    setShowImagePreview(true);
  };

  // ── Filtering ───────────────────────────────────────────────────────────────
  const debouncedSearch = useDebounce(searchQuery, 300);
  const normalizedSearch = (debouncedSearch ?? '').toString().trim().toLowerCase();

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const cat  = (item?.category ?? '').toLowerCase();
      const name = (item?.name ?? '').toLowerCase();
      const desc = (item?.description ?? '').toLowerCase();
      const matchesCategory = filter === 'all' || cat === filter;
      const matchesSearch   = name.includes(normalizedSearch) || desc.includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });
  }, [items, filter, normalizedSearch]);

  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <>
      <main className="max-w-4xl mx-auto pb-32 bg-white min-h-screen">

        {/* ── Restaurant Banner ──────────────────────────────────────────── */}
        <div className="relative mb-4 overflow-hidden">
          <div className="relative h-48 sm:h-56">
            <Image
              src={restaurant?.logoUrl || '/default-restaurant.jpg'}
              alt="Restaurant Banner"
              width={800}
              height={224}
              className="w-full h-full object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </div>

          {/* Overlapping info card */}
          <div className="relative px-4 -mt-16">
            <div className="bg-white rounded-3xl shadow-xl p-5 border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-full blur-md opacity-40" />
                  <Image
                    src={restaurant?.logoUrl || '/default-restaurant.jpg'}
                    alt="Restaurant Logo"
                    width={72}
                    height={72}
                    className="relative w-[72px] h-[72px] rounded-full border-4 border-white shadow-lg object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-black text-gray-900 mb-0.5 truncate">
                    {restaurant?.name ?? ''}
                  </h1>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-1">
                    {restaurant?.address ?? ''}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      ⭐ 4.3
                    </span>
                    <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      🍽️ {items.length} Items
                    </span>
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      ⚡ Digital Menu
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Search bar ────────────────────────────────────────────────── */}
        <div className="px-4 mb-3">
          <HomeIconButton />
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes..."
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ── Sticky category bar ───────────────────────────────────────── */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
          <div className="px-4 py-2.5">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                    filter === cat.id
                      ? 'bg-orange-500 text-white shadow-md scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95'
                  }`}
                >
                  <span className="text-sm">{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Menu item list ────────────────────────────────────────────── */}
        <div className="px-4 pt-4 space-y-3">

          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const cartItem   = cartItems.find((i) => i._id === item._id);
              const inCart     = !!cartItem;
              const justAdded  = flashedItems.has(item._id);

              return (
                <div
                  key={item._id}
                  className="relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md active:scale-[0.99] transition-all duration-200 cursor-pointer overflow-hidden"
                  onClick={() => handleCardClick(item)}
                >
                  <div className="flex gap-3 p-3">

                    {/* ── Food image (tap → full-screen preview) ─────── */}
                    <div
                      className="relative flex-shrink-0 cursor-zoom-in"
                      onClick={(e) => handleImageClick(e, item)}
                    >
                      <Image
                        src={item?.imageUrl ?? '/default-food.jpg'}
                        alt={item?.name ?? 'Menu item'}
                        width={96}
                        height={96}
                        className="w-24 h-24 object-cover rounded-xl"
                        loading="lazy"
                      />
                      {/* Veg/non-veg dot */}
                      <div className="absolute top-1.5 left-1.5">
                        <VegIndicator category={item?.category} />
                      </div>
                      {/* Zoom hint overlay */}
                      <div className="absolute inset-0 rounded-xl bg-black/0 hover:bg-black/10 transition-colors duration-150 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white opacity-0 hover:opacity-100 transition-opacity drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>

                    {/* ── Item content ───────────────────────────────── */}
                    <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
                      <div>
                        {/* Name + bestseller badge */}
                        <div className="flex items-start gap-1.5 mb-1">
                          <h3 className="text-sm font-bold text-gray-900 line-clamp-1 flex-1">
                            {item?.name ?? ''}
                          </h3>
                          {item?.bestseller && (
                            <span className="flex-shrink-0 text-xs bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-md font-semibold leading-none">
                              🔥 Best
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        {item?.description ? (
                          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-2">
                            {item.description}
                          </p>
                        ) : (
                          <div className="mb-2" />
                        )}
                      </div>

                      {/* Price + cart button row */}
                      <div className="flex items-center justify-between">
                        <span className="text-base font-black text-gray-900">
                          ₹{item?.price ?? 0}
                        </span>

                        {/* In-cart: show quantity stepper. Not in cart: show ADD+ */}
                        {inCart ? (
                          <div
                            className="flex items-center gap-0 bg-orange-500 rounded-lg overflow-hidden shadow-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="w-8 h-8 flex items-center justify-center text-white font-bold text-lg hover:bg-orange-600 active:bg-orange-700 transition-colors"
                              onClick={(e) => { e.stopPropagation(); updateQuantity(item._id, cartItem.quantity - 1); }}
                            >
                              −
                            </button>
                            <span className="w-7 text-center text-white text-sm font-bold">
                              {cartItem.quantity}
                            </span>
                            <button
                              className="w-8 h-8 flex items-center justify-center text-white font-bold text-lg hover:bg-orange-600 active:bg-orange-700 transition-colors"
                              onClick={(e) => { e.stopPropagation(); updateQuantity(item._id, cartItem.quantity + 1); }}
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 shadow-sm active:scale-95 ${
                              justAdded
                                ? 'bg-green-500 text-white scale-105'
                                : 'bg-white border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white'
                            }`}
                            onClick={(e) => handleAddToCart(e, item)}
                          >
                            {justAdded ? '✓ Added' : 'ADD +'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            /* Empty state */
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-700 mb-1">No items found</h3>
              <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* ── Modals ────────────────────────────────────────────────────── */}
        {selectedItem && !showImagePreview && (
          <ItemDetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onAddToCart={addToCart}
            showModal={true}
          />
        )}

        {showImagePreview && selectedItem && (
          <ImagePreviewModal
            imageUrl={selectedItem.imageUrl}
            onClose={() => {
              setShowImagePreview(false);
              setSelectedItem(null);
            }}
          />
        )}

        {showCart && (
          <CartModal
            cartItems={cartItems}
            showCart={showCart}
            setShowCart={setShowCart}
            updateQuantity={updateQuantity}
            setCartItems={setCartItems}
            restaurantId={restaurantId}
            tableId={tableFromUrl}
          />
        )}
      </main>

      {/* ── Sticky full-width cart bar ─────────────────────────────────── */}
      {cartItems.length > 0 && !selectedItem && !showImagePreview && !showCart && (
        <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none">
          <button
            onClick={() => setShowCart(true)}
            className="pointer-events-auto w-full max-w-4xl mx-auto flex items-center justify-between bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl px-5 py-4 shadow-2xl active:scale-[0.98] transition-transform duration-150"
          >
            {/* Left — item count */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-white text-orange-600 text-[10px] font-black rounded-full flex items-center justify-center px-1">
                  {cartCount}
                </span>
              </div>
              <span className="text-sm font-semibold">
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Right — total + CTA */}
            <div className="flex items-center gap-3">
              <span className="text-lg font-black">₹{cartTotal}</span>
              <div className="flex items-center gap-1 bg-white/20 rounded-xl px-3 py-1.5">
                <span className="text-sm font-bold">View Cart</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      )}
    </>
  );
}
