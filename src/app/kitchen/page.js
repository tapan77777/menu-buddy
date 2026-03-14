"use client";

import { useEffect, useRef, useState } from "react";

// ── Statuses shown in KDS (completed/rejected are hidden) ─────────────────────
const ACTIVE_STATUSES = ["pending", "accepted", "preparing", "ready"];

const STATUS_CONFIG = {
  pending:   { label: "New",       bg: "bg-red-950/40",    border: "border-red-500",    dot: "bg-red-400"    },
  accepted:  { label: "Accepted",  bg: "bg-blue-950/40",   border: "border-blue-500",   dot: "bg-blue-400"   },
  preparing: { label: "Cooking",   bg: "bg-orange-950/40", border: "border-orange-500", dot: "bg-orange-400" },
  ready:     { label: "Ready",     bg: "bg-green-950/40",  border: "border-green-500",  dot: "bg-green-400"  },
};

// Next action for each status
const NEXT_ACTION = {
  pending:   { label: "Accept",         nextStatus: "accepted",  color: "bg-blue-600 hover:bg-blue-500"   },
  accepted:  { label: "Start Cooking",  nextStatus: "preparing", color: "bg-orange-600 hover:bg-orange-500" },
  preparing: { label: "Mark Ready ✓",  nextStatus: "ready",     color: "bg-green-600 hover:bg-green-500"  },
  ready:     { label: "Complete",       nextStatus: "completed", color: "bg-gray-600 hover:bg-gray-500"    },
};

// ── Simple beep on new order ──────────────────────────────────────────────────
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  } catch {}
}

// ── Time elapsed ─────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)  return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

// ── Order Card ────────────────────────────────────────────────────────────────
function OrderCard({ order, onStatusChange, updating }) {
  const cfg    = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const action = NEXT_ACTION[order.status];

  return (
    <div
      className={`flex flex-col rounded-2xl border-2 ${cfg.border} ${cfg.bg} overflow-hidden transition-all duration-300`}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div>
          <p className="text-3xl font-black text-white tracking-tight">
            {order.tableId ? `TABLE ${order.tableId}` : "TAKEAWAY"}
          </p>
          <p className="text-xs text-white/50 mt-0.5">#{order.orderId} · {timeAgo(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot} animate-pulse`} />
          <span className="text-xs font-bold text-white/70 uppercase tracking-widest">{cfg.label}</span>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 px-5 py-4 space-y-2">
        {(order.items ?? []).map((item, i) => (
          <div key={i} className="flex items-baseline justify-between gap-3">
            <span className="text-base font-semibold text-white leading-snug">
              {item.name}
            </span>
            <span className="text-lg font-black text-white/80 shrink-0">×{item.qty}</span>
          </div>
        ))}
        {order.specialRequests && (
          <p className="text-xs text-yellow-300 bg-yellow-950/40 rounded-lg px-3 py-2 mt-3">
            📝 {order.specialRequests}
          </p>
        )}
      </div>

      {/* Footer: amount + action button */}
      <div className="px-5 py-4 border-t border-white/10 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-white/60">
          ₹{(order.totalAmount ?? 0).toLocaleString("en-IN")}
        </span>
        {action && (
          <button
            onClick={() => onStatusChange(order._id, action.nextStatus)}
            disabled={updating === order._id}
            className={`flex-1 py-3 rounded-xl text-sm font-bold text-white ${action.color} active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {updating === order._id ? "Updating…" : action.label}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main KDS Page ─────────────────────────────────────────────────────────────
export default function KitchenDisplay() {
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState("Kitchen Display");
  const [orders, setOrders]     = useState([]);
  const [updating, setUpdating] = useState(null); // orderId being updated
  const [connected, setConnected] = useState(false);
  const [time, setTime]         = useState(new Date());
  const prevOrderIds            = useRef(new Set());
  const esRef                   = useRef(null);

  // Read restaurantId from URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rid = params.get("rid");
    const rname = params.get("name");
    if (rid) {
      setRestaurantId(rid);
      if (rname) setRestaurantName(decodeURIComponent(rname));
    }
  }, []);

  // Clock tick every second (also forces time-ago re-renders)
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // SSE connection
  useEffect(() => {
    if (!restaurantId) return;

    function connect() {
      if (esRef.current) esRef.current.close();

      const es = new EventSource(`/api/order/events?restaurantId=${restaurantId}`);
      esRef.current = es;

      es.onmessage = (event) => {
        if (event.data === "connected") { setConnected(true); return; }
        try {
          const all = JSON.parse(event.data);

          // Filter to only active orders, oldest first
          const active = all
            .filter((o) => ACTIVE_STATUSES.includes(o.status))
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

          // Detect new orders and beep
          const newIds = new Set(active.map((o) => o._id));
          const hasNew = [...newIds].some((id) => !prevOrderIds.current.has(id));
          if (hasNew && prevOrderIds.current.size > 0) playBeep();
          prevOrderIds.current = newIds;

          setOrders(active);
          setConnected(true);
        } catch {}
      };

      es.onerror = () => {
        setConnected(false);
        es.close();
        // Reconnect after 3 seconds
        setTimeout(connect, 3000);
      };
    }

    connect();
    return () => esRef.current?.close();
  }, [restaurantId]);

  // Update order status
  async function handleStatusChange(orderId, newStatus) {
    setUpdating(orderId);
    try {
      await fetch("/api/order/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
    } catch {
      // SSE will sync state anyway
    } finally {
      setUpdating(null);
    }
  }

  // Counts
  const pendingCount   = orders.filter((o) => o.status === "pending").length;
  const preparingCount = orders.filter((o) => o.status === "preparing").length;
  const readyCount     = orders.filter((o) => o.status === "ready").length;

  if (!restaurantId) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-white mb-2">Kitchen Display</p>
          <p className="text-gray-400 text-sm">
            Open this page with{" "}
            <code className="bg-gray-800 px-2 py-0.5 rounded text-orange-400">
              /kitchen?rid=RESTAURANT_ID
            </code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="bg-gray-900 border-b border-gray-800 px-5 py-3 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-base">🍽️</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">{restaurantName}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Kitchen Display</p>
          </div>
        </div>

        {/* Live counts */}
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <span className="flex items-center gap-1.5 bg-red-900/60 border border-red-700 text-red-300 text-xs font-bold px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              {pendingCount} new
            </span>
          )}
          {preparingCount > 0 && (
            <span className="text-xs font-semibold text-orange-400 bg-orange-900/40 px-3 py-1.5 rounded-full">
              {preparingCount} cooking
            </span>
          )}
          {readyCount > 0 && (
            <span className="text-xs font-semibold text-green-400 bg-green-900/40 px-3 py-1.5 rounded-full">
              {readyCount} ready
            </span>
          )}
        </div>

        {/* Clock + connection */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm font-mono font-semibold text-gray-300">
            {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <span className={`flex items-center gap-1.5 text-[10px] font-semibold ${connected ? "text-green-400" : "text-red-400"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`} />
            {connected ? "Live" : "Reconnecting…"}
          </span>
        </div>
      </header>

      {/* ── Order Grid ─────────────────────────────────────────────────── */}
      <main className="flex-1 p-4 sm:p-5 overflow-auto">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-64 text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">🍳</span>
            </div>
            <p className="text-lg font-bold text-gray-400">No active orders</p>
            <p className="text-sm text-gray-600 mt-1">New orders will appear here automatically</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onStatusChange={handleStatusChange}
                updating={updating}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
