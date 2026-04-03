import { connectToDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { autoCancelStaleOrders } from "@/lib/autoCancelOrders";
import { NextResponse } from "next/server";

/**
 * POST /api/admin/orders/auto-cancel
 *
 * Called on orders page load. Finds all pending orders for this restaurant
 * that are older than 2 hours and cancels them automatically.
 * Auth: requires valid JWT (same restaurant token used throughout admin).
 */
export async function POST(req) {
  try {
    const decoded = verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const cancelled = await autoCancelStaleOrders(decoded.id);

    return NextResponse.json({ success: true, cancelled });
  } catch (err) {
    console.error("[auto-cancel]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
