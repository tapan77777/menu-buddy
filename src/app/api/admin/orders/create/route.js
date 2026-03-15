import { createOrder } from "@/lib/createOrder";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // ── Verify admin JWT ──────────────────────────────────────────────────
    const decoded = verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // restaurantId is the admin's own restaurant (from JWT)
    const restaurantId = decoded.id;

    const body = await req.json();
    const { tableId, items, specialRequests } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: "No items provided" });
    }

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.qty, 0);

    const result = await createOrder({
      restaurantId,
      tableId: tableId ? String(tableId) : undefined,
      items,
      totalAmount,
      deviceSessionId: `staff_${restaurantId}_${Date.now()}`,
      specialRequests,
      orderSource: "staff",
    });

    return NextResponse.json(result);

  } catch (err) {
    console.error("ADMIN CREATE ORDER ERROR:", err);
    return NextResponse.json({ success: false, error: "Server error" });
  }
}
