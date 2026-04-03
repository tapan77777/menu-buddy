"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(n) {
  if (n == null) return "—";
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString("en-IN");
}

function fmtCurrency(n) {
  if (n == null) return "—";
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000)   return `₹${(n / 1000).toFixed(1)}k`;
  return `₹${n.toLocaleString("en-IN")}`;
}

const STATUS_COLOR = {
  completed: "bg-green-100 text-green-700",
  accepted:  "bg-blue-100 text-blue-700",
  preparing: "bg-orange-100 text-orange-700",
  ready:     "bg-purple-100 text-purple-700",
  pending:   "bg-yellow-100 text-yellow-700",
  rejected:  "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-600",
};

const RANGE_OPTIONS = [
  { id: "today", label: "Today" },
  { id: "week",  label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "all",   label: "All Time" },
];

// Fill in the last N days for sparkline, padding missing days with 0
function buildTimelineDays(rawData, days = 7) {
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const found = rawData?.find((x) => x._id === key);
    result.push({ date: key, count: found?.count ?? 0, revenue: found?.revenue ?? 0 });
  }
  return result;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function TrendBadge({ pct }) {
  if (pct == null) return null;
  const up = pct >= 0;
  return (
    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
      up ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
    }`}>
      {up ? "↑" : "↓"}{Math.abs(pct)}%
    </span>
  );
}

function Sparkline({ data, color = "#EF4444" }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data.map((d) => d.count), 1);
  const W = 72, H = 24;
  const step = W / (data.length - 1);
  const pts = data
    .map((d, i) => `${i * step},${H - (d.count / max) * H}`)
    .join(" ");
  const filled = data
    .map((d, i) => `${i * step},${H - (d.count / max) * H}`)
    .concat([`${(data.length - 1) * step},${H}`, "0,${H}"])
    .join(" ");

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

function StatCard({ icon, label, value, sub, accent = "red", pct, href, sparkData, sparkColor }) {
  const accents = {
    red:    "bg-red-50 text-red-600",
    orange: "bg-orange-50 text-orange-600",
    blue:   "bg-blue-50 text-blue-600",
    green:  "bg-green-50 text-green-600",
  };
  const inner = (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 ${href ? "hover:shadow-md transition-shadow cursor-pointer" : ""}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${accents[accent]}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-2xl font-extrabold text-gray-900 leading-none">{value}</p>
          <TrendBadge pct={pct} />
        </div>
        <p className="text-sm font-medium text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {sparkData && (
        <div className="flex-shrink-0 opacity-60">
          <Sparkline data={sparkData} color={sparkColor} />
        </div>
      )}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function RankBar({ rank, label, value, maxValue, suffix = "views" }) {
  const pct = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-xs font-bold text-gray-400 w-5 flex-shrink-0">#{rank}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-800 truncate pr-2">{label}</span>
          <span className="text-xs text-gray-500 flex-shrink-0">{fmt(value)} {suffix}</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-100 rounded-xl" />
        <div className="space-y-2">
          <div className="h-6 bg-gray-100 rounded w-20" />
          <div className="h-3 bg-gray-100 rounded w-28" />
        </div>
      </div>
    </div>
  );
}

// ── Restaurant selector ───────────────────────────────────────────────────────

function RestaurantSelector({ restaurants, selectedId, onChange }) {
  return (
    <div className="relative inline-block">
      <select
        value={selectedId || ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="appearance-none bg-white border border-gray-200 text-gray-800 text-sm font-semibold pl-4 pr-9 py-2.5 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-300 cursor-pointer min-w-[200px]"
      >
        <option value="">All Restaurants</option>
        {restaurants.map((r) => (
          <option key={r._id} value={r._id}>{r.name}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
    </div>
  );
}

// ── Range tabs ────────────────────────────────────────────────────────────────

function RangeTabs({ range, onChange }) {
  return (
    <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-0.5">
      {RANGE_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            range === opt.id
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function OwnerDashboardPage() {
  const router = useRouter();

  const [stats,        setStats]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [selectedId,   setSelectedId]   = useState(null);   // null = All
  const [range,        setRange]        = useState("all");
  const [filtering,    setFiltering]    = useState(false);  // subtle reload indicator

  // Initial load + re-fetch when filters change
  const fetchStats = useCallback(async (restaurantId, dateRange, isInitial = false) => {
    if (isInitial) setLoading(true); else setFiltering(true);
    try {
      const params = new URLSearchParams();
      if (restaurantId) params.set("restaurantId", restaurantId);
      if (dateRange)    params.set("range", dateRange);
      const res = await fetch(`/api/owner/stats?${params.toString()}`);
      if (res.status === 401 || res.status === 403) { router.replace("/"); return; }
      const data = await res.json();
      if (data.success) setStats(data.stats);
      else setError(data.error || "Failed to load stats");
    } catch {
      setError("Network error");
    } finally {
      if (isInitial) setLoading(false); else setFiltering(false);
    }
  }, [router]);

  useEffect(() => { fetchStats(null, "all", true); }, [fetchStats]);

  const handleRestaurantChange = (id) => {
    setSelectedId(id);
    fetchStats(id, range);
  };

  const handleRangeChange = (r) => {
    setRange(r);
    fetchStats(selectedId, r);
  };

  // ── Loading skeleton ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f6f4] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-60 mb-8 animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-64 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7f6f4] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-4xl">⚠️</p>
          <p className="text-gray-700 font-medium">{error}</p>
          <Link href="/" className="text-red-600 text-sm hover:underline">← Back to home</Link>
        </div>
      </div>
    );
  }

  const {
    restaurants,
    totalRestaurants, totalMenuItems, totalOrders, totalRevenue,
    completedOrders,  todayOrders,    todayRevenue,
    ordersPctChange,  revenuePctChange,
    restaurantsByCity, topRestaurants, topItems, topSearches, ordersByStatus,
    ordersTimeline,
  } = stats;

  const maxViews       = topRestaurants[0]?.totalViews ?? 1;
  const maxItemClicks  = topItems[0]?.clicks           ?? 1;
  const maxSearchCount = topSearches[0]?.count         ?? 1;

  const timelineDays   = buildTimelineDays(ordersTimeline, 7);

  // Sub-stat label for date range context
  const rangeLabel = RANGE_OPTIONS.find((o) => o.id === range)?.label ?? "";

  // When a specific range is selected (not "all"), show today sub if range isn't today
  const showTodaySub = range !== "today";

  // Which restaurant name is shown in header
  const selectedRestaurant = selectedId
    ? restaurants.find((r) => r._id === selectedId)
    : null;

  return (
    <div className={`min-h-screen bg-[#f7f6f4] transition-opacity ${filtering ? "opacity-80" : "opacity-100"}`}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 py-3.5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-extrabold">
              Menu<span className="text-red-600">Buddy</span>
            </Link>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span className="hidden sm:inline text-sm font-semibold text-gray-500">Dashboard</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/owner/qr-generator"
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 border border-gray-200 hover:border-red-300 hover:text-red-600 px-3 py-2 rounded-xl transition-colors bg-white"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="4" height="4"/>
              </svg>
              QR Card Designer
            </Link>
            <Link href="/" className="text-sm text-gray-500 hover:text-red-600 transition-colors font-medium">
              ← Back to site
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">

        {/* ── Filters bar ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <RestaurantSelector
              restaurants={restaurants}
              selectedId={selectedId}
              onChange={handleRestaurantChange}
            />
            {selectedRestaurant && (
              <span className="text-xs text-gray-400 hidden sm:inline">
                {selectedRestaurant.city || selectedRestaurant.address || ""}
              </span>
            )}
          </div>
          <RangeTabs range={range} onChange={handleRangeChange} />
        </div>

        {/* ── A. Overview ──────────────────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            Overview
            {range !== "all" && <span className="ml-2 text-gray-300 normal-case font-normal">— {rangeLabel}</span>}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon="🍴" label="Restaurants" accent="red"
              value={fmt(totalRestaurants)}
            />
            <StatCard
              icon="📋" label="Menu Items" accent="orange"
              value={fmt(totalMenuItems)}
              href="/admin/dashboard/menuManagement"
            />
            <StatCard
              icon="🧾" label={range === "all" ? "Total Orders" : `Orders (${rangeLabel})`}
              accent="blue"
              value={fmt(totalOrders)}
              pct={ordersPctChange}
              sub={showTodaySub ? `Today: ${fmt(todayOrders)}` : `${fmt(completedOrders)} completed`}
              href="/admin/dashboard/orders"
              sparkData={timelineDays}
              sparkColor="#3B82F6"
            />
            <StatCard
              icon="💰" label={range === "all" ? "Revenue" : `Revenue (${rangeLabel})`}
              accent="green"
              value={fmtCurrency(totalRevenue)}
              pct={revenuePctChange}
              sub={showTodaySub ? `Today: ${fmtCurrency(todayRevenue)}` : "Completed orders"}
              href="/admin/dashboard/orders"
            />
          </div>
        </section>

        {/* ── B + C. Insights ───────────────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Insights</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Top restaurants (global) — hidden when filtering to single restaurant */}
            {!selectedId && (
              <SectionCard title="Top Restaurants by Views" icon="📍">
                {topRestaurants.length === 0 ? (
                  <p className="text-sm text-gray-400">No view data yet. Data populates as customers browse menus.</p>
                ) : (
                  <div className="space-y-1">
                    {topRestaurants.map((r, i) => (
                      <div key={r.slug} className="flex items-center gap-3 py-2 group">
                        <span className="text-xs font-bold text-gray-400 w-5 flex-shrink-0">#{i + 1}</span>
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {r.logoUrl ? (
                            <Image src={r.logoUrl} alt={r.name} width={32} height={32} className="object-cover w-full h-full" />
                          ) : (
                            <span className="text-sm font-bold text-red-600">
                              {r.name?.charAt(0)?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <Link
                              href={`/restaurant/${r.slug}`}
                              className="text-sm font-semibold text-gray-800 truncate pr-2 group-hover:text-red-600 transition-colors"
                            >
                              {r.name}
                            </Link>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className="text-xs text-gray-500">{fmt(r.totalViews)} views</span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full transition-all duration-500"
                              style={{ width: `${Math.round((r.totalViews / maxViews) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            )}

            {/* Most clicked dishes */}
            <SectionCard
              title={selectedId ? "Most Clicked Dishes" : "Most Clicked Dishes (All)"}
              icon="🍽️"
            >
              {topItems.length === 0 ? (
                <p className="text-sm text-gray-400">No item click data yet.</p>
              ) : (
                <div className="space-y-1">
                  {topItems.map((item, i) => (
                    <RankBar
                      key={item.name}
                      rank={i + 1}
                      label={item.name}
                      value={item.clicks}
                      maxValue={maxItemClicks}
                      suffix="clicks"
                    />
                  ))}
                </div>
              )}
            </SectionCard>

          </div>
        </section>

        {/* ── D + E. Search & Location ──────────────────────────────────── */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Search keywords — global */}
            <SectionCard title="Top Search Keywords" icon="🔍">
              {topSearches.length === 0 ? (
                <p className="text-sm text-gray-400">No searches recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {topSearches.map((s, i) => (
                    <div key={s.keyword} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-300 w-5 flex-shrink-0">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 truncate pr-2">{s.keyword}</span>
                          <span className="text-xs text-gray-500 flex-shrink-0">{fmt(s.count)}×</span>
                        </div>
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"
                            style={{ width: `${Math.round((s.count / maxSearchCount) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* Restaurants by city — hidden if no city data */}
            {restaurantsByCity.length > 0 && (
              <SectionCard title="Restaurants by City" icon="🗺️">
                <div className="grid grid-cols-2 gap-2">
                  {restaurantsByCity.map((c) => (
                    <div
                      key={c.city}
                      className="flex items-center justify-between bg-gray-50 hover:bg-orange-50 rounded-xl px-3 py-2 transition-colors group"
                    >
                      <span className="text-sm text-gray-700 group-hover:text-orange-700 font-medium truncate pr-2">
                        {c.city}
                      </span>
                      <span className="text-xs font-bold text-gray-400 group-hover:text-orange-500 flex-shrink-0 bg-white px-1.5 py-0.5 rounded-lg">
                        {c.count}
                      </span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

          </div>
        </section>

        {/* ── Order breakdown ───────────────────────────────────────────── */}
        {ordersByStatus.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Order Breakdown</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              {ordersByStatus
                .sort((a, b) => b.count - a.count)
                .map((s) => (
                  <div key={s.status} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                    <p className="text-2xl font-extrabold text-gray-900">{fmt(s.count)}</p>
                    <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold capitalize ${STATUS_COLOR[s.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {s.status}
                    </span>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <footer className="text-center text-xs text-gray-400 pt-4 pb-8">
          MenuBuddy Dashboard · Data refreshes on page load
        </footer>

      </main>
    </div>
  );
}
