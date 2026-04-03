"use client";

import {
  Ban, Bell, BellOff, CheckCircle, ChefHat, Clock, History,
  Minus, PackageCheck, Plus, RefreshCw, ShoppingCart,
  Smartphone, X, XCircle
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Manual Order Modal ────────────────────────────────────────────────────────

function ManualOrderModal({ restaurantId, onClose, onOrderCreated }) {
  const [step, setStep] = useState(1); // 1=table, 2=items, 3=review
  const [tableId, setTableId] = useState("");
  const [menuGrouped, setMenuGrouped] = useState({});
  const [menuLoading, setMenuLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("");
  const [cart, setCart] = useState({}); // { itemId: { item, qty } }
  const [specialRequests, setSpecialRequests] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch menu on mount
  useEffect(() => {
    fetch("/api/admin/menu")
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setMenuGrouped(data.grouped);
          const cats = Object.keys(data.grouped);
          if (cats.length > 0) setActiveCategory(cats[0]);
        }
      })
      .finally(() => setMenuLoading(false));
  }, []);

  const categories = Object.keys(menuGrouped);
  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((sum, { item, qty }) => sum + item.price * qty, 0);
  const cartCount = cartItems.reduce((sum, { qty }) => sum + qty, 0);

  function addItem(item) {
    const key = String(item._id);
    setCart(prev => ({
      ...prev,
      [key]: { item, qty: (prev[key]?.qty ?? 0) + 1 },
    }));
  }

  function removeItem(item) {
    const key = String(item._id);
    setCart(prev => {
      const current = prev[key]?.qty ?? 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: { item, qty: current - 1 } };
    });
  }

  function getQty(item) {
    return cart[String(item._id)]?.qty ?? 0;
  }

  async function submitOrder() {
    setSubmitting(true);
    setError("");
    try {
      const items = cartItems.map(({ item, qty }) => ({
        itemId: item._id,
        name: item.name,
        price: item.price,
        qty,
      }));

      const res = await fetch("/api/admin/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId, items, specialRequests }),
      });
      const data = await res.json();
      if (data.success) {
        onOrderCreated();
        onClose();
      } else {
        setError(data.error || "Failed to create order");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
          <div>
            <h2 className="text-lg font-bold text-gray-800">New Manual Order</h2>
            <div className="flex items-center gap-2 mt-1">
              {[1, 2, 3].map(s => (
                <div key={s} className="flex items-center gap-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s
                      ? "bg-orange-500 text-white"
                      : step > s
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}>{s}</div>
                  {s < 3 && <div className={`w-6 h-0.5 ${step > s ? "bg-green-500" : "bg-gray-200"}`} />}
                </div>
              ))}
              <span className="text-xs text-gray-500 ml-1">
                {step === 1 ? "Select Table" : step === 2 ? "Pick Items" : "Review"}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Select Table */}
        {step === 1 && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ChefHat className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Which table?</h3>
              <p className="text-gray-500 text-sm mt-1">Enter the table number or leave blank for counter orders</p>
            </div>

            <input
              type="text"
              value={tableId}
              onChange={e => setTableId(e.target.value)}
              placeholder="e.g. 4, A3, Bar-1 (optional)"
              className="w-full max-w-sm text-center text-2xl font-bold border-2 border-gray-200 focus:border-orange-400 rounded-2xl px-4 py-4 outline-none transition-colors"
              autoFocus
              onKeyDown={e => e.key === "Enter" && setStep(2)}
            />

            <button
              onClick={() => setStep(2)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-3 rounded-xl transition-colors text-lg"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 2: Pick Items */}
        {step === 2 && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {menuLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <ChefHat className="w-10 h-10 mx-auto mb-2 animate-bounce text-orange-400" />
                  <p>Loading menu...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto px-4 py-3 border-b border-gray-100 scrollbar-none">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                        activeCategory === cat
                          ? "bg-orange-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Item Grid */}
                <div className="flex-1 overflow-y-auto px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(menuGrouped[activeCategory] || []).map(item => {
                    const qty = getQty(item);
                    return (
                      <div key={item._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-200 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                          <p className="text-orange-600 font-bold text-sm">₹{item.price}</p>
                          {item.bestseller && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">⭐ Best</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {qty > 0 ? (
                            <>
                              <button onClick={() => removeItem(item)} className="w-7 h-7 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg flex items-center justify-center transition-colors">
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-6 text-center font-bold text-gray-800 text-sm">{qty}</span>
                              <button onClick={() => addItem(item)} className="w-7 h-7 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center justify-center transition-colors">
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <button onClick={() => addItem(item)} className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-colors">
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Sticky Cart Summary */}
                <div className="border-t border-gray-200 bg-white px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <ShoppingCart className="w-5 h-5 text-gray-600" />
                        {cartCount > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">{cartCount}</span>
                        )}
                      </div>
                      <span className="text-sm text-gray-600">
                        {cartCount === 0 ? "No items yet" : `${cartCount} item${cartCount > 1 ? "s" : ""}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-green-600">₹{cartTotal}</span>
                      <button
                        onClick={() => setStep(3)}
                        disabled={cartCount === 0}
                        className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold px-5 py-2 rounded-xl text-sm transition-colors"
                      >
                        Review →
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 3: Review & Confirm */}
        {step === 3 && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ChefHat className="w-4 h-4 text-orange-500" />
                  <h4 className="font-bold text-gray-800 text-sm">Order Summary</h4>
                  {tableId && (
                    <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                      Table {tableId}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {cartItems.map(({ item, qty }) => (
                    <div key={item._id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-mono text-xs w-5 text-right">{qty}×</span>
                        <span className="text-gray-700 font-medium">{item.name}</span>
                      </div>
                      <span className="font-semibold text-gray-700">₹{item.price * qty}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between">
                  <span className="font-bold text-gray-700">Total</span>
                  <span className="font-bold text-xl text-green-600">₹{cartTotal}</span>
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Special Requests <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  value={specialRequests}
                  onChange={e => setSpecialRequests(e.target.value)}
                  placeholder="e.g. extra spicy, no onions..."
                  rows={2}
                  className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-xl px-3 py-2 text-sm outline-none resize-none transition-colors"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-gray-100 px-5 py-4 flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-3 rounded-xl transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={submitOrder}
                disabled={submitting}
                className="flex-2 flex-grow-[2] bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-300 text-white font-bold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Placing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Place Order · ₹{cartTotal}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Cancel Confirm Dialog ────────────────────────────────────────────────────

function CancelConfirmDialog({ onConfirm, onClose, cancelling }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Ban className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 text-center mb-1">Cancel this order?</h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          The order will be marked as cancelled. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={cancelling}
            className="flex-1 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            Keep order
          </button>
          <button
            onClick={onConfirm}
            disabled={cancelling}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {cancelling ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Cancelling…
              </>
            ) : "Yes, cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Source Badge ──────────────────────────────────────────────────────────────

function SourceBadge({ source }) {
  if (source === "staff") {
    return (
      <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
        <ChefHat className="w-3 h-3" />
        Staff
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-700 text-xs font-bold px-2 py-0.5 rounded-full">
      <Smartphone className="w-3 h-3" />
      QR
    </span>
  );
}

// ─── Main Orders Page ──────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [cancelConfirmId, setCancelConfirmId] = useState(null); // _id of order awaiting cancel confirm
  const [cancelling, setCancelling] = useState(false);
  const [autoCancelledCount, setAutoCancelledCount] = useState(0);
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
      try {
        const me = await fetch("/api/admin/me").then(r => r.json());
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

  function fetchOrders() {
    if (!restaurantId) return;

    fetch(`/api/admin/orders?restaurantId=${restaurantId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
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

  // SSE with reconnection
  useEffect(() => {
    if (!restaurantId) return;

    function connectSSE() {
      if (sseRef.current) sseRef.current.close();

      const sse = new EventSource(`/api/admin/events?restaurantId=${restaurantId}`);
      sseRef.current = sse;

      sse.onopen = () => { setIsConnected(true); };
      sse.onmessage = (event) => {
        if (event.data === "connected") return;
        fetchOrders();
      };
      sse.onerror = () => {
        setIsConnected(false);
        sse.close();
        setTimeout(connectSSE, 3000);
      };
    }

    connectSSE();
    return () => { if (sseRef.current) sseRef.current.close(); };
  }, [restaurantId]);

  // Auto-cancel stale pending orders (>2h) on page load
  useEffect(() => {
    if (!restaurantId) return;
    fetch("/api/admin/orders/auto-cancel", { method: "POST" })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.cancelled > 0) {
          setAutoCancelledCount(data.cancelled);
          fetchOrders(); // refresh list to reflect auto-cancellations
        }
      })
      .catch(() => {}); // fire-and-forget, non-fatal
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  async function updateStatus(orderId, status) {
    await fetch("/api/order/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status })
    });
    fetchOrders();
  }

  async function handleCancel(orderId) {
    setCancelling(true);
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      setCancelConfirmId(null);
      fetchOrders();
    } catch {
      // next fetchOrders will self-correct
    } finally {
      setCancelling(false);
    }
  }

  const statusConfig = {
    pending: { icon: Clock, color: "bg-yellow-500", textColor: "text-yellow-700", bgLight: "bg-yellow-50", border: "border-yellow-200", label: "New Order" },
    accepted: { icon: CheckCircle, color: "bg-blue-500", textColor: "text-blue-700", bgLight: "bg-blue-50", border: "border-blue-200", label: "Accepted" },
    preparing: { icon: ChefHat, color: "bg-orange-500", textColor: "text-orange-700", bgLight: "bg-orange-50", border: "border-orange-200", label: "Cooking" },
    ready: { icon: PackageCheck, color: "bg-purple-500", textColor: "text-purple-700", bgLight: "bg-purple-50", border: "border-purple-200", label: "Ready" },
    completed: { icon: CheckCircle, color: "bg-green-500", textColor: "text-green-700", bgLight: "bg-green-50", border: "border-green-200", label: "Completed" },
    rejected: { icon: XCircle, color: "bg-red-500", textColor: "text-red-700", bgLight: "bg-red-50", border: "border-red-200", label: "Rejected" },
    expired:   { icon: Clock,    color: "bg-gray-400",  textColor: "text-gray-500",  bgLight: "bg-gray-50",  border: "border-gray-200",  label: "Expired"   },
    cancelled: { icon: Ban,      color: "bg-gray-500",  textColor: "text-gray-600",  bgLight: "bg-gray-50",  border: "border-gray-300",  label: "Cancelled" },
  };

  const activeOrders = orders.filter(o => ['pending', 'accepted', 'preparing', 'ready'].includes(o.status));
  const historyOrders = orders.filter(o => ['completed', 'rejected', 'expired', 'cancelled'].includes(o.status));
  const pendingOrders = activeOrders.filter(o => o.status === 'pending');
  const processingOrders = activeOrders.filter(o => ['accepted', 'preparing', 'ready'].includes(o.status));

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
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-gray-800 text-sm">#{order.orderId}</p>
                  <SourceBadge source={order.orderSource} />
                </div>
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

          {order.meta?.specialRequests && (
            <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1.5 italic">
              📝 {order.meta.specialRequests}
            </p>
          )}

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

          {/* Cancel — only for pending orders */}
          {order.status === "pending" && (
            <button
              onClick={() => setCancelConfirmId(order._id)}
              className="mt-2 w-full border border-gray-300 hover:border-red-300 hover:bg-red-50 text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5"
            >
              <Ban className="w-3.5 h-3.5" />
              Cancel order
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50">
      {/* Cancel Confirmation Dialog */}
      {cancelConfirmId && (
        <CancelConfirmDialog
          cancelling={cancelling}
          onConfirm={() => handleCancel(cancelConfirmId)}
          onClose={() => setCancelConfirmId(null)}
        />
      )}

      {/* Manual Order Modal */}
      {showManualModal && restaurantId && (
        <ManualOrderModal
          restaurantId={restaurantId}
          onClose={() => setShowManualModal(false)}
          onOrderCreated={fetchOrders}
        />
      )}

      {/* Auto-cancel notification banner */}
      {autoCancelledCount > 0 && (
        <div className="fixed bottom-4 right-4 z-40 bg-gray-800 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 max-w-xs">
          <Ban className="w-4 h-4 text-gray-400 shrink-0" />
          <span>{autoCancelledCount} stale order{autoCancelledCount > 1 ? "s" : ""} auto-cancelled (no response &gt;2h)</span>
          <button onClick={() => setAutoCancelledCount(0)} className="ml-2 text-gray-400 hover:text-white shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sticky Header */}
      <div className="bg-white shadow-md sticky top-0 z-10 border-b border-gray-200">
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
                  {activeOrders.length} active • {historyOrders.length} in history
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
              {/* New Order Button */}
              <button
                onClick={() => setShowManualModal(true)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-3 py-2 sm:px-4 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Order</span>
              </button>

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
          <>
            {activeOrders.length === 0 && (
              <div className="text-center py-24 bg-white rounded-3xl shadow-lg border-2 border-dashed border-gray-200">
                <div className="inline-block p-8 bg-gradient-to-br from-green-50 to-blue-50 rounded-full mb-6 animate-bounce-subtle">
                  <ChefHat className="w-20 h-20 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">All caught up! 🎉</h3>
                <p className="text-gray-500 mb-6">Waiting for new orders...</p>

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
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }

        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-10px); }
        }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }

        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}</style>
    </div>
  );
}
