import { connectToDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import DailyAnalytics from "@/models/DailyAnalytics";
import MenuItem from "@/models/menuItem";
import Order from "@/models/Order";
import Restaurant from "@/models/resturant";
import SearchEvent from "@/models/SearchEvent";
import mongoose from "mongoose";

const OWNER_EMAIL = process.env.OWNER_EMAIL;

// ── Date helpers ──────────────────────────────────────────────────────────────

function getDateRange(range) {
  const now  = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (range === "today") return { start: today, end: now };
  if (range === "week")  { const s = new Date(today); s.setDate(s.getDate() - 7);  return { start: s, end: now }; }
  if (range === "month") { const s = new Date(today); s.setDate(s.getDate() - 30); return { start: s, end: now }; }
  return null; // all time
}

function getPrevRange(range) {
  const r = getDateRange(range);
  if (!r) return null;
  const ms = r.end - r.start;
  return { start: new Date(r.start - ms), end: r.start };
}

function toDateStr(d) { return d.toISOString().slice(0, 10); }

function pctChange(curr, prev) {
  if (prev == null || prev === 0) return null;
  return Math.round(((curr - prev) / prev) * 100);
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function GET(req) {
  if (process.env.NODE_ENV === "production") {
    const decoded = verifyToken(req);
    if (!decoded) return Response.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDB();
    const user = await Restaurant.findById(decoded.id).select("email");
    if (!user || user.email !== OWNER_EMAIL) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  } else {
    await connectToDB();
  }

  try {
    const url          = new URL(req.url);
    const rawId        = url.searchParams.get("restaurantId");
    const range        = url.searchParams.get("range") || "all";

    // Validate restaurantId
    const restaurantId =
      rawId && mongoose.Types.ObjectId.isValid(rawId)
        ? new mongoose.Types.ObjectId(rawId)
        : null;

    const dateRange = getDateRange(range);
    const prevRange = getPrevRange(range);

    // ── Match builders ──────────────────────────────────────────────────────

    // Order collection filters
    const orderBase  = restaurantId ? { restaurantId } : {};
    const dateFilter = dateRange ? { createdAt: { $gte: dateRange.start, $lte: dateRange.end } } : {};
    const orderMatch = { ...orderBase, ...dateFilter };

    const prevDateFilter = prevRange ? { createdAt: { $gte: prevRange.start, $lte: prevRange.end } } : {};
    const prevOrderMatch = { ...orderBase, ...prevDateFilter };

    // Today for sub-stats (always absolute)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayOrderMatch = { ...orderBase, createdAt: { $gte: todayStart } };

    // DailyAnalytics collection filters (date stored as "YYYY-MM-DD" string)
    const analyticsMatchFiltered = {
      ...(restaurantId ? { restaurantId } : {}),
      ...(dateRange ? { date: { $gte: toDateStr(dateRange.start), $lte: toDateStr(dateRange.end) } } : {}),
    };
    // For topRestaurants — global (no restaurantId filter), but date-scoped
    const analyticsMatchGlobal = dateRange
      ? { date: { $gte: toDateStr(dateRange.start), $lte: toDateStr(dateRange.end) } }
      : {};

    // ── Queries ─────────────────────────────────────────────────────────────

    const [
      restaurants,
      totalRestaurants,
      totalMenuItems,
      totalOrders,
      revenueAgg,
      todayOrdersCount,
      todayRevenueAgg,
      prevOrdersCount,
      prevRevenueAgg,
      restaurantsByCity,
      topRestaurants,
      topItems,
      topSearches,
      ordersByStatus,
      ordersTimeline,
    ] = await Promise.all([

      // All restaurants — for the dropdown selector
      Restaurant.find({})
        .select("_id name slug logoUrl city address")
        .sort({ name: 1 })
        .lean(),

      Restaurant.countDocuments(),

      MenuItem.countDocuments(restaurantId ? { restaurantId } : {}),

      Order.countDocuments(orderMatch),

      Order.aggregate([
        { $match: { ...orderMatch, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),

      // Today sub-stat — always absolute today
      Order.countDocuments(todayOrderMatch),

      Order.aggregate([
        { $match: { ...todayOrderMatch, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),

      // Previous period for % change (null when range=all)
      prevRange
        ? Order.countDocuments(prevOrderMatch)
        : Promise.resolve(null),

      prevRange
        ? Order.aggregate([
            { $match: { ...prevOrderMatch, status: "completed" } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
          ])
        : Promise.resolve(null),

      // Restaurants by city — global
      Restaurant.aggregate([
        { $match: { city: { $exists: true, $ne: null, $ne: "" } } },
        { $group: { _id: { $toLower: { $trim: { input: "$city" } } }, count: { $sum: 1 }, displayCity: { $first: "$city" } } },
        { $sort: { count: -1 } },
        { $limit: 12 },
        { $project: { _id: 0, city: "$displayCity", count: 1 } },
      ]),

      // Top restaurants by views — global, date-scoped
      DailyAnalytics.aggregate([
        ...(Object.keys(analyticsMatchGlobal).length ? [{ $match: analyticsMatchGlobal }] : []),
        { $group: { _id: "$restaurantId", totalViews: { $sum: "$menuViews" }, totalClicks: { $sum: "$itemClicks" } } },
        { $sort: { totalViews: -1 } },
        { $limit: 5 },
        { $lookup: { from: "restaurants", localField: "_id", foreignField: "_id", as: "r" } },
        { $unwind: { path: "$r", preserveNullAndEmptyArrays: false } },
        {
          $project: {
            _id: 0,
            restaurantId: "$_id",
            name: "$r.name", slug: "$r.slug", logoUrl: "$r.logoUrl", city: "$r.city",
            totalViews: 1, totalClicks: 1,
          },
        },
      ]),

      // Top clicked dishes — filtered by restaurant + date
      DailyAnalytics.aggregate([
        ...(Object.keys(analyticsMatchFiltered).length ? [{ $match: analyticsMatchFiltered }] : []),
        { $project: { items: { $objectToArray: "$topItems" } } },
        { $unwind: "$items" },
        { $group: { _id: "$items.v.name", totalClicks: { $sum: "$items.v.clicks" } } },
        { $sort: { totalClicks: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, name: "$_id", clicks: "$totalClicks" } },
      ]),

      // Search keywords — global (SearchEvent has no restaurantId)
      SearchEvent.find()
        .sort({ count: -1 })
        .limit(10)
        .select("keyword count lastSearched -_id")
        .lean(),

      // Orders by status — filtered
      Order.aggregate([
        { $match: orderMatch },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $project: { _id: 0, status: "$_id", count: 1 } },
      ]),

      // Orders timeline — last 7 days, filtered by restaurant (for sparkline)
      Order.aggregate([
        {
          $match: {
            ...orderBase,
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count:   { $sum: 1 },
            revenue: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$totalAmount", 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // ── Compute trend percentages ────────────────────────────────────────────

    const totalRevenue = revenueAgg[0]?.total ?? 0;
    const prevOrders   = prevOrdersCount ?? null;
    const prevRevenue  = prevRevenueAgg ? (prevRevenueAgg[0]?.total ?? 0) : null;

    const completedOrders = ordersByStatus.find((s) => s.status === "completed")?.count ?? 0;

    return Response.json({
      success: true,
      stats: {
        restaurants,           // full list for dropdown
        totalRestaurants,
        totalMenuItems,
        totalOrders,
        totalRevenue,
        completedOrders,
        todayOrders:    todayOrdersCount,
        todayRevenue:   todayRevenueAgg[0]?.total ?? 0,
        ordersPctChange:  pctChange(totalOrders, prevOrders),
        revenuePctChange: pctChange(totalRevenue, prevRevenue),
        restaurantsByCity,
        topRestaurants,
        topItems,
        topSearches,
        ordersByStatus,
        ordersTimeline,        // [{_id:"YYYY-MM-DD", count, revenue}]
      },
    });
  } catch (err) {
    console.error("[owner/stats]", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
