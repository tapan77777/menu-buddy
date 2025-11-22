import { connectToDB } from "@/lib/db";
import Restaurant from "@/models/resturant";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectToDB();

    const { restaurantId, name, logoUrl } = await req.json();

    if (!restaurantId) {
      return NextResponse.json({ success: false, message: "restaurantId missing" }, { status: 400 });
    }

    const update = {};

    if (name) update.name = name;
    if (logoUrl) update.logoUrl = logoUrl;

    await Restaurant.findByIdAndUpdate(restaurantId, update);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
