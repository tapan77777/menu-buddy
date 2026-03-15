"use client";

import { useEffect, useRef, useState } from "react";

const ACTIVE_ORDER_KEY  = "activeOrderId";
const ACTIVE_STATUS_KEY = "activeOrderStatus";

// How long (ms) to show the celebration screen before auto-closing
const CELEBRATION_DURATION = 4500;

// ── Step definitions ──────────────────────────────────────────────────────────
const STEPS = [
  { key: "pending",   label: "Received",  icon: "🧾", desc: "Waiting for the restaurant to accept your order…"    },
  { key: "accepted",  label: "Accepted",  icon: "✅", desc: "Order accepted! Getting ready to cook."               },
  { key: "preparing", label: "Cooking",   icon: "👨‍🍳", desc: "Your food is being freshly prepared."                 },
  { key: "ready",     label: "Ready!",    icon: "🔔", desc: "Your order is ready — please collect at the counter." },
  { key: "completed", label: "Done",      icon: "🎉", desc: "Enjoy your meal!"                                     },
];

function stepIndex(status) {
  const idx = STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CheckoutPopup({ cartItems, restaurantId, tableId, onClose }) {
  const [view,          setView]          = useState("review");   // review | placing | confirmed | tracking | celebration
  const [order,         setOrder]         = useState(null);
  const [status,        setStatus]        = useState("pending");
  const [minimized,     setMinimized]     = useState(false);
  const [selectedTable, setSelectedTable] = useState(tableId || "");
  const [tableInput,    setTableInput]    = useState(tableId ? String(tableId) : "");
  const [error,         setError]         = useState(null);
  const [countdown,     setCountdown]     = useState(Math.ceil(CELEBRATION_DURATION / 1000));
  const [closing,       setClosing]       = useState(false);      // fade-out flag
  const confirmedTimer    = useRef(null);
  const celebrationTimer  = useRef(null);
  const countdownInterval = useRef(null);

  const total = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

  // ── Restore active order on mount ──────────────────────────────────────────
  useEffect(() => {
    const savedId     = localStorage.getItem(ACTIVE_ORDER_KEY);
    const savedStatus = localStorage.getItem(ACTIVE_STATUS_KEY);
    if (savedId && !["completed", "rejected"].includes(savedStatus)) {
      setView("tracking");
      setOrder({ _id: savedId });
      setStatus(savedStatus || "pending");
    } else {
      localStorage.removeItem(ACTIVE_ORDER_KEY);
      localStorage.removeItem(ACTIVE_STATUS_KEY);
    }
    return () => {
      clearTimeout(confirmedTimer.current);
      clearTimeout(celebrationTimer.current);
      clearInterval(countdownInterval.current);
    };
  }, []);

  // ── When status hits "completed" → switch to celebration then auto-close ───
  useEffect(() => {
    if (status !== "completed") return;

    // Clean up localStorage immediately
    localStorage.removeItem(ACTIVE_ORDER_KEY);
    localStorage.removeItem(ACTIVE_STATUS_KEY);

    setView("celebration");
    setCountdown(Math.ceil(CELEBRATION_DURATION / 1000));

    // Tick countdown every second
    countdownInterval.current = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);

    // Fade-out then call onClose
    celebrationTimer.current = setTimeout(() => {
      clearInterval(countdownInterval.current);
      setClosing(true);
      setTimeout(() => onClose(), 400);
    }, CELEBRATION_DURATION);

    return () => {
      clearInterval(countdownInterval.current);
      clearTimeout(celebrationTimer.current);
    };
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Place order ────────────────────────────────────────────────────────────
  async function placeOrder() {
    setError(null);
    setView("placing");

    const deviceSessionId = getOrCreateDeviceId();
    localStorage.removeItem(ACTIVE_ORDER_KEY);
    localStorage.removeItem(ACTIVE_STATUS_KEY);

    const payload = {
      restaurantId,
      tableId: selectedTable,
      deviceSessionId,
      totalAmount: total,
      items: cartItems.map((i) => ({
        name:   i.name,
        price:  i.price,
        qty:    i.quantity,
        itemId: i._id,
      })),
    };

    try {
      const res  = await fetch("/api/order/create", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();

      if (!data.success) {
        const msg = data.limitReached
          ? "The restaurant is at full capacity right now. Please try again in a little while."
          : (data.error || "Failed to place order. Please try again.");
        setError(msg);
        setView("review");
        return;
      }

      setOrder(data.order);
      setStatus(data.order.status);
      localStorage.setItem(ACTIVE_ORDER_KEY,  data.order._id);
      localStorage.setItem(ACTIVE_STATUS_KEY, data.order.status);

      // Brief "confirmed" flash → then tracking
      setView("confirmed");
      confirmedTimer.current = setTimeout(() => setView("tracking"), 1800);

    } catch {
      setError("Network error. Please check your connection and try again.");
      setView("review");
    }
  }

  // ── SSE live status ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!order?._id) return;
    const stream = new EventSource(`/api/order/events-customer?orderId=${order._id}`);
    stream.onmessage = (e) => {
      if (e.data === "connected") return;
      const d = JSON.parse(e.data);
      setStatus(d.status);
      localStorage.setItem(ACTIVE_STATUS_KEY, d.status);
    };
    return () => stream.close();
  }, [order]);

  // ── Close handler ──────────────────────────────────────────────────────────
  function handleClose() {
    // Don't let the user close mid-celebration — it closes itself
    if (view === "celebration") return;
    if (["completed", "rejected"].includes(status)) {
      localStorage.removeItem(ACTIVE_ORDER_KEY);
      localStorage.removeItem(ACTIVE_STATUS_KEY);
    }
    onClose();
  }

  // ── Minimized bubble ───────────────────────────────────────────────────────
  if (minimized && order) {
    const step = STEPS[stepIndex(status)] ?? STEPS[0];
    return (
      <div
        onClick={() => setMinimized(false)}
        className="fixed bottom-24 right-4 z-[9999] bg-orange-500 text-white px-4 py-3 rounded-2xl shadow-xl cursor-pointer flex items-center gap-3 active:scale-95 transition-transform"
      >
        <span className="text-xl animate-pulse">{step.icon}</span>
        <div className="leading-tight">
          <p className="text-[11px] opacity-80">Order #{order._id?.slice(-6)}</p>
          <p className="text-sm font-bold">{step.label}</p>
        </div>
        <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
        </svg>
      </div>
    );
  }

  // ── Sheet wrapper (bottom-sheet on mobile, centered on sm+) ───────────────
  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-400 ${closing ? "opacity-0" : "opacity-100"}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className={`relative bg-white w-full sm:w-[92%] sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden transition-transform duration-400 ${closing ? "translate-y-8 sm:translate-y-4" : "translate-y-0"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-bold text-gray-900">
            {view === "review"    && "Review Order"}
            {view === "placing"   && "Placing Order…"}
            {view === "confirmed" && "Order Placed!"}
            {view === "tracking"  && "Track Order"}
          </h2>
          <div className="flex items-center gap-2">
            {view === "tracking" && (
              <button
                onClick={() => setMinimized(true)}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition-colors text-sm"
                aria-label="Minimize"
              >
                ↓
              </button>
            )}
            {view !== "celebration" && (
              <button
                onClick={handleClose}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition-colors"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* ── REVIEW ───────────────────────────────────────────────────── */}
          {view === "review" && (
            <div className="px-5 py-4 space-y-4">

              {/* Error banner */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                  <span className="mt-0.5 flex-shrink-0">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Item list */}
              <div className="space-y-2">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">×{item.quantity}</p>
                    </div>
                    <p className="font-bold text-orange-600 text-sm">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center border-t border-dashed border-gray-200 pt-3">
                <span className="text-sm text-gray-500">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""}</span>
                <span className="text-lg font-black text-gray-900">₹{total}</span>
              </div>

              {/* Table selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Table number
                </label>
                {selectedTable ? (
                  <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                    <span className="text-sm font-semibold text-orange-700">Table {selectedTable}</span>
                    <button
                      onClick={() => { setSelectedTable(""); setTableInput(""); }}
                      className="text-xs text-gray-500 underline"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={tableInput}
                      onChange={(e) => setTableInput(e.target.value)}
                      placeholder="Enter table no."
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    />
                    <button
                      onClick={() => {
                        const n = parseInt(tableInput, 10);
                        if (n > 0) setSelectedTable(n);
                      }}
                      disabled={!tableInput || parseInt(tableInput, 10) < 1}
                      className="px-5 py-3 bg-orange-500 disabled:bg-gray-200 text-white disabled:text-gray-400 rounded-xl text-sm font-semibold transition-colors"
                    >
                      Set
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── PLACING ──────────────────────────────────────────────────── */}
          {view === "placing" && (
            <div className="flex flex-col items-center justify-center py-16 px-5 gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-gray-100 border-t-orange-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-3xl">🍽️</div>
              </div>
              <div className="text-center space-y-1">
                <p className="font-bold text-gray-900">Placing your order…</p>
                <p className="text-sm text-gray-400">Just a moment</p>
              </div>
              <div className="flex gap-1.5">
                {[0, 150, 300].map((d) => (
                  <div key={d} className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          )}

          {/* ── CONFIRMED ────────────────────────────────────────────────── */}
          {view === "confirmed" && (
            <div className="flex flex-col items-center justify-center py-14 px-5 gap-5">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-xl font-black text-gray-900">Order Placed! 🎉</p>
                <p className="text-sm text-gray-500">
                  Order #{order?._id?.slice(-6)} · Table {selectedTable}
                </p>
              </div>
              <p className="text-xs text-gray-400 animate-pulse">Opening tracker…</p>
            </div>
          )}

          {/* ── CELEBRATION (auto-closes) ────────────────────────────────── */}
          {view === "celebration" && (
            <div className="flex flex-col items-center justify-center py-10 px-6 gap-6 text-center">
              {/* Confetti burst */}
              <ConfettiBurst />

              {/* Big checkmark */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center animate-[scale-in_0.4s_ease-out]">
                  <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-xl shadow-green-200">
                    <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                {/* Ping rings */}
                <div className="absolute inset-0 rounded-full border-4 border-green-300 animate-ping opacity-40" />
              </div>

              <div className="space-y-2">
                <p className="text-2xl font-black text-gray-900">Enjoy your meal! 🍽️</p>
                <p className="text-sm text-gray-500">
                  Order #{order?._id?.slice(-6)} is complete.
                </p>
              </div>

              {/* Thank-you message */}
              <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 w-full">
                <p className="text-sm text-green-800 font-medium">Thank you for dining with us!</p>
                <p className="text-xs text-green-600 mt-1">We hope to see you again soon.</p>
              </div>

              {/* Auto-close countdown */}
              <p className="text-xs text-gray-400 animate-pulse">
                Closing in {countdown}s…
              </p>
            </div>
          )}

          {/* ── TRACKING ─────────────────────────────────────────────────── */}
          {view === "tracking" && order && (
            <div className="px-5 py-4 space-y-5">

              {/* Order meta */}
              <div className="text-center">
                <p className="text-xs text-gray-400">
                  Order <span className="font-semibold text-gray-700">#{order._id?.slice(-6)}</span>
                  {selectedTable ? ` · Table ${selectedTable}` : ""}
                </p>
              </div>

              {/* Step tracker */}
              <StepTracker status={status} />

              {/* Current status card */}
              <StatusCard status={status} />

              {/* Rejected special case */}
              {status === "rejected" && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                  Unfortunately, the restaurant couldn&apos;t accept your order. Please approach the counter or try again.
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer action */}
        {view === "review" && (
          <div className="px-5 pb-6 pt-3 border-t border-gray-100 flex-shrink-0">
            <button
              onClick={placeOrder}
              disabled={!selectedTable}
              className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                selectedTable
                  ? "bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white shadow-lg shadow-orange-200"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Confirm Order
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {view === "tracking" && (
          <div className="px-5 pb-6 pt-3 border-t border-gray-100 flex-shrink-0">
            <button
              onClick={() => setMinimized(true)}
              className="w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-colors"
            >
              Browse Menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Step tracker component ────────────────────────────────────────────────────
function StepTracker({ status }) {
  const current = stepIndex(status);
  const isRejected = status === "rejected";

  if (isRejected) {
    return (
      <div className="flex items-center justify-center gap-2 bg-red-50 border border-red-200 rounded-2xl py-4">
        <span className="text-2xl">❌</span>
        <span className="font-semibold text-red-700 text-sm">Order Rejected</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Connecting line */}
      <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 -z-0" />
      <div
        className="absolute top-5 left-5 h-0.5 bg-orange-400 -z-0 transition-all duration-700"
        style={{ width: `${(current / (STEPS.length - 1)) * (100 - 10)}%` }}
      />

      <div className="relative flex justify-between">
        {STEPS.map((step, idx) => {
          const done   = idx < current;
          const active = idx === current;

          return (
            <div key={step.key} className="flex flex-col items-center gap-1.5 w-12">
              {/* Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-500 ${
                  done
                    ? "bg-orange-500 shadow-md shadow-orange-200"
                    : active
                    ? "bg-orange-100 ring-2 ring-orange-400 ring-offset-2 animate-pulse"
                    : "bg-gray-100"
                }`}
              >
                {done ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className={active ? "" : "opacity-40"}>{step.icon}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] text-center leading-tight font-medium ${
                  active ? "text-orange-600 font-bold" : done ? "text-gray-600" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Status card ───────────────────────────────────────────────────────────────
function StatusCard({ status }) {
  const step = STEPS[stepIndex(status)] ?? STEPS[0];
  const isActive = ["pending", "preparing"].includes(status);

  return (
    <div className="bg-gray-50 rounded-2xl px-4 py-4 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${
          status === "completed" ? "bg-green-100" :
          status === "rejected"  ? "bg-red-100"   :
          "bg-orange-100"
        }`}
      >
        <span className={isActive ? "animate-bounce" : ""}>{step.icon}</span>
      </div>
      <div>
        <p className={`font-bold text-sm ${
          status === "completed" ? "text-green-700" :
          status === "rejected"  ? "text-red-700"   :
          "text-orange-700"
        }`}>
          {step.label}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.desc}</p>
      </div>
      {isActive && (
        <div className="ml-auto flex gap-1">
          {[0, 200, 400].map((d) => (
            <div key={d} className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Confetti burst ────────────────────────────────────────────────────────────
const CONFETTI_COLORS = ["#f97316", "#22c55e", "#3b82f6", "#a855f7", "#eab308", "#ec4899"];
const CONFETTI_COUNT  = 24;

function ConfettiBurst() {
  const pieces = Array.from({ length: CONFETTI_COUNT }, (_, i) => {
    const angle  = (i / CONFETTI_COUNT) * 360;
    const dist   = 60 + Math.random() * 50;
    const dx     = Math.cos((angle * Math.PI) / 180) * dist;
    const dy     = Math.sin((angle * Math.PI) / 180) * dist;
    const color  = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    const size   = 6 + Math.random() * 6;
    const delay  = Math.random() * 0.3;
    const rotate = Math.random() * 360;
    return { dx, dy, color, size, delay, rotate };
  });

  return (
    <div className="relative w-0 h-0 pointer-events-none" aria-hidden="true">
      {pieces.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-sm"
          style={{
            width:     p.size,
            height:    p.size,
            background: p.color,
            top:        "50%",
            left:       "50%",
            transform:  `translate(-50%,-50%) rotate(${p.rotate}deg)`,
            animation:  `confetti-fly 0.9s ease-out ${p.delay}s both`,
            // CSS custom properties for the keyframe target
            "--dx": `${p.dx}px`,
            "--dy": `${p.dy}px`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fly {
          0%   { opacity: 1; transform: translate(-50%,-50%) scale(1) rotate(0deg); }
          80%  { opacity: 1; }
          100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.4) rotate(180deg); }
        }
        @keyframes scale-in {
          0%   { transform: scale(0);   opacity: 0; }
          60%  { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── Helper ────────────────────────────────────────────────────────────────────
function getOrCreateDeviceId() {
  let id = localStorage.getItem("deviceSessionId");
  if (!id) {
    id = "dev_" + Math.random().toString(36).slice(2);
    localStorage.setItem("deviceSessionId", id);
  }
  return id;
}
