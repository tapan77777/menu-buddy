import { connectToDB } from "@/lib/db";
import Order from "@/models/Order";
import DailyAnalytics from "@/models/DailyAnalytics";
import { NextResponse } from "next/server";

export async function GET(req) {
  await connectToDB();

  const { searchParams } = new URL(req.url);
  const restaurantId = searchParams.get("restaurantId");
  const period = searchParams.get("period") || "today";

  if (!restaurantId) {
    return NextResponse.json({ success: false });
  }

  const now = new Date();
  let startDate;

  if (period === "today") {
    startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
  } else if (period === "7d") {
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const startDateStr = startDate.toISOString().split("T")[0]; // "YYYY-MM-DD"
  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  })();

  // ── Order-based analytics ─────────────────────────────────────
  const orders = await Order.find({
    restaurantId,
    createdAt: { $gte: startDate },
  });

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const rejectedOrders = orders.filter((o) => o.status === "rejected").length;
  const avgOrderValue = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;

  const statusBreakdown = {};
  orders.forEach((o) => {
    statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1;
  });

  const itemMap = {};
  orders.forEach((order) => {
    order.items.forEach((it) => {
      if (!itemMap[it.name]) itemMap[it.name] = { qty: 0, revenue: 0 };
      itemMap[it.name].qty += it.qty;
      itemMap[it.name].revenue += it.qty * it.price;
    });
  });

  const topItems = Object.entries(itemMap)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const trendMap = {};
  orders.forEach((o) => {
    const key =
      period === "today"
        ? new Date(o.createdAt).getHours() + ":00"
        : new Date(o.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
          });
    trendMap[key] = (trendMap[key] || 0) + o.totalAmount;
  });

  const salesTrend = Object.entries(trendMap).map(([label, revenue]) => ({
    label,
    revenue,
  }));

  // ── Engagement analytics (DailyAnalytics) ────────────────────
  const engagementDocs = await DailyAnalytics.find({
    restaurantId,
    date: { $gte: startDateStr, $lte: todayStr },
  }).lean();

  const engagement = {
    menuViews: 0,
    itemClicks: 0,
    addToCart: 0,
    orders: 0,
  };

  // Aggregate all topItems across docs to find most clicked
  const mergedTopItems = {};

  engagementDocs.forEach((doc) => {
    engagement.menuViews += doc.menuViews || 0;
    engagement.itemClicks += doc.itemClicks || 0;
    engagement.addToCart += doc.addToCart || 0;
    engagement.orders += doc.orders || 0;

    if (doc.topItems && typeof doc.topItems === "object") {
      Object.entries(doc.topItems).forEach(([id, val]) => {
        if (!mergedTopItems[id]) mergedTopItems[id] = { name: val?.name || "", clicks: 0 };
        mergedTopItems[id].clicks += val?.clicks || 0;
      });
    }
  });

  const mostClickedItem = Object.values(mergedTopItems).sort(
    (a, b) => b.clicks - a.clicks
  )[0] || null;

  // Traffic change: today vs yesterday (only meaningful for "today" period)
  let trafficChange = null;
  if (period === "today") {
    const todayDoc = engagementDocs.find((d) => d.date === todayStr);
    const [yesterdayDoc] = await DailyAnalytics.find({
      restaurantId,
      date: yesterdayStr,
    }).lean();

    const todayViews = todayDoc?.menuViews || 0;
    const yesterdayViews = yesterdayDoc?.menuViews || 0;

    if (yesterdayViews > 0) {
      trafficChange = Math.round(((todayViews - yesterdayViews) / yesterdayViews) * 100);
    }
  }

  return NextResponse.json({
    success: true,
    summary: {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      rejectedOrders,
    },
    salesTrend,
    topItems,
    statusBreakdown,
    engagement,
    insight: {
      mostClickedItem,
      trafficChange,
    },
  });
}
