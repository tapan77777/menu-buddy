import { connectToDB } from "@/";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false });
    }

    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error("STATUS API ERROR:", err);
    return NextResponse.json({ success: false });
  }
}
