"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const POLL_INTERVAL = 3000; // ms — safe for Vercel serverless

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:   { label: "New",     bg: "bg-red-950/40",    border: "border-red-500",    dot: "bg-red-400",    ring: "ring-red-500/40"    },
  accepted:  { label: "Accepted", bg: "bg-blue-950/40",  border: "border-blue-500",   dot: "bg-blue-400",   ring: "ring-blue-500/40"   },
  preparing: { label: "Cooking", bg: "bg-orange-950/40", border: "border-orange-500", dot: "bg-orange-400", ring: "ring-orange-500/40" },
  ready:     { label: "Ready",   bg: "bg-green-950/40",  border: "border-green-500",  dot: "bg-green-400",  ring: "ring-green-500/40"  },
};

const NEXT_ACTION = {
  pending:   { label: "Accept",        nextStatus: "accepted",  color: "bg-blue-600 hover:bg-blue-500 active:bg-blue-700"     },
  accepted:  { label: "Start Cooking", nextStatus: "preparing", color: "bg-orange-600 hover:bg-orange-500 active:bg-orange-700" },
  preparing: { label: "Mark Ready ✓", nextStatus: "ready",     color: "bg-green-600 hover:bg-green-500 active:bg-green-700"   },
  ready:     { label: "Complete",      nextStatus: "completed", color: "bg-gray-600 hover:bg-gray-500 active:bg-gray-700"      },
};

// ── Beep on new order ──────────────────────────────────────────────────────────
function playBeep() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
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

// ── Time elapsed (re-computed on every render triggered by clock tick) ────────
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

