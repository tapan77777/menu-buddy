'use client'
import Link from "next/link";
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

  // Mock data for demonstration
  const stats = {
    totalItems: totalCount,
    // totalOrders: 1247,
    // revenue: 45280,
    // customers: 892
  };

  const quickActions = [
    {
      title: "Menu Management",
      description: "Add, edit, and organize your menu items",
      icon: "🍽️",
      href: "/admin/dashboard/menuManagement",
      color: "from-emerald-500 to-teal-600",
      hoverColor: "hover:from-emerald-600 hover:to-teal-700"
    },
    {
      title: "Analytics",
      description: "View sales reports and customer insights",
      icon: "📊",
      href: "/admin/dashboard/analytics",
      color: "from-blue-500 to-indigo-600",
      hoverColor: "hover:from-blue-600 hover:to-indigo-700"
    },
    {
      title: "Orders",
      description: "Manage incoming orders and order history",
      icon: "📋",
      href: "/admin/dashboard/orders",
      color: "from-purple-500 to-pink-600",
      hoverColor: "hover:from-purple-600 hover:to-pink-700"
    },
    {
      title: "Customers",
      description: "Customer database and loyalty programs",
      icon: "👥",
      href: "/admin/dashboard/customers",
      color: "from-orange-500 to-red-600",
      hoverColor: "hover:from-orange-600 hover:to-red-700"
    },
    {
      title: "Promotions",
      description: "Create and manage special offers",
      icon: "🏷️",
      href: "/admin/dashboard/promotions",
      color: "from-yellow-500 to-orange-600",
      hoverColor: "hover:from-yellow-600 hover:to-orange-700"
    },
    {
      title: "Settings",
      description: "Restaurant settings and preferences",
      icon: "⚙️",
      href: "/admin/dashboard/settings",
      color: "from-gray-500 to-slate-600",
      hoverColor: "hover:from-gray-600 hover:to-slate-700"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                    <span className="text-white font-bold text-xl">🍽️</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    MenuBuddy
                  </h1>
                  <p className="text-sm text-slate-500 font-medium">
                    {restaurant?.name || "Restaurant Admin"} Dashboard
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-slate-100 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-600 font-medium">Online</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="group inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Welcome back! 👋
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Manage your restaurant efficiently with MenuBuddys powerful admin tools
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="group bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Total Menu Items</p>
                <p className="text-3xl font-bold text-slate-800">{stats.totalItems}</p>
                <p className="text-sm text-emerald-600 font-medium">+12% this month</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white text-xl">🍽️</span>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Total Orders</p>
                {/* <p className="text-3xl font-bold text-slate-800">{stats.totalOrders.toLocaleString()}</p>
                <p className="text-sm text-blue-600 font-medium">+8% this week</p> */}
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white text-xl">📋</span>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Revenue</p>
                {/* <p className="text-3xl font-bold text-slate-800">₹{stats.revenue.toLocaleString()}</p>
                <p className="text-sm text-purple-600 font-medium">+15% this month</p> */}
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white text-xl">💰</span>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Customers</p>
                {/* <p className="text-3xl font-bold text-slate-800">{stats.customers}</p>
                <p className="text-sm text-orange-600 font-medium">+5% this week</p> */}
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white text-xl">👥</span>
              </div>
            </div>
          </div>
        </div>
       



        {/* Quick Actions */}
        <div className="mb-12">
          <div className="flex items-center mb-8">
            <h3 className="text-2xl font-bold text-slate-800">Quick Actions</h3>
            <div className="ml-4 h-1 flex-1 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link key={action.title} href={action.href}>
                <div className={`group bg-white rounded-2xl shadow-lg p-8 border border-slate-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden relative`}>
                  {/* Background gradient on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-16 h-16 bg-gradient-to-r ${action.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                        <span className="text-white text-2xl">{action.icon}</span>
                      </div>
                      <svg className="w-6 h-6 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    
                    <h4 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-slate-900 transition-colors">
                      {action.title}
                    </h4>
                    <p className="text-slate-600 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Recent Activity</h3>
                <p className="text-slate-600 mt-1">Latest updates from your restaurant</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-500 font-medium">Live</span>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <div className="space-y-6">
              {[
                { action: "New order received", details: "Order #1248 - ₹485", time: "2 minutes ago", icon: "🛒", color: "text-emerald-600" },
                { action: "Menu item updated", details: "Butter Chicken price changed", time: "15 minutes ago", icon: "📝", color: "text-blue-600" },
                { action: "Customer review", details: "5-star rating received", time: "1 hour ago", icon: "⭐", color: "text-yellow-600" },
                { action: "Payment processed", details: "₹1,240 from Order #1247", time: "2 hours ago", icon: "💳", color: "text-purple-600" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-lg">{activity.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{activity.action}</p>
                    <p className="text-slate-600 text-sm">{activity.details}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${activity.color}`}>{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8">
        <button className="group w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center">
          <svg className="w-8 h-8 text-white group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      {/* Decorative Elements */}
      <div className="fixed top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-emerald-400/10 to-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
}