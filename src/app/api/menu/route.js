import { verifyToken } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import MenuItem from "@/models/menuItem";
import Restaurant from "@/models/resturant";

export async function POST(req) {
  try {
    const decoded = verifyToken(req);
    if (!decoded) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, price, category, imageUrl,bestseller } = await req.json();

    await connectToDB();

    const newItem = await MenuItem.create({
      restaurantId: decoded.id,
      name,
      description,
      price,
      category,
      bestseller,
      imageUrl
    });

    return Response.json({ success: true, item: newItem }, { status: 201 });

  } catch (err) {
    console.error("Menu Add Error:", err);
    return Response.json({ error: "Failed to add menu item" }, { status: 500 });
  }
}
//get menu owner
export async function GET(req) {
  try {
    const decoded = verifyToken(req);
    if (!decoded) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    // Fetch menu items
    const items = await MenuItem.find({ restaurantId: decoded.id });

    // Fetch restaurant details
    const restaurant = await Restaurant.findById(decoded.id).select(
      "_id name address logoUrl slug"
    );

    return Response.json({ success: true, items, restaurant });
  } catch (err) {
    console.error("Menu Fetch Error:", err);
    return Response.json({ error: "Failed to fetch menu" }, { status: 500 });
  }
}
