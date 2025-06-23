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
    const data = await req.json();

    // Only allow update if item belongs to the same restaurant
    const item = await MenuItem.findOne({ _id: id, restaurantId: decoded.id });
    if (!item) {
      return Response.json({ error: "Item not found or unauthorized" }, { status: 404 });
    }

    Object.assign(item, data);
    await item.save();

    return Response.json({ success: true, item });

  } catch (err) {
    console.error("Edit Error:", err);
    return Response.json({ error: "Failed to update item" }, { status: 500 });
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
