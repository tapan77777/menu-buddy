'use client';

import HomeIconButton from '@/components/HomeIconButton';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';

import dynamic from 'next/dynamic';
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
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            restaurantId: restaurant._id,
            type: "menu_viewed",
          }),
        }).catch(() => { /* ignore tracking errors */ });

        sessionStorage.setItem(viewedKey, "true");
      }
    }
  }, [restaurant && restaurant._id]);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Clear cart on unmount
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
      const normalized = { ...item, quantity: item.quantity ?? 1 };
      const exists = prev.find((i) => i._id === normalized._id);
      if (exists) return prev;
      return [...prev, normalized];
    });
  }, []);

  const handleItemClick = (item) => {
    if (!item) return;

    

    setSelectedItem(item);
  };

  const removeFromCart = useCallback((itemId) => {
    setCartItems((prev) => prev.filter((i) => i._id !== itemId));
  }, []);

  const normalizedDebouncedSearch = (debouncedSearch ?? '').toString().trim().toLowerCase();

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
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
      <main className="max-w-4xl mx-auto pb-24 bg-gradient-to-b from-orange-50/30 via-white to-white min-h-screen">

        {/* Enhanced Restaurant Banner */}
        <div className="relative mb-6 overflow-hidden">
          {/* Banner with gradient overlay */}
          <div className="relative h-48 sm:h-56">
            <Image
              src={restaurant?.logoUrl || '/default-restaurant.jpg'}
              alt="Restaurant Banner"
              width={800}
              height={224}
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          </div>

          {/* Restaurant Info Card - Overlapping design */}
          <div className="relative px-4 -mt-16">
            <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
              <div className="flex items-start gap-4">
                {/* Circular Logo with ring */}
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-full blur-md opacity-50"></div>
                  <Image
                    src={restaurant?.logoUrl || '/default-restaurant.jpg'}
                    alt="Restaurant Logo"
                    width={80}
                    height={80}
                    className="relative w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                </div>
                
                {/* Restaurant Details */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-black text-gray-900 mb-1 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {restaurant?.name ?? ''}
                  </h1>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-1">{restaurant?.address ?? ''}</p>
                  
                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full">
                      <span className="text-green-600 text-sm">⭐</span>
                      <span className="text-sm font-semibold text-green-700">4.3</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-full">
                      <span className="text-orange-600 text-sm">🍽️</span>
                      <span className="text-sm font-semibold text-orange-700">{totalCount} Items</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full">
                      <span className="text-blue-600 text-sm">⚡</span>
                      <span className="text-sm font-semibold text-blue-700">Digital Menu</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4">
          <HomeIconButton />

          {/* Enhanced Search Bar */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search delicious food..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 shadow-sm hover:shadow-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>


          {/* Category Filters - Pill Style */}
          <div className="mb-6">
      
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {[
                { id: 'all', label: 'All', emoji: '🍴' },
                { id: 'veg', label: 'Veg', emoji: '🥗' },
                { id: 'non-veg', label: 'Non-Veg', emoji: '🍗' },
                { id: 'drinks', label: 'Drinks', emoji: '🥤' },
                { id: 'special', label: 'Special', emoji: '⭐' },
                { id: 'starters', label: 'Starters', emoji: '🍢' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
                    filter === cat.id
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-300 hover:shadow-md'
                  }`}
                >
                  <span className="text-base">{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

{/* Compact Menu Items */}
          <div className="space-y-3">
            {filteredItems.map((item, index) => (
              <div
                key={item._id}
                className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer active:scale-98"
                onClick={() => handleItemClick(item)}
              >
                <div className="flex gap-3 p-3">
                  {/* Image Section */}
                  <div className="relative flex-shrink-0">
                    <Image
                      src={item?.imageUrl ?? '/default-food.jpg'}
                      alt={item?.name ?? 'Item'}
                      width={96}
                      height={96}
                      className="w-24 h-24 object-cover rounded-xl"
                    />

                    {/* Veg/Non-Veg Indicator */}
                    <div className="absolute top-1.5 left-1.5">
                      <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center ${
                        item?.category === 'veg' ? 'border-green-600 bg-white' : 'border-red-600 bg-white'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          item?.category === 'veg' ? 'bg-green-600' : 'bg-red-600'
                        }`}></div>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    {/* Title & Badges */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
                        {item?.name ?? ''}
                      </h3>
                      
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {item?.bestseller && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                            ⭐ Bestseller
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Price & Add Button */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-lg font-black text-green-600">
                          ₹{item?.price ?? 0}
                        </span>
                      </div>

                      <button
                        className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg text-xs shadow-md hover:shadow-lg active:scale-95 transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item);
                        }}
                      >
                        ADD +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredItems.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4 animate-bounce">🔍</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No items found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Modals */}
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

        {/* Enhanced Floating Cart */}
        {cartItems.length > 0 && !selectedItem && (
          <>
            <div
              className="fixed bottom-6 right-6 z-40 group cursor-pointer"
              onClick={() => setShowCart(!showCart)}
            >
              {/* Pulsing background effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 opacity-20 animate-pulse"></div>
              
              {/* Main Cart Button */}
              <div className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl px-5 py-4 flex items-center gap-3 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 min-w-[160px]">
                {/* Cart Icon with Badge */}
                <div className="relative">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <div className="absolute -top-2 -right-2 min-w-[22px] h-5 bg-white text-orange-600 text-xs font-black rounded-full flex items-center justify-center px-1.5 shadow-lg">
                    {cartItems.length}
                  </div>
                </div>

                {/* Cart Info */}
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-xs font-semibold text-white/90">
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                  </span>
                  <span className="text-lg font-black text-white">
                    ₹{cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                  </span>
                </div>

                {/* Chevron */}
                <svg 
                  className={`w-5 h-5 transition-transform duration-300 ${showCart ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
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