import { verifyToken } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Restaurant from "@/models/resturant";

// PUT — reorder categories; body: { orderedIds: ["id1","id2",...] }
export async function PUT(req) {
  const decoded = verifyToken(req);
  if (!decoded) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { orderedIds } = await req.json();
  if (!Array.isArray(orderedIds)) return Response.json({ error: "orderedIds must be an array" }, { status: 400 });

  await connectToDB();
  const restaurant = await Restaurant.findById(decoded.id).select("categories");
  if (!restaurant) return Response.json({ error: "Restaurant not found" }, { status: 404 });

  orderedIds.forEach((id, index) => {
    const cat = restaurant.categories.id(id);
    if (cat) cat.order = index;
  });

  await restaurant.save();
  const sorted = [...restaurant.categories].sort((a, b) => a.order - b.order);
  return Response.json({ success: true, categories: sorted });
}
