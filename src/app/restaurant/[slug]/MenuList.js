'use client';

import HomeIconButton from '@/components/HomeIconButton';
import { useEffect, useState } from 'react';

import dynamic from 'next/dynamic';
const ScratchCardOffer = dynamic(() => import('@/components/ScratchCardOffer'), { ssr: false });

 

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


export default function MenuList({ restaurant, items }) {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [showImagePreview, setShowImagePreview] = useState(false);


  const debouncedSearch = useDebounce(searchQuery, 300);

  // Clear cart on unmount (navigation away)
  useEffect(() => {
    return () => setCartItems([]);
  }, []);

const [showCart, setShowCart] = useState(false);

const addToCart = (item) => {
  setCartItems((prev) => {
    const exists = prev.find((i) => i._id === item._id);
    if (exists) return prev; // prevent duplicates
    return [...prev, item];
  });
};
//discount calculate
 const calculateDiscount = (current, original) => {
    return Math.round(((current-original) / original) * 100);
  };


  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item._id !== id));
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory = filter === 'all' || item.category.toLowerCase() === filter;
    const matchesSearch =
      item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });
const totalCount = items.length;


  return (
    <>
    
    <main className="max-w-4xl mx-auto px-4 pt-10 pb-24">

{/* Top Restaurant Banner Section */}
<div className="relative mb-12">
  {/* Banner Image */}
  <img
    src={restaurant?.logoUrl || '/default-restaurant.jpg'}
    alt="Restaurant Banner"
    className="w-full h-40 object-cover rounded-b-xl"
  />

  {/* Circular Logo + Name */}
  <div className="absolute -bottom-10 left- flex items-center gap-4">
    <img
      src={restaurant?.logoUrl || '/default-restaurant.jpg'}
      alt="Restaurant Logo"
      className="w-20 h-20 rounded-full border-4 border-white shadow-md"
    />
    <div className="bg-black/50 p-2 rounded-xl">
  <h1 className="text-xl sm:text-2xl font-bold text-white">{restaurant?.name}</h1>
  <p className="text-sm sm:text-base text-white">{restaurant?.address}</p>
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
      {cat.charAt(0).toUpperCase() + cat.slice(1)}
    </button>
  ))}
</div>


      {/* Menu Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
  {filteredItems.map((item) => (
    <div
  key={item._id}
  className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-lg active:scale-[0.98] transition-transform duration-200"
  onClick={() => setSelectedItem(item)}
>
  {/* Discounted badge */}

              <div className="absolute top-3 left-3 z-20">
                <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                  {calculateDiscount(item.price+50, item.price)}% OFF
                </div>
              </div>

  <div className="flex">
    <img
      src={item.imageUrl}
      alt={item.name}
      className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-l-2xl"
    />
    <div className="flex flex-col justify-between p-3 flex-grow">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{item.name}</h2>
          {item.bestseller && (
            <p className="text-red-500 text-xs mt-0.5">🔥 Bestseller</p>
          )}
        </div>
        <span className="text-green-600 text-xs bg-green-100 px-2 py-0.5 rounded-full">
          ⭐ {item.rating || "4.2"}
        </span>
      </div>

      <div className="flex justify-between items-center mt-auto">
        {/* <span className="text-sm font-bold text-gray-800">₹{item.price}</span> */}
        <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        ₹{item.price}
                      </span>
                    
                        <span className="text-sm text-gray-400 line-through">
                          ₹{item.price+50}
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
        <p className="text-center text-gray-500 mt-8">No items found.Coming soon..</p>
      )}
      

      {/* Popup Modal */}
      {selectedItem && (
  <div
    className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center sm:items-center"
    onClick={() => setSelectedItem(null)}
  >
    <div
      className="bg-white w-full sm:w-[90%] max-w-md rounded-t-3xl sm:rounded-2xl p-4 sm:p-6 relative overflow-y-auto max-h-[90vh]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close Button */}
      <button
        className="absolute top-3 right-4 text-gray-400 hover:text-black text-2xl"
        onClick={() => setSelectedItem(null)}
      >
        &times;
      </button>

      {/* Image */}
      {selectedItem.imageUrl && (
        <img
  src={selectedItem.imageUrl}
  alt={selectedItem.name}
  className="w-full h-48 object-cover rounded-xl mb-4 cursor-pointer"
  onClick={() => setShowImagePreview(true)}
/>

      )}

      {/* Info */}
      <h2 className="text-2xl font-bold mb-1 text-gray-900">{selectedItem.name}</h2>

      {selectedItem.bestseller && (
        <p className="text-red-500 text-sm mb-1">🔥 Bestseller</p>
      )}

      <p className="text-gray-600 mb-3">{selectedItem.description}</p>
      <p className="text-sm text-gray-500 mb-2">Category: {selectedItem.category}</p>

      <div className="flex items-center justify-between mb-4">
        <span className="text-green-700 font-bold text-xl">₹{selectedItem.price}</span>
        <span className="text-sm text-yellow-500">⭐ {selectedItem.rating || '4.2'}</span>
      </div>

      <button
        className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-green-700 transition"
        onClick={() => {
          addToCart(selectedItem);
          setSelectedItem(null);
        }}
      >
        Add to Cart
      </button>
    </div>
  </div>
)}

{showImagePreview && (
  <div
    className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex items-center justify-center transition-opacity duration-300 animate-fadeIn"
    onClick={() => setShowImagePreview(false)}
  >
    <img
      src={selectedItem.imageUrl}
      alt="Full View"
      className="max-w-full max-h-full object-contain animate-scaleIn"
    />
  </div>
)}



      {/* Floating Cart Preview */}
     {cartItems.length > 0 && !selectedItem && (
  <>
    {/* Floating Cart Icon */}
    <div
      className="fixed bottom-6 right-4 sm:right-6 z-40 bg-gray-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg cursor-pointer transition duration-300"
      onClick={() => setShowCart(!showCart)}
    >
      🛒
      <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
        {cartItems.length}
      </span>
    </div>

    {/* Slide-up Cart Popup */}
   {showCart && (
  <div
    className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center"
    onClick={() => setShowCart(false)}
  >
    <div
      className="bg-white w-full sm:w-[90%] max-w-md rounded-t-3xl sm:rounded-2xl p-6 relative overflow-y-auto max-h-[90vh]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close button */}
      <button
        className="absolute top-3 right-4 text-gray-400 hover:text-black text-2xl"
        onClick={() => setShowCart(false)}
      >
        &times;
      </button>

      {/* Cart Title */}
      <h2 className="text-2xl font-bold mb-4 text-gray-900">🛒 Your Cart</h2>

      {cartItems.length > 0 ? (
        <>
          {cartItems.map((item) => (
            <div key={item._id} className="flex justify-between items-center mb-3 text-black">
              <span>{item.name}</span>
              <span className="font-bold">₹{item.price}</span>
            </div>
          ))}

          <button
            onClick={() => setCartItems([])}
            className="mt-6 w-full bg-red-500 text-white py-2 rounded-xl font-semibold hover:bg-red-600 transition"
          >
            Clear Cart
          </button>
        </>
      ) : (
        <p className="text-center text-gray-500">Your cart is empty.</p>
      )}
    </div>
  </div>
)}

  </>
)}


    </main>
    </>
  );
}
