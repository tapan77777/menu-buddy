import { connectToDB } from "@/lib/db";
import Order from "@/models/Order";
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
    startDate = new Date(now.setHours(0, 0, 0, 0));
  } else if (period === "7d") {
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const orders = await Order.find({
    restaurantId,
    createdAt: { $gte: startDate }
  });

  // ---------- SUMMARY ----------
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const rejectedOrders = orders.filter(o => o.status === "rejected").length;

  const avgOrderValue = totalOrders
    ? Math.round(totalRevenue / totalOrders)
    : 0;

  // ---------- STATUS ----------
  const statusBreakdown = {};
  orders.forEach(o => {
    statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1;
  });

  // ---------- TOP ITEMS ----------
  const itemMap = {};
  orders.forEach(order => {
    order.items.forEach(it => {
      if (!itemMap[it.name]) {
        itemMap[it.name] = { qty: 0, revenue: 0 };
      }
      itemMap[it.name].qty += it.qty;
      itemMap[it.name].revenue += it.qty * it.price;
    });
  });

  const topItems = Object.entries(itemMap)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // ---------- SALES TREND ----------
  const trendMap = {};
  orders.forEach(o => {
    const key =
      period === "today"
        ? new Date(o.createdAt).getHours() + ":00"
        : new Date(o.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short"
          });

    trendMap[key] = (trendMap[key] || 0) + o.totalAmount;
  });

  const salesTrend = Object.entries(trendMap).map(([label, revenue]) => ({
    label,
    revenue
  }));

  return NextResponse.json({
    success: true,
    summary: {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      rejectedOrders
    },
    salesTrend,
    topItems,
    statusBreakdown
  });
}
