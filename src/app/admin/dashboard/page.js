"use client";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [items, setItems] = useState([]);
  const [token, setToken] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
const [search, setSearch] = useState("");
const [showAddForm, setShowAddForm] = useState(false);




const startEditing = (item) => {
  setEditingItem(item);
};


  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchMenuItems(storedToken);
    }
  }, []);

  const fetchMenuItems = async (token) => {
  try {
    const res = await fetch("/api/menu", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    

    if (data.success) {
      setItems(data.items);
      if (data.restaurant) {
        setRestaurant(data.restaurant); // ✅ set restaurant if available
      }
    } else {
      alert("Failed to load menu items");
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
};


  const deleteItem = async (id) => {
    const res = await fetch(`/api/menu/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) {
      setItems((prev) => prev.filter((item) => item._id !== id));
    } else alert(data.error || "Delete failed");
  };

  return (
    <main className="p-6 max-w-5xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-1 text-center">
  🍽️ {restaurant?.name || "Your Restaurant"}
</h1>
<p className="text-sm text-center text-gray-400 mb-6">Menu Management Dashboard</p>


<button
  onClick={() => setShowAddForm(true)}
  className="fixed bottom-6 right-4 sm:right-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full shadow-lg z-50"
>
  ➕ Add Item
</button>


      {/* ADD ITEM FORM */}
      {showAddForm && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center" onClick={() => setShowAddForm(false)}>
    <div
      className="bg-gray-900 text-white shadow-xl rounded-xl p-6 w-full max-w-2xl mx-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">➕ Add New Item</h2>
        <button onClick={() => setShowAddForm(false)} className="text-red-400 hover:underline text-sm">✖ Close</button>
      </div>

      {/* ⬇️ YOUR EXISTING FORM STARTS HERE */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target;
          const imageFile = form.image.files[0];

          const formData = new FormData();
          formData.append("file", imageFile);

          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          const uploadData = await uploadRes.json();
          if (!uploadData.success) {
            alert("Image upload failed!");
            return;
          }

          const newItem = {
            name: form.name.value,
            description: form.description.value,
            price: form.price.value,
            category: form.category.value,
            bestseller: form.bestseller.checked,
            imageUrl: uploadData.url,
          };

          const res = await fetch("/api/menu", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(newItem),
          });

          const data = await res.json();
          if (data.success) {
            setItems([data.item, ...items]);
            form.reset();
            setShowAddForm(false); // ✅ close modal after add
          } else alert(data.error || "Something went wrong");
        }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <input type="text" name="name" placeholder="Item Name" required className="input bg-white text-black p-2 rounded" />
        <input type="text" name="price" placeholder="Price" required className="input bg-white text-black p-2 rounded" />
        <select name="category" required className="input bg-white text-black p-2 rounded">
          <option value="">Select Category</option>
          <option value="veg">🥗 Veg</option>
          <option value="non-veg">🍗 Non-Veg</option>
          <option value="drinks">🥤 Drinks</option>
        </select>
        <label className="flex items-center gap-2 mt-2">
  <input type="checkbox" name="bestseller" className="form-checkbox" />
  <span className="text-sm">Mark as Bestseller 🔥</span>
</label>

        <input type="file" name="image" accept="image/*" className="input" required />
        <textarea name="description" placeholder="Description" className="input bg-white text-black p-2 rounded col-span-1 sm:col-span-2" />
        <button type="submit" className="col-span-1 sm:col-span-2 mt-4 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white">
          Add Item
        </button>
      </form>
    </div>
  </div>
)}


{/* //Edit */}
{editingItem && (
  <form
    onSubmit={async (e) => {
      e.preventDefault();
      const form = e.target;

      const updatedItem = {
        name: form.name.value,
        description: form.description.value,
        price: form.price.value,
        category: form.category.value,
        bestseller: form.bestseller.checked,
      };

      // Optional: If user uploads new image
      if (form.image.files[0]) {
        const formData = new FormData();
        formData.append("file", form.image.files[0]);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();

        if (!uploadData.success) {
          alert("Image upload failed!");
          return;
        }

        updatedItem.imageUrl = uploadData.url;
      }

      const res = await fetch(`/api/menu/${editingItem._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedItem),
      });

      const data = await res.json();
      if (data.success) {
        setItems((prev) =>
          prev.map((it) => (it._id === editingItem._id ? data.item : it))
        );
        setEditingItem(null);
      } else {
        alert(data.error || "Update failed");
      }
    }}
    className="bg-yellow-100 shadow rounded-xl p-4 mb-8"
  >
    <h2 className="text-xl font-semibold mb-4">✏️ Edit Item</h2>
    <div className="bg-yellow-50 border-l-4 border-yellow-400 shadow p-4 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
  <input type="text" name="name" defaultValue={editingItem.name} required className="input" />
  <input type="text" name="price" defaultValue={editingItem.price} required className="input" />

  <select
    name="category"
    defaultValue={editingItem.category}
    required
    className="input bg-white text-black p-2 rounded"
  >
    <option value="">Select Category</option>
    <option value="veg">🥗 Veg</option>
    <option value="non-veg">🍗 Non-Veg</option>
    <option value="drinks">🥤 Drinks</option>
  </select>

  <input type="file" name="image" accept="image/*" className="input" />
  
  <label className="flex items-center gap-2 sm:col-span-2">
    <input
      type="checkbox"
      name="bestseller"
      defaultChecked={editingItem.bestseller}
      className="form-checkbox"
    />
    <span className="text-sm">Bestseller 🔥</span>
  </label>

  <textarea
    name="description"
    defaultValue={editingItem.description}
    className="input col-span-1 sm:col-span-2"
  />
</div>

    <button type="submit" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
      Save Changes
    </button>
    <button
      onClick={() => setEditingItem(null)}
      type="button"
      className="mt-4 ml-4 text-gray-700 hover:underline"
    >
      Cancel
    </button>
  </form>
)}


