import { connectToDB } from "@/lib/db";
import Restaurant from "@/models/resturant";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectToDB();

    const { restaurantId, name, logoUrl, address, city } = await req.json();

    if (!restaurantId) {
      return NextResponse.json({ success: false, message: "restaurantId missing" }, { status: 400 });
    }

    // Use findById + save (not findByIdAndUpdate) so the pre-save hook fires.
    // This ensures automatic geocoding runs whenever address or name changes.
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return NextResponse.json({ success: false, message: "Restaurant not found" }, { status: 404 });
    }

    if (name    !== undefined) restaurant.name    = name;
    if (logoUrl !== undefined) restaurant.logoUrl = logoUrl;
    if (address !== undefined) restaurant.address = address;
    if (city    !== undefined) restaurant.city    = city;

    await restaurant.save(); // triggers pre-save hook → geocodes if address changed

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
