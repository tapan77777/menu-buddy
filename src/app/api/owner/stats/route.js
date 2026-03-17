import { connectToDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import DailyAnalytics from "@/models/DailyAnalytics";
import MenuItem from "@/models/menuItem";
import Order from "@/models/Order";
import Restaurant from "@/models/resturant";
import SearchEvent from "@/models/SearchEvent";

const OWNER_EMAIL = process.env.OWNER_EMAIL;

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
    const [
      totalRestaurants,
      totalMenuItems,
      totalOrders,
      revenueResult,
      restaurantsByCity,
      topRestaurants,
      topItems,
      topSearches,
      ordersByStatus,
    ] = await Promise.all([

      Restaurant.countDocuments(),

      MenuItem.countDocuments(),

      Order.countDocuments(),

      // Total revenue from completed orders
      Order.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),

      // Restaurants grouped by city
      Restaurant.aggregate([
        { $match: { city: { $exists: true, $ne: null, $ne: "" } } },
        {
          $group: {
            _id:         { $toLower: { $trim: { input: "$city" } } },
            count:       { $sum: 1 },
            displayCity: { $first: "$city" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 12 },
        { $project: { _id: 0, city: "$displayCity", count: 1 } },
      ]),

      // Top 5 restaurants by total menu views (from DailyAnalytics)
      DailyAnalytics.aggregate([
        {
          $group: {
            _id:         "$restaurantId",
            totalViews:  { $sum: "$menuViews" },
            totalClicks: { $sum: "$itemClicks" },
          },
        },
        { $sort: { totalViews: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from:         "restaurants",
            localField:   "_id",
            foreignField: "_id",
            as:           "r",
          },
        },
        { $unwind: { path: "$r", preserveNullAndEmptyArrays: false } },
        {
          $project: {
            _id:         0,
            name:        "$r.name",
            slug:        "$r.slug",
            logoUrl:     "$r.logoUrl",
            city:        "$r.city",
            totalViews:  1,
            totalClicks: 1,
          },
        },
      ]),

      // Top clicked items — unwind topItems map from DailyAnalytics
      DailyAnalytics.aggregate([
        { $project: { items: { $objectToArray: "$topItems" } } },
        { $unwind: "$items" },
        {
          $group: {
            _id:         "$items.v.name",
            totalClicks: { $sum: "$items.v.clicks" },
          },
        },
        { $sort: { totalClicks: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, name: "$_id", clicks: "$totalClicks" } },
      ]),

      // Top searched keywords
      SearchEvent.find()
        .sort({ count: -1 })
        .limit(10)
        .select("keyword count lastSearched -_id")
        .lean(),

      // Orders breakdown by status
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $project: { _id: 0, status: "$_id", count: 1 } },
      ]),
    ]);

    return Response.json({
      success: true,
      stats: {
        totalRestaurants,
        totalMenuItems,
        totalOrders,
        totalRevenue: revenueResult[0]?.total ?? 0,
        restaurantsByCity,
        topRestaurants,
        topItems,
        topSearches,
        ordersByStatus,
      },
    });
  } catch (err) {
    console.error("[owner/stats]", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
