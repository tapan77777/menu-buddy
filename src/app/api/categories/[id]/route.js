import { verifyToken } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Restaurant from "@/models/resturant";

// PUT — rename / re-emoji a category
export async function PUT(req, { params }) {
  const decoded = verifyToken(req);
  if (!decoded) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const { name, emoji } = await req.json();
  if (!name?.trim()) return Response.json({ error: "Name is required" }, { status: 400 });

  await connectToDB();
  const restaurant = await Restaurant.findById(decoded.id).select("categories");
  if (!restaurant) return Response.json({ error: "Restaurant not found" }, { status: 404 });

  const cat = restaurant.categories.id(id);
  if (!cat) return Response.json({ error: "Category not found" }, { status: 404 });

  cat.name = name.trim();
  if (emoji) cat.emoji = emoji;
  await restaurant.save();

  return Response.json({ success: true, category: cat });
}

// DELETE — remove a category
export async function DELETE(req, { params }) {
  const decoded = verifyToken(req);
  if (!decoded) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;

  await connectToDB();
  const restaurant = await Restaurant.findById(decoded.id).select("categories");
  if (!restaurant) return Response.json({ error: "Restaurant not found" }, { status: 404 });

  const cat = restaurant.categories.id(id);
  if (!cat) return Response.json({ error: "Category not found" }, { status: 404 });

  cat.deleteOne();
  await restaurant.save();

  return Response.json({ success: true });
}
