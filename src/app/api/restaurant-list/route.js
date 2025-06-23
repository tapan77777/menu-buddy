import { connectToDB } from "@/lib/db";
import Restaurant from "@/models/resturant";

export async function GET() {
  try {
    await connectToDB();

    const restaurants = await Restaurant.find({}, {
      name: 1,
      slug: 1,
      logoUrl: 1,
      address: 1,
      _id: 0
    });

    return Response.json({ success: true, restaurants });
  } catch (err) {
    console.error("Error fetching restaurants:", err);
    return Response.json({ success: false, error: "Failed to load restaurants" }, { status: 500 });
  }
}
