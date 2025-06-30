'use client';

import { useEffect, useState } from 'react';

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

  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-6 pb-24">
      <h1 className="text-3xl font-bold mb-2">{restaurant?.name}</h1>
      <p className="text-gray-500 mb-6">{restaurant?.address}</p>

      {/* Search & Filters */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search menu items..."
        className="w-full p-2 rounded border mb-4 bg-black text-white"
      />

      <div className="flex gap-2 flex-wrap">
        {['all', 'veg', 'non-veg', 'drinks'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full transition ${
              filter === cat
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-800'
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
            className="flex bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition cursor-pointer"
            onClick={() => setSelectedItem(item)}
          >
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-24 h-24 sm:w-32 sm:h-32 object-cover"
            />
            <div className="flex flex-col justify-between p-3 flex-grow">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-semibold text-gray-900">{item.name}</h2>
                <span className="text-green-600 text-xs bg-green-100 px-2 py-0.5 rounded-full">
                  ⭐ {item.rating || "4.2"}
                </span>
              </div>
              <p className="text-red-500 text-xs mb-1">🔥 Bestseller</p>
              <div className="flex justify-between items-center mt-auto">
                <span className="text-sm font-bold text-gray-800">₹{item.price}</span>
                <button
                  className="text-green-600 border border-green-600 px-3 py-0.5 rounded-full text-xs hover:bg-green-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(item);
                  }}
                >
                  ADD
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <p className="text-center text-gray-500 mt-8">No items found.</p>
      )}

      {/* Popup Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end justify-center"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white w-full max-w-md rounded-t-3xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-1 bg-gray-300 mx-auto mb-4 rounded" />
            {selectedItem.imageUrl && (
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.name}
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
            )}
            <h2 className="text-xl font-bold mb-2">{selectedItem.name}</h2>
            <p className="text-gray-600 mb-2">{selectedItem.description}</p>
            <p className="text-sm text-gray-500 mb-2">Category: {selectedItem.category}</p>
            <p className="text-green-700 font-bold text-lg mb-4">₹{selectedItem.price}</p>

            <button
              className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition"
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
        className="fixed inset-0 bg-black bg-opacity-40 flex items-end justify-center z-50"
        onClick={() => setShowCart(false)}
      >
        <div
          className="bg-white w-full max-w-md rounded-t-3xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-16 h-1 bg-gray-300 mx-auto mb-4 rounded" />
          <h2 className="text-xl font-bold mb-4 text-black">🛒 Your Cart</h2>
          {cartItems.map((item) => (
            <div key={item._id} className="flex justify-between items-center mb-3 text-black">
              <span>{item.name}</span>
              <span className="font-bold">₹{item.price}</span>
            </div>
          ))}
          <button
            onClick={() => setCartItems([])}
            className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg"
          >
            Clear Cart
          </button>
        </div>
      </div>
    )}
  </>
)}


    </main>
  );
}
