import { connectToDB } from "@/lib/db";
import { notifyAdmin } from "@/lib/orderEvents"; // ✅ CORRECT IMPORT
import Order from "@/models/Order";
import DailyAnalytics from "@/models/DailyAnalytics";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectToDB();

    const body = await req.json();
    const {
      restaurantId,
      tableId,
      items,
      totalAmount,
      deviceSessionId,
      idempotencyKey
    } = body;

    if (!restaurantId || !items || items.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Invalid order"
      });
    }

    const order = await Order.create({
      orderId: "O_" + Date.now(),
      restaurantId,
      tableId,
      items,
      totalAmount,
      deviceSessionId,
      idempotencyKey,
      status: "pending",
      history: [
        { status: "pending", at: new Date(), by: "customer" }
      ]
    });

    // 🔥 REAL-TIME ADMIN NOTIFICATION
    notifyAdmin(restaurantId, {
      type: "new_order",
      order
    });

    // Track order in daily analytics (fire-and-forget, non-blocking)
    const date = new Date().toISOString().split("T")[0];
    DailyAnalytics.updateOne(
      { restaurantId, date },
      { $inc: { orders: 1 } },
      { upsert: true }
    ).catch(() => {});

    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error("CREATE ORDER API ERROR:", err);
    return NextResponse.json({
      success: false,
      error: "Server error"
    });
  }
}
