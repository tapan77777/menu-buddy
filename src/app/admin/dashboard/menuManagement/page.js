'use client'
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function MenuManagement() {
  
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
        
          useEffect(() => {
            const token = localStorage.getItem("token");
            if (!token) {
              router.replace("/admin/login");
            } else {
              setLoading(false);
            }
          }, [router]);
        
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
                  setRestaurant(data.restaurant);
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
            const confirmed = window.confirm("Are you sure you want to logout?");
            if (confirmed) {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }
          };
        
          const totalCount = items.length;
          const categories = [
            { id: "all", name: "All Items", icon: "📋" },
            { id: "veg", name: "Vegetarian", icon: "🥗" },
            { id: "non-veg", name: "Non-Vegetarian", icon: "🍗" },
            { id: "drinks", name: "Beverages", icon: "🥤" },
            { id: "special", name: "Special", icon: "⭐" },
            { id: "starters", name: "Starters", icon: "🍽️" },
          ];
        
          const filteredItems = items.filter((item) => {
            const matchesCategory =
              categoryFilter === "all" ||
              item.category?.toLowerCase() === categoryFilter;
            const matchesSearch = item.name
              .toLowerCase()
              .includes(search.toLowerCase());
            return matchesCategory && matchesSearch;
          });
        
          return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
              {/* Header */}
              <header className="bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">🍽️</span>
                        </div>
                        <div>
                          <h1 className="text-xl font-bold text-slate-900">
                            {restaurant?.name || "Restaurant Admin"}
                          </h1>
                          <p className="text-sm text-slate-500">Menu Management</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </header>
        
        
              {/* Main Content */}
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        
               

        
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">📊</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-slate-500">Total Items</p>
                        <p className="text-2xl font-bold text-slate-900">{totalCount}</p>
                      </div>
                    </div>
                  </div>
        
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-green-600 font-semibold">🥗</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-slate-500">Vegetarian</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {items.filter(item => item.category === 'veg').length}
                        </p>
                      </div>
                    </div>
                  </div>
        
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <span className="text-red-600 font-semibold">🍗</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-slate-500">Non-Veg</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {items.filter(item => item.category === 'non-veg').length}
                        </p>
                      </div>
                    </div>
                  </div>
        
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <span className="text-yellow-600 font-semibold">🔥</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-slate-500">Bestsellers</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {items.filter(item => item.bestseller).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
        
                {/* Search and Filter Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1 max-w-md">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="Search menu items..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
        
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setCategoryFilter(cat.id)}
                          className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            categoryFilter === cat.id
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          <span className="mr-2">{cat.icon}</span>
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
        
                {/* Edit Form */}
                {editingItem && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                        <span className="mr-2">✏️</span>
                        Edit Menu Item
                      </h2>
                      <button
                        onClick={() => setEditingItem(null)}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
        
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setSaving(true);
                        const form = e.target;
        
                        const updatedItem = {
                          name: form.name.value,
                          description: form.description.value,
                          price: form.price.value,
                          category: form.category.value,
                          bestseller: form.bestseller.checked,
                        };
        
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
                            setSaving(false);
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
        
                        setSaving(false);
                      }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Item Name</label>
                        <input
                          type="text"
                          name="name"
                          defaultValue={editingItem.name}
                          required
                          className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
        
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Price (₹)</label>
                        <input
                          type="text"
                          name="price"
                          defaultValue={editingItem.price}
                          required
                          className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
        
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                        <select
                          name="category"
                          defaultValue={editingItem.category}
                          required
                          className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          <option value="">Select Category</option>
                          <option value="veg">🥗 Vegetarian</option>
                          <option value="non-veg">🍗 Non-Vegetarian</option>
                          <option value="drinks">🥤 Beverages</option>
                          <option value="special">⭐ Special</option>
                          <option value="starters">🍽️ Starters</option>
                        </select>
                      </div>
        
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Image</label>
                        <input
                          type="file"
                          name="image"
                          accept="image/*"
                          className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg bg-white text-slate-900 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
        
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                        <textarea
                          name="description"
                          defaultValue={editingItem.description}
                          rows={3}
                          className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        />
                      </div>
        
                      <div className="md:col-span-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="bestseller"
                            defaultChecked={editingItem.bestseller}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                          />
                          <span className="ml-2 text-sm text-slate-700">Mark as Bestseller 🔥</span>
                        </label>
                      </div>
        
                      <div className="md:col-span-2 flex gap-4">
                        <button
                          type="submit"
                          disabled={saving}
                          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {saving ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </button>
        
                        <button
                          type="button"
                          onClick={() => setEditingItem(null)}
                          className="inline-flex items-center px-6 py-3 border border-slate-300 text-base font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
        
                {/* Menu Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredItems.map((item) => (
                    <div
                      key={item._id}
                      className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {item.imageUrl && (
                        <div className="relative w-full h-48 overflow-hidden">
                          <Image
  src={item.imageUrl}
  alt={item.name}
  width={96}     // px = same as h-24 (24 * 4)
  height={96}    // px
  className="h-24 w-24 rounded object-cover"
/>
                          {item.bestseller && (
                            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                              🔥 Bestseller
                            </div>
                          )}
                        </div>
                      )}
        
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-slate-900 line-clamp-1">{item.name}</h3>
                          <span className="text-lg font-bold text-green-600">₹{item.price}</span>
                        </div>
        
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{item.description}</p>
        
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 capitalize">
                            {item.category}
                          </span>
        
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                startEditing(item);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-slate-300 text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
        
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
                                  deleteItem(item._id);
                                }
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
        
                {filteredItems.length === 0 && (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-slate-900">No items found</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {search || categoryFilter !== "all" 
                        ? "Try adjusting your search or filter criteria."
                        : "Get started by adding your first menu item."}
                    </p>
                  </div>
                )}
              </main>
        
              {/* Floating Add Button */}
              <button
                onClick={() => setShowAddForm(true)}
                className="fixed bottom-8 right-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Item
              </button>
        
              {/* Add Item Modal */}
              {showAddForm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 px-4"
            onClick={() => setShowAddForm(false)}
          >
            <div
              className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                  <span className="mr-2">➕</span> Add New Menu Item
                </h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  ✖
                </button>
              </div>
        
              {/* Modal Form */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setLoading(true);
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
                    setLoading(false);
                  }
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 ">Item Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter item name"
                    required
                    className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-black"
                  />
                </div>
        
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 text-black">Price (₹)</label>
                  <input
                    type="text"
                    name="price"
                    placeholder="Enter price"
                    required
                    className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-black"
                  />
                </div>
        
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 text-black">Category</label>
                  <select
                    name="category"
                    required
                    className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-black"
                  >
                    <option value="">Select Category</option>
                    <option value="veg">🥗 Vegetarian</option>
                    <option value="non-veg">🍗 Non-Vegetarian</option>
                    <option value="drinks">🥤 Beverages</option>
                    <option value="special">⭐ Special</option>
                    <option value="starters">🍽️ Starters</option>
                  </select>
                </div>
        
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 text-black">Image</label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    required
                    className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg text-black"
                  />
                </div>
        
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2 text-black ">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg resize-none text-black text-black"
                  />
                </div>
        
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="bestseller"
                      className="h-4 w-4 text-blue-600 border-slate-300 rounded"
                    />
                    <span className="ml-2 text-sm text-slate-700">Mark as Bestseller 🔥</span>
                  </label>
                </div>
        
                <div className="md:col-span-2 flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 inline-flex justify-center items-center px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0..." />
                        </svg>
                        Adding Item...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Item
                      </>
                    )}
                  </button>
        
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-3 border border-slate-300 text-slate-700 bg-white rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
            </div>
          );
        }

export default MenuManagement