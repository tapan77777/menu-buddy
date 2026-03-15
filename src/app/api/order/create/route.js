import { createOrder } from "@/lib/createOrder";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { restaurantId, tableId, items, totalAmount, deviceSessionId, idempotencyKey } = body;

    const result = await createOrder({
      restaurantId,
      tableId,
      items,
      totalAmount,
      deviceSessionId,
      idempotencyKey,
      orderSource: "customer",
    });

    return NextResponse.json(result);

  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    return NextResponse.json({ success: false, error: "Server error" });
  }
}
