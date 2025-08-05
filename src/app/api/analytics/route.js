import { connectToDB } from "@/lib/db";
import Analytics from "@/models/analytics";
import mongoose from "mongoose";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

export async function GET(req) {
  await connectToDB();

  const { searchParams } = new URL(req.url);
  const restaurantId = searchParams.get("restaurantId");
  const range = searchParams.get("range");

  if (!restaurantId || !range) {
    return new Response(JSON.stringify({ error: "Missing parameters" }), { status: 400 });
  }

  const cacheKey = `analytics:${restaurantId}:${range}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return new Response(JSON.stringify(cached), { status: 200 });
  }

  const now = new Date();
  let startDate = new Date();

  if (range === "daily") {
    startDate.setHours(0, 0, 0, 0);
  } else if (range === "weekly") {
    startDate.setDate(now.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);
  } else if (range === "monthly") {
    startDate.setDate(now.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);
  }

  // Summary for views and clicks
  const data = await Analytics.aggregate([
    {
      $match: {
        restaurantId: new mongoose.Types.ObjectId(restaurantId),
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$type",
        count: { $sum: "$count" },
      },
    },
  ]);

  // Top 5 clicked items
  const itemClicks = await Analytics.aggregate([
    {
      $match: {
        restaurantId: new mongoose.Types.ObjectId(restaurantId),
        type: "item_clicked",
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$itemId",
        count: { $sum: "$count" },
      },
    },
    {
      $lookup: {
        from: "menuitems", // Your collection name must match exactly
        localField: "_id",
        foreignField: "_id",
        as: "itemDetails"
      }
    },
    { $unwind: "$itemDetails" },
    {
      $project: {
        _id: 1,
        count: 1,
        name: "$itemDetails.name"
      }
    },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  const result = { data, itemClicks };
  cache.set(cacheKey, result); // ✅ Store in cache

  return new Response(JSON.stringify(result), { status: 200 });
}
