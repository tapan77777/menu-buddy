import { verifyToken } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import MenuItem from "@/models/menuItem";




export async function PUT(req, { params }) {
  try {
    const decoded = verifyToken(req);
    if (!decoded) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();
    const { id } = params;
    const body = await req.json();

    // Whitelist only the fields the client is allowed to change
    const { name, description, price, category, bestseller, imageUrl } = body;

    // Only allow update if item belongs to the same restaurant
    const item = await MenuItem.findOne({ _id: id, restaurantId: decoded.id });
    if (!item) {
      return Response.json({ error: "Item not found or unauthorized" }, { status: 404 });
    }

    if (name        !== undefined) item.name        = name;
    if (description !== undefined) item.description = description;
    if (price       !== undefined) item.price       = price;
    if (category    !== undefined) item.category    = category;
    if (bestseller  !== undefined) item.bestseller  = bestseller;
    if (imageUrl    !== undefined) item.imageUrl    = imageUrl;

    await item.save();

    return Response.json({ success: true, item });

  } catch (err) {
    console.error("Edit Error:", err);
    // Surface the real Mongoose / DB error message so the client can show it
    const message = err?.errors
      ? Object.values(err.errors).map((e) => e.message).join("; ")
      : err?.message || "Failed to update item";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const decoded = verifyToken(req);
    if (!decoded) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();
    const { id } = params;

    const item = await MenuItem.findOneAndDelete({ _id: id, restaurantId: decoded.id });

    if (!item) {
      return Response.json({ error: "Item not found or unauthorized" }, { status: 404 });
    }

    return Response.json({ success: true, message: "Item deleted" });

  } catch (err) {
    console.error("Delete Error:", err);
    return Response.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
