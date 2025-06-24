"use client";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [items, setItems] = useState([]);
  const [token, setToken] = useState("");
  const [editingItem, setEditingItem] = useState(null);

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
      if (data.success) setItems(data.items);
      else alert("Failed to load menu items");
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
      <h1 className="text-3xl font-bold mb-6 text-center">🍽️ Your Menu Dashboard</h1>

      {/* ADD ITEM FORM */}
      <form
  onSubmit={async (e) => {
    e.preventDefault();
    const form = e.target; // ✅ define form here first

    const imageFile = form.image.files[0];

    const formData = new FormData();
    formData.append('file', imageFile);

    // Upload image to Cloudinary
    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const uploadData = await uploadRes.json();
    if (!uploadData.success) {
      alert('Image upload failed!');
      return;
    }

    const newItem = {
      name: form.name.value,
      description: form.description.value,
      price: form.price.value,
      category: form.category.value,
      imageUrl: uploadData.url, // ✅ use Cloudinary URL
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
    } else alert(data.error || "Something went wrong");
  }}
  className="bg-gray-900 text-white shadow-lg rounded-xl p-6 mb-10"
>
  <h2 className="text-xl font-semibold mb-4">➕ Add New Item</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <input type="text" name="name" placeholder="Item Name" required className="input bg-white text-black p-2 rounded" />
    <input type="text" name="price" placeholder="Price" required className="input bg-white text-black p-2 rounded" />
    <input type="text" name="category" placeholder="Category (veg/non-veg/drink)" className="input bg-white text-black p-2 rounded" />
    <input type="file" name="image" accept="image/*" className="input" required />
    <textarea name="description" placeholder="Description" className="input bg-white text-black p-2 rounded col-span-1 sm:col-span-2" />
  </div>
  <button type="submit" className="mt-4 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white">
    Add Item
  </button>
</form>

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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <input type="text" name="name" defaultValue={editingItem.name} required className="input" />
      <input type="text" name="price" defaultValue={editingItem.price} required className="input" />
      <input type="text" name="category" defaultValue={editingItem.category} className="input" />
      <input type="file" name="image" accept="image/*" className="input" />
      <textarea name="description" defaultValue={editingItem.description} className="input col-span-1 sm:col-span-2" />
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



      {/* EXISTING ITEMS LIST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {items.map((item) => (
          <div key={item._id} className="bg-white text-black rounded-xl shadow-md p-4 hover:shadow-xl transition">
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-40 object-cover rounded mb-2"
              />
            )}
            <h2 className="text-xl font-bold">{item.name}</h2>
            <p className="text-gray-700">{item.description}</p>
            <p className="mt-2 font-bold text-green-700">₹{item.price}</p>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">{item.category}</span>
              <button
                onClick={() => deleteItem(item._id)}
                className="text-sm text-red-500 hover:underline"
              >
                Delete
              </button>
              <button
  onClick={() => startEditing(item)}
  className="text-blue-500 hover:underline text-sm"
>
  Edit
</button>

            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
