import { connectToDB } from "@/lib/db";
import Restaurant from "@/models/resturant";
import { NextResponse } from "next/server";

const RADIUS_METERS = 5000; // 5 km
const MAX_RESULTS   = 5;

const EMPTY_OK = NextResponse.json({ success: true, restaurants: [] });

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat"));
  const lng = parseFloat(searchParams.get("lng"));

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { success: false, error: "lat and lng query params are required" },
      { status: 400 }
    );
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json(
      { success: false, error: "Invalid coordinates" },
      { status: 400 }
    );
  }

  try {
    await connectToDB();

    // Ensure the 2dsphere index exists before querying.
    // createIndexes() is a no-op if the index already exists.
    try {
      await Restaurant.createIndexes();
    } catch {
      // Non-fatal — continue and let the query attempt proceed.
    }

    let restaurants = [];

    try {
      // $near requires a 2dsphere index. If no restaurant has coordinates yet
      // the index may be empty and MongoDB will throw
      // "unable to find index for $geoNear query". Catch it gracefully.
      restaurants = await Restaurant.find({
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [lng, lat] },
            $maxDistance: RADIUS_METERS,
          },
        },
      })
        .select("name slug address city logoUrl latitude longitude")
        .limit(MAX_RESULTS)
        .lean();
    } catch (geoErr) {
      // Expected when no 2dsphere index exists yet or no documents have
      // a location field — return empty list rather than 500.
      console.warn("NEARBY: geo query failed (index may not exist yet):", geoErr.message);
      return EMPTY_OK;
    }

    return NextResponse.json({ success: true, restaurants });

  } catch (err) {
    console.error("NEARBY RESTAURANTS ERROR:", err);
    return NextResponse.json({ success: true, restaurants: [] });
  }
}
