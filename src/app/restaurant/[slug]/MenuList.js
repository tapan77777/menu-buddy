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
            {/* Swiggy/Zomato Style Floating Cart */}
            <div
              className="fixed bottom-6 right-4 sm:right-6 z-40 group cursor-pointer"
              onClick={() => setShowCart(!showCart)}
            >
              {/* Main Cart Container */}
              <div className="relative">
                {/* Cart Button with Food Delivery Styling */}
                <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white rounded-2xl px-4 py-3 flex items-center gap-2 shadow-2xl hover:shadow-orange-500/25 transform hover:scale-105 transition-all duration-300 ease-out min-w-[120px]">
                  {/* Animated Cart Icon */}
                  <div className="relative">
                    <svg className="w-5 h-5 group-hover:animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
                      <circle cx="9" cy="9" r="1"/>
                      <circle cx="15" cy="9" r="1"/>
                      <circle cx="9" cy="15" r="1"/>
                      <circle cx="15" cy="15" r="1"/>
                    </svg>

                    {/* Floating Items Animation */}
                    {cartItems.length > 0 && (
                      <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                    )}
                  </div>

                  {/* Cart Text & Count */}
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-xs font-medium opacity-90">Cart</span>
                    <span className="text-sm font-bold">
                      {cartItems.length > 0 ? `${cartItems.length} item${cartItems.length > 1 ? 's' : ''}` : 'Empty'}
                    </span>
                  </div>

                  {/* Arrow Icon */}
                  <svg className={`w-4 h-4 transition-transform duration-300 ${showCart ? 'rotate-180' : ''} group-hover:translate-x-1`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z"/>
                  </svg>
                </div>

                {/* Pulsing Ring for Items */}
                {cartItems.length > 0 && (
                  <div className="absolute inset-0 rounded-2xl border-2 border-orange-400 animate-pulse opacity-60"></div>
                )}

                {/* Floating Notification Dots */}
                {cartItems.length > 0 && (
                  <>
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                    <div className="absolute -bottom-1 -left-2 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="absolute top-2 -right-3 w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </>
                )}
              </div>

              {/* Quick Preview on Hover */}
              <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform translate-y-2 group-hover:translate-y-0">
                <div className="bg-white text-gray-800 px-4 py-3 rounded-xl shadow-2xl border min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold text-sm">Your Order</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {cartItems.length > 0
                      ? `${cartItems.length} delicious item${cartItems.length > 1 ? 's' : ''} waiting!`
                      : 'Add items to get started'}
                  </div>
                  <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                </div>
              </div>
            </div>
            {/* Swiggy/Zomato Style Floating Cart */}

            {/* Slide-up Cart Popup */}
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
