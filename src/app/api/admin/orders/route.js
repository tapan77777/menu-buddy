import { connectToDB } from "@/lib/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

const FIVE_HOURS = 5 * 60 * 60 * 1000;

function isOlderThan5Hours(date) {
  return Date.now() - new Date(date).getTime() > FIVE_HOURS;
}

function applyExpiry(order) {
  const obj = order.toObject ? order.toObject() : { ...order };
  if (obj.status === "pending" && isOlderThan5Hours(obj.createdAt)) {
    obj.status = "expired";
  }
  return obj;
}

export async function GET(req) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);

    const restaurantId = searchParams.get("restaurantId");
    if (!restaurantId) {
      return NextResponse.json({ success: false, error: "restaurantId required" });
    }

    const orders = await Order.find({ restaurantId })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ success: true, orders: orders.map(applyExpiry) });
  } catch (err) {
    console.error("ADMIN ORDER FETCH ERROR:", err);
    return NextResponse.json({ success: false, error: "Server error" });
  }
}
