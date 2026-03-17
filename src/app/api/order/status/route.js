import { connectToDB } from "@/lib/db";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

const FIVE_HOURS = 5 * 60 * 60 * 1000;

export async function GET(req) {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false });
    }

    const obj = order.toObject();
    if (obj.status === "pending" && Date.now() - new Date(obj.createdAt).getTime() > FIVE_HOURS) {
      obj.status = "expired";
    }

    return NextResponse.json({ success: true, order: obj });
  } catch (err) {
    console.error("STATUS API ERROR:", err);
    return NextResponse.json({ success: false });
  }
}
