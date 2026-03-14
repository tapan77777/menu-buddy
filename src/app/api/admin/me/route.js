import { verifyToken } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Restaurant from "@/models/resturant";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectToDB();

    const decoded = verifyToken(req);  // reads JWT
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const admin = await Restaurant.findById(decoded.id).lean();

    if (!admin) {
      return NextResponse.json({ success: false, error: "Admin not found" }, { status: 404 });
    }

    // Reset daily counters if it's a new day
    const today = new Date().toISOString().split("T")[0];
    if (admin.lastOrderReset !== today) {
      await Restaurant.updateOne(
        { _id: admin._id },
        { $set: { ordersToday: 0, missedOrdersToday: 0, lastOrderReset: today } }
      );
      admin.ordersToday = 0;
      admin.missedOrdersToday = 0;
    }

    const PLAN_LIMITS = { free: 30, basic: 200, pro: null };

    return NextResponse.json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        slug: admin.slug,
        restaurantId: admin._id,
        plan: admin.plan ?? "free",
        dailyOrderLimit: admin.dailyOrderLimit ?? 30,
        ordersToday: admin.ordersToday ?? 0,
        missedOrdersToday: admin.missedOrdersToday ?? 0,
        planLimit: PLAN_LIMITS[admin.plan ?? "free"],
      }
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
