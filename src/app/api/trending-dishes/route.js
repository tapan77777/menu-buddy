import { connectToDB } from "@/lib/db";
import MenuItem from "@/models/menuItem";
import { NextResponse } from "next/server";

const TOP_N = 6;

export async function GET() {
  try {
    await connectToDB();

    const dishes = await MenuItem.aggregate([
      // Only items with a valid restaurantId, a name, and a price > 0
      {
        $match: {
          restaurantId: { $exists: true, $ne: null },
          name:         { $exists: true, $ne: "" },
          price:        { $exists: true, $gt: 0 },
        },
      },

      // Normalise name for grouping (trim + lowercase)
      {
        $addFields: {
          normalisedName: { $toLower: { $trim: { input: "$name" } } },
        },
      },

      // Group by normalised name — count occurrences, keep one representative doc
      {
        $group: {
          _id:          "$normalisedName",
          count:        { $sum: 1 },
          displayName:  { $first: "$name" },
          price:        { $first: "$price" },
          imageUrl:     { $first: "$imageUrl" },
          restaurantId: { $first: "$restaurantId" },
        },
      },

      // Most common first; alphabetical tiebreaker
      { $sort: { count: -1, _id: 1 } },

      { $limit: TOP_N },

      // Join restaurant for name + slug
      {
        $lookup: {
          from:         "restaurants",
          localField:   "restaurantId",
          foreignField: "_id",
          as:           "restaurant",
        },
      },

      // Drop entries whose restaurant no longer exists
      // NOTE: correct option name is preserveNullAndEmptyArrays (not preserveNullAndEmpty)
      { $unwind: { path: "$restaurant", preserveNullAndEmptyArrays: false } },

      {
        $project: {
          _id:            0,
          name:           "$displayName",
          count:          1,
          price:          1,
          imageUrl:       1,
          restaurantName: "$restaurant.name",
          restaurantSlug: "$restaurant.slug",
        },
      },
    ]);

    return NextResponse.json({ success: true, dishes });

  } catch (err) {
    console.error("TRENDING DISHES ERROR:", err);
    // Return a valid empty response so the UI degrades gracefully.
    return NextResponse.json({ success: true, dishes: [] });
  }
}
