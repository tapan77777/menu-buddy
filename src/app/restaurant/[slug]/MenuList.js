'use client';

import HomeIconButton from '@/components/HomeIconButton';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';

import dynamic from 'next/dynamic';
const ScratchCardOffer = dynamic(() => import('@/components/ScratchCardOffer'), { ssr: false });
const ItemDetailModal = dynamic(() => import('@/components/ItemDetailModal'), { ssr: false });
const CartModal = dynamic(() => import('@/components/CartModal'), { ssr: false });
const ImagePreviewModal = dynamic(() => import('@/components/ImagePreviewModal'), {
  ssr: false,
});

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function MenuList({ restaurant, items = [], restaurantId }) {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [showImagePreview, setShowImagePreview] = useState(false);

  useEffect(() => {
    if (restaurant && restaurant._id) {
      const viewedKey = `viewed-${restaurant._id}`;

      if (!sessionStorage.getItem(viewedKey)) {
        // Track only if not already viewed in this session
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            restaurantId: restaurant._id,
            type: "menu_viewed",
          }),
        }).catch(() => { /* ignore tracking errors */ });

        // Mark as viewed
        sessionStorage.setItem(viewedKey, "true");
      }
    }
  }, [restaurant && restaurant._id]);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Clear cart on unmount (navigation away)
  useEffect(() => {
    return () => setCartItems([]);
  }, []);

  const [showCart, setShowCart] = useState(false);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      setCartItems(prev => prev.filter(item => item._id !== id));
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item._id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const addToCart = useCallback((item) => {
    setCartItems((prev) => {
      // add default quantity if missing
      const normalized = { ...item, quantity: item.quantity ?? 1 };

      const exists = prev.find((i) => i._id === normalized._id);
      if (exists) return prev;
      return [...prev, normalized];
    });
  }, []);

  const handleItemClick = (item) => {
    // item may be undefined if something odd happens — guard it
    if (!item) return;

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantId: restaurant?._id,
        itemId: item._id,
        type: "item_clicked",
      }),
    }).catch(() => { /* ignore tracking errors */ });

    setSelectedItem(item);
  };

  // discount calculate (defensive)
  const calculateDiscount = (current, original) => {
    if (!original || original === 0) return 0;
    return Math.round(((current - original) / original) * 100);
  };

  const removeFromCart = useCallback((itemId) => {
    setCartItems((prev) => prev.filter((i) => i._id !== itemId));
  }, []);

  const normalizedDebouncedSearch = (debouncedSearch ?? '').toString().trim().toLowerCase();

  const filteredItems = useMemo(() => {
    // items is guaranteed as array by default param
    return items.filter((item) => {
      // use safe fallbacks for fields that may be undefined
      const category = (item?.category ?? '').toString().toLowerCase();
      const name = (item?.name ?? '').toString().toLowerCase();
      const description = (item?.description ?? '').toString().toLowerCase();

      const matchesCategory =
        filter === 'all' || category === (filter ?? '').toString().toLowerCase();

      const matchesSearch =
        name.includes(normalizedDebouncedSearch) ||
        description.includes(normalizedDebouncedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [items, filter, normalizedDebouncedSearch]);

  const totalCount = items?.length || 0;

  return (
    <>
      <main className="max-w-4xl mx-auto px-4 pt-10 pb-24">

        {/* Top Restaurant Banner Section */}
        <div className="relative mb-12">
          {/* Banner Image */}
          <Image
            src={restaurant?.logoUrl || '/default-restaurant.jpg'}
            alt="Restaurant Banner"
            width={800}
            height={160}
            className="w-full h-40 object-cover rounded-b-xl"
          />

          {/* Circular Logo + Name */}
          <div className="absolute -bottom-10 left- flex items-center gap-4">
            <Image
              src={restaurant?.logoUrl || '/default-restaurant.jpg'}
              alt="Restaurant Logo"
              width={80}   // w-20 = 80px
              height={80}  // h-20 = 80px
              className="w-20 h-20 rounded-full border-4 border-white shadow-md"
            />
            <div className="bg-black/50 p-2 rounded-xl">
              <h1 className="text-xl sm:text-2xl font-bold text-white">{restaurant?.name ?? ''}</h1>
              <p className="text-sm sm:text-base text-white">{restaurant?.address ?? ''}</p>
            </div>
          </div>
        </div>

        <HomeIconButton />

        {/* Search & Filters */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search menu items..."
          className="w-full p-2 rounded border mb-4 bg-black text-white"
        />

        {cartItems.length > 0 && (
          <div className="mt-10">
            {/* <ScratchCardOffer /> */}
          </div>
        )}

        <h2 className="text-lg font-bold text-gray-800 mb-2">
          Total Items in Menu: {totalCount}
        </h2>

        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {['all', 'veg', 'non-veg', 'drinks', 'special','starters'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                filter === cat
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {String(cat).charAt(0).toUpperCase() + String(cat).slice(1)}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-lg active:scale-[0.98] transition-transform duration-200"
              onClick={() => handleItemClick(item)}
            >
              {/* Discounted badge */}
              <div className="absolute top-3 left-3 z-20">
                <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                  {calculateDiscount((item?.price ?? 0) + 50, (item?.price ?? 0))}% OFF
                </div>
              </div>

              <div className="flex">
                <Image
                  src={item?.imageUrl ?? '/default-food.jpg'}
                  alt={item?.name ?? 'Item'}
                  width={128}
                  height={128}
                  className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-l-2xl"
                />
                <div className="flex flex-col justify-between p-3 flex-grow">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">{item?.name ?? ''}</h2>
                      {item?.bestseller && (
                        <p className="text-red-500 text-xs mt-0.5">🔥 Bestseller</p>
                      )}
                    </div>
                    <span className="text-green-600 text-xs bg-green-100 px-2 py-0.5 rounded-full">
                      ⭐ {item?.rating ?? "4.2"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-auto">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          ₹{item?.price ?? 0}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          ₹{(item?.price ?? 0) + 50}
                        </span>
                      </div>
                      <span className="text-xs text-green-600 font-medium">
                        You save ₹50
                      </span>
                    </div>

                    <button
                      className="relative px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-full text-xs shadow-lg transform transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95 border-2 border-green-400/30"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item);
                      }}
                      style={{
                        boxShadow: '0 6px 20px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                      }}
                    >
                      <span className="relative z-8">ADD +</span>

                      {/* Button Shine */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300 transform -skew-x-12"></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <p className="text-center text-gray-500 mt-8">No items found. Coming soon..</p>
        )}

        {/* Popup Modal */}
        {selectedItem && (
          <ItemDetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onAddToCart={addToCart}
            showModal={true}
          />
        )}

        {showImagePreview && (
          <ImagePreviewModal
            imageUrl={selectedItem?.imageUrl}
            onClose={() => setShowImagePreview(false)}
          />
        )}

      {/* Floating Cart Preview */}
{cartItems.length > 0 && !selectedItem && (
  <>
    {/* Professional Floating Cart Button */}
    <div
      className="fixed bottom-6 right-6 z-40 group cursor-pointer"
      onClick={() => setShowCart(!showCart)}
    >
      {/* Main Cart Container */}
      <div className="relative">
        {/* Cart Button - Clean and Professional */}
        <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 text-gray-800 dark:text-white rounded-2xl px-5 py-3.5 flex items-center gap-3 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-out min-w-[140px]">
          {/* Cart Icon with Badge */}
          <div className="relative">
            <svg 
              className="w-6 h-6 text-gray-700 dark:text-gray-200 transition-transform group-hover:scale-110" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
              />
            </svg>

            {/* Item Count Badge */}
            {cartItems.length > 0 && (
              <div className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-green-600 dark:bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5 shadow-md">
                {cartItems.length > 99 ? '99+' : cartItems.length}
              </div>
            )}
          </div>

          {/* Cart Info */}
          <div className="flex flex-col items-start leading-tight">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              View Cart
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </span>
            <span className="text-xs font-medium text-white/80">
              ₹{cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
            </span>
          </div>

          {/* Chevron Icon */}
          <svg 
            className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform duration-300 ${
              showCart ? 'rotate-180' : ''
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 9l-7 7-7-7" 
            />
          </svg>
        </div>

        {/* Subtle pulse effect for new items */}
        {cartItems.length > 0 && (
          <div className="absolute inset-0 rounded-2xl bg-green-500 opacity-20 animate-ping pointer-events-none"></div>
        )}
      </div>

      {/* Hover Preview Tooltip */}
      <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform translate-y-2 group-hover:translate-y-0">
        <div className="bg-gray-900 dark:bg-gray-700 text-white px-4 py-3 rounded-xl shadow-2xl min-w-[220px]">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="font-semibold text-sm">Your Cart</span>
          </div>
          <div className="text-xs text-gray-300">
            {cartItems.length === 1 
              ? '1 item ready to order' 
              : `${cartItems.length} items ready to order`
            }
          </div>
          {/* Tooltip arrow */}
          <div className="absolute top-full right-8 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
        </div>
      </div>
    </div>

    {/* Cart Modal */}
    {showCart && (
      <CartModal
        className="overflow-y-auto max-h-[60vh] px-6 py-4"
        cartItems={cartItems}
        showCart={showCart}
        setShowCart={setShowCart}
        updateQuantity={updateQuantity}
        setCartItems={setCartItems}
        restaurantId={restaurantId}
        tableId=""
      />
    )}
  </>
)}
      </main>
    </>
  );
}
