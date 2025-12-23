"use client";

import { useEffect, useState } from "react";

// LocalStorage Keys
const ACTIVE_ORDER_KEY = "activeOrderId";
const ACTIVE_STATUS_KEY = "activeOrderStatus";

export default function CheckoutPopup({
  cartItems,
  restaurantId,
  tableId,
  onClose,
}) {
  const [view, setView] = useState("review"); // review | placing | tracking
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("pending");
  const [minimized, setMinimized] = useState(false);
  const [extraItems, setExtraItems] = useState([]);
  const [selectedTable, setSelectedTable] = useState(tableId || null);


  // ------------------------------------------------------------
  // 1️⃣ Restore active order (persistent popup)
  // ------------------------------------------------------------
useEffect(() => {
  const savedOrderId = localStorage.getItem(ACTIVE_ORDER_KEY);
  const savedStatus = localStorage.getItem(ACTIVE_STATUS_KEY);

  // 🔥 DO NOT restore finished orders
  if (
    savedOrderId &&
    !["completed", "rejected"].includes(savedStatus)
  ) {
    setView("tracking");
    setOrder({ _id: savedOrderId, orderId: savedOrderId });
    setStatus(savedStatus || "pending");
  } else {
    // 🔥 Cleanup just in case
    localStorage.removeItem(ACTIVE_ORDER_KEY);
    localStorage.removeItem(ACTIVE_STATUS_KEY);
  }
}, []);

  // ------------------------------------------------------------
  // 2️⃣ Place Order
  // ------------------------------------------------------------
async function placeOrder() {
  // 🔥 restore device session
  const deviceSessionId = getOrCreateDeviceId();

  // 🔥 clear old active order (important while testing)
  localStorage.removeItem(ACTIVE_ORDER_KEY);
  localStorage.removeItem(ACTIVE_STATUS_KEY);

  setView("placing");

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const payload = {
    restaurantId,
    tableId: selectedTable, // ✅ table now works
    deviceSessionId,        // ✅ now defined
    totalAmount,
    items: cartItems.map((i) => ({
      name: i.name,
      price: i.price,
      qty: i.quantity,
      itemId: i._id,
    })),
  };

  const res = await fetch("/api/order/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!data.success) {
    alert("Failed to place order");
    setView("review");
    return;
  }

  setOrder(data.order);
  setStatus(data.order.status);
  setView("tracking");

  localStorage.setItem(ACTIVE_ORDER_KEY, data.order._id);
  localStorage.setItem(ACTIVE_STATUS_KEY, data.order.status);
}



  // ------------------------------------------------------------
  // 3️⃣ SSE — Live Order Status (NO AUTO CLOSE)
  // ------------------------------------------------------------
  useEffect(() => {
    if (!order?._id) return;

    const stream = new EventSource(
      `/api/order/events-customer?orderId=${order._id}`
    );

    stream.onmessage = (event) => {
      if (event.data === "connected") return;

      const data = JSON.parse(event.data);
      setStatus(data.status);
      localStorage.setItem(ACTIVE_STATUS_KEY, data.status);
    };

    return () => stream.close();
  }, [order]);

// ------------------------------------------------------------
// 4️⃣ Minimized Floating Bubble
// ------------------------------------------------------------
if (minimized && order) {
  return (
    <div
      className="fixed bottom-5 right-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl cursor-pointer hover:shadow-green-500/50 transform hover:scale-105 active:scale-95 transition-all duration-300 z-[9999] group"
      onClick={() => setMinimized(false)}
    >
      <div className="flex items-center gap-3">
        {/* Animated pulse indicator */}
        <div className="relative flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
          <div className="absolute w-2.5 h-2.5 bg-white rounded-full animate-ping"></div>
        </div>

        {/* Content */}
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-medium opacity-90">Order #{order?._id?.slice(-6)}</span>
          <span className="text-sm font-bold tracking-wide">
            {typeof status === "string" ? status.toUpperCase() : "PENDING"}
          </span>
        </div>

        {/* Expand icon */}
        <svg 
          className="w-4 h-4 opacity-80 group-hover:opacity-100 transition-opacity" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
        </svg>
      </div>

      {/* Shine effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
    </div>
  );
}
  // ------------------------------------------------------------
  // 5️⃣ Close Handler (user-controlled)
  // ------------------------------------------------------------
function handleClose() {
  if (["completed", "rejected"].includes(status)) {
    // 🔥 Clear persisted order
    localStorage.removeItem(ACTIVE_ORDER_KEY);
    localStorage.removeItem(ACTIVE_STATUS_KEY);

    // 🔥 Reset popup state so new order is allowed
    setOrder(null);
    setStatus("pending");
    setView("review");
  }

  onClose();
}


  // ------------------------------------------------------------
  // MAIN POPUP UI
  // ------------------------------------------------------------
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-lg z-[9999] flex items-center justify-center">
      <div className="bg-white w-[92%] max-w-lg rounded-2xl shadow-2xl p-7 relative">

        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-4 text-gray-600 hover:text-black"
        >
          ✖
        </button>

        {/* Minimize */}
        <button
          onClick={() => setMinimized(true)}
          className="absolute top-3 right-12 text-gray-600 hover:text-black"
        >
          ⤵
        </button>

{/* REVIEW */}
{view === "review" && (
  <div className="flex flex-col h-full max-h-[80vh]">
    {/* Header - Fixed */}
    <div className="mb-4 text-center flex-shrink-0">
      <div className="inline-block">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Review Your Order
        </h2>
        <div className="h-1 w-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mt-2"></div>
      </div>
      <p className="text-sm text-gray-500 mt-3">
        Please verify your items before confirming
      </p>
    </div>

    {/* Scrollable Cart Items Card */}
    <div
      className="flex-1 overflow-y-auto mb-4 pr-1"
      style={{ scrollbarWidth: "thin" }}
    >
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-5 shadow-lg border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full opacity-20 -mr-16 -mt-16"></div>

        <div className="space-y-3">
          {cartItems.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center py-3 px-4 bg-white rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                  <span className="text-lg">🍽️</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-800 block">
                    {item.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    Quantity: {item.quantity}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="font-bold text-green-600 text-lg">
                  ₹{item.price * item.quantity}
                </span>
                <div className="text-xs text-gray-400">
                  ₹{item.price} each
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-5 pt-4 border-t-2 border-dashed border-gray-200 bg-white rounded-xl -mx-5 px-9 py-3 sticky bottom-0">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-700">
              Total Amount
            </span>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              ₹
              {cartItems.reduce(
                (sum, item) =>
                  sum + item.price * item.quantity,
                0
              )}
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* TABLE SELECTION (ALWAYS VISIBLE + EDITABLE) */}
    <div className="mb-4">
      <p className="text-sm font-semibold text-gray-600 mb-2">
        Select your table number
      </p>

      {selectedTable && (
        <div className="mb-2 text-sm text-green-700 font-semibold flex items-center justify-between">
          <span>Selected Table: {selectedTable}</span>
          <button
            onClick={() => setSelectedTable(null)}
            className="text-xs text-gray-500 underline"
          >
            Change
          </button>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            onClick={() => setSelectedTable(num)}
            className={`min-w-[48px] h-12 rounded-xl border font-bold transition-all
              ${
                selectedTable === num
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-700 border-gray-200 hover:border-green-400"
              }
            `}
          >
            {num}
          </button>
        ))}
      </div>
    </div>

    {/* Confirm Button */}
    <div className="flex-shrink-0">
      <button
        onClick={placeOrder}
        disabled={!selectedTable}
        className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg transition-all duration-300
          ${
            selectedTable
              ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
              : "bg-gray-400 cursor-not-allowed"
          }
        `}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          <span>Confirm Order</span>
          <span className="text-xl">✓</span>
        </span>
      </button>
    </div>
  </div>
)}



        {/* PLACING */}
        {view === "placing" && (
          <div className="text-center py-12">
            {/* Animated loader container */}
            <div className="inline-block relative mb-6">
              {/* Outer spinning ring */}
              <div className="h-24 w-24 rounded-full border-4 border-gray-200 border-t-green-500 animate-spin mx-auto"></div>
              {/* Inner pulsing circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 animate-pulse flex items-center justify-center">
                  <span className="text-3xl">🍽️</span>
                </div>
              </div>
            </div>

            {/* Text content */}
            <div className="space-y-3">
              <p className="text-xl font-bold text-gray-800">
                Placing your order...
              </p>
              <p className="text-sm text-gray-500 animate-pulse">
                Please wait while we process your request
              </p>
            </div>

            {/* Animated dots */}
            <div className="flex justify-center gap-2 mt-6">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-bounce" style={{animationDelay: '0ms'}}></div>
              <div className="h-2 w-2 rounded-full bg-green-500 animate-bounce" style={{animationDelay: '150ms'}}></div>
              <div className="h-2 w-2 rounded-full bg-green-500 animate-bounce" style={{animationDelay: '300ms'}}></div>
            </div>
          </div>
        )}

        {/* CONFIRMED - NEW SUCCESS VIEW */}
        {view === "confirmed" && (
          <div className="text-center py-12">
            {/* Success Animation */}
            <div className="inline-block relative mb-6">
              {/* Checkmark circle with animation */}
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mx-auto animate-scale-in">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10 text-white animate-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              {/* Success ripple rings */}
              <div className="absolute inset-0 rounded-full border-4 border-green-300 animate-ping opacity-75"></div>
              <div className="absolute inset-0 rounded-full border-2 border-green-200 animate-pulse"></div>
            </div>

            {/* Success Message */}
            <div className="space-y-3 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 animate-fade-in">
                Order Placed Successfully! 🎉
              </h2>
              <p className="text-gray-600 animate-fade-in" style={{animationDelay: '0.2s'}}>
                Your order has been received
              </p>
              <p className="text-sm text-gray-500 animate-fade-in" style={{animationDelay: '0.3s'}}>
                Order ID: <span className="font-semibold text-green-600">#{order?._id?.slice(-6)}</span>
              </p>
            </div>

            {/* Info card */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 mb-6 animate-slide-up">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <p className="text-sm font-semibold text-green-800">
                  Waiting for Restaurant Confirmation
                </p>
              </div>
              <p className="text-xs text-green-700">
                The restaurant will review your order shortly
              </p>
            </div>

            {/* Auto redirect message */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 animate-fade-in" style={{animationDelay: '0.5s'}}>
              <div className="h-1 w-1 rounded-full bg-gray-400 animate-pulse"></div>
              <span>Redirecting to order tracking...</span>
            </div>

            {/* Custom animations */}
            <style jsx>{`
              @keyframes scale-in {
                0% {
                  transform: scale(0);
                  opacity: 0;
                }
                50% {
                  transform: scale(1.1);
                }
                100% {
                  transform: scale(1);
                  opacity: 1;
                }
              }
              @keyframes check {
                0% {
                  stroke-dasharray: 0, 100;
                }
                100% {
                  stroke-dasharray: 100, 0;
                }
              }
              @keyframes fade-in {
                0% {
                  opacity: 0;
                  transform: translateY(10px);
                }
                100% {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              @keyframes slide-up {
                0% {
                  opacity: 0;
                  transform: translateY(20px);
                }
                100% {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              .animate-scale-in {
                animation: scale-in 0.5s ease-out;
              }
              .animate-check {
                animation: check 0.5s ease-out 0.3s both;
              }
              .animate-fade-in {
                animation: fade-in 0.6s ease-out both;
              }
              .animate-slide-up {
                animation: slide-up 0.6s ease-out 0.4s both;
              }
            `}</style>
          </div>
        )}

        {/* TRACKING */}
        {view === "tracking" && order && (
          <>
            {/* Header */}
            <div className="mb-6 text-center">
              <div className="inline-block">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Order Status
                </h2>
                <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mt-2"></div>
              </div>
              <p className="text-sm text-gray-500 mt-3 font-medium">
                Order ID: <span className="text-gray-700">#{order._id.slice(-6)}</span>
              </p>
            </div>

            {/* Status Card */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 shadow-lg border border-gray-100 mb-6 relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full opacity-20 -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-100 rounded-full opacity-20 -ml-12 -mb-12"></div>
              
              {/* Status Icon & Text Row */}
              <div className="relative flex items-center gap-4 mb-5">
                {/* Animated Status Dot */}
                <div className="relative">
                  <span
                    className={`block h-14 w-14 rounded-full flex items-center justify-center
                      ${status === "pending" && "bg-yellow-100"}
                      ${status === "accepted" && "bg-blue-100"}
                      ${status === "preparing" && "bg-orange-100"}
                      ${status === "completed" && "bg-green-100"}
                      ${status === "rejected" && "bg-red-100"}
                      ${!status && "bg-gray-100"}
                    `}
                  >
                    <span
                      className={`h-7 w-7 rounded-full
                        ${status === "pending" && "bg-yellow-400 animate-pulse"}
                        ${status === "accepted" && "bg-blue-500"}
                        ${status === "preparing" && "bg-orange-500 animate-pulse"}
                        ${status === "completed" && "bg-green-500"}
                        ${status === "rejected" && "bg-red-500"}
                        ${!status && "bg-gray-400"}
                      `}
                    />
                  </span>
                  {/* Ripple effect for active statuses */}
                  {(status === "pending" || status === "preparing") && (
                    <span className={`absolute inset-0 rounded-full animate-ping opacity-30
                      ${status === "pending" && "bg-yellow-400"}
                      ${status === "preparing" && "bg-orange-500"}
                    `}></span>
                  )}
                </div>
                
                <div className="flex-1">
                  <span className={`block font-bold text-xl capitalize mb-1
                    ${status === "pending" && "text-yellow-600"}
                    ${status === "accepted" && "text-blue-600"}
                    ${status === "preparing" && "text-orange-600"}
                    ${status === "completed" && "text-green-600"}
                    ${status === "rejected" && "text-red-600"}
                    ${!status && "text-gray-600"}
                  `}>
                    {status || "pending"}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full
                      ${status === "pending" && "bg-yellow-400"}
                      ${status === "accepted" && "bg-blue-500"}
                      ${status === "preparing" && "bg-orange-500"}
                      ${status === "completed" && "bg-green-500"}
                      ${status === "rejected" && "bg-red-500"}
                      ${!status && "bg-gray-400"}
                    `}></div>
                    <span className="text-xs text-gray-500 font-medium">Live tracking</span>
                  </div>
                </div>
              </div>

              {/* Friendly Message */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-5 border border-gray-100">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {status === "pending" && "⏰ Waiting for the restaurant to accept your order..."}
                  {status === "accepted" && "✅ Your order has been accepted and will be prepared soon!"}
                  {status === "preparing" && "👨‍🍳 Your food is being prepared with care..."}
                  {status === "completed" && "🎉 Your order is ready. Enjoy your delicious meal!"}
                  {status === "rejected" && "😔 Unfortunately, the restaurant couldn't accept your order."}
                  {!status && "⏰ Waiting for the restaurant to accept your order..."}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="relative">
                <div className="flex justify-between text-xs text-gray-500 mb-2 font-medium">
                  <span>Started</span>
                  <span>
                    {status === "pending" && "25%"}
                    {status === "accepted" && "50%"}
                    {status === "preparing" && "75%"}
                    {(status === "completed" || status === "rejected") && "100%"}
                    {!status && "25%"}
                  </span> 
                </div>
                <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden
                      ${status === "pending" && "w-1/4 bg-gradient-to-r from-yellow-300 to-yellow-500"}
                      ${status === "accepted" && "w-2/4 bg-gradient-to-r from-blue-400 to-blue-600"}
                      ${status === "preparing" && "w-3/4 bg-gradient-to-r from-orange-400 to-orange-600"}
                      ${status === "completed" && "w-full bg-gradient-to-r from-green-400 to-green-600"}
                      ${status === "rejected" && "w-full bg-gradient-to-r from-red-400 to-red-600"}
                      ${!status && "w-1/4 bg-gradient-to-r from-yellow-300 to-yellow-500"}
                    `}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => setMinimized(true)}
              className="w-full bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white transition-all duration-300 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span className="flex items-center justify-center gap-2">
                <span>Browse Menu</span>
                <span className="text-xl">🍽️</span>
              </span>
            </button>

            {/* Add shimmer animation to styles */}
            <style jsx>{`
              @keyframes shimmer {
                0% {
                  transform: translateX(-100%);
                }
                100% {
                  transform: translateX(100%);
                }
              }
              .animate-shimmer {
                animation: shimmer 2s infinite;
              }
            `}</style>
          </>
        )}

      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Helper
// ------------------------------------------------------------
function getOrCreateDeviceId() {
  let id = localStorage.getItem("deviceSessionId");
  if (!id) {
    id = "dev_" + Math.random().toString(36).slice(2);
    localStorage.setItem("deviceSessionId", id);
  }
  return id;
}
