"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, accent = "red" }) {
  const accents = {
    red:    "bg-red-50 text-red-600",
    orange: "bg-orange-50 text-orange-600",
    blue:   "bg-blue-50 text-blue-600",
    green:  "bg-green-50 text-green-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${accents[accent]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-extrabold text-gray-900 leading-none">{value}</p>
        <p className="text-sm font-medium text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
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

function Pill({ label, count }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors group">
      <span className="text-sm text-gray-700 group-hover:text-red-700 font-medium truncate pr-2">{label}</span>
      <span className="text-xs font-bold text-gray-400 group-hover:text-red-500 flex-shrink-0">{fmt(count)}</span>
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

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function OwnerDashboardPage() {
  const router  = useRouter();
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    fetch("/api/owner/stats")
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          router.replace("/");
          return;
        }
        const data = await res.json();
        if (data.success) setStats(data.stats);
        else setError(data.error || "Failed to load stats");
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, [router]);

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
    totalRestaurants, totalMenuItems, totalOrders, totalRevenue,
    restaurantsByCity, topRestaurants, topItems, topSearches, ordersByStatus,
  } = stats;

  const maxViews        = topRestaurants[0]?.totalViews  ?? 1;
  const maxItemClicks   = topItems[0]?.clicks             ?? 1;
  const maxSearchCount  = topSearches[0]?.count           ?? 1;
  const maxCityCount    = restaurantsByCity[0]?.count      ?? 1;

  const completedOrders = ordersByStatus.find((s) => s.status === "completed")?.count ?? 0;

  return (
    <div className="min-h-screen bg-[#f7f6f4]">

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-extrabold">
              Menu<span className="text-red-600">Buddy</span>
            </Link>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span className="hidden sm:inline text-sm font-semibold text-gray-500">Owner Insights</span>
          </div>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-red-600 transition-colors font-medium"
          >
            ← Back to site
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── A. Overview ─────────────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Overview</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon="🍴" label="Restaurants"  value={fmt(totalRestaurants)} accent="red" />
            <StatCard icon="📋" label="Menu Items"    value={fmt(totalMenuItems)}   accent="orange" />
            <StatCard icon="🧾" label="Total Orders"  value={fmt(totalOrders)}
              sub={`${fmt(completedOrders)} completed`} accent="blue" />
            <StatCard icon="💰" label="Revenue"       value={fmtCurrency(totalRevenue)}
              sub="Completed orders" accent="green" />
          </div>
        </section>

        {/* ── B + C. Restaurant & Menu Insights ───────────────────── */}
        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Insights</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Top restaurants by views */}
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
                          <Link href={`/restaurant/${r.slug}`}
                            className="text-sm font-semibold text-gray-800 truncate pr-2 group-hover:text-red-600 transition-colors">
                            {r.name}
                          </Link>
                          <span className="text-xs text-gray-500 flex-shrink-0">{fmt(r.totalViews)} views</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full"
                            style={{ width: `${Math.round((r.totalViews / maxViews) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* Most clicked dishes */}
            <SectionCard title="Most Clicked Dishes" icon="🍽️">
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

        {/* ── D + E. Search & Location Insights ───────────────────── */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Search insights */}
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

            {/* Location insights */}
            <SectionCard title="Restaurants by City" icon="🗺️">
              {restaurantsByCity.length === 0 ? (
                <p className="text-sm text-gray-400">No city data found. Add city to restaurant profiles.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {restaurantsByCity.map((c) => (
                    <div key={c.city}
                      className="flex items-center justify-between bg-gray-50 hover:bg-orange-50 rounded-xl px-3 py-2 transition-colors group">
                      <span className="text-sm text-gray-700 group-hover:text-orange-700 font-medium truncate pr-2">
                        {c.city}
                      </span>
                      <span className="text-xs font-bold text-gray-400 group-hover:text-orange-500 flex-shrink-0 bg-white px-1.5 py-0.5 rounded-lg">
                        {c.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

          </div>
        </section>

        {/* ── Orders by status ────────────────────────────────────── */}
        {ordersByStatus.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Order Breakdown</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              {ordersByStatus
                .sort((a, b) => b.count - a.count)
                .map((s) => (
                  <div key={s.status}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                    <p className="text-2xl font-extrabold text-gray-900">{fmt(s.count)}</p>
                    <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold capitalize ${STATUS_COLOR[s.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {s.status}
                    </span>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* ── Footer ──────────────────────────────────────────────── */}
        <footer className="text-center text-xs text-gray-400 pt-4 pb-8">
          MenuBuddy Owner Insights · Data refreshes on page load
        </footer>

      </main>
    </div>
  );
}
