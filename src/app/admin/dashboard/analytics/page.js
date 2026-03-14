"use client";

import {
  Calendar,
  DollarSign,
  Download,
  Eye,
  PackageCheck,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("today");
  const [data, setData] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((res) => setRestaurantId(res?.admin?.restaurantId));
  }, []);

  useEffect(() => {
    if (!restaurantId) return;
    setData(null);
    fetch(`/api/admin/analytics?restaurantId=${restaurantId}&period=${period}`)
      .then((r) => r.json())
      .then(setData);
  }, [restaurantId, period]);

  const downloadCSV = () => {
    window.location.href = `/api/admin/analytics/export?restaurantId=${restaurantId}&period=${period}`;
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 rounded-full border-4 border-gray-300 border-t-blue-600 animate-spin mb-4" />
          <p className="text-gray-600 font-semibold">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const { engagement = {}, insight = {} } = data;
  const periodLabel =
    period === "today" ? "Today" : period === "7d" ? "Last 7 Days" : "This Month";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Menu Analytics
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Track your menu performance and customer behaviour
              </p>
            </div>
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* PERIOD FILTER */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">Time Period</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {["today", "7d", "month"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                  period === p
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {p === "today" ? "Today" : p === "7d" ? "Last 7 Days" : "This Month"}
              </button>
            ))}
          </div>
        </div>

        {/* INSIGHT BOX (today only, shown when data exists) */}
        {(insight.mostClickedItem || insight.trafficChange !== null) && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
              <span className="text-lg">💡</span>
              {periodLabel} Insight
            </h3>
            <div className="space-y-2">
              {insight.mostClickedItem && (
                <p className="text-sm text-orange-700">
                  🔥 Most clicked item:{" "}
                  <span className="font-bold">{insight.mostClickedItem.name}</span>
                  {" "}({insight.mostClickedItem.clicks} clicks)
                </p>
              )}
              {insight.trafficChange !== null && (
                <p className="text-sm text-orange-700">
                  {insight.trafficChange >= 0 ? "📈" : "📉"}{" "}
                  {Math.abs(insight.trafficChange)}%{" "}
                  {insight.trafficChange >= 0 ? "more" : "less"} menu traffic compared to yesterday
                </p>
              )}
            </div>
          </div>
        )}

        {/* MENU ENGAGEMENT CARDS */}
        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-500" />
            Menu Engagement — {periodLabel}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <EngagementCard
              emoji="👀"
              label="Menu Views"
              value={engagement.menuViews ?? 0}
              gradient="from-indigo-500 to-blue-600"
              bg="bg-indigo-50"
            />
            <EngagementCard
              emoji="👆"
              label="Item Clicks"
              value={engagement.itemClicks ?? 0}
              gradient="from-violet-500 to-purple-600"
              bg="bg-violet-50"
            />
            <EngagementCard
              emoji="🛒"
              label="Items Added to Cart"
              value={engagement.addToCart ?? 0}
              gradient="from-orange-500 to-amber-500"
              bg="bg-orange-50"
            />
            <EngagementCard
              emoji="📦"
              label="Orders Placed"
              value={engagement.orders ?? 0}
              gradient="from-green-500 to-emerald-600"
              bg="bg-green-50"
            />
          </div>
        </div>

        {/* CONVERSION FUNNEL (mini) */}
        {engagement.menuViews > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Conversion Funnel
            </h3>
            <div className="space-y-3">
              <FunnelBar
                label="Menu Views"
                value={engagement.menuViews}
                max={engagement.menuViews}
                color="bg-indigo-500"
              />
              <FunnelBar
                label="Item Clicks"
                value={engagement.itemClicks}
                max={engagement.menuViews}
                color="bg-violet-500"
              />
              <FunnelBar
                label="Add to Cart"
                value={engagement.addToCart}
                max={engagement.menuViews}
                color="bg-orange-500"
              />
              <FunnelBar
                label="Orders"
                value={engagement.orders}
                max={engagement.menuViews}
                color="bg-green-500"
              />
            </div>
          </div>
        )}

        {/* ORDER SUMMARY CARDS */}
        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-green-600" />
            Sales Summary — {periodLabel}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Revenue"
              value={`₹${data.summary.totalRevenue}`}
              icon={DollarSign}
              gradient="from-green-500 to-emerald-600"
              bgLight="bg-green-50"
            />
            <MetricCard
              title="Total Orders"
              value={data.summary.totalOrders}
              icon={ShoppingCart}
              gradient="from-blue-500 to-blue-600"
              bgLight="bg-blue-50"
            />
            <MetricCard
              title="Avg Order Value"
              value={`₹${data.summary.avgOrderValue}`}
              icon={TrendingUp}
              gradient="from-purple-500 to-purple-600"
              bgLight="bg-purple-50"
            />
            <MetricCard
              title="Rejected Orders"
              value={data.summary.rejectedOrders}
              icon={XCircle}
              gradient="from-red-500 to-red-600"
              bgLight="bg-red-50"
              danger
            />
          </div>
        </div>

        {/* SALES TREND GRAPH */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Sales Trend</h2>
              <p className="text-sm text-gray-500 mt-1">Revenue over time</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.salesTrend}>
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  axisLine={{ stroke: "#E5E7EB" }}
                />
                <YAxis
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  axisLine={{ stroke: "#E5E7EB" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                  cursor={{ fill: "rgba(16, 185, 129, 0.1)" }}
                />
                <Bar dataKey="revenue" fill="url(#colorRevenue)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TOP SELLING ITEMS */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Top Selling Items</h2>
              <p className="text-sm text-gray-500 mt-1">Best performers by revenue</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center">
              <span className="text-2xl">🏆</span>
            </div>
          </div>
          {data.topItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block p-4 bg-gray-100 rounded-full mb-3">
                <ShoppingCart className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No items sold in this period</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.topItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-white ${
                        idx === 0
                          ? "bg-gradient-to-br from-yellow-400 to-orange-500"
                          : idx === 1
                          ? "bg-gradient-to-br from-gray-300 to-gray-400"
                          : idx === 2
                          ? "bg-gradient-to-br from-orange-300 to-orange-400"
                          : "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600"
                      }`}
                    >
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.qty} {item.qty === 1 ? "order" : "orders"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-green-600">₹{item.revenue}</p>
                    <p className="text-xs text-gray-500">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function EngagementCard({ emoji, label, value, gradient, bg }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-5 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 ${bg} rounded-full opacity-40 -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500`} />
      <div className="relative">
        <div className={`inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${gradient} mb-3 group-hover:scale-110 transition-transform`}>
          <span className="text-base sm:text-lg">{emoji}</span>
        </div>
        <p className="text-xl sm:text-2xl font-black text-gray-800 truncate">{value.toLocaleString()}</p>
        <p className="text-xs text-gray-500 font-medium mt-0.5 leading-tight">{label}</p>
      </div>
    </div>
  );
}

function FunnelBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="text-gray-800 font-bold">
          {value.toLocaleString()} <span className="text-gray-400 font-normal">({pct}%)</span>
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div
          className={`${color} h-2.5 rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, gradient, bgLight, danger }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 ${bgLight} rounded-full opacity-50 -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
        <p className={`text-3xl font-bold ${danger ? "text-red-600" : "text-gray-800"} group-hover:scale-105 transition-transform duration-200`}>
          {value}
        </p>
        <div className={`h-1 w-0 group-hover:w-full bg-gradient-to-r ${gradient} rounded-full mt-4 transition-all duration-500`} />
      </div>
    </div>
  );
}