// ── Order Card ────────────────────────────────────────────────────────────────
function OrderCard({ order, isNew, onStatusChange, updatingId }) {
  const cfg    = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const action = NEXT_ACTION[order.status];
  const busy   = updatingId === order._id;

  return (
    <div
      className={`
        flex flex-col rounded-2xl border-2 overflow-hidden transition-all duration-300
        ${cfg.border} ${cfg.bg}
        ${isNew ? `ring-4 ${cfg.ring} scale-[1.02]` : "scale-100"}
      `}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div>
          <p className="text-3xl font-black text-white tracking-tight leading-none">
            {order.tableId ? `TABLE ${order.tableId}` : "TAKEAWAY"}
          </p>
          <p className="text-xs text-white/50 mt-1">#{order.orderId} · {timeAgo(order.createdAt)}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {isNew && (
            <span className="text-[10px] font-black text-white bg-red-500 px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
              NEW
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
            <span className="text-xs font-bold text-white/70 uppercase tracking-widest">{cfg.label}</span>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 px-5 py-4 space-y-2.5">
        {(order.items ?? []).map((item, i) => (
          <div key={i} className="flex items-baseline justify-between gap-3">
            <span className="text-base font-semibold text-white leading-snug">{item.name}</span>
            <span className="text-xl font-black text-white/80 shrink-0 tabular-nums">×{item.qty}</span>
          </div>
        ))}
        {order.specialRequests && (
          <p className="text-xs text-yellow-300 bg-yellow-950/50 border border-yellow-900 rounded-xl px-3 py-2 mt-2">
            📝 {order.specialRequests}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-white/50">
          ₹{(order.totalAmount ?? 0).toLocaleString("en-IN")}
        </span>
        {action && (
          <button
            onClick={() => onStatusChange(order._id, action.nextStatus)}
            disabled={busy}
            className={`flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${action.color}`}
          >
            {busy ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Updating…
              </span>
            ) : action.label}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main KDS Page ──────────────────────────────────────────────────────────────
export default function KitchenDisplay() {
  const [restaurantId,   setRestaurantId]   = useState(null);
  const [restaurantName, setRestaurantName] = useState("Kitchen Display");
  const [orders,         setOrders]         = useState([]);
  const [newOrderIds,    setNewOrderIds]     = useState(new Set()); // highlighted IDs
  const [updatingId,     setUpdatingId]      = useState(null);
  const [status,         setStatus]          = useState("connecting"); // "live" | "connecting" | "error"
  const [time,           setTime]            = useState(new Date());
  const [lastPoll,       setLastPoll]        = useState(null);

  const knownIds    = useRef(new Set()); // tracks all IDs seen so far
  const pollRef     = useRef(null);
  const initialLoad = useRef(true);

  // ── Read URL params ──────────────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rid    = params.get("rid");
    const rname  = params.get("name");
    if (rid) {
      setRestaurantId(rid);
      if (rname) setRestaurantName(decodeURIComponent(rname));
    }
  }, []);

  // ── Clock tick — drives the "X min ago" timestamps ───────────────────────────
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Polling logic ────────────────────────────────────────────────────────────
  const poll = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const res  = await fetch(`/api/orders/kitchen?restaurantId=${restaurantId}`);
      const data = await res.json();

      if (!data.success) { setStatus("error"); return; }

      const incoming = data.orders ?? [];
      setLastPoll(new Date());

      // Detect genuinely new orders (not present on previous poll)
      const newIds = incoming
        .map((o) => o._id)
        .filter((id) => !knownIds.current.has(id));

      if (newIds.length > 0) {
        // Skip beep on the very first load (don't alarm for existing orders)
        if (!initialLoad.current) playBeep();

        // Highlight new cards
        setNewOrderIds((prev) => {
          const next = new Set(prev);
          newIds.forEach((id) => next.add(id));
          return next;
        });

        // Remove highlight after 5 seconds
        setTimeout(() => {
          setNewOrderIds((prev) => {
            const next = new Set(prev);
            newIds.forEach((id) => next.delete(id));
            return next;
          });
        }, 5000);
      }

      // Update the known-IDs registry
      incoming.forEach((o) => knownIds.current.add(o._id));
      initialLoad.current = false;

      setOrders(incoming);
      setStatus("live");

    } catch {
      setStatus("error");
    }
  }, [restaurantId]);

  // ── Start polling when restaurantId is ready ──────────────────────────────────
  useEffect(() => {
    if (!restaurantId) return;

    poll(); // immediate first fetch

    pollRef.current = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [restaurantId, poll]);

  // ── Status update handler ────────────────────────────────────────────────────
  async function handleStatusChange(orderId, newStatus) {
    setUpdatingId(orderId);
    try {
      await fetch("/api/order/update", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ orderId, status: newStatus }),
      });
      // Optimistically remove "completed" orders from the list immediately
      if (newStatus === "completed") {
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
        knownIds.current.delete(orderId);
      } else {
        // Update status in-place so the card reflects the change before next poll
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch {
      // Next poll will self-correct
    } finally {
      setUpdatingId(null);
    }
  }

  // ── Derived counts ────────────────────────────────────────────────────────────
  const pendingCount   = orders.filter((o) => o.status === "pending").length;
  const preparingCount = orders.filter((o) => o.status === "preparing").length;
  const readyCount     = orders.filter((o) => o.status === "ready").length;

  // ── No restaurantId — show setup hint ────────────────────────────────────────
  if (!restaurantId) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🍳</span>
          </div>
          <p className="text-xl font-bold text-white mb-2">Kitchen Display</p>
          <p className="text-gray-400 text-sm mb-4">Open this page with your restaurant ID:</p>
          <code className="bg-gray-800 text-orange-400 text-sm px-4 py-2 rounded-xl">
            /kitchen?rid=YOUR_RESTAURANT_ID
          </code>
          <p className="text-gray-600 text-xs mt-4">
            Find your Restaurant ID in the admin dashboard URL or settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 sm:px-5 py-3 flex items-center justify-between gap-3 shrink-0">

        {/* Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-base">🍽️</span>
          </div>
          <div className="min-w-0 hidden sm:block">
            <p className="text-sm font-bold text-white truncate leading-tight">{restaurantName}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Kitchen Display</p>
          </div>
        </div>

        {/* Live order counts */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {pendingCount > 0 && (
            <span className="flex items-center gap-1.5 bg-red-900/60 border border-red-700 text-red-300 text-xs font-bold px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              {pendingCount} new
            </span>
          )}
          {preparingCount > 0 && (
            <span className="text-xs font-semibold text-orange-400 bg-orange-900/40 border border-orange-900 px-3 py-1.5 rounded-full">
              {preparingCount} cooking
            </span>
          )}
          {readyCount > 0 && (
            <span className="text-xs font-semibold text-green-400 bg-green-900/40 border border-green-900 px-3 py-1.5 rounded-full">
              {readyCount} ready
            </span>
          )}
          {orders.length === 0 && status === "live" && (
            <span className="text-xs text-gray-500">No active orders</span>
          )}
        </div>

        {/* Clock + poll status */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm font-mono font-semibold text-gray-300 hidden sm:block">
            {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <div className={`flex items-center gap-1.5 text-[10px] font-semibold ${
            status === "live"       ? "text-green-400" :
            status === "error"      ? "text-red-400"   :
            "text-yellow-400"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              status === "live"  ? "bg-green-400 animate-pulse" :
              status === "error" ? "bg-red-400"                 :
              "bg-yellow-400 animate-pulse"
            }`} />
            {status === "live"       ? "Live" :
             status === "error"      ? "Error" :
             "Connecting…"}
          </div>
        </div>
      </header>

      {/* ── Order Grid ──────────────────────────────────────────────────── */}
      <main className="flex-1 p-4 sm:p-5 overflow-auto">
        {status === "connecting" && orders.length === 0 ? (
          // Initial loading skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border-2 border-gray-800 bg-gray-900/50 animate-pulse h-64" />
            ))}
          </div>
        ) : status === "error" && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-64 text-center">
            <div className="w-16 h-16 bg-red-950 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <p className="text-base font-bold text-red-400">Connection error</p>
            <p className="text-sm text-gray-600 mt-1">Retrying every {POLL_INTERVAL / 1000} seconds…</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-64 text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">🍳</span>
            </div>
            <p className="text-lg font-bold text-gray-400">No active orders</p>
            <p className="text-sm text-gray-600 mt-1">
              New orders appear here within {POLL_INTERVAL / 1000} seconds
            </p>
            {lastPoll && (
              <p className="text-xs text-gray-700 mt-3">
                Last checked: {lastPoll.toLocaleTimeString("en-IN")}
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                isNew={newOrderIds.has(order._id)}
                onStatusChange={handleStatusChange}
                updatingId={updatingId}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Footer: poll indicator ───────────────────────────────────────── */}
      {status === "live" && (
        <div className="shrink-0 text-center py-2">
          <p className="text-[10px] text-gray-700">
            Auto-refreshing every {POLL_INTERVAL / 1000}s ·{" "}
            {lastPoll && `Last updated ${lastPoll.toLocaleTimeString("en-IN")}`}
          </p>
        </div>
      )}
    </div>
  );
}
