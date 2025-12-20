import { NextResponse } from "next/server";
import { connectToDB } from "../../../lib/db";
import { notifyAdmin, notifyCustomer } from "../../../lib/orderEvents";
import Order from "../../../models/Order";

export async function POST(req) {
  try {
    await connectToDB();
    const body = await req.json();
    const { orderId, status, note } = body;

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
      note: note || "",
      at: new Date(),
      by: "admin",
    });

    await order.save();

    // 🔥 REAL-TIME BROADCAST
    notifyCustomer(orderId, {
      type: "order_update",
      orderId: orderId,
      status,
    });

    notifyAdmin(order.restaurantId.toString(), {
      type: "order_update",
      orderId: orderId,
      status,
    });

    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error("ORDER UPDATE ERROR:", err);
    return NextResponse.json({ success: false, error: "Server error" });
  }
}
