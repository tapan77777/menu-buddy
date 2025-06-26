"use client";
import { useEffect, useState } from "react";

export default function RestaurantPage({ params }) {
  const { slug } = params;
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    if (!slug) return;
    const fetchData = async () => {
      const res = await fetch(`/api/restaurant/${slug}/menu`);
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
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">{restaurant?.name}</h1>
      <p className="text-gray-500 mb-6">{restaurant?.address}</p>

      {/* Search Input */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search menu items..."
        className="w-full p-2 rounded border mb-6"
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
          <div key={item._id} className="bg-white rounded-xl shadow p-4">
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
    </main>
  );
}
