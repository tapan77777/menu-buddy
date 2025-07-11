"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";



export default function AdminDashboard() {
  const [items, setItems] = useState([]);
  const [token, setToken] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
const [search, setSearch] = useState("");
const [showAddForm, setShowAddForm] = useState(false);
const [loading, setLoading] = useState(false);
const [saving, setSaving] = useState(false);


  const router = useRouter();
 // To prevent flicker

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/admin/login"); // redirect if no token
    } else {
      setLoading(false); // allow page to load
    }
  }, )




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

  const handleLogout = () => {
   // or your auth key
  // optionally show a toast
  window.location.href = "/login"; // redirect
};


  return (
    <main className="p-6 max-w-5xl mx-auto text-white bg-gray-900">
    <div className="">
  <button
    onClick={handleLogout}
    className="bg-red-400 text-white text-sm px-1 py-1 rounded-md hover:bg-red-300 transition absolute top-8 right-0 flex items-center"
  >
    <i className="mr-1">🔓</i> 
  </button>
</div>


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
    setLoading(true); // Start loading
    const form = e.target;
    const imageFile = form.image.files[0];

    const formData = new FormData();
    formData.append("file", imageFile);

    try {
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadData.success) {
        alert("Image upload failed!");
        setLoading(false);
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
        setShowAddForm(false);
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    } finally {
      setLoading(false); // Stop loading
    }
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
          <option value="special">Special</option>
        <option value="combo">Combo</option>
        <option value="staters">Staters</option>
        </select>
        <label className="flex items-center gap-2 mt-2">
  <input type="checkbox" name="bestseller" className="form-checkbox" />
  <span className="text-sm">Mark as Bestseller 🔥</span>
</label>

        <input type="file" name="image" accept="image/*" className="input" required />
        <textarea name="description" placeholder="Description" className="input bg-white text-black p-2 rounded col-span-1 sm:col-span-2" />
        <button
  type="submit"
  disabled={loading}
  className="col-span-1 sm:col-span-2 mt-4 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white disabled:opacity-60 disabled:cursor-not-allowed"
>
  {loading ? 'Adding...' : 'Add Item'}
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
      setSaving(true); // <-- start saving
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
          setSaving(false); // stop saving
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

      setSaving(false); // stop saving
    }}
    className="bg-yellow-400 shadow rounded-xl p-4 mb-8"
  >
    <h2 className="text-xl font-semibold mb-4 text-black">✏️ Edit Item</h2>
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
        <option value="special">Special</option>
        <option value="combo">Combo</option>
        <option value="staters">Staters</option>
      </select>

      <input type="file" name="image" accept="image/*" className="input" />

      <label className="flex items-center gap-2 sm:col-span-2">
        <input
          type="checkbox"
          name="bestseller"
          defaultChecked={editingItem.bestseller}
          className="form-checkbox h-4 w-4 text-green-600 transition duration-150 ease-in-out rounded-md border-gray-300 focus:ring-2 focus:ring-green-500"
        />
        <span className="text-sm text-black">Bestseller 🔥</span>
      </label>

      <textarea
        name="description"
        defaultValue={editingItem.description}
        className="input col-span-1 sm:col-span-2"
      />
    </div>

    <button
      type="submit"
      disabled={saving}
      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {saving ? 'Saving...' : 'Save Changes'}
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
    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
      {["all", "veg", "non-veg", "drinks","special","combo","staters"].map((cat) => (
        <button
          key={cat}
          onClick={() => setCategoryFilter(cat)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap  ${
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
        <div className="mt-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm">
  {/* Category badge */}
  <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full capitalize shadow-sm border border-gray-300 w-max">
    {item.category}
  </span>

  {/* Action buttons */}
  <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
    <button
      onClick={() => startEditing(item)}
      className="flex items-center gap-1 bg-blue-100 text-blue-700 hover:bg-blue-200 transition px-3 py-1 rounded-full text-sm font-medium"
    >
      ✏️ <span>Edit</span>
    </button>

    <button
      onClick={() => deleteItem(item._id)}
      className="flex items-center gap-1 bg-red-100 text-red-600 hover:bg-red-200 transition px-3 py-1 rounded-full text-sm font-medium"
    >
      🗑️ <span>Delete</span>
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
