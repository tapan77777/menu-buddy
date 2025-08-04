import { connectToDB } from "@/lib/db";
import Analytics from "@/models/analytics";
import mongoose from "mongoose";

export async function GET(req) {
  await connectToDB();

  const { searchParams } = new URL(req.url);
  const restaurantId = searchParams.get("restaurantId");
  const range = searchParams.get("range");

  if (!restaurantId || !range) {
    return new Response(JSON.stringify({ error: "Missing parameters" }), { status: 400 });
  }

  // Set range start date
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
        from: "menuitems", // same as your MenuItem collection name
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

  return new Response(JSON.stringify({ data, itemClicks }), { status: 200 });
}
