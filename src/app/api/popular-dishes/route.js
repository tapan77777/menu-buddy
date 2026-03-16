import { connectToDB } from "@/lib/db";
import MenuItem from "@/models/menuItem";
import { NextResponse } from "next/server";

const SAMPLE_SIZE = 6;

/**
 * GET /api/popular-dishes
 *
 * Returns up to 6 menu items sampled randomly from the collection.
 * Used as a fallback when /api/trending-dishes returns an empty array
 * (e.g. when the database is small or freshly seeded).
 */
export async function GET() {
  try {
    await connectToDB();

    const dishes = await MenuItem.aggregate([
      // Only items with the minimum required fields
      {
        $match: {
          restaurantId: { $exists: true, $ne: null },
          name:         { $exists: true, $ne: "" },
          price:        { $exists: true, $gt: 0 },
        },
      },

      // Random sample — no bias toward any restaurant or category
      { $sample: { size: SAMPLE_SIZE } },

      // Join restaurant for name + slug
      {
        $lookup: {
          from:         "restaurants",
          localField:   "restaurantId",
          foreignField: "_id",
          as:           "restaurant",
        },
      },
      { $unwind: { path: "$restaurant", preserveNullAndEmptyArrays: false } },

      {
        $project: {
          _id:            0,
          name:           1,
          price:          1,
          imageUrl:       1,
          restaurantName: "$restaurant.name",
          restaurantSlug: "$restaurant.slug",
        },
      },
    ]);

    return NextResponse.json({ success: true, dishes });
  } catch (err) {
    console.error("POPULAR DISHES ERROR:", err);
    return NextResponse.json({ success: true, dishes: [] });
  }
}
