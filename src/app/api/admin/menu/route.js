import { connectToDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import MenuItem from "@/models/menuItem";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // ── Verify admin JWT ──────────────────────────────────────────────────
    const decoded = verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const restaurantId = decoded.id;

    await connectToDB();

    const items = await MenuItem.find({ restaurantId })
      .select("name description price category bestseller imageUrl")
      .lean();

    // Group by category
    const grouped = {};
    for (const item of items) {
      const cat = item.category || "Uncategorized";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    }

    return NextResponse.json({ success: true, grouped });

  } catch (err) {
    console.error("ADMIN MENU ERROR:", err);
    return NextResponse.json({ success: false, error: "Server error" });
  }
}
