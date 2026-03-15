import { connectToDB } from "@/lib/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

// Statuses the kitchen actively works on
const KITCHEN_STATUSES = ["pending", "accepted", "preparing", "ready"];

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json({ success: false, error: "restaurantId required" }, { status: 400 });
    }

    await connectToDB();

    const orders = await Order.find({
      restaurantId,
      status: { $in: KITCHEN_STATUSES },
    })
      .sort({ createdAt: 1 }) // oldest first — kitchen works FIFO
      .select("orderId tableId items totalAmount status specialRequests createdAt")
      .lean();

    return NextResponse.json({ success: true, orders });

  } catch (err) {
    console.error("KITCHEN ORDERS ERROR:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
