import { connectToDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { notifyAdmin } from "@/lib/orderEvents";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

/**
 * PUT /api/admin/orders/[orderId]
 *
 * Allows a restaurant admin to update an order's status.
 * Currently used for manual cancellation (pending → cancelled).
 * Auth: JWT token must match the order's restaurantId.
 *
 * Body: { action: "cancel" }
 */
export async function PUT(req, { params }) {
  try {
    const decoded = verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = params;
    if (!orderId) {
      return NextResponse.json({ success: false, error: "orderId required" }, { status: 400 });
    }

    await connectToDB();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Verify the order belongs to this admin's restaurant
    if (order.restaurantId.toString() !== decoded.id.toString()) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { action, note } = body;

    if (action === "cancel") {
      // Only allow cancelling orders that are still pending
      if (order.status !== "pending") {
        return NextResponse.json(
          { success: false, error: `Cannot cancel an order with status "${order.status}"` },
          { status: 409 }
        );
      }

      order.status = "cancelled";
      order.history.push({
        status: "cancelled",
        note: note || "Cancelled by admin",
        at: new Date(),
        by: "admin",
      });

      await order.save();

      // Notify connected clients via SSE
      try {
        notifyAdmin(order.restaurantId, { type: "order_update", order });
      } catch {
        // Non-fatal — SSE is best-effort
      }

      return NextResponse.json({ success: true, order });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("[admin/orders/[orderId]]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
