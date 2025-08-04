import { connectToDB } from "@/lib/db";
import MenuItem from "@/models/menuItem";

export async function GET(req, context) {
  try {
    const { id } = context.params;
    await connectToDB();
    const items = await MenuItem.find({ restaurantId: id });
    return Response.json(items);
  } catch (err) {
    console.error("Fetch Error:", err);
    return Response.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}
