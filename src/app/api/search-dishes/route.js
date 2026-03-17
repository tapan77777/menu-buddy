import { connectToDB } from "@/lib/db";
import MenuItem from "@/models/menuItem";
import SearchEvent from "@/models/SearchEvent";
import { NextResponse } from "next/server";

const MAX_RESULTS = 10;

// Escape all regex special characters so user input is treated as a
// literal string. Without this, characters like (, [, +, * crash the query.
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("q")?.trim() ?? "";

  if (raw.length < 1) {
    return NextResponse.json({ success: true, dishes: [] });
  }

  try {
    await connectToDB();

    const safeQuery = escapeRegex(raw);

    const dishes = await MenuItem.aggregate([
      // Safe, escaped regex — case-insensitive partial match on name
      { $match: { name: { $regex: safeQuery, $options: "i" } } },

      { $limit: MAX_RESULTS },

      // Join restaurant for name + slug
      {
        $lookup: {
          from:         "restaurants",
          localField:   "restaurantId",
          foreignField: "_id",
          as:           "restaurant",
        },
      },
      // Drop items whose restaurant wasn't found
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

    // Track search keyword (fire-and-forget, min 3 chars to avoid noise)
    if (raw.length >= 3) {
      SearchEvent.updateOne(
        { keyword: raw.toLowerCase() },
        { $inc: { count: 1 }, $set: { lastSearched: new Date() } },
        { upsert: true }
      ).catch(() => {});
    }

    return NextResponse.json({ success: true, dishes });

  } catch (err) {
    console.error("SEARCH DISHES ERROR:", err);
    // Always return a usable shape — never let the search bar break the page.
    return NextResponse.json({ success: true, dishes: [] });
  }
}
