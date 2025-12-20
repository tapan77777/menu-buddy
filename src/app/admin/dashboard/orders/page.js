"use client";

import { Bell, CheckCircle, ChefHat, Clock, PackageCheck, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef(null);
  const prevOrderCountRef = useRef(0);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUQ0PVqzn77BdGAg+ltryxnMoBSl+zPLaizsIGGS57OihUBALTKXh8bllHAU2jdXzyo06BxpqvO7mnFIPC1Kn4/G4aB4FNYzU8811KwUjds3y3I4+CRZiturqpVQRCkij4PG2Yx0ENIvU8s5zKgUidc3y3I4+CRZiturqpVQRCkij4PG2Yx0ENIvU8s5zKgUidc3y3I4+CRZiturqpVQRCkij4PG2Yx0ENIvU8s5zKgUidc3y3I4+CRZiturqpVQRCkij4PG2Yx0ENIvU8s5zKgUidc3y3I4+CRZiturqpVQRCkij4PG2Yx0ENIvU8s5zKgUidc3y3I4+CRZiturqpVQRCkij4PG2Yx0ENIvU8s5zKgUidc3y3I4+CRZiturqpVQRCkij4PG2Yx0ENIvU8s5zKgUidc3y3I4+CRZiturqpVQRCkij4PG2Yx0ENIvU8s5zKgUidc3y3I4+CRZiturqpVQRCkij4PG2Yx0ENIvU8s5zKgUidc3y3I4+CRZiturqpVQRCkij4PG2Yx0ENIvU8s5zKg==');
  }, []);

  // Fetch admin restaurantId
  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("token");
      if (!token) return;

      const me = await fetch("/api/admin/me", {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json());

      if (me?.admin?.restaurantId) {
        setRestaurantId(me.admin.restaurantId);
      }
    }
    load();
  }, []);

  // Fetch orders
  function fetchOrders() {
    if (!restaurantId) return;

    fetch(`/api/admin/orders?restaurantId=${restaurantId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          // Check for new orders and play sound
          if (soundEnabled && data.orders.length > prevOrderCountRef.current) {
            const newOrders = data.orders.filter(o => o.status === 'pending');
            if (newOrders.length > 0 && prevOrderCountRef.current > 0) {
              audioRef.current?.play().catch(() => {});
            }
          }
          prevOrderCountRef.current = data.orders.length;
          setOrders(data.orders);
        }
      });
  }

  useEffect(() => {
    if (restaurantId) fetchOrders();
  }, [restaurantId]);

  // SSE for realtime updates
  useEffect(() => {
    if (!restaurantId) return;

    const sse = new EventSource(`/api/admin/events?restaurantId=${restaurantId}`);

    sse.onmessage = (event) => {
      if (event.data === "connected") return;
      fetchOrders();
    };

    return () => sse.close();
  }, [restaurantId]);

  // Update order status
  async function updateStatus(orderId, status) {
    await fetch("/api/order/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status })
    });
    fetchOrders();
  }

  // Status configuration
  const statusConfig = {
    pending: { icon: Clock, color: "bg-yellow-500", textColor: "text-yellow-600", bgLight: "bg-yellow-50", label: "Pending" },
    accepted: { icon: CheckCircle, color: "bg-blue-500", textColor: "text-blue-600", bgLight: "bg-blue-50", label: "Accepted" },
    preparing: { icon: ChefHat, color: "bg-orange-500", textColor: "text-orange-600", bgLight: "bg-orange-50", label: "Preparing" },
    ready: { icon: PackageCheck, color: "bg-purple-500", textColor: "text-purple-600", bgLight: "bg-purple-50", label: "Ready" },
    completed: { icon: CheckCircle, color: "bg-green-500", textColor: "text-green-600", bgLight: "bg-green-50", label: "Completed" },
    rejected: { icon: XCircle, color: "bg-red-500", textColor: "text-red-600", bgLight: "bg-red-50", label: "Rejected" }
  };

  // Group orders by status
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const activeOrders = orders.filter(o => ['accepted', 'preparing', 'ready'].includes(o.status));
  const completedOrders = orders.filter(o => ['completed', 'rejected'].includes(o.status));

  // Order Card Component
  const OrderCard = ({ order }) => {
    const config = statusConfig[order.status] || statusConfig.pending;
    const StatusIcon = config.icon;

    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
        {/* Header */}
        <div className={`${config.bgLight} px-5 py-4 border-b border-gray-100`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`${config.color} p-2 rounded-lg`}>
                <StatusIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-800">#{order.orderId}</p>
                <p className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
            <div className={`${config.color} px-3 py-1 rounded-full`}>
              <span className="text-white text-xs font-semibold">{config.label}</span>
            </div>
          </div>
          
          {order.tableId && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>📍</span>
              <span>Table {order.tableId}</span>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="px-5 py-4 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 mb-3">ORDER ITEMS</p>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center bg-white rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🍽️</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                  </div>
                </div>
                <span className="font-bold text-gray-800">₹{item.price * item.qty}</span>
              </div>
            ))}
          </div>
          
          {/* Total */}
          <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
            <span className="font-bold text-gray-700">Total</span>
            <span className="font-bold text-lg text-green-600">
              ₹{order.items.reduce((sum, item) => sum + (item.price * item.qty), 0)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 bg-white">
          <div className="flex gap-2 flex-wrap">
            {order.status === "pending" && (
              <>
                <button
                  onClick={() => updateStatus(order._id, "accepted")}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 active:scale-95"
                >
                  ✓ Accept
                </button>
                <button
                  onClick={() => updateStatus(order._id, "rejected")}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 active:scale-95"
                >
                  ✕ Reject
                </button>
              </>
            )}

            {order.status === "accepted" && (
              <button
                onClick={() => updateStatus(order._id, "preparing")}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 active:scale-95"
              >
                👨‍🍳 Start Preparing
              </button>
            )}

            {order.status === "preparing" && (
              <button
                onClick={() => updateStatus(order._id, "ready")}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 active:scale-95"
              >
                📦 Mark Ready
              </button>
            )}

            {order.status === "ready" && (
              <button
                onClick={() => updateStatus(order._id, "completed")}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 active:scale-95"
              >
                ✓ Complete
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-6">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Live Orders</h1>
              <p className="text-sm text-gray-500 mt-1">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'} today
              </p>
            </div>
            
            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-3 rounded-xl transition-all duration-200 ${
                soundEnabled 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <Bell className={`w-5 h-5 ${soundEnabled ? 'animate-pulse' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Empty State */}
        {orders.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
              <ChefHat className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No orders yet</h3>
            <p className="text-gray-500">New orders will appear here automatically</p>
          </div>
        )}

        {/* Pending Orders Section */}
        {pendingOrders.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-1 bg-yellow-500 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-800">
                Pending Orders
                <span className="ml-2 bg-yellow-100 text-yellow-700 text-sm px-3 py-1 rounded-full">
                  {pendingOrders.length}
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingOrders.map(order => (
                <div key={order._id} className="animate-slide-in">
                  <OrderCard order={order} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Orders Section */}
        {activeOrders.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-800">
                Active Orders
                <span className="ml-2 bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full">
                  {activeOrders.length}
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeOrders.map(order => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          </div>
        )}

        {/* Completed Orders Section */}
        {completedOrders.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-1 bg-gray-400 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-800">
                Completed
                <span className="ml-2 bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                  {completedOrders.length}
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedOrders.map(order => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}