{/* 🔍 Search & Filter Section */}
<div className="mb-6">
  <div className="flex flex-wrap gap-2 justify-between items-center">
    {/* Search Input */}
    <input
      type="text"
      placeholder="Search by name..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="p-2 rounded border text-white w-full sm:w-64 "
    />

    {/* Category Filter Buttons */}
    <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
      {["all", "veg", "non-veg", "drinks"].map((cat) => (
        <button
          key={cat}
          onClick={() => setCategoryFilter(cat)}
          className={`px-4 py-1.5 rounded-full transition ${
            categoryFilter === cat
              ? "bg-green-600 text-white"
              : "bg-gray-300 text-gray-800"
          }`}
        >
          {cat.charAt(0).toUpperCase() + cat.slice(1)}
        </button>
      ))}
    </div>
  </div>
</div>






      {/* EXISTING ITEMS LIST */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {items
  .filter((item) => {
    const matchesCategory =
      categoryFilter === "all" ||
      item.category?.toLowerCase() === categoryFilter;

    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  })
  .map((item) => (

    <div key={item._id} className="bg-white text-black rounded-xl shadow hover:shadow-xl transition overflow-hidden">
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-40 object-cover"
        />
      )}
      <div className="p-4">
        <h2 className="text-lg font-semibold">{item.name}</h2>
        {item.bestseller && (
        <p className="text-red-500 text-xs mt-1">🔥 Bestseller</p>
      )}
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
        <p className="mt-2 font-bold text-green-700">₹{item.price}</p>
        <div className="mt-3 flex justify-between items-center text-sm">
          <span className="text-xs bg-gray-200 px-2 py-1 rounded">{item.category}</span>
          <div className="flex gap-3">
            <button
              onClick={() => startEditing(item)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => deleteItem(item._id)}
              className="text-red-500 hover:text-red-700 font-medium"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>

    </main>
  );
}
