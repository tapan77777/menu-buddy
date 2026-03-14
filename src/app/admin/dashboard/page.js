"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart2,
  Eye,
  ExternalLink,
  PackageCheck,
  PlusCircle,
  QrCode,
  ShoppingBag,
  TrendingUp,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

// ── Status badge styles ────────────────────────────────────────────────────
const STATUS_BADGE = {
  pending:   "bg-yellow-100 text-yellow-700",
  accepted:  "bg-blue-100 text-blue-700",
  preparing: "bg-orange-100 text-orange-700",
  ready:     "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  rejected:  "bg-red-100 text-red-700",
};

// ── Skeleton pulse ─────────────────────────────────────────────────────────
function Skeleton({ className = "" }) {
  return <span className={`inline-block bg-gray-100 rounded animate-pulse ${className}`} />;
}

export default function AdminDashboard() {
  const router = useRouter();

  const [restaurant, setRestaurant]       = useState(null);
  const [restaurantId, setRestaurantId]   = useState(null);
  const [todayStats, setTodayStats]       = useState(null);
  const [weekStats, setWeekStats]         = useState(null);
  const [menuItemCount, setMenuItemCount] = useState(null);
  const [recentOrders, setRecentOrders]   = useState([]);

  const loading = !todayStats || menuItemCount === null;

  // ── Step 1: resolve identity ────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((res) => {
        if (!res.success) { router.replace("/login"); return; }
        setRestaurant(res.admin);
        setRestaurantId(res.admin.restaurantId);
      })
      .catch(() => router.replace("/login"));
  }, []);

  // ── Step 2: fetch all dashboard data in parallel ─────────────────────
  useEffect(() => {
    if (!restaurantId) return;
    Promise.all([
      fetch(`/api/admin/analytics?restaurantId=${restaurantId}&period=today`).then((r) => r.json()),
      fetch(`/api/admin/analytics?restaurantId=${restaurantId}&period=7d`).then((r) => r.json()),
      fetch("/api/menu").then((r) => r.json()),
      fetch(`/api/admin/orders?restaurantId=${restaurantId}`).then((r) => r.json()),
    ]).then(([today, week, menu, orders]) => {
      setTodayStats(today);
      setWeekStats(week);
      if (menu.success) setMenuItemCount(menu.items?.length ?? 0);
      if (orders.success) setRecentOrders((orders.orders ?? []).slice(0, 5));
    });
  }, [restaurantId]);

  // ── Greeting based on time of day ──────────────────────────────────────
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const todayLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const menuUrl = restaurant?.slug
    ? `/restaurant/${restaurant.slug}`
    : null;

  // ── Stat cards config ─────────────────────────────────────────────────
  const stats = [
    {
      label: "Menu Views",
      sub: "Today",
      value: todayStats?.engagement?.menuViews ?? 0,
      icon: Eye,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-100",
    },
    {
      label: "Orders",
      sub: "Today",
      value: todayStats?.summary?.totalOrders ?? 0,
      icon: PackageCheck,
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-100",
    },
    {
      label: "Revenue",
      sub: "Today",
      value: `₹${(todayStats?.summary?.totalRevenue ?? 0).toLocaleString("en-IN")}`,
      icon: Wallet,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-100",
    },
    {
      label: "Menu Items",
      sub: "Total",
      value: menuItemCount ?? 0,
      icon: UtensilsCrossed,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-100",
    },
  ];

  // ── Quick actions ────────────────────────────────────────────────────
  const quickActions = [
    {
      label: "Add Menu Item",
      desc: "Add a new dish or drink",
      href: "/admin/dashboard/menuManagement",
      icon: PlusCircle,
      color: "text-orange-600",
      bg: "bg-orange-50 hover:bg-orange-100",
    },
    {
      label: "View Live Orders",
      desc: "Manage incoming orders",
      href: "/admin/dashboard/orders",
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50 hover:bg-blue-100",
    },
    {
      label: "Analytics",
      desc: "Revenue & engagement insights",
      href: "/admin/dashboard/analytics",
      icon: BarChart2,
      color: "text-green-600",
      bg: "bg-green-50 hover:bg-green-100",
    },
    {
      label: "Menu Management",
      desc: "Edit categories & item details",
      href: "/admin/dashboard/menuManagement",
      icon: UtensilsCrossed,
      color: "text-purple-600",
      bg: "bg-purple-50 hover:bg-purple-100",
    },
  ];

  const chartData = weekStats?.salesTrend ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-gray-900 truncate">
              {greeting}, {restaurant?.name?.split(" ")[0] || "there"} 👋
            </h1>
            <p className="text-xs text-gray-400">{todayLabel}</p>
          </div>

          {menuUrl && (
            <a
              href={menuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              View Menu
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── Stat cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className={`bg-white rounded-2xl border ${s.border} p-5 flex flex-col gap-3`}
            >
              <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 leading-tight">
                  {loading ? <Skeleton className="w-14 h-7" /> : s.value}
                </p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  {s.label} · <span className="text-gray-300">{s.sub}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Revenue chart + Quick Actions ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* 7-day revenue bar chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-semibold text-gray-800">Revenue Trend</h2>
                <p className="text-xs text-gray-400">Last 7 days</p>
              </div>
              <Link
                href="/admin/dashboard/analytics"
                className="flex items-center gap-1 text-xs text-orange-600 font-semibold hover:underline"
              >
                Full report
                <TrendingUp className="w-3 h-3" />
              </Link>
            </div>

            {loading ? (
              <div className="h-44 flex items-end gap-2 px-2">
                {[40, 65, 50, 80, 55, 70, 45].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gray-100 rounded-t-lg animate-pulse"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-gray-200">
                <BarChart2 className="w-10 h-10 mb-2" />
                <p className="text-sm text-gray-400">No sales data yet</p>
                <p className="text-xs text-gray-300 mt-0.5">Orders placed will appear here</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={176}>
                <BarChart data={chartData} barSize={22}>
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#9CA3AF", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #F3F4F6",
                      borderRadius: 10,
                      fontSize: 12,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                    }}
                    formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]}
                    cursor={{ fill: "rgba(249,115,22,0.05)" }}
                  />
                  <Bar dataKey="revenue" fill="#F97316" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Quick actions panel */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {quickActions.map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${a.bg} transition-colors group`}
                >
                  <a.icon className={`w-4 h-4 ${a.color} shrink-0`} />
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold ${a.color} leading-tight`}>{a.label}</p>
                    <p className="text-[11px] text-gray-400 truncate">{a.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Recent Orders ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-800">Recent Orders</h2>
            <Link
              href="/admin/dashboard/orders"
              className="text-xs text-orange-600 font-semibold hover:underline"
            >
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="divide-y divide-gray-50">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <Skeleton className="w-9 h-9 rounded-xl" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="w-28 h-3.5" />
                    <Skeleton className="w-44 h-3" />
                  </div>
                  <div className="text-right space-y-1.5">
                    <Skeleton className="w-16 h-3.5" />
                    <Skeleton className="w-14 h-4 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-14 text-center">
              <ShoppingBag className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No orders yet</p>
              <p className="text-xs text-gray-300 mt-0.5">Orders from customers will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">
                      #{order.orderId}
                      {order.tableId && (
                        <span className="text-xs font-normal text-gray-400 ml-1.5">
                          · Table {order.tableId}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {(order.items ?? []).map((i) => i.name).join(", ")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-800">
                      ₹{(order.totalAmount ?? 0).toLocaleString("en-IN")}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                        STATUS_BADGE[order.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom padding for mobile tab bar */}
        <div className="h-2" />
      </div>
    </div>
  );
}
