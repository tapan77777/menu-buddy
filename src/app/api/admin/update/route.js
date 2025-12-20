import { connectToDB } from "@/lib/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectToDB();

    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ success: false, error: "Missing fields" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" });
    }

    order.status = status;
    order.history.push({
      status,
      at: new Date(),
      by: "admin",
    });

    await order.save();

    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error("ORDER UPDATE ERROR:", err);
    return NextResponse.json({ success: false, error: "Server error" });
  }
}
