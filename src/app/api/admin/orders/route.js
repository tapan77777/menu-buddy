import { connectToDB } from "@/lib/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

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

    return NextResponse.json({ success: true, orders });
  } catch (err) {
    console.error("ADMIN ORDER FETCH ERROR:", err);
    return NextResponse.json({ success: false, error: "Server error" });
  }
}
