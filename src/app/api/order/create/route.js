import { connectToDB } from "@/lib/db";
import { notifyAdmin } from "@/lib/orderEvents";
import Order from "@/models/Order";
import Restaurant from "@/models/resturant";
import DailyAnalytics from "@/models/DailyAnalytics";
import { NextResponse } from "next/server";

// Daily order limits per plan
const PLAN_LIMITS = {
  free:  30,
  basic: 200,
  pro:   Infinity,
};

export async function POST(req) {
  try {
    await connectToDB();

    const body = await req.json();
    const { restaurantId, tableId, items, totalAmount, deviceSessionId, idempotencyKey } = body;

    if (!restaurantId || !items || items.length === 0) {
      return NextResponse.json({ success: false, error: "Invalid order" });
    }

    // ── Fetch restaurant plan & counters ──────────────────────────────────
    const restaurant = await Restaurant.findById(restaurantId)
      .select("plan dailyOrderLimit ordersToday missedOrdersToday lastOrderReset")
      .lean();

    if (!restaurant) {
      return NextResponse.json({ success: false, error: "Restaurant not found" });
    }

    const today = new Date().toISOString().split("T")[0];

    // ── Reset counters if it's a new day (atomic, runs at most once per day) ─
    let ordersToday = restaurant.ordersToday ?? 0;
    if (restaurant.lastOrderReset !== today) {
      await Restaurant.updateOne(
        { _id: restaurantId },
        { $set: { ordersToday: 0, missedOrdersToday: 0, lastOrderReset: today } }
      );
      ordersToday = 0;
    }

    // ── Check daily order limit ───────────────────────────────────────────
    const plan  = restaurant.plan ?? "free";
    const limit = restaurant.dailyOrderLimit ?? PLAN_LIMITS[plan];

    if (limit !== Infinity && ordersToday >= limit) {
      // Record missed order (fire-and-forget, non-blocking)
      Restaurant.updateOne(
        { _id: restaurantId },
        { $inc: { missedOrdersToday: 1 } }
      ).catch(() => {});

      DailyAnalytics.updateOne(
        { restaurantId, date: today },
        { $inc: { missedOrders: 1 } },
        { upsert: true }
      ).catch(() => {});

      return NextResponse.json({
        success: false,
        limitReached: true,
        error: "Online orders are unavailable at the moment. Please order at the counter.",
      });
    }

    // ── Increment today's accepted order count ────────────────────────────
    await Restaurant.updateOne(
      { _id: restaurantId },
      { $inc: { ordersToday: 1 } }
    );

    // ── Create the order ──────────────────────────────────────────────────
    const order = await Order.create({
      orderId: "O_" + Date.now(),
      restaurantId,
      tableId,
      items,
      totalAmount,
      deviceSessionId,
      idempotencyKey,
      status: "pending",
      history: [{ status: "pending", at: new Date(), by: "customer" }],
    });

    // ── Real-time notification to kitchen/admin ───────────────────────────
    notifyAdmin(restaurantId, { type: "new_order", order });

    // ── Analytics tracking (fire-and-forget) ─────────────────────────────
    DailyAnalytics.updateOne(
      { restaurantId, date: today },
      { $inc: { orders: 1 } },
      { upsert: true }
    ).catch(() => {});

    return NextResponse.json({ success: true, order });

  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    return NextResponse.json({ success: false, error: "Server error" });
  }
}
