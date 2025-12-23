"use client";

import { Bell, BellOff, CheckCircle, ChefHat, Clock, History, PackageCheck, RefreshCw, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const audioRef = useRef(null);
  const prevOrderCountRef = useRef(0);
  const sseRef = useRef(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUQ0PVqzn77BdGAg+ltryxnMoBSl+zPLaizsIGGS57OihUBALTKXh8bllHAU2jdXzyo06BxpqvO7mnFIPC1Kn4/G4aB4FNYzU8811KwUjds3y3I4+CRZiturqpVQRCkij4PG2Yx0ENIvU8s5zKgUidc3y3I4+CRZiturqpVQRCkij4PG2Yx0ENIvU8s5zKgUidc3y3I4+CRZiturqpVQRCkij4PG2Yx0ENIvU8s5zKgUidc3y3I4+CRZiturqpVQRCkij4PG2Yx0ENIvU8s5zKgUidc3y3I4+CRZiturqpVQRCkij4PG2Yx0ENIvU8s5zKgUidc3y3I4+CRZiturqpVQRCkij4PG2Yx0ENIvU8s5zKgUidc3y3I4+CRZiturqpVQRCkij4PG2Yx0ENIvU8s5zKgUidc3y3I4+CRZiturqpVQRCkij4PG2Yx0ENIvU8s5zKgUidc3y3I4+CRZiturqpVQRCkij4PG2Yx0ENIvU8s5zKg==');
  }, []);

  // Fetch admin restaurantId
  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const me = await fetch("/api/admin/me", {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json());

        if (me?.admin?.restaurantId) {
          setRestaurantId(me.admin.restaurantId);
        }
      } catch (error) {
        console.error("Failed to load admin:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Fetch orders with better error handling
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
          setLoading(false);
        }
      })
      .catch(() => {
        setLoading(false);
        setIsConnected(false);
      });
  }

  useEffect(() => {
    if (restaurantId) fetchOrders();
  }, [restaurantId]);

  // Enhanced SSE with reconnection logic
  useEffect(() => {
    if (!restaurantId) return;

    function connectSSE() {
      // Close existing connection
      if (sseRef.current) {
        sseRef.current.close();
      }

      const sse = new EventSource(`/api/admin/events?restaurantId=${restaurantId}`);
      sseRef.current = sse;

      sse.onopen = () => {
        setIsConnected(true);
        console.log('SSE Connected');
      };

      sse.onmessage = (event) => {
        if (event.data === "connected") return;
        fetchOrders();
      };

      sse.onerror = () => {
        setIsConnected(false);
        console.log('SSE Disconnected, reconnecting...');
        sse.close();
        // Reconnect after 3 seconds
        setTimeout(connectSSE, 3000);
      };
    }

    connectSSE();

    return () => {
      if (sseRef.current) {
        sseRef.current.close();
      }
    };
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
    pending: { icon: Clock, color: "bg-yellow-500", textColor: "text-yellow-700", bgLight: "bg-yellow-50", border: "border-yellow-200", label: "New Order" },
    accepted: { icon: CheckCircle, color: "bg-blue-500", textColor: "text-blue-700", bgLight: "bg-blue-50", border: "border-blue-200", label: "Accepted" },
    preparing: { icon: ChefHat, color: "bg-orange-500", textColor: "text-orange-700", bgLight: "bg-orange-50", border: "border-orange-200", label: "Cooking" },
    ready: { icon: PackageCheck, color: "bg-purple-500", textColor: "text-purple-700", bgLight: "bg-purple-50", border: "border-purple-200", label: "Ready" },
    completed: { icon: CheckCircle, color: "bg-green-500", textColor: "text-green-700", bgLight: "bg-green-50", border: "border-green-200", label: "Completed" },
    rejected: { icon: XCircle, color: "bg-red-500", textColor: "text-red-700", bgLight: "bg-red-50", border: "border-red-200", label: "Rejected" }
  };

  // Filter orders
  const activeOrders = orders.filter(o => ['pending', 'accepted', 'preparing', 'ready'].includes(o.status));
  const historyOrders = orders.filter(o => ['completed', 'rejected'].includes(o.status));
  const pendingOrders = activeOrders.filter(o => o.status === 'pending');
  const processingOrders = activeOrders.filter(o => ['accepted', 'preparing', 'ready'].includes(o.status));

  // Order Card Component
  const OrderCard = ({ order }) => {
    const config = statusConfig[order.status] || statusConfig.pending;
    const StatusIcon = config.icon;
    const totalAmount = order.items.reduce((sum, item) => sum + (item.price * item.qty), 0);

    return (
      <div className={`bg-white rounded-xl shadow-md border-2 ${config.border} overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-[1.02]`}>
        <div className={`${config.bgLight} px-4 py-3 border-b ${config.border}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`${config.color} p-1.5 rounded-lg`}>
                <StatusIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">#{order.orderId}</p>
                <p className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                  {order.tableId && <span className="ml-2">• Table {order.tableId}</span>}
                </p>
              </div>
            </div>
            <div className={`${config.color} px-2.5 py-1 rounded-full`}>
              <span className="text-white text-xs font-bold">{config.label}</span>
            </div>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="space-y-1.5 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-gray-400 font-mono text-xs">{item.qty}x</span>
                  <span className="text-gray-800 font-medium truncate">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-700 ml-2">₹{item.price * item.qty}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
            <span className="font-bold text-gray-700 text-sm">Total</span>
            <span className="font-bold text-lg text-green-600">₹{totalAmount}</span>
          </div>
        </div>

        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex gap-2">
            {order.status === "pending" && (
              <>
                <button
                  onClick={() => updateStatus(order._id, "accepted")}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 active:scale-95 flex items-center justify-center gap-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  Accept
                </button>
                <button
                  onClick={() => updateStatus(order._id, "rejected")}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 active:scale-95 flex items-center justify-center gap-1"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </>
            )}

            {order.status === "accepted" && (
              <button
                onClick={() => updateStatus(order._id, "preparing")}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 active:scale-95 flex items-center justify-center gap-1"
              >
                <ChefHat className="w-4 h-4" />
                Start Cooking
              </button>
            )}

            {order.status === "preparing" && (
              <button
                onClick={() => updateStatus(order._id, "ready")}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 active:scale-95 flex items-center justify-center gap-1"
              >
                <PackageCheck className="w-4 h-4" />
                Mark Ready
              </button>
            )}

            {order.status === "ready" && (
              <button
                onClick={() => updateStatus(order._id, "completed")}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 active:scale-95 flex items-center justify-center gap-1"
              >
                <CheckCircle className="w-4 h-4" />
                Complete
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block p-6 bg-white rounded-3xl shadow-2xl mb-6">
            <ChefHat className="w-16 h-16 text-green-600 animate-bounce" />
          </div>
          <p className="text-xl font-bold text-gray-800 mb-2">Loading orders...</p>
          <div className="flex justify-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
      {/* Sticky Header */}
      <div className="bg-white shadow-md sticky top-0 z-20 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                  Live Orders
                  {isConnected && (
                    <span className="flex items-center gap-1.5 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      Live
                    </span>
                  )}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-2">
                  {activeOrders.length} active • {historyOrders.length} completed
                  {!isConnected && (
                    <span className="text-orange-500 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Reconnecting...
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`p-2 sm:p-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                  showHistory 
                    ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <History className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline text-sm font-semibold">History</span>
              </button>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 sm:p-2.5 rounded-xl transition-all duration-200 shadow-md ${
                  soundEnabled 
                    ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' 
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {soundEnabled ? (
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                ) : (
                  <BellOff className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {showHistory ? (
          /* History View */
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-1.5 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full"></div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Order History</h2>
                <span className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-full font-bold shadow-sm">
                  {historyOrders.length}
                </span>
              </div>
            </div>

            {historyOrders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl shadow-lg border-2 border-dashed border-gray-200">
                <div className="inline-block p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full mb-4">
                  <History className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No order history yet</h3>
                <p className="text-gray-500">Completed orders will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {historyOrders.map(order => (
                  <OrderCard key={order._id} order={order} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Active Orders View */
          <>
            {activeOrders.length === 0 && (
              <div className="text-center py-24 bg-white rounded-3xl shadow-lg border-2 border-dashed border-gray-200">
                <div className="inline-block p-8 bg-gradient-to-br from-green-50 to-blue-50 rounded-full mb-6 animate-bounce-subtle">
                  <ChefHat className="w-20 h-20 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">All caught up! 🎉</h3>
                <p className="text-gray-500 mb-6">Waiting for new orders...</p>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-8">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-2xl">
                    <div className="text-3xl font-bold text-green-600">{orders.length}</div>
                    <div className="text-xs text-green-700 font-medium mt-1">Total Orders</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl">
                    <div className="text-3xl font-bold text-blue-600">{activeOrders.length}</div>
                    <div className="text-xs text-blue-700 font-medium mt-1">Active</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl">
                    <div className="text-3xl font-bold text-purple-600">{historyOrders.length}</div>
                    <div className="text-xs text-purple-700 font-medium mt-1">Completed</div>
                  </div>
                </div>
              </div>
            )}

            {pendingOrders.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-10 w-1.5 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">New Orders</h2>
                  <span className="bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 text-sm px-3 py-1.5 rounded-full font-bold animate-bounce shadow-md">
                    {pendingOrders.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingOrders.map(order => (
                    <div key={order._id} className="animate-slide-in">
                      <OrderCard order={order} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {processingOrders.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-10 w-1.5 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">In Progress</h2>
                  <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 text-sm px-3 py-1.5 rounded-full font-bold shadow-sm">
                    {processingOrders.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {processingOrders.map(order => (
                    <OrderCard key={order._id} order={order} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}