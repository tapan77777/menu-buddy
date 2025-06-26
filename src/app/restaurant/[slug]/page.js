"use client";
import { useEffect, useState } from "react";

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

export default function RestaurantPage({ params }) {
  const { slug } = params;

  const [items, setItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);


  const debouncedSearch = useDebounce(searchQuery, 3000);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      const res = await fetch(`/api/restaurant/${slug}/menu`, {
        next: { revalidate: 60 },
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
        setRestaurant(data.restaurant);
      }
    };

    fetchData();
  }, [slug]);

  const filteredItems = items.filter((item) => {
    const matchesCategory = filter === "all" || item.category.toLowerCase() === filter;
    const matchesSearch =
      item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-3xl font-bold mb-2">{restaurant?.name}</h1>
      <p className="text-gray-500 mb-6">{restaurant?.address}</p>


      {/* Search Input */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search menu items..."
        className=" sticky top-0 w-full p-2 rounded border mb-6 bg-black"
      />

      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {["all", "veg", "non-veg", "drink"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full transition ${
              filter === cat
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {filteredItems.map((item) => (
          <div
  key={item._id}
  className="bg-white rounded-xl shadow p-4 cursor-pointer hover:shadow-lg transition"
  onClick={() => setSelectedItem(item)}
>
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-40 object-cover rounded mb-2"
              />
            )}
            <h2 className="text-xl font-semibold">{item.name}</h2>
            <p className="text-gray-600">{item.description}</p>
            <p className="mt-2 font-bold text-green-700">₹{item.price}</p>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
              {item.category}
            </span>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <p className="text-center text-gray-500 mt-8">No items found.</p>
      )}

      {/* pop up image code */}
      {selectedItem && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl max-w-md w-full relative shadow-lg">
      <button
        className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
        onClick={() => setSelectedItem(null)}
      >
        &times;
      </button>


      {selectedItem.imageUrl && (
        <img
          src={selectedItem.imageUrl}
          alt={selectedItem.name}
          className="w-full h-60 object-cover rounded mb-4"
        />
      )}
      <h2 className="text-2xl font-bold mb-2">{selectedItem.name}</h2>
      <p className="text-gray-600 mb-2">{selectedItem.description}</p>
      <p className="text-green-700 font-bold text-lg mb-2">₹{selectedItem.price}</p>
      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{selectedItem.category}</span>
    </div>
  </div>
)}

    </main>
  );
}

