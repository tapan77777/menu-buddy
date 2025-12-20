import { verifyToken } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Restaurant from "@/models/resturant";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectToDB();

    const decoded = verifyToken(req);  // reads JWT
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const admin = await Restaurant.findById(decoded.id).lean();

    if (!admin) {
      return NextResponse.json({ success: false, error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        slug: admin.slug,
        restaurantId: admin._id
      }
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
